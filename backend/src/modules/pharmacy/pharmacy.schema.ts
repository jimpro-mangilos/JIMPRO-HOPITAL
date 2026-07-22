import { z } from 'zod';

export const createMedicationSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  genericName: z.string().optional(),
  category: z.string().optional(),
  form: z.string().optional(),
  dosageUnit: z.string().optional(),
  unitPrice: z.number().min(0).optional(),
  description: z.string().optional(),
});

export const updateMedicationSchema = z.object({
  name: z.string().optional(),
  genericName: z.string().optional(),
  category: z.string().optional(),
  form: z.string().optional(),
  dosageUnit: z.string().optional(),
  unitPrice: z.number().min(0).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createStockSchema = z.object({
  medicationId: z.string().min(1, 'Médicament requis'),
  batchNumber: z.string().min(1, 'Numéro de lot requis'),
  quantity: z.number().int().min(0),
  unitPrice: z.number().min(0),
  expiryDate: z.string().min(1, 'Date d\'expiration requise'),
  supplierId: z.string().optional(),
  reorderLevel: z.number().int().min(0).optional(),
  location: z.string().optional(),
});

export const updateStockSchema = z.object({
  batchNumber: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  expiryDate: z.string().optional(),
  supplierId: z.string().optional(),
  reorderLevel: z.number().int().min(0).optional(),
  location: z.string().optional(),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const addRemoveStockSchema = z.object({
  quantity: z.number().int().positive('Quantité positive requise'),
});
