import { createContext } from 'react'
import type { StarHotelApp } from './star-hotel-app'

export const StarHotelAppContext = createContext<StarHotelApp | null>(null)
