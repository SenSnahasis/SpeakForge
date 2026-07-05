import ProgressRing from './ProgressRing'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Timer({ secondsLeft, progress, size = 96, color = '#3d6bff' }) {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      color={color}
      label={formatTime(secondsLeft)}
      sublabel="left"
    />
  )
}

export { formatTime }
