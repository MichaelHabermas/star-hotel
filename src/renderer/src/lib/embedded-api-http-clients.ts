import { createAuthHttpClient, type AuthHttpClient } from '@shared/api/auth-http-client';
import { createGuestsHttpClient, type GuestsHttpClient } from '@shared/api/guests-http-client';
import { createReportsHttpClient, type ReportsHttpClient } from '@shared/api/reports-http-client';
import {
  createReservationsHttpClient,
  type ReservationsHttpClient,
} from '@shared/api/reservations-http-client';
import { createRoomsHttpClient, type RoomsHttpClient } from '@shared/api/rooms-http-client';
import { createUsersHttpClient, type UsersHttpClient } from '@shared/api/users-http-client';

/** Bundle of typed openapi-fetch clients for the embedded Express API (loopback). */
export type EmbeddedApiHttpClients = {
  readonly auth: AuthHttpClient;
  readonly reservations: ReservationsHttpClient;
  readonly guests: GuestsHttpClient;
  readonly rooms: RoomsHttpClient;
  readonly reports: ReportsHttpClient;
  readonly users: UsersHttpClient;
};

export function createEmbeddedApiHttpClients(deps: {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;
}): EmbeddedApiHttpClients {
  return {
    auth: createAuthHttpClient(deps),
    reservations: createReservationsHttpClient(deps),
    guests: createGuestsHttpClient(deps),
    rooms: createRoomsHttpClient(deps),
    reports: createReportsHttpClient(deps),
    users: createUsersHttpClient(deps),
  };
}
