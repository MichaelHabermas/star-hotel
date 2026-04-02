/**
 * Reservations vertical slice — navigation map (HTTP + SQLite + shared contract).
 *
 * - Routes: `register-sqlite-reservation-routes.ts` (mounted from `mvp-sqlite-api-composition.ts`)
 * - HTTP adapter: `reservation-router.ts`, `sqlite-http-adapter-kit`
 * - Service / repo: `reservation-service.ts`, `reservation-repository.ts`, `reservation-repository-port.ts`
 * - Domain pricing: `@domain/reservation-pricing` (totals / nights)
 * - Zod + OpenAPI components: `@shared/schemas/reservation` (see `zod-component-registry.ts`)
 * - Renderer client: `@shared/api/reservations-http-client.ts`
 */

export { registerSqliteReservationRoutes } from './register-sqlite-reservation-routes';
export { ReservationRepository } from './reservation-repository';
export type { ReservationRepositoryPort } from './reservation-repository-port';
export { createReservationRouter } from './reservation-router';
export { ReservationService } from './reservation-service';
