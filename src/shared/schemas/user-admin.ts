import type { z } from 'zod';
import { hotelModuleKeySchema } from '../hotel-modules';
import { z as zod } from './zod-openapi';

export const userAdminResponseSchema = zod.object({
  id: zod.number().int().positive(),
  username: zod.string(),
  role: zod.string(),
});

export type UserAdminResponse = z.infer<typeof userAdminResponseSchema>;

export const userAdminCreateBodySchema = zod
  .object({
    username: zod.string().min(1, 'Username is required').max(64),
    password: zod.string().min(8, 'Password must be at least 8 characters'),
    role: zod.string().min(1, 'Role is required').max(32),
  })
  .strict();

export type UserAdminCreateBody = z.infer<typeof userAdminCreateBodySchema>;

export const userAdminUpdateBodySchema = zod
  .object({
    username: zod.string().min(1).max(64).optional(),
    role: zod.string().min(1).max(32).optional(),
  })
  .strict();

export type UserAdminUpdateBody = z.infer<typeof userAdminUpdateBodySchema>;

export const userIdParamsSchema = zod.object({
  id: zod.coerce.number().int().positive(),
});

export const userModulesPutBodySchema = zod
  .object({
    moduleKeys: zod.array(hotelModuleKeySchema),
  })
  .strict();

export type UserModulesPutBody = z.infer<typeof userModulesPutBodySchema>;

export const userModulesDetailResponseSchema = zod.object({
  accessMode: zod.enum(['default', 'custom']),
  moduleKeys: zod.array(hotelModuleKeySchema),
});

export type UserModulesDetailResponse = z.infer<typeof userModulesDetailResponseSchema>;
