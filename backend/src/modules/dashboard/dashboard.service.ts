import { prisma } from '../../lib/prisma';

export class DashboardService {
  async getKPIs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatientsToday,
      appointmentsToday,
      admissionsToday,
      pendingLabTests,
      emergencyWaiting,
      revenueTodayResult,
      pharmacyLowStockResult,
    ] = await Promise.all([
      prisma.patient.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.hospitalization.count({ where: { admissionDate: { gte: today, lt: tomorrow } } }),
      prisma.labRequest.count({ where: { status: { in: ['EN_ATTENTE', 'PRELEVE', 'EN_COURS'] } } }),
      prisma.emergencyVisit.count({ where: { status: { in: ['EN_ATTENTE', 'EN_TRIAGE', 'EN_TRAITEMENT', 'EN_OBSERVATION'] } } }),
      prisma.invoice.aggregate({
        where: { paidAt: { gte: today, lt: tomorrow } },
        _sum: { paidAmount: true },
      }),
      prisma.pharmacyStock.findMany({ include: { medication: true } }),
    ]);

    const lowStockCount = pharmacyLowStockResult.filter((s) => s.quantity <= s.reorderLevel).length;

    return {
      totalPatientsToday,
      appointmentsToday,
      admissionsToday,
      revenueToday: revenueTodayResult._sum.paidAmount || 0,
      pendingLabTests,
      pharmacyLowStock: lowStockCount,
      emergencyWaiting,
    };
  }

  async getAppointmentsChart(days = 7) {
    const result: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const count = await prisma.appointment.count({
        where: { date: { gte: d, lt: next } },
      });

      result.push({
        date: d.toISOString().split('T')[0],
        count,
      });
    }

    return result;
  }

  async getRevenueChart(days = 30) {
    const result: { date: string; amount: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const agg = await prisma.invoice.aggregate({
        where: { paidAt: { gte: d, lt: next } },
        _sum: { paidAmount: true },
      });

      result.push({
        date: d.toISOString().split('T')[0],
        amount: agg._sum.paidAmount || 0,
      });
    }

    return result;
  }

  async getDepartmentStats() {
    const staffByDept = await prisma.staff.groupBy({
      by: ['department'],
      _count: true,
      orderBy: { _count: { department: 'desc' } },
    });

    const appointmentsByType = await prisma.appointment.groupBy({
      by: ['type'],
      _count: true,
    });

    const patientsByGender = await prisma.patient.groupBy({
      by: ['gender'],
      _count: true,
    });

    return {
      staffByDepartment: staffByDept.filter((s) => s.department),
      appointmentsByType,
      patientsByGender,
    };
  }
}

export const dashboardService = new DashboardService();
