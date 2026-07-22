import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class LaboratoryService {
  // --- Lab Requests ---
  async createRequest(data: {
    patientId: string;
    staffId: string;
    consultationId?: string;
    testType: string;
    priority?: string;
    notes?: string;
  }) {
    return prisma.labRequest.create({
      data: {
        ...data,
        priority: (data.priority as any) || 'NORMAL',
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAllRequests(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.labRequest.findMany({
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          staff: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { results: true } },
        },
        orderBy: { requestedAt: 'desc' },
      }),
      prisma.labRequest.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findRequestById(id: string) {
    const request = await prisma.labRequest.findUnique({
      where: { id },
      include: {
        patient: true,
        staff: true,
        consultation: true,
        results: { orderBy: { resultDate: 'asc' } },
      },
    });
    if (!request) throw new AppError('Demande de laboratoire non trouvée.', 404);
    return request;
  }

  async updateRequestStatus(id: string, status: string, notes?: string) {
    const request = await prisma.labRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Demande de laboratoire non trouvée.', 404);

    const data: any = { status: status as any };
    if (notes) data.notes = notes;
    if (status === 'TERMINE' || status === 'VALIDE') data.completedAt = new Date();

    return prisma.labRequest.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        results: true,
      },
    });
  }

  async getByPatient(patientId: string) {
    return prisma.labRequest.findMany({
      where: { patientId },
      include: {
        staff: { select: { id: true, firstName: true, lastName: true } },
        results: true,
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async getPendingTests() {
    return prisma.labRequest.findMany({
      where: { status: { in: ['EN_ATTENTE', 'PRELEVE', 'EN_COURS'] } },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ priority: 'asc' }, { requestedAt: 'asc' }],
    });
  }

  // --- Lab Results ---
  async createResult(data: {
    labRequestId: string;
    parameter: string;
    value: number;
    unit: string;
    normalMin?: number;
    normalMax?: number;
    isAbnormal?: boolean;
    notes?: string;
    validatedBy?: string;
  }) {
    const request = await prisma.labRequest.findUnique({ where: { id: data.labRequestId } });
    if (!request) throw new AppError('Demande de laboratoire non trouvée.', 404);

    // Auto-determine if abnormal
    let isAbnormal = data.isAbnormal ?? false;
    if (data.normalMin !== undefined && data.normalMax !== undefined) {
      isAbnormal = data.value < data.normalMin || data.value > data.normalMax;
    }

    const result = await prisma.labResult.create({
      data: { ...data, isAbnormal },
      include: {
        labRequest: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    // Update request status to EN_COURS if it was EN_ATTENTE
    if (request.status === 'EN_ATTENTE') {
      await prisma.labRequest.update({
        where: { id: data.labRequestId },
        data: { status: 'EN_COURS' },
      });
    }

    return result;
  }

  async findAllResults(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.labResult.findMany({
        skip,
        take: limit,
        include: {
          labRequest: {
            include: {
              patient: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { resultDate: 'desc' },
      }),
      prisma.labResult.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const laboratoryService = new LaboratoryService();
