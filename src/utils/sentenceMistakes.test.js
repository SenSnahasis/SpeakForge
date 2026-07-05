import { describe, it, expect } from 'vitest'
import { groupSentenceMistakes } from './sentenceMistakes'

describe('groupSentenceMistakes', () => {
  it('returns an empty array when there are no mistakes', () => {
    expect(groupSentenceMistakes([])).toEqual([])
  })

  it('ignores mistakes from categories other than Sentence Builder', () => {
    const mistakes = [{ date: '2026-07-01', category: 'Subject-Verb Agreement', original: 'He go', corrected: 'He goes', message: 'x' }]
    expect(groupSentenceMistakes(mistakes)).toEqual([])
  })

  it('groups repeated mistakes on the same sentence into one entry with a count', () => {
    const mistakes = [
      { date: '2026-07-01', category: 'Sentence Builder', original: 'She go to office every day.', corrected: 'She goes to office every day.', message: 'Add -es' },
      { date: '2026-07-03', category: 'Sentence Builder', original: 'She go to office every day.', corrected: 'She goes to office every day.', message: 'Add -es' },
    ]
    const grouped = groupSentenceMistakes(mistakes)
    expect(grouped).toHaveLength(1)
    expect(grouped[0]).toMatchObject({
      broken: 'She go to office every day.',
      fixed: 'She goes to office every day.',
      tip: 'Add -es',
      timesWrong: 2,
      lastMissedDate: '2026-07-03',
    })
  })

  it('tracks the most recent date across repeated mistakes regardless of log order', () => {
    const mistakes = [
      { date: '2026-07-05', category: 'Sentence Builder', original: 'X', corrected: 'Y', message: 'm' },
      { date: '2026-07-01', category: 'Sentence Builder', original: 'X', corrected: 'Y', message: 'm' },
    ]
    expect(groupSentenceMistakes(mistakes)[0].lastMissedDate).toBe('2026-07-05')
  })

  it('keeps distinct sentences as separate entries', () => {
    const mistakes = [
      { date: '2026-07-01', category: 'Sentence Builder', original: 'A', corrected: 'a', message: 'm' },
      { date: '2026-07-01', category: 'Sentence Builder', original: 'B', corrected: 'b', message: 'm' },
    ]
    expect(groupSentenceMistakes(mistakes)).toHaveLength(2)
  })

  it('sorts most-missed sentences first', () => {
    const mistakes = [
      { date: '2026-07-01', category: 'Sentence Builder', original: 'Once', corrected: 'once', message: 'm' },
      { date: '2026-07-01', category: 'Sentence Builder', original: 'Twice', corrected: 'twice', message: 'm' },
      { date: '2026-07-02', category: 'Sentence Builder', original: 'Twice', corrected: 'twice', message: 'm' },
    ]
    const grouped = groupSentenceMistakes(mistakes)
    expect(grouped[0].broken).toBe('Twice')
    expect(grouped[0].timesWrong).toBe(2)
    expect(grouped[1].broken).toBe('Once')
  })

  it('breaks ties in mistake count by most recent date first', () => {
    const mistakes = [
      { date: '2026-07-01', category: 'Sentence Builder', original: 'Older', corrected: 'x', message: 'm' },
      { date: '2026-07-05', category: 'Sentence Builder', original: 'Newer', corrected: 'x', message: 'm' },
    ]
    const grouped = groupSentenceMistakes(mistakes)
    expect(grouped[0].broken).toBe('Newer')
    expect(grouped[1].broken).toBe('Older')
  })
})
