# Native crash reporting (Crashpad)

**Epic E7 / US7.4:** Electron [`crashReporter`](https://www.electronjs.org/docs/latest/api/crash-reporter) captures native minidumps (V8, native addons such as `better-sqlite3`).

## Configuration

[`src/main/telemetry-main.ts`](../src/main/telemetry-main.ts) calls `crashReporter.start` at main-process startup **before** `app.whenReady()` (required on macOS).

| Mode | Behavior |
| ------ | ---------- |
| **`SENTRY_MINIDUMP_URL` unset** | Crash reports are collected locally; **not** uploaded (`uploadToServer: false`). Useful for dev without a backend. |
| **`SENTRY_MINIDUMP_URL` set** | Minidumps POST to the URL (use the **Minidump endpoint** from your Sentry project’s Client Keys / SDK setup). |

See also [Sentry for Electron — native crashes](https://docs.sentry.io/platforms/javascript/guides/electron/).

## Architecture PDF (E10)

When you author the course **architecture PDF**, include: Crashpad enabled at startup, optional Sentry minidump URL via env, and T7 PII policy ([T7-TELEMETRY-PII.md](./T7-TELEMETRY-PII.md)).
