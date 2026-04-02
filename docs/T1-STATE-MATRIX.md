# T1 — UI state matrix (loading / empty / error / partial)

**Epic E8 / US8.6.** Catalog of primary screens and how they behave under async and failure conditions. **Authority:** [TODOS.md](./TODOS.md) T1; implementation routes in [App.tsx](../src/renderer/src/App.tsx).

**Partial** means some reference data loaded while other requests are still in flight or failed (e.g. list loads but guest/room catalog failed).

| Screen / route | Loading | Empty | Error | Partial |
| ---------------- | --------- | ------- | ------- | --------- |
| `/login` | Sign-in button shows “Signing in…” while request runs | N/A (form always visible) | Inline alert with API message on failed login | N/A |
| `/` (Operations hub) | Perf smoke buttons show loading while each probe runs | N/A | Perf / reservation smoke errors shown in card | N/A |
| `/reservations` | “Loading reservations…” (`aria-live`) | “No reservations yet” + CTA | Banner with message + Retry | Catalog error banner + Retry catalog; list may still show if reservations loaded |
| `/reservations/new`, `/reservations/:id` | “Loading reservation…” (edit) | N/A | Load error + Retry / Back; submit error under form | Catalog error for guest/room pickers + Retry |
| `/rooms` | “Loading rooms…” | “No rooms yet” + CTA | Message + Retry | N/A |
| `/rooms/new`, `/rooms/:id` | “Loading room…” (edit) | N/A | Load/submit errors with Retry where applicable | N/A |
| `/guests` | “Loading guests…” | “No guests yet” + CTA | Message + Retry | N/A |
| `/guests/new`, `/guests/:id` | “Loading guest…” (edit) | N/A | Load/submit errors with Retry where applicable | N/A |
| App shell (all authenticated routes) | User label hidden until `GET /api/auth/me` completes if only token was restored | N/A | Failed `me()` clears session and returns user to login | Username + role shown after login or successful `me` |

**Delete dialogs:** destructive errors appear inline in the dialog (`role="alert"`); cancel remains available.

**Dev-only routes** (`#/dev/*` when `import.meta.env.DEV`): follow the same pattern as other pages (loading/error where applicable).

**Review:** Revisit this matrix when adding E9 reports or new modules.
