import type { JSX, ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@renderer/lib/auth-context'

export function RequireAuth(): JSX.Element {
  const { token } = useAuth()
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export function RequireGuest({ children }: { readonly children: ReactNode }): JSX.Element {
  const { token } = useAuth()
  if (token) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
