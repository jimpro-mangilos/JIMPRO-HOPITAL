import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class ConsultationsService {
  async create(data: {
    patientId: string;
    staffId: string;
    appointmentId?: string;
    symptoms?: string;
    diagnosis?: string;
    diagnosisCode?: string;
    treatment?: string;
    notes?: string;
    followUpDate?: string;
    status?: string;
  }) {
    return prisma.consultation.create({
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
        status: (data.status as any) || 'EN_COURS',
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
        appointment: true,
      },
    });
  }

  async startFromAppointment(appointmentId: string, staffId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });
    if (!appointment) throw new AppError('Rendez-vous non trouvé.', 404);

    const consultation = await prisma.consultation.create({
      data: {
        patientId: appointment.patientId,
        staffId,
        appointmentId,
        status: 'EN_COURS',
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
      },
    });

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'EN_COURS' },
    });

    return consultation;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.consultation.findMany({
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
          _count: { select: { prescriptions: true, labRequests: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.consultation.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: true,
        staff: true,
        appointment: true,
        prescriptions: { include: { medication: true } },
        labRequests: { include: { results: true } },
        imagingRequests: true,
      },
    });
    if (!consultation) throw new AppError('Consultation non trouvée.', 404);
    return consultation;
  }

  async update(id: string, data: any) {
    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) throw new AppError('Consultation non trouvée.', 404);

    const updateData: any = { ...data };
    if (data.followUpDate) updateData.followUpDate = new Date(data.followUpDate);

    return prisma.consultation.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getByPatient(patientId: string) {
    return prisma.consultation.findMany({
      where: { patientId },
      include: {
        staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
        prescriptions: { include: { medication: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getByStaff(staffId: string) {
    return prisma.consultation.findMany({
      where: { staffId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { prescriptions: true } },
      },
      orderBy: { date: 'desc' },
    });
  }
}

export const consultationsService = new ConsultationsService();
