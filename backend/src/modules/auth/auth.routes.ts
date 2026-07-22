import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserRoleSchema,
} from './auth.schema';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Inscription d'un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, phone]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [SUPER_ADMIN, ADMIN, MEDECIN, INFIRMIER, PHARMACIEN, LABORANTIN, RADIOLOGUE, ACCUEIL, COMPTABLE] }
 *     responses:
 *       201: { description: Utilisateur créé avec succès }
 *       409: { description: Email déjà utilisé }
 */
router.post('/register', validate(registerSchema), authController.register.bind(authController));

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Connexion réussie }
 *       401: { description: Identifiants invalides }
 */
router.post('/login', validate(loginSchema), authController.login.bind(authController));

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profil utilisateur }
 */
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Mettre à jour le profil
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Profil mis à jour }
 */
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile.bind(authController));

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Changer le mot de passe
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Mot de passe changé }
 */
router.put('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword.bind(authController));

/**
 * @swagger
 * /api/v1/auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: Liste des utilisateurs (Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des utilisateurs }
 */
router.get('/users', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), authController.listUsers.bind(authController));

/**
 * @swagger
 * /api/v1/auth/users:
 *   post:
 *     tags: [Auth]
 *     summary: Créer un utilisateur (Admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, phone, role]
 *     responses:
 *       201: { description: Utilisateur créé }
 */
router.post('/users', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), validate(createUserSchema), authController.createUser.bind(authController));

/**
 * @swagger
 * /api/v1/auth/users/{id}/role:
 *   put:
 *     tags: [Auth]
 *     summary: Modifier le rôle d'un utilisateur (Admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string }
 *     responses:
 *       200: { description: Rôle mis à jour }
 */
router.put('/users/:id/role', authMiddleware, rbac('SUPER_ADMIN', 'ADMIN'), validate(updateUserRoleSchema), authController.updateUserRole.bind(authController));

export default router;
