import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTH_SESSION_TOKEN_KEY,
  AUTH_SESSION_USER_KEY,
  clearSessionStorage,
  readSessionToken,
  readStoredUser,
  writeSessionToken,
  writeStoredUser,
} from './auth-session-storage';

beforeEach(() => {
  sessionStorage.clear();
});

describe('auth-session-storage', () => {
  it('round-trips token', () => {
    expect(readSessionToken()).toBeNull();
    writeSessionToken('abc');
    expect(sessionStorage.getItem(AUTH_SESSION_TOKEN_KEY)).toBe('abc');
    expect(readSessionToken()).toBe('abc');
  });

  it('clearSessionStorage removes token and user', () => {
    writeSessionToken('t');
    writeStoredUser({ id: 1, username: 'a', role: 'Admin' });
    clearSessionStorage();
    expect(sessionStorage.getItem(AUTH_SESSION_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(AUTH_SESSION_USER_KEY)).toBeNull();
  });

  it('readStoredUser returns null for invalid JSON', () => {
    sessionStorage.setItem(AUTH_SESSION_USER_KEY, 'not-json');
    expect(readStoredUser()).toBeNull();
  });
});
