import { Router } from 'express';
import { imagingController } from './imaging.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createImagingRequestSchema, updateImagingRequestSchema, createImagingResultSchema } from './imaging.schema';

const router = Router();

router.get('/requests/patient/:patientId', authMiddleware, imagingController.getByPatient.bind(imagingController));
router.get('/requests', authMiddleware, imagingController.findAllRequests.bind(imagingController));
router.get('/requests/:id', authMiddleware, imagingController.findRequestById.bind(imagingController));
router.post('/requests', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(createImagingRequestSchema), imagingController.createRequest.bind(imagingController));
router.put('/requests/:id/status', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'RADIOLOGUE', 'MEDECIN'), validate(updateImagingRequestSchema), imagingController.updateRequestStatus.bind(imagingController));

router.get('/results', authMiddleware, imagingController.findAllResults.bind(imagingController));
router.post('/results', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'RADIOLOGUE'), validate(createImagingResultSchema), imagingController.createResult.bind(imagingController));

export default router;
