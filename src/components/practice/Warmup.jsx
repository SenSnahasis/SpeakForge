import { useState } from 'react'
import { Volume2, Mic, MicOff, CheckCircle2, Circle } from 'lucide-react'
import SectionShell from './SectionShell'
import Card from '../common/Card'
import { useTimer } from '../../hooks/useTimer'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { getWarmupSetForDay } from '../../data/dailyPlan'

export default function Warmup({ dayIndex, durationSeconds, onComplete }) {
  const phrases = getWarmupSetForDay(dayIndex, 4)
  const [done, setDone] = useState(() => new Set())
  const [activeIndex, setActiveIndex] = useState(null)
  const { speak, speaking } = useSpeechSynthesis()
  const { isSupported, isListening, fullTranscript, start, stop, reset } = useSpeechRecognition({ continuous: false })

  const finish = () => onComplete({ phrasesPracticed: done.size })
  const { secondsLeft, progress } = useTimer(durationSeconds, { autoStart: true, onComplete: finish })

  const toggleListen = (index) => {
    if (activeIndex === index && isListening) {
      stop()
      setDone((prev) => new Set(prev).add(index))
      return
    }
    reset()
    setActiveIndex(index)
    start()
  }

  return (
    <SectionShell
      title="Warmup"
      description="Loosen your speaking muscles with these quick phrases."
      secondsLeft={secondsLeft}
      progress={progress}
      onNext={finish}
      nextLabel="Continue to Vocabulary"
    >
      <div className="space-y-3">
        {phrases.map((phrase, i) => (
          <Card key={i} className="flex items-center gap-3 p-4" hover>
            {done.has(i) ? <CheckCircle2 size={18} className="shrink-0 text-accent-teal" /> : <Circle size={18} className="shrink-0 text-slate-600" />}
            <p className="flex-1 text-sm text-slate-200">{phrase}</p>
            <button
              onClick={() => speak(phrase)}
              className="rounded-lg p-2 text-slate-400 hover:bg-line/5 hover:text-brand-300"
              title="Listen"
            >
              <Volume2 size={18} className={speaking ? 'animate-pulse text-brand-400' : ''} />
            </button>
            {isSupported && (
              <button
                onClick={() => toggleListen(i)}
                className={`rounded-lg p-2 ${activeIndex === i && isListening ? 'bg-accent-rose/20 text-accent-rose' : 'text-slate-400 hover:bg-line/5 hover:text-accent-teal'}`}
                title="Practice speaking"
              >
                {activeIndex === i && isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
          </Card>
        ))}
        {activeIndex !== null && fullTranscript && (
          <p className="rounded-xl border border-line/5 bg-line/[0.02] p-3 text-xs text-slate-400">
            You said: <span className="text-slate-200">{fullTranscript}</span>
          </p>
        )}
        {!isSupported && (
          <p className="text-xs text-accent-amber">Speech recognition isn&apos;t supported in this browser — try Chrome for mic practice.</p>
        )}
      </div>
    </SectionShell>
  )
}
