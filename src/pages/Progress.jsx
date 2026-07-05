import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Flame } from 'lucide-react'
import Card from '../components/common/Card'
import ChartCard from '../components/progress/ChartCard'
import StreakCalendar from '../components/progress/StreakCalendar'
import { useAppState } from '../context/AppStateContext'
import { useTheme } from '../context/ThemeContext'
import { lastNDaysKeys, formatShortDate } from '../utils/dateUtils'
import { SURFACE_COLORS } from '../utils/themeColors'

export default function ProgressPage() {
  const { state } = useAppState()
  const { theme } = useTheme()
  const surface = SURFACE_COLORS[theme]
  const TOOLTIP_STYLE = { background: surface.card, border: `1px solid ${surface.border}`, borderRadius: 10, fontSize: 12 }
  const days14 = useMemo(() => lastNDaysKeys(14), [])

  const speakingData = useMemo(
    () => days14.map((key) => ({ day: formatShortDate(key), minutes: Math.round((state.dailyTimeSpent[key] || 0) / 60) })),
    [days14, state.dailyTimeSpent]
  )

  const vocabByDay = useMemo(() => {
    const counts = {}
    Object.values(state.vocabulary.learnedDates).forEach((date) => {
      counts[date] = (counts[date] || 0) + 1
    })
    return days14.map((key) => ({ day: formatShortDate(key), words: counts[key] || 0 }))
  }, [days14, state.vocabulary.learnedDates])

  const grammarByDay = useMemo(() => {
    const counts = {}
    state.grammarMistakes.forEach((m) => {
      counts[m.date] = (counts[m.date] || 0) + 1
    })
    return days14.map((key) => ({ day: formatShortDate(key), mistakes: counts[key] || 0 }))
  }, [days14, state.grammarMistakes])

  const confidenceData = useMemo(() => {
    const byDay = {}
    state.confidenceHistory.forEach((c) => {
      if (!byDay[c.date]) byDay[c.date] = []
      byDay[c.date].push(c.score)
    })
    return days14.map((key) => {
      const scores = byDay[key]
      const avg = scores ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
      return { day: formatShortDate(key), score: avg }
    })
  }, [days14, state.confidenceHistory])

  const vocabCategoryData = useMemo(
    () => [
      { name: 'Learned', value: state.vocabulary.learnedIds.length },
      { name: 'Needs Review', value: state.vocabulary.weakIds.length },
    ],
    [state.vocabulary]
  )

  const PIE_COLORS = ['#2dd4bf', '#fb7185']

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Your Progress</h1>
        <p className="mt-1 text-sm text-slate-400">Track your consistency and growth over the last two weeks.</p>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Flame size={16} className="text-accent-amber" /> Daily Streak — last 28 days
          </h3>
          <span className="text-xs text-slate-500">
            Current: <span className="font-semibold text-accent-amber">{state.streak.current}d</span> · Best: {state.streak.longest}d
          </span>
        </div>
        <StreakCalendar dailyTimeSpent={state.dailyTimeSpent} />
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Speaking Minutes" subtitle="Practice time per day">
          <ResponsiveContainer>
            <AreaChart data={speakingData}>
              <defs>
                <linearGradient id="speakGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3d6bff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#3d6bff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={surface.hover} vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="minutes" stroke="#3d6bff" fill="url(#speakGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vocabulary Learned" subtitle="New words marked as learned per day">
          <ResponsiveContainer>
            <BarChart data={vocabByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={surface.hover} vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="words" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Grammar Improvement" subtitle="Mistakes detected per day (lower is better)">
          <ResponsiveContainer>
            <LineChart data={grammarByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={surface.hover} vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="mistakes" stroke="#fb7185" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Confidence Score" subtitle="Average daily confidence (0-100)">
          <ResponsiveContainer>
            <LineChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={surface.hover} vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={28} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="score" stroke="#f5b942" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Vocabulary Breakdown" subtitle="Learned vs. words needing review" height={200}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={vocabCategoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
              {vocabCategoryData.map((entry, i) => (
                <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
