function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordLevenshtein(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function pronunciationScore(expected, actual) {
  const expWords = normalize(expected).split(' ').filter(Boolean)
  const actWords = normalize(actual).split(' ').filter(Boolean)
  if (expWords.length === 0) return 0
  const dist = wordLevenshtein(expWords, actWords)
  const score = Math.max(0, 1 - dist / expWords.length) * 100
  return Math.round(score)
}

export function diffWords(expected, actual) {
  const expWords = normalize(expected).split(' ').filter(Boolean)
  const actWords = normalize(actual).split(' ').filter(Boolean)
  const matched = new Set()
  actWords.forEach((w) => {
    if (expWords.includes(w)) matched.add(w)
  })
  return {
    matchedCount: matched.size,
    totalExpected: expWords.length,
    missed: expWords.filter((w) => !actWords.includes(w)),
  }
}
