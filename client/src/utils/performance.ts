/**
 * 性能监控工具
 */

interface PerformanceMetrics {
  fps: number;
  latency: number;
  apiCalls: number;
  cacheHits: number;
  errors: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    latency: 0,
    apiCalls: 0,
    cacheHits: 0,
    errors: 0,
  };

  private frameCount = 0;
  private lastTime = performance.now();
  private latencySum = 0;
  private latencyCount = 0;

  // 记录 FPS
  recordFrame() {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;
    }
  }

  // 记录延迟
  recordLatency(latency: number) {
    this.latencySum += latency;
    this.latencyCount++;
    this.metrics.latency = Math.round(this.latencySum / this.latencyCount);
  }

  // 记录 API 调用
  recordApiCall() {
    this.metrics.apiCalls++;
  }

  // 记录缓存命中
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  // 记录错误
  recordError() {
    this.metrics.errors++;
  }

  // 获取指标
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // 重置指标
  reset() {
    this.metrics = {
      fps: 0,
      latency: 0,
      apiCalls: 0,
      cacheHits: 0,
      errors: 0,
    };
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.latencySum = 0;
    this.latencyCount = 0;
  }
}

// 单例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 计算函数执行时间
 */
export function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now();
  const result = fn();
  const time = performance.now() - start;
  return { result, time };
}

/**
 * 异步函数执行时间
 */
export async function measureTimeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;
  return { result, time };
}
