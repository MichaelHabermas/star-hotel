# VB6 Parity Recovery Plan

Date: 2026-04-03
Status: Proposed
Scope: Dashboard, room board, room maintenance, guest maintenance/find, reservations/check-in, surrounding navigation and parity documentation

## Purpose

This project was intended to be a close-as-possible functional remake of the legacy VB6 Star Hotel application, not a broad reinterpretation. Visual modernization is acceptable, but workflow, information layout, affordances, and user confidence should stay close enough that an experienced legacy operator can move into the new app with minimal retraining.

This plan resets the parity effort around that goal.

## Core Direction

The working rule going forward is:

> Preserve legacy operator behavior and screen structure unless a change is required by the modern stack, accessibility, security, or a clearly documented course requirement.

That means:

- We optimize for familiarity first, modernization second.
- We stop treating route existence as parity.
- We stop treating style-lab ideas as permission to redesign workflows.
- We keep additive functionality only if it does not interfere with the legacy happy path.

## Why This Plan Is Needed

The current codebase preserves some entities and CRUD behavior, but several key surfaces drifted from the legacy app’s operator model.

### Confirmed drift already visible in the repo

- The main screen is described as an “operations hub” in [PARITY-MATRIX.md](./PARITY-MATRIX.md), while the legacy mapping says `/` should correspond to `frmDashboard` as the main room board and toolbar in [ROUTE-MAP.md](./ROUTE-MAP.md).
- The current room board in [src/renderer/src/features/dashboard/room-dashboard.tsx](../src/renderer/src/features/dashboard/room-dashboard.tsx) is largely passive. Tiles do not open a workflow, and rooms silently disappear from the board unless the room number matches a strict four-level eleven-column scheme.
- The current `/` page in [src/renderer/src/pages/home-page.tsx](../src/renderer/src/pages/home-page.tsx) still contains dev-only operator-surface content, which makes the primary screen feel like a project shell rather than a legacy front-desk dashboard.
- The room, guest, and reservation forms in [src/renderer/src/pages/room-form-page.tsx](../src/renderer/src/pages/room-form-page.tsx), [src/renderer/src/pages/guest-form-page.tsx](../src/renderer/src/pages/guest-form-page.tsx), and [src/renderer/src/pages/reservation-form-page.tsx](../src/renderer/src/pages/reservation-form-page.tsx) are generic modern CRUD cards, not close remakes of the legacy forms’ density, grouping, field order, and task flow.
- The parity docs overstate completion. For example, [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md) marks `frmDashboard` as `Done`, but the current implementation only captures part of the visual board shape, not the full operational role of the legacy dashboard.

## Source of Truth

The plan should treat the following as the priority order for parity decisions:

1. The legacy VB6 repository itself, especially `Form/*.frm`, `Module/*.bas`, and `Preview/*`.
2. The course requirement in [VB6-Hotel-App-Modernization-Project-specs.md](./VB6-Hotel-App-Modernization-Project-specs.md).
3. Existing repo reconnaissance and mapping docs:
   - [PRE-SEARCH.md](./PRE-SEARCH.md)
   - [ROUTE-MAP.md](./ROUTE-MAP.md)
   - [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md)
4. Current renderer code, only as the implementation under correction.
5. Style docs, only insofar as they support a faithful modernized remake instead of changing the product shape.

## Non-Negotiable Parity Principles

### 1. Functional remake over product reinterpretation

- The app should feel like the same hotel system in a newer UI shell.
- Main modules should preserve recognizable intent, field grouping, and actions.
- A legacy user should not need to learn a new information architecture to complete common tasks.

### 2. Modernization is allowed only inside the legacy frame

Allowed:

- better typography
- clearer spacing
- accessible contrast
- keyboard and focus improvements
- reliable validation and error states
- responsive behavior where it does not change the desktop-first task model

Not allowed without explicit justification:

- turning the dashboard into a modern app hub
- replacing dense operator forms with minimal “friendly” CRUD cards
- adding new conceptual sections that reframe the workflow
- moving primary task actions away from the places an old operator would expect them

### 3. Additive features may stay temporarily if they are harmless

They may remain for now only if they:

- do not block the legacy path
- do not occupy the primary operator surface
- do not change meaning or sequence of the original task
- can be hidden or moved easily if they later prove distracting

## Recovery Strategy

This recovery should happen in two tracks:

- Track A: establish an accurate parity audit
- Track B: implement screen-by-screen rollback and alignment

Both tracks need to move together so the team does not keep coding against inflated parity claims.

## Track A: Parity Audit

### Deliverable

Create a screen-by-screen parity workbook for the high-value front-desk flows:

- `frmDashboard`
- `frmBooking` or equivalent reservation/check-in form
- `frmRoomMaintain`
- `frmFindCustomer`
- guest maintenance form if distinct in the legacy app

### For each legacy screen, record

