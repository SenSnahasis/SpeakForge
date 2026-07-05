// Vercel serverless function — proxies chat requests to NVIDIA's API so the
// API key stays server-side and is never exposed to the browser.

const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions'
const MODEL = 'meta/llama-3.1-8b-instruct'
const MAX_MESSAGES = 12
const MAX_TOTAL_CHARS = 8000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'AI is not configured on this deployment.' })
    return
  }

  const { messages } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  // Basic abuse guard: cap conversation size and total length sent upstream.
  const trimmed = messages.slice(-MAX_MESSAGES)
  const totalChars = trimmed.reduce((sum, m) => sum + (m.content?.length || 0), 0)
  if (totalChars > MAX_TOTAL_CHARS) {
    res.status(400).json({ error: 'Message too long.' })
    return
  }

  try {
    const upstream = await fetch(NVIDIA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: trimmed,
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      res.status(502).json({ error: 'AI service error', detail: text.slice(0, 200) })
      return
    }

    const data = await upstream.json()
    const reply = (data.choices?.[0]?.message?.content || '').trim()
    res.status(200).json({ reply })
  } catch (err) {
    res.status(502).json({ error: 'AI request failed', detail: String(err).slice(0, 200) })
  }
}
