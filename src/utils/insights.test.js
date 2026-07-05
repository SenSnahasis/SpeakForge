import { describe, it, expect } from 'vitest'
import { hasEnoughDataForInsight, shouldRegenerateInsight, buildInsightSummary } from './insights'
import { defaultState } from './storage'

describe('hasEnoughDataForInsight', () => {
  it('is false for a brand new, empty state', () => {
    expect(hasEnoughDataForInsight(defaultState())).toBe(false)
  })

  it('is true once there are at least 3 grammar mistakes', () => {
    const state = { ...defaultState(), grammarMistakes: [{ category: 'x' }, { category: 'x' }, { category: 'x' }] }
    expect(hasEnoughDataForInsight(state)).toBe(true)
  })

  it('is true once at least 5 words are learned', () => {
    const state = { ...defaultState(), vocabulary: { ...defaultState().vocabulary, learnedIds: ['v1', 'v2', 'v3', 'v4', 'v5'] } }
    expect(hasEnoughDataForInsight(state)).toBe(true)
  })

  it('is true once at least 3 speaking sessions exist', () => {
    const state = { ...defaultState(), speakingSessions: [{}, {}, {}] }
    expect(hasEnoughDataForInsight(state)).toBe(true)
  })

  it('is false when just under every threshold', () => {
    const state = {
      ...defaultState(),
      grammarMistakes: [{ category: 'x' }, { category: 'x' }],
      vocabulary: { ...defaultState().vocabulary, learnedIds: ['v1', 'v2', 'v3', 'v4'] },
      speakingSessions: [{}, {}],
    }
    expect(hasEnoughDataForInsight(state)).toBe(false)
  })
})

describe('shouldRegenerateInsight', () => {
  it('is true when never generated before', () => {
    expect(shouldRegenerateInsight({ text: null, generatedAt: null }, '2026-07-05')).toBe(true)
  })

  it('is false when generated fewer than 7 days ago', () => {
    expect(shouldRegenerateInsight({ text: 'x', generatedAt: '2026-07-01' }, '2026-07-05')).toBe(false)
  })

  it('is true once 7 or more days have passed', () => {
    expect(shouldRegenerateInsight({ text: 'x', generatedAt: '2026-06-28' }, '2026-07-05')).toBe(true)
  })
})

describe('buildInsightSummary', () => {
  it('includes streak, vocabulary, and mistake counts', () => {
    const state = {
      ...defaultState(),
      streak: { current: 5, longest: 12, lastPracticeDate: '2026-07-04', history: {} },
      vocabulary: { ...defaultState().vocabulary, learnedIds: ['v1', 'v2'], weakIds: ['v1', 'v21'] },
      grammarMistakes: [
        { category: 'Subject-Verb Agreement' },
        { category: 'Subject-Verb Agreement' },
        { category: 'Article Usage' },
      ],
      speakingSessions: [{}, {}],
      confidenceHistory: [{ date: '2026-07-01', score: 60 }, { date: '2026-07-04', score: 72 }],
    }
    const summary = buildInsightSummary(state)
    expect(summary).toContain('Current streak: 5 day(s) (longest ever: 12 days)')
    expect(summary).toContain('Words learned: 2')
    expect(summary).toContain('Words currently needing review: 2')
    expect(summary).toContain('Total grammar mistakes logged: 3')
    expect(summary).toContain('Subject-Verb Agreement (2x)')
    expect(summary).toContain('Speaking sessions completed: 2')
    expect(summary).toContain('Latest confidence score: 72/100')
  })

  it('omits the mistake/confidence lines entirely when there is no data for them', () => {
    const summary = buildInsightSummary(defaultState())
    expect(summary).not.toContain('Most frequent mistake types')
    expect(summary).not.toContain('Latest confidence score')
  })
})
