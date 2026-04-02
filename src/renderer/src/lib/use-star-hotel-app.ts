import { useContext } from 'react';
import type { StarHotelApp } from './star-hotel-app';
import { StarHotelAppContext } from './star-hotel-app-context';

export function useStarHotelApp(): StarHotelApp {
  const ctx = useContext(StarHotelAppContext);
  if (!ctx) {
    throw new Error('useStarHotelApp must be used within StarHotelAppProvider');
  }
  return ctx;
}
