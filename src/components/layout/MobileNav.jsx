import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { NAV_GROUPS } from './Sidebar'
import { useDueReviewCount } from '../../hooks/useDueReviewCount'
import Modal from '../common/Modal'

// Only the 3 most-used destinations get a permanent bottom-tab slot; the
// remaining 6 pages live behind "More" so the bar doesn't get cramped as
// the nav keeps growing.
const PRIMARY_PATHS = ['/', '/practice', '/progress']

export default function MobileNav() {
  const dueCount = useDueReviewCount()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  const allItems = NAV_GROUPS.flatMap((g) => g.items)
  const primaryItems = PRIMARY_PATHS.map((path) => allItems.find((item) => item.to === path)).filter(Boolean)
  const moreGroups = NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => !PRIMARY_PATHS.includes(item.to)) })).filter(
    (group) => group.items.length > 0
  )
  const isOnMoreItem = moreGroups.some((group) => group.items.some((item) => location.pathname.startsWith(item.to)))

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-line/5 bg-bg-soft px-1 py-2 md:hidden">
        {primaryItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium ${isActive ? 'text-brand-300' : 'text-slate-500'}`
            }
          >
            <Icon size={20} />
            <span className="max-w-[64px] truncate">{label.split(' ')[0]}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium ${
            isOnMoreItem ? 'text-brand-300' : 'text-slate-500'
          }`}
        >
          <span className="relative">
            <MoreHorizontal size={20} />
            {dueCount > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent-amber" />}
          </span>
          <span>More</span>
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <div className="space-y-4">
          {moreGroups.map((group) => (
            <div key={group.label || 'root'}>
              {group.label && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.label}</p>}
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-brand-600/20 text-brand-300' : 'text-slate-300 hover:bg-line/5'
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
        </div>
      </Modal>
    </>
  )
}
