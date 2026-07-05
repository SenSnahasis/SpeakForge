import { useState } from 'react'
import { ChevronLeft, ChevronRight, History, Shuffle } from 'lucide-react'
import Card from '../components/common/Card'
import StorySession from '../components/storytelling/StorySession'
import { useAppState } from '../context/AppStateContext'
import { STORYTELLING_PROMPTS } from '../data/prompts'
import { dayOfYear } from '../utils/dateUtils'

export default function Storytelling() {
  const { state, addSpeakingSession, addGrammarMistakes } = useAppState()
  const [promptIndex, setPromptIndex] = useState(dayOfYear() % STORYTELLING_PROMPTS.length)
  const [sessionKey, setSessionKey] = useState(0)

  const history = state.speakingSessions.filter((s) => s.type === 'storytelling').slice(-5).reverse()

  const changePrompt = (delta) => {
    setPromptIndex((i) => (i + delta + STORYTELLING_PROMPTS.length) % STORYTELLING_PROMPTS.length)
    setSessionKey((k) => k + 1)
  }

  const randomPrompt = () => {
    setPromptIndex(Math.floor(Math.random() * STORYTELLING_PROMPTS.length))
    setSessionKey((k) => k + 1)
  }

  const handleSessionEnd = (result) => {
    if (!result.transcript) return
    addSpeakingSession({ type: 'storytelling', transcript: result.transcript, durationSec: result.durationSec, issueCount: result.issues.length })
    addGrammarMistakes(result.issues)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Storytelling Practice</h1>
        <p className="mt-1 text-sm text-slate-400">Speak freely for up to two minutes on a daily prompt.</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button onClick={() => changePrompt(-1)} className="rounded-lg bg-line/5 p-2 text-slate-400 hover:bg-line/10 hover:text-slate-100">
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs text-slate-500">
          Prompt {promptIndex + 1} of {STORYTELLING_PROMPTS.length}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={randomPrompt} className="flex items-center gap-1 rounded-lg bg-line/5 px-2.5 py-2 text-xs text-slate-400 hover:bg-line/10 hover:text-slate-100">
            <Shuffle size={14} /> Random
          </button>
          <button onClick={() => changePrompt(1)} className="rounded-lg bg-line/5 p-2 text-slate-400 hover:bg-line/10 hover:text-slate-100">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <StorySession key={sessionKey} prompt={STORYTELLING_PROMPTS[promptIndex]} maxSeconds={120} onSessionEnd={handleSessionEnd} />

      {history.length > 0 && (
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <History size={16} /> Past Stories
          </h3>
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="rounded-xl bg-line/[0.02] px-3 py-2 text-sm">
                <p className="truncate text-slate-300">{h.transcript}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {Math.round(h.durationSec)}s · {h.issueCount} grammar issue{h.issueCount === 1 ? '' : 's'}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
