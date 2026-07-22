import { Router } from 'express';
import { billingController } from './billing.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createInvoiceSchema, addLineSchema, recordPaymentSchema } from './billing.schema';

const router = Router();

router.get('/outstanding', authMiddleware, billingController.getOutstanding.bind(billingController));
router.get('/revenue/daily', authMiddleware, billingController.getDailyRevenue.bind(billingController));
router.get('/revenue/monthly', authMiddleware, billingController.getMonthlyReport.bind(billingController));
router.get('/patient/:patientId', authMiddleware, billingController.getByPatient.bind(billingController));
router.get('/', authMiddleware, billingController.findAll.bind(billingController));
router.get('/:id', authMiddleware, billingController.findById.bind(billingController));
router.post('/', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'COMPTABLE', 'ACCUEIL'), validate(createInvoiceSchema), billingController.createInvoice.bind(billingController));
router.put('/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'COMPTABLE'), billingController.update.bind(billingController));
router.post('/:id/lines', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'COMPTABLE'), validate(addLineSchema), billingController.addLine.bind(billingController));
router.delete('/lines/:lineId', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'COMPTABLE'), billingController.removeLine.bind(billingController));
router.post('/:id/payment', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'COMPTABLE'), validate(recordPaymentSchema), billingController.recordPayment.bind(billingController));

export default router;
