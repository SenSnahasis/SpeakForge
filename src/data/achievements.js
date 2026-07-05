// Achievement definitions are purely derived from existing state — no new
// data model needed. Each is "earned" once getValue(state) >= target.
export const ACHIEVEMENTS = [
  // Streak
  { id: 'streak-3', category: 'Streak', title: '3-Day Streak', description: 'Practice 3 days in a row.', icon: 'Flame', target: 3, getValue: (s) => s.streak.longest },
  { id: 'streak-7', category: 'Streak', title: 'Week Warrior', description: 'Practice 7 days in a row.', icon: 'Flame', target: 7, getValue: (s) => s.streak.longest },
  { id: 'streak-14', category: 'Streak', title: 'Two-Week Habit', description: 'Practice 14 days in a row.', icon: 'Flame', target: 14, getValue: (s) => s.streak.longest },
  { id: 'streak-30', category: 'Streak', title: 'Monthly Master', description: 'Practice 30 days in a row.', icon: 'Flame', target: 30, getValue: (s) => s.streak.longest },

  // Vocabulary
  { id: 'vocab-10', category: 'Vocabulary', title: 'Word Collector', description: 'Learn 10 words.', icon: 'BookOpen', target: 10, getValue: (s) => s.vocabulary.learnedIds.length },
  { id: 'vocab-25', category: 'Vocabulary', title: 'Word Hoarder', description: 'Learn 25 words.', icon: 'BookOpen', target: 25, getValue: (s) => s.vocabulary.learnedIds.length },
  { id: 'vocab-50', category: 'Vocabulary', title: 'Vocabulary Builder', description: 'Learn 50 words.', icon: 'BookOpen', target: 50, getValue: (s) => s.vocabulary.learnedIds.length },
  { id: 'vocab-100', category: 'Vocabulary', title: 'Word Master', description: 'Learn 100 words.', icon: 'BookOpen', target: 100, getValue: (s) => s.vocabulary.learnedIds.length },
  { id: 'vocab-200', category: 'Vocabulary', title: 'Lexicon Legend', description: 'Learn all 200 words.', icon: 'Crown', target: 200, getValue: (s) => s.vocabulary.learnedIds.length },

  // Practice
  { id: 'lesson-1', category: 'Practice', title: 'First Steps', description: 'Complete your first practice section.', icon: 'Sparkles', target: 1, getValue: (s) => Object.values(s.completedLessons).reduce((sum, arr) => sum + arr.length, 0) },
  { id: 'lesson-30', category: 'Practice', title: 'Dedicated Learner', description: 'Complete 30 practice sections.', icon: 'Sparkles', target: 30, getValue: (s) => Object.values(s.completedLessons).reduce((sum, arr) => sum + arr.length, 0) },
  { id: 'lesson-100', category: 'Practice', title: 'Practice Pro', description: 'Complete 100 practice sections.', icon: 'Sparkles', target: 100, getValue: (s) => Object.values(s.completedLessons).reduce((sum, arr) => sum + arr.length, 0) },
  { id: 'bonus-1', category: 'Practice', title: 'Overachiever', description: 'Complete a bonus practice round after finishing the day.', icon: 'RotateCcw', target: 1, getValue: (s) => Object.values(s.bonusRounds).reduce((sum, n) => sum + n, 0) },

  // Speaking
  { id: 'speak-10', category: 'Speaking', title: 'Getting Vocal', description: 'Practice for 10 minutes total.', icon: 'Mic2', target: 10, getValue: (s) => Math.round(Object.values(s.dailyTimeSpent).reduce((sum, sec) => sum + sec, 0) / 60) },
  { id: 'speak-60', category: 'Speaking', title: 'Chatterbox', description: 'Practice for 60 minutes total.', icon: 'Mic2', target: 60, getValue: (s) => Math.round(Object.values(s.dailyTimeSpent).reduce((sum, sec) => sum + sec, 0) / 60) },
  { id: 'speak-300', category: 'Speaking', title: 'Fluency Marathon', description: 'Practice for 300 minutes total.', icon: 'Mic2', target: 300, getValue: (s) => Math.round(Object.values(s.dailyTimeSpent).reduce((sum, sec) => sum + sec, 0) / 60) },
  { id: 'pronunciation-great', category: 'Speaking', title: 'Perfect Pitch', description: 'Score 95% or higher on a pronunciation attempt.', icon: 'Star', target: 1, getValue: (s) => s.speakingSessions.filter((sess) => sess.type === 'pronunciation' && sess.score >= 95).length },

  // Confidence
  { id: 'confidence-85', category: 'Confidence', title: 'Confident Speaker', description: 'Reach a confidence score of 85 or higher.', icon: 'TrendingUp', target: 1, getValue: (s) => s.confidenceHistory.filter((c) => c.score >= 85).length },

  // Review
  { id: 'sentence-fix-1', category: 'Review', title: 'Self-Corrector', description: 'Fix a sentence you got wrong on a retry.', icon: 'SpellCheck', target: 1, getValue: (s) => Object.values(s.sentencePractice).filter((p) => p.lastCorrect).length },
  { id: 'review-1', category: 'Review', title: 'Memory Keeper', description: 'Successfully recall a word during spaced review.', icon: 'BookCheck', target: 1, getValue: (s) => Object.values(s.vocabulary.reviewSchedule).filter((r) => r.box >= 1).length },
]
