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

export interface ContextMessage {
  role: 'user' | 'assistant';
  content: string | ContentPart[];
}

export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface TTSConfig {
  model: string;
  voice: string;
  speed?: number;
  format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
}

export interface MimoConfig {
  apiKey: string;
  baseUrl: string;
}
