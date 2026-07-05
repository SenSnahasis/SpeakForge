import { describe, it, expect } from 'vitest'
import { computeConfidenceScore, scoreLabel, streakMultiplierMessage } from './scoring'

describe('computeConfidenceScore', () => {
  it('returns a mid-range baseline score when given no signals at all', () => {
    // fluencyBase=0, pronunciationWeighted=80*0.4=32, +25 base, no penalties => 57
    expect(computeConfidenceScore({})).toBe(57)
  })

  it('returns 100 for strong fluency, full pronunciation accuracy, and no penalties', () => {
    const score = computeConfidenceScore({
      speakingSeconds: 60,
      wordCount: 120, // 120 wpm -> fluencyBase caps at 100
      fillerCount: 0,
      grammarIssues: 0,
      pronunciationAccuracy: 100,
    })
    expect(score).toBe(100)
  })

  it('clamps to the minimum of 5 when penalties would drive the score negative', () => {
    const score = computeConfidenceScore({
      speakingSeconds: 60,
      wordCount: 0,
      fillerCount: 10,
      grammarIssues: 10,
      pronunciationAccuracy: 0,
    })
    expect(score).toBe(5)
  })

  it('caps the filler-word penalty at 30 regardless of how many fillers are counted', () => {
    const moderate = computeConfidenceScore({ fillerCount: 6, pronunciationAccuracy: 80 })
    const extreme = computeConfidenceScore({ fillerCount: 60, pronunciationAccuracy: 80 })
    expect(moderate).toBe(extreme)
  })

  it('caps the grammar-issue penalty at 30 regardless of how many issues are counted', () => {
    const moderate = computeConfidenceScore({ grammarIssues: 5, pronunciationAccuracy: 80 })
    const extreme = computeConfidenceScore({ grammarIssues: 50, pronunciationAccuracy: 80 })
    expect(moderate).toBe(extreme)
  })

  it('never returns a score outside the 5-100 range', () => {
    const veryLow = computeConfidenceScore({ fillerCount: 100, grammarIssues: 100, pronunciationAccuracy: 0 })
    const veryHigh = computeConfidenceScore({ speakingSeconds: 1, wordCount: 1000, pronunciationAccuracy: 100 })
    expect(veryLow).toBeGreaterThanOrEqual(5)
    expect(veryHigh).toBeLessThanOrEqual(100)
  })
})

describe('scoreLabel', () => {
  it('labels scores of 85 and above as Confident', () => {
    expect(scoreLabel(85).label).toBe('Confident')
    expect(scoreLabel(100).label).toBe('Confident')
  })

  it('labels scores from 65 to 84 as Improving', () => {
    expect(scoreLabel(65).label).toBe('Improving')
    expect(scoreLabel(84).label).toBe('Improving')
  })

  it('labels scores from 45 to 64 as Building Up', () => {
    expect(scoreLabel(45).label).toBe('Building Up')
    expect(scoreLabel(64).label).toBe('Building Up')
  })

  it('labels scores below 45 as Keep Practicing', () => {
    expect(scoreLabel(44).label).toBe('Keep Practicing')
    expect(scoreLabel(0).label).toBe('Keep Practicing')
  })

  it('returns a hex color alongside every label', () => {
    ;[0, 50, 70, 90].forEach((score) => {
      expect(scoreLabel(score).color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })
})

describe('streakMultiplierMessage', () => {
  it('encourages starting a streak at 0', () => {
    expect(streakMultiplierMessage(0)).toBe('Every day counts. Start your streak today!')
  })

  it('acknowledges early momentum from 3 days', () => {
    expect(streakMultiplierMessage(3)).toMatch(/momentum/i)
    expect(streakMultiplierMessage(6)).toMatch(/momentum/i)
  })

  it('celebrates a full week from 7 days', () => {
    expect(streakMultiplierMessage(7)).toMatch(/full week/i)
    expect(streakMultiplierMessage(13)).toMatch(/full week/i)
  })

  it('calls out two weeks from 14 days', () => {
    expect(streakMultiplierMessage(14)).toMatch(/two weeks/i)
    expect(streakMultiplierMessage(29)).toMatch(/two weeks/i)
  })

  it('calls out a full month from 30 days onward', () => {
    expect(streakMultiplierMessage(30)).toMatch(/month/i)
    expect(streakMultiplierMessage(365)).toMatch(/month/i)
  })
})
