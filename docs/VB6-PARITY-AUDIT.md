# VB6 Parity Audit

Date: 2026-04-03
Status: First-pass audit
Purpose: Establish an honest baseline for how closely the current Electron app matches the legacy VB6 Star Hotel application on its highest-value front-desk screens

## Scope

This audit covers the first four high-priority surfaces named in the parity recovery plan:

- Dashboard / room board
- Booking / reservations / check-in
- Room maintenance
- Guest find and guest maintenance

This document is intentionally stricter than the existing parity matrices. A route or CRUD path does not count as parity by itself.

## Method

This first-pass audit uses the following evidence:

### Legacy evidence

- [PRE-SEARCH.md](./PRE-SEARCH.md)
- [ROUTE-MAP.md](./ROUTE-MAP.md)
- [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md)
- [E5-FORM-PARITY-MAP.md](./E5-FORM-PARITY-MAP.md)
- the project requirement in [VB6-Hotel-App-Modernization-Project-specs.md](./VB6-Hotel-App-Modernization-Project-specs.md)

### Current implementation evidence

- [home-page.tsx](../src/renderer/src/pages/home-page.tsx)
- [room-dashboard.tsx](../src/renderer/src/features/dashboard/room-dashboard.tsx)
- [app-shell.tsx](../src/renderer/src/layout/app-shell.tsx)
- [reservations-list-page.tsx](../src/renderer/src/pages/reservations-list-page.tsx)
- [reservation-form-page.tsx](../src/renderer/src/pages/reservation-form-page.tsx)
- [rooms-list-page.tsx](../src/renderer/src/pages/rooms-list-page.tsx)
- [room-form-page.tsx](../src/renderer/src/pages/room-form-page.tsx)
- [guests-list-page.tsx](../src/renderer/src/pages/guests-list-page.tsx)
- [guest-form-page.tsx](../src/renderer/src/pages/guest-form-page.tsx)

## Scoring Model

- `Match`: close enough that a legacy operator should recognize and use it immediately
- `Modernized but faithful`: visibly modernized, but same task model and information order
- `Drifted`: function exists, but the screen shape or interaction meaning changed materially
- `Missing`: not implemented or not evidenced strongly enough to claim parity

## Important Limit

This audit is honest about uncertainty.

In several places the repo’s existing docs describe the VB6 forms, but do not yet embed the actual legacy screenshots or full control inventories. Where direct legacy `.frm` or `Preview/` evidence is not present in this repo, the audit explicitly says `inferred` instead of pretending certainty.

## Executive Summary

### Overall status

- Dashboard / room board: `Drifted`
- Booking / reservations / check-in: `Drifted`
- Room maintenance: `Drifted`
- Guest find / guest maintenance: `Drifted`

### Main pattern

The app currently has substantial entity and route coverage, but most of the operator-facing UI has been implemented as modern route-per-resource CRUD pages rather than as a close remake of the legacy front-desk system.

### Biggest issues

- The dashboard is only partially faithful and not clearly operational.
- The reservation form preserves the data path but not the likely legacy task structure.
- Room and guest screens read like generic admin pages rather than legacy hotel-maintenance surfaces.
- Existing parity documents overstate completion by scoring route existence and partial control coverage as broader parity.

## Screen Audit

## 1. Dashboard / Room Board

### Legacy target

Source:

- [ROUTE-MAP.md](./ROUTE-MAP.md) maps `frmDashboard` to the main room board plus toolbar and explicitly calls out level grid, legend, and F-key behavior.
- [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md) identifies `frmDashboard` as the main room board.
- [PRE-SEARCH.md](./PRE-SEARCH.md) says `Preview/` assets should be used as high-fidelity reference for layout and state logic.

### Current implementation

Current surface:

- [home-page.tsx](../src/renderer/src/pages/home-page.tsx)
- [room-dashboard.tsx](../src/renderer/src/features/dashboard/room-dashboard.tsx)
- [app-shell.tsx](../src/renderer/src/layout/app-shell.tsx)

Observed behavior:

- The main page shows a room board title and descriptive copy.
- The board renders four levels with eleven columns.
- A status summary strip is present.
- Keyboard shortcut hints are visible in the shell header.
- In dev mode, the home page also includes developer smoke tools and performance controls.
- Room cells are rendered as visual blocks only. They do not navigate, open detail, or trigger an obvious operator action.
- Board population depends on room numbers matching a strict `^[1-4][0-9][0-9]$` pattern.

### What matches

- Presence of a main board-style surface
- Four-level descending layout
- Room status legend/count concept
- Keyboard-oriented module navigation

