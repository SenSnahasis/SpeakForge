import { describe, it, expect } from 'vitest'
import { getAchievementProgress, getEarnedCount } from './achievements'
import { ACHIEVEMENTS } from '../data/achievements'
import { defaultState } from './storage'

describe('getAchievementProgress', () => {
  it('marks every achievement as not earned for a brand-new (default) state', () => {
    const progress = getAchievementProgress(defaultState())
    expect(progress).toHaveLength(ACHIEVEMENTS.length)
    expect(progress.every((a) => a.earned === false)).toBe(true)
    expect(progress.every((a) => a.value === 0)).toBe(true)
  })

  it('marks an achievement earned once its value reaches the target', () => {
    const state = defaultState()
    state.streak.longest = 7
    const progress = getAchievementProgress(state)
    const week = progress.find((a) => a.id === 'streak-7')
    const twoWeek = progress.find((a) => a.id === 'streak-14')
    expect(week.earned).toBe(true)
    expect(week.value).toBe(7)
    expect(twoWeek.earned).toBe(false)
  })

  it('earns a vocabulary milestone based on learnedIds length', () => {
    const state = defaultState()
    state.vocabulary.learnedIds = Array.from({ length: 25 }, (_, i) => `v${i}`)
    const progress = getAchievementProgress(state)
    expect(progress.find((a) => a.id === 'vocab-10').earned).toBe(true)
    expect(progress.find((a) => a.id === 'vocab-25').earned).toBe(true)
    expect(progress.find((a) => a.id === 'vocab-50').earned).toBe(false)
  })

  it('earns the pronunciation achievement only when a session scores high enough', () => {
    const state = defaultState()
    state.speakingSessions = [{ type: 'pronunciation', score: 80 }]
    expect(getAchievementProgress(state).find((a) => a.id === 'pronunciation-great').earned).toBe(false)

    state.speakingSessions = [{ type: 'pronunciation', score: 95 }]
    expect(getAchievementProgress(state).find((a) => a.id === 'pronunciation-great').earned).toBe(true)
  })

  it('earns the sentence self-corrector achievement from a successful retry', () => {
    const state = defaultState()
    state.sentencePractice = { 'She go to school.': { attempts: 2, correct: 1, lastAttemptDate: '2026-07-01', lastCorrect: true } }
    expect(getAchievementProgress(state).find((a) => a.id === 'sentence-fix-1').earned).toBe(true)
  })

  it('does not earn the self-corrector achievement if the last attempt was still wrong', () => {
    const state = defaultState()
    state.sentencePractice = { x: { attempts: 3, correct: 0, lastAttemptDate: '2026-07-01', lastCorrect: false } }
    expect(getAchievementProgress(state).find((a) => a.id === 'sentence-fix-1').earned).toBe(false)
  })
})

describe('getEarnedCount', () => {
  it('returns 0 for a default state', () => {
    expect(getEarnedCount(defaultState())).toBe(0)
  })

  it('counts only achievements whose value has reached their target', () => {
    const state = defaultState()
    state.streak.longest = 30 // earns streak-3, streak-7, streak-14, streak-30
    expect(getEarnedCount(state)).toBe(4)
  })
})
