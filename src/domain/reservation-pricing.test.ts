/**
 * Maps to legacy `modLogic.bas` / `DateDiff("d", CheckIn, CheckOut) * Price` (see `docs/E5-FORM-PARITY-MAP.md`).
 * Each case names a legacy behavior or an explicit MVP gap (partial-day billing is out of scope).
 */
import { describe, expect, it } from 'vitest';
import {
  InvalidIsoDateError,
  computeReservationTotal,
  countStayNights,
} from './reservation-pricing';

describe('countStayNights', () => {
  it('returns 0 when check-in and check-out are the same day', () => {
    expect(countStayNights('2026-01-10', '2026-01-10')).toBe(0);
  });

  it('returns 1 for a single overnight stay', () => {
    expect(countStayNights('2026-01-10', '2026-01-11')).toBe(1);
  });

  it('returns 2 for two nights', () => {
    expect(countStayNights('2026-01-10', '2026-01-12')).toBe(2);
  });

  it('handles leap day boundaries', () => {
    expect(countStayNights('2024-02-28', '2024-03-01')).toBe(2);
  });

  it('throws when check-out is before check-in', () => {
    expect(() => countStayNights('2026-01-12', '2026-01-10')).toThrow(InvalidIsoDateError);
  });

  it('throws on malformed ISO dates', () => {
    expect(() => countStayNights('01-10-2026', '2026-01-11')).toThrow(InvalidIsoDateError);
  });
});

describe('computeReservationTotal', () => {
  it('multiplies nights by nightly rate', () => {
    expect(computeReservationTotal(3, 100)).toBe(300);
  });

  it('rounds half-up to two decimals', () => {
    expect(computeReservationTotal(1, 0.125)).toBe(0.13);
  });

  it('allows zero nights and zero total', () => {
    expect(computeReservationTotal(0, 99)).toBe(0);
  });

  it('rejects negative nights', () => {
    expect(() => computeReservationTotal(-1, 10)).toThrow(RangeError);
  });
});
