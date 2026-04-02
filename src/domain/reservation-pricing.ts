/**
 * Pure pricing helpers for reservations (legacy: modLogic.bas / PRE-SEARCH).
 * Totals use night count × room nightly rate; dates are ISO 8601 calendar dates (YYYY-MM-DD).
 *
 * **Partial-day / hourly billing:** Not in this module. PRE-SEARCH flags “partial days or early check-outs”
 * for legacy; MVP uses **calendar nights** only (see `docs/E5-FORM-PARITY-MAP.md` — Domain pricing).
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export class InvalidIsoDateError extends Error {
  readonly httpStatus = 400 as const;
  readonly errorCode = 'INVALID_DATE' as const;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidIsoDateError';
  }
}

function parseIsoDateParts(iso: string): { y: number; m: number; d: number } {
  const m = ISO_DATE.exec(iso.trim());
  if (!m) {
    throw new InvalidIsoDateError(`Expected YYYY-MM-DD date, got: ${iso}`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) {
    throw new InvalidIsoDateError(`Invalid calendar date: ${iso}`);
  }
  const utc = Date.UTC(y, mo - 1, d);
  const check = new Date(utc);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
    throw new InvalidIsoDateError(`Invalid calendar date: ${iso}`);
  }
  return { y, m: mo, d };
}

/** UTC midnight epoch day index (stable for date-only arithmetic). */
function utcDayIndex(iso: string): number {
  const { y, m, d } = parseIsoDateParts(iso);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * Number of nights for a stay where checkout is the morning of `checkOutIso` (exclusive end).
 * Same check-in and check-out → 0 nights.
 */
export function countStayNights(checkInIso: string, checkOutIso: string): number {
  const start = utcDayIndex(checkInIso);
  const end = utcDayIndex(checkOutIso);
  if (end < start) {
    throw new InvalidIsoDateError('Check-out must be on or after check-in');
  }
  return end - start;
}

/**
 * Total charge = nights × nightly rate (legacy: DateDiff("d", ...) × Price).
 * Rounds half-up to two decimal places for currency display consistency.
 */
export function computeReservationTotal(nights: number, pricePerNight: number): number {
  if (!Number.isFinite(nights) || nights < 0) {
    throw new RangeError('nights must be a non-negative finite number');
  }
  if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
    throw new RangeError('pricePerNight must be a non-negative finite number');
  }
  const raw = nights * pricePerNight;
  return Math.round(raw * 100) / 100;
}
