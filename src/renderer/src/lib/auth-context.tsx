/* eslint-disable react-refresh/only-export-components -- useAuth is intentionally exported next to AuthRoot */
import { createStarHotelApp } from '@renderer/lib/star-hotel-app';
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import { DEFAULT_API_PORT } from '@shared/constants';
import { buildApiBaseUrl } from '@shared/embedded-api-config';
import type { StarHotelPreloadAPI } from '@shared/preload-contract';
import type { AuthUserResponse } from '@shared/schemas/auth';
import { authUserResponseSchema } from '@shared/schemas/auth';
import type { JSX, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SESSION_KEY = 'star-hotel-session-token';
const SESSION_USER_KEY = 'star-hotel-session-user';

const FALLBACK_BRIDGE: StarHotelPreloadAPI = {
  platform: 'unknown',
  apiBaseUrl: buildApiBaseUrl(DEFAULT_API_PORT),
  invoke: async (): Promise<never> => {
    throw new Error(
      'Preload bridge unavailable: open the app with Electron (pnpm dev), not the Vite URL alone.',
    );
  },
};

function resolveStarHotelBridge(): StarHotelPreloadAPI {
  // eslint-disable-next-line no-restricted-syntax -- single preload resolver for AuthRoot (same contract as bootstrap)
  const bridge = window.starHotel;
  console.info('[renderer] starHotel bridge present', Boolean(bridge));
  if (bridge) {
    return bridge;
  }
  console.error(
    '[star-hotel] preload bridge missing: window.starHotel is undefined. Ensure the app is running via Electron and preload loaded correctly.',
  );
  return FALLBACK_BRIDGE;
}

function readStoredUser(): AuthUserResponse | null {
  try {
    const raw = sessionStorage.getItem(SESSION_USER_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    const r = authUserResponseSchema.safeParse(parsed);
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

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
  const [token, setTokenState] = useState<string | null>(() => sessionStorage.getItem(SESSION_KEY));
  const [user, setUserState] = useState<AuthUserResponse | null>(() => readStoredUser());

  const setToken = useCallback((t: string | null, sessionUser?: AuthUserResponse | null) => {
    setTokenState(t);
    if (t) {
      sessionStorage.setItem(SESSION_KEY, t);
      if (sessionUser !== undefined) {
        setUserState(sessionUser);
        if (sessionUser) {
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(sessionUser));
        } else {
          sessionStorage.removeItem(SESSION_USER_KEY);
        }
      }
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
      setUserState(null);
    }
  }, []);

  const starHotelApp = useMemo(
    () =>
      createStarHotelApp({
        fetch: window.fetch.bind(window),
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
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(u));
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
