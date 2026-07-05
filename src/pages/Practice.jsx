import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PartyPopper, RotateCcw } from 'lucide-react'
import { PRACTICE_SECTIONS } from '../data/dailyPlan'
import { useAppState } from '../context/AppStateContext'
import { dayOfYear, todayKey } from '../utils/dateUtils'
import Warmup from '../components/practice/Warmup'
import VocabularyBuilder from '../components/practice/VocabularyBuilder'
import SentenceBuilder from '../components/practice/SentenceBuilder'
import ScenarioSpeaking from '../components/practice/ScenarioSpeaking'
import StorytellingSection from '../components/practice/StorytellingSection'
import ConfidenceReview from '../components/practice/ConfidenceReview'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

const EMPTY_SUMMARY = { grammarIssues: [], fillerCount: 0, wordCount: 0, speakingSeconds: 0 }

export default function Practice() {
  const { state, completeLessonSection, recordPracticeTime, addConfidenceScore, startBonusRound } = useAppState()
  const navigate = useNavigate()
  const today = todayKey()
  const completedToday = state.completedLessons[today] || []
  const firstIncomplete = PRACTICE_SECTIONS.findIndex((s) => !completedToday.includes(s.key))
  const startedAsRedo = firstIncomplete === -1

  // A redo shifts the content rotation (fresh words/sentences/scenario/prompt)
  // instead of repeating the exact same set you just finished. `roundNumber`
  // lives in local state (not derived on every render) so "Practice Again"
  // can bump it and restart without needing a route change/remount.
  const [roundNumber, setRoundNumber] = useState(() => (startedAsRedo ? (state.bonusRounds[today] || 0) + 1 : 0))
  const [isRedo, setIsRedo] = useState(startedAsRedo)
  const [stepIndex, setStepIndex] = useState(startedAsRedo ? 0 : firstIncomplete)
  const [sessionSummary, setSessionSummary] = useState(EMPTY_SUMMARY)
  const [sessionDone, setSessionDone] = useState(false)

  // Persist the bonus round whenever a new one starts (initial mount if
  // already redoing, or each subsequent "Practice Again"). Runs in an effect
  // rather than during render since it updates a different component's state.
  useEffect(() => {
    if (isRedo) startBonusRound()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNumber])

  const contentDayIndex = dayOfYear() + roundNumber
  const section = PRACTICE_SECTIONS[stepIndex]

  const advance = () => {
    if (stepIndex + 1 >= PRACTICE_SECTIONS.length) setSessionDone(true)
    else setStepIndex((i) => i + 1)
  }

  const restartSession = () => {
    setRoundNumber((r) => r + 1)
    setIsRedo(true)
    setStepIndex(0)
    setSessionSummary(EMPTY_SUMMARY)
    setSessionDone(false)
  }

  const handleSectionComplete = (data) => {
    completeLessonSection(section.key)
    recordPracticeTime(section.minutes * 60)

    // Note: grammar mistakes and the storytelling speaking-session entry are
    // now persisted immediately inside each section component (so a mistake
    // survives even if the user quits mid-section) — this just accumulates
    // the session-local summary used for the Confidence Review score/recap.
    if (section.key === 'sentence' && data.mistakes?.length) {
      setSessionSummary((s) => ({ ...s, grammarIssues: [...s.grammarIssues, ...data.mistakes] }))
    }
    if (section.key === 'scenario') {
      setSessionSummary((s) => ({
        ...s,
        grammarIssues: [...s.grammarIssues, ...(data.issues || [])],
        fillerCount: s.fillerCount + (data.fillerCount || 0),
        wordCount: s.wordCount + (data.wordCount || 0),
        speakingSeconds: s.speakingSeconds + (data.secondsSpoken || 0),
      }))
    }
    if (section.key === 'storytelling') {
      setSessionSummary((s) => ({
        ...s,
        grammarIssues: [...s.grammarIssues, ...(data.issues || [])],
        fillerCount: s.fillerCount + (data.fillers || 0),
        wordCount: s.wordCount + (data.wordCount || 0),
        speakingSeconds: s.speakingSeconds + (data.durationSec || 0),
      }))
    }
    if (section.key === 'confidence') {
      addConfidenceScore(data.score)
    }
    advance()
  }

  if (sessionDone) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-teal">
          <PartyPopper size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-50">{isRedo ? 'Bonus Round Complete!' : 'Practice Complete!'}</h1>
        <p className="text-sm text-slate-400">
          You finished today&apos;s 15-minute session. Streak: {state.streak.current} day{state.streak.current === 1 ? '' : 's'}.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button variant="secondary" icon={RotateCcw} onClick={restartSession}>
            Practice Again
          </Button>
          <Button variant="secondary" onClick={() => navigate('/progress')}>
            View Progress
          </Button>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {isRedo && (
        <Card className="mb-4 flex items-center gap-2 border-accent-teal/20 bg-accent-teal/5 text-sm text-accent-teal">
          <RotateCcw size={16} className="shrink-0" />
          Bonus round — you&apos;ve already completed today&apos;s plan, so here&apos;s a fresh set of words, sentences, and prompts to practice with.
        </Card>
      )}

      <div className="mb-6 flex items-center gap-2">
        {PRACTICE_SECTIONS.map((s, i) => (
          <div key={s.key} className="flex flex-1 flex-col items-center gap-1.5">
            <div className={`h-1.5 w-full rounded-full ${i < stepIndex ? 'bg-accent-teal' : i === stepIndex ? 'bg-brand-500' : 'bg-line/10'}`} />
            <span className={`hidden text-[10px] sm:block ${i === stepIndex ? 'text-slate-200' : 'text-slate-600'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {section.key === 'warmup' && (
          <Warmup key={`warmup-${roundNumber}`} dayIndex={contentDayIndex} durationSeconds={section.minutes * 60} onComplete={handleSectionComplete} />
        )}
        {section.key === 'vocabulary' && (
          <VocabularyBuilder key={`vocabulary-${roundNumber}`} dayIndex={contentDayIndex} durationSeconds={section.minutes * 60} onComplete={handleSectionComplete} />
        )}
        {section.key === 'sentence' && (
          <SentenceBuilder key={`sentence-${roundNumber}`} dayIndex={contentDayIndex} durationSeconds={section.minutes * 60} onComplete={handleSectionComplete} />
        )}
        {section.key === 'scenario' && (
          <ScenarioSpeaking key={`scenario-${roundNumber}`} dayIndex={contentDayIndex} durationSeconds={section.minutes * 60} onComplete={handleSectionComplete} />
        )}
        {section.key === 'storytelling' && (
          <StorytellingSection key={`storytelling-${roundNumber}`} dayIndex={contentDayIndex} durationSeconds={section.minutes * 60} onComplete={handleSectionComplete} />
        )}
        {section.key === 'confidence' && (
          <ConfidenceReview key={`confidence-${roundNumber}`} durationSeconds={section.minutes * 60} sessionSummary={sessionSummary} onComplete={handleSectionComplete} />
        )}
      </AnimatePresence>
    </div>
  )
}
