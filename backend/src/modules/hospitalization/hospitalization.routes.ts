import { Router } from 'express';
import { hospitalizationController } from './hospitalization.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createWardSchema, createRoomSchema, createBedSchema, createHospitalizationSchema, transferSchema } from './hospitalization.schema';

const router = Router();

// Wards
router.get('/wards', authMiddleware, hospitalizationController.findAllWards.bind(hospitalizationController));
router.get('/wards/:id', authMiddleware, hospitalizationController.findWardById.bind(hospitalizationController));
router.post('/wards', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), validate(createWardSchema), hospitalizationController.createWard.bind(hospitalizationController));
router.put('/wards/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), hospitalizationController.updateWard.bind(hospitalizationController));

// Rooms
router.get('/rooms', authMiddleware, hospitalizationController.findAllRooms.bind(hospitalizationController));
router.get('/rooms/:id', authMiddleware, hospitalizationController.findRoomById.bind(hospitalizationController));
router.post('/rooms', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), validate(createRoomSchema), hospitalizationController.createRoom.bind(hospitalizationController));
router.put('/rooms/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), hospitalizationController.updateRoom.bind(hospitalizationController));

// Beds
router.get('/beds/availability', authMiddleware, hospitalizationController.getBedAvailability.bind(hospitalizationController));
router.get('/beds', authMiddleware, hospitalizationController.findAllBeds.bind(hospitalizationController));
router.get('/beds/:id', authMiddleware, hospitalizationController.findBedById.bind(hospitalizationController));
router.post('/beds', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), validate(createBedSchema), hospitalizationController.createBed.bind(hospitalizationController));
router.put('/beds/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), hospitalizationController.updateBed.bind(hospitalizationController));

// Hospitalizations
router.get('/current', authMiddleware, hospitalizationController.getCurrentPatients.bind(hospitalizationController));
router.get('/', authMiddleware, hospitalizationController.findAll.bind(hospitalizationController));
router.get('/:id', authMiddleware, hospitalizationController.findById.bind(hospitalizationController));
router.post('/admit', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(createHospitalizationSchema), hospitalizationController.admit.bind(hospitalizationController));
router.put('/:id/discharge', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), hospitalizationController.discharge.bind(hospitalizationController));
router.put('/:id/transfer', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN'), validate(transferSchema), hospitalizationController.transfer.bind(hospitalizationController));

export default router;
