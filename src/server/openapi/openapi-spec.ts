import {
  EMBEDDED_API_PATHS,
  EMBEDDED_API_PATH_TEMPLATES,
} from '../../shared/api/embedded-api-paths';
import { getStarHotelZodOpenApiComponents } from './zod-component-registry';

/**
 * OpenAPI 3 description of the loopback embedded API (see README — default port 45123).
 * Served at GET /api/openapi.json; Swagger UI at GET /api/docs.
 *
 * **`paths` keys** are taken from `EMBEDDED_API_PATHS` / `EMBEDDED_API_PATH_TEMPLATES` (see `embedded-api-paths.ts`).
 *
 * DTO `components.schemas` are generated from Zod in `@shared/schemas` via `zod-component-registry.ts`.
 */
const zodComponents = getStarHotelZodOpenApiComponents();

export const starHotelOpenApiDocument: Record<string, unknown> = {
  openapi: '3.0.3',
  info: {
    title: 'Star Hotel embedded API',
    description:
      'Express in Electron main; binds 127.0.0.1 only. Use the same host/port as the running app (STAR_HOTEL_PORT / default 45123).',
    version: '0.1.0',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'health' },
    { name: 'auth' },
    { name: 'guests' },
    { name: 'rooms' },
    { name: 'reservations' },
    { name: 'reports' },
    { name: 'users' },
  ],
  paths: {
    [EMBEDDED_API_PATHS.health]: {
      get: {
        tags: ['health'],
        summary: 'Liveness after SQLite is ready',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean', example: true } },
                  required: ['ok'],
                },
              },
            },
          },
        },
      },
    },
    [EMBEDDED_API_PATHS.authLogin]: {
      post: {
        tags: ['auth'],
        summary: 'Login (Argon2 password verification)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                additionalProperties: false,
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Session token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token', 'user', 'moduleKeys'],
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/AuthUser' },
                    moduleKeys: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/HotelModuleKey' },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    [EMBEDDED_API_PATHS.authLogout]: {
      post: {
        tags: ['auth'],
        summary: 'Logout (invalidate server session)',
        responses: {
          '204': { description: 'No content' },
        },
      },
    },
    [EMBEDDED_API_PATHS.authMe]: {
      get: {
        tags: ['auth'],
        summary: 'Current user (requires Bearer token)',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['user', 'moduleKeys'],
                  properties: {
                    user: { $ref: '#/components/schemas/AuthUser' },
                    moduleKeys: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/HotelModuleKey' },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    [EMBEDDED_API_PATHS.authChangePassword]: {
      post: {
        tags: ['auth'],
        summary: 'Change password (requires Bearer token)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordBody' } },
          },
        },
        responses: {
          '204': { description: 'No content' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    [EMBEDDED_API_PATHS.guests]: {
      get: {
        tags: ['guests'],
        summary: 'List guests (picker)',
        parameters: [],
        responses: {
          '200': {
            description: 'Guest array',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Guest' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['guests'],
        summary: 'Create guest',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/GuestCreate' } },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Guest' } },
            },
          },
          '400': { description: 'Validation' },
        },
      },
    },
    [EMBEDDED_API_PATH_TEMPLATES.guestById]: {
      get: {
        tags: ['guests'],
        summary: 'Get guest by id',
        parameters: [{ $ref: '#/components/parameters/GuestId' }],
        responses: {
          '200': {
            description: 'Guest',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Guest' } },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['guests'],
        summary: 'Update guest (partial body)',
        parameters: [{ $ref: '#/components/parameters/GuestId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/GuestPatch' } },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Guest' } },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['guests'],
        summary: 'Delete guest (blocked when reservations reference them)',
        parameters: [{ $ref: '#/components/parameters/GuestId' }],
        responses: {
          '204': { description: 'No content' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { description: 'Guest has reservations' },
        },
      },
    },
    [EMBEDDED_API_PATHS.rooms]: {
      get: {
        tags: ['rooms'],
        summary: 'List rooms (optional status filter)',
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filter by tbl_room.Status',
          },
        ],
        responses: {
          '200': {
            description: 'Room array',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Room' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['rooms'],
        summary: 'Create room',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RoomCreate' } },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Room' } },
            },
          },
          '400': { description: 'Validation' },
        },
      },
    },
    [EMBEDDED_API_PATH_TEMPLATES.roomById]: {
      get: {
        tags: ['rooms'],
        summary: 'Get room by id',
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        responses: {
          '200': {
            description: 'Room',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Room' } },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['rooms'],
        summary: 'Update room (partial body)',
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RoomPatch' } },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Room' } },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['rooms'],
        summary: 'Delete room (blocked when reservations reference it)',
        parameters: [{ $ref: '#/components/parameters/RoomId' }],
        responses: {
          '204': { description: 'No content' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { description: 'Room has reservations' },
        },
      },
    },
    [EMBEDDED_API_PATHS.reservations]: {
      get: {
        tags: ['reservations'],
        summary: 'List reservations',
        parameters: [
          {
            name: 'roomId',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
          {
            name: 'guestId',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'Reservation array',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Reservation' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['reservations'],
        summary: 'Create reservation (total computed server-side)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ReservationCreate' } },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Reservation' } },
            },
          },
          '400': { description: 'Validation or DB constraint' },
          '404': { description: 'Room or guest not found' },
          '409': { description: 'Overlapping stay for same room' },
        },
      },
    },
    [EMBEDDED_API_PATH_TEMPLATES.reservationById]: {
      get: {
        tags: ['reservations'],
        summary: 'Get reservation',
        parameters: [{ $ref: '#/components/parameters/ReservationId' }],
        responses: {
          '200': {
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Reservation' } },
            },
            description: 'OK',
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['reservations'],
        summary: 'Update reservation (partial body)',
        parameters: [{ $ref: '#/components/parameters/ReservationId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ReservationPatch' } },
          },
        },
        responses: {
          '200': {
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Reservation' } },
            },
            description: 'OK',
          },
          '400': { description: 'Validation or DB constraint' },
          '404': { description: 'Not found' },
          '409': { description: 'Overlap' },
        },
      },
      delete: {
        tags: ['reservations'],
        summary: 'Delete reservation',
        parameters: [{ $ref: '#/components/parameters/ReservationId' }],
        responses: {
          '204': { description: 'No content' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [EMBEDDED_API_PATHS.reportsFolio]: {
      get: {
        tags: ['reports'],
        summary: 'Guest folio / receipt for one reservation',
        parameters: [
          {
            name: 'reservationId',
            in: 'query',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'Folio payload for print view',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/FolioReport' } },
            },
          },
          '400': { description: 'Validation' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [EMBEDDED_API_PATHS.reportsDaySheet]: {
      get: {
        tags: ['reports'],
        summary: 'Operational day sheet (occupancy on a calendar date)',
        parameters: [
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date', example: '2026-06-01' },
          },
        ],
        responses: {
          '200': {
            description: 'Day sheet lines and occupancy counts',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/DaySheetReport' } },
            },
          },
          '400': { description: 'Validation' },
        },
      },
    },
    [EMBEDDED_API_PATHS.users]: {
      get: {
        tags: ['users'],
        summary: 'List users (Admin)',
        responses: {
          '200': {
            description: 'User array',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/UserAdmin' } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['users'],
        summary: 'Create user (Admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UserAdminCreate' } },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserAdmin' } },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '409': { description: 'Username conflict' },
        },
      },
    },
    [EMBEDDED_API_PATH_TEMPLATES.userById]: {
      patch: {
        tags: ['users'],
        summary: 'Update user (Admin)',
        parameters: [{ $ref: '#/components/parameters/UserId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UserAdminPatch' } },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserAdmin' } },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { description: 'Conflict' },
        },
      },
      delete: {
        tags: ['users'],
        summary: 'Delete user (Admin)',
        parameters: [{ $ref: '#/components/parameters/UserId' }],
        responses: {
          '204': { description: 'No content' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { description: 'Last admin' },
        },
      },
    },
    [EMBEDDED_API_PATH_TEMPLATES.userModules]: {
      get: {
        tags: ['users'],
        summary: 'Get module access for user (Admin)',
        parameters: [{ $ref: '#/components/parameters/UserId' }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserModulesDetail' } },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['users'],
        summary: 'Replace module access for user (Admin)',
        parameters: [{ $ref: '#/components/parameters/UserId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UserModulesPut' } },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserModulesDetail' } },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
  components: {
    ...zodComponents,
    parameters: {
      GuestId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
      RoomId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
      ReservationId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
      UserId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1 },
      },
    },
    responses: {
      NotFound: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'object',
                  properties: {
                    code: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
