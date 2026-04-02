import type { StarHotelPreloadAPI } from '@shared/preload-contract';
import { createStarHotelApp, type StarHotelApp } from './star-hotel-app';

/**
 * Renderer wiring for {@link createStarHotelApp} (fetch + optional Bearer). Kept separate from
 * {@link AuthRoot} so tests can build an app without the full provider tree.
 */
export function createRendererStarHotelApp(deps: {
  readonly starHotel: StarHotelPreloadAPI;
  readonly getAuthToken: () => string | null | undefined;
  readonly fetchImpl?: typeof fetch;
}): StarHotelApp {
  return createStarHotelApp({
    fetch: deps.fetchImpl ?? window.fetch.bind(window),
    starHotel: deps.starHotel,
    getAuthToken: deps.getAuthToken,
  });
}
