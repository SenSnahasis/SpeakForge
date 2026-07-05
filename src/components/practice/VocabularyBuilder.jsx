import { useMemo, useState } from 'react'
import { Volume2, Mic, MicOff, Languages, CheckCircle2, RotateCcw } from 'lucide-react'
import SectionShell from './SectionShell'
import Card from '../common/Card'
import Button from '../common/Button'
import { useTimer } from '../../hooks/useTimer'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useAppState } from '../../context/AppStateContext'
import { getDailyWords } from '../../data/vocabulary'

export default function VocabularyBuilder({ dayIndex, durationSeconds, onComplete }) {
  const words = useMemo(() => getDailyWords(dayIndex, 5), [dayIndex])
  const { markWordLearned, markWordWeak, saveVocabSentence, state } = useAppState()
  const [index, setIndex] = useState(0)
  const [showHint, setShowHint] = useState(state.settings.hintsEnabled)
  const [sentence, setSentence] = useState('')
  const [resolvedCount, setResolvedCount] = useState(0)
  const { speak, speaking } = useSpeechSynthesis()
  const { isSupported, isListening, fullTranscript, start, stop, reset: resetRecognition } = useSpeechRecognition({ continuous: false })

  const finish = () => onComplete({ wordsResolved: resolvedCount, totalWords: words.length })
  const { secondsLeft, progress } = useTimer(durationSeconds, { autoStart: true, onComplete: finish })

  const word = words[index]
  const existingSentence = state.vocabulary.sentencesByWordId[word.id] || ''

  const goNext = () => {
    setShowHint(state.settings.hintsEnabled)
    setSentence('')
    resetRecognition()
    if (index + 1 >= words.length) {
      finish()
    } else {
      setIndex((i) => i + 1)
    }
  }

  const resolve = (learned) => {
    if (learned) markWordLearned(word.id)
    else markWordWeak(word.id)
    if (sentence.trim()) saveVocabSentence(word.id, sentence.trim())
    setResolvedCount((c) => c + 1)
    goNext()
  }

  const toggleMic = () => {
    if (isListening) {
      stop()
      if (fullTranscript) setSentence((s) => (s ? `${s} ${fullTranscript}` : fullTranscript))
      return
    }
    resetRecognition()
    start()
  }

  return (
    <SectionShell
      title="Vocabulary Builder"
      description="Learn today's 5 words and use each one in your own sentence."
      secondsLeft={secondsLeft}
      progress={progress}
      onNext={finish}
      nextLabel="Continue to Sentence Builder"
    >
      <div className="mb-3 flex gap-1.5">
        {words.map((w, i) => (
          <div key={w.id} className={`h-1.5 flex-1 rounded-full ${i < index ? 'bg-accent-teal' : i === index ? 'bg-brand-500' : 'bg-line/10'}`} />
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="rounded-full bg-brand-600/15 px-2 py-0.5 text-[11px] font-medium text-brand-300">{word.category}</span>
            <h3 className="mt-2 text-2xl font-bold text-slate-50">{word.word}</h3>
            {existingSentence && <p className="mt-1 text-xs text-accent-teal">Saved earlier: &ldquo;{existingSentence}&rdquo;</p>}
          </div>
          <button onClick={() => speak(word.word)} className="rounded-xl bg-line/5 p-3 text-brand-300 hover:bg-line/10" title="Hear pronunciation">
            <Volume2 size={22} className={speaking ? 'animate-pulse' : ''} />
          </button>
        </div>

        <p className="text-sm text-slate-400">
          Example: <span className="italic text-slate-300">{word.example}</span>
        </p>

        <button onClick={() => setShowHint((s) => !s)} className="flex items-center gap-1.5 text-xs font-medium text-accent-amber hover:underline">
          <Languages size={14} /> {showHint ? 'Hide' : 'Show'} Bengali hint
        </button>
        {showHint && <p className="rounded-lg bg-accent-amber/10 px-3 py-2 text-sm text-accent-amber">{word.meaningBn}</p>}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Now use &ldquo;{word.word}&rdquo; in your own sentence:</label>
          <div className="flex items-start gap-2">
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              rows={2}
              placeholder="Type or speak your sentence here..."
              className="flex-1 resize-none rounded-xl border border-line/10 bg-bg-hover/60 p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
            />
            {isSupported && (
              <button
                onClick={toggleMic}
                className={`shrink-0 rounded-xl p-3 ${isListening ? 'bg-accent-rose/20 text-accent-rose' : 'bg-line/5 text-slate-300 hover:bg-line/10'}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" icon={RotateCcw} onClick={() => resolve(false)} className="flex-1">
            Still Learning
          </Button>
          <Button icon={CheckCircle2} onClick={() => resolve(true)} className="flex-1">
            Mark as Learned
          </Button>
        </div>
      </Card>
    </SectionShell>
  )
}
