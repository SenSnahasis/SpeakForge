import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMicPermission } from './useMicPermission'

const originalMediaDevices = navigator.mediaDevices
const originalPermissions = navigator.permissions

function mockGetUserMedia(impl) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn(impl) },
    configurable: true,
  })
}

function mockPermissionsQuery(state) {
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue({ state }) },
    configurable: true,
  })
}

afterEach(() => {
  Object.defineProperty(navigator, 'mediaDevices', { value: originalMediaDevices, configurable: true })
  Object.defineProperty(navigator, 'permissions', { value: originalPermissions, configurable: true })
  vi.restoreAllMocks()
})

describe('useMicPermission', () => {
  it('reports "granted" without prompting when the Permissions API already says granted', async () => {
    mockPermissionsQuery('granted')
    const getUserMedia = vi.fn()
    mockGetUserMedia(getUserMedia)

    const { result } = renderHook(() => useMicPermission())
    await waitFor(() => expect(result.current).toBe('granted'))
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('reports "denied" without prompting when the Permissions API already says denied', async () => {
    mockPermissionsQuery('denied')
    const getUserMedia = vi.fn()
    mockGetUserMedia(getUserMedia)

    const { result } = renderHook(() => useMicPermission())
    await waitFor(() => expect(result.current).toBe('denied'))
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('proactively requests the microphone when permission is undecided, and stops the stream once granted', async () => {
    mockPermissionsQuery('prompt')
    const stopTrack = vi.fn()
    const fakeStream = { getTracks: () => [{ stop: stopTrack }] }
    const getUserMedia = vi.fn().mockResolvedValue(fakeStream)
    mockGetUserMedia(getUserMedia)

    const { result } = renderHook(() => useMicPermission())
    await waitFor(() => expect(result.current).toBe('granted'))
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(stopTrack).toHaveBeenCalled()
  })

  it('reports "denied" if the proactive request is rejected', async () => {
    mockPermissionsQuery('prompt')
    mockGetUserMedia(() => Promise.reject(new Error('Permission denied')))

    const { result } = renderHook(() => useMicPermission())
    await waitFor(() => expect(result.current).toBe('denied'))
  })

  it('still requests directly when the Permissions API cannot query "microphone" (e.g. Safari)', async () => {
    Object.defineProperty(navigator, 'permissions', {
      value: { query: vi.fn().mockRejectedValue(new Error('not supported')) },
      configurable: true,
    })
    const fakeStream = { getTracks: () => [{ stop: vi.fn() }] }
    mockGetUserMedia(vi.fn().mockResolvedValue(fakeStream))

    const { result } = renderHook(() => useMicPermission())
    await waitFor(() => expect(result.current).toBe('granted'))
  })

  it('reports "unsupported" when the browser has no getUserMedia at all', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true })

    const { result } = renderHook(() => useMicPermission())
    await waitFor(() => expect(result.current).toBe('unsupported'))
  })
})