- screenshot or static reference from the legacy repo
- list of visible controls
- field labels and order
- grouping and framing
- primary buttons and secondary buttons
- keyboard behavior and default focus
- navigation entry points and exit points
- what actions a room tile, row, or button actually performs
- what status indicators exist and what they mean

### Re-score parity using four buckets

- `Match`: close enough that a legacy operator would immediately recognize it
- `Modernized but faithful`: visually updated, but same task model and information order
- `Drifted`: function exists, but structure or interaction meaning changed
- `Missing`: not implemented or only implied by docs

### Correction to current documentation

As part of the audit, update parity docs so they stop claiming “Done” when only route-level or partial structural parity exists.

At minimum, the audit should re-evaluate:

- [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md)
- [PARITY-MATRIX.md](./PARITY-MATRIX.md)
- [MANUAL-QA-VB6-PARITY.md](./MANUAL-QA-VB6-PARITY.md)

## Track B: Screen-by-Screen Recovery

### Phase 1: Restore the dashboard to a real operator surface

Priority: Highest

The dashboard is the first impression and the main orientation point. It should feel like the old front-desk command surface, not like a modern shell page.

#### Problems to address

- Room tiles currently do not drive a concrete workflow.
- The board is tightly coupled to a hard-coded room-number pattern rather than a verified legacy layout model.
- The main screen still mixes operator UI with dev-oriented content.
- The current navigation framing encourages users to think in separate modern modules rather than in the legacy operational hub.

#### Recovery work

- Verify the exact legacy dashboard board layout from the VB6 repo and `Preview/` assets.
- Decide whether the board should display only real rooms or a fixed grid including empty slots based on legacy evidence, not assumption.
- Make room cells actionable in the same way the legacy board was actionable, or intentionally non-actionable only if the old board was also non-actionable.
- Move dev-only smoke/testing controls off the default operator screen.
- Rebuild the dashboard header/toolbar so it behaves like the old command surface while retaining modern accessibility.
- Keep keyboard hints visible, but place them where they support the legacy experience instead of dominating it.

#### Acceptance criteria

- A legacy user can identify the dashboard as the old main screen immediately.
- Every visible room indicator maps to something real and understandable.
- The board has a clear operational purpose beyond showing colored boxes.
- Non-legacy helper tools are removed from the operator surface or clearly isolated from it.

### Phase 2: Rebuild room maintenance to match the old maintenance form

Priority: High

The current room page is structurally correct as CRUD, but too generic and too detached from legacy maintenance expectations.

#### Problems to address

- Centered single-card layout feels like a standard web form, not a maintenance screen.
- Room information is too sparse and visually decontextualized.
- The list and form likely do not mirror the legacy ordering, framing, or edit rhythm.

#### Recovery work

- Inspect the legacy room maintenance form and identify exact field order and grouping.
- Rebuild the room list and room form so they resemble the legacy maintenance workflow:
  - denser layout
  - stronger room status visibility
  - clearer relation between room inventory and edit action
- Confirm whether room type maintenance was separate in the VB6 app and decide whether to emulate that directly or document a faithful consolidation.
- Ensure housekeeping and occupancy cues remain visually immediate, consistent with [STYLE-GUIDE.md](./STYLE-GUIDE.md), but do not become decorative abstractions.

#### Acceptance criteria

- A legacy operator can edit room data without hunting for where the old concepts moved.
- Status and inventory information is immediately legible.
- The page no longer reads like a generic admin CRUD surface.

### Phase 3: Rebuild guest find and guest maintenance around the old lookup model

Priority: High

Guest flows in the legacy app were likely centered on finding and selecting a customer quickly, not simply maintaining a profile from a modern data table.

#### Problems to address

- `/guests` currently behaves like a modern table with a search box and CRUD actions.
- The guest form is too sparse and too isolated from the reservation workflow.

#### Recovery work

- Verify whether `frmFindCustomer` and guest maintenance were separate or linked workflows in the legacy app.
- Rebuild guest search so it behaves like a true operator lookup surface first and a data management screen second.
- Match legacy labels and field order where known.
- Reposition guest editing so it feels connected to reservations/check-in rather than like a standalone SaaS-style directory tool.

#### Acceptance criteria

- Guest lookup is fast and familiar to an old user.
- Guest creation/editing feels like part of hotel operations, not generic contact management.

### Phase 4: Rebuild booking/check-in as the reference parity screen

Priority: Highest after dashboard

This is the most important form family and the place where legacy familiarity matters most.

#### Problems to address

- The current reservation form is clean but generic.
- It does not yet prove close parity in layout, density, grouping, or operator sequence.
- Existing design guidance added extra concepts like notes and “confidence areas” that may not belong unless the legacy screen truly supported them.

#### Recovery work

- Inspect the legacy booking/check-in screen directly.
- Map the old form row by row:
  - guest selection
  - room selection
  - date fields
  - totals
  - any taxes, notes, references, or special cases actually present
  - button order and button labels
