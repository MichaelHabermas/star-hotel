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
import { EMBEDDED_API_PATHS, EMBEDDED_API_PATH_TEMPLATES } from './embedded-api-paths';
import { assertOpenApiNoContentOrThrow, parseOpenApiOkData } from './embedded-http';

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
      const r = await client.GET(EMBEDDED_API_PATHS.rooms, {
        params: q ? { query: q } : {},
      });
      return parseOpenApiOkData(r, z.array(roomResponseSchema));
    },

    async get(id) {
      const r = await client.GET(EMBEDDED_API_PATH_TEMPLATES.roomById, {
        params: { path: { id } },
      });
      return parseOpenApiOkData(r, roomResponseSchema);
    },

    async create(body) {
      const payload = roomCreateBodySchema.parse(body);
      const r = await client.POST(EMBEDDED_API_PATHS.rooms, {
        body: payload,
      });
      return parseOpenApiOkData(r, roomResponseSchema);
    },

    async update(id, body) {
      const payload = roomUpdateBodySchema.parse(body);
      const r = await client.PATCH(EMBEDDED_API_PATH_TEMPLATES.roomById, {
        params: { path: { id } },
        body: payload,
      });
      return parseOpenApiOkData(r, roomResponseSchema);
    },

    async delete(id) {
      const r = await client.DELETE(EMBEDDED_API_PATH_TEMPLATES.roomById, {
        params: { path: { id } },
      });
      assertOpenApiNoContentOrThrow(r);
    },
  };
}
