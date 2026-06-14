import { useState, useEffect } from 'react';
import { Settings, X, Volume2, Zap, Info } from 'lucide-react';
import { Voice } from '../types';
import { fetchVoices } from '../services/api';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: string;
  samplingRate: number;
  onVoiceChange: (voice: string) => void;
  onSamplingRateChange: (rate: number) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  selectedVoice,
  samplingRate,
  onVoiceChange,
  onSamplingRateChange,
}: SettingsPanelProps) {
  const [voices, setVoices] = useState<Voice[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchVoices().then(setVoices);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-in-scale overflow-hidden border border-gray-200">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <Settings className="w-4.5 h-4.5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 语音选择 */}
          <div className="animate-fade-in">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-500" />
              AI 语音音色
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => onVoiceChange(voice.id)}
                  className={`group p-3 rounded-xl text-left transition-all duration-200 ${
                    selectedVoice === voice.id
                      ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <p className={`font-medium text-sm ${
                    selectedVoice === voice.id ? 'text-blue-700' : 'text-gray-900'
                  }`}>{voice.name}</p>
                  <p className={`text-xs mt-0.5 ${
                    selectedVoice === voice.id ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {voice.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 采样频率 */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" />
              视频帧采样频率
            </h3>
            <div className="space-y-2">
              {[
                { value: 0.5, label: '0.5 fps', description: '省电模式，延迟较高' },
                { value: 1, label: '1 fps', description: '平衡模式（推荐）' },
                { value: 2, label: '2 fps', description: '流畅模式，消耗较多' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onSamplingRateChange(option.value)}
                  className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                    samplingRate === option.value
                      ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium text-sm ${
                        samplingRate === option.value ? 'text-blue-700' : 'text-gray-900'
                      }`}>{option.label}</p>
                      <p className={`text-xs mt-0.5 ${
                        samplingRate === option.value ? 'text-blue-500' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                    {samplingRate === option.value && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 提示信息 */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                成本控制提示
              </h3>
              <ul className="text-xs text-amber-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  降低采样频率可减少 API 调用次数
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  不说话时系统会自动暂停处理
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  图片已自动压缩至 720p
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  TTS 音频会自动缓存
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
