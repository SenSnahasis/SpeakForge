import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeechRecognition } from './useSpeechRecognition'

let lastInstance = null

class FakeSpeechRecognition {
  constructor() {
    lastInstance = this
    this.onresult = null
    this.onend = null
    this.onerror = null
  }
  start() {}
  stop() {}
}

function finalResult(text) {
  return { isFinal: true, 0: { transcript: text }, length: 1 }
}

function interimResult(text) {
  return { isFinal: false, 0: { transcript: text }, length: 1 }
}

beforeEach(() => {
  window.SpeechRecognition = FakeSpeechRecognition
  lastInstance = null
})

afterEach(() => {
  delete window.SpeechRecognition
  vi.useRealTimers()
})

describe('useSpeechRecognition', () => {
  it('does not duplicate a final result that gets redelivered at the same index without resultIndex advancing', () => {
    const { result } = renderHook(() => useSpeechRecognition({ continuous: true }))
    act(() => result.current.start())

    // Simulates the known Android Chrome bug: resultIndex stays stuck (or is
    // unreliable) so the same finalized entry at index 0 is redelivered
    // across multiple onresult events instead of advancing to new content.
    act(() => {
      lastInstance.onresult({ resultIndex: 0, results: [interimResult('like')] })
    })
    act(() => {
      lastInstance.onresult({ resultIndex: 0, results: [finalResult('like what')] })
    })
    act(() => {
      // Buggy redelivery of the same already-final index 0.
      lastInstance.onresult({ resultIndex: 0, results: [finalResult('like what')] })
    })
    act(() => {
      // Now genuinely new content arrives at index 1.
      lastInstance.onresult({ resultIndex: 1, results: [finalResult('like what'), finalResult('kind of engine')] })
    })

    expect(result.current.transcript).toBe('like what kind of engine')
  })

  it('resets the per-session commit watermark (not the accumulated transcript) when continuous mode auto-restarts', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSpeechRecognition({ continuous: true }))
    act(() => result.current.start())

    act(() => {
      lastInstance.onresult({ resultIndex: 0, results: [finalResult('hello there')] })
    })
    expect(result.current.transcript).toBe('hello there')

    // The browser ends the session early (common on Android even with
    // continuous: true) and the hook auto-restarts it after a short delay.
    act(() => {
      lastInstance.onend()
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // The new session's results array starts again at index 0, but that
    // must be treated as genuinely new content, not a duplicate of the
    // previous session's already-committed text.
    act(() => {
      lastInstance.onresult({ resultIndex: 0, results: [finalResult('how are you')] })
    })

    expect(result.current.transcript).toBe('hello there how are you')
  })

  it('clears the commit watermark on start() and reset() so a fresh session starts clean', () => {
    const { result } = renderHook(() => useSpeechRecognition({ continuous: true }))
    act(() => result.current.start())
    act(() => {
      lastInstance.onresult({ resultIndex: 0, results: [finalResult('first attempt')] })
    })
    expect(result.current.transcript).toBe('first attempt')

    act(() => result.current.reset())
    expect(result.current.transcript).toBe('')

    act(() => {
      lastInstance.onresult({ resultIndex: 0, results: [finalResult('second attempt')] })
    })
    expect(result.current.transcript).toBe('second attempt')
  })
})
