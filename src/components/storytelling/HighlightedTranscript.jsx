export default function HighlightedTranscript({ transcript, issues }) {
  if (!transcript) return <p className="text-sm text-slate-500">Your transcript will appear here once you start speaking.</p>
  if (!issues || issues.length === 0) {
    return <p className="text-sm leading-relaxed text-slate-200">{transcript}</p>
  }

  let remaining = transcript
  const parts = []
  let key = 0
  const uniqueOriginals = [...new Set(issues.map((i) => i.original))]

  while (remaining.length > 0) {
    let matchIndex = -1
    let matchText = ''
    uniqueOriginals.forEach((orig) => {
      const idx = remaining.toLowerCase().indexOf(orig.toLowerCase())
      if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
        matchIndex = idx
        matchText = remaining.substr(idx, orig.length)
      }
    })
    if (matchIndex === -1) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }
    if (matchIndex > 0) parts.push(<span key={key++}>{remaining.slice(0, matchIndex)}</span>)
    parts.push(
      <mark key={key++} className="rounded bg-accent-rose/20 px-1 text-accent-rose no-underline">
        {matchText}
      </mark>
    )
    remaining = remaining.slice(matchIndex + matchText.length)
  }

  return <p className="text-sm leading-relaxed text-slate-200">{parts}</p>
}
