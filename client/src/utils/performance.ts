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

  recordLatency(latency: number) {
    this.latencySum += latency;
    this.latencyCount++;
    this.metrics.latency = Math.round(this.latencySum / this.latencyCount);
  }

  recordApiCall() {
    this.metrics.apiCalls++;
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordError() {
    this.metrics.errors++;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

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

export const performanceMonitor = new PerformanceMonitor();
