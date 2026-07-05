import { Link } from 'react-router-dom'
import StreakBadge from '../common/StreakBadge'
import ThemeToggle from '../common/ThemeToggle'
import { useAppState } from '../../context/AppStateContext'
import { Mic2, Settings } from 'lucide-react'

export default function Topbar({ title }) {
  const { state } = useAppState()
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/5 bg-bg/95 px-4 py-3.5 md:px-8">
      <Link to="/" className="flex items-center gap-2 md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-teal">
          <Mic2 size={14} className="text-white" />
        </div>
        <span className="font-bold text-slate-100">SpeakForge</span>
      </Link>
      <h1 className="hidden text-lg font-semibold text-slate-100 md:block">{title}</h1>
      <div className="flex items-center gap-3">
        <Link
          to="/settings"
          aria-label="Settings"
          title="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line/10 bg-line/5 text-slate-400 transition-colors hover:text-slate-100"
        >
          <Settings size={16} />
        </Link>
        <ThemeToggle />
        <StreakBadge streak={state.streak.current} />
      </div>
    </header>
  )
}
