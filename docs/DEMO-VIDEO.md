# Demo video (course submission)

**Target length:** 3–5 minutes. **Requirement (spec):** show **legacy vs modern** (split screen or cut between VB6/Access and Star Hotel).

## Before you record

1. **Legacy side:** Capture the old VB6 + Access UI (screen recording or stills) if you still have it; otherwise use slides with screenshots from the migration doc ([PRE-SEARCH.md](./PRE-SEARCH.md)) and label them clearly.
2. **Modern side:** Run a **production** or **preview** build (`pnpm preview` or the packaged app from `pnpm dist`) so evaluators see real performance, not dev HMR.
3. **Data:** Use seeded rooms/guests/reservations so flows are instant and credible.

## Suggested storyboard

| Time | Shot |
| ---- | ---- |
| 0:00 | Title: project name + one-line goal (secure desktop replacement). |
| 0:30 | Legacy: cramped Access-style form or VB6 module (or static image). |
| 1:00 | Modern: login → dashboard shell ([STYLE-GUIDE.md](./STYLE-GUIDE.md) Lakeside / Night Audit). |
| 1:30 | **Reservations:** create or edit a stay; show pricing total from domain logic. |
| 2:30 | **Reports:** open guest folio or day sheet; print preview. |
| 3:30 | **Architecture one-liner:** Electron + Express + SQLite + typed IPC (point at README diagram / [ARCHITECTURE-SUBMISSION.md](./ARCHITECTURE-SUBMISSION.md)). |
| 4:00 | Closing: packaging (`pnpm dist`) and CI packaging smoke ([PACKAGING.md](./PACKAGING.md)). |

## Publishing

- Host as **unlisted** YouTube (or course-approved host).
- **Replace the placeholder** in the table below and in [README.md](../README.md) when the link is final.

| Field | Value |
| ----- | ----- |
| Video URL | _Add your link here_ |
| Recorded date | _YYYY-MM-DD_ |
