import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class PharmacyService {
  // --- Medications ---
  async createMedication(data: any) {
    return prisma.medication.create({ data });
  }

  async findAllMedications(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.medication.findMany({
        skip,
        take: limit,
        include: { _count: { select: { pharmacyStocks: true, prescriptions: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.medication.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findMedicationById(id: string) {
    const medication = await prisma.medication.findUnique({
      where: { id },
      include: { pharmacyStocks: { include: { supplier: true }, orderBy: { expiryDate: 'asc' } } },
    });
    if (!medication) throw new AppError('Médicament non trouvé.', 404);
    return medication;
  }

  async updateMedication(id: string, data: any) {
    const med = await prisma.medication.findUnique({ where: { id } });
    if (!med) throw new AppError('Médicament non trouvé.', 404);
    return prisma.medication.update({ where: { id }, data });
  }

  async searchMedications(query: string) {
    return prisma.medication.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { genericName: { contains: query } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  // --- Stock ---
  async findAllStock(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.pharmacyStock.findMany({
        skip,
        take: limit,
        include: { medication: true, supplier: true },
        orderBy: { expiryDate: 'asc' },
      }),
      prisma.pharmacyStock.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createStock(data: any) {
    return prisma.pharmacyStock.create({
      data: { ...data, expiryDate: new Date(data.expiryDate) },
      include: { medication: true, supplier: true },
    });
  }

  async addStock(id: string, quantity: number) {
    const stock = await prisma.pharmacyStock.findUnique({ where: { id } });
    if (!stock) throw new AppError('Stock non trouvé.', 404);
    return prisma.pharmacyStock.update({
      where: { id },
      data: { quantity: stock.quantity + quantity },
      include: { medication: true },
    });
  }

  async removeStock(id: string, quantity: number) {
    const stock = await prisma.pharmacyStock.findUnique({ where: { id } });
    if (!stock) throw new AppError('Stock non trouvé.', 404);
    if (stock.quantity < quantity) throw new AppError('Quantité insuffisante en stock.', 400);
    return prisma.pharmacyStock.update({
      where: { id },
      data: { quantity: stock.quantity - quantity },
      include: { medication: true },
    });
  }

  async getLowStock() {
    const all = await prisma.pharmacyStock.findMany({
      include: { medication: true },
      orderBy: { quantity: 'asc' },
    });
    return all.filter((s) => s.quantity <= s.reorderLevel);
  }

  async getExpiringSoon(daysThreshold = 90) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    return prisma.pharmacyStock.findMany({
      where: {
        expiryDate: { lte: threshold },
        quantity: { gt: 0 },
      },
      include: { medication: true },
      orderBy: { expiryDate: 'asc' },
    });
  }

  // --- Suppliers ---
  async findAllSuppliers() {
    return prisma.supplier.findMany({
      include: { _count: { select: { pharmacyStocks: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createSupplier(data: any) {
    return prisma.supplier.create({ data: { ...data, email: data.email || null } });
  }

  async findSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { pharmacyStocks: { include: { medication: true } } },
    });
    if (!supplier) throw new AppError('Fournisseur non trouvé.', 404);
    return supplier;
  }

  async updateSupplier(id: string, data: any) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new AppError('Fournisseur non trouvé.', 404);
    return prisma.supplier.update({ where: { id }, data });
  }
}

export const pharmacyService = new PharmacyService();
