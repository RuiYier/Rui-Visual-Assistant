import { describe, it, expect, vi } from 'vitest'
import { captureVideoFrame, base64ToBlob, imageToBase64 } from '../../utils/image'

describe('Image Utils', () => {
  describe('base64ToBlob', () => {
    it('should convert base64 to blob', () => {
      const base64 = 'SGVsbG8gV29ybGQ=' // "Hello World" in base64
      const blob = base64ToBlob(base64, 'text/plain')
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('text/plain')
    })

    it('should create blob with correct size', () => {
      const base64 = 'SGVsbG8=' // "Hello" in base64
      const blob = base64ToBlob(base64, 'text/plain')
      expect(blob.size).toBe(5) // "Hello" is 5 bytes
    })
  })

  describe('captureVideoFrame', () => {
    it('should throw error if canvas context is not available', () => {
      const video = document.createElement('video')
      // Mock video dimensions
      Object.defineProperty(video, 'videoWidth', { value: 640 })
      Object.defineProperty(video, 'videoHeight', { value: 480 })

      // This will fail because we can't actually draw on canvas in test environment
      // In real usage, this would work fine
      expect(() => captureVideoFrame(video)).toThrow()
    })
  })

  describe('imageToBase64', () => {
    it('should convert file to base64', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const base64 = await imageToBase64(file)
      expect(base64).toBeDefined()
      expect(typeof base64).toBe('string')
    })
  })
})
