import { z } from 'zod';
import {
  userAdminCreateBodySchema,
  userAdminResponseSchema,
  userAdminUpdateBodySchema,
  userIdParamsSchema,
  userModulesDetailResponseSchema,
  userModulesPutBodySchema,
  type UserAdminCreateBody,
  type UserAdminResponse,
  type UserAdminUpdateBody,
  type UserModulesDetailResponse,
  type UserModulesPutBody,
} from '../schemas/user-admin';
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client';
import { EMBEDDED_API_PATHS, EMBEDDED_API_PATH_TEMPLATES } from './embedded-api-paths';
import { assertOpenApiNoContentOrThrow, parseOpenApiOkData } from './embedded-http';

export type UsersHttpClient = {
  list(): Promise<UserAdminResponse[]>;
  create(body: UserAdminCreateBody): Promise<UserAdminResponse>;
  update(id: number, body: UserAdminUpdateBody): Promise<UserAdminResponse>;
  delete(id: number): Promise<void>;
  getModules(id: number): Promise<UserModulesDetailResponse>;
  putModules(id: number, body: UserModulesPutBody): Promise<UserModulesDetailResponse>;
};

export function createUsersHttpClient(deps: {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
}): UsersHttpClient {
  const client = createEmbeddedOpenApiClient(deps);

  return {
    async list() {
      const r = await client.GET(EMBEDDED_API_PATHS.users, {});
      return parseOpenApiOkData(r, z.array(userAdminResponseSchema));
    },

    async create(body) {
      const payload = userAdminCreateBodySchema.parse(body);
      const r = await client.POST(EMBEDDED_API_PATHS.users, {
        body: payload,
      });
      return parseOpenApiOkData(r, userAdminResponseSchema);
    },

    async update(id, body) {
      userIdParamsSchema.parse({ id });
      const payload = userAdminUpdateBodySchema.parse(body);
      const r = await client.PATCH(EMBEDDED_API_PATH_TEMPLATES.userById, {
        params: { path: { id } },
        body: payload,
      });
      return parseOpenApiOkData(r, userAdminResponseSchema);
    },

    async delete(id) {
      userIdParamsSchema.parse({ id });
      const r = await client.DELETE(EMBEDDED_API_PATH_TEMPLATES.userById, {
        params: { path: { id } },
      });
      assertOpenApiNoContentOrThrow(r);
    },

    async getModules(id) {
      userIdParamsSchema.parse({ id });
      const r = await client.GET(EMBEDDED_API_PATH_TEMPLATES.userModules, {
        params: { path: { id } },
      });
      return parseOpenApiOkData(r, userModulesDetailResponseSchema);
    },

    async putModules(id, body) {
      userIdParamsSchema.parse({ id });
      const payload = userModulesPutBodySchema.parse(body);
      const r = await client.PUT(EMBEDDED_API_PATH_TEMPLATES.userModules, {
        params: { path: { id } },
        body: payload,
      });
      return parseOpenApiOkData(r, userModulesDetailResponseSchema);
    },
  };
}
