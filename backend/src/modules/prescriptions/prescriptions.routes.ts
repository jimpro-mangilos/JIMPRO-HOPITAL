import { Router } from 'express';
import { prescriptionsController } from './prescriptions.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createPrescriptionSchema, updatePrescriptionSchema } from './prescriptions.schema';

const router = Router();

router.get('/consultation/:consultationId', authMiddleware, prescriptionsController.getByConsultation.bind(prescriptionsController));
router.get('/', authMiddleware, prescriptionsController.findAll.bind(prescriptionsController));
router.get('/:id', authMiddleware, prescriptionsController.findById.bind(prescriptionsController));
router.post('/', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(createPrescriptionSchema), prescriptionsController.create.bind(prescriptionsController));
router.put('/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(updatePrescriptionSchema), prescriptionsController.update.bind(prescriptionsController));
router.put('/:id/dispense', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'), prescriptionsController.dispense.bind(prescriptionsController));

export default router;
