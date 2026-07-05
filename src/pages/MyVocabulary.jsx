import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Library } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { getWordById } from '../data/vocabulary'
import { todayKey } from '../utils/dateUtils'
import { isDue } from '../utils/spacedRepetition'
import VocabularyWordCard from '../components/vocabulary/VocabularyWordCard'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'due', label: 'Due Now' },
  { key: 'learned', label: 'Learned' },
  { key: 'weak', label: 'Needs Review' },
]

export default function MyVocabulary() {
  const { state, reviewWord } = useAppState()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const today = todayKey()

  const words = useMemo(() => {
    const ids = new Set([...state.vocabulary.learnedIds, ...state.vocabulary.weakIds])
    return [...ids]
      .map((id) => {
        const word = getWordById(id)
        if (!word) return null
        const scheduleEntry = state.vocabulary.reviewSchedule[id]
        return {
          id,
          word,
          isLearned: state.vocabulary.learnedIds.includes(id),
          isWeak: state.vocabulary.weakIds.includes(id),
          scheduleEntry,
          due: isDue(scheduleEntry, today),
          savedSentence: state.vocabulary.sentencesByWordId[id],
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aDate = a.scheduleEntry?.nextReviewDate || '9999-99-99'
        const bDate = b.scheduleEntry?.nextReviewDate || '9999-99-99'
        if (aDate !== bDate) return aDate < bDate ? -1 : 1
        return a.word.word.localeCompare(b.word.word)
      })
  }, [state.vocabulary, today])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return words.filter((entry) => {
      if (filter === 'due' && !entry.due) return false
      if (filter === 'learned' && !entry.isLearned) return false
      if (filter === 'weak' && !entry.isWeak) return false
      if (!q) return true
      return (
        entry.word.word.toLowerCase().includes(q) ||
        entry.word.meaningBn.toLowerCase().includes(q) ||
        entry.word.category.toLowerCase().includes(q)
      )
    })
  }, [words, filter, query])

  const dueCount = words.filter((w) => w.due).length

  if (words.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-teal">
          <Library size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-50">No words yet</h1>
        <p className="text-sm text-slate-400">
          Learn a few words in Vocabulary Builder and they&apos;ll show up here so you can browse and re-practice them anytime.
        </p>
        <Button onClick={() => navigate('/practice')}>Go to Daily Practice</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">My Vocabulary</h1>
        <p className="mt-1 text-sm text-slate-400">
          {words.length} word{words.length === 1 ? '' : 's'} saved · {dueCount} due for review
        </p>
      </div>

      <Card className="space-y-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words, meanings, or categories..."
            className="w-full rounded-xl border border-line/10 bg-bg-hover/60 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key ? 'border border-brand-500/40 bg-brand-600/25 text-brand-300' : 'bg-line/5 text-slate-400 hover:bg-line/10'
              }`}
            >
              {f.label}
              {f.key === 'due' && dueCount > 0 && <span className="ml-1.5 text-accent-amber">{dueCount}</span>}
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center text-sm text-slate-500">No words match this filter.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <VocabularyWordCard
              key={entry.id}
              word={entry.word}
              isLearned={entry.isLearned}
              isWeak={entry.isWeak}
              scheduleEntry={entry.scheduleEntry}
              due={entry.due}
              savedSentence={entry.savedSentence}
              onRemembered={() => reviewWord(entry.id, true)}
              onForgot={() => reviewWord(entry.id, false)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
