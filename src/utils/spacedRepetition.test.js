import { describe, it, expect } from 'vitest'
import { advanceSchedule, isDue, getDueWords, getNextUpcomingReviewDate, INTERVAL_DAYS, MAX_BOX } from './spacedRepetition'

describe('advanceSchedule', () => {
  it('starts a brand-new word at box 0, due the next day, on a remembered recall', () => {
    const entry = advanceSchedule(undefined, true, '2026-07-01')
    expect(entry).toEqual({ box: 0, nextReviewDate: '2026-07-02', reviewCount: 1, lastReviewedDate: '2026-07-01' })
  })

  it('starts a brand-new word at box 0 even on a missed recall (nothing to reset from)', () => {
    const entry = advanceSchedule(undefined, false, '2026-07-01')
    expect(entry.box).toBe(0)
  })

  it('promotes box by one and extends the interval on each successful recall', () => {
    let entry = advanceSchedule(undefined, true, '2026-07-01') // box 0, +1 day
    entry = advanceSchedule(entry, true, '2026-07-02') // box 1, +2 days
    expect(entry.box).toBe(1)
    expect(entry.nextReviewDate).toBe('2026-07-04')
    entry = advanceSchedule(entry, true, '2026-07-04') // box 2, +4 days
    expect(entry.box).toBe(2)
    expect(entry.nextReviewDate).toBe('2026-07-08')
  })

  it('resets to box 0 on a missed recall regardless of prior progress', () => {
    let entry = advanceSchedule(undefined, true, '2026-07-01')
    entry = advanceSchedule(entry, true, '2026-07-02')
    entry = advanceSchedule(entry, true, '2026-07-04') // now box 2
    entry = advanceSchedule(entry, false, '2026-07-08')
    expect(entry.box).toBe(0)
    expect(entry.nextReviewDate).toBe('2026-07-09')
  })

  it('never promotes past the maximum box', () => {
    let entry
    let today = '2026-01-01'
    for (let i = 0; i < MAX_BOX + 5; i++) {
      entry = advanceSchedule(entry, true, today)
      today = entry.nextReviewDate
    }
    expect(entry.box).toBe(MAX_BOX)
    expect(entry.box).toBeLessThan(INTERVAL_DAYS.length)
  })

  it('increments reviewCount on every call regardless of outcome', () => {
    let entry = advanceSchedule(undefined, true, '2026-07-01')
    expect(entry.reviewCount).toBe(1)
    entry = advanceSchedule(entry, false, '2026-07-02')
    expect(entry.reviewCount).toBe(2)
  })
})

describe('isDue', () => {
  it('treats a missing entry as due', () => {
    expect(isDue(undefined, '2026-07-01')).toBe(true)
    expect(isDue(null, '2026-07-01')).toBe(true)
  })

  it('is due when the next review date is today or earlier', () => {
    expect(isDue({ nextReviewDate: '2026-07-01' }, '2026-07-01')).toBe(true)
    expect(isDue({ nextReviewDate: '2026-06-30' }, '2026-07-01')).toBe(true)
  })

  it('is not due when the next review date is in the future', () => {
    expect(isDue({ nextReviewDate: '2026-07-02' }, '2026-07-01')).toBe(false)
  })
})

describe('getDueWords', () => {
  it('returns the union of learned and weak word ids that are due', () => {
    const vocab = {
      learnedIds: ['v1', 'v2'],
      weakIds: ['v2', 'v3'],
      reviewSchedule: {
        v1: { nextReviewDate: '2026-07-05' }, // not due
        v2: { nextReviewDate: '2026-06-30' }, // due
        v3: { nextReviewDate: '2026-07-01' }, // due (equal to today)
      },
    }
    const due = getDueWords(vocab, '2026-07-01')
    expect(due.sort()).toEqual(['v2', 'v3'])
  })

  it('treats a word with no schedule entry yet as due', () => {
    const vocab = { learnedIds: ['v1'], weakIds: [], reviewSchedule: {} }
    expect(getDueWords(vocab, '2026-07-01')).toEqual(['v1'])
  })

  it('does not duplicate a word that is both learned and weak', () => {
    const vocab = { learnedIds: ['v1'], weakIds: ['v1'], reviewSchedule: { v1: { nextReviewDate: '2026-06-01' } } }
    expect(getDueWords(vocab, '2026-07-01')).toEqual(['v1'])
  })
})

describe('getNextUpcomingReviewDate', () => {
  it('returns the earliest nextReviewDate across all scheduled words', () => {
    const vocab = {
      reviewSchedule: {
        v1: { nextReviewDate: '2026-07-10' },
        v2: { nextReviewDate: '2026-07-03' },
        v3: { nextReviewDate: '2026-07-20' },
      },
    }
    expect(getNextUpcomingReviewDate(vocab)).toBe('2026-07-03')
  })

  it('returns null when nothing is scheduled yet', () => {
    expect(getNextUpcomingReviewDate({ reviewSchedule: {} })).toBeNull()
  })
})
