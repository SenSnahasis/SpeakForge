# SpeakForge

A frontend-only English speaking practice app for beginners — 15 focused minutes a day to build vocabulary, fix grammar, and speak with more confidence. Almost everything runs in the browser: no database, all progress stored in `localStorage`, including a spaced-repetition schedule so learned words resurface a few days later instead of being forgotten. The one exception is an **optional** AI layer (see [AI-Powered Features](#16-ai-powered-features-optional)) that adds a single small serverless function; every core feature works with zero backend and zero API keys.

## Status: MVP complete

All core features below are implemented and have been smoke-tested (production build + automated click-through of every page and the full practice flow, zero console errors).

## Tech Stack

- **React 18 + Vite** — app shell and dev/build tooling
- **Tailwind CSS** — styling, dark mode by default with a light mode toggle (see Theming below)
- **Framer Motion** — page/section transitions and micro-animations
- **Recharts** — progress charts
- **react-router-dom** — client-side routing
- **lucide-react** — icon set
- **Browser APIs** — `SpeechRecognition` (speech-to-text), `SpeechSynthesis` (AI voice), `MediaRecorder` (record/replay)
- **localStorage** — the only persistence layer
- **vite-plugin-pwa** — installable PWA with offline app-shell caching (see below)
- **Vitest + React Testing Library** — unit/component tests (see Testing below)
- **Vercel Serverless Function + NVIDIA API** (optional) — powers the four AI features (see below); the app runs fully without it

## Features Implemented

### 1. Dashboard (`src/pages/Dashboard.jsx`)
- Today's 15-minute plan with per-section completion checklist
- Daily streak (current + longest)
- Total speaking minutes, words learned, grammar mistake count, lessons completed
- Confidence score ring with qualitative label (Keep Practicing → Confident)
- Rotating daily motivational quote
- AI Weekly Insight card — a short, personalized progress summary (see [AI-Powered Features](#16-ai-powered-features-optional))

### 2. Daily Practice flow (`src/pages/Practice.jsx`)
A 6-step guided session, each step with its own countdown timer and "Continue" control:

| Section | Time | What it does |
|---|---|---|
| Warmup | 2 min | Rotating tongue-twisters/phrases with TTS playback + optional mic practice |
| Vocabulary Builder | 3 min | 5 daily words (rotates from a 200-word bank), Bengali hint toggle, pronunciation button, user writes/speaks their own sentence, mark Learned/Still Learning |
| Sentence Builder | 3 min | Fix a broken sentence, instant check against the correct form, grammar tip, then speak the corrected sentence aloud for a pronunciation-match score |
| Scenario Speaking | 4 min | Real-life scenario (office meeting or daily conversation), AI asks questions via TTS, user answers via mic, live rule-based grammar correction + filler-word count |
| Storytelling | 2 min | Speaks freely on a daily prompt, transcript captured with grammar issues highlighted inline |
| Confidence Review | 1 min | Session summary (words spoken, issues found) + computed confidence score, with a quick self-rating that nudges the score |

Finishing all 6 sections updates streak, `completedLessons`, `dailyTimeSpent`, `grammarMistakes`, and `confidenceHistory` in one go. Grammar mistakes and the storytelling speaking-session entry are persisted **immediately** inside each section component (not deferred to the end of the session), so a mistake survives even if you quit mid-section.

**Reattempting an already-completed day:** navigating to `/practice` (via the sidebar or the Dashboard's "Practice Again" button) after finishing today's plan starts a bonus round with **fresh content** — different vocabulary words, sentences, scenario, and story prompt than the round you just did, not a repeat. This is tracked via `state.bonusRounds[today]` (incremented each time a redo starts) and shifts the day-based content rotation index accordingly. The completion screen's "Practice Again" button restarts in place (no page navigation) for chaining multiple bonus rounds.

### 3. Vocabulary Builder — also see `src/data/vocabulary.js`
- 200 beginner words across 10 categories (Greetings, Daily Routine, Food, Family, Work, Travel, Emotions, Shopping, Health, Time/Weather)
- Each word has an example sentence + Bengali (বাংলা) meaning hint
- Learned/weak-word tracking persisted per word, with the date first learned (feeds the Progress chart)

### 4. Sentence Builder — `src/data/sentences.js`
- 30 broken-sentence drills with the corrected form and a grammar tip
- Pattern-based speaking drills (e.g. "I used to ___, but now I ___.") for structured practice

### 5. AI Speaking Partner (`src/pages/SpeakingPartner.jsx`)
- Five conversation modes: Job Interview (15 rotating questions), Office Meeting (8 scenarios), Daily Conversation (10 scenarios), Free Talk (open-ended, no fixed topic), and a custom AI-generated scenario from any situation you type — see [AI-Powered Features](#16-ai-powered-features-optional)
- Chat-style UI: AI "speaks" each question via SpeechSynthesis, user answers via SpeechRecognition
- Inline rule-based grammar correction shown under each answer, hesitation/filler-word tracking
- Session summary logged to speaking history on completion

### 6. Pronunciation Practice (`src/pages/Pronunciation.jsx`)
- 15 target phrases (Easy/Medium/Hard) with TTS reference audio
- Record via `MediaRecorder`, replay your own voice
- Accuracy score computed via word-level Levenshtein similarity between the target phrase and your recognized transcript
- Recent-attempts history

### 7. Storytelling Practice (`src/pages/Storytelling.jsx`)
- 30 rotating daily prompts (browsable prev/next, or randomize)
- Up to 2 minutes of recording (audio + live transcript simultaneously)
- Grammar issues highlighted directly in the transcript text
- Past-stories history

### 8. My Vocabulary — full browsable word bank (`src/pages/MyVocabulary.jsx`)
- Every word you've ever marked Learned or Still Learning, in one searchable list — not gated behind the daily rotation or the spaced-repetition due date, so you can recall/practice any of them on demand
- Search by word, Bengali meaning, or category; filter chips for All / Due Now / Learned / Needs Review
- Each card shows the meaning, example sentence, your own saved practice sentence (if any), a pronunciation button, and its next scheduled review date
- "I Remembered" / "I Forgot" buttons call the same `reviewWord()` action as Vocabulary Review, so browsing here can genuinely advance (or reset) a word's spaced-repetition schedule, not just view it
- Sorted soonest-due-first so the words most at risk of being forgotten surface at the top

### 9. Vocabulary Review — spaced repetition (`src/pages/VocabularyReview.jsx`)
- Every word marked Learned/Still Learning (in Vocabulary Builder) or answered in a review is scheduled via a 6-box Leitner system (`src/utils/spacedRepetition.js`): intervals of 1 → 2 → 4 → 7 → 14 → 30 days on each correct recall, reset to 1 day on a miss
- Words never resurface the same day they were learned — this directly targets the "forget vocabulary" problem instead of only doing same-day marking
- `/review` shows only words currently due; flip-card style (reveal meaning → "I Remembered" / "I Forgot"), updates the schedule, learned/weak lists, and `learnedDates`
- Live due-count badge in the sidebar/mobile nav + a dashboard reminder card that only appears when something is actually due

### 10. Sentence Mistakes — retry practice (`src/pages/SentenceMistakes.jsx`)
- Every distinct sentence you've ever gotten wrong in Sentence Builder, deduped and grouped from the `grammarMistakes` log (`src/utils/sentenceMistakes.js`), sorted most-missed-first
- Unlike the in-session flow (which only shows you the answer once), this page makes you **retype the correction** before revealing it — a real retry, not just a reminder
- After revealing, you can also speak the corrected sentence aloud for a pronunciation-match score, same as Sentence Builder
- Tracks a separate `sentencePractice` log (attempts/correct/last result) per sentence, shown on each card, independent of the historical mistake count so the Progress page's trend chart isn't affected by retries

### 11. Progress Page (`src/pages/Progress.jsx`)
- GitHub-style streak calendar (last 28 days, intensity = minutes practiced)
- Speaking minutes per day (area chart)
- Vocabulary learned per day (bar chart)
- Grammar mistakes per day — improvement trend (line chart)
- Confidence score per day (line chart)
- Learned vs. needs-review vocabulary breakdown (pie chart)

### 12. Settings — preferences, backup, restore, reset (`src/pages/Settings.jsx`)
- **Speech & Practice Preferences**: an AI Voice picker (populated from `speechSynthesis.getVoices()`, filtered to English), a Speech Rate slider (0.6x–1.4x) with a Test Voice button, and a "Show Bengali hints automatically" toggle for Vocabulary Builder. These `settings` fields (`hintsEnabled`, `speechRate`, `voiceURI`) existed in the data model since the first build but had no UI and no effect until now.
  - `useSpeechSynthesis` (`src/hooks/useSpeechSynthesis.js`) now reads `speechRate`/`voiceURI` from `state.settings` as its defaults via `useAppState()` internally — every existing call site (Warmup, Vocabulary Builder, Sentence Builder, Scenario Speaking, AI Speaking Partner, Pronunciation, Vocabulary Review, Sentence Mistakes) automatically picks up the saved preference with no changes needed at the call sites themselves.
  - `hintsEnabled` sets the *initial* reveal state of the Bengali hint in Vocabulary Builder only — Vocabulary Review and Sentence Mistakes intentionally always start hidden, since revealing-on-demand is the point of those recall exercises.
- Since all progress lives only in this browser's `localStorage`, **Download Backup** packages the entire state into a JSON file (`speakforge-backup-YYYY-MM-DD.json`) via a `Blob` + temporary `<a download>` link — no server involved
- **Restore from Backup** opens the native file picker, reads the file with the File API, validates it's JSON and looks like a SpeakForge backup, and — after a confirmation modal, since it overwrites current progress — calls `restoreFromBackup()`, which writes to `localStorage` **and** pushes the restored data into live React state via `setState`, so every page updates immediately with no reload
- Moving data to a new browser/device is manual: download the file, transfer it yourself (email, USB, cloud drive), then restore it there
- A separate **Danger Zone** wires up the (previously unused) `resetAll()` action to a confirmation modal, for permanently wiping progress on this device
- Reachable via a gear icon in the header, not the main sidebar — `src/components/layout/Topbar.jsx`

### 13. Achievements (`src/pages/Achievements.jsx`, `src/data/achievements.js`, `src/utils/achievements.js`)
- 20 badges across 6 categories (Streak, Vocabulary, Practice, Speaking, Confidence, Review), each purely **derived** from existing state — no separate "earned" flag to keep in sync, no unlock-date tracking, just `getValue(state) >= target`
- Examples: 3/7/14/30-day streaks, 10–200 words learned, 1/30/100 practice sections completed, a "bonus round" badge, 10/60/300 speaking minutes, a 95%+ pronunciation score, an 85+ confidence score, fixing a sentence mistake on retry, successfully recalling a word during spaced review
- Locked badges show a progress bar (`current / target`); earned ones get a teal highlight and checkmark
- A Dashboard tile ("X/Y unlocked") links straight to the full page

### 14. Onboarding walkthrough (`src/components/onboarding/OnboardingWalkthrough.jsx`)
- A 4-step modal shown once on first visit — what the app does, the 6-step daily flow, why microphone access will be requested (and that voice never leaves the browser), and where progress gets tracked (Vocabulary Review, Sentence Mistakes, Achievements, Progress)
- Dismissible at any point (X, "Skip", or finishing to "Start Practicing") — all three paths set a dedicated `speakforge-onboarding-complete` localStorage flag (separate from the main app-data key, same pattern as the theme preference) so it never shows again
- Mounted once in `Layout.jsx`, so it appears regardless of which route is first loaded

### 15. localStorage data model — `src/utils/storage.js`
Single key `speakforge:v1` holding:
```
streak              { current, longest, lastPracticeDate, history }
vocabulary           { learnedIds, weakIds, sentencesByWordId, learnedDates, reviewSchedule }
                       reviewSchedule[wordId] = { box, nextReviewDate, reviewCount, lastReviewedDate }
speakingSessions     [ { type, date, transcript/phrase/topic, durationSec, ... } ]
grammarMistakes      [ { date, category, original, corrected, message } ]
confidenceHistory    [ { date, score } ]
completedLessons     { "YYYY-MM-DD": [sectionKeys] }
dailyTimeSpent       { "YYYY-MM-DD": seconds }
sentencePractice     { [brokenSentenceText]: { attempts, correct, lastAttemptDate, lastCorrect } }
bonusRounds          { "YYYY-MM-DD": count }  — redo count, shifts content rotation for reattempts
settings             { hintsEnabled, speechRate, voiceURI, lastVisitDate }
```
`loadState()` deep-merges the `vocabulary` and `settings` sub-objects against fresh defaults, so adding new fields (like `reviewSchedule`) doesn't break existing saved data from before the field existed.
All reads/writes go through `AppStateContext` (`src/context/AppStateContext.jsx`), which auto-persists on every state change.

### 16. AI-Powered Features (optional) — `api/ai-chat.js`, `src/utils/aiClient.js`

Six features are layered on top of the existing rule-based logic using an LLM (NVIDIA's hosted API, free tier). Five of them **degrade gracefully**: if no API key is configured, or the request fails for any reason, the app falls back to its original rule-based/scripted behavior — nothing breaks, nothing is required. Free Talk is the one exception, since it has no scripted equivalent by design (see below).

- **AI Speaking Partner — scripted modes** (`src/pages/SpeakingPartner.jsx`) — instead of playing back the next question from a fixed list verbatim, the app sends the conversation history to the AI and asks it to react naturally to what you just said, then ask the next planned question in its own words, staying in character for the scenario. If the AI call fails, it falls back to the scripted question exactly as before.
- **AI Speaking Partner — Free Talk mode** (`src/pages/SpeakingPartner.jsx`) — a conversation mode with no fixed topic or question bank at all: the AI generates every reply from scratch, reacting to whatever the user brings up and introducing a new everyday topic if the conversation stalls. An "End Conversation" button ends the session on demand (there's no natural end-of-questions point like the scripted modes). Since there's no scripted fallback content for an open-ended chat, a failed AI call surfaces as an in-character "having trouble, could you say that again?" message rather than breaking the flow.
- **AI Speaking Partner — Custom Scenario** (`src/pages/SpeakingPartner.jsx`) — a text box on the topic-selection screen where the user describes any situation ("negotiating rent with my landlord", "interview for a nurse job"), and the AI generates a full scenario (title, one-sentence context, 4 questions) as JSON on the fly, which then plays through the exact same in-character conversation flow as the built-in Office/Daily scenarios (`parseScenarioJSON` defensively validates the shape and rejects anything malformed, surfacing a plain-language error to retry rather than crashing on bad AI output). This is the one place in the app where the AI generates *content* up front rather than just reacting turn-by-turn.
- **"Explain with AI"** (`src/components/sentences/SentenceMistakeCard.jsx`, on Sentence Mistakes) — an on-demand button that asks the AI for a short, beginner-friendly explanation of *why* a particular mistake is wrong, using the existing rule's category/tip as context. Not automatic — only fires when tapped, to keep API usage low.
- **"Get AI Feedback"** (`src/components/storytelling/StorySession.jsx`, on Storytelling) — after finishing a story, an on-demand button asks the AI for brief, encouraging feedback (one strength, one specific thing to improve) on the transcript, alongside the existing rule-based grammar/filler-word stats.
- **Weekly Insight** (`src/components/dashboard/WeeklyInsightCard.jsx`, on Dashboard) — a short, personalized paragraph analyzing the learner's actual data: streak momentum, most frequent grammar mistake categories, vocabulary topics with the most "still learning" words, and latest confidence score (`src/utils/insights.js` builds this summary from state). Unlike the other features, this one is **cached and regenerated on a schedule rather than per view**: `state.weeklyInsight = { text, generatedAt }` is checked against a 7-day threshold (`shouldRegenerateInsight`) on Dashboard mount, so opening the Dashboard repeatedly in the same week costs zero extra API calls — verified via Playwright that a reload with a fresh cache fires no request, while a manual refresh (or the 7-day threshold passing) does. A manual refresh button next to the card title bypasses the schedule on demand. Requires a small amount of practice history first (at least 3 grammar mistakes, 5 words learned, or 3 speaking sessions — `hasEnoughDataForInsight`) so the very first insight isn't generated from near-empty data.

**Why a serverless proxy instead of calling the API directly from the browser:** an API key embedded in frontend code is visible to anyone via the browser's network tab, which would let others drain the free-tier quota. `api/ai-chat.js` is a Vercel serverless function that holds `NVIDIA_API_KEY` server-side only; the browser calls `/api/ai-chat`, never the NVIDIA API directly. It also caps conversation length/size sent upstream as a basic abuse guard.

**Model:** `meta/llama-3.1-8b-instruct` via NVIDIA's OpenAI-compatible endpoint (`https://integrate.api.nvidia.com/v1/chat/completions`). A larger reasoning model (`nvidia/llama-3.3-nemotron-super-49b-v1.5`) was tried first but proved unreliable for this use case — it kept breaking character and reverting to generic "helpful assistant" responses with markdown formatting, even with explicit instructions not to, and its hidden chain-of-thought pass could silently consume the entire token budget and return an empty reply. The smaller instruct model followed the "stay in character, plain text, short reply" constraints consistently and uses far fewer tokens per call.

**Setup (only needed if you want the AI features):**
1. Get a free API key at [build.nvidia.com](https://build.nvidia.com).
2. Local dev: copy `.env.local.example` to `.env.local` and paste your key in; run `vercel dev` instead of `npm run dev` (Vite alone doesn't execute the `/api` function).
3. Production: in the Vercel dashboard, Project Settings → Environment Variables → add `NVIDIA_API_KEY`, then redeploy.

Without a configured key, `/api/ai-chat` returns an error the client already treats as "AI unavailable." The three features with a rule-based/scripted equivalent silently fall back to their pre-AI behavior; Free Talk mode still opens (the intro line is static, not AI-generated) but shows the "having trouble" message instead of a real reply once you speak, since there's nothing to fall back to.

### 17. PWA / offline install support — `vite-plugin-pwa`, `vite.config.js`

SpeakForge is installable (Add to Home Screen on mobile, Install App on desktop Chrome/Edge) and the app shell keeps working with no internet connection at all — verified by loading the production build, then fully disabling network access and reloading/navigating between routes with everything still rendering correctly.

- **How it works:** `vite-plugin-pwa` (Workbox under the hood) generates a service worker (`dist/sw.js`) at build time that precaches every built JS/CSS/HTML/icon file. On first visit the service worker installs in the background; on later visits (or with no connection at all) it serves the app shell straight from cache instead of the network. `registerType: 'autoUpdate'` means a new deployment's service worker takes over automatically on the next load, no user action needed.
- **What still needs internet:** the three AI features (see above) always require a live network call — the service worker deliberately never caches `/api/ai-chat` (a dynamic, personalized POST endpoint), so those either work over a live connection or fall back to their existing non-AI behavior offline, exactly as they already did before PWA support existed. Everything else — vocabulary, streaks, grammar checking, progress charts — is `localStorage`-based and was already offline-capable; what PWA support adds is the ability to *open the app at all* with no connection, including a cold start from the home-screen icon.
- **Install UI** (`src/hooks/useInstallPrompt.js`, surfaced in `src/pages/Settings.jsx`) — listens for the browser's `beforeinstallprompt` event and shows an explicit "Install App" button when available (Android/desktop Chrome/Edge), since browsers don't always surface their own install prompt proactively. iOS Safari has no equivalent API, so it shows manual "Share → Add to Home Screen" instructions instead. Hidden entirely once the app is already running in standalone/installed mode.
- **Icons** (`public/pwa-*.png`, `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`) were generated from the existing `favicon.svg` via `@vite-pwa/assets-generator`, including a properly padded maskable icon so Android's adaptive-icon masking doesn't crop the logo.

## Performance — route-based code-splitting

`src/App.jsx` lazy-loads every page except Dashboard via `React.lazy(() => import('./pages/X'))`; `Layout.jsx` wraps `<Outlet />` in a single `<Suspense fallback={<PageLoader />}>` boundary that covers all of them. Dashboard stays eager since it's the landing page anyway — lazy-loading the very first thing the user sees would just add a loading flash for no benefit.

This cut the main JS bundle from ~860KB to **~330KB**. The biggest single win: `Progress.jsx` (the only page using Recharts) now ships as its own ~427KB chunk that only downloads when you actually visit `/progress`, instead of being in everyone's initial load. Verified via production build + Playwright that every route still loads correctly both on full page load and on client-side SPA navigation between chunks, with no console errors.

## Theming — dark (default) + light

The toggle button lives in the topbar (sun/moon icon, visible on every page). Preference is stored under its own localStorage key (`speakforge-theme`, `'dark'` or `'light'`) separate from the main app-data key, and applied by toggling a `dark` class on `<html>`. An inline script in `index.html`'s `<head>` applies the saved theme before React boots, so there's no flash-of-wrong-theme on load.

**How it works — CSS variables, not per-component `dark:` classes.** Rather than adding a `dark:`/light variant to every color class across ~30 components, the neutral color system is redefined as CSS custom properties in `src/index.css` (`:root` = light, `.dark` = dark), and `tailwind.config.js` points its `slate`, `bg`, and a new `line` color token at those variables via the `rgb(var(--x) / <alpha-value>)` pattern. Concretely:
- The `slate` palette (used everywhere for text) is **mirrored** between themes — `light[N] === dark[1000-N]` — reusing Tailwind's own real slate hex values just assigned to the opposite shade number, so every existing `text-slate-*` class automatically gets correct contrast in both themes with zero component changes.
- `bg`/`bg-soft`/`bg-card`/`bg-hover` (page/panel/card/hover surfaces) are redefined per theme (dark: near-black navy scale, unchanged from the original design; light: off-white page, white cards).
- A new `line` token replaces raw `border-white/N` / `bg-white/N` opacity overlays (white in dark mode — pixel-identical to before — near-black in light mode), since Tailwind's real `white`/`black` tokens couldn't be repurposed without breaking the handful of places that use literal white text on fixed gradient buttons/badges (those are intentionally left as plain `text-white`, unaffected by theme).
- Brand/accent colors (`brand-*`, `accent-teal/amber/rose/violet`) are **not** themed — they stay identical in both modes for consistent identity.
- A few chart/SVG spots pass raw hex as props instead of Tailwind classes (`ProgressRing`'s track color, `StreakCalendar`'s intensity scale, `Progress.jsx`'s Recharts grid/tooltip styling) and can't pick up CSS variables automatically — these read `useTheme()` directly and look up the right value from `src/utils/themeColors.js`.

Theme state lives in `src/context/ThemeContext.jsx` (`ThemeProvider` + `useTheme()`), wrapping the app in `main.jsx` alongside `AppProvider`.

## Project Structure

```
api/
  ai-chat.js      Vercel serverless function — proxies chat requests to NVIDIA's API (see AI-Powered Features)
src/
  components/
    common/        Card, Button, Modal, ProgressRing, Timer, StreakBadge, MotivationalQuote, ThemeToggle, PageLoader
    layout/         Sidebar (grouped nav: Practice / Review / Insights), MobileNav (4 tabs + "More" sheet for the rest), Topbar, Layout (routing shell)
    dashboard/      StatCard, TodayPlan, WeeklyInsightCard (AI progress summary)
    practice/       SectionShell + the 6 practice-section components
    storytelling/   StorySession (record+transcribe+highlight), HighlightedTranscript
    speaking-partner/ ChatBubble
    progress/       ChartCard, StreakCalendar
    vocabulary/     VocabularyWordCard (used by My Vocabulary)
    sentences/      SentenceMistakeCard (used by Sentence Mistakes)
    onboarding/     OnboardingWalkthrough (first-run guide)
  hooks/            useSpeechRecognition, useSpeechSynthesis, useMediaRecorder, useTimer, useLocalStorage, useDueReviewCount, useInstallPrompt (PWA install)
  utils/            storage, dateUtils, grammar (rule-based checker), similarity (pronunciation scoring), scoring (confidence formula), spacedRepetition (Leitner scheduler), themeColors (light/dark lookup for raw-hex chart colors), sentenceMistakes (dedupe/group grammarMistakes), achievements (badge progress calculation), aiClient (calls /api/ai-chat, returns null on failure), insights (Weekly Insight data summary + regeneration schedule)
  data/             vocabulary (200 words), prompts (30 stories), scenarios (interview/office/daily), sentences (30 drills), quotes, pronunciation, dailyPlan, achievements (20 badge definitions)
  context/          AppStateContext (global state + localStorage sync), ThemeContext (dark/light toggle)
  pages/            Dashboard, Practice, SpeakingPartner, Pronunciation, Storytelling, MyVocabulary, VocabularyReview, SentenceMistakes, Progress, Achievements, Settings
```

**Navigation structure:** the 10 pages are grouped (in `src/components/layout/Sidebar.jsx`'s `NAV_GROUPS`) into an ungrouped Dashboard, then **Practice** (Daily Practice, AI Speaking Partner, Pronunciation, Storytelling), **Review** (My Vocabulary, Vocabulary Review, Sentence Mistakes), and **Insights** (Progress, Achievements) — rendered as labeled sections on the desktop sidebar. On mobile, only Dashboard/Daily Practice/Progress get a permanent bottom-tab slot; the other 7 pages live behind a **"More"** button that opens the same grouped list in a modal sheet, so the bottom bar doesn't get cramped as pages keep being added. Settings sits outside this structure entirely, behind a gear icon in the header.

## Running the app

```bash
npm install
npm run dev        # starts Vite dev server (default: http://localhost:5173)
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run test       # run the test suite once
npm run test:watch # run tests in watch mode
```

No environment variables or backend setup required for the core app. Speech features work best in Chrome/Edge (desktop); browsers without `SpeechRecognition`/`MediaRecorder` support gracefully hide the mic controls instead of erroring.

To also run the optional AI features locally (see [AI-Powered Features](#16-ai-powered-features-optional)), use `vercel dev` instead of `npm run dev` — it serves the Vite app *and* executes `api/ai-chat.js`, which `npm run dev` alone cannot.

## Testing

Vitest + React Testing Library, configured in `vite.config.js` (`test` block) with `src/setupTests.js` wiring up `@testing-library/jest-dom`. **121 tests across 10 files:**

- `src/utils/grammar.test.js` (19) — every rule in the rule-based grammar checker plus `countFillerWords`.
- `src/utils/scoring.test.js` (16) — `computeConfidenceScore` boundary/clamping, `scoreLabel` thresholds, `streakMultiplierMessage` copy.
- `src/utils/spacedRepetition.test.js` (14) — Leitner box promotion/reset, the box cap, `isDue`, `getDueWords`, `getNextUpcomingReviewDate`.
- `src/utils/sentenceMistakes.test.js` (7) — dedupe/grouping, category filtering, most-missed-first sort with recency tiebreak.
- `src/utils/similarity.test.js` (10) — `pronunciationScore` word-level edit distance, case/punctuation/whitespace insensitivity, `diffWords`.
- `src/utils/dateUtils.test.js` (15) — date-key formatting, day arithmetic across month/year boundaries, `dayOfYear`.
- `src/utils/storage.test.js` (18) — `loadState`/`saveState`/`resetState` round-tripping, schema migration (old saved data missing newer fields), `importStateJSON` validation, and `computeStreakUpdate` (continue/break/first-ever streak logic).
- `src/utils/achievements.test.js` (8) — achievement earned/locked calculation against a default and populated state.
- `src/utils/insights.test.js` (10) — Weekly Insight data-enough thresholds, the 7-day regeneration gate, and the generated summary text.
- `src/components/common/Button.test.jsx` (4) — an RTL smoke test (render, click, disabled state, icon).

**Two real bugs were caught and fixed by writing these tests:**
1. Fixed-expression grammar rules like "it is depend on" → "it depends on" had hardcoded lowercase replacements, so a sentence-initial match lost its capitalization. Fixed via `preserveLeadingCase` in `src/utils/grammar.js`.
2. `computeStreakUpdate` computed "yesterday" from the real system clock (`Date.now()`) instead of the `today` argument passed in — invisible in normal use (where `today` is always the real current date) but incorrect and untestable. Fixed to derive yesterday from the `today` parameter via `addDaysToKey(today, -1)`.

Not yet covered: hooks that wrap browser-only APIs (`useSpeechRecognition`, `useSpeechSynthesis`, `useMediaRecorder`), and page-level integration tests (verified manually via Playwright instead throughout this project's development).

## Known limitations / not yet done

- Grammar correction is a rule-based pattern matcher (`src/utils/grammar.js`) covering common beginner mistakes — it is not a full NLP grammar engine, so it won't catch every error. This is unaffected by the optional AI features, which only add on-demand explanations/conversation on top.
- Not yet verified with a real microphone/live speech (only automated headless-browser click-through testing has been done); voice recognition accuracy should be tried manually in Chrome.
- The AI features depend on a third-party free-tier API (NVIDIA); an 8B-parameter model occasionally gets a grammar explanation slightly wrong (e.g. mislabeling a tense) — treat its explanations as a helpful supplement to, not a replacement for, the rule-based checker's `tip` text.
