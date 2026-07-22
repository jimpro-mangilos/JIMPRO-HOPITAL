import { Router } from 'express';
import { pharmacyController } from './pharmacy.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import {
  createMedicationSchema, updateMedicationSchema,
  createStockSchema, addRemoveStockSchema,
  createSupplierSchema,
} from './pharmacy.schema';

const router = Router();

// Medications
router.get('/medications/search', authMiddleware, pharmacyController.searchMedications.bind(pharmacyController));
router.get('/medications', authMiddleware, pharmacyController.findAllMedications.bind(pharmacyController));
router.get('/medications/:id', authMiddleware, pharmacyController.findMedicationById.bind(pharmacyController));
router.post('/medications', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'), validate(createMedicationSchema), pharmacyController.createMedication.bind(pharmacyController));
router.put('/medications/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'), validate(updateMedicationSchema), pharmacyController.updateMedication.bind(pharmacyController));

// Stock
router.get('/stock/low', authMiddleware, pharmacyController.getLowStock.bind(pharmacyController));
router.get('/stock/expiring', authMiddleware, pharmacyController.getExpiringSoon.bind(pharmacyController));
router.get('/stock', authMiddleware, pharmacyController.findAllStock.bind(pharmacyController));
router.post('/stock', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'), validate(createStockSchema), pharmacyController.createStock.bind(pharmacyController));
router.put('/stock/:id/add', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'), validate(addRemoveStockSchema), pharmacyController.addStock.bind(pharmacyController));
router.put('/stock/:id/remove', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'), validate(addRemoveStockSchema), pharmacyController.removeStock.bind(pharmacyController));

// Suppliers
router.get('/suppliers', authMiddleware, pharmacyController.findAllSuppliers.bind(pharmacyController));
router.get('/suppliers/:id', authMiddleware, pharmacyController.findSupplierById.bind(pharmacyController));
router.post('/suppliers', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'), validate(createSupplierSchema), pharmacyController.createSupplier.bind(pharmacyController));
router.put('/suppliers/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'PHARMACIEN'), pharmacyController.updateSupplier.bind(pharmacyController));

export default router;
