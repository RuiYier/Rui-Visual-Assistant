import { WebSocket } from 'ws';
import { ClientMessage, ServerMessage } from '../types/index.js';
import { processAudio } from '../services/asr.js';
import { processVision } from '../services/vision.js';
import { synthesizeSpeech, setTTSConfig } from '../services/tts.js';

let conversationHistory: Array<{ role: 'user' | 'assistant'; content: any }> = [];
const MAX_CONTEXT_TURNS = 5;

let clientConfig = {
  voice: '冰糖',
  samplingRate: 1,
};

const HEARTBEAT_INTERVAL = 30000;

export function handleWebSocket(ws: WebSocket) {
  let isAlive = true;
  let heartbeatTimer: NodeJS.Timeout;

  conversationHistory = [];

  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      if (!isAlive) {
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

  sendJSON(ws, {
    type: 'response',
    data: '你好！我是AI视觉对话助手，请打开摄像头和麦克风开始对话。',
    isFinal: true,
  });

  ws.on('message', async (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      await handleMessage(ws, message);
    } catch {
      sendJSON(ws, { type: 'error', data: '处理消息时出错' });
    }
  });

  ws.on('close', () => {
    clearInterval(heartbeatTimer);
  });

  ws.on('error', () => {
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
      globalThis.lastVideoFrame = message.data;
      break;
    case 'screenshot':
      await handleScreenshot(ws, message.data);
      break;
    case 'config':
      handleConfig(message.data);
      break;
  }
}

async function handleAudioChunk(ws: WebSocket, audioBase64: string, mimeType?: string) {
  try {
    sendJSON(ws, { type: 'transcript', data: '正在识别...', isFinal: false });

    const transcript = await processAudio(audioBase64, mimeType);

    if (!transcript || transcript.trim().length === 0) {
      return;
    }

    sendJSON(ws, { type: 'transcript', data: transcript, isFinal: true });

    const videoFrame = globalThis.lastVideoFrame;

    sendJSON(ws, { type: 'response', data: '正在思考...', isFinal: false });

    const response = await processVision(transcript, videoFrame, conversationHistory);

    conversationHistory.push({ role: 'user', content: transcript });
    conversationHistory.push({ role: 'assistant', content: response });

    if (conversationHistory.length > MAX_CONTEXT_TURNS * 2) {
      conversationHistory = conversationHistory.slice(-MAX_CONTEXT_TURNS * 2);
    }

    sendJSON(ws, { type: 'response', data: response, isFinal: true });

    const audioBuffer = await synthesizeSpeech(response);
    if (audioBuffer) {
      sendJSON(ws, {
        type: 'audio',
        data: audioBuffer.toString('base64'),
      });
    }
  } catch (error) {
    console.error('Audio processing error:', error);
    sendJSON(ws, { type: 'error', data: '处理音频时出错' });
  }
}

async function handleScreenshot(ws: WebSocket, imageBase64: string) {
  try {
    sendJSON(ws, { type: 'response', data: '正在分析截图...', isFinal: false });

    const response = await processVision('请详细描述这张图片中的内容', imageBase64, []);

    sendJSON(ws, { type: 'response', data: response, isFinal: true });

    const audioBuffer = await synthesizeSpeech(response);
    if (audioBuffer) {
      sendJSON(ws, {
        type: 'audio',
        data: audioBuffer.toString('base64'),
      });
    }
  } catch {
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
    }

    if (config.samplingRate) {
      clientConfig.samplingRate = config.samplingRate;
    }
  } catch {
    // ignore
  }
}

declare global {
  var lastVideoFrame: string | undefined;
}
