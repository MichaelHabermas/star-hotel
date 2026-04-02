import { z } from 'zod'

export const loginBodySchema = z
  .object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict()

export type LoginBody = z.infer<typeof loginBodySchema>

export const authUserResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  role: z.string(),
})

export type AuthUserResponse = z.infer<typeof authUserResponseSchema>

export const loginResponseSchema = z.object({
  token: z.string(),
  user: authUserResponseSchema,
})

export type LoginResponse = z.infer<typeof loginResponseSchema>
