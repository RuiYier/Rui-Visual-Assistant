import React from 'react';
import { Camera, CameraOff, SwitchCamera, Maximize2, Minimize2 } from 'lucide-react';

interface VideoCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  error: string | null;
  isFullscreen?: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onSwitchCamera: () => void;
  onCaptureFrame: () => string | null;
  onToggleFullscreen?: () => void;
}

export function VideoCapture({
  videoRef,
  isStreaming,
  error,
  isFullscreen = false,
  onStartCamera,
  onStopCamera,
  onSwitchCamera,
  onCaptureFrame,
  onToggleFullscreen,
}: VideoCaptureProps) {
  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50' : 'w-full aspect-video'
    }`}>
      {/* 视频元素 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // 镜像显示
      />

      {/* 未开启摄像头时的遮罩 */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
          {error ? (
            <div className="text-red-400 text-center">
              <CameraOff className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm md:text-base">{error}</p>
            </div>
          ) : (
            <div className="text-gray-400 text-center">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm md:text-base">点击下方按钮开启摄像头</p>
            </div>
          )}
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {!isStreaming ? (
          <button
            onClick={onStartCamera}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center gap-2 transition-colors text-sm md:text-base"
          >
            <Camera className="w-4 h-4" />
            开启摄像头
          </button>
        ) : (
          <>
            <button
              onClick={onStopCamera}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-2 transition-colors text-sm md:text-base"
            >
              <CameraOff className="w-4 h-4" />
              关闭
            </button>
            <button
              onClick={onSwitchCamera}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center gap-2 transition-colors text-sm md:text-base"
            >
              <SwitchCamera className="w-4 h-4" />
              切换
            </button>
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center gap-2 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
