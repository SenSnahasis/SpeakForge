import { motion } from 'framer-motion'
import Timer from '../common/Timer'
import Button from '../common/Button'
import { ArrowRight } from 'lucide-react'

export default function SectionShell({ title, description, secondsLeft, progress, children, onNext, nextLabel = 'Next Section', nextDisabled = false }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-50">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <Timer secondsLeft={secondsLeft} progress={progress} size={72} />
      </div>

      <div>{children}</div>

      <div className="flex justify-end pt-2">
        <Button icon={ArrowRight} onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      </div>
    </motion.div>
  )
}
