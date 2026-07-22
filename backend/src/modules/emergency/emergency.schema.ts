import { z } from 'zod';

export const createEmergencySchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  triageLevel: z.enum(['I', 'II', 'III', 'IV', 'V']),
  chiefComplaint: z.string().min(1, 'Motif requis'),
  vitals: z.string().optional(),
  notes: z.string().optional(),
});

export const triageSchema = z.object({
  triageLevel: z.enum(['I', 'II', 'III', 'IV', 'V']),
  notes: z.string().optional(),
});

export const assignSchema = z.object({
  assignedTo: z.string().min(1, 'Médecin requis'),
});

export const updateEmergencySchema = z.object({
  status: z.enum(['EN_ATTENTE', 'EN_TRIAGE', 'EN_TRAITEMENT', 'EN_OBSERVATION', 'SORTI', 'HOSPITALISE', 'TRANSFERE', 'DECEDE']),
  disposition: z.string().optional(),
  notes: z.string().optional(),
});
