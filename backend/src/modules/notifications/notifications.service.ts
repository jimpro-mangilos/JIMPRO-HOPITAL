import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export class NotificationsService {
  async create(data: {
    userId: string;
    type?: string;
    title: string;
    message: string;
    link?: string;
  }) {
    return prisma.notification.create({
      data: { ...data, type: data.type || 'INFO' },
    });
  }

  async getUserNotifications(userId: string, page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(id: string, userId: string) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) {
      throw new AppError('Notification non trouvée.', 404);
    }
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'Toutes les notifications marquées comme lues.' };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }
}

export const notificationsService = new NotificationsService();
