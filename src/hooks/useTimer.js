import { useCallback, useEffect, useRef, useState } from 'react'

// Countdown timer in seconds. onComplete fires once when it hits zero.
export function useTimer(initialSeconds, { onComplete, autoStart = false } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          onCompleteRef.current?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback((next = initialSeconds) => {
    setSecondsLeft(next)
    setIsRunning(false)
  }, [initialSeconds])

  const progress = initialSeconds > 0 ? 1 - secondsLeft / initialSeconds : 0

  return { secondsLeft, isRunning, progress, start, pause, reset }
}

// Count-up stopwatch in seconds.
export function useStopwatch({ autoStart = false } = {}) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback(() => {
    setSeconds(0)
    setIsRunning(false)
  }, [])

  return { seconds, isRunning, start, pause, reset }
}
