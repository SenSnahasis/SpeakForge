import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Upload, AlertTriangle, CheckCircle2, XCircle, Trash2, Volume2, Smartphone } from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { useAppState } from '../context/AppStateContext'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useInstallPromptContext } from '../context/InstallPromptContext'
import { exportStateJSON } from '../utils/storage'
import { todayKey } from '../utils/dateUtils'

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-line/15 transition-colors peer-checked:bg-brand-500" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

export default function Settings() {
  const { state, updateSettings, restoreFromBackup, resetAll } = useAppState()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { isSupported: speechSupported, voices, speak } = useSpeechSynthesis()
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPromptContext()

  const [pendingRestoreText, setPendingRestoreText] = useState(null)
  const [restoreError, setRestoreError] = useState(null)
  const [restoreSuccess, setRestoreSuccess] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const wordsLearned = state.vocabulary.learnedIds.length
  const totalMinutes = Math.round(Object.values(state.dailyTimeSpent).reduce((sum, s) => sum + s, 0) / 60)
  const englishVoices = voices.filter((v) => v.lang?.startsWith('en'))

  const handleDownload = () => {
    const json = exportStateJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `speakforge-backup-${todayKey()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file next time
    if (!file) return
    setRestoreError(null)
    setRestoreSuccess(false)
    try {
      const text = await file.text()
      JSON.parse(text) // fail fast with a clear error before the confirm step
      setPendingRestoreText(text)
    } catch {
      setRestoreError("That file isn't valid JSON.")
    }
  }

  const confirmRestore = () => {
    try {
      restoreFromBackup(pendingRestoreText)
      setRestoreSuccess(true)
    } catch (err) {
      setRestoreError(err.message)
    } finally {
      setPendingRestoreText(null)
    }
  }

  const confirmReset = () => {
    resetAll()
    setShowResetConfirm(false)
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Back up your progress, or restore it on a new browser or device.</p>
      </div>

      {!isInstalled && (
        <Card className="space-y-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-100">
              <Smartphone size={16} /> Install SpeakForge
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Install the app on your phone or computer for quick access from your home screen. The core practice
              features keep working even with no internet connection.
            </p>
          </div>
          {canInstall ? (
            <Button icon={Download} onClick={promptInstall}>
              Install App
            </Button>
          ) : isIOS ? (
            <p className="text-xs text-slate-500">On iPhone/iPad: tap the Share icon in Safari, then "Add to Home Screen".</p>
          ) : (
            <p className="text-xs text-slate-500">
              Look for an install icon in your browser&apos;s address bar, or open the browser menu and choose &quot;Install
              SpeakForge&quot;.
            </p>
          )}
        </Card>
      )}

      <Card className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Speech &amp; Practice Preferences</h2>
          <p className="mt-1 text-sm text-slate-400">
            Controls how the AI voice sounds when it speaks to you, and how much help you get while learning new words.
          </p>
        </div>

        {speechSupported ? (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">AI Voice</label>
              <select
                value={state.settings.voiceURI || ''}
                onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
                className="w-full rounded-xl border border-line/10 bg-bg-hover/60 p-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Automatic (recommended)</option>
                {englishVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Speech Rate</label>
                <span className="text-xs text-slate-500">{state.settings.speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={state.settings.speechRate}
                onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-brand-500"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-600">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Volume2}
              onClick={() => speak('Hello! This is how I will sound when we practice together.')}
            >
              Test Voice
            </Button>
          </>
        ) : (
          <p className="text-xs text-accent-amber">Speech synthesis isn&apos;t supported in this browser.</p>
        )}

        <div className="border-t border-line/5 pt-4">
          <ToggleSwitch
            checked={state.settings.hintsEnabled}
            onChange={(checked) => updateSettings({ hintsEnabled: checked })}
            label="Show Bengali hints automatically"
            description="In Vocabulary Builder, reveal the Bengali meaning right away instead of requiring a tap."
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Backup &amp; Restore</h2>
          <p className="mt-1 text-sm text-slate-400">
            All your progress — streak, vocabulary, mistakes, and scores — lives only in this browser. Download a backup file now
            and then restore it here (or on another device) if you ever clear your browser data or switch machines.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 rounded-xl bg-line/[0.02] p-3 text-xs text-slate-500">
          <span>Current data: {wordsLearned} words learned</span>
          <span>·</span>
          <span>{totalMinutes} minutes practiced</span>
          <span>·</span>
          <span>{state.streak.current}-day streak</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button icon={Download} onClick={handleDownload}>
            Download Backup
          </Button>
          <Button variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
            Restore from Backup
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileSelected} className="hidden" />
        </div>

        {restoreError && (
          <div className="flex items-start gap-2 rounded-xl bg-accent-rose/10 p-3 text-sm text-accent-rose">
            <XCircle size={16} className="mt-0.5 shrink-0" />
            {restoreError}
          </div>
        )}
        {restoreSuccess && (
          <div className="flex items-start gap-2 rounded-xl bg-accent-teal/10 p-3 text-sm text-accent-teal">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            Backup restored — your progress has been updated.
          </div>
        )}
      </Card>

      <Card className="space-y-4 border-accent-rose/20">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-accent-rose">
            <AlertTriangle size={16} /> Danger Zone
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Permanently erase all progress on this device — streak, vocabulary, mistakes, and scores. This cannot be undone
            unless you have a backup file.
          </p>
        </div>
        <Button variant="danger" icon={Trash2} onClick={() => setShowResetConfirm(true)}>
          Reset All Progress
        </Button>
      </Card>

      <Modal open={!!pendingRestoreText} onClose={() => setPendingRestoreText(null)} title="Restore this backup?">
        <p className="text-sm text-slate-400">
          This will replace all current progress on this device with the contents of the backup file. This can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setPendingRestoreText(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmRestore}>
            Restore
          </Button>
        </div>
      </Modal>

      <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset all progress?">
        <p className="text-sm text-slate-400">
          This permanently deletes your streak, vocabulary, mistakes, and scores from this browser. Download a backup first if
          you might want this data later.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReset}>
            Reset Everything
          </Button>
        </div>
      </Modal>
    </div>
  )
}
