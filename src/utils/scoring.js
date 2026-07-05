// Confidence score blends fluency signals into a single 0-100 number.
// speakingSeconds: how long the user spoke, fillerCount: hesitation words,
// grammarIssues: count of detected mistakes, pronunciationAccuracy: 0-100.
export function computeConfidenceScore({
  speakingSeconds = 0,
  fillerCount = 0,
  grammarIssues = 0,
  pronunciationAccuracy = 80,
  wordCount = 0,
}) {
  const fluencyBase = Math.min(100, (wordCount / Math.max(speakingSeconds, 1)) * 60 * 8)
  const fillerPenalty = Math.min(30, fillerCount * 5)
  const grammarPenalty = Math.min(30, grammarIssues * 6)
  const pronunciationWeighted = pronunciationAccuracy * 0.4

  const raw = fluencyBase * 0.35 + pronunciationWeighted + 25 - fillerPenalty - grammarPenalty
  return Math.max(5, Math.min(100, Math.round(raw)))
}

export function scoreLabel(score) {
  if (score >= 85) return { label: 'Confident', color: '#2dd4bf' }
  if (score >= 65) return { label: 'Improving', color: '#5c8bff' }
  if (score >= 45) return { label: 'Building Up', color: '#f5b942' }
  return { label: 'Keep Practicing', color: '#fb7185' }
}

export function streakMultiplierMessage(streak) {
  if (streak >= 30) return "One month strong. You're building a real habit!"
  if (streak >= 14) return 'Two weeks in — fluency is becoming a habit.'
  if (streak >= 7) return "A full week! Your consistency is paying off."
  if (streak >= 3) return 'Nice momentum — keep the streak alive today.'
  return 'Every day counts. Start your streak today!'
}
