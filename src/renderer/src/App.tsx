import type { JSX } from 'react'
import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthRoot } from '@renderer/lib/auth-context'
import { AppShell } from '@renderer/layout/app-shell'
import { GuestFormPage } from '@renderer/pages/guest-form-page'
import { GuestsListPage } from '@renderer/pages/guests-list-page'
import { HomePage } from '@renderer/pages/home-page'
import { LoginPage } from '@renderer/pages/login-page'
import { ReservationFormPage } from '@renderer/pages/reservation-form-page'
import { ReservationsListPage } from '@renderer/pages/reservations-list-page'
import { RoomFormPage } from '@renderer/pages/room-form-page'
import { RoomsListPage } from '@renderer/pages/rooms-list-page'
import { RequireAuth, RequireGuest } from '@renderer/routes/require-auth'
import { devRouteDefinitions, isDevRoutesEnabled } from '@renderer/routes/dev-routes'
import { capturePostHogNavigation } from '@renderer/telemetry/renderer-telemetry'

function PostHogRouteListener(): null {
  const loc = useLocation()
  useEffect(() => {
    capturePostHogNavigation(loc.pathname)
  }, [loc.pathname])
  return null
}

export function App(): JSX.Element {
  return (
    <AuthRoot>
      <HashRouter>
        <PostHogRouteListener />
        <Routes>
          <Route
            path="/login"
            element={
              <RequireGuest>
                <LoginPage />
              </RequireGuest>
            }
          />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/reservations" element={<ReservationsListPage />} />
              <Route path="/reservations/new" element={<ReservationFormPage mode="create" />} />
              <Route path="/reservations/:reservationId" element={<ReservationFormPage mode="edit" />} />
              <Route path="/rooms" element={<RoomsListPage />} />
              <Route path="/rooms/new" element={<RoomFormPage mode="create" />} />
              <Route path="/rooms/:roomId" element={<RoomFormPage mode="edit" />} />
              <Route path="/guests" element={<GuestsListPage />} />
              <Route path="/guests/new" element={<GuestFormPage mode="create" />} />
              <Route path="/guests/:guestId" element={<GuestFormPage mode="edit" />} />
              {isDevRoutesEnabled
                ? devRouteDefinitions.map(({ path, Page }) => (
                    <Route key={path} path={path} element={<Page />} />
                  ))
                : null}
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthRoot>
  )
}
