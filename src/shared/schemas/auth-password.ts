import type { z } from 'zod';
import { z as zod } from './zod-openapi';

export const changePasswordBodySchema = zod
  .object({
    currentPassword: zod.string().min(1, 'Current password is required'),
    newPassword: zod.string().min(8, 'New password must be at least 8 characters'),
  })
  .strict();

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
