//  Notification Validators

import { z } from 'zod';
import { NotificationType } from '@prisma/client';

// Get notifications query parameters

export const getNotificationsSchema = z.object({
  read: z
    .string()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
    .optional(),
  type: z.nativeEnum(NotificationType).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .default('1' as any),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .default('20' as any),
});
