import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class AppointmentsService {
  async create(data: {
    patientId: string;
    staffId: string;
    date: string;
    startTime: string;
    endTime: string;
    type?: string;
    reason?: string;
    notes?: string;
  }) {
    // Check for conflicts
    await this.checkConflicts(data.staffId, data.date, data.startTime, data.endTime);

    return prisma.appointment.create({
      data: {
        ...data,
        date: new Date(data.date),
        type: (data.type as any) || 'CONSULTATION',
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
      },
    });
  }

  async checkConflicts(staffId: string, date: string, startTime: string, endTime: string, excludeId?: string) {
    const where: any = {
      staffId,
      date: new Date(date),
      status: { notIn: ['ANNULE', 'TERMINE'] },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    };
    if (excludeId) where.id = { not: excludeId };

    const conflict = await prisma.appointment.findFirst({ where });
    if (conflict) {
      throw new AppError('Conflit d\'horaire. Ce créneau est déjà réservé.', 409);
    }
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
          staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.appointment.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        staff: true,
        consultation: true,
      },
    });
    if (!appointment) throw new AppError('Rendez-vous non trouvé.', 404);
    return appointment;
  }

  async update(id: string, data: any) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new AppError('Rendez-vous non trouvé.', 404);

    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    // Check conflicts if time-related fields change
    if (data.date || data.startTime || data.endTime) {
      await this.checkConflicts(
        data.staffId || appointment.staffId,
        (data.date || appointment.date.toISOString().split('T')[0]),
        data.startTime || appointment.startTime,
        data.endTime || appointment.endTime,
        id
      );
    }

    return prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new AppError('Rendez-vous non trouvé.', 404);
    return prisma.appointment.update({
      where: { id },
      data: { status: status as any },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getByDateRange(startDate: Date, endDate: Date) {
    return prisma.appointment.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getTodayAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.appointment.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        staff: { select: { id: true, firstName: true, lastName: true, speciality: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }
}

export const appointmentsService = new AppointmentsService();
