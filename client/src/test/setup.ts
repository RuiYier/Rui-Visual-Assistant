import '@testing-library/jest-dom'

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock MediaStream
class MockMediaStream {
  getTracks() {
    return [{ stop: vi.fn() }]
  }
  getVideoTracks() {
    return [{ stop: vi.fn() }]
  }
  getAudioTracks() {
    return [{ stop: vi.fn() }]
  }
}

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream()),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
})

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'mock-url')
URL.revokeObjectURL = vi.fn()

// Mock Audio
class MockAudio {
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
}

window.Audio = MockAudio as any

// Mock MediaRecorder
class MockMediaStreamRecorder {
  start = vi.fn()
  stop = vi.fn()
  pause = vi.fn()
  resume = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
}

window.MediaRecorder = MockMediaStreamRecorder as any
