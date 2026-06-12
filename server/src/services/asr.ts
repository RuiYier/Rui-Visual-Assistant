import { callMimoAPI } from './mimo.js';
import { ASRResult } from '../types/index.js';

export async function processAudio(audioBase64: string): Promise<string> {
  try {
    // 将 Base64 转换为 Buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // 创建 FormData
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'mimo-v2.5-asr');
    formData.append('language', 'zh');

    // 调用 ASR API
    const response = await callMimoAPI('/audio/transcriptions', formData, true);
    const result = await response.json();

    return result.text || '';
  } catch (error) {
    console.error('ASR processing error:', error);
    throw new Error('语音识别失败');
  }
}

export async function processAudioStream(
  audioChunks: string[]
): Promise<string> {
  // 合并多个音频块
  const buffers = audioChunks.map((chunk) => Buffer.from(chunk, 'base64'));
  const combinedBuffer = Buffer.concat(buffers);

  return processAudio(combinedBuffer.toString('base64'));
}
