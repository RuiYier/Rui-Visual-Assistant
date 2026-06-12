import { useState, useRef, useCallback } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const currentUrlRef = useRef<string | null>(null);

  const play = useCallback((base64: string, format: string = 'mp3') => {
    return new Promise<void>((resolve, reject) => {
      const blob = base64ToBlob(base64, `audio/${format}`);
      const url = URL.createObjectURL(blob);

      const audio = new Audio();
      audio.src = url;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentUrlRef.current = null;
        setIsPlaying(false);
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        currentUrlRef.current = null;
        setIsPlaying(false);
        reject(error);
      };

      audioRef.current = audio;
      currentUrlRef.current = url;
      setIsPlaying(true);

      audio.play().catch((error) => {
        URL.revokeObjectURL(url);
        currentUrlRef.current = null;
        setIsPlaying(false);
        reject(error);
      });
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }

      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const addToQueue = useCallback((base64: string) => {
    queueRef.current.push(base64);
  }, []);

  return {
    isPlaying,
    play,
    stop,
    addToQueue,
  };
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
