# VB6 Legacy Deep Dive

Date: 2026-04-03
Purpose: capture what the original `pyhoon/star-hotel-vb6` application actually does so parity work can follow the legacy operator workflow instead of inferred modern CRUD patterns

## Source of truth

- `/tmp/star-hotel-vb6/StarHotel.vbp`
- `/tmp/star-hotel-vb6/Preview/Dashboard.png`
- `/tmp/star-hotel-vb6/Form/frmDashboard.frm`
- `/tmp/star-hotel-vb6/Form/frmBooking.frm`
- `/tmp/star-hotel-vb6/Form/frmFindCustomer.frm`
- `/tmp/star-hotel-vb6/Form/frmRoomMaintain.frm`

## Core findings

## 1. Dashboard is the real front-desk command surface

The original dashboard is not a generic overview page.

- It is a fixed command board with hard-coded slots, not a free-form grid.
- The visible slot layout is:
  - Level 4: slot IDs `45-55`
  - Level 3: slot IDs `34-44`
  - Level 2: top row `12-22`, bottom row `23-33`
  - Level 1: `01-11`
- The display text on each tile comes from `RoomShortName` plus `RoomType`.
- Slot placement is keyed by the room record ID, not by the displayed room number text.
- Inactive rooms are hidden instead of leaving fake interactive cards.
- The toolbar buttons are:
  - `Close (Esc)`
  - `Report (F2)`
  - `Customer (F3)`
  - `Room (F4)`
  - `User (F5)`
  - `Access (F6)`
  - `Blink (F7)`
  - `Security (F8)`
- The board has a right-click popup menu on rooms:
  - `Booking`
  - `Edit Room`
  - `Change Status`
  - `Free`
  - `Occupied`
  - `Housekeeping`
  - `Maintenance`
- Left-click on a room opens booking flow for that room unless the room is under maintenance or not yet set up.
- `Blink (F7)` is a real operator feature. Booked and occupied rooms can blink for alert conditions.

## 2. Booking is a dense operations form, not a small reservation card

`frmBooking` is a full-width working form with a toolbar, status strip, grouped sections, and monetary fields.

- Toolbar buttons are:
  - `Close (Esc)`
  - `Reset (Ctrl+R)`
  - `Save (Ctrl+S)`
  - `Void (Ctrl+D)` though partly hidden in some states
  - `IN (Ctrl+I)`
  - `OUT (Ctrl+O)`
  - `T/R (F11)` temporary receipt
  - `O/R (F12)` official receipt
- A color status bar sits directly under the toolbar and shows:
  - booking number
  - current booking status
- Sections are explicit:
  - Booking Details
  - Room Details
  - Guest Details
  - Emergency Contact
  - Remarks
- Booking details include:
  - booking date
  - total guest
  - length of stay
  - date and time check-in
  - date and time check-out
- Room details include:
  - room number
  - room type
  - location
  - rate
  - breakfast
  - breakfast price
- Financials include:
  - sub total
  - deposit
  - total due
  - payment
  - refund
- The form does more than save a reservation. It drives check-in, check-out, receipt printing, and deposit/refund handling.
- Booking status colors mirror dashboard colors:
  - Open = green
  - Booked = yellow
  - Occupied = red
  - Housekeeping = purple
  - Maintenance = blue
  - Void = gray

## 3. Customer search is a two-panel search-and-history workspace

`frmFindCustomer` is not just a guest directory table.

- Left panel is a search form with:
  - Name
  - Passport / IC No
  - Country / Origin
  - Contact No
  - Booking Date From
  - Booking Date To
  - three `AND/OR` combo controls between the text filters
- Toolbar buttons are:
  - `Close (Esc)`
  - `Clear (Ctrl+C)`
  - `Find (Ctrl+F)`
  - `Print (Ctrl+P)`
- Upper-right panel is a customer results list.
- Lower panel is booking history for the selected customer.
- Clicking a customer immediately refreshes that customer’s booking history.
- Print is transaction-history oriented, not generic list export.

## 4. Room maintenance is split between room list, detail form, and record metadata

`frmRoomMaintain` is not a centered room edit card.

- Toolbar buttons are:
  - `Close (Esc)`
  - `Clear (Ctrl+C)`
  - `Reset (Ctrl+R)`
  - `Save (Ctrl+S)`
  - `Type (Ctrl+T)`
- Left side is a room list with columns:
  - hidden ID
  - Room No
  - Location
- Right side is room detail entry:
  - Room No
  - Room Description
  - Room Type
  - Room Location
  - Room Price
  - Breakfast Included
  - Breakfast Price
  - Under Maintenance
  - Under Housekeeping
  - Active
  - Booking ID
- Lower-right record metadata shows:
  - Created Date
  - Created By
  - Last Modified Date
  - Last Modified By
  - Last Occupied Date
- If a room is `Booked` or `Occupied`, the original form disables editing and save.
- `Type (Ctrl+T)` jumps into room-type maintenance.

## What the modern remake was still missing before this pass

- Dashboard slot mapping was wrong. It was based on displayed room numbers instead of fixed slot IDs.
- The board had drifted into a mostly visual grid instead of a command surface.
- The booking screen was missing much of the original operational framing:
  - no visible booking status strip
  - no check-in/check-out command emphasis
  - no receipt concepts
  - no deposit/payment/refund workflow
- Customer search in the remake was more lookup-first than history-first and lacked the clear dual-list structure.
- Room maintenance had the entity fields but not the original split-screen list/detail/record-details rhythm.

## Actions taken from this deep dive

- The modern room board now uses the legacy fixed slot layout instead of parsing `101-411`.
- The room board header and side panel were compressed to reduce wasted space and feel more like a desk surface.
- Overflow rooms now fall into a dense ledger instead of unreadable cards.
- The room board now frames actions around booking plus room editing, which matches the original menu much more closely.

## Remaining parity gaps after this deep dive

- The modern booking form still does not fully match the original booking toolbar, status strip, and financial workflow.
- The modern customer screen still does not reproduce the original search-builder plus booking-history dual panel closely enough.
- The modern room maintenance screen still needs direct parity on metadata, room-type maintenance handoff, and disable/edit rules for booked or occupied rooms.
- The original dashboard has right-click room status changes and blink alerts. The remake now supports some status changes from the room menu, but not full VB6 parity yet.
