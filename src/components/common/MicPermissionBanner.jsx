import { useState } from 'react'
import { MicOff, X } from 'lucide-react'

const DISMISS_KEY = 'speakforge-mic-banner-dismissed'

export default function MicPermissionBanner({ status }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === 'true')

  if (status !== 'denied' || dismissed) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      /* storage unavailable */
    }
    setDismissed(true)
  }

  return (
    <div className="flex items-start gap-3 border-b border-accent-amber/20 bg-accent-amber/10 px-4 py-2.5 text-sm text-accent-amber md:px-8">
      <MicOff size={16} className="mt-0.5 shrink-0" />
      <p className="flex-1">
        Microphone access is blocked, so speaking and pronunciation features won&apos;t work. You can enable it in your
        browser&apos;s site settings for this page.
      </p>
      <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 rounded-lg p-0.5 hover:bg-accent-amber/15">
        <X size={14} />
      </button>
    </div>
  )
}
