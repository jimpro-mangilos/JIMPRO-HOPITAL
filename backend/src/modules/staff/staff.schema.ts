import { z } from 'zod';

export const createStaffSchema = z.object({
  userId: z.string().min(1, 'Utilisateur requis'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  speciality: z.string().optional(),
  licenseNumber: z.string().optional(),
  phone: z.string().min(1, 'Téléphone requis'),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const updateStaffSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  speciality: z.string().optional(),
  licenseNumber: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  avatarUrl: z.string().optional(),
});
