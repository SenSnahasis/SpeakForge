import { describe, it, expect, beforeEach } from 'vitest'
import { defaultState, loadState, saveState, resetState, exportStateJSON, importStateJSON, computeStreakUpdate } from './storage'

beforeEach(() => {
  localStorage.clear()
})

describe('defaultState', () => {
  it('has the expected top-level shape', () => {
    const state = defaultState()
    expect(state).toMatchObject({
      streak: { current: 0, longest: 0, lastPracticeDate: null },
      vocabulary: { learnedIds: [], weakIds: [] },
      speakingSessions: [],
      grammarMistakes: [],
      confidenceHistory: [],
      completedLessons: {},
      dailyTimeSpent: {},
      sentencePractice: {},
      bonusRounds: {},
    })
  })

  it('returns a fresh object each call (no shared references)', () => {
    const a = defaultState()
    const b = defaultState()
    a.vocabulary.learnedIds.push('x')
    expect(b.vocabulary.learnedIds).toEqual([])
  })
})

describe('loadState / saveState / resetState', () => {
  it('returns default state when nothing is saved yet', () => {
    expect(loadState()).toEqual(defaultState())
  })

  it('round-trips state saved via saveState', () => {
    const state = { ...defaultState(), streak: { current: 3, longest: 5, lastPracticeDate: '2026-07-01', history: {} } }
    saveState(state)
    expect(loadState().streak.current).toBe(3)
  })

  it('fills in missing fields from an older saved version without losing existing data', () => {
    // Simulate a backup saved before `bonusRounds` existed in the schema.
    const oldShape = defaultState()
    delete oldShape.bonusRounds
    oldShape.streak.current = 9
    localStorage.setItem('speakforge:v1', JSON.stringify(oldShape))

    const loaded = loadState()
    expect(loaded.streak.current).toBe(9)
    expect(loaded.bonusRounds).toEqual({})
  })

  it('resetState clears storage and returns default state', () => {
    saveState({ ...defaultState(), streak: { current: 9, longest: 9, lastPracticeDate: '2026-07-01', history: {} } })
    const reset = resetState()
    expect(reset).toEqual(defaultState())
    expect(loadState()).toEqual(defaultState())
  })

  it('recovers to default state if the saved JSON is corrupted', () => {
    localStorage.setItem('speakforge:v1', 'not valid json {{{')
    expect(loadState()).toEqual(defaultState())
  })
})

describe('exportStateJSON / importStateJSON', () => {
  it('exports the current saved state as a JSON string', () => {
    const state = { ...defaultState(), streak: { current: 4, longest: 4, lastPracticeDate: '2026-07-01', history: {} } }
    saveState(state)
    const exported = JSON.parse(exportStateJSON())
    expect(exported.streak.current).toBe(4)
  })

  it('throws a clear error for invalid JSON', () => {
    expect(() => importStateJSON('not json {{{')).toThrow(/valid JSON/)
  })

  it('throws a clear error for JSON that is not a SpeakForge backup', () => {
    expect(() => importStateJSON(JSON.stringify({ foo: 'bar' }))).toThrow(/SpeakForge backup/)
  })

  it('imports a valid backup and writes it to localStorage', () => {
    const backup = { ...defaultState(), vocabulary: { ...defaultState().vocabulary, learnedIds: ['v1', 'v2'] } }
    const result = importStateJSON(JSON.stringify(backup))
    expect(result.vocabulary.learnedIds).toEqual(['v1', 'v2'])
    expect(loadState().vocabulary.learnedIds).toEqual(['v1', 'v2'])
  })

  it('defensively merges an imported backup missing newer fields', () => {
    const oldBackup = defaultState()
    delete oldBackup.sentencePractice
    const result = importStateJSON(JSON.stringify(oldBackup))
    expect(result.sentencePractice).toEqual({})
  })
})

describe('computeStreakUpdate', () => {
  it('leaves the streak unchanged if already practiced today', () => {
    const streak = { current: 3, longest: 3, lastPracticeDate: '2026-07-04', history: {} }
    expect(computeStreakUpdate(streak, '2026-07-04')).toEqual(streak)
  })

  it('starts the streak at 1 on the very first practice ever', () => {
    const streak = { current: 0, longest: 0, lastPracticeDate: null, history: {} }
    const updated = computeStreakUpdate(streak, '2026-07-04')
    expect(updated.current).toBe(1)
    expect(updated.longest).toBe(1)
    expect(updated.lastPracticeDate).toBe('2026-07-04')
  })

  it('increments the streak when practicing on the day right after the last one', () => {
    const streak = { current: 5, longest: 5, lastPracticeDate: '2026-07-03', history: {} }
    const updated = computeStreakUpdate(streak, '2026-07-04')
    expect(updated.current).toBe(6)
    expect(updated.longest).toBe(6)
  })

  it('resets the streak to 1 if a day was missed', () => {
    const streak = { current: 10, longest: 10, lastPracticeDate: '2026-07-01', history: {} }
    const updated = computeStreakUpdate(streak, '2026-07-04')
    expect(updated.current).toBe(1)
    expect(updated.longest).toBe(10) // longest record is preserved even after a break
  })

  it('keeps the longest streak even after it is broken', () => {
    let streak = { current: 0, longest: 0, lastPracticeDate: null, history: {} }
    streak = computeStreakUpdate(streak, '2026-07-01')
    streak = computeStreakUpdate(streak, '2026-07-02')
    streak = computeStreakUpdate(streak, '2026-07-03') // current & longest = 3
    streak = computeStreakUpdate(streak, '2026-07-10') // gap -> current resets to 1
    expect(streak.current).toBe(1)
    expect(streak.longest).toBe(3)
  })

  // Regression: this used to compute "yesterday" from the real system clock
  // (Date.now()) instead of the `today` argument, so passing an explicit
  // today far from the real date silently broke the streak-continuation check.
  it('computes "yesterday" relative to the today argument, not the real system clock', () => {
    const streak = { current: 1, longest: 1, lastPracticeDate: '2020-01-01', history: {} }
    const updated = computeStreakUpdate(streak, '2020-01-02')
    expect(updated.current).toBe(2)
  })
})
