import { z } from 'zod';

export const createLabRequestSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  staffId: z.string().min(1, 'Médecin requis'),
  consultationId: z.string().optional(),
  testType: z.string().min(1, 'Type de test requis'),
  priority: z.enum(['NORMAL', 'URGENT', 'CRITIQUE']).optional(),
  notes: z.string().optional(),
});

export const updateLabRequestSchema = z.object({
  status: z.enum(['EN_ATTENTE', 'PRELEVE', 'EN_COURS', 'TERMINE', 'VALIDE']),
  notes: z.string().optional(),
});

export const createLabResultSchema = z.object({
  labRequestId: z.string().min(1, 'Demande labo requise'),
  parameter: z.string().min(1, 'Paramètre requis'),
  value: z.number(),
  unit: z.string().min(1, 'Unité requise'),
  normalMin: z.number().optional(),
  normalMax: z.number().optional(),
  isAbnormal: z.boolean().optional(),
  notes: z.string().optional(),
  validatedBy: z.string().optional(),
});
