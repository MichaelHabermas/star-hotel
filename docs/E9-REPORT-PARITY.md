# Epic E9 — Report parity and gaps

This document satisfies PRD Epic E9 (“matches agreed parity list”) together with [DECISIONS.md](./DECISIONS.md) section **T5** (report scope contract).

## Implemented (T5 minimum)

| Legacy intent | Modern artifact | Notes |
| --- | --- | --- |
| Guest folio / receipt | `GET /api/reports/folio?reservationId=` + [Folio](../src/renderer/src/pages/folio-report-page.tsx) print view | Print-friendly HTML; data from Express report service only (no renderer SQL). |
| Operational summary (front desk) | `GET /api/reports/day-sheet?date=` + [Day sheet](../src/renderer/src/pages/day-sheet-report-page.tsx) | HTML print; occupancy = count of stays active on the date using half-open `[check-in, check-out)` logic consistent with reservations. |

## US9.3 — Grouped / financial reports

**Status: N/A** for first-class grouped financials per [DECISIONS.md](./DECISIONS.md#t5--report-scope-contract-e9): full grouped financials (e.g. multi-period revenue by room type) are **out of scope** unless activated as an optional P2 stretch after the folio ships. This repo does not implement that stretch unless product explicitly re-opens T5.

## PDF

**Deferred:** Server-generated PDF libraries are not bundled. Users can **Print → Save as PDF** from the browser/Electron print dialog for the same HTML views. Adding a dedicated PDF pipeline is optional post-MVP (see PRD Epic E9 optional PDF).

## Crystal Reports / P2smon.dll

No Crystal runtime, `.rpt` reuse, or grouping engine — explicitly out of scope per T5.
