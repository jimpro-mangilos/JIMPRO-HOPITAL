import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class PatientsService {
  async create(data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    bloodGroup?: string;
    allergies?: string;
    chronicConditions?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    medicalNotes?: string;
  }) {
    return prisma.patient.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender as any,
        bloodGroup: data.bloodGroup as any,
        email: data.email || null,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { appointments: true, consultations: true } } },
      }),
      prisma.patient.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: { include: { staff: true }, orderBy: { date: 'desc' }, take: 10 },
        consultations: { include: { staff: true }, orderBy: { date: 'desc' }, take: 10 },
        _count: { select: { appointments: true, consultations: true, invoices: true } },
      },
    });
    if (!patient) throw new AppError('Patient non trouvé.', 404);
    return patient;
  }

  async update(id: string, data: any) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new AppError('Patient non trouvé.', 404);

    const updateData: any = { ...data };
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.gender) updateData.gender = data.gender as any;
    if (data.bloodGroup) updateData.bloodGroup = data.bloodGroup as any;
    if (data.email === '') updateData.email = null;

    return prisma.patient.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new AppError('Patient non trouvé.', 404);
    return prisma.patient.update({ where: { id }, data: { isActive: false } });
  }

  async search(query: { q?: string; phone?: string; email?: string }) {
    const where: Prisma.PatientWhereInput = { isActive: true };

    if (query.phone) {
      where.phone = { contains: query.phone };
    }
    if (query.email) {
      where.email = { contains: query.email };
    }
    if (query.q) {
      where.OR = [
        { firstName: { contains: query.q } },
        { lastName: { contains: query.q } },
        { phone: { contains: query.q } },
      ];
    }

    return prisma.patient.findMany({
      where,
      take: 20,
      orderBy: { lastName: 'asc' },
    });
  }

  async getPatientHistory(id: string) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new AppError('Patient non trouvé.', 404);

    const [appointments, consultations, prescriptions, labRequests, invoices] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId: id },
        include: { staff: true },
        orderBy: { date: 'desc' },
      }),
      prisma.consultation.findMany({
        where: { patientId: id },
        include: {
          staff: true,
          prescriptions: { include: { medication: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.prescription.findMany({
        where: { consultation: { patientId: id } },
        include: { medication: true, consultation: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.labRequest.findMany({
        where: { patientId: id },
        include: { results: true, staff: true },
        orderBy: { requestedAt: 'desc' },
      }),
      prisma.invoice.findMany({
        where: { patientId: id },
        include: { lines: true },
        orderBy: { issuedAt: 'desc' },
      }),
    ]);

    return { appointments, consultations, prescriptions, labRequests, invoices };
  }
}

export const patientsService = new PatientsService();
