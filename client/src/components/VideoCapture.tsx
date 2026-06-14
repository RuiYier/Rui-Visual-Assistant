import { useState } from 'react';
import { Camera, CameraOff, SwitchCamera, Maximize2, Minimize2, Video, VideoOff } from 'lucide-react';

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
  onToggleFullscreen,
}: VideoCaptureProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full aspect-video shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 视频背景 */}
      <div className="absolute inset-0 bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* 渐变遮罩 */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      {/* 直播指示器 */}
      {isStreaming && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full animate-fade-in">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-semibold text-white tracking-wide">LIVE</span>
        </div>
      )}

      {/* 未开启状态 */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center shadow-xl">
            {error ? (
              <CameraOff className="w-8 h-8 text-red-400" />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </div>
          {error ? (
            <p className="text-red-400 text-center mt-4 text-sm font-medium px-4">
              {error}
            </p>
          ) : (
            <p className="text-gray-400 text-center mt-4 text-sm">
              点击下方按钮开启摄像头
            </p>
          )}
        </div>
      )}

      {/* 控制按钮 */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 ${
        isHovered || !isStreaming ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {!isStreaming ? (
          <button
            onClick={onStartCamera}
            className="group px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Video className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">开启摄像头</span>
          </button>
        ) : (
          <>
            <button
              onClick={onStopCamera}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <VideoOff className="w-4 h-4" />
              <span className="text-sm font-medium">关闭</span>
            </button>
            <button
              onClick={onSwitchCamera}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center gap-2 transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <SwitchCamera className="w-4 h-4" />
              <span className="text-sm font-medium">切换</span>
            </button>
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
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
