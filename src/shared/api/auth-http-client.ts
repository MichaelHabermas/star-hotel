import type { AuthMeResponse } from '../schemas/auth';
import {
  authMeResponseSchema,
  loginBodySchema,
  loginResponseSchema,
  type LoginBody,
  type LoginResponse,
} from '../schemas/auth';
import { changePasswordBodySchema, type ChangePasswordBody } from '../schemas/auth-password';
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client';
import { EMBEDDED_API_PATHS } from './embedded-api-paths';
import { assertOpenApiNoContentOrThrow, parseOpenApiOkData } from './embedded-http';

export type AuthHttpClient = {
  login(body: LoginBody): Promise<LoginResponse>;
  logout(): Promise<void>;
  me(): Promise<AuthMeResponse>;
  changePassword(body: ChangePasswordBody): Promise<void>;
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
      return parseOpenApiOkData(r, authMeResponseSchema);
    },

    async changePassword(body) {
      const payload = changePasswordBodySchema.parse(body);
      const r = await client.POST(EMBEDDED_API_PATHS.authChangePassword, {
        body: payload,
      });
      assertOpenApiNoContentOrThrow(r);
    },
  };
}
