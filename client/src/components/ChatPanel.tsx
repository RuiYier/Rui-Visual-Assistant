import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { User, Bot, Loader2, Download } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentTranscript: string;
  currentResponse: string;
  isProcessing: boolean;
}

export function ChatPanel({
  messages,
  currentTranscript,
  currentResponse,
  isProcessing,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript, currentResponse]);

  // 导出对话历史
  const exportHistory = () => {
    if (messages.length === 0) {
      alert('没有对话记录可导出');
      return;
    }

    const content = messages
      .map((msg) => {
        const time = new Date(msg.timestamp).toLocaleString();
        const role = msg.role === 'user' ? '用户' : 'AI';
        return `[${time}] ${role}: ${msg.content}`;
      })
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `对话记录_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* 标题 */}
      <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">对话记录</h2>
        <button
          onClick={exportHistory}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="导出对话记录"
        >
          <Download className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !currentTranscript && !currentResponse && (
          <div className="text-center text-gray-400 py-8">
            <Bot className="w-12 h-12 mx-auto mb-2" />
            <p>开始对话吧！</p>
            <p className="text-sm mt-1">打开摄像头和麦克风，对着摄像头说话</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* 实时识别 */}
        {currentTranscript && (
          <div className="flex gap-3 justify-end">
            <div className="max-w-[70%] px-4 py-2 rounded-2xl bg-blue-400 text-white opacity-70">
              <p className="text-sm">{currentTranscript}</p>
              <p className="text-xs mt-1">正在识别...</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* AI 思考中 */}
        {currentResponse && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-[70%] px-4 py-2 rounded-2xl bg-white text-gray-800 shadow-sm">
              <p className="text-sm">{currentResponse}</p>
              {isProcessing && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  思考中...
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
