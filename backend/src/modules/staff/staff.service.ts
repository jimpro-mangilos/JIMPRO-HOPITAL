import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class StaffService {
  async findAll(page = 1, limit = 20, department?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (department) where.department = department;

    const [data, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
        orderBy: { lastName: 'asc' },
      }),
      prisma.staff.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true, lastLoginAt: true } },
        _count: { select: { appointments: true, consultations: true } },
      },
    });
    if (!staff) throw new AppError('Personnel non trouvé.', 404);
    return staff;
  }

  async update(id: string, data: any) {
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new AppError('Personnel non trouvé.', 404);
    return prisma.staff.update({ where: { id }, data });
  }

  async getStaffSchedule(staffId: string, startDate: Date, endDate: Date) {
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) throw new AppError('Personnel non trouvé.', 404);

    const appointments = await prisma.appointment.findMany({
      where: {
        staffId,
        date: { gte: startDate, lte: endDate },
        status: { notIn: ['ANNULE'] },
      },
      include: { patient: { select: { id: true, firstName: true, lastName: true, phone: true } } },
      orderBy: { date: 'asc' },
    });

    return appointments;
  }

  async getDoctors() {
    return prisma.staff.findMany({
      where: { user: { role: 'MEDECIN' } },
      include: { user: { select: { id: true, email: true, isActive: true } } },
      orderBy: { lastName: 'asc' },
    });
  }
}

export const staffService = new StaffService();
