import { useAuth } from '@renderer/lib/auth-context';
import type { JSX, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function RequireAuth(): JSX.Element {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireGuest({ children }: { readonly children: ReactNode }): JSX.Element {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export function RequireAdmin(): JSX.Element {
  const { user } = useAuth();
  if (!user || user.role.trim().toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
