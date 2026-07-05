import { Volume2, ThumbsUp, ThumbsDown, Languages } from 'lucide-react'
import Card from '../common/Card'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { formatShortDate } from '../../utils/dateUtils'

export default function VocabularyWordCard({ word, isLearned, isWeak, scheduleEntry, due, savedSentence, onRemembered, onForgot }) {
  const { speak, speaking } = useSpeechSynthesis()

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-50">{word.word}</h3>
            <span className="rounded-full bg-brand-600/15 px-2 py-0.5 text-[11px] font-medium text-brand-300">{word.category}</span>
            {isLearned && <span className="rounded-full bg-accent-teal/15 px-2 py-0.5 text-[11px] font-medium text-accent-teal">Learned</span>}
            {isWeak && <span className="rounded-full bg-accent-amber/15 px-2 py-0.5 text-[11px] font-medium text-accent-amber">Needs Review</span>}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {due ? (
              <span className="text-accent-amber">Due for review now</span>
            ) : scheduleEntry ? (
              `Next review: ${formatShortDate(scheduleEntry.nextReviewDate)}`
            ) : (
              'Not yet scheduled'
            )}
          </p>
        </div>
        <button onClick={() => speak(word.word)} className="shrink-0 rounded-xl bg-line/5 p-2.5 text-brand-300 hover:bg-line/10" title="Hear pronunciation">
          <Volume2 size={18} className={speaking ? 'animate-pulse' : ''} />
        </button>
      </div>

      <p className="flex items-start gap-1.5 rounded-lg bg-accent-amber/10 px-3 py-2 text-sm text-accent-amber">
        <Languages size={14} className="mt-0.5 shrink-0" /> {word.meaningBn}
      </p>
      <p className="text-sm italic text-slate-400">{word.example}</p>
      {savedSentence && (
        <p className="text-sm text-slate-300">
          <span className="text-slate-500">Your sentence: </span>
          {savedSentence}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onForgot}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent-rose hover:bg-accent-rose/10"
        >
          <ThumbsDown size={14} /> I Forgot
        </button>
        <button
          onClick={onRemembered}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent-teal hover:bg-accent-teal/10"
        >
          <ThumbsUp size={14} /> I Remembered
        </button>
      </div>
    </Card>
  )
}
