/* eslint-disable react-refresh/only-export-components -- useAuth is intentionally exported next to AuthRoot */
import { createStarHotelApp } from '@renderer/lib/star-hotel-app';
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import { DEFAULT_API_PORT } from '@shared/constants';
import { buildApiBaseUrl } from '@shared/embedded-api-config';
import type { StarHotelPreloadAPI } from '@shared/preload-contract';
import type { JSX, ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SESSION_KEY = 'star-hotel-session-token';

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

export type AuthContextValue = {
  readonly token: string | null;
  setToken: (token: string | null) => void;
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

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (t) {
      sessionStorage.setItem(SESSION_KEY, t);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
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

  const logout = useCallback(async () => {
    try {
      await starHotelApp.api.auth.logout();
    } catch {
      /* still clear local session */
    }
    setToken(null);
  }, [starHotelApp, setToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, setToken, logout }),
    [token, setToken, logout],
  );

  return (
    <StarHotelAppProvider app={starHotelApp}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </StarHotelAppProvider>
  );
}
