import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class PrescriptionsService {
  async create(data: {
    consultationId: string;
    medicationId: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }) {
    return prisma.prescription.create({
      data,
      include: {
        medication: true,
        consultation: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
            staff: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.prescription.findMany({
        skip,
        take: limit,
        include: {
          medication: true,
          consultation: {
            select: {
              patient: { select: { id: true, firstName: true, lastName: true } },
              staff: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.prescription.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        medication: true,
        consultation: {
          include: {
            patient: true,
            staff: true,
          },
        },
      },
    });
    if (!prescription) throw new AppError('Prescription non trouvée.', 404);
    return prescription;
  }

  async update(id: string, data: any) {
    const prescription = await prisma.prescription.findUnique({ where: { id } });
    if (!prescription) throw new AppError('Prescription non trouvée.', 404);
    return prisma.prescription.update({
      where: { id },
      data,
      include: {
        medication: true,
        consultation: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async dispense(id: string, dispensedBy: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { medication: true },
    });
    if (!prescription) throw new AppError('Prescription non trouvée.', 404);
    if (prescription.isDispensed) throw new AppError('Prescription déjà délivrée.', 400);

    // Decrease pharmacy stock
    const stock = await prisma.pharmacyStock.findFirst({
      where: { medicationId: prescription.medicationId, quantity: { gt: 0 } },
      orderBy: { expiryDate: 'asc' },
    });

    if (!stock) {
      throw new AppError('Stock insuffisant pour ce médicament.', 400);
    }

    await prisma.pharmacyStock.update({
      where: { id: stock.id },
      data: { quantity: stock.quantity - 1 },
    });

    return prisma.prescription.update({
      where: { id },
      data: {
        isDispensed: true,
        dispensedAt: new Date(),
        dispensedBy,
      },
      include: {
        medication: true,
        consultation: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async getByConsultation(consultationId: string) {
    return prisma.prescription.findMany({
      where: { consultationId },
      include: { medication: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const prescriptionsService = new PrescriptionsService();
