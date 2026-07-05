import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, Mic2, MessageSquareText, AudioLines, BookMarked, BookCheck, Library, SpellCheck, LineChart, Trophy, Sparkles } from 'lucide-react'
import { useDueReviewCount } from '../../hooks/useDueReviewCount'

// Grouped so both the desktop sidebar (section labels) and the mobile
// "More" sheet can render a scannable structure instead of one flat list
// of 9 items. NAV_ITEMS (flat) is derived below for places that just need
// "all pages" (title lookups, etc.).
const NAV_GROUPS = [
  {
    label: null,
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Practice',
    items: [
      { to: '/practice', label: 'Daily Practice', icon: Sparkles },
      { to: '/speaking-partner', label: 'AI Speaking Partner', icon: MessageSquareText },
      { to: '/pronunciation', label: 'Pronunciation', icon: AudioLines },
      { to: '/storytelling', label: 'Storytelling', icon: BookMarked },
    ],
  },
  {
    label: 'Review',
    items: [
      { to: '/vocabulary', label: 'My Vocabulary', icon: Library },
      { to: '/review', label: 'Vocabulary Review', icon: BookCheck },
      { to: '/sentence-mistakes', label: 'Sentence Mistakes', icon: SpellCheck },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/progress', label: 'Progress', icon: LineChart },
      { to: '/achievements', label: 'Achievements', icon: Trophy },
    ],
  },
]

const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

export default function Sidebar() {
  const dueCount = useDueReviewCount()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-line/5 md:bg-bg-soft/60 md:px-4 md:py-6">
      <Link to="/" className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-teal">
          <Mic2 size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-100">SpeakForge</span>
      </Link>
      <nav className="flex flex-1 flex-col">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label || 'root'} className={gi > 0 ? 'mt-5' : ''}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">{group.label}</p>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:bg-line/5 hover:text-slate-100'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="flex-1">{label}</span>
                  {to === '/review' && dueCount > 0 && (
                    <span className="rounded-full bg-accent-amber/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-amber">{dueCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-2 py-3 text-xs text-slate-500">15 minutes a day. That&apos;s all it takes.</div>
    </aside>
  )
}

export { NAV_ITEMS, NAV_GROUPS }
