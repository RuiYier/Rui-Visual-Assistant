import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSmartSampling } from '../../hooks/useSmartSampling'

describe('useSmartSampling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with idle state', () => {
    const { result } = renderHook(() =>
      useSmartSampling({
        activeRate: 1,
        idleRate: 0.2,
        transitionDelay: 3000,
      })
    )

    expect(result.current.isActive).toBe(false)
    expect(result.current.currentRate).toBe(0.2)
  })

  it('should switch to active state when setActive is called', () => {
    const { result } = renderHook(() =>
      useSmartSampling({
        activeRate: 1,
        idleRate: 0.2,
        transitionDelay: 3000,
      })
    )

    act(() => {
      result.current.setActive()
    })

    expect(result.current.isActive).toBe(true)
    expect(result.current.currentRate).toBe(1)
  })

  it('should switch back to idle after transition delay', () => {
    const { result } = renderHook(() =>
      useSmartSampling({
        activeRate: 1,
        idleRate: 0.2,
        transitionDelay: 3000,
      })
    )

    act(() => {
      result.current.setActive()
    })

    expect(result.current.isActive).toBe(true)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.isActive).toBe(false)
    expect(result.current.currentRate).toBe(0.2)
  })

  it('should reset timer when setActive is called again', () => {
    const { result } = renderHook(() =>
      useSmartSampling({
        activeRate: 1,
        idleRate: 0.2,
        transitionDelay: 3000,
      })
    )

    act(() => {
      result.current.setActive()
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    act(() => {
      result.current.setActive()
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Should still be active because timer was reset
    expect(result.current.isActive).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Now should be idle
    expect(result.current.isActive).toBe(false)
  })

  it('should switch to idle when setIdle is called', () => {
    const { result } = renderHook(() =>
      useSmartSampling({
        activeRate: 1,
        idleRate: 0.2,
        transitionDelay: 3000,
      })
    )

    act(() => {
      result.current.setActive()
    })

    expect(result.current.isActive).toBe(true)

    act(() => {
      result.current.setIdle()
    })

    expect(result.current.isActive).toBe(false)
    expect(result.current.currentRate).toBe(0.2)
  })

  it('should call startSampling and stopSampling without error', () => {
    const { result } = renderHook(() =>
      useSmartSampling({
        activeRate: 1,
        idleRate: 0.2,
        transitionDelay: 3000,
      })
    )

    const callback = vi.fn()

    expect(() => {
      result.current.startSampling(callback)
    }).not.toThrow()

    expect(() => {
      result.current.stopSampling()
    }).not.toThrow()
  })
})
