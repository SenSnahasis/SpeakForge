// Thin client for the /api/ai-chat serverless proxy. Every caller must treat
// a null return as "AI unavailable" and fall back to the existing rule-based
// behavior — the app must keep working without a configured API key.

export async function askAI(messages, { signal } = {}) {
  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.reply?.trim() || null
  } catch {
    return null
  }
}
