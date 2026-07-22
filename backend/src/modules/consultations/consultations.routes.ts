import { Router } from 'express';
import { consultationsController } from './consultations.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createConsultationSchema, updateConsultationSchema, startFromAppointmentSchema } from './consultations.schema';

const router = Router();

router.get('/', authMiddleware, consultationsController.findAll.bind(consultationsController));
router.get('/patient/:patientId', authMiddleware, consultationsController.getByPatient.bind(consultationsController));
router.get('/staff/:staffId', authMiddleware, consultationsController.getByStaff.bind(consultationsController));
router.get('/:id', authMiddleware, consultationsController.findById.bind(consultationsController));
router.post('/', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(createConsultationSchema), consultationsController.create.bind(consultationsController));
router.post('/start-from-appointment', authMiddleware, rbac('MEDECIN'), validate(startFromAppointmentSchema), consultationsController.startFromAppointment.bind(consultationsController));
router.put('/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(updateConsultationSchema), consultationsController.update.bind(consultationsController));

export default router;
