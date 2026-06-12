import React, { useEffect, useCallback, useRef, useState } from 'react';
import { VideoCapture } from './components/VideoCapture';
import { ChatPanel } from './components/ChatPanel';
import { ControlBar } from './components/ControlBar';
import { SettingsPanel } from './components/SettingsPanel';
import { useCamera } from './hooks/useCamera';
import { useMicrophone } from './hooks/useMicrophone';
import { useWebSocket } from './hooks/useWebSocket';
import { VoiceActivityDetector } from './utils/vad';
import { Settings } from 'lucide-react';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [samplingRate, setSamplingRate] = useState(1);
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
  const frameIntervalRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);

  // 视频帧采样
  const startFrameSampling = useCallback(() => {
    if (frameIntervalRef.current) return;

    const interval = 1000 / samplingRate; // 根据采样率计算间隔

    frameIntervalRef.current = window.setInterval(() => {
      if (isCameraOn && isConnected) {
        const frame = captureFrame();
        if (frame) {
          sendVideoFrame(frame);
        }
      }
    }, interval);
  }, [isCameraOn, isConnected, captureFrame, sendVideoFrame, samplingRate]);

  const stopFrameSampling = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, []);

  // 切换摄像头
  const handleToggleCamera = useCallback(async () => {
    if (isCameraOn) {
      stopCamera();
      stopFrameSampling();
    } else {
      await startCamera();
      startFrameSampling();
    }
  }, [isCameraOn, startCamera, stopCamera, startFrameSampling, stopFrameSampling]);

  // 切换麦克风
  const handleToggleMic = useCallback(async () => {
    if (isMicOn) {
      stopRecording();
      vadRef.current?.stop();
    } else {
      await startRecording((audioBase64) => {
        // 发送音频数据
        sendAudioChunk(audioBase64);
      });

      // 启动 VAD
      if (micStream) {
        vadRef.current = new VoiceActivityDetector(30, 1500);
        vadRef.current.start(micStream, (isSpeaking) => {
          isSpeakingRef.current = isSpeaking;
          // 可以根据说话状态调整采样频率
        });
      }
    }
  }, [isMicOn, startRecording, stopRecording, sendAudioChunk, micStream]);

  // 截图分析
  const handleScreenshot = useCallback(() => {
    if (isCameraOn) {
      const frame = captureFrame();
      if (frame) {
        sendScreenshot(frame);
      }
    }
  }, [isCameraOn, captureFrame, sendScreenshot]);

  // 清理
  useEffect(() => {
    return () => {
      stopFrameSampling();
      vadRef.current?.stop();
    };
  }, [stopFrameSampling]);

  // 设置改变时发送配置
  useEffect(() => {
    if (isConnected) {
      sendConfig({ voice: selectedVoice, samplingRate });
    }
  }, [selectedVoice, samplingRate, isConnected, sendConfig]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 头部 */}
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

      {/* 主内容区 */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* 左侧：视频区域 */}
        <div className="w-1/2 flex flex-col">
          <VideoCapture
            videoRef={videoRef}
            isStreaming={isCameraOn}
            error={cameraError}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
            onSwitchCamera={switchCamera}
            onCaptureFrame={captureFrame}
          />

          {/* 状态信息 */}
          <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-4 text-sm">
              <span className={isCameraOn ? 'text-green-500' : 'text-gray-400'}>
                ● 摄像头 {isCameraOn ? '开启' : '关闭'}
              </span>
              <span className={isMicOn ? 'text-green-500' : 'text-gray-400'}>
                ● 麦克风 {isMicOn ? '开启' : '关闭'}
              </span>
              <span className={isConnected ? 'text-green-500' : 'text-gray-400'}>
                ● 服务器 {isConnected ? '已连接' : '未连接'}
              </span>
            </div>
            {(cameraError || micError) && (
              <p className="text-red-500 text-sm mt-2">
                {cameraError || micError}
              </p>
            )}
          </div>
        </div>

        {/* 右侧：对话区域 */}
        <div className="w-1/2">
          <ChatPanel
            messages={messages}
            currentTranscript={currentTranscript}
            currentResponse={currentResponse}
            isProcessing={isProcessing}
          />
        </div>
      </main>

      {/* 底部控制栏 */}
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

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedVoice={selectedVoice}
        samplingRate={samplingRate}
        onVoiceChange={setSelectedVoice}
        onSamplingRateChange={setSamplingRate}
      />
    </div>
  );
}

export default App;
