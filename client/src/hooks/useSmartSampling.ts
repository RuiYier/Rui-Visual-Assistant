import { useState, useRef, useCallback, useEffect } from 'react';

interface SmartSamplingConfig {
  activeRate: number;
  idleRate: number;
  transitionDelay: number;
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

  const setActive = useCallback(() => {
    setIsActive(true);
    setCurrentRate(config.activeRate);

    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    activityTimerRef.current = window.setTimeout(() => {
      setIsActive(false);
      setCurrentRate(config.idleRate);
    }, config.transitionDelay);
  }, [config]);

  const setIdle = useCallback(() => {
    setIsActive(false);
    setCurrentRate(config.idleRate);

    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }
  }, [config]);

  const startSampling = useCallback((onSample: () => void) => {
    onSampleRef.current = onSample;
    const interval = 1000 / currentRate;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      onSampleRef.current?.();
    }, interval);
  }, [currentRate]);

  const stopSampling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onSampleRef.current = null;
  }, []);

  useEffect(() => {
    if (onSampleRef.current) {
      startSampling(onSampleRef.current);
    }
  }, [currentRate, startSampling]);

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
