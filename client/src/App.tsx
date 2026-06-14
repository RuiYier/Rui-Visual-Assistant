import { useEffect, useCallback, useRef, useState } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    setTimeout(() => setIsLoaded(true), 100);
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
    <div className={`h-screen flex flex-col bg-gray-50 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">AI 视觉对话助手</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            打开摄像头和麦克风，AI 能看到你并进行对话
          </p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          title="设置"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* 主内容区 */}
      <main className={`flex-1 flex gap-4 p-4 overflow-hidden ${
        isMobile ? 'flex-col' : 'flex-row'
      }`}>
        {/* 视频区域 */}
        <div className={`${isMobile ? 'w-full' : 'w-1/2 flex flex-col'} animate-fade-in`}>
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

          {/* 状态栏 */}
          <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 card-hover">
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <StatusIndicator active={isCameraOn} label="摄像头" />
              <StatusIndicator active={isMicOn} label="麦克风" />
              <StatusIndicator active={isConnected} label="服务器" />
            </div>
            {(cameraError || micError) && (
              <p className="text-red-500 text-sm mt-2 animate-fade-in">
                {cameraError || micError}
              </p>
            )}
          </div>
        </div>

        {/* 聊天区域 */}
        <div className={`${isMobile ? 'w-full flex-1' : 'w-1/2'} animate-fade-in`} style={{ animationDelay: '0.1s' }}>
          <ChatPanel
            messages={messages}
            currentTranscript={currentTranscript}
            currentResponse={currentResponse}
            isProcessing={isProcessing}
          />
        </div>
      </main>

      {/* 控制栏 */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
      </div>

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

// 状态指示器组件
function StatusIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-200 ${
      active
        ? 'bg-green-50 text-green-600'
        : 'bg-gray-100 text-gray-400'
    }`}>
      <div className={`status-dot ${active ? 'active' : 'inactive'}`} />
      <span className="text-xs font-medium">{label} {active ? '开启' : '关闭'}</span>
    </div>
  );
}

export default App;
