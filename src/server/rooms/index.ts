/**
 * Rooms vertical slice — navigation map (HTTP + SQLite + shared contract).
 *
 * - Routes: mounted from `register-mvp-sqlite-api-routes.ts` (`/api/rooms`)
 * - HTTP adapter: `room-router.ts`, `sqlite-http-adapter-kit`
 * - Service / repo: `room-service.ts`, `room-repository.ts`
 * - Zod + OpenAPI components: `@shared/schemas/room` (see `zod-component-registry.ts`)
 * - Renderer client: `@shared/api/rooms-http-client.ts`
 */

export { RoomRepository } from './room-repository';
export { createRoomRouter } from './room-router';
export { RoomService } from './room-service';
