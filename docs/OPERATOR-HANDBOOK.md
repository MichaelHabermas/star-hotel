# Operator Handbook

Purpose: explain the intended day-to-day use of the Star Hotel remake from a front-desk operator point of view

## Start of day

1. Open the app and land on the Room Board.
2. Review the summary counts across the top:
   - Open
   - Booked
   - Occupied
   - Housekeeping
   - Maintenance
3. Scan the board for rooms that need attention first:
   - booked arrivals
   - occupied departures
   - housekeeping and maintenance holds
4. Use:
   - `F1` for Booking
   - `F2` for Report
   - `F3` for Customer
   - `F4` for Room
   - `Esc` to return to the Room Board

## Daily front-desk flow

The intended operator flow is:

1. Start from Room Board.
2. Open booking for the selected room.
3. Save or update the stay.
4. Find customer history if needed.
5. Return to the board to keep the room picture in view.
6. Use room maintenance only when the room itself needs setup or status correction.
7. Use reports after transactions, not as the primary working surface.

## Typical tasks

## New booking or walk-in

1. Start on Room Board.
2. Pick an open room.
3. Open booking from that room.
4. Fill booking details, guest details, and room details.
5. Save the booking.
6. Return to the board and confirm the room moved out of open inventory.

## Existing arrival

1. Start on Room Board.
2. Select the booked room.
3. Open booking.
4. Verify guest and stay details.
5. Complete check-in.
6. Confirm the room now shows as occupied.

## Departure and turnover

1. Open the booking for the occupied room.
2. Complete check-out.
3. Confirm payment and refund handling if applicable.
4. The room should move to housekeeping.
5. After the room is cleaned, return it to free/open status from room workflow.

## Find a guest or review booking history

1. Press `F3` or open Customer.
2. Search by name, passport, origin, contact, and booking date range.
3. Select the customer in the result list.
4. Review that customer’s booking history in the lower history panel.
5. Return to Room Board or Booking as needed.

## Fix a room record

1. Press `F4` or open Room.
2. Select the room from the room list.
3. Review room details and record metadata.
4. Update room type, location, pricing, breakfast, or maintenance state when appropriate.
5. Save and return to the Room Board.

## Screen guide

- Room Board: live operational surface for room state and booking handoff
- Booking: primary transaction form for reservation, check-in, check-out, and money handling
- Customer: customer search and booking history lookup
- Room: room setup and maintenance
- Report: print and reporting workflows

## What to avoid

- Do not treat the Room screen as the primary booking workflow.
- Do not start from reports when front-desk action is still in progress.
- Do not leave room status changes disconnected from booking workflow. If a room is booked or occupied, open the booking first.

## Per-screen workflow documents

- [Room Board](./workflows/ROOM-BOARD.md)
- [Booking](./workflows/BOOKING.md)
- [Customer](./workflows/CUSTOMER.md)
- [Room Maintenance](./workflows/ROOM-MAINTENANCE.md)
- [Reports](./workflows/REPORTS.md)
