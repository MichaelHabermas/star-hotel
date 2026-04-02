/* eslint-disable react-refresh/only-export-components -- useAuth is intentionally exported next to AuthRoot */
import {
  clearSessionStorage,
  clearStoredUser,
  readSessionToken,
  readStoredUser,
  writeSessionToken,
  writeStoredUser,
} from '@renderer/lib/auth-session-storage';
import { createRendererStarHotelApp } from '@renderer/lib/create-renderer-star-hotel-app';
import { resolveStarHotelBridge } from '@renderer/lib/preload-bridge';
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import type { AuthUserResponse } from '@shared/schemas/auth';
import type { JSX, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AuthContextValue = {
  readonly token: string | null;
  readonly user: AuthUserResponse | null;
  /** Persists token; pass `user` from login response so role/username are available without an extra round-trip. */
  setToken: (token: string | null, user?: AuthUserResponse | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const v = useContext(AuthContext);
  if (!v) {
    throw new Error('useAuth must be used within AuthRoot');
  }
  return v;
}

export function AuthRoot({ children }: { readonly children: ReactNode }): JSX.Element {
  const [token, setTokenState] = useState<string | null>(() => readSessionToken());
  const [user, setUserState] = useState<AuthUserResponse | null>(() => readStoredUser());

  const setToken = useCallback((t: string | null, sessionUser?: AuthUserResponse | null) => {
    setTokenState(t);
    if (t) {
      writeSessionToken(t);
      if (sessionUser !== undefined) {
        setUserState(sessionUser);
        if (sessionUser) {
          writeStoredUser(sessionUser);
        } else {
          clearStoredUser();
        }
      }
    } else {
      clearSessionStorage();
      setUserState(null);
    }
  }, []);

  const starHotelApp = useMemo(
    () =>
      createRendererStarHotelApp({
        starHotel: resolveStarHotelBridge(),
        getAuthToken: () => token,
      }),
    [token],
  );

  useEffect(() => {
    if (!token || user) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { user: u } = await starHotelApp.api.auth.me();
        if (!cancelled) {
          setUserState(u);
          writeStoredUser(u);
        }
      } catch {
        if (!cancelled) {
          setToken(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user, starHotelApp, setToken]);

  const logout = useCallback(async () => {
    try {
      await starHotelApp.api.auth.logout();
    } catch {
      /* still clear local session */
    }
    setToken(null);
  }, [starHotelApp, setToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, setToken, logout }),
    [token, user, setToken, logout],
  );

  return (
    <StarHotelAppProvider app={starHotelApp}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </StarHotelAppProvider>
  );
}
