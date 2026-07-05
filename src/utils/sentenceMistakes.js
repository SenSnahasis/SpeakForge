// Dedupes the flat, append-only grammarMistakes log into one entry per
// distinct broken sentence, for the Sentence Mistakes practice page.
export function groupSentenceMistakes(grammarMistakes) {
  const groups = {}
  grammarMistakes
    .filter((m) => m.category === 'Sentence Builder')
    .forEach((m) => {
      if (!groups[m.original]) {
        groups[m.original] = { broken: m.original, fixed: m.corrected, tip: m.message, timesWrong: 0, lastMissedDate: m.date }
      }
      groups[m.original].timesWrong += 1
      if (m.date > groups[m.original].lastMissedDate) groups[m.original].lastMissedDate = m.date
    })
  return Object.values(groups).sort((a, b) => b.timesWrong - a.timesWrong || (a.lastMissedDate < b.lastMissedDate ? 1 : -1))
}
