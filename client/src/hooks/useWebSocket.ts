import { useState, useEffect, useCallback, useRef } from 'react';
import { wsService } from '../services/websocket';
import { ServerMessage, ChatMessage } from '../types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    wsService.connect();

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    const handleTranscript = (message: ServerMessage) => {
      if (message.isFinal) {
        setCurrentTranscript('');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: message.data,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setCurrentTranscript(message.data);
      }
    };

    const handleResponse = (message: ServerMessage) => {
      if (message.isFinal) {
        setCurrentResponse('');
        setIsProcessing(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: message.data,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setCurrentResponse(message.data);
        setIsProcessing(true);
      }
    };

    const handleAudio = (message: ServerMessage) => {
      audioQueueRef.current.push(message.data);
      playNextAudio();
    };

    const handleError = (message: ServerMessage) => {
      console.error('Server error:', message.data);
      setIsProcessing(false);
    };

    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('transcript', handleTranscript);
    wsService.on('response', handleResponse);
    wsService.on('audio', handleAudio);
    wsService.on('error', handleError);

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('transcript', handleTranscript);
      wsService.off('response', handleResponse);
      wsService.off('audio', handleAudio);
      wsService.off('error', handleError);
      wsService.disconnect();
    };
  }, []);

  const playNextAudio = useCallback(() => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const base64 = audioQueueRef.current.shift()!;

    const audio = new Audio();
    const blob = base64ToBlob(base64, 'audio/wav');
    const url = URL.createObjectURL(blob);

    audio.src = url;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      isPlayingRef.current = false;
      playNextAudio();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      isPlayingRef.current = false;
      playNextAudio();
    };

    audio.play().catch(() => {
      isPlayingRef.current = false;
      playNextAudio();
    });
  }, []);

  const sendVideoFrame = useCallback((base64: string) => {
    wsService.send({
      type: 'video_frame',
      data: base64,
      timestamp: Date.now(),
    });
  }, []);

  const sendAudioChunk = useCallback((base64: string, mimeType?: string) => {
    wsService.send({
      type: 'audio_chunk',
      data: base64,
      timestamp: Date.now(),
      mimeType,
    });
  }, []);

  const sendScreenshot = useCallback((base64: string) => {
    wsService.send({
      type: 'screenshot',
      data: base64,
      timestamp: Date.now(),
    });
  }, []);

  const sendConfig = useCallback((config: { voice?: string; samplingRate?: number }) => {
    wsService.send({
      type: 'config',
      data: JSON.stringify(config),
      timestamp: Date.now(),
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    messages,
    currentTranscript,
    currentResponse,
    isProcessing,
    sendVideoFrame,
    sendAudioChunk,
    sendScreenshot,
    sendConfig,
    clearMessages,
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
