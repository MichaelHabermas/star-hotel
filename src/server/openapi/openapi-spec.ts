/**
 * OpenAPI 3 description of the loopback embedded API (see README — default port 45123).
 * Served at GET /api/openapi.json; Swagger UI at GET /api/docs.
 *
 * **`paths` keys** must match `EMBEDDED_OPENAPI_DOCUMENTED_PATHS` in `@shared/api/embedded-api-paths`
 * (see `openapi-documented-paths.test.ts`).
 */
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
  ],
  paths: {
    '/health': {
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
    '/api/auth/login': {
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
                  required: ['token', 'user'],
                  properties: {
                    token: { type: 'string' },
                    user: {
                      type: 'object',
                      required: ['id', 'username', 'role'],
                      properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        role: { type: 'string' },
                      },
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
    '/api/auth/logout': {
      post: {
        tags: ['auth'],
        summary: 'Logout (invalidate server session)',
        responses: {
          '204': { description: 'No content' },
        },
      },
    },
    '/api/auth/me': {
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
                  required: ['user'],
                  properties: {
                    user: {
                      type: 'object',
                      required: ['id', 'username', 'role'],
                      properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        role: { type: 'string' },
                      },
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
    '/api/guests': {
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
    '/api/guests/{id}': {
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
    '/api/rooms': {
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
    '/api/rooms/{id}': {
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
    '/api/reservations': {
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
    '/api/reservations/{id}': {
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
  },
  components: {
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
    },
    schemas: {
      Guest: {
        type: 'object',
        required: ['id', 'name', 'idNumber', 'contact'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          idNumber: { type: 'string', nullable: true },
          contact: { type: 'string', nullable: true },
        },
      },
      GuestCreate: {
        type: 'object',
        required: ['name'],
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          idNumber: { type: 'string', nullable: true },
          contact: { type: 'string', nullable: true },
        },
      },
      GuestPatch: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          idNumber: { type: 'string', nullable: true },
          contact: { type: 'string', nullable: true },
        },
      },
      Room: {
        type: 'object',
        required: ['id', 'roomType', 'price', 'status'],
        properties: {
          id: { type: 'integer' },
          roomType: { type: 'string' },
          price: { type: 'number' },
          status: { type: 'string' },
        },
      },
      RoomCreate: {
        type: 'object',
        required: ['roomType', 'price', 'status'],
        additionalProperties: false,
        properties: {
          roomType: { type: 'string' },
          price: { type: 'number', minimum: 0 },
          status: { type: 'string' },
        },
      },
      RoomPatch: {
        type: 'object',
        additionalProperties: false,
        properties: {
          roomType: { type: 'string' },
          price: { type: 'number', minimum: 0 },
          status: { type: 'string' },
        },
      },
      Reservation: {
        type: 'object',
        required: ['id', 'roomId', 'guestId', 'checkInDate', 'checkOutDate', 'totalAmount'],
        properties: {
          id: { type: 'integer' },
          roomId: { type: 'integer' },
          guestId: { type: 'integer' },
          checkInDate: { type: 'string', format: 'date', example: '2026-06-01' },
          checkOutDate: { type: 'string', format: 'date', example: '2026-06-04' },
          totalAmount: { type: 'number' },
        },
      },
      ReservationCreate: {
        type: 'object',
        required: ['roomId', 'guestId', 'checkInDate', 'checkOutDate'],
        additionalProperties: false,
        properties: {
          roomId: { type: 'integer', minimum: 1 },
          guestId: { type: 'integer', minimum: 1 },
          checkInDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          checkOutDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        },
      },
      ReservationPatch: {
        type: 'object',
        additionalProperties: false,
        properties: {
          roomId: { type: 'integer', minimum: 1 },
          guestId: { type: 'integer', minimum: 1 },
          checkInDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          checkOutDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        },
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
