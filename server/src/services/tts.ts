import { callMimoAPI } from './mimo.js';
import { TTSConfig } from '../types/index.js';

// TTS 缓存
const ttsCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 100;

// 默认配置
const defaultConfig: TTSConfig = {
  model: 'mimo-v2.5-tts',
  voice: 'alloy',
  speed: 1.0,
  format: 'mp3',
};

let currentConfig: TTSConfig = { ...defaultConfig };

export async function synthesizeSpeech(text: string): Promise<Buffer | null> {
  try {
    // 检查缓存
    const cacheKey = `${currentConfig.voice}:${text}`;
    if (ttsCache.has(cacheKey)) {
      console.log('TTS cache hit');
      return ttsCache.get(cacheKey)!;
    }

    // 调用 TTS API
    const response = await callMimoAPI('/audio/speech', {
      model: currentConfig.model,
      input: text,
      voice: currentConfig.voice,
      speed: currentConfig.speed,
      response_format: currentConfig.format,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 更新缓存
    if (ttsCache.size >= MAX_CACHE_SIZE) {
      // 删除最旧的缓存
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) {
        ttsCache.delete(firstKey);
      }
    }
    ttsCache.set(cacheKey, buffer);

    return buffer;
  } catch (error) {
    console.error('TTS processing error:', error);
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
