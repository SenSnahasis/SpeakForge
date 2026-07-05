import { useMemo } from 'react'
import { Flame, BookOpen, Crown, Sparkles, RotateCcw, Mic2, Star, TrendingUp, SpellCheck, BookCheck, CheckCircle2 } from 'lucide-react'
import Card from '../components/common/Card'
import { useAppState } from '../context/AppStateContext'
import { getAchievementProgress } from '../utils/achievements'

const ICONS = { Flame, BookOpen, Crown, Sparkles, RotateCcw, Mic2, Star, TrendingUp, SpellCheck, BookCheck }
const CATEGORY_ORDER = ['Streak', 'Vocabulary', 'Practice', 'Speaking', 'Confidence', 'Review']

function AchievementCard({ achievement }) {
  const Icon = ICONS[achievement.icon]
  const { earned, value, target } = achievement
  const progress = Math.min(1, value / target)

  return (
    <Card className={`flex items-start gap-3 ${earned ? 'border-accent-teal/25 bg-accent-teal/5' : ''}`}>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          earned ? 'bg-accent-teal/15 text-accent-teal' : 'bg-line/5 text-slate-600'
        }`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-semibold ${earned ? 'text-slate-100' : 'text-slate-400'}`}>{achievement.title}</p>
          {earned && <CheckCircle2 size={14} className="shrink-0 text-accent-teal" />}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{achievement.description}</p>
        {!earned && (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/10">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-slate-600">
              {Math.min(value, target)} / {target}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function Achievements() {
  const { state } = useAppState()
  const achievements = useMemo(() => getAchievementProgress(state), [state])
  const earnedCount = achievements.filter((a) => a.earned).length

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: achievements.filter((a) => a.category === category),
    })).filter((g) => g.items.length > 0)
  }, [achievements])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Achievements</h1>
        <p className="mt-1 text-sm text-slate-400">
          {earnedCount} of {achievements.length} unlocked
        </p>
      </div>

      <Card>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-teal transition-all"
            style={{ width: `${(earnedCount / achievements.length) * 100}%` }}
          />
        </div>
      </Card>

      {grouped.map((group) => (
        <div key={group.category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">{group.category}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.items.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
