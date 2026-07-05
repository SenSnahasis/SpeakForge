import { useMemo, useState } from 'react'
import { Mic, MicOff, Volume2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import SectionShell from './SectionShell'
import Card from '../common/Card'
import Button from '../common/Button'
import { useTimer } from '../../hooks/useTimer'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useAppState } from '../../context/AppStateContext'
import { BROKEN_SENTENCES } from '../../data/sentences'
import { pronunciationScore } from '../../utils/similarity'

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s']/g, '').replace(/\s+/g, ' ').trim()
}

export default function SentenceBuilder({ dayIndex, durationSeconds, onComplete }) {
  const { addGrammarMistakes } = useAppState()
  const items = useMemo(() => {
    const total = BROKEN_SENTENCES.length
    const start = (dayIndex * 4) % total
    return Array.from({ length: 4 }, (_, i) => BROKEN_SENTENCES[(start + i) % total])
  }, [dayIndex])

  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [stage, setStage] = useState('type') // type -> reveal -> speak
  const [correctCount, setCorrectCount] = useState(0)
  const [missed, setMissed] = useState([])
  const [speakScore, setSpeakScore] = useState(null)
  const { speak } = useSpeechSynthesis()
  const { isSupported, isListening, fullTranscript, start: startRec, stop: stopRec, reset: resetRec } = useSpeechRecognition({ continuous: false })

  const finish = () => onComplete({ correctCount, total: items.length, mistakes: missed })
  const { secondsLeft, progress } = useTimer(durationSeconds, { autoStart: true, onComplete: finish })

  const current = items[index]
  const isCorrect = normalize(input) === normalize(current.fixed)

  const submit = () => {
    if (isCorrect) {
      setCorrectCount((c) => c + 1)
    } else {
      const mistake = { category: 'Sentence Builder', original: current.broken, corrected: current.fixed, message: current.tip }
      setMissed((m) => [...m, mistake])
      // Persist immediately — don't wait for the whole section (or session) to
      // finish, so the mistake survives even if the user quits right here.
      addGrammarMistakes([mistake])
    }
    setStage('reveal')
  }

  const goNext = () => {
    setInput('')
    setStage('type')
    setSpeakScore(null)
    resetRec()
    if (index + 1 >= items.length) finish()
    else setIndex((i) => i + 1)
  }

  const toggleMic = () => {
    if (isListening) {
      stopRec()
      if (fullTranscript) setSpeakScore(pronunciationScore(current.fixed, fullTranscript))
      return
    }
    resetRec()
    startRec()
  }

  return (
    <SectionShell
      title="Sentence Builder"
      description="Fix the broken sentence, then say the correct version aloud."
      secondsLeft={secondsLeft}
      progress={progress}
      onNext={finish}
      nextLabel="Continue to Scenario Speaking"
    >
      <div className="mb-3 flex gap-1.5">
        {items.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < index ? 'bg-accent-teal' : i === index ? 'bg-brand-500' : 'bg-line/10'}`} />
        ))}
      </div>

      <Card className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Broken Sentence</p>
          <p className="rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-3 text-sm text-slate-200">{current.broken}</p>
        </div>

        {stage === 'type' && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Type the corrected sentence:</label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && input.trim() && submit()}
              placeholder="Fix the sentence..."
              className="w-full rounded-xl border border-line/10 bg-bg-hover/60 p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
            />
            <Button className="mt-3 w-full" onClick={submit} disabled={!input.trim()}>
              Check My Sentence
            </Button>
          </div>
        )}

        {stage !== 'type' && (
          <div className="space-y-3">
            <div className={`flex items-start gap-2 rounded-xl p-3 text-sm ${isCorrect ? 'bg-accent-teal/10 text-accent-teal' : 'bg-accent-amber/10 text-accent-amber'}`}>
              {isCorrect ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <XCircle size={18} className="mt-0.5 shrink-0" />}
              <div>
                <p className="font-medium">{isCorrect ? 'Correct!' : 'Not quite — here is the fix'}</p>
                <p className="mt-1 text-slate-300">{current.fixed}</p>
                <p className="mt-1 text-xs text-slate-500">{current.tip}</p>
              </div>
            </div>

            {stage === 'reveal' && (
              <div className="flex items-center gap-2 rounded-xl border border-line/5 bg-line/[0.02] p-3">
                <button onClick={() => speak(current.fixed)} className="rounded-lg p-2 text-brand-300 hover:bg-line/5">
                  <Volume2 size={18} />
                </button>
                <p className="flex-1 text-xs text-slate-400">Now say the corrected sentence out loud.</p>
                {isSupported && (
                  <button
                    onClick={() => {
                      setStage('speak')
                      toggleMic()
                    }}
                    className="rounded-lg bg-brand-600/20 p-2 text-brand-300 hover:bg-brand-600/30"
                  >
                    <Mic size={18} />
                  </button>
                )}
              </div>
            )}

            {stage === 'speak' && (
              <div className="space-y-2 rounded-xl border border-line/5 bg-line/[0.02] p-3">
                <button
                  onClick={toggleMic}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium ${
                    isListening ? 'bg-accent-rose/20 text-accent-rose' : 'bg-brand-600/20 text-brand-300'
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  {isListening ? 'Stop Recording' : 'Record Again'}
                </button>
                {fullTranscript && <p className="text-xs text-slate-400">You said: <span className="text-slate-200">{fullTranscript}</span></p>}
                {speakScore !== null && (
                  <p className="text-sm font-semibold text-accent-teal">Pronunciation match: {speakScore}%</p>
                )}
              </div>
            )}

            <Button className="w-full" icon={ArrowRight} onClick={goNext}>
              Next Sentence
            </Button>
          </div>
        )}
      </Card>
    </SectionShell>
  )
}
