# T7 — Telemetry PII policy

**Traceability:** [TODOS.md](TODOS.md) (T7), Epic E7 in [PRD.md](PRD.md).

This document governs **what** we log or send to third parties (Sentry, PostHog) and **how** we avoid leaking guest, staff, or operational PII from the hotel desktop app.

## Principles

1. **Env gating:** No telemetry SDKs initialize without explicit DSNs/keys in environment (see `.env.example`). Production builds must not embed secrets beyond **public** client keys (Sentry DSN, PostHog project key are designed to be public; still treat them as configurable).
2. **Redaction by default:** Structured logs and HTTP access logs **must not** include request/response bodies, query strings with identifiers, or raw SQLite row payloads. Log **route template**, **method**, **status**, **duration**, and **opaque request id** only.
3. **PostHog session replay:** **Disabled** in production for this product (hotel PII risk). Aligns with [AUTOPLAN-Full-Review.md](AUTOPLAN-Full-Review.md) taste decision. If replay is ever enabled, it must be **opt-in** per deployment and documented here.
4. **Sentry:** Capture stack traces and error messages. Scrub **user** context fields that could hold names, emails, or IDs—avoid `Sentry.setUser` with PII unless a dedicated compliance review says otherwise.
5. **Crashpad minidumps:** Native crash uploads go to the configured submit URL (Sentry or Electron); they do not contain application SQL rows but may contain memory artifacts—**do not** enable extra “attachment” uploads of DB files.

## Operational checklist

- [ ] Before enabling analytics in a new environment, confirm `.env` is not committed and CI does not print env.
- [ ] After changing logging middleware, grep for `password`, `Contact`, `Guest`, raw bodies.

## Sample structured log line (Express access)

HTTP requests log **JSON to stdout** (one line per request on `finish`). Example shape (values vary):

```json
{"durationMs":3,"level":"info","message":"http.access","method":"GET","path":"/health","requestId":"550e8400-e29b-41d4-a716-446655440000","service":"embedded-api","statusCode":200,"timestamp":"2026-04-02T12:00:00.000Z"}
```

No query strings, bodies, or row payloads are included (see principles above).

## References

- [PRD § Epic E7](PRD.md) — structured logging + observability DoD.
- Electron [`crashReporter`](https://www.electronjs.org/docs/latest/api/crash-reporter).
- [SENTRY-SOURCE-MAPS.md](./SENTRY-SOURCE-MAPS.md), [CRASH-REPORTING.md](./CRASH-REPORTING.md).
