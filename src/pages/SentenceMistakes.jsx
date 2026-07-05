import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpellCheck } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import { groupSentenceMistakes } from '../utils/sentenceMistakes'
import SentenceMistakeCard from '../components/sentences/SentenceMistakeCard'
import Button from '../components/common/Button'

export default function SentenceMistakes() {
  const { state, recordSentencePractice } = useAppState()
  const navigate = useNavigate()

  const mistakes = useMemo(() => groupSentenceMistakes(state.grammarMistakes), [state.grammarMistakes])
  const totalTimesWrong = useMemo(() => mistakes.reduce((sum, m) => sum + m.timesWrong, 0), [mistakes])

  if (mistakes.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-teal">
          <SpellCheck size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-50">No sentence mistakes yet</h1>
        <p className="text-sm text-slate-400">
          Sentences you get wrong in Sentence Builder will show up here so you can practice them again anytime.
        </p>
        <Button onClick={() => navigate('/practice')}>Go to Daily Practice</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Sentence Mistakes</h1>
        <p className="mt-1 text-sm text-slate-400">
          {mistakes.length} sentence{mistakes.length === 1 ? '' : 's'} to practice · missed {totalTimesWrong} time{totalTimesWrong === 1 ? '' : 's'} total
        </p>
      </div>

      <div className="space-y-3">
        {mistakes.map((m) => (
          <SentenceMistakeCard
            key={m.broken}
            broken={m.broken}
            fixed={m.fixed}
            tip={m.tip}
            timesWrong={m.timesWrong}
            lastMissedDate={m.lastMissedDate}
            practiceInfo={state.sentencePractice[m.broken]}
            onPracticeResult={(wasCorrect) => recordSentencePractice(m.broken, wasCorrect)}
          />
        ))}
      </div>
    </div>
  )
}
