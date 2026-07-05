import { useCallback, useEffect, useRef, useState } from 'react'

function getRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

const MAX_OVERLAP_WORDS = 8

// When continuous-mode restarts on Android, the new session sometimes
// genuinely re-transcribes a sliver of audio from just before the restart —
// producing a "new" final result (by index) whose beginning duplicates the
// tail of what's already been committed. This finds the longest word-level
// overlap between the end of `existing` and the start of `incoming`, and
// returns only the non-overlapping remainder of `incoming` to append.
// Capped to a small window so it can only ever trim a short echo, never
// swallow a genuinely new, coincidentally-repeated phrase.
function trimOverlap(existing, incoming) {
  const existingWords = existing.trim().split(/\s+/).filter(Boolean)
  const incomingWords = incoming.trim().split(/\s+/).filter(Boolean)
  if (!existingWords.length || !incomingWords.length) return incoming

  const maxLen = Math.min(existingWords.length, incomingWords.length, MAX_OVERLAP_WORDS)
  for (let len = maxLen; len > 0; len--) {
    const tail = existingWords.slice(-len).join(' ').toLowerCase()
    const head = incomingWords.slice(0, len).join(' ').toLowerCase()
    if (tail === head) {
      return incomingWords.slice(len).join(' ')
    }
  }
  return incoming
}

export function useSpeechRecognition({ continuous = true, interimResults = true, lang = 'en-US' } = {}) {
  const Ctor = getRecognitionCtor()
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const finalTranscriptRef = useRef('')
  // How many entries of the *current* recognition session's results array
  // have already been committed to finalTranscriptRef. Some Android Chrome
  // builds misreport event.resultIndex and/or re-deliver the same final
  // result across multiple onresult events (especially around the
  // continuous-mode auto-restart below), which without this guard causes
  // the same words to be appended repeatedly, producing a "stuttering"
  // transcript like "like like what like what kind like what kind of...".
  const committedCountRef = useRef(0)

  useEffect(() => {
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = lang

    recognition.onresult = (event) => {
      let interim = ''
      // Iterate every result each time rather than trusting resultIndex —
      // it's not reliable on all Android builds — and only append a final
      // result if we haven't already committed that index this session.
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          if (i >= committedCountRef.current) {
            const toAppend = trimOverlap(finalTranscriptRef.current, result[0].transcript)
            if (toAppend) finalTranscriptRef.current += toAppend + ' '
            committedCountRef.current = i + 1
          }
        } else {
          interim += result[0].transcript
        }
      }
      setTranscript(finalTranscriptRef.current.trim())
      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      setError(event.error)
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      setIsListening((wasListening) => {
        if (wasListening && continuous) {
          // A new internal session means the browser resets its own
          // results array back to index 0, so our commit watermark must
          // reset too — but the accumulated transcript itself must not be
          // cleared, since this restart is invisible to the user.
          committedCountRef.current = 0
          // A brief delay before restarting reduces (though doesn't fully
          // eliminate) the chance of the OS re-processing a sliver of
          // overlapping audio into a duplicate result right at the seam.
          setTimeout(() => {
            try {
              recognition.start()
            } catch {
              /* already started, or component unmounted */
            }
          }, 250)
          return true
        }
        return false
      })
    }

    recognitionRef.current = recognition
    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try {
        recognition.stop()
      } catch {
        /* noop */
      }
    }
  }, [Ctor, continuous, interimResults, lang])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    finalTranscriptRef.current = ''
    committedCountRef.current = 0
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      /* already started */
    }
  }, [])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    setIsListening(false)
    try {
      recognitionRef.current.stop()
    } catch {
      /* noop */
    }
  }, [])

  const reset = useCallback(() => {
    finalTranscriptRef.current = ''
    committedCountRef.current = 0
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isSupported: !!Ctor,
    isListening,
    transcript,
    interimTranscript,
    fullTranscript: (transcript + ' ' + interimTranscript).trim(),
    error,
    start,
    stop,
    reset,
  }
}
