import { describe, expect, it, vi } from 'vitest';
import { createRoomsHttpClient } from './rooms-http-client';

function requestUrl(input: RequestInfo | URL): string {
  return input instanceof Request ? input.url : String(input);
}

function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
}

describe('createRoomsHttpClient', () => {
  it('lists rooms with optional status filter', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(requestUrl(input)).toBe('http://127.0.0.1:1/api/rooms?status=Open');
      return jsonResponse([
        { id: 1, roomNumber: '101', roomType: 'Std', price: 99, status: 'Open' },
      ]);
    });

    const client = createRoomsHttpClient({
      baseUrl: 'http://127.0.0.1:1',
      fetch: fetchMock as typeof fetch,
    });

    const rows = await client.list({ status: 'Open' });
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('Open');
  });

  it('gets room by id', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(requestUrl(input)).toBe('http://127.0.0.1:1/api/rooms/3');
      return jsonResponse({
        id: 3,
        roomNumber: '303',
        roomType: 'Suite',
        price: 200,
        status: 'Occupied',
      });
    });

    const client = createRoomsHttpClient({
      baseUrl: 'http://127.0.0.1:1',
      fetch: fetchMock as typeof fetch,
    });

    const row = await client.get(3);
    expect(row.roomType).toBe('Suite');
  });
});
