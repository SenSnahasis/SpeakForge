// Lightweight, rule-based grammar checker for common beginner mistakes.
// This runs entirely client-side (no backend/AI API) and targets the
// highest-frequency errors made by Bengali-native English learners.

const THIRD_PERSON_VERBS = {
  go: 'goes', have: 'has', do: 'does', want: 'wants', like: 'likes',
  need: 'needs', make: 'makes', take: 'takes', say: 'says', know: 'knows',
  think: 'thinks', see: 'sees', get: 'gets', work: 'works', speak: 'speaks',
  play: 'plays', live: 'lives', love: 'loves', watch: 'watches', study: 'studies',
}

const RULES = [
  {
    category: 'Subject-Verb Agreement',
    test: (text) => {
      const re = /\b(he|she|it)\s+(go|have|do|want|like|need|make|take|say|know|think|see|get|work|speak|play|live|love|watch|study)\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: `${m[1]} ${THIRD_PERSON_VERBS[m[2].toLowerCase()]}`,
        message: `Use "${THIRD_PERSON_VERBS[m[2].toLowerCase()]}" after he/she/it (subject-verb agreement).`,
      }))
    },
  },
  {
    category: 'Article Usage',
    test: (text) => {
      const re = /\ba\s+([aeiouAEIOU]\w*)/g
      return [...text.matchAll(re)]
        .filter((m) => !/^(uni|user|eur|one)/i.test(m[1]))
        .map((m) => ({
          match: m[0],
          index: m.index,
          fix: `an ${m[1]}`,
          message: `Use "an" before a word starting with a vowel sound.`,
        }))
    },
  },
  {
    category: 'Double Negative',
    test: (text) => {
      const re = /\b(don't|doesn't|didn't|can't|won't|isn't|aren't)\s+(?:\w+\s+){0,3}?no\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: m[0].replace(/\bno\b/i, 'any'),
        message: 'Avoid double negatives — use "any" instead of "no" here.',
      }))
    },
  },
  {
    category: 'Countable/Uncountable',
    test: (text) => {
      const re = /\bmuch\s+(people|friends|things|books|words|days|problems|ideas|questions)\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: `many ${m[1]}`,
        message: `Use "many" with countable plural nouns, not "much".`,
      }))
    },
  },
  {
    category: 'Redundant Comparative',
    test: (text) => {
      const re = /\bmore\s+(\w+er)\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: m[1],
        message: `"${m[1]}" is already comparative — no need for "more".`,
      }))
    },
  },
  {
    category: 'Verb Pattern',
    test: (text) => {
      const re = /\bdiscuss about\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: 'discuss',
        message: '"Discuss" is not followed by "about".',
      }))
    },
  },
  {
    category: 'Verb Pattern',
    test: (text) => {
      const re = /\bexplain about\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: 'explain',
        message: '"Explain" is not followed by "about".',
      }))
    },
  },
  {
    category: 'Fixed Expression',
    test: (text) => {
      const re = /\bi am agree\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: 'I agree',
        message: '"Agree" is a verb — no "am" needed ("I agree", not "I am agree").',
      }))
    },
  },
  {
    category: 'Fixed Expression',
    test: (text) => {
      const re = /\bit is depend on\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: 'it depends on',
        message: 'Use "it depends on", not "it is depend on".',
      }))
    },
  },
  {
    category: 'Repeated Word',
    test: (text) => {
      const re = /\b(\w+)\s+\1\b/gi
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index,
        fix: m[1],
        message: `Repeated word "${m[1]}" — likely a slip while speaking.`,
      }))
    },
  },
]

// Fix templates are written lowercase; if the matched text was
// capitalized (e.g. starts a sentence), carry that capitalization over
// so "It is depend on" doesn't get "corrected" to a lowercase "it depends on".
function preserveLeadingCase(original, replacement) {
  if (!original || !replacement) return replacement
  const firstChar = original[0]
  if (firstChar !== firstChar.toUpperCase() || firstChar === firstChar.toLowerCase()) return replacement
  return replacement[0].toUpperCase() + replacement.slice(1)
}

export function checkGrammar(text) {
  if (!text || !text.trim()) return { corrected: text, issues: [] }
  let corrected = text
  const issues = []
  RULES.forEach((rule) => {
    const hits = rule.test(text)
    hits.forEach((hit) => {
      const fix = preserveLeadingCase(hit.match, hit.fix)
      issues.push({
        category: rule.category,
        original: hit.match,
        corrected: fix,
        message: hit.message,
      })
      corrected = corrected.split(hit.match).join(fix)
    })
  })
  return { corrected, issues }
}

export function countFillerWords(text) {
  const fillers = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'hmm']
  const lower = (text || '').toLowerCase()
  let count = 0
  fillers.forEach((f) => {
    const re = new RegExp(`\\b${f}\\b`, 'g')
    const m = lower.match(re)
    if (m) count += m.length
  })
  return count
}
