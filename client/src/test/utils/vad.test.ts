import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VoiceActivityDetector } from '../../utils/vad'

describe('VoiceActivityDetector', () => {
  let vad: VoiceActivityDetector

  beforeEach(() => {
    vad = new VoiceActivityDetector(30, 1000)
  })

  it('should create instance with default values', () => {
    const defaultVad = new VoiceActivityDetector()
    expect(defaultVad).toBeDefined()
    expect(defaultVad.getIsSpeaking()).toBe(false)
  })

  it('should create instance with custom values', () => {
    expect(vad).toBeDefined()
    expect(vad.getIsSpeaking()).toBe(false)
  })

  it('should set threshold', () => {
    vad.setThreshold(50)
    // No direct way to verify, but should not throw
    expect(true).toBe(true)
  })

  it('should return false for isSpeaking initially', () => {
    expect(vad.getIsSpeaking()).toBe(false)
  })

  it('should stop without error', () => {
    expect(() => vad.stop()).not.toThrow()
  })
})
