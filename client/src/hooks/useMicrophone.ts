import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioConfig } from '../types';
import { blobToBase64 } from '../utils/audio';

const defaultConfig: AudioConfig = {
  sampleRate: 16000,
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
};

export function useMicrophone(config: AudioConfig = defaultConfig) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onAudioDataRef = useRef<((data: string) => void) | null>(null);

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

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);

          // 每 2 秒发送一次音频数据
          if (chunksRef.current.length >= 2) {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            chunksRef.current = [];

            if (onAudioDataRef.current) {
              const base64 = await blobToBase64(blob);
              onAudioDataRef.current(base64);
            }
          }
        }
      };

      mediaRecorder.onstop = () => {
        // 发送剩余的音频数据
        if (chunksRef.current.length > 0 && onAudioDataRef.current) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          blobToBase64(blob).then((base64) => {
            onAudioDataRef.current?.(base64);
          });
          chunksRef.current = [];
        }
      };

      mediaRecorder.start(1000); // 每秒触发一次 ondataavailable
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '无法访问麦克风';
      setError(message);
      console.error('Microphone error:', err);
    }
  }, [config]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

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
