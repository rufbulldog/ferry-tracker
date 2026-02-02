import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export function useTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isRunning]);

  // Stop/pause the timer
  const stop = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
    }
  }, [isRunning]);

  // Reset the timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
  }, []);

  // Resume after pause
  const resume = useCallback(() => {
    if (isPaused) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isPaused]);

  // Timer tick effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Format elapsed time as MM:SS or HH:MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    elapsedSeconds,
    isRunning,
    isPaused,
    formattedTime: formatTime(elapsedSeconds),
    start,
    stop,
    reset,
    resume,
  };
}
