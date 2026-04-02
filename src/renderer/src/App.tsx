import { AppShell } from '@renderer/layout/app-shell';
import { AuthRoot } from '@renderer/lib/auth-context';
import { LoginPage } from '@renderer/pages/login-page';
import { AuthenticatedAppShellRoutes } from '@renderer/routes/authenticated-app-routes';
import { RequireAuth, RequireGuest } from '@renderer/routes/require-auth';
import { capturePostHogNavigation } from '@renderer/telemetry/renderer-telemetry';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';

function PostHogRouteListener(): null {
  const loc = useLocation();
  useEffect(() => {
    capturePostHogNavigation(loc.pathname);
  }, [loc.pathname]);
  return null;
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
              <AuthenticatedAppShellRoutes />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthRoot>
  );
}
