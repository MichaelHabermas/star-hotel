import type { StarHotelPreloadAPI } from '@shared/preload-contract';

declare global {
  interface Window {
    readonly starHotel: StarHotelPreloadAPI;
  }
}

export {};
