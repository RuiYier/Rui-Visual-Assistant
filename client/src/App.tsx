import React, { useEffect, useCallback, useRef, useState } from 'react';
import { VideoCapture } from './components/VideoCapture';
import { ChatPanel } from './components/ChatPanel';
import { ControlBar } from './components/ControlBar';
import { SettingsPanel } from './components/SettingsPanel';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { useCamera } from './hooks/useCamera';
import { useMicrophone } from './hooks/useMicrophone';
import { useWebSocket } from './hooks/useWebSocket';
import { useSmartSampling } from './hooks/useSmartSampling';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { VoiceActivityDetector } from './utils/vad';
import { Settings } from 'lucide-react';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('冰糖');
  const [samplingRate, setSamplingRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPerformanceVisible, setIsPerformanceVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    videoRef,
    isStreaming: isCameraOn,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera,
  } = useCamera();

  const {
    isRecording: isMicOn,
    error: micError,
    startRecording,
    stopRecording,
    stream: micStream,
  } = useMicrophone();

  const {
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
  } = useWebSocket();

  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const isSpeakingRef = useRef(false);
  const isCameraOnRef = useRef(false);
  const isConnectedRef = useRef(false);

  useEffect(() => { isCameraOnRef.current = isCameraOn; }, [isCameraOn]);
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);

  const {
    currentRate,
    isActive: isSamplingActive,
    setActive: setSamplingActive,
    setIdle: setSamplingIdle,
    startSampling,
    stopSampling,
  } = useSmartSampling({
    activeRate: samplingRate,
    idleRate: samplingRate * 0.2,
    transitionDelay: 3000,
  });

  const startFrameSampling = useCallback(() => {
    startSampling(() => {
      if (isCameraOnRef.current && isConnectedRef.current) {
        const frame = captureFrame();
        if (frame) {
          sendVideoFrame(frame);
        }
      }
    });
  }, [captureFrame, sendVideoFrame, startSampling]);

  const stopFrameSampling = useCallback(() => {
    stopSampling();
  }, [stopSampling]);

  const handleToggleCamera = useCallback(async () => {
    if (isCameraOn) {
      stopCamera();
      stopFrameSampling();
    } else {
      await startCamera();
      startFrameSampling();
    }
  }, [isCameraOn, startCamera, stopCamera, startFrameSampling, stopFrameSampling]);

  const handleToggleMic = useCallback(async () => {
    if (isMicOn) {
      stopRecording();
      vadRef.current?.stop();
      setSamplingIdle();
    } else {
      await startRecording((audioBase64) => {
        sendAudioChunk(audioBase64);
        setSamplingActive();
      });

      if (micStream) {
        vadRef.current = new VoiceActivityDetector(30, 1500);
        vadRef.current.start(micStream, (isSpeaking) => {
          isSpeakingRef.current = isSpeaking;
          if (isSpeaking) {
            setSamplingActive();
          }
        });
      }
    }
  }, [isMicOn, startRecording, stopRecording, sendAudioChunk, micStream, setSamplingActive, setSamplingIdle]);

  const handleScreenshot = useCallback(() => {
    if (isCameraOn) {
      const frame = captureFrame();
      if (frame) {
        sendScreenshot(frame);
      }
    }
  }, [isCameraOn, captureFrame, sendScreenshot]);

  useEffect(() => {
    return () => {
      stopFrameSampling();
      vadRef.current?.stop();
    };
  }, [stopFrameSampling]);

  useKeyboardShortcuts({
    onToggleCamera: handleToggleCamera,
    onToggleMic: handleToggleMic,
    onScreenshot: handleScreenshot,
    onClearMessages: clearMessages,
    onToggleSettings: () => setIsSettingsOpen(!isSettingsOpen),
  });

  useEffect(() => {
    if (isConnected) {
      sendConfig({ voice: selectedVoice, samplingRate });
    }
  }, [selectedVoice, samplingRate, isConnected, sendConfig]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="px-6 py-4 bg-white shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI 视觉对话助手</h1>
          <p className="text-sm text-gray-500 mt-1">
            打开摄像头和麦克风，AI 能看到你并进行对话
          </p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="设置"
        >
          <Settings className="w-6 h-6 text-gray-600" />
        </button>
      </header>

      <main className={`flex-1 flex gap-4 p-4 overflow-hidden ${
        isMobile ? 'flex-col' : 'flex-row'
      }`}>
        <div className={isMobile ? 'w-full' : 'w-1/2 flex flex-col'}>
          <VideoCapture
            videoRef={videoRef}
            isStreaming={isCameraOn}
            error={cameraError}
            isFullscreen={isFullscreen}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
            onSwitchCamera={switchCamera}
            onCaptureFrame={captureFrame}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />

          <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className={isCameraOn ? 'text-green-500' : 'text-gray-400'}>
                {isCameraOn ? '摄像头 开启' : '摄像头 关闭'}
              </span>
              <span className={isMicOn ? 'text-green-500' : 'text-gray-400'}>
                {isMicOn ? '麦克风 开启' : '麦克风 关闭'}
              </span>
              <span className={isConnected ? 'text-green-500' : 'text-gray-400'}>
                {isConnected ? '服务器 已连接' : '服务器 未连接'}
              </span>
              <span className={isSamplingActive ? 'text-blue-500' : 'text-gray-400'}>
                采样 {currentRate.toFixed(1)} fps
              </span>
            </div>
            {(cameraError || micError) && (
              <p className="text-red-500 text-sm mt-2">
                {cameraError || micError}
              </p>
            )}
          </div>
        </div>

        <div className={isMobile ? 'w-full flex-1' : 'w-1/2'}>
          <ChatPanel
            messages={messages}
            currentTranscript={currentTranscript}
            currentResponse={currentResponse}
            isProcessing={isProcessing}
          />
        </div>
      </main>

      <ControlBar
        isCameraOn={isCameraOn}
        isMicOn={isMicOn}
        isConnected={isConnected}
        isRecording={isMicOn}
        onToggleCamera={handleToggleCamera}
        onToggleMic={handleToggleMic}
        onScreenshot={handleScreenshot}
        onClearMessages={clearMessages}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedVoice={selectedVoice}
        samplingRate={samplingRate}
        onVoiceChange={setSelectedVoice}
        onSamplingRateChange={setSamplingRate}
      />

      <PerformanceMonitor
        isVisible={isPerformanceVisible}
        onToggle={() => setIsPerformanceVisible(!isPerformanceVisible)}
      />
    </div>
  );
}

export default App;
