import { Voice } from '../types';

const API_BASE_URL = '/api';

export async function fetchVoices(): Promise<Voice[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/voices`);
    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }
    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    // 返回默认音色列表
    return [
      { id: 'alloy', name: 'Alloy', description: '中性、平衡' },
      { id: 'echo', name: 'Echo', description: '男性、沉稳' },
      { id: 'fable', name: 'Fable', description: '男性、温暖' },
      { id: 'onyx', name: 'Onyx', description: '男性、深沉' },
      { id: 'nova', name: 'Nova', description: '女性、活泼' },
      { id: 'shimmer', name: 'Shimmer', description: '女性、柔和' },
    ];
  }
}

export async function clearTTSCache(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/tts/clear-cache`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error clearing TTS cache:', error);
    return false;
  }
}
