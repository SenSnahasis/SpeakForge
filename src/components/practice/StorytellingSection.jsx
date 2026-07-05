import { useMemo, useState } from 'react'
import SectionShell from './SectionShell'
import StorySession from '../storytelling/StorySession'
import { useTimer } from '../../hooks/useTimer'
import { useAppState } from '../../context/AppStateContext'
import { getPromptForDay } from '../../data/prompts'

export default function StorytellingSection({ dayIndex, durationSeconds, onComplete }) {
  const { addGrammarMistakes, addSpeakingSession } = useAppState()
  const prompt = useMemo(() => getPromptForDay(dayIndex), [dayIndex])
  const [result, setResult] = useState(null)

  const finish = () => onComplete(result || { transcript: '', issues: [], fillers: 0, wordCount: 0, durationSec: 0 })
  const { secondsLeft, progress } = useTimer(durationSeconds, { autoStart: true, onComplete: finish })

  const handleSessionEnd = (sessionResult) => {
    setResult(sessionResult)
    // Persist immediately — don't wait for "Continue to Confidence Review",
    // so the story/mistakes survive even if the user quits right after recording.
    if (sessionResult.transcript) {
      addSpeakingSession({
        type: 'storytelling',
        transcript: sessionResult.transcript,
        durationSec: sessionResult.durationSec,
        issueCount: sessionResult.issues?.length || 0,
      })
      if (sessionResult.issues?.length) addGrammarMistakes(sessionResult.issues)
    }
  }

  return (
    <SectionShell
      title="Storytelling"
      description="Speak freely on today's prompt — do not worry about mistakes."
      secondsLeft={secondsLeft}
      progress={progress}
      onNext={finish}
      nextLabel="Continue to Confidence Review"
    >
      <StorySession prompt={prompt} maxSeconds={durationSeconds} onSessionEnd={handleSessionEnd} />
    </SectionShell>
  )
}
