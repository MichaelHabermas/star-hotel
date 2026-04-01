import type { JSX } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@renderer/layout/app-shell'
import { createStarHotelApp } from '@renderer/lib/star-hotel-app'
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider'
import { HomePage } from '@renderer/pages/home-page'
import { devRouteDefinitions, isDevRoutesEnabled } from '@renderer/routes/dev-routes'

const starHotelApp = createStarHotelApp({
  fetch: window.fetch.bind(window),
  starHotel: window.starHotel,
})

export function App(): JSX.Element {
  return (
    <StarHotelAppProvider app={starHotelApp}>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
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
