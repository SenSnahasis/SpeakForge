import { useMemo, useState } from 'react'
import { Volume2, Mic, MicOff, ArrowRight, AlertCircle } from 'lucide-react'
import SectionShell from './SectionShell'
import Card from '../common/Card'
import Button from '../common/Button'
import { useTimer } from '../../hooks/useTimer'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useAppState } from '../../context/AppStateContext'
import { getScenarioForDay } from '../../data/scenarios'
import { checkGrammar, countFillerWords } from '../../utils/grammar'

export default function ScenarioSpeaking({ dayIndex, durationSeconds, onComplete }) {
  const { addGrammarMistakes } = useAppState()
  const scenario = useMemo(() => getScenarioForDay(dayIndex), [dayIndex])
  const [qIndex, setQIndex] = useState(0)
  const [issues, setIssues] = useState([])
  const [fillerCount, setFillerCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [lastAnalysis, setLastAnalysis] = useState(null)
  const { speak, speaking } = useSpeechSynthesis()
  const { isSupported, isListening, fullTranscript, start, stop, reset } = useSpeechRecognition({ continuous: true })

  const finish = () => onComplete({ issues, fillerCount, wordCount, secondsSpoken: durationSeconds })
  const { secondsLeft, progress } = useTimer(durationSeconds, { autoStart: true, onComplete: finish })

  const question = scenario.questions[qIndex]

  const analyzeAnswer = () => {
    if (isListening) stop()
    const transcript = fullTranscript.trim()
    if (transcript) {
      const { issues: found } = checkGrammar(transcript)
      const fillers = countFillerWords(transcript)
      setIssues((prev) => [...prev, ...found])
      setFillerCount((c) => c + fillers)
      setWordCount((c) => c + transcript.split(/\s+/).filter(Boolean).length)
      setLastAnalysis({ transcript, found, fillers })
      // Persist immediately so an issue isn't lost if the user quits before
      // finishing every question in this section.
      if (found.length > 0) addGrammarMistakes(found)
    } else {
      setLastAnalysis({ transcript: '', found: [], fillers: 0 })
    }
    reset()
  }

  const goToNextQuestion = () => {
    setLastAnalysis(null)
    if (qIndex + 1 >= scenario.questions.length) finish()
    else setQIndex((i) => i + 1)
  }

  return (
    <SectionShell
      title="Scenario Speaking"
      description={`${scenario.category}: ${scenario.title}`}
      secondsLeft={secondsLeft}
      progress={progress}
      onNext={finish}
      nextLabel="Continue to Storytelling"
    >
      <Card className="mb-4 bg-brand-900/10">
        <p className="text-sm text-slate-300">{scenario.context}</p>
      </Card>

      <div className="mb-3 flex gap-1.5">
        {scenario.questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < qIndex ? 'bg-accent-teal' : i === qIndex ? 'bg-brand-500' : 'bg-line/10'}`} />
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-medium text-slate-100">&ldquo;{question}&rdquo;</p>
          <button onClick={() => speak(question)} className="shrink-0 rounded-xl bg-line/5 p-2.5 text-brand-300 hover:bg-line/10">
            <Volume2 size={18} className={speaking ? 'animate-pulse' : ''} />
          </button>
        </div>

        {isSupported ? (
          <button
            onClick={isListening ? analyzeAnswer : start}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
              isListening ? 'bg-accent-rose/20 text-accent-rose' : 'bg-gradient-to-r from-brand-500 to-accent-teal text-white'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening ? 'Stop & Analyze My Answer' : 'Answer with Your Voice'}
          </button>
        ) : (
          <p className="text-xs text-accent-amber">Speech recognition isn&apos;t supported — try Chrome.</p>
        )}

        {isListening && fullTranscript && (
          <p className="rounded-xl border border-line/5 bg-line/[0.02] p-3 text-sm text-slate-300">{fullTranscript}</p>
        )}

        {lastAnalysis && (
          <div className="space-y-2 rounded-xl border border-line/5 bg-line/[0.02] p-3">
            <p className="text-xs text-slate-500">You said:</p>
            <p className="text-sm text-slate-300">{lastAnalysis.transcript}</p>
            {lastAnalysis.found.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {lastAnalysis.found.map((issue, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-accent-amber">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    <span>
                      &ldquo;{issue.original}&rdquo; → &ldquo;{issue.corrected}&rdquo;. {issue.message}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-accent-teal">No grammar issues detected — nice work!</p>
            )}
            {lastAnalysis.fillers > 0 && (
              <p className="text-xs text-accent-rose">Hesitation words detected: {lastAnalysis.fillers}</p>
            )}
            <Button size="sm" icon={ArrowRight} onClick={goToNextQuestion} className="mt-1">
              {qIndex + 1 >= scenario.questions.length ? 'Finish Scenario' : 'Next Question'}
            </Button>
          </div>
        )}
      </Card>
    </SectionShell>
  )
}
