import type { JSX } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@renderer/layout/app-shell'
import { HomePage } from '@renderer/pages/home-page'
import { devRouteDefinitions, isDevRoutesEnabled } from '@renderer/routes/dev-routes'

export function App(): JSX.Element {
  return (
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
  )
}
