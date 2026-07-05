import { useTheme } from '../../context/ThemeContext'
import { SURFACE_COLORS } from '../../utils/themeColors'

export default function ProgressRing({ progress = 0, size = 88, strokeWidth = 8, color = '#3d6bff', trackColor, label, sublabel }) {
  const { theme } = useTheme()
  const resolvedTrackColor = trackColor || SURFACE_COLORS[theme].hover
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))
  const offset = circumference * (1 - clamped)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={resolvedTrackColor} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && <span className="text-lg font-semibold text-slate-100">{label}</span>}
        {sublabel && <span className="text-[10px] uppercase tracking-wide text-slate-400">{sublabel}</span>}
      </div>
    </div>
  )
}
