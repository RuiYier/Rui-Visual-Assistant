import { useState, useRef, useCallback, useEffect } from 'react';

interface SmartSamplingConfig {
  activeRate: number;    // 对话时的采样率 (fps)
  idleRate: number;      // 空闲时的采样率 (fps)
  transitionDelay: number; // 从活跃到空闲的延迟 (ms)
}

const defaultConfig: SmartSamplingConfig = {
  activeRate: 1,
  idleRate: 0.2,
  transitionDelay: 3000,
};

export function useSmartSampling(config: SmartSamplingConfig = defaultConfig) {
  const [currentRate, setCurrentRate] = useState(config.idleRate);
  const [isActive, setIsActive] = useState(false);
  const activityTimerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const onSampleRef = useRef<(() => void) | null>(null);

  // 设置为活跃状态
  const setActive = useCallback(() => {
    setIsActive(true);
    setCurrentRate(config.activeRate);

    // 清除之前的定时器
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    // 设置新的定时器，延迟后切换到空闲状态
    activityTimerRef.current = window.setTimeout(() => {
      setIsActive(false);
      setCurrentRate(config.idleRate);
    }, config.transitionDelay);
  }, [config]);

  // 设置为空闲状态
  const setIdle = useCallback(() => {
    setIsActive(false);
    setCurrentRate(config.idleRate);

    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }
  }, [config]);

  // 开始采样
  const startSampling = useCallback((onSample: () => void) => {
    onSampleRef.current = onSample;

    // 根据当前采样率设置定时器
    const interval = 1000 / currentRate;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      onSampleRef.current?.();
    }, interval);
  }, [currentRate]);

  // 停止采样
  const stopSampling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onSampleRef.current = null;
  }, []);

  // 当采样率改变时，重新设置定时器
  useEffect(() => {
    if (onSampleRef.current) {
      startSampling(onSampleRef.current);
    }
  }, [currentRate, startSampling]);

  // 清理
  useEffect(() => {
    return () => {
      stopSampling();
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [stopSampling]);

  return {
    currentRate,
    isActive,
    setActive,
    setIdle,
    startSampling,
    stopSampling,
  };
}
