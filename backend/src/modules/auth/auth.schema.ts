import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  phone: z.string().min(1, 'Téléphone requis'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'INFIRMIER', 'PHARMACIEN', 'LABORANTIN', 'RADIOLOGUE', 'ACCUEIL', 'COMPTABLE']).optional(),
  speciality: z.string().optional(),
  licenseNumber: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  speciality: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
});

export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  phone: z.string().min(1, 'Téléphone requis'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'INFIRMIER', 'PHARMACIEN', 'LABORANTIN', 'RADIOLOGUE', 'ACCUEIL', 'COMPTABLE']),
  speciality: z.string().optional(),
  licenseNumber: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEDECIN', 'INFIRMIER', 'PHARMACIEN', 'LABORANTIN', 'RADIOLOGUE', 'ACCUEIL', 'COMPTABLE']),
});
