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
    <div className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* 连接状态 */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">已连接</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <WifiOff className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">未连接</span>
            </div>
          )}

          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
              </div>
              <span className="text-sm font-medium text-red-500">录音中</span>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-2">
          <ControlButton
            onClick={onToggleCamera}
            active={isCameraOn}
            icon={isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            tooltip={isCameraOn ? '关闭摄像头' : '开启摄像头'}
          />

          <ControlButton
            onClick={onToggleMic}
            active={isMicOn}
            icon={isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            tooltip={isMicOn ? '关闭麦克风' : '开启麦克风'}
          />

          <div className="w-px h-8 bg-gray-200 mx-1" />

          <ControlButton
            onClick={onScreenshot}
            disabled={!isCameraOn}
            icon={<Image className="w-5 h-5" />}
            tooltip="截图分析"
            variant="secondary"
          />

          <ControlButton
            onClick={onClearMessages}
            icon={<Trash2 className="w-5 h-5" />}
            tooltip="清空对话"
            variant="secondary"
          />
        </div>

        {/* 占位 */}
        <div className="w-24" />
      </div>
    </div>
  );
}

// 控制按钮组件
function ControlButton({
  onClick,
  active,
  disabled,
  icon,
  tooltip,
  variant = 'primary',
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltip: string;
  variant?: 'primary' | 'secondary';
}) {
  const baseClasses = "relative p-3 rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 btn";

  const variantClasses = variant === 'primary'
    ? active
      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25 hover:bg-blue-600'
      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
      title={tooltip}
    >
      {icon}
    </button>
  );
}
