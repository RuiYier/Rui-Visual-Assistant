export interface ClientMessage {
  type: 'video_frame' | 'audio_chunk' | 'screenshot' | 'config';
  data: string;
  timestamp: number;
  mimeType?: string;
}

export interface ServerMessage {
  type: 'transcript' | 'response' | 'audio' | 'error';
  data: string;
  isFinal?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
}

export interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
}

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
}

export interface Voice {
  id: string;
  name: string;
  description: string;
}
