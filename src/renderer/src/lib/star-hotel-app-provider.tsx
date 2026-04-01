import type { JSX, ReactNode } from 'react'
import { StarHotelAppContext } from './star-hotel-app-context'
import type { StarHotelApp } from './star-hotel-app'

export function StarHotelAppProvider({
  app,
  children,
}: {
  app: StarHotelApp
  children: ReactNode
}): JSX.Element {
  return <StarHotelAppContext.Provider value={app}>{children}</StarHotelAppContext.Provider>
}
