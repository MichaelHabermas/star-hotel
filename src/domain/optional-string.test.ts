import { describe, expect, it } from 'vitest';
import { emptyOrUndefinedToNull } from './optional-string';

describe('emptyOrUndefinedToNull', () => {
  it('maps empty string and undefined to null', () => {
    expect(emptyOrUndefinedToNull('')).toBeNull();
    expect(emptyOrUndefinedToNull(undefined)).toBeNull();
  });

  it('preserves non-empty strings and null', () => {
    expect(emptyOrUndefinedToNull('x')).toBe('x');
    expect(emptyOrUndefinedToNull(null)).toBeNull();
  });
});
