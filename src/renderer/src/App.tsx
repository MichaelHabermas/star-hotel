import type { JSX } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@renderer/layout/app-shell'
import { createStarHotelApp } from '@renderer/lib/star-hotel-app'
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider'
import { HomePage } from '@renderer/pages/home-page'
import { ReservationFormPage } from '@renderer/pages/reservation-form-page'
import { ReservationsListPage } from '@renderer/pages/reservations-list-page'
import { devRouteDefinitions, isDevRoutesEnabled } from '@renderer/routes/dev-routes'
import { DEFAULT_API_PORT } from '@shared/constants'
import { buildApiBaseUrl } from '@shared/embedded-api-config'
import type { StarHotelPreloadAPI } from '@shared/preload-contract'

const BRIDGE_MISSING_ERROR =
  '[star-hotel] preload bridge missing: window.starHotel is undefined. Ensure the app is running via Electron and preload loaded correctly.'

const FALLBACK_STAR_HOTEL_BRIDGE: StarHotelPreloadAPI = {
  platform: 'unknown',
  apiBaseUrl: buildApiBaseUrl(DEFAULT_API_PORT),
  invoke: async (): Promise<never> => {
    throw new Error(
      'Preload bridge unavailable: open the app with Electron (pnpm dev), not the Vite URL alone.',
    )
  },
}

function resolveStarHotelBridge(): StarHotelPreloadAPI {
  const bridge = window.starHotel
  console.info('[renderer] starHotel bridge present', Boolean(bridge))
  if (bridge) {
    return bridge
  }

  // Keep renderer usable even when preload failed to inject.
  // This prevents a hard crash and surfaces an explicit console hint.
  console.error(BRIDGE_MISSING_ERROR)
  return FALLBACK_STAR_HOTEL_BRIDGE
}

const starHotelApp = createStarHotelApp({
  fetch: window.fetch.bind(window),
  starHotel: resolveStarHotelBridge(),
})

export function App(): JSX.Element {
  return (
    <StarHotelAppProvider app={starHotelApp}>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/reservations" element={<ReservationsListPage />} />
            <Route path="/reservations/new" element={<ReservationFormPage mode="create" />} />
            <Route path="/reservations/:reservationId" element={<ReservationFormPage mode="edit" />} />
            {isDevRoutesEnabled
              ? devRouteDefinitions.map(({ path, Page }) => (
                  <Route key={path} path={path} element={<Page />} />
                ))
              : null}
          </Route>
        </Routes>
      </HashRouter>
    </StarHotelAppProvider>
  )
}
