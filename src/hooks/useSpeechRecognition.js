import { useCallback, useEffect, useRef, useState } from 'react'

function getRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
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
            finalTranscriptRef.current += result[0].transcript + ' '
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
