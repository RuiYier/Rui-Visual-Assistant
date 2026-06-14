interface PerformanceMetrics {
  latency: number;
  apiCalls: number;
  cacheHits: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    latency: 0,
    apiCalls: 0,
    cacheHits: 0,
  };

  // 测试 API 延迟
  async testLatency(apiUrl: string): Promise<void> {
    try {
      const start = performance.now();
      await fetch(apiUrl, { method: 'HEAD', mode: 'no-cors' });
      const end = performance.now();
      this.metrics.latency = Math.round(end - start);
    } catch {
      this.metrics.latency = -1;
    }
  }

  recordApiCall() {
    this.metrics.apiCalls++;
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      latency: 0,
      apiCalls: 0,
      cacheHits: 0,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
