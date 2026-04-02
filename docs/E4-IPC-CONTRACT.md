# Epic E4 — IPC & embedded API contract (PRD matrix)

Authoritative epic text: [PRD.md § Epic E4](./PRD.md). This matrix maps PRD user stories and tasks to implementation for sign-off.

| PRD item | Requirement | Implementation |
| ---------- | ------------- | ---------------- |
| **Epic DoD** | Minimal typed preload; renderer has no Node/fs/sqlite | [`src/preload/index.ts`](../src/preload/index.ts) (`contextBridge.exposeInMainWorld`); Electron [`src/main/window.ts`](../src/main/window.ts) `nodeIntegration: false`, `contextIsolation: true` (see main bootstrap). |
| **Epic DoD** | Bridge calls Express via fetch / structured HTTP client | [`createStarHotelApp`](../src/renderer/src/lib/star-hotel-app.ts) builds [`createReservationsHttpClient`](../src/shared/api/reservations-http-client.ts), [`createGuestsHttpClient`](../src/shared/api/guests-http-client.ts), [`createRoomsHttpClient`](../src/shared/api/rooms-http-client.ts) with `baseUrl` from preload + renderer `fetch`. |
| **Epic DoD** | Types shared from `shared` (DRY) | Zod + clients under [`src/shared/api/`](../src/shared/api/); [`src/shared/preload-contract.ts`](../src/shared/preload-contract.ts); re-exports in [`src/shared/index.ts`](../src/shared/index.ts). |
| **US4.1** | Typed bridge surface; one module for allowed operations | Preload: allowlisted [`IPC_CHANNELS`](../src/shared/ipc/channels.ts) only; domain ops exposed as `StarHotelApp.api.*` (not raw URLs in feature code). |
| **T4.1.1.1** | No eval, arbitrary paths, or shell | **Static review:** preload uses fixed channel `Set` + fixed HTTP path prefixes inside shared clients; no `require`/`import` of Node in renderer bundle; no `child_process` / shell from bridge. |
| **US4.1 DoD** | Optional security notes | This section + architecture overview in [PRD.md § Technical Specifications](./PRD.md#4-technical-specifications). |
| **US4.2** | Renderer API client; map HTTP errors for UI | [`formatEmbeddedApiUserMessage`](../src/shared/api/embedded-http.ts) + [`EmbeddedApiHttpError`](../src/shared/api/embedded-http.ts) (parses server [`ApiErrorBody`](../src/server/http/json-error.ts)); Home smoke shows inline error copy in [`home-page.tsx`](../src/renderer/src/pages/home-page.tsx). |
| **US4.2 DoD** | MVP form data through client only | Feature code must use `useStarHotelApp().api` (see [DECISIONS.md](./DECISIONS.md) renderer contract); Home demonstrates `api.reservations.list`. |

**MVP entity assumption:** Same as [E3-BACKEND-API.md](./E3-BACKEND-API.md) — reservations CRUD via HTTP; guests and rooms read-only for pickers.