### What drifts

- The screen still feels like a modern shell page instead of the old command surface.
- The board is mostly visual and passive rather than clearly operational.
- The fixed board parsing rule may be implementation-driven rather than legacy-driven.
- Dev-only content sits on the primary operator route in development.
- The dashboard is framed partly as a “hub,” which suggests reinterpretation rather than direct remake.

### Parity score

`Drifted`

### Why this is not a Match

The current board captures some of the old geometry and legend semantics, but not enough of the screen’s operational role. The legacy dashboard was the main working surface, not just a static overview.

### Required corrections

- Verify the real legacy board behavior from `frmDashboard` and any preview image.
- Confirm whether empty slots were fixed in the old board or whether only actual rooms appeared.
- Make room cells do something concrete if the old board supported direct action.
- Remove dev-only controls from the operator surface.
- Rework the top-of-screen framing so the dashboard feels like the old front-desk entry point rather than a modern app landing page.

## 2. Booking / Reservations / Check-In

### Legacy target

Source:

- [ROUTE-MAP.md](./ROUTE-MAP.md) maps `frmCheckIn.frm` or the reservation UI to `/reservations`.
- [E5-FORM-PARITY-MAP.md](./E5-FORM-PARITY-MAP.md) identifies the reservations flow as the chosen MVP parity slice.
- [PRE-SEARCH.md](./PRE-SEARCH.md) identifies reservation records plus `modLogic.bas` rate logic as mission-critical.
- [STYLE-GUIDE.md](./STYLE-GUIDE.md) calls reservations/check-in the reference screen for the visual system, but that style guidance must remain subordinate to actual legacy structure.

### Current implementation

Current surface:

- [reservations-list-page.tsx](../src/renderer/src/pages/reservations-list-page.tsx)
- [reservation-form-page.tsx](../src/renderer/src/pages/reservation-form-page.tsx)

Observed behavior:

- Reservation list exists with guest, room, dates, total, edit, and delete actions.
- Create/edit form captures guest, room, check-in date, and check-out date.
- Total preview exists for create mode.
- Edit mode shows current total and allows delete.
- Folio link is exposed from edit mode.

### What matches

- Core reservation entity exists end to end.
- Guest-room-date-total model is present.
- Total calculation is backed by ported domain logic.
- CRUD path exists.

### What drifts

- The form layout is a narrow modern CRUD card, not an operator-oriented check-in surface.
- The likely legacy task sequence is not strongly expressed in the page shape.
- Guest and room selection feel like abstract dropdown selection rather than hotel workflow.
- The reservation list may not be the right primary interaction surface if the old system centered the booking flow differently.
- Existing style guidance introduced concepts like notes and confidence areas, but the current screen does not show strong evidence of legacy-specific grouping either.

### Parity score

`Drifted`

### Why this is not a Match

The modern app preserves the reservation data model and server logic, but not yet the legacy screen character. A legacy operator may understand what the form does, but the page would not feel like “the same booking screen in a newer UI.”

### Required corrections

- Verify the exact field order, grouping, and buttons from the legacy booking form.
- Decide whether booking should begin from dashboard context, from a list, or from a dedicated form, based on legacy evidence.
- Rebuild the page with denser workflow framing and legacy-consistent grouping.
- Preserve existing pricing logic while changing the surface to be more faithful.

## 3. Room Maintenance

### Legacy target

Source:

- [ROUTE-MAP.md](./ROUTE-MAP.md) maps `frmRoom.frm` or `frmRoomMaintain` to the room CRUD route.
- [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md) currently marks room maintenance as `Partial`.
- [PRE-SEARCH.md](./PRE-SEARCH.md) identifies `tbl_room` and notes status and rates as part of the core data model.

### Current implementation

Current surface:

- [rooms-list-page.tsx](../src/renderer/src/pages/rooms-list-page.tsx)
- [room-form-page.tsx](../src/renderer/src/pages/room-form-page.tsx)

Observed behavior:

- Room list exists as a modern table with edit and delete actions.
- Room form captures room number, room type, nightly rate, and status.
- Validation exists.
- Status choices are derived from a five-state room status model.

### What matches

- Core room data fields exist.
- Room CRUD exists.
- Status and nightly rate are present.
- Delete protections exist.

### What drifts

- The room form is presented as a centered card with web-style spacing and isolation.
- The room list is a generic table rather than an obviously legacy-inspired maintenance surface.
- The visual relationship between rooms, inventory, and status is weaker than expected for a hotel operations tool.
- Whether room type maintenance should be separate is not resolved in the UI itself.

