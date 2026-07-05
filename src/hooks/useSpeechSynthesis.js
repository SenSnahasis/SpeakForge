import { useCallback, useEffect, useState } from 'react'
import { useAppState } from '../context/AppStateContext'

// Rate/voice default to the user's saved Settings preference so every call
// site picks them up automatically; callers can still override per-hook-call
// (e.g. a fixed rate for a specific drill) by passing rate/voiceURI explicitly.
export function useSpeechSynthesis(opts = {}) {
  const { state } = useAppState()
  const rate = opts.rate ?? state.settings.speechRate
  const pitch = opts.pitch ?? 1
  const voiceURI = opts.voiceURI ?? state.settings.voiceURI

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [voices, setVoices] = useState([])
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (!isSupported) return
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [isSupported])

  const speak = useCallback(
    (text, callOpts = {}) => {
      if (!isSupported || !text) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = callOpts.rate ?? rate
      utterance.pitch = callOpts.pitch ?? pitch
      const preferredVoiceURI = callOpts.voiceURI ?? voiceURI
      const chosenVoice =
        (preferredVoiceURI && voices.find((v) => v.voiceURI === preferredVoiceURI)) ||
        voices.find((v) => v.lang?.startsWith('en') && /female|Google US English|Zira|Samantha/i.test(v.name)) ||
        voices.find((v) => v.lang?.startsWith('en')) ||
        null
      if (chosenVoice) utterance.voice = chosenVoice
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, rate, pitch, voiceURI, voices]
  )

  const cancel = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [isSupported])

  return { isSupported, voices, speaking, speak, cancel }
}
