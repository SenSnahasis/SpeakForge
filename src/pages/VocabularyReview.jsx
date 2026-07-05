import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Languages, ThumbsDown, ThumbsUp, BookCheck, CalendarClock, PartyPopper } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useAppState } from '../context/AppStateContext'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { getDueWords, getNextUpcomingReviewDate } from '../utils/spacedRepetition'
import { getWordById } from '../data/vocabulary'
import { todayKey, formatShortDate } from '../utils/dateUtils'

export default function VocabularyReview() {
  const { state, reviewWord } = useAppState()
  const navigate = useNavigate()
  const { speak, speaking } = useSpeechSynthesis()

  const dueWords = useMemo(
    () => getDueWords(state.vocabulary, todayKey()).map(getWordById).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ remembered: 0, forgot: 0 })
  const [done, setDone] = useState(dueWords.length === 0)

  const current = dueWords[index]

  const respond = (remembered) => {
    reviewWord(current.id, remembered)
    setStats((s) => ({ ...s, [remembered ? 'remembered' : 'forgot']: s[remembered ? 'remembered' : 'forgot'] + 1 }))
    if (index + 1 >= dueWords.length) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
      setRevealed(false)
    }
  }

  if (dueWords.length === 0) {
    const nextDate = getNextUpcomingReviewDate(state.vocabulary)
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-teal">
          <BookCheck size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-50">All caught up!</h1>
        <p className="text-sm text-slate-400">
          {nextDate
            ? `No words are due for review right now. Your next review unlocks around ${formatShortDate(nextDate)}.`
            : 'Learn a few words in Vocabulary Builder and they will show up here for spaced review.'}
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={() => navigate('/practice')}>
            Go to Daily Practice
          </Button>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-teal">
          <PartyPopper size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-50">Review Complete!</h1>
        <p className="text-sm text-slate-400">
          You remembered {stats.remembered} of {dueWords.length} words. {stats.forgot > 0 ? "The ones you forgot will come back sooner." : 'Great recall today!'}
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={() => navigate('/progress')}>
            View Progress
          </Button>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-50">
          <CalendarClock size={22} className="text-brand-300" /> Vocabulary Review
        </h1>
        <p className="mt-1 text-sm text-slate-400">Words you learned earlier, resurfacing right when you're about to forget them.</p>
      </div>

      <div className="flex gap-1.5">
        {dueWords.map((w, i) => (
          <div key={w.id} className={`h-1.5 flex-1 rounded-full ${i < index ? 'bg-accent-teal' : i === index ? 'bg-brand-500' : 'bg-line/10'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="space-y-5 py-8 text-center">
            <span className="mx-auto rounded-full bg-brand-600/15 px-2.5 py-0.5 text-[11px] font-medium text-brand-300">{current.category}</span>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl font-bold text-slate-50">{current.word}</h2>
              <button onClick={() => speak(current.word)} className="rounded-xl bg-line/5 p-2.5 text-brand-300 hover:bg-line/10">
                <Volume2 size={20} className={speaking ? 'animate-pulse' : ''} />
              </button>
            </div>

            {!revealed ? (
              <Button variant="secondary" icon={Languages} onClick={() => setRevealed(true)}>
                Reveal Meaning
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="rounded-lg bg-accent-amber/10 px-3 py-2 text-sm text-accent-amber">{current.meaningBn}</p>
                <p className="text-sm italic text-slate-400">{current.example}</p>
              </div>
            )}

            {revealed && (
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="danger" icon={ThumbsDown} onClick={() => respond(false)}>
                  I Forgot
                </Button>
                <Button icon={ThumbsUp} onClick={() => respond(true)}>
                  I Remembered
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
