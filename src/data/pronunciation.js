export const PRONUNCIATION_PHRASES = [
  { text: 'The weather is beautiful today.', level: 'Easy' },
  { text: 'I would like to schedule a meeting for tomorrow.', level: 'Medium' },
  { text: 'She sells seashells by the seashore.', level: 'Hard' },
  { text: 'Could you please help me with this problem?', level: 'Easy' },
  { text: 'Communication skills are essential for professional growth.', level: 'Hard' },
  { text: 'I am really looking forward to the weekend.', level: 'Easy' },
  { text: 'Unfortunately, the flight was delayed by three hours.', level: 'Medium' },
  { text: 'Practice makes a person more confident over time.', level: 'Medium' },
  { text: 'Thoroughly reviewing the report is necessary before submission.', level: 'Hard' },
  { text: 'Let us discuss the plan during lunch.', level: 'Easy' },
  { text: 'The entrepreneur launched a successful startup last year.', level: 'Hard' },
  { text: 'Please remember to bring your identification card.', level: 'Medium' },
  { text: 'Six thick thistle sticks lay on the table.', level: 'Hard' },
  { text: 'I appreciate your patience and understanding.', level: 'Medium' },
  { text: 'Can we reschedule our appointment to next week?', level: 'Medium' },
]

export function getPhraseForIndex(index) {
  return PRONUNCIATION_PHRASES[index % PRONUNCIATION_PHRASES.length]
}
