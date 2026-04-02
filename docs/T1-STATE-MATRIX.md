# T1 — UI state matrix (loading / empty / error / partial)

Deferred item **T1** in [TODOS.md](./TODOS.md): per-screen catalog of **L**oading, **E**mpty, **E**rror, and **P**artial (stale) states.

## Conventions

- **Loading:** in-flight fetch or mutation; prefer accessible `role="status"` and `aria-live="polite"` where appropriate.
- **Empty:** zero rows or no selectable catalog data; short copy + primary action when applicable.
- **Error:** failed request or validation; `role="alert"`; include Retry when safe.
- **Partial:** mixed success (e.g. list ok but reference catalog failed) — surface inline banner, don’t block unrelated data.

## Screens (Epic E8)

| Route | Loading | Empty | Error | Partial |
|-------|---------|-------|-------|---------|
| `/login` | Submit disabled while posting | — | Invalid credentials message | — |
| `/` (hub) | — | — | Perf / list smoke errors in dev card | — |
| `/reservations` | List loading line | No reservations + link to new | List fetch error + Retry | Catalog error banner (guests/rooms) + Retry catalog |
| `/reservations/new`, `/reservations/:id` | Load reservation (edit); catalog loading | No guests/rooms in DB | Catalog error + Retry; submit errors | — |
| `/rooms` | List loading | No rooms + New room | List error + Retry | — |
| `/rooms/new`, `/rooms/:id` | Load room (edit) | — | Load/submit errors | — |
| `/guests` | List loading | No guests + New guest | List error + Retry | — |
| `/guests/new`, `/guests/:id` | Load guest (edit) | — | Load/submit errors | — |
| `/dev/error-test` (dev) | — | — | Intentional throw for boundary | — |

Review against implemented UI after material changes; link from README stays stable.
