/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public Sentry DSN for renderer (same project as main). */
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
