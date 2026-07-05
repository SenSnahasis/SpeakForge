import { useMemo, useState } from 'react'
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import SectionShell from './SectionShell'
import Card from '../common/Card'
import Button from '../common/Button'
import ProgressRing from '../common/ProgressRing'
import { useTimer } from '../../hooks/useTimer'
import { computeConfidenceScore, scoreLabel } from '../../utils/scoring'

const MOODS = [
  { key: 'nervous', label: 'Nervous', delta: -8 },
  { key: 'okay', label: 'Okay', delta: 0 },
  { key: 'good', label: 'Good', delta: 5 },
  { key: 'confident', label: 'Confident', delta: 10 },
]

export default function ConfidenceReview({ durationSeconds, sessionSummary, onComplete }) {
  const [mood, setMood] = useState('okay')

  const baseScore = useMemo(
    () =>
      computeConfidenceScore({
        speakingSeconds: sessionSummary.speakingSeconds,
        fillerCount: sessionSummary.fillerCount,
        grammarIssues: sessionSummary.grammarIssues.length,
        pronunciationAccuracy: sessionSummary.pronunciationAccuracy ?? 80,
        wordCount: sessionSummary.wordCount,
      }),
    [sessionSummary]
  )

  const moodDelta = MOODS.find((m) => m.key === mood)?.delta ?? 0
  const finalScore = Math.max(5, Math.min(100, baseScore + moodDelta))
  const { label, color } = scoreLabel(finalScore)

  const finish = () => onComplete({ score: finalScore })
  const { secondsLeft, progress } = useTimer(durationSeconds, { autoStart: true, onComplete: finish })

  const topIssues = sessionSummary.grammarIssues.slice(0, 4)

  return (
    <SectionShell
      title="Confidence Review"
      description="A quick look at how today's session went."
      secondsLeft={secondsLeft}
      progress={progress}
      onNext={finish}
      nextLabel="Finish Practice"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col items-center justify-center py-6 text-center">
          <ProgressRing progress={finalScore / 100} size={120} strokeWidth={10} color={color} label={finalScore} sublabel="/ 100" />
          <p className="mt-3 text-sm font-semibold" style={{ color }}>
            {label}
          </p>
          <p className="mt-3 text-xs text-slate-500">How did speaking feel today?</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMood(m.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  mood === m.key ? 'bg-brand-600/25 text-brand-300 border border-brand-500/40' : 'bg-line/5 text-slate-400 hover:bg-line/10'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Sparkles size={16} className="text-accent-amber" /> Session Summary
          </h3>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-line/[0.03] p-3">
              <p className="text-lg font-bold text-slate-100">{sessionSummary.wordCount}</p>
              <p className="text-[11px] text-slate-500">Words Spoken</p>
            </div>
            <div className="rounded-xl bg-line/[0.03] p-3">
              <p className="text-lg font-bold text-slate-100">{sessionSummary.grammarIssues.length}</p>
              <p className="text-[11px] text-slate-500">Grammar Issues</p>
            </div>
          </div>

          {topIssues.length > 0 ? (
            <div className="space-y-1.5">
              {topIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                  <AlertCircle size={13} className="mt-0.5 shrink-0 text-accent-amber" />
                  <span>
                    <span className="text-accent-rose line-through">{issue.original}</span> → <span className="text-accent-teal">{issue.corrected}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-accent-teal">
              <CheckCircle2 size={14} /> No major grammar issues today!
            </div>
          )}
        </Card>
      </div>
    </SectionShell>
  )
}
