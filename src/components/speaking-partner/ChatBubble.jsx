import { Volume2, AlertCircle, Bot, User } from 'lucide-react'

export default function ChatBubble({ role, text, issues, fillers, onSpeak }) {
  const isAI = role === 'ai'
  return (
    <div className={`flex gap-2.5 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isAI ? 'bg-brand-600/20 text-brand-300' : 'bg-accent-teal/20 text-accent-teal'}`}>
        {isAI ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className={`max-w-[80%] space-y-1.5 ${isAI ? '' : 'items-end text-right'}`}>
        <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${isAI ? 'rounded-tl-sm bg-line/[0.05] text-slate-200' : 'rounded-tr-sm bg-brand-600/20 text-slate-100'}`}>
          {text}
          {isAI && onSpeak && (
            <button onClick={onSpeak} className="ml-2 inline-block align-middle text-brand-300 hover:text-brand-200">
              <Volume2 size={14} />
            </button>
          )}
        </div>
        {issues?.length > 0 && (
          <div className="space-y-1 rounded-xl bg-accent-amber/10 px-3 py-2 text-left text-xs text-accent-amber">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                <span>
                  &ldquo;{issue.original}&rdquo; → &ldquo;{issue.corrected}&rdquo;
                </span>
              </div>
            ))}
          </div>
        )}
        {fillers > 0 && <p className="text-[11px] text-accent-rose">{fillers} hesitation word{fillers === 1 ? '' : 's'} detected</p>}
      </div>
    </div>
  )
}
