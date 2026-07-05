import { lastNDaysKeys, formatShortDate } from '../../utils/dateUtils'
import { useTheme } from '../../context/ThemeContext'
import { STREAK_INTENSITY_COLORS } from '../../utils/themeColors'

export default function StreakCalendar({ dailyTimeSpent, days = 28 }) {
  const { theme } = useTheme()
  const keys = lastNDaysKeys(days)
  const colors = STREAK_INTENSITY_COLORS[theme]
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.map((key) => {
        const seconds = dailyTimeSpent[key] || 0
        const intensity = seconds === 0 ? 0 : seconds < 300 ? 1 : seconds < 600 ? 2 : seconds < 900 ? 3 : 4
        return (
          <div
            key={key}
            title={`${formatShortDate(key)}: ${Math.round(seconds / 60)} min`}
            className="h-4 w-4 rounded-[4px]"
            style={{ backgroundColor: colors[intensity] }}
          />
        )
      })}
    </div>
  )
}
