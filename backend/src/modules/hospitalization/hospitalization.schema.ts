import { z } from 'zod';

export const createWardSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  type: z.string().min(1, 'Type requis'),
  floor: z.number().int().min(0),
  capacity: z.number().int().min(1).optional(),
});

export const createRoomSchema = z.object({
  wardId: z.string().min(1, 'Service requis'),
  roomNumber: z.string().min(1, 'Numéro de chambre requis'),
  type: z.enum(['STANDARD', 'PRIVEE', 'SEMI_PRIVEE', 'SOINS_INTENSIFS', 'ISOLEMENT']).optional(),
  floor: z.number().int().min(0),
});

export const createBedSchema = z.object({
  roomId: z.string().min(1, 'Chambre requise'),
  bedNumber: z.string().min(1, 'Numéro de lit requis'),
  type: z.string().optional(),
});

export const createHospitalizationSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  bedId: z.string().min(1, 'Lit requis'),
  reason: z.string().min(1, 'Motif requis'),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
});

export const transferSchema = z.object({
  newBedId: z.string().min(1, 'Nouveau lit requis'),
  reason: z.string().optional(),
});
