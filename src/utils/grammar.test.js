import { describe, it, expect } from 'vitest'
import { checkGrammar, countFillerWords } from './grammar'

describe('checkGrammar', () => {
  it('returns no issues and echoes the input for clean text', () => {
    const result = checkGrammar('I go to school every day.')
    expect(result.issues).toHaveLength(0)
    expect(result.corrected).toBe('I go to school every day.')
  })

  it('returns the original text untouched for empty or whitespace-only input', () => {
    expect(checkGrammar('')).toEqual({ corrected: '', issues: [] })
    expect(checkGrammar('   ')).toEqual({ corrected: '   ', issues: [] })
  })

  it('flags subject-verb agreement mistakes after he/she/it', () => {
    const result = checkGrammar('She go to office every day.')
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toMatchObject({
      category: 'Subject-Verb Agreement',
      original: 'She go',
      corrected: 'She goes',
    })
    expect(result.corrected).toBe('She goes to office every day.')
  })

  it('flags "a" before a vowel sound as an article mistake', () => {
    const result = checkGrammar('I saw a elephant yesterday.')
    expect(result.issues[0]).toMatchObject({ category: 'Article Usage', original: 'a elephant', corrected: 'an elephant' })
    expect(result.corrected).toBe('I saw an elephant yesterday.')
  })

  it('does not flag words like "university" that sound consonant-led', () => {
    const result = checkGrammar('She goes to a university nearby.')
    expect(result.issues).toHaveLength(0)
  })

  it('flags double negatives and swaps "no" for "any"', () => {
    const result = checkGrammar("I don't have no money.")
    expect(result.issues[0].category).toBe('Double Negative')
    expect(result.corrected).toBe("I don't have any money.")
  })

  it('flags "much" with a countable plural noun', () => {
    const result = checkGrammar('There are much problems here.')
    expect(result.issues[0]).toMatchObject({ category: 'Countable/Uncountable', corrected: 'many problems' })
    expect(result.corrected).toBe('There are many problems here.')
  })

  it('flags a redundant "more" before an already-comparative adjective', () => {
    const result = checkGrammar('This is more better than that.')
    expect(result.issues[0]).toMatchObject({ category: 'Redundant Comparative', corrected: 'better' })
    expect(result.corrected).toBe('This is better than that.')
  })

  it('flags "discuss about" and "explain about" as verb pattern mistakes', () => {
    const discussResult = checkGrammar('Let us discuss about your plan.')
    expect(discussResult.corrected).toBe('Let us discuss your plan.')

    const explainResult = checkGrammar('Please explain about this topic.')
    expect(explainResult.corrected).toBe('Please explain this topic.')
  })

  it('flags the fixed expressions "I am agree" and "it is depend on"', () => {
    expect(checkGrammar('I am agree with you.').corrected).toBe('I agree with you.')
    expect(checkGrammar('It is depend on the weather.').corrected).toBe('It depends on the weather.')
  })

  it('preserves sentence-initial capitalization on lowercase fix templates', () => {
    // Regression: "it is depend on" -> "it depends on" is hardcoded lowercase,
    // so a capitalized match must not get lowercased in the corrected output.
    const result = checkGrammar('It is depend on you.')
    expect(result.issues[0].corrected).toBe('It depends on')
    expect(result.corrected).toBe('It depends on you.')
  })

  it('flags an immediately repeated word', () => {
    const result = checkGrammar('I want want to go home.')
    expect(result.issues[0].category).toBe('Repeated Word')
    expect(result.corrected).toBe('I want to go home.')
  })

  it('detects multiple distinct issues in the same sentence', () => {
    const result = checkGrammar("He go to a university, but he don't have no time.")
    const categories = result.issues.map((i) => i.category)
    expect(categories).toContain('Subject-Verb Agreement')
    expect(categories).toContain('Double Negative')
    expect(categories).not.toContain('Article Usage')
  })
})

describe('countFillerWords', () => {
  it('returns 0 for text with no filler words', () => {
    expect(countFillerWords('I would love to schedule a meeting tomorrow.')).toBe(0)
  })

  it('returns 0 for empty or undefined input', () => {
    expect(countFillerWords('')).toBe(0)
    expect(countFillerWords(undefined)).toBe(0)
  })

  it('counts single-word fillers', () => {
    expect(countFillerWords('Um, I think we should, uh, leave now.')).toBe(2)
  })

  it('counts the multi-word filler "you know"', () => {
    expect(countFillerWords('It was, you know, a difficult day.')).toBe(1)
  })

  it('counts repeated fillers and is case-insensitive', () => {
    // "like" x2, "basically" x1, "actually" x1, "hmm" x1
    expect(countFillerWords('Like, I basically, like, actually forgot. Hmm.')).toBe(5)
  })

  it('does not count filler-like substrings inside other words', () => {
    expect(countFillerWords('I dislike umbrellas and hummus.')).toBe(0)
  })
})
