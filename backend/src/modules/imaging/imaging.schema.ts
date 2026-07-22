import { z } from 'zod';

export const createImagingRequestSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  staffId: z.string().min(1, 'Médecin requis'),
  consultationId: z.string().optional(),
  imagingType: z.string().min(1, 'Type d\'imagerie requis'),
  bodyPart: z.string().optional(),
  priority: z.enum(['NORMAL', 'URGENT', 'CRITIQUE']).optional(),
  clinicalInfo: z.string().optional(),
});

export const updateImagingRequestSchema = z.object({
  status: z.enum(['EN_ATTENTE', 'PROGRAMME', 'REALISE', 'INTERPRETE', 'VALIDE']),
  clinicalInfo: z.string().optional(),
});

export const createImagingResultSchema = z.object({
  imagingRequestId: z.string().min(1, 'Demande d\'imagerie requise'),
  findings: z.string().optional(),
  impression: z.string().optional(),
  reportUrl: z.string().optional(),
  imagesUrls: z.string().optional(),
  radiologistId: z.string().optional(),
});
