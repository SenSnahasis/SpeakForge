import { useEffect, useState } from 'react'

// Generic localStorage-backed state for small, isolated UI preferences
// (the main app data goes through AppStateContext instead).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable */
    }
  }, [key, value])

  return [value, setValue]
}
