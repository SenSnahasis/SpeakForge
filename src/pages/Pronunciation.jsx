import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Mic, Square, Play, Pause, ArrowRight, History } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import { useAppState } from '../context/AppStateContext'
import { PRONUNCIATION_PHRASES, getPhraseForIndex } from '../data/pronunciation'
import { pronunciationScore, diffWords } from '../utils/similarity'

const LEVEL_COLOR = { Easy: '#2dd4bf', Medium: '#f5b942', Hard: '#fb7185' }

export default function Pronunciation() {
  const { state, addSpeakingSession } = useAppState()
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const phrase = getPhraseForIndex(index)
  const { speak, speaking } = useSpeechSynthesis()
  const { isSupported: recSupported, isListening, fullTranscript, start: startRec, stop: stopRec, reset: resetRec } = useSpeechRecognition({ continuous: true })
  const { isSupported: recorderSupported, isRecording, audioURL, start: startRecorder, stop: stopRecorder, reset: resetRecorder } = useMediaRecorder()

  const history = state.speakingSessions.filter((s) => s.type === 'pronunciation').slice(-5).reverse()

  const beginAttempt = () => {
    setResult(null)
    resetRec()
    resetRecorder()
    if (recSupported) startRec()
    if (recorderSupported) startRecorder()
  }

  const stopAttempt = () => {
    if (isListening) stopRec()
    if (isRecording) stopRecorder()
    const transcript = fullTranscript.trim()
    const score = pronunciationScore(phrase.text, transcript)
    const diff = diffWords(phrase.text, transcript)
    setResult({ transcript, score, diff })
    addSpeakingSession({ type: 'pronunciation', phrase: phrase.text, score, durationSec: Math.max(2, transcript.split(' ').length * 0.4) })
  }

  const nextPhrase = () => {
    setIndex((i) => (i + 1) % PRONUNCIATION_PHRASES.length)
    setResult(null)
    resetRec()
    resetRecorder()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Pronunciation Practice</h1>
        <p className="mt-1 text-sm text-slate-400">Record yourself, replay it, and get an instant accuracy score.</p>
      </div>

      <Card className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${LEVEL_COLOR[phrase.level]}22`, color: LEVEL_COLOR[phrase.level] }}>
              {phrase.level}
            </span>
            <p className="mt-2 text-lg font-medium text-slate-100">{phrase.text}</p>
          </div>
          <button onClick={() => speak(phrase.text)} className="shrink-0 rounded-xl bg-line/5 p-3 text-brand-300 hover:bg-line/10">
            <Volume2 size={20} className={speaking ? 'animate-pulse' : ''} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line/5 bg-line/[0.02] py-6">
          {!isListening && !isRecording ? (
            <Button icon={Mic} onClick={beginAttempt}>
              Start Recording
            </Button>
          ) : (
            <Button icon={Square} variant="danger" onClick={stopAttempt}>
              Stop &amp; Score
            </Button>
          )}
          {(isListening || isRecording) && fullTranscript && <p className="max-w-md text-center text-xs text-slate-400">{fullTranscript}</p>}
          {!recSupported && <p className="text-xs text-accent-amber">Speech recognition not supported in this browser.</p>}
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-2xl border border-line/5 bg-line/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Your accuracy score</p>
              <p className={`text-2xl font-bold ${result.score >= 80 ? 'text-accent-teal' : result.score >= 55 ? 'text-accent-amber' : 'text-accent-rose'}`}>
                {result.score}%
              </p>
            </div>
            <p className="text-sm text-slate-300">
              You said: <span className="italic text-slate-200">{result.transcript || '(nothing detected)'}</span>
            </p>
            {result.diff.missed.length > 0 && (
              <p className="text-xs text-accent-rose">Missed or mispronounced: {result.diff.missed.join(', ')}</p>
            )}
            {audioURL && (
              <div className="flex items-center gap-2">
                <audio src={audioURL} id="pron-audio" className="hidden" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
                <button
                  onClick={() => {
                    const el = document.getElementById('pron-audio')
                    if (isPlaying) el.pause()
                    else el.play()
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-line/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-line/10"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? 'Pause' : 'Replay My Voice'}
                </button>
              </div>
            )}
            <Button size="sm" icon={ArrowRight} onClick={nextPhrase}>
              Next Phrase
            </Button>
          </motion.div>
        )}
      </Card>

      {history.length > 0 && (
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <History size={16} /> Recent Attempts
          </h3>
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl bg-line/[0.02] px-3 py-2 text-sm">
                <span className="truncate text-slate-400">{h.phrase}</span>
                <span className={`shrink-0 font-semibold ${h.score >= 80 ? 'text-accent-teal' : h.score >= 55 ? 'text-accent-amber' : 'text-accent-rose'}`}>{h.score}%</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
