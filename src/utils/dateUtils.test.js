import { describe, it, expect } from 'vitest'
import { todayKey, daysAgoKey, isYesterday, formatShortDate, lastNDaysKeys, dayOfYear, addDaysToKey } from './dateUtils'

describe('todayKey', () => {
  it('formats a date as YYYY-MM-DD using local time components', () => {
    expect(todayKey(new Date(2026, 6, 4))).toBe('2026-07-04')
  })

  it('zero-pads single-digit months and days', () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('daysAgoKey', () => {
  it('subtracts the given number of days', () => {
    expect(daysAgoKey(1, new Date(2026, 6, 4))).toBe('2026-07-03')
    expect(daysAgoKey(0, new Date(2026, 6, 4))).toBe('2026-07-04')
  })

  it('crosses a month boundary correctly', () => {
    expect(daysAgoKey(1, new Date(2026, 6, 1))).toBe('2026-06-30')
  })

  it('crosses a year boundary correctly', () => {
    expect(daysAgoKey(1, new Date(2026, 0, 1))).toBe('2025-12-31')
  })
})

describe('addDaysToKey', () => {
  it('adds days forward across a month boundary', () => {
    expect(addDaysToKey('2026-06-29', 3)).toBe('2026-07-02')
  })

  it('adds days forward across a year boundary', () => {
    expect(addDaysToKey('2025-12-30', 3)).toBe('2026-01-02')
  })

  it('is the inverse of daysAgoKey for the same offset', () => {
    const start = new Date(2026, 6, 10)
    const back = daysAgoKey(5, start)
    expect(addDaysToKey(back, 5)).toBe(todayKey(start))
  })
})

describe('isYesterday', () => {
  it('returns true when the date key is exactly one day before "today"', () => {
    expect(isYesterday('2026-07-03', '2026-07-04')).toBe(true)
  })

  it('returns false for two days ago or today itself', () => {
    expect(isYesterday('2026-07-02', '2026-07-04')).toBe(false)
    expect(isYesterday('2026-07-04', '2026-07-04')).toBe(false)
  })
})

describe('formatShortDate', () => {
  it('renders a short month + day label', () => {
    // Locale-dependent ordering (e.g. "Jul 4" vs "4 Jul"), so just check both pieces are present.
    const result = formatShortDate('2026-07-04')
    expect(result).toMatch(/[A-Za-z]{3}/)
    expect(result).toMatch(/4/)
  })
})

describe('lastNDaysKeys', () => {
  it('returns N days ending with the given date, oldest first', () => {
    const keys = lastNDaysKeys(3, new Date(2026, 6, 4))
    expect(keys).toEqual(['2026-07-02', '2026-07-03', '2026-07-04'])
  })

  it('returns exactly N entries', () => {
    expect(lastNDaysKeys(14, new Date(2026, 6, 4))).toHaveLength(14)
  })
})

describe('dayOfYear', () => {
  it('returns 1 for January 1st (day 0 baseline is Dec 31 of the prior year)', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1)
  })

  it('increases by 1 for each subsequent day', () => {
    const jan1 = dayOfYear(new Date(2026, 0, 1))
    const jan2 = dayOfYear(new Date(2026, 0, 2))
    expect(jan2).toBe(jan1 + 1)
  })
})
