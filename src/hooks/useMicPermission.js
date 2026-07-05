import { useEffect, useState } from 'react'

// Proactively checks microphone permission once when the app loads, and
// requests it right away if it hasn't been decided yet — rather than waiting
// for the user to stumble into the first mic button deep inside a practice
// section. Never re-prompts on every mount; the browser remembers the
// decision, and this hook only runs once per app load.
export function useMicPermission() {
  const [status, setStatus] = useState('unknown') // 'unknown' | 'granted' | 'denied' | 'prompt' | 'unsupported'

  useEffect(() => {
    let cancelled = false

    async function checkAndRequest() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setStatus('unsupported')
        return
      }

      // Read the current state without prompting, where the browser
      // supports querying it (Safari does not support 'microphone' here).
      let currentState = null
      try {
        if (navigator.permissions?.query) {
          const result = await navigator.permissions.query({ name: 'microphone' })
          currentState = result.state
        }
      } catch {
        // Not supported — fall through and just try requesting directly.
      }

      if (currentState === 'granted') {
        if (!cancelled) setStatus('granted')
        return
      }
      if (currentState === 'denied') {
        if (!cancelled) setStatus('denied')
        return
      }

      // State is 'prompt' (undecided) or unknown — ask now, upfront.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((t) => t.stop())
        if (!cancelled) setStatus('granted')
      } catch {
        if (!cancelled) setStatus('denied')
      }
    }

    checkAndRequest()
    return () => {
      cancelled = true
    }
  }, [])

  return status
}
