import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, as: As = motion.div, ...props }) {
  return (
    <As
      className={`glass-card rounded-2xl shadow-card p-5 ${hover ? 'transition-colors hover:bg-bg-hover/60' : ''} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </As>
  )
}
