export const MOTIVATIONAL_QUOTES = [
  'Fluency is built one sentence at a time — keep speaking.',
  'Mistakes are proof that you are trying. Speak anyway.',
  'You do not need perfect grammar to be understood — you need courage.',
  'Every fluent speaker was once a beginner who kept practicing.',
  '15 minutes a day, 365 days a year — that is real progress.',
  'Speak first, correct later. Silence teaches you nothing.',
  'Your accent is not a flaw — it is proof you speak more than one language.',
  'Confidence comes from repetition, not perfection.',
  'The words you fear the most are the ones you should say today.',
  'Small daily practice beats occasional long sessions.',
  'Do not translate — think directly in English.',
  'You are not behind. You are exactly where practice takes you.',
  'Every awkward sentence today becomes a smooth one tomorrow.',
  'Speaking is a skill, not a talent — it grows with use.',
  'The goal is progress, not a perfect accent.',
  'Say it out loud — your brain learns by speaking, not just reading.',
  'One more sentence today is one step closer to fluency.',
  'Consistency turns hesitation into habit.',
  'You already understand more than you think — now practice saying it.',
  'Great speakers were built by daily repetition, not shortcuts.',
]

export function getQuoteForDay(dayIndex) {
  return MOTIVATIONAL_QUOTES[dayIndex % MOTIVATIONAL_QUOTES.length]
}
