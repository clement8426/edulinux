'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
  elapsed: number;        // total seconds elapsed
  formatted: string;      // "MM:SS" format
  isRunning: boolean;
}

export function useScenarioTimer(scenarioId?: number | string) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (isRunning) return;
    startTimeRef.current = Date.now() - elapsed * 1000;
    setIsRunning(true);
  }, [isRunning, elapsed]);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Auto-start et reset quand scenarioId change
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
    startTimeRef.current = Date.now();
    setIsRunning(true);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scenarioId]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { elapsed, formatted, isRunning, start, stop, reset };
}

export function getMedalForTime(
  elapsed: number,
  medals: { gold: number; silver: number; bronze: number }
): 'gold' | 'silver' | 'bronze' | null {
  if (elapsed <= medals.gold) return 'gold';
  if (elapsed <= medals.silver) return 'silver';
  if (elapsed <= medals.bronze) return 'bronze';
  return null;
}

export function getMedalEmoji(medal: 'gold' | 'silver' | 'bronze' | null): string {
  switch (medal) {
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    case 'bronze': return '🥉';
    default: return '';
  }
}

export function getMedalColor(medal: 'gold' | 'silver' | 'bronze' | null): string {
  switch (medal) {
    case 'gold': return 'text-yellow-400 border-yellow-400/40';
    case 'silver': return 'text-gray-300 border-gray-300/40';
    case 'bronze': return 'text-orange-400 border-orange-400/40';
    default: return 'text-gray-600 border-gray-600/20';
  }
}
