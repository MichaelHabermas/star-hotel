import { z } from 'zod';
import {
  loginBodySchema,
  loginResponseSchema,
  type LoginBody,
  type LoginResponse,
} from '../schemas/auth';
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client';
import { EMBEDDED_API_PATHS } from './embedded-api-paths';
import { assertOpenApiNoContentOrThrow, parseOpenApiOkData } from './embedded-http';

const meResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    role: z.string(),
  }),
});

export type AuthHttpClient = {
  login(body: LoginBody): Promise<LoginResponse>;
  logout(): Promise<void>;
  me(): Promise<{ user: { id: number; username: string; role: string } }>;
};

export function createAuthHttpClient(deps: {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
}): AuthHttpClient {
  const client = createEmbeddedOpenApiClient(deps);

  return {
    async login(body) {
      const payload = loginBodySchema.parse(body);
      const r = await client.POST(EMBEDDED_API_PATHS.authLogin, {
        body: payload,
      });
      return parseOpenApiOkData(r, loginResponseSchema);
    },

    async logout() {
      const r = await client.POST(EMBEDDED_API_PATHS.authLogout, {});
      assertOpenApiNoContentOrThrow(r);
    },

    async me() {
      const r = await client.GET(EMBEDDED_API_PATHS.authMe, {});
      return parseOpenApiOkData(r, meResponseSchema);
    },
  };
}
