import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'

// Dashboard loads eagerly since it's the landing page anyway; every other
// page is code-split so the initial bundle only needs to cover the home
// screen. Layout.jsx wraps <Outlet /> in the single Suspense boundary that
// covers all of these.
const Practice = lazy(() => import('./pages/Practice'))
const SpeakingPartner = lazy(() => import('./pages/SpeakingPartner'))
const Pronunciation = lazy(() => import('./pages/Pronunciation'))
const Storytelling = lazy(() => import('./pages/Storytelling'))
const Progress = lazy(() => import('./pages/Progress'))
const VocabularyReview = lazy(() => import('./pages/VocabularyReview'))
const MyVocabulary = lazy(() => import('./pages/MyVocabulary'))
const SentenceMistakes = lazy(() => import('./pages/SentenceMistakes'))
const Settings = lazy(() => import('./pages/Settings'))
const Achievements = lazy(() => import('./pages/Achievements'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/speaking-partner" element={<SpeakingPartner />} />
        <Route path="/pronunciation" element={<Pronunciation />} />
        <Route path="/storytelling" element={<Storytelling />} />
        <Route path="/vocabulary" element={<MyVocabulary />} />
        <Route path="/review" element={<VocabularyReview />} />
        <Route path="/sentence-mistakes" element={<SentenceMistakes />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
