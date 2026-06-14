import { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { User, Bot, Loader2, Download, MessageCircle } from 'lucide-react';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript, currentResponse]);

  const exportHistory = () => {
    if (messages.length === 0) return;

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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">对话记录</h2>
          {messages.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
              {messages.length}
            </span>
          )}
        </div>
        <button
          onClick={exportHistory}
          disabled={messages.length === 0}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          title="导出对话记录"
        >
          <Download className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 空状态 */}
        {messages.length === 0 && !currentTranscript && !currentResponse && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">开始对话吧！</p>
            <p className="text-sm text-gray-400 mt-1">打开摄像头和麦克风，对着摄像头说话</p>
          </div>
        )}

        {/* 消息列表 */}
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 message-enter ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[70%] px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-1.5 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* 当前识别 */}
        {currentTranscript && (
          <div className="flex gap-3 justify-end animate-slide-in-right">
            <div className="max-w-[70%] px-4 py-2.5 rounded-2xl bg-blue-400 text-white rounded-br-md opacity-80">
              <p className="text-sm">{currentTranscript}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                </div>
                <span className="text-xs text-blue-100">正在识别...</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* 当前回复 */}
        {currentResponse && (
          <div className="flex gap-3 justify-start animate-slide-in-left">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[70%] px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-md">
              <p className="text-sm leading-relaxed">{currentResponse}</p>
              {isProcessing && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  <span>思考中...</span>
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
