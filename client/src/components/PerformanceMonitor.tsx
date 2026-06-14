import { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Database, AlertTriangle, X } from 'lucide-react';
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
        className="fixed bottom-4 right-4 p-3 bg-white text-gray-600 rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:scale-105 active:scale-95"
        title="显示性能监控"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[220px] animate-fade-in-scale">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-gray-600" />
          </div>
          性能监控
        </h3>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* 指标 */}
      <div className="space-y-2">
        <MetricItem
          icon={<Zap className="w-3.5 h-3.5" />}
          label="FPS"
          value={metrics.fps}
          status={metrics.fps > 20 ? 'good' : metrics.fps > 10 ? 'warning' : 'danger'}
          suffix=""
        />

        <MetricItem
          icon={<Clock className="w-3.5 h-3.5" />}
          label="延迟"
          value={metrics.latency}
          status={metrics.latency < 100 ? 'good' : metrics.latency < 200 ? 'warning' : 'danger'}
          suffix="ms"
        />

        <MetricItem
          icon={<Database className="w-3.5 h-3.5" />}
          label="API 调用"
          value={metrics.apiCalls}
          status="neutral"
          suffix=""
        />

        <MetricItem
          icon={<Database className="w-3.5 h-3.5" />}
          label="缓存命中"
          value={metrics.cacheHits}
          status="good"
          suffix=""
        />

        <MetricItem
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          label="错误"
          value={metrics.errors}
          status={metrics.errors === 0 ? 'good' : 'danger'}
          suffix=""
        />
      </div>

      {/* 重置按钮 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => performanceMonitor.reset()}
          className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
        >
          重置统计
        </button>
      </div>
    </div>
  );
}

// 指标项组件
function MetricItem({
  icon,
  label,
  value,
  status,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  status: 'good' | 'warning' | 'danger' | 'neutral';
  suffix: string;
}) {
  const statusColors = {
    good: 'text-green-600 bg-green-50',
    warning: 'text-amber-600 bg-amber-50',
    danger: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
      <span className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[status]}`}>
        {value}{suffix}
      </span>
    </div>
  );
}
