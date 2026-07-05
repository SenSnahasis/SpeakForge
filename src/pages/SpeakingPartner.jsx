import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Users, Coffee, MessageCircle, Mic, MicOff, RotateCcw, Send, LogOut, Sparkles } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import ChatBubble from '../components/speaking-partner/ChatBubble'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useAppState } from '../context/AppStateContext'
import { INTERVIEW_QUESTIONS, OFFICE_MEETING_SCENARIOS, DAILY_CONVERSATION_SCENARIOS } from '../data/scenarios'
import { checkGrammar, countFillerWords } from '../utils/grammar'
import { dayOfYear } from '../utils/dateUtils'
import { askAI } from '../utils/aiClient'

function buildSystemPrompt(title, intro, nextQuestion) {
  return `You are role-playing as the other person in this scenario: "${title}". Context: ${intro}
You are NOT a general-purpose assistant — stay fully in character at all times and never mention you are an AI.
You are speaking with a beginner-to-intermediate English learner practicing spoken English.
Rules:
- Reply in plain conversational text only. No markdown, no bullet points, no numbered lists, no bold text.
- Keep your reply to 1-3 short, natural, spoken sentences.
- Briefly react to what they just said, then ask this next question (you may rephrase it slightly but keep the same meaning): "${nextQuestion}"`
}

const TOPICS = [
  { key: 'interview', label: 'Job Interview', icon: Briefcase },
  { key: 'office', label: 'Office Meeting', icon: Users },
  { key: 'daily', label: 'Daily Conversation', icon: Coffee },
  { key: 'freetalk', label: 'Free Talk', icon: MessageCircle },
]

const FREE_TALK_INTRO = "Hi there! I'm happy to chat about anything you like — hobbies, weekend plans, movies, food, whatever's on your mind. What would you like to talk about?"

const FREE_TALK_SYSTEM_PROMPT = `You are a warm, friendly conversation partner having a free-flowing, open-ended chat with a beginner-to-intermediate English learner practicing spoken English. There is no fixed topic or script.
Rules:
- Reply in plain conversational text only. No markdown, no bullet points, no numbered lists, no bold text.
- Keep your reply to 1-3 short, natural, spoken sentences.
- Ask a natural follow-up question or share a brief related thought to keep the conversation going.
- If the conversation stalls, introduce a new everyday topic (hobbies, food, travel, weather, movies, weekend plans, etc.).
- Never mention that you are an AI or break character.`

const CUSTOM_SCENARIO_SYSTEM_PROMPT = `You are a scenario generator for an English speaking practice app. Given a situation described by a beginner-to-intermediate English learner, generate a realistic role-play scenario for them to practice.
Respond with ONLY a valid JSON object, no markdown, no code fences, no extra text before or after. Use exactly this shape:
{"title": "short 3-5 word title", "intro": "one sentence of context spoken to the learner, describing the scenario", "questions": ["question 1", "question 2", "question 3", "question 4"]}
Generate exactly 4 questions that a realistic counterpart would naturally ask in this situation, in a sensible order. Keep each question short and conversational.`

function parseScenarioJSON(text) {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    const obj = JSON.parse(cleaned)
    if (!obj.title || !obj.intro || !Array.isArray(obj.questions) || obj.questions.length === 0) return null
    return { title: String(obj.title).slice(0, 80), intro: String(obj.intro), questions: obj.questions.map(String).slice(0, 6) }
  } catch {
    return null
  }
}

function buildQuestionSet(topicKey, scenarioId, dayIndex) {
  if (topicKey === 'interview') {
    const total = INTERVIEW_QUESTIONS.length
    const start = (dayIndex * 5) % total
    return { intro: "Let's practice a job interview. Answer naturally, as if this were real.", questions: Array.from({ length: 5 }, (_, i) => INTERVIEW_QUESTIONS[(start + i) % total]) }
  }
  const pool = topicKey === 'office' ? OFFICE_MEETING_SCENARIOS : DAILY_CONVERSATION_SCENARIOS
  const scenario = pool.find((s) => s.id === scenarioId) || pool[0]
  return { intro: scenario.context, questions: scenario.questions, title: scenario.title }
}

