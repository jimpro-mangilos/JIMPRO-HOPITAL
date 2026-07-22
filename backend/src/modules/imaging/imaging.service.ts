import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class ImagingService {
  // --- Imaging Requests ---
  async createRequest(data: {
    patientId: string;
    staffId: string;
    consultationId?: string;
    imagingType: string;
    bodyPart?: string;
    priority?: string;
    clinicalInfo?: string;
  }) {
    return prisma.imagingRequest.create({
      data: { ...data, priority: (data.priority as any) || 'NORMAL' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAllRequests(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.imagingRequest.findMany({
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          staff: { select: { id: true, firstName: true, lastName: true } },
          result: true,
        },
        orderBy: { requestedAt: 'desc' },
      }),
      prisma.imagingRequest.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findRequestById(id: string) {
    const request = await prisma.imagingRequest.findUnique({
      where: { id },
      include: {
        patient: true,
        staff: true,
        consultation: true,
        result: { include: { radiologist: true } },
      },
    });
    if (!request) throw new AppError('Demande d\'imagerie non trouvée.', 404);
    return request;
  }

  async updateRequestStatus(id: string, status: string, clinicalInfo?: string) {
    const request = await prisma.imagingRequest.findUnique({ where: { id } });
    if (!request) throw new AppError('Demande d\'imagerie non trouvée.', 404);

    const data: any = { status: status as any };
    if (clinicalInfo) data.clinicalInfo = clinicalInfo;
    if (status === 'VALIDE') data.completedAt = new Date();

    return prisma.imagingRequest.update({ where: { id }, data });
  }

  async getByPatient(patientId: string) {
    return prisma.imagingRequest.findMany({
      where: { patientId },
      include: {
        staff: { select: { id: true, firstName: true, lastName: true } },
        result: true,
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  // --- Imaging Results ---
  async createResult(data: {
    imagingRequestId: string;
    findings?: string;
    impression?: string;
    reportUrl?: string;
    imagesUrls?: string;
    radiologistId?: string;
  }) {
    const request = await prisma.imagingRequest.findUnique({ where: { id: data.imagingRequestId } });
    if (!request) throw new AppError('Demande d\'imagerie non trouvée.', 404);

    // Check if result already exists
    const existing = await prisma.imagingResult.findUnique({ where: { imagingRequestId: data.imagingRequestId } });
    if (existing) throw new AppError('Un résultat existe déjà pour cette demande.', 409);

    const result = await prisma.imagingResult.create({ data });

    // Update request status
    await prisma.imagingRequest.update({
      where: { id: data.imagingRequestId },
      data: { status: 'INTERPRETE' },
    });

    return prisma.imagingResult.findUnique({
      where: { id: result.id },
      include: {
        imagingRequest: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        radiologist: true,
      },
    });
  }

  async findAllResults(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.imagingResult.findMany({
        skip,
        take: limit,
        include: {
          imagingRequest: {
            include: {
              patient: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          radiologist: true,
        },
        orderBy: { resultDate: 'desc' },
      }),
      prisma.imagingResult.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const imagingService = new ImagingService();
