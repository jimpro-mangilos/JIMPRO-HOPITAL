import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'Utilisateur requis'),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'RAPPEL']).optional(),
  title: z.string().min(1, 'Titre requis'),
  message: z.string().min(1, 'Message requis'),
  link: z.string().optional(),
});
