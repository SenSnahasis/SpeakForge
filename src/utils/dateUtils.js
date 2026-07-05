export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysAgoKey(n, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() - n)
  return todayKey(d)
}

export function isYesterday(dateKey, todayK = todayKey()) {
  return dateKey === daysAgoKey(1, new Date(todayK))
}

export function formatShortDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function lastNDaysKeys(n, from = new Date()) {
  const out = []
  for (let i = n - 1; i >= 0; i--) out.push(daysAgoKey(i, from))
  return out
}

export function dayOfYear(from = new Date()) {
  const start = new Date(from.getFullYear(), 0, 0)
  const diff = from - start
  return Math.floor(diff / 86400000)
}

export function addDaysToKey(dateKey, n) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + n)
  return todayKey(date)
}

export function daysBetween(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split('-').map(Number)
  const [ty, tm, td] = toKey.split('-').map(Number)
  const from = new Date(fy, fm - 1, fd)
  const to = new Date(ty, tm - 1, td)
  return Math.round((to - from) / 86400000)
}
