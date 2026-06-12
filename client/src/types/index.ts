// WebSocket 消息类型
export interface ClientMessage {
  type: 'video_frame' | 'audio_chunk' | 'screenshot';
  data: string;  // Base64 编码
  timestamp: number;
}

export interface ServerMessage {
  type: 'transcript' | 'response' | 'audio' | 'error';
  data: string;
  isFinal?: boolean;
}

// 对话消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;  // Base64 图片
}

// 摄像头配置
export interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
}

// 音频配置
export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
}

// 应用状态
export interface AppState {
  isCameraOn: boolean;
  isMicOn: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  messages: ChatMessage[];
  currentTranscript: string;
  selectedVoice: string;
  samplingRate: number;  // fps
}

// TTS 音色
export interface Voice {
  id: string;
  name: string;
  description: string;
}
