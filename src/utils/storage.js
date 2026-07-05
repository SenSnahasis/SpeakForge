import { todayKey, addDaysToKey } from './dateUtils'

const STORAGE_KEY = 'speakforge:v1'

export function defaultState() {
  return {
    streak: { current: 0, longest: 0, lastPracticeDate: null, history: {} },
    vocabulary: { learnedIds: [], weakIds: [], sentencesByWordId: {}, learnedDates: {}, reviewSchedule: {} },
    speakingSessions: [],
    grammarMistakes: [],
    confidenceHistory: [],
    completedLessons: {},
    dailyTimeSpent: {},
    totalSpeakingSeconds: 0,
    // Retry-practice log for the Sentence Mistakes page, keyed by the broken
    // sentence text: { attempts, correct, lastAttemptDate, lastCorrect }
    sentencePractice: {},
    // How many "bonus" replays of the daily plan happened on a given day
    // ("YYYY-MM-DD" -> count), used to shift content rotation so a redo
    // shows fresh words/sentences/scenario/prompt instead of repeats.
    bonusRounds: {},
    settings: { hintsEnabled: true, speechRate: 0.95, voiceURI: null, lastVisitDate: null },
    // AI-generated progress summary, cached so it's regenerated at most
    // roughly once a week instead of on every Dashboard visit.
    weeklyInsight: { text: null, generatedAt: null },
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    const defaults = defaultState()
    return {
      ...defaults,
      ...parsed,
      vocabulary: { ...defaults.vocabulary, ...parsed.vocabulary },
      settings: { ...defaults.settings, ...parsed.settings },
      weeklyInsight: { ...defaults.weeklyInsight, ...parsed.weeklyInsight },
    }
  } catch (e) {
    console.warn('Failed to load SpeakForge state, resetting.', e)
    return defaultState()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save SpeakForge state', e)
  }
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY)
  return defaultState()
}

export function exportStateJSON() {
  return localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultState())
}

// Parses + validates a backup file's contents, defensively merges it against
// fresh defaults (same as loadState, so a backup from an older app version
// missing newer fields doesn't break), writes it to localStorage, and
// returns the merged object so the caller can push it into live state too.
export function importStateJSON(jsonString) {
  let parsed
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error("That file isn't valid JSON.")
  }
  if (!parsed || typeof parsed !== 'object' || !parsed.streak || !parsed.vocabulary) {
    throw new Error("That file doesn't look like a SpeakForge backup.")
  }
  const defaults = defaultState()
  const merged = {
    ...defaults,
    ...parsed,
    vocabulary: { ...defaults.vocabulary, ...parsed.vocabulary },
    settings: { ...defaults.settings, ...parsed.settings },
    weeklyInsight: { ...defaults.weeklyInsight, ...parsed.weeklyInsight },
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  return merged
}

// Streak logic: call once per session start.
export function computeStreakUpdate(streak, today = todayKey()) {
  if (streak.lastPracticeDate === today) return streak
  // Computed relative to the `today` argument (not the real system clock) so
  // this stays correct and testable regardless of what "today" is passed in.
  const yesterday = addDaysToKey(today, -1)
  if (streak.lastPracticeDate === yesterday) {
    const current = streak.current + 1
    return { ...streak, current, longest: Math.max(streak.longest, current), lastPracticeDate: today }
  }
  if (streak.lastPracticeDate === null) {
    return { ...streak, current: 1, longest: Math.max(streak.longest, 1), lastPracticeDate: today }
  }
  // streak broken
  return { ...streak, current: 1, lastPracticeDate: today }
}
