/**
 * Guests vertical slice — navigation map (HTTP + SQLite + shared contract).
 *
 * - Routes: `register-sqlite-guest-routes.ts` (mounted from `mvp-sqlite-api-composition.ts`)
 * - HTTP adapter: `guest-router.ts`, `sqlite-http-adapter-kit`
 * - Service / repo: `guest-service.ts`, `guest-repository.ts`
 * - Zod + OpenAPI components: `@shared/schemas/guest` (see `zod-component-registry.ts`)
 * - Renderer client: `@shared/api/guests-http-client.ts`
 */

export { GuestRepository } from './guest-repository';
export { createGuestRouter } from './guest-router';
export { GuestService } from './guest-service';
export { registerSqliteGuestRoutes } from './register-sqlite-guest-routes';
