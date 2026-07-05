export const PRACTICE_SECTIONS = [
  { key: 'warmup', label: 'Warmup', minutes: 2, icon: 'Flame', description: 'Loosen up your speaking muscles.' },
  { key: 'vocabulary', label: 'Vocabulary Builder', minutes: 3, icon: 'BookOpen', description: "Learn today's 5 new words." },
  { key: 'sentence', label: 'Sentence Builder', minutes: 3, icon: 'Wrench', description: 'Fix broken sentences and speak them.' },
  { key: 'scenario', label: 'Scenario Speaking', minutes: 4, icon: 'MessageCircle', description: 'Practice a real-life conversation.' },
  { key: 'storytelling', label: 'Storytelling', minutes: 2, icon: 'BookMarked', description: 'Speak freely on a daily prompt.' },
  { key: 'confidence', label: 'Confidence Review', minutes: 1, icon: 'Sparkles', description: "Reflect on today's session." },
]

export const TOTAL_PRACTICE_MINUTES = PRACTICE_SECTIONS.reduce((sum, s) => sum + s.minutes, 0)

export const WARMUP_PHRASES = [
  'Good morning! Today is going to be a great day.',
  'She sells seashells by the seashore.',
  'I am ready to speak English with confidence.',
  'Practice makes progress, not perfection.',
  'How much wood would a woodchuck chuck?',
  'Red lorry, yellow lorry, red lorry, yellow lorry.',
  'I can do this. I will speak clearly and slowly.',
  'The quick brown fox jumps over the lazy dog.',
  'Unique New York, unique New York, unique New York.',
  'I am excited to learn something new today.',
  'Peter Piper picked a peck of pickled peppers.',
  'Today, I will speak without fear of mistakes.',
  'Toy boat, toy boat, toy boat.',
  'I believe in my ability to improve every day.',
  'Six thick thistle sticks, six thick thistles stick.',
  'My voice is getting clearer and more confident.',
  "Fred fed Ted bread, and Ted fed Fred bread.",
  'I am proud of the progress I am making.',
  'Betty bought a bit of better butter.',
  'Every word I speak today builds my fluency.',
]

export function getWarmupSetForDay(dayIndex, count = 4) {
  const total = WARMUP_PHRASES.length
  const start = (dayIndex * count) % total
  const out = []
  for (let i = 0; i < count; i++) out.push(WARMUP_PHRASES[(start + i) % total])
  return out
}
