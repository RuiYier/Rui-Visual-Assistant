import React from 'react';
import { Mic, MicOff, Camera, CameraOff, Image, Trash2, Wifi, WifiOff } from 'lucide-react';

interface ControlBarProps {
  isCameraOn: boolean;
  isMicOn: boolean;
  isConnected: boolean;
  isRecording: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onScreenshot: () => void;
  onClearMessages: () => void;
}

export function ControlBar({
  isCameraOn,
  isMicOn,
  isConnected,
  isRecording,
  onToggleCamera,
  onToggleMic,
  onScreenshot,
  onClearMessages,
}: ControlBarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t">
      {/* 左侧状态 */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center gap-1 text-green-500">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">已连接</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-500">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">未连接</span>
          </div>
        )}

        {isRecording && (
          <div className="flex items-center gap-1 text-red-500 ml-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm">录音中</span>
          </div>
        )}
      </div>

      {/* 中间控制按钮 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleCamera}
          className={`p-3 rounded-full transition-colors ${
            isCameraOn
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
          title={isCameraOn ? '关闭摄像头' : '开启摄像头'}
        >
          {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
        </button>

        <button
          onClick={onToggleMic}
          className={`p-3 rounded-full transition-colors ${
            isMicOn
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
          title={isMicOn ? '关闭麦克风' : '开启麦克风'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={onScreenshot}
          disabled={!isCameraOn}
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="截图分析"
        >
          <Image className="w-5 h-5" />
        </button>

        <button
          onClick={onClearMessages}
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
          title="清空对话"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* 右侧占位 */}
      <div className="w-24" />
    </div>
  );
}
