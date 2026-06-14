import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchVoices, clearTTSCache } from '../../services/api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchVoices', () => {
    it('should fetch voices successfully', async () => {
      const mockVoices = [
        { id: 'alloy', name: 'Alloy', description: '中性、平衡' },
        { id: 'echo', name: 'Echo', description: '男性、沉稳' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ voices: mockVoices }),
      })

      const voices = await fetchVoices()
      expect(voices).toEqual(mockVoices)
      expect(mockFetch).toHaveBeenCalledWith('/api/voices')
    })

    it('should return default voices on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const voices = await fetchVoices()
      expect(voices).toHaveLength(6)
      expect(voices[0].id).toBe('alloy')
    })

    it('should return default voices on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const voices = await fetchVoices()
      expect(voices).toHaveLength(6)
    })
  })

  describe('clearTTSCache', () => {
    it('should clear cache successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      })

      const result = await clearTTSCache()
      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/tts/clear-cache', { method: 'POST' })
    })

    it('should return false on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await clearTTSCache()
      expect(result).toBe(false)
    })
  })
})
