import { useEffect, useState } from 'react'
import { Mic, Square, Play, Pause, RotateCcw, Sparkles } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import HighlightedTranscript from './HighlightedTranscript'
import { useMediaRecorder } from '../../hooks/useMediaRecorder'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { checkGrammar, countFillerWords } from '../../utils/grammar'
import { askAI } from '../../utils/aiClient'

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function StorySession({ prompt, maxSeconds = 120, onSessionEnd }) {
  const { isSupported: recorderSupported, isRecording, audioURL, start: startRecorder, stop: stopRecorder, reset: resetRecorder } = useMediaRecorder()
  const { isSupported: recognitionSupported, isListening, fullTranscript, start: startRecognition, stop: stopRecognition, reset: resetRecognition } = useSpeechRecognition({ continuous: true })
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFailed, setAiFailed] = useState(false)

  useEffect(() => {
    if (!isRecording) return
    const id = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= maxSeconds) {
          finishSession()
          return maxSeconds
        }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording])

  const begin = () => {
    setFinished(false)
    setAnalysis(null)
    setElapsed(0)
    setAiFeedback(null)
    setAiFailed(false)
    resetRecorder()
    resetRecognition()
    if (recorderSupported) startRecorder()
    if (recognitionSupported) startRecognition()
  }

  const finishSession = () => {
    if (recorderSupported) stopRecorder()
    if (recognitionSupported) stopRecognition()
    setFinished(true)
  }

  useEffect(() => {
    if (!finished) return
    const transcript = fullTranscript.trim()
    const { issues } = checkGrammar(transcript)
    const fillers = countFillerWords(transcript)
    const wordCount = transcript.split(/\s+/).filter(Boolean).length
    const result = { transcript, issues, fillers, wordCount, durationSec: elapsed }
    setAnalysis(result)
    onSessionEnd?.(result, audioURL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const reset = () => {
    setFinished(false)
    setAnalysis(null)
    setElapsed(0)
    setAiFeedback(null)
    setAiFailed(false)
    resetRecorder()
    resetRecognition()
  }

  const getAIFeedback = async () => {
    setAiLoading(true)
    setAiFailed(false)
    const messages = [
      {
        role: 'system',
        content:
          "You are a supportive English speaking coach. Reply in plain conversational text only — no markdown, no bullet points, no bold text. Give brief, encouraging feedback (3-4 short sentences) on a beginner-to-intermediate learner's spoken story: mention one specific strength and one specific thing to improve (fluency, vocabulary, or grammar). Keep it simple and friendly.",
      },
      { role: 'user', content: `Prompt: "${prompt}"\nWhat they said: "${analysis?.transcript}"` },
    ]
    const reply = await askAI(messages)
    setAiLoading(false)
    if (reply) setAiFeedback(reply)
    else setAiFailed(true)
  }

  return (
    <div className="space-y-4">
      <Card className="bg-brand-900/10">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Today&apos;s Prompt</p>
        <p className="mt-1 text-base text-slate-100">{prompt}</p>
      </Card>

      <Card className="flex flex-col items-center gap-4 py-8">
        <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${isRecording ? 'border-accent-rose/60' : 'border-line/10'}`}>
          {isRecording && <span className="absolute h-24 w-24 rounded-full border-2 border-accent-rose/40 animate-pulse-ring" />}
          <span className="text-xl font-bold text-slate-100">{formatClock(elapsed)}</span>
        </div>
        <p className="text-xs text-slate-500">Speak for up to {formatClock(maxSeconds)}</p>

        {!isRecording && !finished && (
          <Button icon={Mic} onClick={begin}>
            Start Speaking
          </Button>
        )}
        {isRecording && (
          <Button icon={Square} variant="danger" onClick={finishSession}>
            Stop Recording
          </Button>
        )}
        {finished && (
          <Button icon={RotateCcw} variant="secondary" onClick={reset}>
            Record Again
          </Button>
        )}

        {!recorderSupported && <p className="text-xs text-accent-amber">Microphone recording isn&apos;t available in this browser.</p>}
      </Card>

      {isRecording && fullTranscript && (
        <Card>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Live Transcript</p>
          <p className="text-sm text-slate-300">{fullTranscript}</p>
        </Card>
      )}

      {finished && analysis && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your Story</p>
            {audioURL && (
              <div className="flex items-center gap-2">
                <audio
                  src={audioURL}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  id="story-audio"
                  className="hidden"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('story-audio')
                    if (isPlaying) el.pause()
                    else el.play()
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-line/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-line/10"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? 'Pause' : 'Replay'}
                </button>
              </div>
            )}
          </div>
          <HighlightedTranscript transcript={analysis.transcript} issues={analysis.issues} />
          <div className="flex flex-wrap gap-3 pt-1 text-xs">
            <span className="rounded-full bg-line/5 px-3 py-1 text-slate-400">{analysis.wordCount} words</span>
            <span className="rounded-full bg-line/5 px-3 py-1 text-slate-400">{formatClock(analysis.durationSec)} spoken</span>
            <span className={`rounded-full px-3 py-1 ${analysis.issues.length ? 'bg-accent-amber/15 text-accent-amber' : 'bg-accent-teal/15 text-accent-teal'}`}>
              {analysis.issues.length} grammar issue{analysis.issues.length === 1 ? '' : 's'}
            </span>
            {analysis.fillers > 0 && <span className="rounded-full bg-accent-rose/15 px-3 py-1 text-accent-rose">{analysis.fillers} hesitations</span>}
          </div>

          {!aiFeedback && analysis.transcript && (
            <button
              onClick={getAIFeedback}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-300 hover:text-brand-200 disabled:opacity-50"
            >
              <Sparkles size={13} />
              {aiLoading ? 'Asking AI...' : 'Get AI Feedback'}
            </button>
          )}
          {aiFailed && <p className="text-xs text-accent-amber">AI feedback isn&apos;t available right now.</p>}
          {aiFeedback && (
            <div className="flex items-start gap-2 rounded-xl border border-brand-500/20 bg-brand-500/5 p-3 text-xs text-slate-300">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-300" />
              <p>{aiFeedback}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
