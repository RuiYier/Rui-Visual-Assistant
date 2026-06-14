import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Database, AlertTriangle } from 'lucide-react';
import { performanceMonitor } from '../utils/performance';

interface PerformanceMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function PerformanceMonitor({ isVisible, onToggle }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState({
    fps: 0,
    latency: 0,
    apiCalls: 0,
    cacheHits: 0,
    errors: 0,
  });

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="显示性能监控"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          性能监控
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          x
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-gray-400">
            <Zap className="w-3 h-3" />
            FPS
          </span>
          <span className={metrics.fps > 20 ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.fps}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            延迟
          </span>
          <span className={metrics.latency < 100 ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.latency}ms
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-gray-400">
            <Database className="w-3 h-3" />
            API 调用
          </span>
          <span>{metrics.apiCalls}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-gray-400">
            <Database className="w-3 h-3" />
            缓存命中
          </span>
          <span className="text-green-400">{metrics.cacheHits}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-gray-400">
            <AlertTriangle className="w-3 h-3" />
            错误
          </span>
          <span className={metrics.errors > 0 ? 'text-red-400' : 'text-green-400'}>
            {metrics.errors}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-700">
        <button
          onClick={() => performanceMonitor.reset()}
          className="text-xs text-gray-400 hover:text-white"
        >
          重置统计
        </button>
      </div>
    </div>
  );
}
