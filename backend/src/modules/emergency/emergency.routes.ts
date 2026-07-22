import { Router } from 'express';
import { emergencyController } from './emergency.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createEmergencySchema, triageSchema, assignSchema, updateEmergencySchema } from './emergency.schema';

const router = Router();

router.get('/active', authMiddleware, emergencyController.getActiveEmergencies.bind(emergencyController));
router.get('/triage/:level', authMiddleware, emergencyController.getByTriageLevel.bind(emergencyController));
router.get('/', authMiddleware, emergencyController.findAll.bind(emergencyController));
router.get('/:id', authMiddleware, emergencyController.findById.bind(emergencyController));
router.post('/', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'INFIRMIER', 'ACCUEIL'), validate(createEmergencySchema), emergencyController.create.bind(emergencyController));
router.put('/:id/triage', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'INFIRMIER'), validate(triageSchema), emergencyController.triage.bind(emergencyController));
router.put('/:id/assign', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(assignSchema), emergencyController.assign.bind(emergencyController));
router.put('/:id/status', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'INFIRMIER'), validate(updateEmergencySchema), emergencyController.updateStatus.bind(emergencyController));

export default router;
