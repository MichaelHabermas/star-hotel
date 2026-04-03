import type { z } from 'zod';
import { hotelModuleKeySchema } from '../hotel-modules';
import { z as zod } from './zod-openapi';

export const loginBodySchema = zod
  .object({
    username: zod.string().min(1, 'Username is required'),
    password: zod.string().min(1, 'Password is required'),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;

export const authUserResponseSchema = zod.object({
  id: zod.number(),
  username: zod.string(),
  role: zod.string(),
});

export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;

export const authMeResponseSchema = zod.object({
  user: authUserResponseSchema,
  moduleKeys: zod.array(hotelModuleKeySchema),
});

export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;

export const loginResponseSchema = zod.object({
  token: zod.string(),
  user: authUserResponseSchema,
  moduleKeys: zod.array(hotelModuleKeySchema),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
