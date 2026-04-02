import { z } from 'zod'
import {
  loginBodySchema,
  loginResponseSchema,
  type LoginBody,
  type LoginResponse,
} from '../schemas/auth'
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client'
import { throwIfOpenApiError } from './embedded-http'

const meResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    role: z.string(),
  }),
})

export type AuthHttpClient = {
  login(body: LoginBody): Promise<LoginResponse>
  logout(): Promise<void>
  me(): Promise<{ user: { id: number; username: string; role: string } }>
}

export function createAuthHttpClient(deps: {
  readonly baseUrl: string
  readonly fetch: typeof fetch
}): AuthHttpClient {
  const client = createEmbeddedOpenApiClient(deps)

  return {
    async login(body) {
      const payload = loginBodySchema.parse(body)
      const r = await client.POST('/api/auth/login', {
        body: payload,
      })
      throwIfOpenApiError(r)
      return loginResponseSchema.parse(r.data)
    },

    async logout() {
      const r = await client.POST('/api/auth/logout', {})
      if (r.response.status === 204) {
        return
      }
      throwIfOpenApiError(r)
    },

    async me() {
      const r = await client.GET('/api/auth/me', {})
      throwIfOpenApiError(r)
      return meResponseSchema.parse(r.data)
    },
  }
}
