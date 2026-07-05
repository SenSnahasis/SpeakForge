import { useState } from 'react'
import { Mic, MicOff, Volume2, CheckCircle, XCircle, RotateCcw, Sparkles } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { pronunciationScore } from '../../utils/similarity'
import { formatShortDate } from '../../utils/dateUtils'
import { askAI } from '../../utils/aiClient'

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s']/g, '').replace(/\s+/g, ' ').trim()
}

export default function SentenceMistakeCard({ broken, fixed, tip, timesWrong, lastMissedDate, practiceInfo, onPracticeResult }) {
  const [input, setInput] = useState('')
  const [stage, setStage] = useState('type') // type -> reveal
  const [speakScore, setSpeakScore] = useState(null)
  const [aiExplanation, setAiExplanation] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFailed, setAiFailed] = useState(false)
  const { speak } = useSpeechSynthesis()
  const { isSupported, isListening, fullTranscript, start, stop, reset } = useSpeechRecognition({ continuous: false })

  const isCorrect = normalize(input) === normalize(fixed)

  const submit = () => {
    onPracticeResult(isCorrect)
    setStage('reveal')
  }

  const toggleMic = () => {
    if (isListening) {
      stop()
      if (fullTranscript) setSpeakScore(pronunciationScore(fixed, fullTranscript))
      return
    }
    reset()
    start()
  }

  const tryAgain = () => {
    setInput('')
    setStage('type')
    setSpeakScore(null)
    reset()
  }

  const explainWithAI = async () => {
    setAiLoading(true)
    setAiFailed(false)
    const messages = [
      {
        role: 'system',
        content:
          'You are a friendly, concise English tutor explaining a grammar mistake to a beginner English learner. Reply in plain conversational text only — no markdown, no bullet points, no bold text. Keep it to 2-3 short, simple sentences — no jargon.',
      },
      {
        role: 'user',
        content: `A learner wrote: "${broken}"\nThe correct sentence is: "${fixed}"\nExisting hint: "${tip}"\nBriefly explain why the original is wrong and give one simple way to remember the fix.`,
      },
    ]
    const reply = await askAI(messages)
    setAiLoading(false)
    if (reply) setAiExplanation(reply)
    else setAiFailed(true)
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-accent-rose/15 px-2 py-0.5 text-[11px] font-medium text-accent-rose">
          Missed {timesWrong}x
        </span>
        <span className="text-xs text-slate-500">Last missed: {formatShortDate(lastMissedDate)}</span>
      </div>

      <p className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-3 text-sm text-slate-200">{broken}</p>

      {stage === 'type' ? (
        <div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && input.trim() && submit()}
            placeholder="Type the corrected sentence..."
            className="w-full rounded-xl border border-line/10 bg-bg-hover/60 p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
          />
          <Button size="sm" className="mt-2" onClick={submit} disabled={!input.trim()}>
            Check
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`flex items-start gap-2 rounded-xl p-3 text-sm ${isCorrect ? 'bg-accent-teal/10 text-accent-teal' : 'bg-accent-amber/10 text-accent-amber'}`}>
            {isCorrect ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <XCircle size={18} className="mt-0.5 shrink-0" />}
            <div>
              <p className="font-medium">{isCorrect ? 'Correct!' : 'Not quite — here is the fix'}</p>
              <p className="mt-1 text-slate-300">{fixed}</p>
              <p className="mt-1 text-xs text-slate-500">{tip}</p>
            </div>
          </div>

          {!aiExplanation && (
            <button
              onClick={explainWithAI}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-300 hover:text-brand-200 disabled:opacity-50"
            >
              <Sparkles size={13} />
              {aiLoading ? 'Asking AI...' : 'Explain with AI'}
            </button>
          )}
          {aiFailed && <p className="text-xs text-accent-amber">AI explanation isn&apos;t available right now.</p>}
          {aiExplanation && (
            <div className="flex items-start gap-2 rounded-xl border border-brand-500/20 bg-brand-500/5 p-3 text-xs text-slate-300">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-300" />
              <p>{aiExplanation}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line/5 bg-line/[0.02] p-3">
            <button onClick={() => speak(fixed)} className="rounded-lg p-2 text-brand-300 hover:bg-line/5" title="Hear the correct sentence">
              <Volume2 size={18} />
            </button>
            {isSupported && (
              <button
                onClick={toggleMic}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isListening ? 'bg-accent-rose/20 text-accent-rose' : 'bg-brand-600/20 text-brand-300'
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                {isListening ? 'Stop Recording' : 'Speak It'}
              </button>
            )}
            {speakScore !== null && <span className="text-xs font-semibold text-accent-teal">Match: {speakScore}%</span>}
          </div>
          {isListening && fullTranscript && <p className="text-xs text-slate-400">You said: {fullTranscript}</p>}

          <Button size="sm" variant="secondary" icon={RotateCcw} onClick={tryAgain}>
            Try Typing Again
          </Button>
        </div>
      )}

      {practiceInfo && (
        <p className="text-[11px] text-slate-500">
          Practiced {practiceInfo.attempts}x · last{' '}
          {practiceInfo.lastCorrect ? <span className="text-accent-teal">correct</span> : <span className="text-accent-rose">incorrect</span>} on{' '}
          {formatShortDate(practiceInfo.lastAttemptDate)}
        </p>
      )}
    </Card>
  )
}
