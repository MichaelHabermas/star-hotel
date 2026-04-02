import { z } from 'zod';
import {
  reservationCreateBodySchema,
  reservationListQuerySchema,
  reservationResponseSchema,
  reservationUpdateBodySchema,
  type ReservationCreateBody,
  type ReservationListQuery,
  type ReservationResponse,
  type ReservationUpdateBody,
} from '../schemas/reservation';
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client';
import { assertOpenApiNoContentOrThrow, parseOpenApiOkData } from './embedded-http';

export { EmbeddedApiHttpError as ReservationsHttpError } from './embedded-http';
export type { EmbeddedApiErrorBody as ApiErrorBody } from './embedded-http';

function listQueryParams(
  query: ReservationListQuery,
): { roomId?: number; guestId?: number } | undefined {
  const parsed = reservationListQuerySchema.parse(query);
  if (parsed.roomId === undefined && parsed.guestId === undefined) {
    return undefined;
  }
  const out: { roomId?: number; guestId?: number } = {};
  if (parsed.roomId !== undefined) {
    out.roomId = parsed.roomId;
  }
  if (parsed.guestId !== undefined) {
    out.guestId = parsed.guestId;
  }
  return out;
}

export type ReservationsHttpClient = {
  list(query: ReservationListQuery): Promise<ReservationResponse[]>;
  get(id: number): Promise<ReservationResponse>;
  create(body: ReservationCreateBody): Promise<ReservationResponse>;
  update(id: number, body: ReservationUpdateBody): Promise<ReservationResponse>;
  delete(id: number): Promise<void>;
};

export function createReservationsHttpClient(deps: {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
}): ReservationsHttpClient {
  const client = createEmbeddedOpenApiClient(deps);

  return {
    async list(query) {
      const q = listQueryParams(query);
      const r = await client.GET('/api/reservations', {
        params: q ? { query: q } : {},
      });
      return parseOpenApiOkData(r, z.array(reservationResponseSchema));
    },

    async get(id) {
      const r = await client.GET('/api/reservations/{id}', {
        params: { path: { id } },
      });
      return parseOpenApiOkData(r, reservationResponseSchema);
    },

    async create(body) {
      const payload = reservationCreateBodySchema.parse(body);
      const r = await client.POST('/api/reservations', {
        body: payload,
      });
      return parseOpenApiOkData(r, reservationResponseSchema);
    },

    async update(id, body) {
      const payload = reservationUpdateBodySchema.parse(body);
      const r = await client.PATCH('/api/reservations/{id}', {
        params: { path: { id } },
        body: payload,
      });
      return parseOpenApiOkData(r, reservationResponseSchema);
    },

    async delete(id) {
      const r = await client.DELETE('/api/reservations/{id}', {
        params: { path: { id } },
      });
      assertOpenApiNoContentOrThrow(r);
    },
  };
}
