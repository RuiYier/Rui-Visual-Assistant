import React, { useState } from 'react';
import { Settings, X, Volume2 } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: string;
  samplingRate: number;
  onVoiceChange: (voice: string) => void;
  onSamplingRateChange: (rate: number) => void;
}

const VOICES = [
  { id: 'alloy', name: 'Alloy', description: '中性、平衡' },
  { id: 'echo', name: 'Echo', description: '男性、沉稳' },
  { id: 'fable', name: 'Fable', description: '男性、温暖' },
  { id: 'onyx', name: 'Onyx', description: '男性、深沉' },
  { id: 'nova', name: 'Nova', description: '女性、活泼' },
  { id: 'shimmer', name: 'Shimmer', description: '女性、柔和' },
];

export function SettingsPanel({
  isOpen,
  onClose,
  selectedVoice,
  samplingRate,
  onVoiceChange,
  onSamplingRateChange,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
        {/* 标题 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 设置内容 */}
        <div className="p-6 space-y-6">
          {/* TTS 音色选择 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              AI 语音音色
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => onVoiceChange(voice.id)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedVoice === voice.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{voice.name}</p>
                  <p className="text-xs text-gray-500">{voice.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 采样频率 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
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
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    samplingRate === option.value
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 成本控制提示 */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              💡 成本控制提示
            </h3>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• 降低采样频率可减少 API 调用次数</li>
              <li>• 不说话时系统会自动暂停处理</li>
              <li>• 图片已自动压缩至 720p</li>
              <li>• TTS 音频会自动缓存</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