export default function SpeakingPartner() {
  const { addSpeakingSession, addGrammarMistakes } = useAppState()
  const dayIndex = dayOfYear()
  const [topic, setTopic] = useState(null)
  const [scenarioId, setScenarioId] = useState(null)
  const [messages, setMessages] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [conversationOver, setConversationOver] = useState(false)
  const [totals, setTotals] = useState({ issues: 0, fillers: 0, words: 0 })
  const [aiThinking, setAiThinking] = useState(false)
  const [customScenario, setCustomScenario] = useState(null)
  const [customInput, setCustomInput] = useState('')
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState(null)
  const [highlightSection, setHighlightSection] = useState(null)
  const scrollRef = useRef(null)
  const officeSectionRef = useRef(null)
  const dailySectionRef = useRef(null)

  const scrollToScenarioList = (key) => {
    const ref = key === 'office' ? officeSectionRef : dailySectionRef
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setHighlightSection(key)
    setTimeout(() => setHighlightSection((cur) => (cur === key ? null : cur)), 1500)
  }

  const { speak, speaking } = useSpeechSynthesis()
  const { isSupported, isListening, fullTranscript, start, stop, reset } = useSpeechRecognition({ continuous: true })

  const isFreeTalk = topic === 'freetalk'
  const questionSet = useMemo(() => {
    if (!topic || isFreeTalk) return null
    if (topic === 'custom') return customScenario
    return buildQuestionSet(topic, scenarioId, dayIndex)
  }, [topic, scenarioId, dayIndex, isFreeTalk, customScenario])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const startConversation = (topicKey, sId = null) => {
    setTopic(topicKey)
    setScenarioId(sId)
    setConversationOver(false)
    setTotals({ issues: 0, fillers: 0, words: 0 })
    setQIndex(0)

    if (topicKey === 'freetalk') {
      setMessages([{ role: 'ai', text: FREE_TALK_INTRO }])
      setTimeout(() => speak(FREE_TALK_INTRO), 300)
      return
    }

    const set = buildQuestionSet(topicKey, sId, dayIndex)
    const firstMsg = { role: 'ai', text: set.questions[0] }
    setMessages([{ role: 'ai', text: set.intro }, firstMsg])
    setTimeout(() => speak(set.intro + '. ' + set.questions[0]), 300)
  }

  // Passes the generated scenario directly rather than reading it back from
  // state, since setCustomScenario() hasn't committed yet at this point.
  const startCustomConversation = (scenario) => {
    setTopic('custom')
    setScenarioId(null)
    setCustomScenario(scenario)
    setConversationOver(false)
    setTotals({ issues: 0, fillers: 0, words: 0 })
    setQIndex(0)
    const firstMsg = { role: 'ai', text: scenario.questions[0] }
    setMessages([{ role: 'ai', text: scenario.intro }, firstMsg])
    setTimeout(() => speak(scenario.intro + '. ' + scenario.questions[0]), 300)
  }

  const generateCustomScenario = async () => {
    const situation = customInput.trim()
    if (!situation) return
    setCustomLoading(true)
    setCustomError(null)
    const reply = await askAI([
      { role: 'system', content: CUSTOM_SCENARIO_SYSTEM_PROMPT },
      { role: 'user', content: situation },
    ])
    setCustomLoading(false)
    if (!reply) {
      setCustomError("Couldn't reach the AI right now — please try again in a moment.")
      return
    }
    const parsed = parseScenarioJSON(reply)
    if (!parsed) {
      setCustomError("Something went wrong generating that scenario — try rephrasing it.")
      return
    }
    startCustomConversation(parsed)
  }

  const submitAnswer = async () => {
    const transcript = fullTranscript.trim()
    if (isListening) stop()
    if (!transcript) return
    const { issues } = checkGrammar(transcript)
    const fillers = countFillerWords(transcript)
    const wordCount = transcript.split(/\s+/).filter(Boolean).length
    const userMsg = { role: 'user', text: transcript, issues, fillers }
    setMessages((m) => [...m, userMsg])
    setTotals((t) => ({ issues: t.issues + issues.length, fillers: t.fillers + fillers, words: t.words + wordCount }))
    reset()

    if (isFreeTalk) {
      setAiThinking(true)
      const history = [...messages, userMsg].map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
      const aiReply = await askAI([{ role: 'system', content: FREE_TALK_SYSTEM_PROMPT }, ...history])
      setAiThinking(false)
      const nextText = aiReply || "Sorry, I'm having a little trouble right now — could you say that again?"
      setMessages((m) => [...m, { role: 'ai', text: nextText }])
      if (aiReply) speak(nextText)
      return
    }

    const nextIndex = qIndex + 1
    if (nextIndex >= questionSet.questions.length) {
      setConversationOver(true)
      return
    }

    setQIndex(nextIndex)
    const plannedNext = questionSet.questions[nextIndex]
    setAiThinking(true)
    const history = [...messages, userMsg].map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
    const aiMessages = [
      {
        role: 'system',
        content: buildSystemPrompt(questionSet.title || TOPICS.find((t) => t.key === topic)?.label, questionSet.intro, plannedNext),
      },
      ...history,
    ]
    const aiReply = await askAI(aiMessages)
    const nextText = aiReply || plannedNext
    setAiThinking(false)
    setMessages((m) => [...m, { role: 'ai', text: nextText }])
    speak(nextText)
  }

  useEffect(() => {
    if (!conversationOver || !topic) return
    addSpeakingSession({ type: 'ai-partner', topic, durationSec: totals.words * 0.5, issueCount: totals.issues })
    const flatIssues = messages.filter((m) => m.role === 'user').flatMap((m) => m.issues || [])
    addGrammarMistakes(flatIssues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationOver])

  const resetAll = () => {
    setTopic(null)
    setScenarioId(null)
    setMessages([])
    setConversationOver(false)
    setCustomScenario(null)
    setCustomInput('')
    setCustomError(null)
  }

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">AI Speaking Partner</h1>
          <p className="mt-1 text-sm text-slate-400">Choose a topic and have a real conversation — entirely in your browser.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map(({ key, label, icon: Icon }) => {
            const directStart = key === 'interview' || key === 'freetalk'
            const scrollTarget = key === 'office' || key === 'daily'
            return (
              <Card
                key={key}
                hover
                className="cursor-pointer text-center"
                onClick={() => {
                  if (directStart) startConversation(key)
                  else if (scrollTarget) scrollToScenarioList(key)
                }}
              >
                <Icon size={22} className="mx-auto mb-2 text-brand-300" />
                <p className="text-sm font-semibold text-slate-100">{label}</p>
                {directStart && <p className="mt-1 text-xs text-slate-500">Tap to start</p>}
                {scrollTarget && <p className="mt-1 text-xs text-slate-500">Pick a scenario below</p>}
              </Card>
            )
          })}
        </div>

        <Card className="space-y-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Sparkles size={16} className="text-brand-300" /> Or describe your own situation
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              e.g. &quot;negotiating rent with my landlord&quot; or &quot;interview for a nurse job&quot; — the AI will build a
              scenario and questions around it.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !customLoading && generateCustomScenario()}
              maxLength={150}
              placeholder="Describe any situation you want to practice..."
              className="flex-1 rounded-xl border border-line/10 bg-bg-hover/60 p-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
            />
            <Button icon={Sparkles} disabled={customLoading || !customInput.trim()} onClick={generateCustomScenario}>
              {customLoading ? 'Generating...' : 'Generate & Start'}
            </Button>
          </div>
          {customError && <p className="text-xs text-accent-rose">{customError}</p>}
        </Card>

        {['office', 'daily'].map((key) => (
          <div
            key={key}
            ref={key === 'office' ? officeSectionRef : dailySectionRef}
            className={`rounded-2xl ring-2 ring-offset-4 ring-offset-bg transition-shadow duration-500 ${
              highlightSection === key ? 'ring-brand-500/60' : 'ring-transparent'
            }`}
          >
            <h2 className="mb-2 text-sm font-semibold text-slate-300">{key === 'office' ? 'Office Meeting Scenarios' : 'Daily Conversation Scenarios'}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(key === 'office' ? OFFICE_MEETING_SCENARIOS : DAILY_CONVERSATION_SCENARIOS).map((s) => (
                <Card key={s.id} hover className="cursor-pointer" onClick={() => startConversation(key, s.id)}>
                  <p className="text-sm font-medium text-slate-100">{s.title}</p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{s.context}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">{questionSet?.title || (isFreeTalk ? 'Free Talk' : 'Job Interview Practice')}</h1>
        <div className="flex items-center gap-2">
          {isFreeTalk && !conversationOver && (
            <Button size="sm" variant="secondary" icon={LogOut} onClick={() => setConversationOver(true)}>
              End Conversation
            </Button>
          )}
          <Button size="sm" variant="ghost" icon={RotateCcw} onClick={resetAll}>
            New Topic
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-line/5 bg-line/[0.01] p-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} issues={m.issues} fillers={m.fillers} onSpeak={m.role === 'ai' ? () => speak(m.text) : null} />
        ))}
        {conversationOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-accent-teal/20 bg-accent-teal/5 p-4 text-center">
            <p className="text-sm font-semibold text-accent-teal">Conversation complete!</p>
            <p className="mt-1 text-xs text-slate-400">
              {totals.words} words · {totals.issues} grammar issues · {totals.fillers} hesitations
            </p>
            <Button size="sm" className="mt-3" onClick={resetAll}>
              Start Another Conversation
            </Button>
          </motion.div>
        )}
      </div>

      {!conversationOver && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-line/5 bg-bg-soft p-3">
          <div className="flex-1 truncate text-sm text-slate-400">
            {isListening ? fullTranscript || 'Listening...' : isFreeTalk ? 'Tap the mic and say what\'s on your mind.' : 'Tap the mic and answer the question aloud.'}
          </div>
          {isSupported ? (
            <button
              onClick={isListening ? submitAnswer : start}
              disabled={aiThinking}
              className={`flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50 ${
                isListening ? 'bg-accent-rose/20 text-accent-rose' : 'bg-gradient-to-br from-brand-500 to-accent-teal text-white'
              }`}
            >
              {isListening ? <Send size={16} /> : <Mic size={16} />}
            </button>
          ) : (
            <span className="text-xs text-accent-amber">Mic unsupported</span>
          )}
        </div>
      )}
      {aiThinking && <p className="mt-1 text-center text-xs text-brand-300">AI is thinking...</p>}
      {speaking && <p className="mt-1 text-center text-xs text-brand-300">AI is speaking...</p>}
    </div>
  )
}
