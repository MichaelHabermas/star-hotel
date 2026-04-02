import type { z } from 'zod';
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

export const loginResponseSchema = zod.object({
  token: zod.string(),
  user: authUserResponseSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
