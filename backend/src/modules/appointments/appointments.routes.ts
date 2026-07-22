import { Router } from 'express';
import { appointmentsController } from './appointments.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createAppointmentSchema, updateAppointmentSchema } from './appointments.schema';

const router = Router();

router.get('/today', authMiddleware, appointmentsController.getTodayAppointments.bind(appointmentsController));
router.get('/range', authMiddleware, appointmentsController.getByDateRange.bind(appointmentsController));
router.get('/', authMiddleware, appointmentsController.findAll.bind(appointmentsController));
router.get('/:id', authMiddleware, appointmentsController.findById.bind(appointmentsController));
router.post('/', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'ACCUEIL'), validate(createAppointmentSchema), appointmentsController.create.bind(appointmentsController));
router.put('/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'ACCUEIL'), validate(updateAppointmentSchema), appointmentsController.update.bind(appointmentsController));
router.put('/:id/status', authMiddleware, appointmentsController.updateStatus.bind(appointmentsController));

export default router;
