import type { JSX } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { GlobalErrorBoundary } from '@renderer/components/global-error-boundary'
import { useAuth } from '@renderer/lib/auth-context'
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
  const { logout } = useAuth()
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
            <NavLink to="/rooms" className={navClass}>
              Rooms
            </NavLink>
            <NavLink to="/guests" className={navClass}>
              Guests
            </NavLink>
            {isDevRoutesEnabled
              ? devRouteDefinitions.map(({ path, label }) => (
                  <NavLink key={path} to={path} className={navClass}>
                    {label}
                  </NavLink>
                ))
              : null}
          </nav>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground shrink-0 gap-1.5"
            onClick={() => void logout()}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
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
