import type { JSX } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { GlobalErrorBoundary } from '@renderer/components/global-error-boundary'
import { cn } from '@renderer/lib/utils'
import { devRouteDefinitions, isDevRoutesEnabled } from '@renderer/routes/dev-routes'

function navClass({ isActive }: { isActive: boolean }): string {
  const base = 'rounded-md px-3 py-2 text-sm font-medium transition-colors'

  return cn(
    base,
    isActive
      ? 'bg-secondary text-secondary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )
}

export function AppShell(): JSX.Element {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-card border-border shadow-xs border-b">
        <div className="mx-auto flex max-w-5xl items-center gap-8 px-4 py-3 md:px-6">
          <span className="font-display text-foreground text-lg font-semibold tracking-tight">
            Star Hotel
          </span>
          <nav className="font-ui flex flex-1 gap-1" aria-label="Primary">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/reservations" className={navClass}>
              Reservations
            </NavLink>
            {isDevRoutesEnabled
              ? devRouteDefinitions.map(({ path, label }) => (
                  <NavLink key={path} to={path} className={navClass}>
                    {label}
                  </NavLink>
                ))
              : null}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <GlobalErrorBoundary>
          <Outlet />
        </GlobalErrorBoundary>
      </main>
    </div>
  )
}
