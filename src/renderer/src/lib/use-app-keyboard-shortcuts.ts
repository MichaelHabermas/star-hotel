import { useEffect } from 'react';
import type { NavigateFunction } from 'react-router-dom';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  return target.isContentEditable;
}

export type AppKeyboardShortcutRoutes = {
  readonly home: string;
  readonly reservations: string;
  readonly reports: string;
  readonly guests: string;
  readonly rooms: string;
  readonly usersAdmin: string;
  readonly moduleAccess: string;
  readonly security: string;
};

export type AppKeyboardShortcutOptions = {
  /** When false, F5/F6 are ignored (non-admins must not navigate to admin routes). */
  readonly isAdmin: boolean;
};

/**
 * Legacy VB6-style navigation: Esc + F1–F8 (F5/F6 admin-only). F7 removed (was duplicate of home).
 * Skips when focus is in an editable field.
 */
export function useAppKeyboardShortcuts(
  navigate: NavigateFunction,
  routes: AppKeyboardShortcutRoutes,
  options: AppKeyboardShortcutOptions,
): void {
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent): void => {
      if (ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey) {
        return;
      }
      if (isTypingTarget(ev.target)) {
        return;
      }

      if (ev.key === 'Escape') {
        ev.preventDefault();
        navigate(routes.home);
        return;
      }

      switch (ev.key) {
        case 'F1':
          ev.preventDefault();
          navigate(routes.reservations);
          break;
        case 'F2':
          ev.preventDefault();
          navigate(routes.reports);
          break;
        case 'F3':
          ev.preventDefault();
          navigate(routes.guests);
          break;
        case 'F4':
          ev.preventDefault();
          navigate(routes.rooms);
          break;
        case 'F5':
          if (!options.isAdmin) {
            return;
          }
          ev.preventDefault();
          navigate(routes.usersAdmin);
          break;
        case 'F6':
          if (!options.isAdmin) {
            return;
          }
          ev.preventDefault();
          navigate(routes.moduleAccess);
          break;
        case 'F8':
          ev.preventDefault();
          navigate(routes.security);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [navigate, routes, options.isAdmin]);
}
