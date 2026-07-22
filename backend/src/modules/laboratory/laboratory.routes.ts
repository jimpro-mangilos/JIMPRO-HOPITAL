import { Router } from 'express';
import { laboratoryController } from './laboratory.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createLabRequestSchema, updateLabRequestSchema, createLabResultSchema } from './laboratory.schema';

const router = Router();

// Requests
router.get('/requests/pending', authMiddleware, laboratoryController.getPendingTests.bind(laboratoryController));
router.get('/requests/patient/:patientId', authMiddleware, laboratoryController.getByPatient.bind(laboratoryController));
router.get('/requests', authMiddleware, laboratoryController.findAllRequests.bind(laboratoryController));
router.get('/requests/:id', authMiddleware, laboratoryController.findRequestById.bind(laboratoryController));
router.post('/requests', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(createLabRequestSchema), laboratoryController.createRequest.bind(laboratoryController));
router.put('/requests/:id/status', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'LABORANTIN', 'MEDECIN'), validate(updateLabRequestSchema), laboratoryController.updateRequestStatus.bind(laboratoryController));

// Results
router.get('/results', authMiddleware, laboratoryController.findAllResults.bind(laboratoryController));
router.post('/results', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'LABORANTIN'), validate(createLabResultSchema), laboratoryController.createResult.bind(laboratoryController));

export default router;
