import { z } from 'zod';
import {
  roomCreateBodySchema,
  roomListQuerySchema,
  roomResponseSchema,
  roomUpdateBodySchema,
  type RoomCreateBody,
  type RoomListQuery,
  type RoomResponse,
  type RoomUpdateBody,
} from '../schemas/room';
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client';
import { throwIfOpenApiError } from './embedded-http';

function listQueryParams(query: RoomListQuery): { status?: string } | undefined {
  const parsed = roomListQuerySchema.parse(query);
  if (parsed.status === undefined) {
    return undefined;
  }
  return { status: parsed.status };
}

export type RoomsHttpClient = {
  list(query?: RoomListQuery): Promise<RoomResponse[]>;
  get(id: number): Promise<RoomResponse>;
  create(body: RoomCreateBody): Promise<RoomResponse>;
  update(id: number, body: RoomUpdateBody): Promise<RoomResponse>;
  delete(id: number): Promise<void>;
};

export function createRoomsHttpClient(deps: {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
}): RoomsHttpClient {
  const client = createEmbeddedOpenApiClient(deps);

  return {
    async list(query = {}) {
      const q = listQueryParams(query);
      const r = await client.GET('/api/rooms', {
        params: q ? { query: q } : {},
      });
      throwIfOpenApiError(r);
      return z.array(roomResponseSchema).parse(r.data);
    },

    async get(id) {
      const r = await client.GET('/api/rooms/{id}', {
        params: { path: { id } },
      });
      throwIfOpenApiError(r);
      return roomResponseSchema.parse(r.data);
    },

    async create(body) {
      const payload = roomCreateBodySchema.parse(body);
      const r = await client.POST('/api/rooms', {
        body: payload,
      });
      throwIfOpenApiError(r);
      return roomResponseSchema.parse(r.data);
    },

    async update(id, body) {
      const payload = roomUpdateBodySchema.parse(body);
      const r = await client.PATCH('/api/rooms/{id}', {
        params: { path: { id } },
        body: payload,
      });
      throwIfOpenApiError(r);
      return roomResponseSchema.parse(r.data);
    },

    async delete(id) {
      const r = await client.DELETE('/api/rooms/{id}', {
        params: { path: { id } },
      });
      if (r.response.status === 204) {
        return;
      }
      throwIfOpenApiError(r);
    },
  };
}
