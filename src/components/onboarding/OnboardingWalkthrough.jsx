import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic2, Sparkles, Mic, TrendingUp, X } from 'lucide-react'
import Button from '../common/Button'

const STORAGE_KEY = 'speakforge-onboarding-complete'

const STEPS = [
  {
    icon: Mic2,
    title: 'Welcome to SpeakForge',
    body: 'Speak better English with just 15 focused minutes a day. No account, no backend — everything stays in your browser.',
  },
  {
    icon: Sparkles,
    title: 'Your Daily Practice',
    body: 'Each day is 6 quick sections: Warmup, Vocabulary, Sentence Builder, Scenario Speaking, Storytelling, and a Confidence Review — about 15 minutes total.',
  },
  {
    icon: Mic,
    title: "We'll ask for your microphone",
    body: 'Speaking practice needs mic access. When your browser asks, tap Allow. Your voice is processed entirely on your device — nothing is ever uploaded anywhere.',
  },
  {
    icon: TrendingUp,
    title: 'Everything is saved for you',
    body: 'Words you learn and mistakes you make are tracked automatically — revisit them anytime in Vocabulary Review, Sentence Mistakes, Achievements, and Progress.',
  },
]

function readShouldShow() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'true'
  } catch {
    return false
  }
}

export default function OnboardingWalkthrough() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(readShouldShow)
  const [stepIndex, setStepIndex] = useState(0)

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      /* storage unavailable */
    }
    setVisible(false)
  }

  const handleNext = () => {
    if (stepIndex + 1 >= STEPS.length) finish()
    else setStepIndex((i) => i + 1)
  }

  const handleStartPracticing = () => {
    finish()
    navigate('/practice')
  }

  if (!visible) return null

  const step = STEPS[stepIndex]
  const Icon = step.icon
  const isLast = stepIndex === STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass-card relative w-full max-w-md rounded-2xl p-6 text-center shadow-card"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          <button
            onClick={finish}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-500 hover:bg-line/5 hover:text-slate-200"
          >
            <X size={18} />
          </button>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-teal">
            <Icon size={28} className="text-white" />
          </div>

          <h2 className="text-xl font-bold text-slate-50">{step.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{step.body}</p>

          <div className="mt-6 flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-brand-500' : 'w-1.5 bg-line/15'}`} />
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            {!isLast && (
              <Button variant="ghost" onClick={finish}>
                Skip
              </Button>
            )}
            {isLast ? <Button onClick={handleStartPracticing}>Start Practicing</Button> : <Button onClick={handleNext}>Next</Button>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
