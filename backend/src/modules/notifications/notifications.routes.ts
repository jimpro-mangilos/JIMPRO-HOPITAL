import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createNotificationSchema } from './notifications.schema';

const router = Router();

router.get('/unread-count', authMiddleware, notificationsController.getUnreadCount.bind(notificationsController));
router.get('/', authMiddleware, notificationsController.getUserNotifications.bind(notificationsController));
router.post('/', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), validate(createNotificationSchema), notificationsController.create.bind(notificationsController));
router.put('/:id/read', authMiddleware, notificationsController.markAsRead.bind(notificationsController));
router.put('/read-all', authMiddleware, notificationsController.markAllAsRead.bind(notificationsController));

export default router;
