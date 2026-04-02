/**
 * Canonical path strings for the embedded loopback API — single source of truth for
 * Express mounts, OpenAPI `paths`, HTTP clients, and parity tests.
 */
export const EMBEDDED_API_PATHS = {
  health: '/health',
  openapiJson: '/api/openapi.json',
  docs: '/api/docs',
  /** Express mount for auth router (login, logout, me). */
  auth: '/api/auth',
  authLogin: '/api/auth/login',
  authLogout: '/api/auth/logout',
  authMe: '/api/auth/me',
  guests: '/api/guests',
  guestById: (id: number): string => `/api/guests/${id}`,
  rooms: '/api/rooms',
  roomById: (id: number): string => `/api/rooms/${id}`,
  reservations: '/api/reservations',
  reservationById: (id: number): string => `/api/reservations/${id}`,
  /** Express mount for reports router (folio and day-sheet routes). */
  reports: '/api/reports',
  reportsFolio: '/api/reports/folio',
  reportsDaySheet: '/api/reports/day-sheet',
} as const;

/**
 * OpenAPI 3 path templates (`{id}`) — must match `starHotelOpenApiDocument.paths` and openapi-typescript output.
 */
export const EMBEDDED_API_PATH_TEMPLATES = {
  guestById: '/api/guests/{id}',
  roomById: '/api/rooms/{id}',
  reservationById: '/api/reservations/{id}',
} as const;

/** OpenAPI 3 `paths` keys — must match `starHotelOpenApiDocument.paths`. */
export const EMBEDDED_OPENAPI_DOCUMENTED_PATHS = [
  EMBEDDED_API_PATHS.health,
  EMBEDDED_API_PATHS.authLogin,
  EMBEDDED_API_PATHS.authLogout,
  EMBEDDED_API_PATHS.authMe,
  EMBEDDED_API_PATHS.guests,
  EMBEDDED_API_PATH_TEMPLATES.guestById,
  EMBEDDED_API_PATHS.rooms,
  EMBEDDED_API_PATH_TEMPLATES.roomById,
  EMBEDDED_API_PATHS.reservations,
  EMBEDDED_API_PATH_TEMPLATES.reservationById,
  EMBEDDED_API_PATHS.reportsFolio,
  EMBEDDED_API_PATHS.reportsDaySheet,
] as const;
