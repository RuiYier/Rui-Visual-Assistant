import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraConfig } from '../types';
import { captureVideoFrame } from '../utils/image';

const defaultConfig: CameraConfig = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

export function useCamera(config: CameraConfig = defaultConfig) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(config.facingMode);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (mode?: 'user' | 'environment') => {
    try {
      setError(null);
      const currentMode = mode || facingMode;

      // Update facingMode immediately
      setFacingMode(currentMode);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: config.width },
          height: { ideal: config.height },
          facingMode: currentMode,
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '无法访问摄像头';
      setError(message);
      console.error('Camera error:', err);
    }
  }, [config, facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !isStreaming) {
      return null;
    }
    return captureVideoFrame(videoRef.current);
  }, [isStreaming]);

  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    await startCamera(newFacingMode);
  }, [facingMode, stopCamera, startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreaming,
    error,
    facingMode,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera,
  };
}
