import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAppKeyboardShortcuts } from './use-app-keyboard-shortcuts';

const routes = {
  home: '/',
  reservations: '/reservations',
  reports: '/reports',
  guests: '/guests',
  rooms: '/rooms',
  usersAdmin: '/admin/users',
  moduleAccess: '/admin/module-access',
  security: '/account/password',
} as const;

function dispatchKey(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('useAppKeyboardShortcuts', () => {
  it('navigates on F1 and does not fire F5 when not admin', () => {
    const navigate = vi.fn();
    renderHook(() => useAppKeyboardShortcuts(navigate, routes, { isAdmin: false }));

    dispatchKey('F1');
    expect(navigate).toHaveBeenCalledWith('/reservations');

    dispatchKey('F5');
    expect(navigate).not.toHaveBeenCalledWith('/admin/users');
  });

  it('F5 navigates to admin users when isAdmin', () => {
    const navigate = vi.fn();
    renderHook(() => useAppKeyboardShortcuts(navigate, routes, { isAdmin: true }));

    dispatchKey('F5');
    expect(navigate).toHaveBeenCalledWith('/admin/users');
  });

  it('does not handle F7', () => {
    const navigate = vi.fn();
    renderHook(() => useAppKeyboardShortcuts(navigate, routes, { isAdmin: true }));

    dispatchKey('F7');
    expect(navigate).not.toHaveBeenCalledWith('/');
  });
});
