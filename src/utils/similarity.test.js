import { describe, it, expect } from 'vitest'
import { pronunciationScore, diffWords } from './similarity'

describe('pronunciationScore', () => {
  it('scores an exact match as 100', () => {
    expect(pronunciationScore('Hello there', 'Hello there')).toBe(100)
  })

  it('is case- and punctuation-insensitive', () => {
    expect(pronunciationScore('Hello there!', 'hello, there')).toBe(100)
  })

  it('scores a completely missing transcript as 0', () => {
    expect(pronunciationScore('The weather is beautiful today', '')).toBe(0)
  })

  it('returns 0 when the expected phrase itself is empty', () => {
    expect(pronunciationScore('', 'hello')).toBe(0)
  })

  it('scores a partial match proportionally to word-level edit distance', () => {
    // ['one','two','three'] vs ['one','three'] -> edit distance 1 of 3 words
    expect(pronunciationScore('one two three', 'one three')).toBe(67)
  })

  it('collapses extra whitespace before comparing', () => {
    expect(pronunciationScore('one two', 'one    two')).toBe(100)
  })
})

describe('diffWords', () => {
  it('reports full match with no missed words', () => {
    expect(diffWords('hello there', 'hello there')).toEqual({ matchedCount: 2, totalExpected: 2, missed: [] })
  })

  it('lists expected words that never appeared in the transcript', () => {
    expect(diffWords('one two three', 'one three')).toEqual({ matchedCount: 2, totalExpected: 3, missed: ['two'] })
  })

  it('reports zero matches and every word missed for an empty transcript', () => {
    expect(diffWords('one two', '')).toEqual({ matchedCount: 0, totalExpected: 2, missed: ['one', 'two'] })
  })

  it('does not count extra words the transcript said beyond what was expected', () => {
    const result = diffWords('hello', 'hello world extra')
    expect(result.matchedCount).toBe(1)
    expect(result.missed).toEqual([])
  })
})
