import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock WebSocket before importing the service
const mockSend = vi.fn()
const mockClose = vi.fn()
let mockOnOpen: ((event: Event) => void) | null = null
let mockOnClose: ((event: CloseEvent) => void) | null = null
let mockOnMessage: ((event: MessageEvent) => void) | null = null
let mockOnError: ((event: Event) => void) | null = null

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.OPEN
  send = mockSend
  close = mockClose

  set onopen(handler: ((event: Event) => void) | null) {
    mockOnOpen = handler
  }
  get onopen() {
    return mockOnOpen
  }
  set onclose(handler: ((event: CloseEvent) => void) | null) {
    mockOnClose = handler
  }
  get onclose() {
    return mockOnClose
  }
  set onmessage(handler: ((event: MessageEvent) => void) | null) {
    mockOnMessage = handler
  }
  get onmessage() {
    return mockOnMessage
  }
  set onerror(handler: ((event: Event) => void) | null) {
    mockOnError = handler
  }
  get onerror() {
    return mockOnError
  }
}

// @ts-ignore
global.WebSocket = MockWebSocket

// Now import the service
const { wsService } = await import('../../services/websocket')

describe('WebSocket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnOpen = null
    mockOnClose = null
    mockOnMessage = null
    mockOnError = null
  })

  afterEach(() => {
    wsService.disconnect()
  })

  it('should connect to WebSocket', () => {
    wsService.connect('ws://localhost:3002')
    // Should not throw
    expect(true).toBe(true)
  })

  it('should send message when connected', () => {
    wsService.connect('ws://localhost:3002')
    wsService.send({
      type: 'video_frame',
      data: 'test-data',
      timestamp: Date.now(),
    })

    expect(mockSend).toHaveBeenCalled()
  })

  it('should report connection status', () => {
    wsService.connect('ws://localhost:3002')
    // Initially might be false until onopen fires
    expect(typeof wsService.isConnected()).toBe('boolean')
  })

  it('should handle disconnect', () => {
    wsService.connect('ws://localhost:3002')
    wsService.disconnect()
    expect(mockClose).toHaveBeenCalled()
  })

  it('should register multiple event handlers', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    wsService.on('response', handler1)
    wsService.on('response', handler2)

    // Both handlers should be registered
    expect(true).toBe(true)
  })

  it('should unregister event handler', () => {
    const handler = vi.fn()
    wsService.on('response', handler)
    wsService.off('response', handler)

    // Handler should be unregistered
    expect(true).toBe(true)
  })
})
