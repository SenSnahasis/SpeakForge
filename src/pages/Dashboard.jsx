import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, BookOpen, AlertTriangle, Gauge, Flame, CheckSquare, BookCheck, ArrowRight, Trophy } from 'lucide-react'
import { useAppState } from '../context/AppStateContext'
import StatCard from '../components/dashboard/StatCard'
import TodayPlan from '../components/dashboard/TodayPlan'
import WeeklyInsightCard from '../components/dashboard/WeeklyInsightCard'
import MotivationalQuote from '../components/common/MotivationalQuote'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import ProgressRing from '../components/common/ProgressRing'
import { todayKey } from '../utils/dateUtils'
import { scoreLabel, streakMultiplierMessage } from '../utils/scoring'
import { PRACTICE_SECTIONS } from '../data/dailyPlan'
import { useDueReviewCount } from '../hooks/useDueReviewCount'
import { getAchievementProgress } from '../utils/achievements'

export default function Dashboard() {
  const { state } = useAppState()
  const navigate = useNavigate()
  const dueReviewCount = useDueReviewCount()
  const today = todayKey()
  const completedKeys = state.completedLessons[today] || []
  const totalPracticeSeconds = Object.values(state.dailyTimeSpent).reduce((sum, s) => sum + s, 0)
  const totalMinutes = Math.round(totalPracticeSeconds / 60)
  const wordsLearned = state.vocabulary.learnedIds.length
  const grammarMistakes = state.grammarMistakes.length
  const latestConfidence = state.confidenceHistory.length
    ? state.confidenceHistory[state.confidenceHistory.length - 1].score
    : 0
  const { label: confidenceLabel, color: confidenceColor } = scoreLabel(latestConfidence)
  const completedLessonsTotal = Object.values(state.completedLessons).reduce((sum, arr) => sum + arr.length, 0)
  const achievements = getAchievementProgress(state)
  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50 md:text-3xl">
          Welcome back <span className="text-gradient">— let&apos;s speak today</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">{streakMultiplierMessage(state.streak.current)}</p>
      </div>

      <MotivationalQuote />

      {dueReviewCount > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-accent-amber/20 bg-accent-amber/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-amber/15 text-accent-amber">
              <BookCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {dueReviewCount} word{dueReviewCount === 1 ? '' : 's'} due for review
              </p>
              <p className="text-xs text-slate-500">A quick recall check keeps them from fading — takes about a minute.</p>
            </div>
          </div>
          <Button size="sm" icon={ArrowRight} onClick={() => navigate('/review')}>
            Review Now
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Flame} label="Streak" value={`${state.streak.current}d`} sublabel={`Best: ${state.streak.longest}d`} accent="#f5b942" />
        <StatCard icon={Clock} label="Speaking" value={`${totalMinutes}m`} sublabel="Total minutes" accent="#3d6bff" />
        <StatCard icon={BookOpen} label="Vocabulary" value={wordsLearned} sublabel={`${state.vocabulary.weakIds.length} need review`} accent="#2dd4bf" />
        <StatCard icon={AlertTriangle} label="Mistakes" value={grammarMistakes} sublabel="All time" accent="#fb7185" />
        <StatCard icon={CheckSquare} label="Lessons" value={completedLessonsTotal} sublabel={`${PRACTICE_SECTIONS.length} per day`} accent="#a78bfa" />
        <Card className="flex cursor-pointer items-center gap-4 transition-colors hover:bg-bg-hover/60" onClick={() => navigate('/achievements')}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: '#f5b94222', color: '#f5b942' }}>
            <Trophy size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">Achievements</p>
            <p className="text-xl font-bold text-slate-50">
              {earnedCount}/{achievements.length}
            </p>
            <p className="truncate text-xs text-slate-500">Unlocked</p>
          </div>
        </Card>
      </div>

      <WeeklyInsightCard />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayPlan completedKeys={completedKeys} />
        </div>
        <Card className="flex flex-col items-center justify-center text-center">
          <Gauge size={16} className="mb-2 text-slate-500" />
          <h3 className="mb-3 text-sm font-medium text-slate-400">Confidence Score</h3>
          <ProgressRing progress={latestConfidence / 100} size={130} strokeWidth={10} color={confidenceColor} label={`${latestConfidence}`} sublabel="/ 100" />
          <p className="mt-3 text-sm font-semibold" style={{ color: confidenceColor }}>
            {confidenceLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">Based on your last practice session</p>
        </Card>
      </div>
    </motion.div>
  )
}
