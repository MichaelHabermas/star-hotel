import { describe, expect, it } from 'vitest'
import { stayRangesOverlapHalfOpen } from './reservation-stay-overlap'

describe('stayRangesOverlapHalfOpen', () => {
  it('detects overlapping ranges', () => {
    expect(stayRangesOverlapHalfOpen('2026-06-01', '2026-06-04', '2026-06-02', '2026-06-05')).toBe(true)
  })

  it('returns false when ranges only touch at a boundary (half-open)', () => {
    expect(stayRangesOverlapHalfOpen('2026-06-01', '2026-06-04', '2026-06-04', '2026-06-06')).toBe(false)
    expect(stayRangesOverlapHalfOpen('2026-06-04', '2026-06-06', '2026-06-01', '2026-06-04')).toBe(false)
  })

  it('returns false for disjoint ranges', () => {
    expect(stayRangesOverlapHalfOpen('2026-06-10', '2026-06-12', '2026-06-01', '2026-06-04')).toBe(false)
  })
})
