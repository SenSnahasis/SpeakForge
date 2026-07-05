import { ACHIEVEMENTS } from '../data/achievements'

export function getAchievementProgress(state) {
  return ACHIEVEMENTS.map((def) => {
    const value = def.getValue(state) || 0
    return { ...def, value, earned: value >= def.target }
  })
}

export function getEarnedCount(state) {
  return getAchievementProgress(state).filter((a) => a.earned).length
}
