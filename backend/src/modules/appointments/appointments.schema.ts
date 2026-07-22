import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  staffId: z.string().min(1, 'Médecin requis'),
  date: z.string().min(1, 'Date requise'),
  startTime: z.string().min(1, 'Heure de début requise'),
  endTime: z.string().min(1, 'Heure de fin requise'),
  type: z.enum(['CONSULTATION', 'SUIVI', 'URGENCE', 'LABORATOIRE', 'IMAGERIE', 'VACCINATION']).optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.enum(['CONSULTATION', 'SUIVI', 'URGENCE', 'LABORATOIRE', 'IMAGERIE', 'VACCINATION']).optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PROGRAMME', 'CONFIRME', 'EN_COURS', 'TERMINE', 'ANNULE', 'ABSENT']).optional(),
});
