/**
 * 语音活动检测 (Voice Activity Detection)
 * 使用 Web Audio API 检测是否有语音活动
 */

export type VADCallback = (isSpeaking: boolean) => void;

export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private callback: VADCallback | null = null;
  private threshold: number = 30; // 音量阈值
  private isSpeaking: boolean = false;
  private silenceTimeout: number = 1500; // 静音超时（毫秒）
  private silenceTimer: number | null = null;

  constructor(threshold: number = 30, silenceTimeout: number = 1500) {
    this.threshold = threshold;
    this.silenceTimeout = silenceTimeout;
  }

  async start(stream: MediaStream, callback: VADCallback) {
    this.callback = callback;
    this.mediaStream = stream;

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);

    this.detect();
  }

  private detect() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // 计算平均音量
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

    const wasSpeaking = this.isSpeaking;
    this.isSpeaking = average > this.threshold;

    if (this.isSpeaking && !wasSpeaking) {
      // 开始说话
      this.clearSilenceTimer();
      this.callback?.(true);
    } else if (!this.isSpeaking && wasSpeaking) {
      // 可能停止说话，等待静音超时
      this.startSilenceTimer();
    }

    this.animationFrame = requestAnimationFrame(() => this.detect());
  }

  private startSilenceTimer() {
    this.clearSilenceTimer();
    this.silenceTimer = window.setTimeout(() => {
      if (!this.isSpeaking) {
        this.callback?.(false);
      }
    }, this.silenceTimeout);
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.clearSilenceTimer();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaStream = null;
    this.isSpeaking = false;
  }

  setThreshold(threshold: number) {
    this.threshold = threshold;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
