/**
 * Normalizes optional guest/contact fields for persistence: empty string and undefined become null.
 */
export function emptyOrUndefinedToNull(value: string | null | undefined): string | null {
  if (value === '' || value === undefined) {
    return null;
  }
  return value;
}
