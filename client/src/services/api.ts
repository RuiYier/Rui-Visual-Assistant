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
  } catch {
    return [
      { id: '冰糖', name: '冰糖', description: '中文女性' },
      { id: '茉莉', name: '茉莉', description: '中文女性' },
      { id: '苏打', name: '苏打', description: '中文男性' },
      { id: '白桦', name: '白桦', description: '中文男性' },
    ];
  }
}

export async function clearTTSCache(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/tts/clear-cache`, {
      method: 'POST',
    });
    return response.ok;
  } catch {
    return false;
  }
}
