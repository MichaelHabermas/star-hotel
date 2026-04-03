import { GlobalErrorBoundary } from '@renderer/components/global-error-boundary';
import { Button } from '@renderer/components/ui/button';
import { useAuth } from '@renderer/lib/auth-context';
import { isStarHotelAdmin } from '@renderer/lib/auth-role';
import { useAppKeyboardShortcuts } from '@renderer/lib/use-app-keyboard-shortcuts';
import { cn } from '@renderer/lib/utils';
import { devRouteDefinitions, isDevRoutesEnabled } from '@renderer/routes/dev-routes';
import { LogOut } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

function LiveClock(): JSX.Element {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time
      className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
      dateTime={now.toISOString()}
    >
      {now.toLocaleString()}
    </time>
  );
}

function navClass({ isActive }: { isActive: boolean }): string {
  const base = 'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors';
  return cn(
    base,
    isActive
      ? 'bg-secondary text-secondary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  );
}

function ModuleNavLink({
  to,
  end,
  label,
  hint,
}: {
  readonly to: string;
  readonly end?: boolean;
  readonly label: string;
  readonly hint: string;
}): JSX.Element {
  const ariaLabel = `${label}, keyboard ${hint}`;
  return (
    <NavLink to={to} end={end} className={navClass} aria-label={ariaLabel} title={ariaLabel}>
      <span className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-muted-foreground font-mono text-[0.65rem] tabular-nums">{hint}</span>
      </span>
    </NavLink>
  );
}

export function AppShell(): JSX.Element {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useMemo(() => isStarHotelAdmin(user), [user]);

  const shortcutRoutes = useMemo(
    () => ({
      home: '/',
      reservations: '/reservations',
      reports: '/reports',
      guests: '/guests',
      rooms: '/rooms',
      usersAdmin: '/admin/users',
      moduleAccess: '/admin/module-access',
      security: '/account/password',
    }),
    [],
  );

  useAppKeyboardShortcuts(navigate, shortcutRoutes, { isAdmin });

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-card border-border shadow-xs border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <NavLink
              to="/"
              end
              className="font-display text-foreground shrink-0 text-lg font-semibold tracking-tight hover:text-primary"
            >
              Star Hotel
            </NavLink>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-1">
              <LiveClock />
              {user ? (
                <span
                  className="text-muted-foreground hidden max-w-[18rem] truncate text-right text-xs sm:block"
                  title={`${user.username} (${user.role})`}
                >
                  <span className="text-foreground font-medium">User ID:</span>{' '}
                  <span className="font-mono">{user.username}</span>
                  <span className="text-muted-foreground"> · </span>
                  <span className="font-mono text-[0.7rem]">{user.role}</span>
                </span>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1.5"
                onClick={() => void logout()}
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </div>

          <nav
            className="border-border/60 font-ui flex flex-wrap gap-1 border-t pt-2"
            aria-label="Primary modules and keyboard shortcuts"
          >
            <ModuleNavLink to="/" end label="Dashboard" hint="Esc" />
            <ModuleNavLink to="/reservations" label="Reservations" hint="F1" />
            <ModuleNavLink to="/rooms" label="Rooms" hint="F4" />
            <ModuleNavLink to="/guests" label="Guests" hint="F3" />
            <ModuleNavLink to="/reports" label="Reports" hint="F2" />
            <ModuleNavLink to="/account/password" label="Password" hint="F8" />
            {isAdmin ? (
              <>
                <ModuleNavLink to="/admin/users" label="Users" hint="F5" />
                <ModuleNavLink to="/admin/module-access" label="Access" hint="F6" />
              </>
            ) : null}
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
  );
}
