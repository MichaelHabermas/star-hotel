# Booking Workflow

## Purpose

Booking is the transaction screen. It is where staff create a stay, review a booked stay, check a guest in, and check a guest out.

## Intended usage

1. Enter Booking from the Room Board whenever possible.
2. Confirm the room first.
3. Fill the guest section.
4. Fill the stay dates and occupancy.
5. Review totals.
6. Save the booking.
7. Reopen the same booking later for arrival, departure, or receipt/report work.

## Typical scenarios

## Walk-in

1. Start from an open room on the Room Board.
2. Open booking.
3. Enter guest details.
4. Enter stay details.
5. Save.

## Reserved arrival

1. Start from a booked room.
2. Open the booking for that room.
3. Verify guest identity and stay dates.
4. Complete check-in.

## Departure

1. Open the occupied room’s booking.
2. Review payment and refund amounts.
3. Complete check-out.
4. Confirm the room moves to housekeeping.

## Fields operators should care about

- guest identity
- guest contact
- booking date
- check-in and check-out dates
- room assignment
- rate
- stay length
- total due
- payment and refund, if used by the workflow

## Intended mental model

Booking is not just “reservation CRUD.” It is the stay record for the room from first save through checkout.
