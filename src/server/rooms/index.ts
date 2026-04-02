/**
 * Rooms vertical slice — navigation map (HTTP + SQLite + shared contract).
 *
 * - Routes: `register-sqlite-room-routes.ts` (mounted from `mvp-sqlite-api-composition.ts`)
 * - HTTP adapter: `room-router.ts`, `sqlite-http-adapter-kit`
 * - Service / repo: `room-service.ts`, `room-repository.ts`
 * - Zod + OpenAPI components: `@shared/schemas/room` (see `zod-component-registry.ts`)
 * - Renderer client: `@shared/api/rooms-http-client.ts`
 */

export { registerSqliteRoomRoutes } from './register-sqlite-room-routes';
export { RoomRepository } from './room-repository';
export { createRoomRouter } from './room-router';
export { RoomService } from './room-service';
