import type { AuthUserResponse } from '@shared/schemas/auth';
import { authUserResponseSchema } from '@shared/schemas/auth';

export const AUTH_SESSION_TOKEN_KEY = 'star-hotel-session-token';
export const AUTH_SESSION_USER_KEY = 'star-hotel-session-user';

export function readSessionToken(): string | null {
  return sessionStorage.getItem(AUTH_SESSION_TOKEN_KEY);
}

export function writeSessionToken(token: string): void {
  sessionStorage.setItem(AUTH_SESSION_TOKEN_KEY, token);
}

export function clearSessionStorage(): void {
  sessionStorage.removeItem(AUTH_SESSION_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_SESSION_USER_KEY);
}

export function readStoredUser(): AuthUserResponse | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_USER_KEY);
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

export function writeStoredUser(user: AuthUserResponse): void {
  sessionStorage.setItem(AUTH_SESSION_USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  sessionStorage.removeItem(AUTH_SESSION_USER_KEY);
}
