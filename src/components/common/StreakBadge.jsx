import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

export default function StreakBadge({ streak }) {
  const active = streak > 0
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
        active ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30' : 'bg-line/5 text-slate-400 border border-line/10'
      }`}
    >
      <Flame size={16} className={active ? 'fill-accent-amber/40' : ''} />
      {streak} day{streak === 1 ? '' : 's'}
    </motion.div>
  )
}
