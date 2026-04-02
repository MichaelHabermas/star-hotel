import { DEFAULT_API_PORT } from '@shared/constants';
import { buildApiBaseUrl } from '@shared/embedded-api-config';
import type { StarHotelPreloadAPI } from '@shared/preload-contract';

const FALLBACK_BRIDGE: StarHotelPreloadAPI = {
  platform: 'unknown',
  apiBaseUrl: buildApiBaseUrl(DEFAULT_API_PORT),
  invoke: async (): Promise<never> => {
    throw new Error(
      'Preload bridge unavailable: open the app with Electron (pnpm dev), not the Vite URL alone.',
    );
  },
};

/** Resolves `window.starHotel` for renderer API + IPC; falls back when running outside Electron. */
export function resolveStarHotelBridge(): StarHotelPreloadAPI {
  // eslint-disable-next-line no-restricted-syntax -- single preload resolver (same contract as bootstrap)
  const bridge = window.starHotel;
  console.info('[renderer] starHotel bridge present', Boolean(bridge));
  if (bridge) {
    return bridge;
  }
  console.error(
    '[star-hotel] preload bridge missing: window.starHotel is undefined. Ensure the app is running via Electron and preload loaded correctly.',
  );
  return FALLBACK_BRIDGE;
}