- Rebuild the page around the legacy task sequence instead of the current generic create/edit form sequence.
- Preserve backend pricing logic already ported from `modLogic.bas`, but make the UI presentation match the old system more closely.
- Decide whether the reservation list is the correct first surface or whether the legacy workflow started from the dashboard, a booking form, or a lookup dialog.

#### Acceptance criteria

- The booking/check-in screen becomes the clearest example of “same application, modernized.”
- An experienced legacy user can complete a booking with minimal relearning.
- Any modern differences are intentional, small, and documented.

### Phase 5: Align shell navigation with legacy module flow

Priority: Medium

The app shell should support the legacy modules, not redefine them.

#### Problems to address

- The current shell is structurally neat, but still reads like a modern multi-module application wrapper.
- The dashboard and top-level navigation together create an “operations hub” framing that is not yet clearly legacy-faithful.

#### Recovery work

- Verify the original toolbar/menu structure from the VB6 app.
- Keep the single-row keyboard-friendly navigation only if it supports the old module model.
- Re-label or re-order modules if current naming or order drifted from the original.
- Ensure navigation reinforces the dashboard as the true main operational home.

#### Acceptance criteria

- Top-level navigation feels like a modern shell around an old desktop system, not a redesign of the product.

## Implementation Order

Recommended order:

1. Dashboard and room board
2. Booking/check-in screen
3. Room maintenance
4. Guest find and guest maintenance
5. Shell/navigation alignment
6. Reports and admin parity cleanup
7. Parity docs and QA checklist correction

Reasoning:

- Dashboard and booking are the strongest “this is or is not the old app” signals.
- Rooms and guests are important, but they should follow the recovered front-desk model.
- Navigation should be finalized after the main modules are re-aligned, not before.

## Required Artifacts

This plan should produce the following repo artifacts as work proceeds:

### 1. A formal parity audit document

Suggested path:

- `docs/VB6-PARITY-AUDIT.md`

Contents:

- one section per legacy screen
- legacy evidence
- current implementation reference
- drift summary
- recommended correction
- final parity score

### 2. Updated parity matrices

Revise:

- [VB6-PARITY-MATRIX.md](./VB6-PARITY-MATRIX.md)
- [PARITY-MATRIX.md](./PARITY-MATRIX.md)

These should distinguish:

- route parity
- visual structure parity
- workflow parity
- keyboard parity

### 3. A manual validation checklist that tests actual familiarity

Revise [MANUAL-QA-VB6-PARITY.md](./MANUAL-QA-VB6-PARITY.md) so it checks:

- room board actionability
- form field order and labels
- operator task flow
- whether old users can complete common workflows without detours

## Decision Rules During Recovery

When there is uncertainty, use these rules:

### Keep

- backend/domain logic that already preserves legacy behavior
- additive functionality that is invisible or harmless to the legacy path
- accessibility and reliability improvements

### Rework

- any screen that preserves data but changes the operator’s mental model
- any control layout that turns a dense desktop workflow into a generic modern CRUD page
- any navigation choice that makes the app feel like a new product

### Remove or hide

- dev-only controls from operator-facing screens
- decorative or conceptual elements that do not map to legacy behavior
- unverified features introduced from style exploration rather than source evidence

## Risks

### Risk 1: We keep coding against inaccurate parity assumptions

Mitigation:

- parity audit comes first
- current parity docs are treated as provisional until re-scored

### Risk 2: We overcorrect into pixel-copying instead of usable remake

Mitigation:

- preserve behavior and information architecture first
- modernize typography, spacing, and accessibility where it does not change workflow meaning

### Risk 3: Hidden legacy details are not captured in current repo docs

Mitigation:

- inspect legacy `.frm` and `Preview` assets directly
- document every inference versus confirmed fact

### Risk 4: Existing route and API structure biases the UI toward generic CRUD

Mitigation:

- allow the UI to become denser and more workflow-specific without rewriting stable backend logic unless necessary

## Definition of Success

This recovery is successful when:

- a user familiar with the old VB6 Star Hotel application recognizes the new app as the same system immediately
- the dashboard feels like the old main operational surface
- room, guest, and booking forms feel structurally familiar, not merely functionally equivalent
- the app keeps modern accessibility, validation, and architecture improvements without changing the core user experience
- parity documentation truthfully reflects what is matched, what is modernized, and what still differs

## Immediate Next Step

The next work item after adopting this plan should be:

1. Create the parity audit document for dashboard, bookings, rooms, and guests.
2. Re-score current implementation honestly.
3. Start implementation with dashboard plus booking/check-in, since those are the strongest indicators of whether the remake is back on track.

## Assumptions

- “Close-as-possible functional remake” is now the governing product direction.
- Additive functionality may remain temporarily if it does not distort legacy workflows.
- Current backend architecture remains valid unless a parity requirement proves otherwise.
- The legacy repo and any bundled preview screenshots are the final arbiters where current docs conflict with current implementation.
