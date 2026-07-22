import { z } from 'zod';

export const createConsultationSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  staffId: z.string().min(1, 'Médecin requis'),
  appointmentId: z.string().optional(),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  diagnosisCode: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  status: z.enum(['EN_COURS', 'TERMINE', 'ANNULE']).optional(),
});

export const updateConsultationSchema = z.object({
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  diagnosisCode: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  status: z.enum(['EN_COURS', 'TERMINE', 'ANNULE']).optional(),
});

export const startFromAppointmentSchema = z.object({
  appointmentId: z.string().min(1, 'Rendez-vous requis'),
});
