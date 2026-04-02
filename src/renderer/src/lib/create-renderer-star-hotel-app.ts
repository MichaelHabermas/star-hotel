import type { StarHotelPreloadAPI } from '@shared/preload-contract';
import type { EmbeddedApiSessionPort } from './embedded-api-session-port';
import { createStarHotelApp, type StarHotelApp } from './star-hotel-app';

/**
 * Renderer wiring for {@link createStarHotelApp} (fetch + optional Bearer). Kept separate from
 * {@link AuthRoot} so tests can build an app without the full provider tree.
 */
export function createRendererStarHotelApp(
  deps: {
    readonly starHotel: StarHotelPreloadAPI;
    readonly fetchImpl?: typeof fetch;
  } & Required<Pick<EmbeddedApiSessionPort, 'getAuthToken'>>,
): StarHotelApp {
  return createStarHotelApp({
    fetch: deps.fetchImpl ?? window.fetch.bind(window),
    starHotel: deps.starHotel,
    getAuthToken: deps.getAuthToken,
  });
}
