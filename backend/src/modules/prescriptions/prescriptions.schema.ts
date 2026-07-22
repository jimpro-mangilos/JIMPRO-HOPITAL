import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  consultationId: z.string().min(1, 'Consultation requise'),
  medicationId: z.string().min(1, 'Médicament requis'),
  dosage: z.string().min(1, 'Dosage requis'),
  frequency: z.string().min(1, 'Fréquence requise'),
  duration: z.string().min(1, 'Durée requise'),
  instructions: z.string().optional(),
});

export const updatePrescriptionSchema = z.object({
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});
