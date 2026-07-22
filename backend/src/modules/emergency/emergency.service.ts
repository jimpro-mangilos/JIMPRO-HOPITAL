import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class EmergencyService {
  async create(data: {
    patientId: string;
    triageLevel: string;
    chiefComplaint: string;
    vitals?: string;
    notes?: string;
  }) {
    return prisma.emergencyVisit.create({
      data: { ...data, triageLevel: data.triageLevel as any },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, bloodGroup: true } },
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.emergencyVisit.findMany({
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          assignedStaff: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emergencyVisit.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const visit = await prisma.emergencyVisit.findUnique({
      where: { id },
      include: {
        patient: true,
        assignedStaff: true,
      },
    });
    if (!visit) throw new AppError('Visite d\'urgence non trouvée.', 404);
    return visit;
  }

  async triage(id: string, triageLevel: string, notes?: string) {
    const visit = await prisma.emergencyVisit.findUnique({ where: { id } });
    if (!visit) throw new AppError('Visite d\'urgence non trouvée.', 404);

    return prisma.emergencyVisit.update({
      where: { id },
      data: {
        triageLevel: triageLevel as any,
        status: 'EN_TRIAGE',
        notes: notes || visit.notes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async assign(id: string, assignedTo: string) {
    const visit = await prisma.emergencyVisit.findUnique({ where: { id } });
    if (!visit) throw new AppError('Visite d\'urgence non trouvée.', 404);

    return prisma.emergencyVisit.update({
      where: { id },
      data: { assignedTo, status: 'EN_TRAITEMENT' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        assignedStaff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
      },
    });
  }

  async updateStatus(id: string, status: string, disposition?: string, notes?: string) {
    const visit = await prisma.emergencyVisit.findUnique({ where: { id } });
    if (!visit) throw new AppError('Visite d\'urgence non trouvée.', 404);

    const data: any = { status: status as any };
    if (disposition) data.disposition = disposition;
    if (notes) data.notes = notes;
    if (status === 'SORTI' || status === 'HOSPITALISE' || status === 'TRANSFERE' || status === 'DECEDE') {
      data.departureTime = new Date();
    }

    return prisma.emergencyVisit.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        assignedStaff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getActiveEmergencies() {
    return prisma.emergencyVisit.findMany({
      where: { status: { in: ['EN_ATTENTE', 'EN_TRIAGE', 'EN_TRAITEMENT', 'EN_OBSERVATION'] } },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, bloodGroup: true } },
        assignedStaff: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ triageLevel: 'asc' }, { arrivalTime: 'asc' }],
    });
  }

  async getByTriageLevel(level: string) {
    return prisma.emergencyVisit.findMany({
      where: { triageLevel: level as any, status: { notIn: ['SORTI', 'HOSPITALISE', 'DECEDE'] } },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        assignedStaff: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { arrivalTime: 'asc' },
    });
  }
}

export const emergencyService = new EmergencyService();