### Parity score

`Drifted`

### Why this is not a Match

The data model is there, but the screen does not yet resemble legacy room maintenance strongly enough in density, structure, or workflow rhythm.

### Required corrections

- Verify legacy room maintenance field grouping and action layout.
- Rebuild the list and form around maintenance-first scanning rather than generic CRUD structure.
- Make room status and operational condition more central to the page.
- Resolve whether room types need a more faithful maintenance pattern than the current free-text model.

## 4. Guest Find / Guest Maintenance

### Legacy target

Source:

- [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md) references `frmFindCustomer`.
- [ROUTE-MAP.md](./ROUTE-MAP.md) maps the guest form to `/guests`.
- [PRE-SEARCH.md](./PRE-SEARCH.md) identifies guest data as part of the reservation relationship chain.

### Current implementation

Current surface:

- [guests-list-page.tsx](../src/renderer/src/pages/guests-list-page.tsx)
- [guest-form-page.tsx](../src/renderer/src/pages/guest-form-page.tsx)

Observed behavior:

- Guest list exists as a searchable table.
- Search filters by name, contact, and ID reference.
- Guest form captures name, ID/reference, and contact.
- CRUD path exists.

### What matches

- There is a guest lookup/filter capability.
- Core guest fields are present.
- Create/edit/delete functionality exists.

### What drifts

- The guest page behaves like a modern admin directory rather than a front-desk “find customer” tool.
- The guest form is visually sparse and detached from reservation flow.
- There is no clear evidence yet that the screen structure follows the legacy search-and-select model.
- Search exists, but the overall page still communicates maintenance-first rather than lookup-first behavior.

### Parity score

`Drifted`

### Why this is not a Match

The guest route has useful functionality, but the screen shape and interaction meaning are too modern and too generic to count as close parity with a legacy customer-find workflow.

### Required corrections

- Verify whether find and maintain were one screen or two in the legacy app.
- Rebuild the guest entry surface around rapid lookup and selection.
- Keep maintenance capability, but subordinate it to the legacy operational use case.

## Current Documentation Audit

## 1. [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md)

### Current problem

This file is directionally useful, but too optimistic.

Examples:

- `frmDashboard` is marked `Done`, but this audit finds dashboard parity only partial and drifted.
- Several screens marked `Partial` do not explain whether that means route parity, CRUD parity, workflow parity, or visual parity.

### Recommended change

Split each row into separate parity dimensions:

- route exists
- workflow structure
- field/control layout
- keyboard behavior
- legacy confidence level

## 2. [PARITY-MATRIX.md](./PARITY-MATRIX.md)

### Current problem

This file frames the modern app in product terms like “Main / hub menu” and “Operations hub,” which weakens the remake goal and normalizes reinterpretation.

### Recommended change

Rename rows so they refer to legacy modules directly, and add a note when the modern implementation is intentionally different.

## 3. [MANUAL-QA-VB6-PARITY.md](./MANUAL-QA-VB6-PARITY.md)

### Current problem

The checklist verifies existence of features more than familiarity of workflows.

### Recommended change

Add checks for:

- whether room cells are actionable in a legacy-faithful way
- whether booking field order matches the old form
- whether guest lookup feels like a lookup tool instead of an admin page
- whether room maintenance feels like room maintenance instead of generic CRUD

## Priority Ranking for Remediation

1. Dashboard / room board
2. Booking / check-in
3. Room maintenance
4. Guest find and maintenance
5. Shell/navigation cleanup
6. Documentation and QA matrix correction

## Recommended Next Actions

### Immediate

- Accept this audit as the truthful baseline.
- Stop calling dashboard parity `Done`.
- Stop using “operations hub” language for `/` unless the legacy source proves it is accurate.

### Next implementation slice

- Rebuild dashboard and booking/check-in together.

Reason:

- These are the strongest signals of whether the app still feels like Star Hotel or a new admin product.

### Supporting documentation work

- Update [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md) after the first rebuild slice.
- Update [MANUAL-QA-VB6-PARITY.md](./MANUAL-QA-VB6-PARITY.md) so QA tests parity at the workflow level.

## Bottom Line

The current app is not missing the entire product. It has real backend and entity coverage. But at the UI level, the front-desk experience has drifted from “faithful remake” to “modern CRUD interpretation.”

That is recoverable.

The fastest path back into line is not a total rewrite. It is:

1. re-score parity honestly
2. restore dashboard and booking as legacy-first operator surfaces
3. reshape rooms and guests around the same principle
4. update repo documentation so it reflects reality instead of aspiration
