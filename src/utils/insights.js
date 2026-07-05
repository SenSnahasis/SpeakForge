// Builds the data summary fed to the AI for the Dashboard's Weekly Insight
// card, and decides when it's due to be regenerated. Kept separate from the
// component so the thresholds/logic are easy to unit test.
import { getWordById } from '../data/vocabulary'
import { daysBetween } from './dateUtils'

const MIN_MISTAKES = 3
const MIN_WORDS_LEARNED = 5
const MIN_SESSIONS = 3
const REGENERATE_AFTER_DAYS = 7

export function hasEnoughDataForInsight(state) {
  return (
    state.grammarMistakes.length >= MIN_MISTAKES ||
    state.vocabulary.learnedIds.length >= MIN_WORDS_LEARNED ||
    state.speakingSessions.length >= MIN_SESSIONS
  )
}

export function shouldRegenerateInsight(weeklyInsight, today) {
  if (!weeklyInsight?.generatedAt) return true
  return daysBetween(weeklyInsight.generatedAt, today) >= REGENERATE_AFTER_DAYS
}

function topEntries(counts, n = 3) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

export function buildInsightSummary(state) {
  const mistakeCounts = {}
  state.grammarMistakes.forEach((m) => {
    mistakeCounts[m.category] = (mistakeCounts[m.category] || 0) + 1
  })
  const topMistakes = topEntries(mistakeCounts).map(([cat, count]) => `${cat} (${count}x)`)

  const weakCategoryCounts = {}
  state.vocabulary.weakIds.forEach((id) => {
    const word = getWordById(id)
    if (word) weakCategoryCounts[word.category] = (weakCategoryCounts[word.category] || 0) + 1
  })
  const topWeakCategories = topEntries(weakCategoryCounts).map(([cat, count]) => `${cat} (${count} words)`)

  const latestConfidence = state.confidenceHistory.length ? state.confidenceHistory[state.confidenceHistory.length - 1].score : null

  const lines = [
    `Current streak: ${state.streak.current} day(s) (longest ever: ${state.streak.longest} days)`,
    `Words learned: ${state.vocabulary.learnedIds.length}`,
    `Words currently needing review: ${state.vocabulary.weakIds.length}`,
    `Total grammar mistakes logged: ${state.grammarMistakes.length}`,
    topMistakes.length ? `Most frequent mistake types: ${topMistakes.join(', ')}` : null,
    topWeakCategories.length ? `Vocabulary topics with the most difficulty: ${topWeakCategories.join(', ')}` : null,
    `Speaking sessions completed: ${state.speakingSessions.length}`,
    latestConfidence !== null ? `Latest confidence score: ${latestConfidence}/100` : null,
  ].filter(Boolean)

  return lines.join('\n')
}
