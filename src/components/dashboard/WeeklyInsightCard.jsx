import { useEffect, useState } from 'react'
import { Sparkles, RotateCcw } from 'lucide-react'
import Card from '../common/Card'
import { useAppState } from '../../context/AppStateContext'
import { askAI } from '../../utils/aiClient'
import { hasEnoughDataForInsight, shouldRegenerateInsight, buildInsightSummary } from '../../utils/insights'
import { todayKey, daysBetween } from '../../utils/dateUtils'

const SYSTEM_PROMPT =
  "You are a supportive English-learning coach reviewing a beginner-to-intermediate student's practice data. Write ONE short, encouraging paragraph (3-4 sentences): mention their momentum or strengths, then one specific area to focus on next based on the data. Reply in plain conversational text only — no markdown, no bullet points, no bold text."

export default function WeeklyInsightCard() {
  const { state, updateWeeklyInsight } = useAppState()
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const enoughData = hasEnoughDataForInsight(state)

  const generate = async () => {
    setLoading(true)
    setFailed(false)
    const summary = buildInsightSummary(state)
    const reply = await askAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: summary },
    ])
    setLoading(false)
    if (reply) updateWeeklyInsight(reply)
    else setFailed(true)
  }

  useEffect(() => {
    if (enoughData && shouldRegenerateInsight(state.weeklyInsight, todayKey())) generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!enoughData && !state.weeklyInsight?.text) {
    return (
      <Card className="flex items-start gap-3">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-brand-300" />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Weekly Insight</h3>
          <p className="mt-1 text-xs text-slate-500">
            Keep practicing — once you&apos;ve logged a bit more activity, a personalized insight about your progress will show up
            here.
          </p>
        </div>
      </Card>
    )
  }

  const daysAgo = state.weeklyInsight?.generatedAt ? daysBetween(state.weeklyInsight.generatedAt, todayKey()) : null

  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Sparkles size={16} className="text-brand-300" /> Weekly Insight
        </h3>
        <button
          onClick={generate}
          disabled={loading}
          className="text-slate-500 hover:text-slate-300 disabled:opacity-50"
          title="Refresh insight"
        >
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {state.weeklyInsight?.text ? (
        <>
          <p className="text-sm text-slate-300">{state.weeklyInsight.text}</p>
          <p className="text-[11px] text-slate-600">
            {daysAgo === 0 ? 'Generated today' : `Generated ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`}
          </p>
        </>
      ) : loading ? (
        <p className="text-xs text-slate-500">Analyzing your progress...</p>
      ) : failed ? (
        <p className="text-xs text-accent-amber">AI insight isn&apos;t available right now — check back later.</p>
      ) : null}
    </Card>
  )
}
