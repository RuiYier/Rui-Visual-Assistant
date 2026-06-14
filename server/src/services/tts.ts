import { callMimoAPI } from './mimo.js';
import { TTSConfig } from '../types/index.js';

const ttsCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 100;

const defaultConfig: TTSConfig = {
  model: 'mimo-v2.5-tts',
  voice: '冰糖',
  speed: 1.0,
  format: 'wav',
};

let currentConfig: TTSConfig = { ...defaultConfig };

export async function synthesizeSpeech(text: string): Promise<Buffer | null> {
  try {
    const cacheKey = `${currentConfig.voice}:${text}`;
    if (ttsCache.has(cacheKey)) {
      return ttsCache.get(cacheKey)!;
    }

    const response = await callMimoAPI('/chat/completions', {
      model: currentConfig.model,
      messages: [
        { role: 'user', content: '' },
        { role: 'assistant', content: text },
      ],
      audio: {
        format: currentConfig.format,
        voice: currentConfig.voice,
      },
    });

    const result = await response.json();

    const audioData = result.choices?.[0]?.message?.audio?.data;
    if (!audioData) {
      return null;
    }

    const audioBuffer = Buffer.from(audioData, 'base64');

    if (ttsCache.size >= MAX_CACHE_SIZE) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) {
        ttsCache.delete(firstKey);
      }
    }
    ttsCache.set(cacheKey, audioBuffer);

    return audioBuffer;
  } catch (error) {
    console.error('TTS error:', error);
    return null;
  }
}

export function setTTSConfig(config: Partial<TTSConfig>) {
  currentConfig = { ...currentConfig, ...config };
}

export function getTTSConfig(): TTSConfig {
  return { ...currentConfig };
}

export function clearTTSCache() {
  ttsCache.clear();
}
