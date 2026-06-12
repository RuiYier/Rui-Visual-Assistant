// WebSocket 消息类型
export interface ClientMessage {
  type: 'video_frame' | 'audio_chunk' | 'screenshot' | 'config';
  data: string;  // Base64 编码 或 JSON 配置
  timestamp: number;
}

export interface ServerMessage {
  type: 'transcript' | 'response' | 'audio' | 'error';
  data: string;
  isFinal?: boolean;
}

// 对话上下文
export interface ConversationContext {
  messages: ContextMessage[];
  maxTurns: number;
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

// ASR 结果
export interface ASRResult {
  text: string;
  confidence: number;
  language?: string;
}

// Vision 结果
export interface VisionResult {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

// TTS 配置
export interface TTSConfig {
  model: string;
  voice: string;
  speed?: number;
  format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
}

// Mimo API 配置
export interface MimoConfig {
  apiKey: string;
  baseUrl: string;
}
