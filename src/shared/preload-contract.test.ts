import { describe, expect, it } from 'vitest';
import { starHotelPreloadBridgeSchema } from './preload-contract';

describe('starHotelPreloadBridgeSchema', () => {
  it('accepts a valid bridge payload', () => {
    const parsed = starHotelPreloadBridgeSchema.parse({
      platform: 'darwin',
      apiBaseUrl: 'http://127.0.0.1:45123',
    });
    expect(parsed.platform).toBe('darwin');
    expect(parsed.apiBaseUrl).toBe('http://127.0.0.1:45123');
  });

  it('rejects missing fields', () => {
    expect(() => starHotelPreloadBridgeSchema.parse({})).toThrow();
  });

  it('rejects invalid api base URL', () => {
    expect(() =>
      starHotelPreloadBridgeSchema.parse({
        platform: 'darwin',
        apiBaseUrl: 'not-a-url',
      }),
    ).toThrow();
  });
});
