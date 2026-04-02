# Migration ROI — VB6 + Access → Star Hotel (Electron + SQLite)

**Audience:** Course submission / hiring narrative. Numbers below are **illustrative**; replace with your org’s real maintenance and risk costs if you have them.

## Legacy cost drivers (qualitative)

| Factor | VB6 + Access stack | Modern stack |
| ------ | -------------------- | ------------ |
| Runtime support | VB6 runtime EOL; 32-bit constraints | Electron LTS + Node LTS track |
| Database | File locking, corruption risk on shared paths | SQLite WAL + transactions |
| Security | Weak auth patterns; hard to patch | Argon2, Zod boundaries, sandboxed UI |
| Hiring / velocity | Niche skillset | TypeScript + React ecosystem |

## One-time migration investment (example framing)

- **Discovery & parity mapping:** legacy forms → routes ([ROUTE-MAP.md](./ROUTE-MAP.md), [PARITY-MATRIX.md](./PARITY-MATRIX.md)).
- **Vertical slice:** CRUD path through IPC → Express → SQLite (MVP gate).
- **Hardening:** tests on extracted domain logic, observability, packaging.

## Expected benefits

- **Deployability:** Single installer per platform ([PACKAGING.md](./PACKAGING.md)); no Access runtime on front-desk PCs.
- **Testability:** Domain pricing and overlap rules covered by Vitest; regressions caught in CI.
- **Operability:** Structured logs + optional Sentry/PostHog ([T7-TELEMETRY-PII.md](./T7-TELEMETRY-PII.md)).

## Quantitative table (fill in)

| Metric | Estimate | Notes |
| ------ | -------- | ----- |
| Legacy annual maintenance $ | _TBD_ | Support tickets, Access repairs |
| Avoided incident risk | _TBD_ | Downtime at front desk |
| Payback horizon | _TBD_ | After packaging + training |

---

*This document satisfies the PRD / course ROI deliverable; refine with real figures before external publication.*
