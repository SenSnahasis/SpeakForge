import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadState, saveState, resetState, computeStreakUpdate, importStateJSON } from '../utils/storage'
import { todayKey } from '../utils/dateUtils'
import { advanceSchedule } from '../utils/spacedRepetition'

const AppStateContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const recordPracticeTime = useCallback((seconds) => {
    setState((prev) => {
      const today = todayKey()
      const streak = computeStreakUpdate(prev.streak, today)
      const dailyTimeSpent = { ...prev.dailyTimeSpent, [today]: (prev.dailyTimeSpent[today] || 0) + seconds }
      return { ...prev, streak, dailyTimeSpent }
    })
  }, [])

  const completeLessonSection = useCallback((sectionKey) => {
    setState((prev) => {
      const today = todayKey()
      const existing = prev.completedLessons[today] || []
      if (existing.includes(sectionKey)) return prev
      return {
        ...prev,
        completedLessons: { ...prev.completedLessons, [today]: [...existing, sectionKey] },
      }
    })
  }, [])

  const markWordLearned = useCallback((wordId) => {
    setState((prev) => {
      const today = todayKey()
      const learnedIds = prev.vocabulary.learnedIds.includes(wordId)
        ? prev.vocabulary.learnedIds
        : [...prev.vocabulary.learnedIds, wordId]
      const weakIds = prev.vocabulary.weakIds.filter((id) => id !== wordId)
      const learnedDates = prev.vocabulary.learnedDates[wordId]
        ? prev.vocabulary.learnedDates
        : { ...prev.vocabulary.learnedDates, [wordId]: today }
      const reviewSchedule = {
        ...prev.vocabulary.reviewSchedule,
        [wordId]: advanceSchedule(prev.vocabulary.reviewSchedule[wordId], true, today),
      }
      return { ...prev, vocabulary: { ...prev.vocabulary, learnedIds, weakIds, learnedDates, reviewSchedule } }
    })
  }, [])

  const markWordWeak = useCallback((wordId) => {
    setState((prev) => {
      const today = todayKey()
      const weakIds = prev.vocabulary.weakIds.includes(wordId)
        ? prev.vocabulary.weakIds
        : [...prev.vocabulary.weakIds, wordId]
      const reviewSchedule = {
        ...prev.vocabulary.reviewSchedule,
        [wordId]: advanceSchedule(prev.vocabulary.reviewSchedule[wordId], false, today),
      }
      return { ...prev, vocabulary: { ...prev.vocabulary, weakIds, reviewSchedule } }
    })
  }, [])

  // Used by the spaced-repetition Review flow: recalculates the word's
  // Leitner box/next-due-date and keeps learned/weak lists in sync with
  // whether the user actually recalled it this time.
  const reviewWord = useCallback((wordId, remembered) => {
    setState((prev) => {
      const today = todayKey()
      const reviewSchedule = {
        ...prev.vocabulary.reviewSchedule,
        [wordId]: advanceSchedule(prev.vocabulary.reviewSchedule[wordId], remembered, today),
      }
      const learnedIds =
        remembered && !prev.vocabulary.learnedIds.includes(wordId)
          ? [...prev.vocabulary.learnedIds, wordId]
          : prev.vocabulary.learnedIds
      const weakIds = remembered
        ? prev.vocabulary.weakIds.filter((id) => id !== wordId)
        : prev.vocabulary.weakIds.includes(wordId)
          ? prev.vocabulary.weakIds
          : [...prev.vocabulary.weakIds, wordId]
      const learnedDates =
        remembered && !prev.vocabulary.learnedDates[wordId]
          ? { ...prev.vocabulary.learnedDates, [wordId]: today }
          : prev.vocabulary.learnedDates
      return { ...prev, vocabulary: { ...prev.vocabulary, reviewSchedule, learnedIds, weakIds, learnedDates } }
    })
  }, [])

  const saveVocabSentence = useCallback((wordId, sentence) => {
    setState((prev) => ({
      ...prev,
      vocabulary: {
        ...prev.vocabulary,
        sentencesByWordId: { ...prev.vocabulary.sentencesByWordId, [wordId]: sentence },
      },
    }))
  }, [])

  const addSpeakingSession = useCallback((session) => {
    setState((prev) => ({
      ...prev,
      speakingSessions: [...prev.speakingSessions, { id: `${Date.now()}-${Math.round(session.durationSec || 0)}`, date: todayKey(), ...session }],
      totalSpeakingSeconds: prev.totalSpeakingSeconds + (session.durationSec || 0),
    }))
  }, [])

  const addGrammarMistakes = useCallback((issues) => {
    if (!issues || issues.length === 0) return
    setState((prev) => ({
      ...prev,
      grammarMistakes: [
        ...prev.grammarMistakes,
        ...issues.map((issue, i) => ({ id: `${Date.now()}-${i}`, date: todayKey(), ...issue })),
      ],
    }))
  }, [])

  // Used by the Sentence Mistakes page's retry practice widget — tracks
  // attempts/correctness per broken-sentence text, separate from the
  // historical grammarMistakes log (which stays an append-only record).
  const recordSentencePractice = useCallback((brokenText, wasCorrect) => {
    setState((prev) => {
      const today = todayKey()
      const existing = prev.sentencePractice[brokenText] || { attempts: 0, correct: 0 }
      return {
        ...prev,
        sentencePractice: {
          ...prev.sentencePractice,
          [brokenText]: {
            attempts: existing.attempts + 1,
            correct: existing.correct + (wasCorrect ? 1 : 0),
            lastAttemptDate: today,
            lastCorrect: wasCorrect,
          },
        },
      }
    })
  }, [])

  // Called once when the user starts a redo of an already-completed daily
  // plan, so the practice page can shift content rotation (fresh words,
  // sentences, scenario, prompt) instead of repeating the exact same set.
  const startBonusRound = useCallback(() => {
    setState((prev) => {
      const today = todayKey()
      return { ...prev, bonusRounds: { ...prev.bonusRounds, [today]: (prev.bonusRounds[today] || 0) + 1 } }
    })
  }, [])

  const addConfidenceScore = useCallback((score) => {
    setState((prev) => ({
      ...prev,
      confidenceHistory: [...prev.confidenceHistory, { date: todayKey(), score, ts: prev.confidenceHistory.length }],
    }))
  }, [])

  const updateSettings = useCallback((patch) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const updateWeeklyInsight = useCallback((text) => {
    setState((prev) => ({ ...prev, weeklyInsight: { text, generatedAt: todayKey() } }))
  }, [])

  const resetAll = useCallback(() => {
    setState(resetState())
  }, [])

  // Restores from a backup file's raw JSON text. Throws (caller should
  // catch) if the file isn't valid JSON or doesn't look like a backup.
  const restoreFromBackup = useCallback((jsonString) => {
    const merged = importStateJSON(jsonString)
    setState(merged)
  }, [])

  const value = useMemo(
    () => ({
      state,
      recordPracticeTime,
      completeLessonSection,
      markWordLearned,
      markWordWeak,
      reviewWord,
      saveVocabSentence,
      addSpeakingSession,
      addGrammarMistakes,
      recordSentencePractice,
      startBonusRound,
      addConfidenceScore,
      updateSettings,
      updateWeeklyInsight,
      resetAll,
      restoreFromBackup,
    }),
    [
      state,
      recordPracticeTime,
      completeLessonSection,
      markWordLearned,
      markWordWeak,
      reviewWord,
      saveVocabSentence,
      addSpeakingSession,
      addGrammarMistakes,
      recordSentencePractice,
      startBonusRound,
      addConfidenceScore,
      updateSettings,
      updateWeeklyInsight,
      resetAll,
      restoreFromBackup,
    ]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
