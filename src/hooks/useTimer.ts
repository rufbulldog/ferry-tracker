import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMER_STORAGE_KEY = 'ferry-timer-state';

interface PersistedTimerState {
  startTimestamp: number;
  previousElapsed: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface TimerState {
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export function useTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [restored, setRestored] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const previousElapsedRef = useRef(0);

  // Compute elapsed from timestamp
  const computeElapsed = useCallback(() => {
    if (startTimestampRef.current === null) return previousElapsedRef.current;
    return previousElapsedRef.current + Math.floor((Date.now() - startTimestampRef.current) / 1000);
  }, []);

  // Persist timer state to AsyncStorage
  const persistState = useCallback(async (running: boolean, paused: boolean) => {
    const state: PersistedTimerState = {
      startTimestamp: startTimestampRef.current ?? 0,
      previousElapsed: previousElapsedRef.current,
      isRunning: running,
      isPaused: paused,
    };
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  }, []);

  const clearPersistedState = useCallback(async () => {
    await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
  }, []);

  // Restore timer state on mount (crash recovery)
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (stored) {
          const state: PersistedTimerState = JSON.parse(stored);
          if (state.isRunning && state.startTimestamp > 0) {
            // Timer was running — restore and recalculate
            startTimestampRef.current = state.startTimestamp;
            previousElapsedRef.current = state.previousElapsed;
            const elapsed = state.previousElapsed + Math.floor((Date.now() - state.startTimestamp) / 1000);
            setElapsedSeconds(elapsed);
            setIsRunning(true);
            setIsPaused(false);
          } else if (state.isPaused && state.previousElapsed > 0) {
            // Timer was paused — restore elapsed time
            previousElapsedRef.current = state.previousElapsed;
            startTimestampRef.current = null;
            setElapsedSeconds(state.previousElapsed);
            setIsRunning(false);
            setIsPaused(true);
          }
        }
      } catch {
        // Ignore restore errors
      }
      setRestored(true);
    })();
  }, []);

  // Start the interval for UI updates
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(computeElapsed());
    }, 1000);
  }, [computeElapsed]);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning) {
      startTimestampRef.current = Date.now();
      previousElapsedRef.current = 0;
      setIsRunning(true);
      setIsPaused(false);
      setElapsedSeconds(0);
      persistState(true, false);
    }
  }, [isRunning, persistState]);

  // Stop/pause the timer
  const stop = useCallback(() => {
    if (isRunning) {
      // Capture the elapsed time so far
      const elapsed = computeElapsed();
      previousElapsedRef.current = elapsed;
      startTimestampRef.current = null;
      setElapsedSeconds(elapsed);
      setIsRunning(false);
      setIsPaused(true);
      clearIntervalRef();
      persistState(false, true);
    }
  }, [isRunning, computeElapsed, clearIntervalRef, persistState]);

  // Reset the timer
  const reset = useCallback(() => {
    startTimestampRef.current = null;
    previousElapsedRef.current = 0;
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    clearIntervalRef();
    clearPersistedState();
  }, [clearIntervalRef, clearPersistedState]);

  // Resume after pause
  const resume = useCallback(() => {
    if (isPaused) {
      startTimestampRef.current = Date.now();
      // previousElapsedRef already holds the accumulated time
      setIsRunning(true);
      setIsPaused(false);
      persistState(true, false);
    }
  }, [isPaused, persistState]);

  // Manage interval based on running state (after restore completes)
  useEffect(() => {
    if (!restored) return;
    if (isRunning) {
      startInterval();
    } else {
      clearIntervalRef();
    }
    return clearIntervalRef;
  }, [isRunning, restored, startInterval, clearIntervalRef]);

  // Handle AppState changes — recalculate on foreground return
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && isRunning && startTimestampRef.current) {
        // Recalculate elapsed immediately on returning to foreground
        setElapsedSeconds(computeElapsed());
        startInterval();
      } else if (nextState !== 'active' && isRunning) {
        // Going to background — clear interval to save battery, persist state
        clearIntervalRef();
        persistState(true, false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isRunning, computeElapsed, startInterval, clearIntervalRef, persistState]);

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
