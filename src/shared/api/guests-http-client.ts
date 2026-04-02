import { z } from 'zod';
import {
  guestCreateBodySchema,
  guestListQuerySchema,
  guestResponseSchema,
  guestUpdateBodySchema,
  type GuestCreateBody,
  type GuestListQuery,
  type GuestResponse,
  type GuestUpdateBody,
} from '../schemas/guest';
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client';
import { throwIfOpenApiError } from './embedded-http';

export type GuestsHttpClient = {
  list(query?: GuestListQuery): Promise<GuestResponse[]>;
  get(id: number): Promise<GuestResponse>;
  create(body: GuestCreateBody): Promise<GuestResponse>;
  update(id: number, body: GuestUpdateBody): Promise<GuestResponse>;
  delete(id: number): Promise<void>;
};

export function createGuestsHttpClient(deps: {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
}): GuestsHttpClient {
  const client = createEmbeddedOpenApiClient(deps);

  return {
    async list(query = {}) {
      guestListQuerySchema.parse(query);
      const r = await client.GET('/api/guests', {});
      throwIfOpenApiError(r);
      return z.array(guestResponseSchema).parse(r.data);
    },

    async get(id) {
      const r = await client.GET('/api/guests/{id}', {
        params: { path: { id } },
      });
      throwIfOpenApiError(r);
      return guestResponseSchema.parse(r.data);
    },

    async create(body) {
      const payload = guestCreateBodySchema.parse(body);
      const r = await client.POST('/api/guests', {
        body: payload,
      });
      throwIfOpenApiError(r);
      return guestResponseSchema.parse(r.data);
    },

    async update(id, body) {
      const payload = guestUpdateBodySchema.parse(body);
      const r = await client.PATCH('/api/guests/{id}', {
        params: { path: { id } },
        body: payload,
      });
      throwIfOpenApiError(r);
      return guestResponseSchema.parse(r.data);
    },

    async delete(id) {
      const r = await client.DELETE('/api/guests/{id}', {
        params: { path: { id } },
      });
      if (r.response.status === 204) {
        return;
      }
      throwIfOpenApiError(r);
    },
  };
}
