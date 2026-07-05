import { useCallback, useRef, useState } from 'react'

export function useMediaRecorder() {
  const isSupported = typeof window !== 'undefined' && !!window.MediaRecorder && !!navigator.mediaDevices
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [error, setError] = useState(null)
  const [durationSec, setDurationSec] = useState(0)
  const startTimeRef = useRef(0)

  const start = useCallback(async () => {
    if (!isSupported) return
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioURL((old) => {
          if (old) URL.revokeObjectURL(old)
          return URL.createObjectURL(blob)
        })
        setDurationSec((Date.now() - startTimeRef.current) / 1000)
        streamRef.current?.getTracks().forEach((t) => t.stop())
      }
      mediaRecorderRef.current = recorder
      startTimeRef.current = Date.now()
      recorder.start()
      setIsRecording(true)
    } catch (e) {
      setError(e.message || 'Microphone access denied')
    }
  }, [isSupported])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const reset = useCallback(() => {
    setAudioURL((old) => {
      if (old) URL.revokeObjectURL(old)
      return null
    })
    setDurationSec(0)
  }, [])

  return { isSupported, isRecording, audioURL, error, durationSec, start, stop, reset }
}
