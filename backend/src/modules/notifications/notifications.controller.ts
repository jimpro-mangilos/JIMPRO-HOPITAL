import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';

export class NotificationsController {
  async create(req: Request, res: Response) {
    try { res.status(201).json(await notificationsService.create(req.body)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  async getUserNotifications(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      res.json(await notificationsService.getUserNotifications(req.user!.userId, page, limit));
    } catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  async markAsRead(req: Request, res: Response) {
    try { res.json(await notificationsService.markAsRead(req.params.id, req.user!.userId)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  async markAllAsRead(req: Request, res: Response) {
    try { res.json(await notificationsService.markAllAsRead(req.user!.userId)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }

  async getUnreadCount(req: Request, res: Response) {
    try { res.json(await notificationsService.getUnreadCount(req.user!.userId)); }
    catch (e: any) { res.status(e.statusCode || 500).json({ message: e.message }); }
  }
}

export const notificationsController = new NotificationsController();
