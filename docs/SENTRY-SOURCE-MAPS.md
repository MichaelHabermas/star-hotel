# Sentry source maps (production)

**Epic E7 / US7.2:** Stack traces in Sentry should resolve to TypeScript sources, not minified bundles.

## Build output

[`electron-vite`](https://electron-vite.org/) emits JavaScript and **source maps** for **main**, **preload**, and **renderer** (`sourcemap: true` in [`electron.vite.config.ts`](../electron.vite.config.ts)).

Artifacts land under `out/` after `pnpm build` (e.g. `out/renderer/assets/*.js` + `.map` siblings).

## Uploading maps to Sentry

1. Create a Sentry release (CLI or `sentry-cli` in CI) matching `SENTRY_RELEASE` / your app version.
2. Run `sentry-cli sourcemaps upload` (or the Vite/Sentry wizard) pointing at `out/` bundles and maps.
3. Set the same **release** string in runtime config (`SENTRY_RELEASE` env for main; align renderer via build-time define if needed).

Do **not** commit source maps to git if they embed paths you consider sensitive; upload from CI and attach to the release only.

## Local verification

With `SENTRY_DSN` / `VITE_SENTRY_DSN` set, trigger a test error (e.g. `throw new Error('sentry test')` in a dev-only route) and confirm the event shows mapped frames in the Sentry UI.
