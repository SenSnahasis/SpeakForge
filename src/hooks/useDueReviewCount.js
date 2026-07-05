import { useMemo } from 'react'
import { useAppState } from '../context/AppStateContext'
import { getDueWords } from '../utils/spacedRepetition'
import { todayKey } from '../utils/dateUtils'

export function useDueReviewCount() {
  const { state } = useAppState()
  return useMemo(() => getDueWords(state.vocabulary, todayKey()).length, [state.vocabulary])
}
