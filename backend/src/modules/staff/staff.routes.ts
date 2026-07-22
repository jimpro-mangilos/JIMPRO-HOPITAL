import { Router } from 'express';
import { staffController } from './staff.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { updateStaffSchema } from './staff.schema';

const router = Router();

router.get('/', authMiddleware, staffController.findAll.bind(staffController));
router.get('/doctors', authMiddleware, staffController.getDoctors.bind(staffController));
router.get('/:id', authMiddleware, staffController.findById.bind(staffController));
router.put('/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), validate(updateStaffSchema), staffController.update.bind(staffController));
router.get('/:id/schedule', authMiddleware, staffController.getSchedule.bind(staffController));

export default router;
