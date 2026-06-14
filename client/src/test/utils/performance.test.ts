import { describe, it, expect, vi, beforeEach } from 'vitest'
import { performanceMonitor, measureTime, measureTimeAsync } from '../../utils/performance'

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.reset()
  })

  it('should return initial metrics', () => {
    const metrics = performanceMonitor.getMetrics()
    expect(metrics.fps).toBe(0)
    expect(metrics.latency).toBe(0)
    expect(metrics.apiCalls).toBe(0)
    expect(metrics.cacheHits).toBe(0)
    expect(metrics.errors).toBe(0)
  })

  it('should record API call', () => {
    performanceMonitor.recordApiCall()
    const metrics = performanceMonitor.getMetrics()
    expect(metrics.apiCalls).toBe(1)
  })

  it('should record cache hit', () => {
    performanceMonitor.recordCacheHit()
    const metrics = performanceMonitor.getMetrics()
    expect(metrics.cacheHits).toBe(1)
  })

  it('should record error', () => {
    performanceMonitor.recordError()
    const metrics = performanceMonitor.getMetrics()
    expect(metrics.errors).toBe(1)
  })

  it('should record latency', () => {
    performanceMonitor.recordLatency(100)
    performanceMonitor.recordLatency(200)
    const metrics = performanceMonitor.getMetrics()
    expect(metrics.latency).toBe(150) // (100 + 200) / 2
  })

  it('should reset metrics', () => {
    performanceMonitor.recordApiCall()
    performanceMonitor.recordCacheHit()
    performanceMonitor.recordError()
    performanceMonitor.reset()

    const metrics = performanceMonitor.getMetrics()
    expect(metrics.apiCalls).toBe(0)
    expect(metrics.cacheHits).toBe(0)
    expect(metrics.errors).toBe(0)
  })
})

describe('measureTime', () => {
  it('should measure synchronous function execution time', () => {
    const fn = () => {
      let sum = 0
      for (let i = 0; i < 1000; i++) {
        sum += i
      }
      return sum
    }

    const { result, time } = measureTime(fn)
    expect(result).toBe(499500)
    expect(time).toBeGreaterThanOrEqual(0)
  })
})

describe('measureTimeAsync', () => {
  it('should measure async function execution time', async () => {
    const fn = async () => {
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(42), 10)
      })
    }

    const { result, time } = await measureTimeAsync(fn)
    expect(result).toBe(42)
    expect(time).toBeGreaterThanOrEqual(10)
  })
})
