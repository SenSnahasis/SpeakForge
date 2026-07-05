import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { getQuoteForDay } from '../../data/quotes'
import { dayOfYear } from '../../utils/dateUtils'

export default function MotivationalQuote({ className = '' }) {
  const quote = getQuoteForDay(dayOfYear())
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className={`flex items-start gap-3 rounded-2xl border border-line/5 bg-gradient-to-r from-brand-900/30 to-transparent p-4 ${className}`}
    >
      <Quote size={18} className="mt-0.5 shrink-0 text-brand-400" />
      <p className="text-sm text-slate-300 italic">{quote}</p>
    </motion.div>
  )
}
