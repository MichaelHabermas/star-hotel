import { init as initSentryRenderer } from '@sentry/electron/renderer';
import { init as initSentryReact } from '@sentry/react';
import posthog from 'posthog-js';

let posthogEnabled = false;

/** Sentry renderer + React integration; no-op if `VITE_SENTRY_DSN` is unset. */
export function initRendererSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (typeof dsn !== 'string' || dsn.length === 0) {
    return;
  }
  initSentryRenderer(
    {
      dsn,
      environment: import.meta.env.DEV ? 'development' : 'production',
    },
    initSentryReact,
  );
}

/**
 * PostHog product analytics (T7: session replay off; autocapture off).
 * No-op if `VITE_POSTHOG_KEY` is unset.
 */
export function initPostHog(): void {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (typeof key !== 'string' || key.length === 0) {
    return;
  }
  const apiHost = import.meta.env.VITE_POSTHOG_HOST ?? 'https://app.posthog.com';
  posthog.init(key, {
    api_host: apiHost,
    persistence: 'localStorage',
    autocapture: false,
    disable_session_recording: true,
    capture_pageview: false,
  });
  posthogEnabled = true;
  posthog.capture('app_opened', { surface: 'renderer' });
}

export function capturePostHogNavigation(pathname: string): void {
  if (!posthogEnabled) {
    return;
  }
  posthog.capture('navigation', { pathname });
}

export function capturePostHogWorkflow(
  event: string,
  props?: Record<string, string | number>,
): void {
  if (!posthogEnabled) {
    return;
  }
  posthog.capture(event, props ?? {});
}
