import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCamera } from '../../hooks/useCamera'

describe('useCamera', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCamera())

    expect(result.current.isStreaming).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.facingMode).toBe('user')
  })

  it('should stop camera without error', () => {
    const { result } = renderHook(() => useCamera())

    expect(() => {
      result.current.stopCamera()
    }).not.toThrow()
  })

  it('should switch camera facing mode', async () => {
    const { result } = renderHook(() => useCamera())

    expect(result.current.facingMode).toBe('user')

    // switchCamera will try to stop and start camera
    // In test environment, startCamera might fail due to missing videoRef
    // but facingMode should still update
    await act(async () => {
      await result.current.switchCamera()
    })

    // The facingMode should have changed even if startCamera failed
    // Note: In jsdom, videoRef.current is null, so startCamera won't fully work
    // But the function should not throw
    expect(result.current.facingMode).toBe('environment')
  })

  it('should handle camera error', async () => {
    // Mock getUserMedia to reject
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(
      new Error('Permission denied')
    )

    const { result } = renderHook(() => useCamera())

    await act(async () => {
      await result.current.startCamera()
    })

    expect(result.current.error).toBe('Permission denied')
    expect(result.current.isStreaming).toBe(false)
  })

  it('should return null for captureFrame when not streaming', () => {
    const { result } = renderHook(() => useCamera())

    const frame = result.current.captureFrame()
    expect(frame).toBeNull()
  })

  it('should return videoRef', () => {
    const { result } = renderHook(() => useCamera())

    expect(result.current.videoRef).toBeDefined()
    expect(result.current.videoRef.current).toBeNull()
  })
})
