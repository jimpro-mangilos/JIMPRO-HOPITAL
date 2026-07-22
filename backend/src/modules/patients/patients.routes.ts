import { Router } from 'express';
import { patientsController } from './patients.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { createPatientSchema, updatePatientSchema } from './patients.schema';

const router = Router();

/**
 * @swagger
 * /api/v1/patients:
 *   get:
 *     tags: [Patients]
 *     summary: Liste des patients
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *     responses:
 *       200: { description: Liste paginée des patients }
 */
router.get('/', authMiddleware, patientsController.findAll.bind(patientsController));

/**
 * @swagger
 * /api/v1/patients/search:
 *   get:
 *     tags: [Patients]
 *     summary: Rechercher des patients
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: q, schema: { type: string } }
 *       - { in: query, name: phone, schema: { type: string } }
 *       - { in: query, name: email, schema: { type: string } }
 *     responses:
 *       200: { description: Résultats de recherche }
 */
router.get('/search', authMiddleware, patientsController.search.bind(patientsController));

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Détails d'un patient
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Détails du patient }
 */
router.get('/:id', authMiddleware, patientsController.findById.bind(patientsController));

/**
 * @swagger
 * /api/v1/patients/{id}/history:
 *   get:
 *     tags: [Patients]
 *     summary: Historique complet du patient
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Historique patient }
 */
router.get('/:id/history', authMiddleware, patientsController.getHistory.bind(patientsController));

/**
 * @swagger
 * /api/v1/patients:
 *   post:
 *     tags: [Patients]
 *     summary: Créer un nouveau patient
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, dateOfBirth, gender, phone]
 *     responses:
 *       201: { description: Patient créé }
 */
router.post('/', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'ACCUEIL'), validate(createPatientSchema), patientsController.create.bind(patientsController));

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   put:
 *     tags: [Patients]
 *     summary: Mettre à jour un patient
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Patient mis à jour }
 */
router.put('/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'ACCUEIL'), validate(updatePatientSchema), patientsController.update.bind(patientsController));

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   delete:
 *     tags: [Patients]
 *     summary: Désactiver un patient
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Patient désactivé }
 */
router.delete('/:id', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), patientsController.delete.bind(patientsController));

export default router;
