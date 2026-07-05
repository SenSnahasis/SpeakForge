import { addDaysToKey } from './dateUtils'

// Leitner-box style spaced repetition. Each word sits in a box (0-5); a
// correct recall promotes it to a longer interval, a miss drops it back
// to box 0 so it resurfaces sooner.
export const INTERVAL_DAYS = [1, 2, 4, 7, 14, 30]
export const MAX_BOX = INTERVAL_DAYS.length - 1

export function advanceSchedule(entry, remembered, today) {
  const currentBox = entry?.box ?? -1
  const box = remembered ? Math.min(currentBox + 1, MAX_BOX) : 0
  return {
    box,
    nextReviewDate: addDaysToKey(today, INTERVAL_DAYS[box]),
    reviewCount: (entry?.reviewCount || 0) + 1,
    lastReviewedDate: today,
  }
}

export function isDue(entry, today) {
  return !entry || entry.nextReviewDate <= today
}

export function getDueWords(vocabularyState, today) {
  const candidateIds = new Set([...vocabularyState.learnedIds, ...vocabularyState.weakIds])
  return [...candidateIds].filter((id) => isDue(vocabularyState.reviewSchedule?.[id], today))
}

export function getNextUpcomingReviewDate(vocabularyState) {
  const dates = Object.values(vocabularyState.reviewSchedule || {}).map((e) => e.nextReviewDate)
  if (dates.length === 0) return null
  return dates.sort()[0]
}
