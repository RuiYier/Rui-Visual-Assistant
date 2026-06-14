import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioConfig } from '../types';

const defaultConfig: AudioConfig = {
  sampleRate: 16000,
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
};

// 将 Float32Array 转换为 WAV 格式的 Base64
function float32ArrayToWavBase64(samples: Float32Array, sampleRate: number): string {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = samples.length * blockAlign;
  const bufferLength = 44 + dataLength;
  const buffer = new ArrayBuffer(bufferLength);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write audio data
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  // Convert to Base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function useMicrophone(config: AudioConfig = defaultConfig) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const onAudioDataRef = useRef<((data: string) => void) | null>(null);
  const sendIntervalRef = useRef<number | null>(null);

  const startRecording = useCallback(async (onAudioData?: (data: string) => void) => {
    try {
      setError(null);
      onAudioDataRef.current = onAudioData || null;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.sampleRate,
          channelCount: config.channelCount,
          echoCancellation: config.echoCancellation,
          noiseSuppression: config.noiseSuppression,
        },
      });

      streamRef.current = stream;

      // 创建 AudioContext
      const audioContext = new AudioContext({
        sampleRate: config.sampleRate,
      });
      audioContextRef.current = audioContext;

      // 创建音频源
      const source = audioContext.createMediaStreamSource(stream);

      // 创建 ScriptProcessor 节点
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // 处理音频数据
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const data = new Float32Array(inputData);
        chunksRef.current.push(data);
      };

      // 连接节点
      source.connect(processor);
      processor.connect(audioContext.destination);

      // 定时发送音频数据（每 3 秒）
      sendIntervalRef.current = window.setInterval(() => {
        if (chunksRef.current.length > 0 && onAudioDataRef.current) {
          // 取出并清空音频块
          const chunks = chunksRef.current.splice(0);

          // 合并所有音频块
          const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
          const mergedData = new Float32Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            mergedData.set(chunk, offset);
            offset += chunk.length;
          }

          // 计算音频时长（秒）
          const duration = mergedData.length / config.sampleRate;

          // 只发送超过 0.5 秒的音频（过滤底噪）
          if (duration > 0.5) {
            // 检查音量（过滤静音）
            let sum = 0;
            for (let i = 0; i < mergedData.length; i++) {
              sum += mergedData[i] * mergedData[i];
            }
            const rms = Math.sqrt(sum / mergedData.length);
            const volume = rms * 1000;

            // 只在音量足够时发送
            if (volume > 5) {
              const base64 = float32ArrayToWavBase64(mergedData, config.sampleRate);
              console.log('Sending WAV audio, duration:', duration.toFixed(2), 's, size:', (base64.length / 1024).toFixed(2), 'KB');
              onAudioDataRef.current(base64);
            } else {
              console.log('Skipping silent audio, volume:', volume.toFixed(2));
            }
          } else {
            console.log('Skipping short audio, duration:', duration.toFixed(2), 's');
          }
        }
      }, 3000);

      setIsRecording(true);
      console.log('Recording started (WAV format)');
    } catch (err) {
      const message = err instanceof Error ? err.message : '无法访问麦克风';
      setError(message);
      console.error('Microphone error:', err);
    }
  }, [config]);

  const stopRecording = useCallback(() => {
    // 停止定时发送
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }

    // 断开音频节点
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // 关闭 AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // 停止媒体流
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // 发送剩余的音频数据
    if (chunksRef.current.length > 0 && onAudioDataRef.current) {
      const totalLength = chunksRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
      const mergedData = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunksRef.current) {
        mergedData.set(chunk, offset);
        offset += chunk.length;
      }
      chunksRef.current = [];

      const base64 = float32ArrayToWavBase64(mergedData, config.sampleRate);
      console.log('Sending final WAV audio, size:', (base64.length / 1024).toFixed(2), 'KB');
      onAudioDataRef.current(base64);
    } else {
      chunksRef.current = [];
    }

    onAudioDataRef.current = null;
    setIsRecording(false);
    console.log('Recording stopped');
  }, [config]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
    stream: streamRef.current,
  };
}
