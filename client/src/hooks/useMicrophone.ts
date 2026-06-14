import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioConfig } from '../types';

const defaultConfig: AudioConfig = {
  sampleRate: 16000,
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
};

// Float32Array 转 WAV Base64
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
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

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

// 计算音频音量 (RMS)
function calculateVolume(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length) * 1000;
}

export function useMicrophone(config: AudioConfig = defaultConfig) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const onAudioDataRef = useRef<((data: string) => void) | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const maxDurationTimerRef = useRef<number | null>(null);

  const sendAudioData = useCallback(() => {
    if (chunksRef.current.length > 0 && onAudioDataRef.current) {
      const chunks = chunksRef.current.splice(0);
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const mergedData = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        mergedData.set(chunk, offset);
        offset += chunk.length;
      }

      const duration = mergedData.length / config.sampleRate;
      const volume = calculateVolume(mergedData);

      // 过滤太短或太安静的音频
      if (duration > 0.3 && volume > 3) {
        const base64 = float32ArrayToWavBase64(mergedData, config.sampleRate);
        onAudioDataRef.current(base64);
      }
    }
    isSpeakingRef.current = false;
  }, [config]);

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

      const audioContext = new AudioContext({
        sampleRate: config.sampleRate,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const data = new Float32Array(inputData);
        const volume = calculateVolume(data);

        // 检测到声音
        if (volume > 15) {
          chunksRef.current.push(data);

          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;

            // 设置最大录制时长（8秒后强制发送）
            if (maxDurationTimerRef.current) {
              clearTimeout(maxDurationTimerRef.current);
            }
            maxDurationTimerRef.current = window.setTimeout(() => {
              if (isSpeakingRef.current) {
                sendAudioData();
              }
            }, 8000);
          }

          // 重置静音计时器
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = window.setTimeout(() => {
            if (isSpeakingRef.current) {
              sendAudioData();
            }
          }, 600); // 600ms 静音后发送
        } else if (isSpeakingRef.current) {
          // 静音但还在说话状态，继续收集（包含停顿）
          chunksRef.current.push(data);

          // 重置静音计时器
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = window.setTimeout(() => {
            if (isSpeakingRef.current) {
              sendAudioData();
            }
          }, 600);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法访问麦克风');
    }
  }, [config, sendAudioData]);

  const stopRecording = useCallback(() => {
    // 清除所有计时器
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // 发送剩余音频
    if (isSpeakingRef.current) {
      sendAudioData();
    }
    chunksRef.current = [];
    isSpeakingRef.current = false;

    onAudioDataRef.current = null;
    setIsRecording(false);
  }, [sendAudioData]);

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
