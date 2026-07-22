import { z } from 'zod';

export const createInvoiceSchema = z.object({
  patientId: z.string().min(1, 'Patient requis'),
  consultationId: z.string().optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.enum(['ESPECES', 'CARTE_BANCAIRE', 'CHEQUE', 'VIREMENT', 'ASSURANCE', 'MOBILE_MONEY']).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const addLineSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().int().min(1).optional(),
  unitPrice: z.number().min(0),
  category: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive('Montant positif requis'),
  paymentMethod: z.enum(['ESPECES', 'CARTE_BANCAIRE', 'CHEQUE', 'VIREMENT', 'ASSURANCE', 'MOBILE_MONEY']),
});
