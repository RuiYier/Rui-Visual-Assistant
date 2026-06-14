import { describe, it, expect } from 'vitest'
import { blobToBase64, base64ToArrayBuffer, base64ToBlob } from '../../utils/audio'

describe('Audio Utils', () => {
  describe('blobToBase64', () => {
    it('should convert blob to base64', async () => {
      const blob = new Blob(['Hello'], { type: 'text/plain' })
      const base64 = await blobToBase64(blob)
      expect(base64).toBeDefined()
      expect(typeof base64).toBe('string')
      // "Hello" in base64 is "SGVsbG8="
      expect(base64).toBe('SGVsbG8=')
    })
  })

  describe('base64ToArrayBuffer', () => {
    it('should convert base64 to ArrayBuffer', () => {
      const base64 = 'SGVsbG8=' // "Hello" in base64
      const buffer = base64ToArrayBuffer(base64)
      expect(buffer).toBeInstanceOf(ArrayBuffer)
      expect(buffer.byteLength).toBe(5) // "Hello" is 5 bytes
    })

    it('should return correct data', () => {
      const base64 = 'SGVsbG8=' // "Hello" in base64
      const buffer = base64ToArrayBuffer(base64)
      const view = new Uint8Array(buffer)
      // H=72, e=101, l=108, l=108, o=111
      expect(view[0]).toBe(72)
      expect(view[1]).toBe(101)
      expect(view[2]).toBe(108)
      expect(view[3]).toBe(108)
      expect(view[4]).toBe(111)
    })
  })

  describe('base64ToBlob', () => {
    it('should convert base64 to blob', () => {
      const base64 = 'SGVsbG8=' // "Hello" in base64
      const blob = base64ToBlob(base64, 'text/plain')
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('text/plain')
      expect(blob.size).toBe(5)
    })
  })
})
