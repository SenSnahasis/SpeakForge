import { motion } from 'framer-motion'

const VARIANTS = {
  primary: 'bg-gradient-to-r from-brand-500 to-accent-teal text-white shadow-glow hover:brightness-110',
  secondary: 'bg-bg-hover text-slate-100 border border-line/10 hover:bg-bg-card',
  ghost: 'bg-transparent text-slate-300 hover:text-slate-100 hover:bg-line/5',
  danger: 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30 hover:bg-accent-rose/25',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', icon: Icon, disabled, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </motion.button>
  )
}
