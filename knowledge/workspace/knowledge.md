# workspace — facts and patterns

Facts and patterns about how this repository is structured and operated: Electron main vs renderer boundaries, typed preload IPC, dev commands, and similar cross-cutting topics.

- Epic E7: structured HTTP logging (`embedded-api` Winston JSON, no bodies); Sentry main (`SENTRY_DSN`) + renderer (`VITE_SENTRY_DSN` + `@sentry/react`); PostHog env-gated with session replay off; `crashReporter` in `telemetry-main.ts`; `.env` from project root via `dotenv/config` in main only—renderer uses `VITE_*` via Vite.
