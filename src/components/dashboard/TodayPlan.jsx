import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, ArrowRight, RotateCcw, Flame, BookOpen, Wrench, MessageCircle, BookMarked, Sparkles } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import ProgressRing from '../common/ProgressRing'
import { PRACTICE_SECTIONS, TOTAL_PRACTICE_MINUTES } from '../../data/dailyPlan'

const ICONS = { Flame, BookOpen, Wrench, MessageCircle, BookMarked, Sparkles }

export default function TodayPlan({ completedKeys }) {
  const navigate = useNavigate()
  const completedCount = PRACTICE_SECTIONS.filter((s) => completedKeys.includes(s.key)).length
  const allDone = completedCount === PRACTICE_SECTIONS.length

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Today&apos;s 15-Minute Plan</h2>
          <p className="text-xs text-slate-500">{TOTAL_PRACTICE_MINUTES} minutes across 6 focused sections</p>
        </div>
        <ProgressRing
          progress={completedCount / PRACTICE_SECTIONS.length}
          size={60}
          strokeWidth={6}
          color="#2dd4bf"
          label={`${completedCount}/${PRACTICE_SECTIONS.length}`}
        />
      </div>

      <ul className="space-y-2">
        {PRACTICE_SECTIONS.map((section) => {
          const Icon = ICONS[section.icon]
          const done = completedKeys.includes(section.key)
          return (
            <li
              key={section.key}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                done ? 'border-accent-teal/20 bg-accent-teal/5' : 'border-line/5 bg-line/[0.02]'
              }`}
            >
              {done ? <CheckCircle2 size={18} className="shrink-0 text-accent-teal" /> : <Circle size={18} className="shrink-0 text-slate-600" />}
              <Icon size={16} className="shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${done ? 'text-slate-300 line-through decoration-slate-600' : 'text-slate-200'}`}>{section.label}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{section.minutes} min</span>
            </li>
          )
        })}
      </ul>

      <Button className="mt-5 w-full" icon={allDone ? RotateCcw : ArrowRight} onClick={() => navigate('/practice')}>
        {allDone ? 'Practice Again (Fresh Content)' : completedCount > 0 ? 'Continue Practice' : 'Start 15-Minute Practice'}
      </Button>
      {allDone && <p className="mt-2 text-center text-xs text-slate-500">Today&apos;s plan is done — do another round with new words, sentences, and prompts.</p>}
    </Card>
  )
}
