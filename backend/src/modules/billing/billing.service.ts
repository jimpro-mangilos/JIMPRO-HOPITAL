import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FAC-${y}${m}-${seq}`;
}

export class BillingService {
  async createInvoice(data: {
    patientId: string;
    consultationId?: string;
    discount?: number;
    paymentMethod?: string;
    dueDate?: string;
    notes?: string;
  }) {
    return prisma.invoice.create({
      data: {
        ...data,
        invoiceNumber: generateInvoiceNumber(),
        discount: data.discount || 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paymentMethod: data.paymentMethod as any,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        lines: true,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          lines: true,
        },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.invoice.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        consultation: { include: { staff: { select: { firstName: true, lastName: true } } } },
        lines: true,
      },
    });
    if (!invoice) throw new AppError('Facture non trouvée.', 404);
    return invoice;
  }

  async update(id: string, data: any) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new AppError('Facture non trouvée.', 404);
    return prisma.invoice.update({ where: { id }, data, include: { lines: true } });
  }

  async addLine(invoiceId: string, line: { description: string; quantity?: number; unitPrice: number; category?: string }) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new AppError('Facture non trouvée.', 404);
    if (invoice.status !== 'BROUILLON') throw new AppError('Impossible d\'ajouter une ligne. Facture non modifiable.', 400);

    const qty = line.quantity || 1;
    const amount = qty * line.unitPrice;

    const newLine = await prisma.invoiceLine.create({
      data: {
        invoiceId,
        description: line.description,
        quantity: qty,
        unitPrice: line.unitPrice,
        amount,
        category: line.category,
      },
    });

    // Recalculate total
    const lines = await prisma.invoiceLine.findMany({ where: { invoiceId } });
    const total = lines.reduce((sum, l) => sum + l.amount, 0);

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { totalAmount: total },
    });

    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { lines: true, patient: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async removeLine(lineId: string) {
    const line = await prisma.invoiceLine.findUnique({ where: { id: lineId } });
    if (!line) throw new AppError('Ligne non trouvée.', 404);

    const invoice = await prisma.invoice.findUnique({ where: { id: line.invoiceId } });
    if (invoice && invoice.status !== 'BROUILLON') {
      throw new AppError('Impossible de supprimer une ligne. Facture non modifiable.', 400);
    }

    await prisma.invoiceLine.delete({ where: { id: lineId } });

    // Recalculate
    const lines = await prisma.invoiceLine.findMany({ where: { invoiceId: line.invoiceId } });
    const total = lines.reduce((sum, l) => sum + l.amount, 0);

    await prisma.invoice.update({
      where: { id: line.invoiceId },
      data: { totalAmount: total },
    });

    return prisma.invoice.findUnique({
      where: { id: line.invoiceId },
      include: { lines: true, patient: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async recordPayment(invoiceId: string, amount: number, paymentMethod: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new AppError('Facture non trouvée.', 404);
    if (invoice.status === 'PAYEE') throw new AppError('Facture déjà payée.', 400);
    if (invoice.status === 'ANNULEE') throw new AppError('Facture annulée.', 400);

    const newPaid = invoice.paidAmount + amount;
    const remaining = invoice.totalAmount - invoice.discount - newPaid;

    let status = invoice.status;
    if (remaining <= 0) {
      status = 'PAYEE' as any;
    } else if (newPaid > 0) {
      status = 'PARTIELLE';
    } else {
      status = 'EMISE';
    }

    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaid,
        status: status as any,
        paymentMethod: paymentMethod as any,
        paidAt: remaining <= 0 ? new Date() : undefined,
      },
      include: {
        lines: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getByPatient(patientId: string) {
    return prisma.invoice.findMany({
      where: { patientId },
      include: { lines: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getOutstanding() {
    return prisma.invoice.findMany({
      where: {
        status: { in: ['EMISE', 'PARTIELLE'] },
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { issuedAt: 'asc' },
    });
  }

  async getDailyRevenue(date?: string) {
    const target = date ? new Date(date) : new Date();
    target.setHours(0, 0, 0, 0);
    const next = new Date(target);
    next.setDate(next.getDate() + 1);

    const invoices = await prisma.invoice.findMany({
      where: {
        paidAt: { gte: target, lt: next },
      },
    });

    const total = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    return { date: target.toISOString().split('T')[0], total, count: invoices.length, invoices };
  }

  async getMonthlyReport(year?: number, month?: number) {
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const invoices = await prisma.invoice.findMany({
      where: {
        issuedAt: { gte: start, lt: end },
      },
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    });

    const totalIssued = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstanding = totalIssued - totalPaid;
    const paidCount = invoices.filter((i) => i.status === 'PAYEE').length;
    const outstandingCount = invoices.filter((i) => i.status === 'EMISE' || i.status === 'PARTIELLE').length;

    return {
      year: y,
      month: m,
      totalInvoices: invoices.length,
      totalIssued,
      totalPaid,
      totalOutstanding,
      paidCount,
      outstandingCount,
      invoices,
    };
  }
}

export const billingService = new BillingService();
