# Epic E9 — Reports parity & scope (T5)

Authoritative scope: [DECISIONS.md — T5](./DECISIONS.md#t5--report-scope-contract-e9). This document satisfies PRD Epic E9 Definition of Done: *matches agreed parity list* for the minimum T5 deliverables.

## US9.1 — Report data API

| Requirement | Implementation |
|-------------|----------------|
| Queries encapsulated in a report service (DRY with E3 patterns) | [`ReportService`](../src/server/reports/report-service.ts) orchestrates reads; SQL only in [`ReportRepository`](../src/server/reports/report-repository.ts). |
| No renderer SQL | React pages call [`createReportsHttpClient`](../src/shared/api/reports-http-client.ts) → `GET /api/reports/folio`, `GET /api/reports/day-sheet`. |
| Zod at boundary | Query/response shapes in [`shared/schemas/report.ts`](../src/shared/schemas/report.ts); routes parse in [`report-router.ts`](../src/server/reports/report-router.ts). |
| Tests | [`create-app.reports.test.ts`](../src/server/create-app.reports.test.ts), [`report-service.test.ts`](../src/server/reports/report-service.test.ts). |

## US9.2 — Guest folio / receipt & operational summary

| T5 minimum | Modern surface | Parity / gap |
|------------|----------------|--------------|
| Guest folio / receipt — print-friendly HTML | Route `/reports/folio/:reservationId`; API `GET /api/reports/folio?reservationId=` | **Signed off** for T5: stay, guest, room, total; print via **Print** → `window.print()` (see below for PDF). |
| One operational summary (e.g. day sheet) — HTML print | Route `/reports/day-sheet`; API `GET /api/reports/day-sheet?date=` | **Signed off** for T5: occupancy summary + line table for stays active on the selected date (half-open stay rule documented on page). |

**Gaps (explicit, out of T5 minimum):** Crystal Reports feature parity (grouping engine, subreports, `.rpt` reuse) is **out of scope** per T5. Legacy P2smon/Crystal behavior is not replicated one-for-one.

## US9.3 — Grouped / financial reports

**N/A** for this codebase’s minimum E9 closure. Full grouped financials (e.g. multi-period revenue by room type) are **not** a first-class deliverable per [DECISIONS.md — T5](./DECISIONS.md#t5--report-scope-contract-e9). A phased stretch is documented there only if schedule allows and that section is referenced before implementation.

## Optional PDF (T5)

T5 lists PDF as **optional** alongside print-friendly HTML. This project does **not** ship a separate PDF binary generator. **Browser print to PDF** (Print → Save as PDF / Microsoft Print to PDF) against the same HTML views satisfies the optional PDF line item for course/evaluator purposes. No additional dependency is required for minimum DoD.

## Legacy mapping (high level)

| Legacy | Modern |
|--------|--------|
| Crystal guest / folio style output | Folio print view + JSON from Express |
| Operational day / occupancy style listing | Day sheet print view + JSON from Express |

See also [PARITY-MATRIX.md](./PARITY-MATRIX.md).
