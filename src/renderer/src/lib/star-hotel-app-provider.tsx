import type { JSX, ReactNode } from 'react';
import type { StarHotelApp } from './star-hotel-app';
import { StarHotelAppContext } from './star-hotel-app-context';

export function StarHotelAppProvider({
  app,
  children,
}: {
  app: StarHotelApp;
  children: ReactNode;
}): JSX.Element {
  return <StarHotelAppContext.Provider value={app}>{children}</StarHotelAppContext.Provider>;
}
