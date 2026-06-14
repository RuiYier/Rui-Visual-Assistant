import { WebSocket } from 'ws';
import { ClientMessage, ServerMessage } from '../types/index.js';
import { processAudio } from '../services/asr.js';
import { processVision } from '../services/vision.js';
import { synthesizeSpeech, setTTSConfig } from '../services/tts.js';

// 对话上下文（单用户）
let conversationHistory: Array<{ role: 'user' | 'assistant'; content: any }> = [];
const MAX_CONTEXT_TURNS = 5;

// 客户端配置
let clientConfig = {
  voice: 'alloy',
  samplingRate: 1,
};

// 心跳检测
const HEARTBEAT_INTERVAL = 30000; // 30 秒

export function handleWebSocket(ws: WebSocket) {
  let isAlive = true;
  let heartbeatTimer: NodeJS.Timeout;

  // 清空对话历史
  conversationHistory = [];
  console.log('Conversation history cleared');

  // 心跳检测
  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      if (!isAlive) {
        console.log('Client heartbeat timeout, terminating...');
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, HEARTBEAT_INTERVAL);
  };

  ws.on('pong', () => {
    isAlive = true;
  });

  // 发送欢迎消息
  sendJSON(ws, {
    type: 'response',
    data: '你好！我是AI视觉对话助手，请打开摄像头和麦克风开始对话。',
    isFinal: true,
  });

  ws.on('message', async (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      await handleMessage(ws, message);
    } catch (error) {
      console.error('Error processing message:', error);
      sendJSON(ws, {
        type: 'error',
        data: '处理消息时出错，请重试',
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(heartbeatTimer);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(heartbeatTimer);
  });

  startHeartbeat();
}

async function handleMessage(ws: WebSocket, message: ClientMessage) {
  switch (message.type) {
    case 'audio_chunk':
      await handleAudioChunk(ws, message.data, message.mimeType);
      break;
    case 'video_frame':
      // 视频帧单独处理时，存储最新帧
      globalThis.lastVideoFrame = message.data;
      break;
    case 'screenshot':
      await handleScreenshot(ws, message.data);
      break;
    case 'config':
      handleConfig(message.data);
      break;
    default:
      sendJSON(ws, { type: 'error', data: '未知消息类型' });
  }
}

async function handleAudioChunk(ws: WebSocket, audioBase64: string, mimeType?: string) {
  try {
    console.log('=== handleAudioChunk Start ===');
    console.log('Audio base64 length:', audioBase64.length);
    console.log('Audio base64 prefix:', audioBase64.substring(0, 50));
    console.log('MIME type:', mimeType);

    // 1. ASR 语音识别
    sendJSON(ws, { type: 'transcript', data: '正在识别...', isFinal: false });

    const transcript = await processAudio(audioBase64, mimeType);

    console.log('ASR transcript:', transcript);

    if (!transcript || transcript.trim().length === 0) {
      console.log('Empty transcript, skipping');
      return; // 静音，不处理
    }

    sendJSON(ws, { type: 'transcript', data: transcript, isFinal: true });

    // 2. 获取最新视频帧
    const videoFrame = globalThis.lastVideoFrame;
    console.log('Video frame available:', !!videoFrame);
    console.log('Video frame length:', videoFrame ? videoFrame.length : 0);

    // 3. 调用 Vision API
    sendJSON(ws, { type: 'response', data: '正在思考...', isFinal: false });

    const response = await processVision(transcript, videoFrame, conversationHistory);

    // 4. 更新对话历史
    conversationHistory.push({ role: 'user', content: transcript });
    conversationHistory.push({ role: 'assistant', content: response });

    // 裁剪上下文
    if (conversationHistory.length > MAX_CONTEXT_TURNS * 2) {
      conversationHistory = conversationHistory.slice(-MAX_CONTEXT_TURNS * 2);
    }

    // 5. 发送文本回复
    sendJSON(ws, { type: 'response', data: response, isFinal: true });

    // 6. TTS 语音合成
    const audioBuffer = await synthesizeSpeech(response);
    if (audioBuffer) {
      sendJSON(ws, {
        type: 'audio',
        data: audioBuffer.toString('base64'),
      });
    }
  } catch (error) {
    console.error('=== handleAudioChunk Error ===');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    sendJSON(ws, { type: 'error', data: '处理音频时出错: ' + (error instanceof Error ? error.message : '未知错误') });
  }
}

async function handleScreenshot(ws: WebSocket, imageBase64: string) {
  try {
    sendJSON(ws, { type: 'response', data: '正在分析截图...', isFinal: false });

    const response = await processVision('请详细描述这张图片中的内容', imageBase64, []);

    sendJSON(ws, { type: 'response', data: response, isFinal: true });

    // TTS
    const audioBuffer = await synthesizeSpeech(response);
    if (audioBuffer) {
      sendJSON(ws, {
        type: 'audio',
        data: audioBuffer.toString('base64'),
      });
    }
  } catch (error) {
    console.error('Error handling screenshot:', error);
    sendJSON(ws, { type: 'error', data: '分析截图时出错' });
  }
}

function sendJSON(ws: WebSocket, data: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function handleConfig(configData: string) {
  try {
    const config = JSON.parse(configData);

    if (config.voice) {
      clientConfig.voice = config.voice;
      setTTSConfig({ voice: config.voice });
      console.log('TTS voice updated to:', config.voice);
    }

    if (config.samplingRate) {
      clientConfig.samplingRate = config.samplingRate;
      console.log('Sampling rate updated to:', config.samplingRate);
    }
  } catch (error) {
    console.error('Error parsing config:', error);
  }
}

// 扩展 globalThis
declare global {
  var lastVideoFrame: string | undefined;
}
