'use client';

import { useState, useEffect } from 'react';

export interface UserProgress {
  completedLevels: number[];
  currentLevel: number;
  totalXP: number;
  badges: string[];
  completedScenarios: number[];
  scenarioSteps: Record<number, number[]>;
}

const STORAGE_KEY = 'edulinux_progress';

function mergeProgress(local: UserProgress, remote: UserProgress): UserProgress {
  const completedLevels = Array.from(new Set([...local.completedLevels, ...remote.completedLevels]));
  const completedScenarios = Array.from(new Set([...local.completedScenarios, ...remote.completedScenarios]));
  const badges = Array.from(new Set([...local.badges, ...remote.badges]));
  const scenarioSteps: Record<number, number[]> = { ...remote.scenarioSteps };
  for (const [sid, steps] of Object.entries(local.scenarioSteps)) {
    const key = Number(sid);
    scenarioSteps[key] = Array.from(new Set([...(scenarioSteps[key] ?? []), ...steps]));
  }
  return {
    completedLevels,
    completedScenarios,
    badges,
    scenarioSteps,
    currentLevel: Math.max(local.currentLevel, remote.currentLevel),
    totalXP: Math.max(local.totalXP, remote.totalXP),
  };
}

async function pushProgressToServer(progress: UserProgress) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });
  } catch {
    // Silencieux — localStorage reste la source de vérité
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>({
    completedLevels: [],
    currentLevel: 1,
    totalXP: 0,
    badges: [],
    completedScenarios: [],
    scenarioSteps: {},
  });

  useEffect(() => {
    // 1. Charger depuis localStorage
    let local: UserProgress = {
      completedLevels: [],
      currentLevel: 1,
      totalXP: 0,
      badges: [],
      completedScenarios: [],
      scenarioSteps: {},
    };
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        local = {
          completedLevels: parsed.completedLevels ?? [],
          currentLevel: parsed.currentLevel ?? 1,
          totalXP: parsed.totalXP ?? 0,
          badges: parsed.badges ?? [],
          completedScenarios: parsed.completedScenarios ?? [],
          scenarioSteps: parsed.scenarioSteps ?? {},
        };
      } catch (e) {
        console.error('Failed to load local progress:', e);
      }
    }
    setProgress(local);

    // 2. Synchroniser avec le serveur si connecté
    fetch('/api/progress')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data?.progress) {
          // Pas encore de progression côté serveur → on y pousse le local
          if (local.completedLevels.length > 0 || local.totalXP > 0) {
            pushProgressToServer(local);
          }
          return;
        }
        const remote: UserProgress = {
          completedLevels: data.progress.completed_levels ?? [],
          currentLevel: data.progress.current_level ?? 1,
          totalXP: data.progress.total_xp ?? 0,
          badges: data.progress.badges ?? [],
          completedScenarios: data.progress.completed_scenarios ?? [],
          scenarioSteps: data.progress.scenario_steps ?? {},
        };
        const merged = mergeProgress(local, remote);
        setProgress(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        // Si le local avait plus de données, on met le serveur à jour
        const localIsAhead =
          merged.currentLevel > remote.currentLevel ||
          merged.completedLevels.length > remote.completedLevels.length ||
          merged.totalXP > remote.totalXP;
        if (localIsAhead) {
          pushProgressToServer(merged);
        }
      })
      .catch(() => {});
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    pushProgressToServer(newProgress);
  };

  const completeLevel = (levelId: number) => {
    const newProgress = { ...progress };

    if (!newProgress.completedLevels.includes(levelId)) {
      newProgress.completedLevels.push(levelId);
      newProgress.totalXP += 100;

      if (levelId === newProgress.currentLevel) {
        newProgress.currentLevel = levelId + 1;
      }

      if (levelId === 10 && !newProgress.badges.includes('ssh_master')) newProgress.badges.push('ssh_master');
      if (levelId === 20 && !newProgress.badges.includes('automation_expert')) newProgress.badges.push('automation_expert');
      if (levelId === 30 && !newProgress.badges.includes('terminal_warrior')) newProgress.badges.push('terminal_warrior');
      if (levelId === 40 && !newProgress.badges.includes('sysadmin')) newProgress.badges.push('sysadmin');
      if (levelId === 50 && !newProgress.badges.includes('network_guru')) newProgress.badges.push('network_guru');
      if (levelId === 60 && !newProgress.badges.includes('forensic_analyst')) newProgress.badges.push('forensic_analyst');
      if (levelId === 70 && !newProgress.badges.includes('recon_specialist')) newProgress.badges.push('recon_specialist');
      if (levelId === 80 && !newProgress.badges.includes('hacker')) newProgress.badges.push('hacker');
      if (levelId === 90 && !newProgress.badges.includes('script_master')) newProgress.badges.push('script_master');
      if (levelId === 100 && !newProgress.badges.includes('ctf_champion')) newProgress.badges.push('ctf_champion');

      saveProgress(newProgress);
    }
  };

  const completeScenarioStep = (scenarioId: number, stepId: number, xpReward?: number) => {
    const newProgress = { ...progress };
    const steps = newProgress.scenarioSteps[scenarioId] ?? [];

    if (!steps.includes(stepId)) {
      newProgress.scenarioSteps = {
        ...newProgress.scenarioSteps,
        [scenarioId]: [...steps, stepId],
      };
      newProgress.totalXP += xpReward ?? 50;
      saveProgress(newProgress);
    }
  };

  const completeScenario = (scenarioId: number, badge?: string, xpReward?: number) => {
    const newProgress = { ...progress };

    if (!newProgress.completedScenarios.includes(scenarioId)) {
      newProgress.completedScenarios.push(scenarioId);
      newProgress.totalXP += xpReward ?? 500;

      if (badge && !newProgress.badges.includes(badge)) {
        newProgress.badges.push(badge);
      }

      saveProgress(newProgress);
    }
  };

  const resetProgress = () => {
    const newProgress: UserProgress = {
      completedLevels: [],
      currentLevel: 1,
      totalXP: 0,
      badges: [],
      completedScenarios: [],
      scenarioSteps: {},
    };
    saveProgress(newProgress);
  };

  const isLevelUnlocked = (levelId: number) => levelId <= progress.currentLevel;
  const isLevelCompleted = (levelId: number) => progress.completedLevels.includes(levelId);
  const isScenarioUnlocked = (_scenarioId?: number) => progress.currentLevel >= 15 || progress.completedLevels.length >= 10;
  const isScenarioCompleted = (scenarioId: number) => progress.completedScenarios.includes(scenarioId);
  const getScenarioProgress = (scenarioId: number, totalSteps: number): number => {
    const done = (progress.scenarioSteps[scenarioId] ?? []).length;
    return totalSteps > 0 ? Math.round((done / totalSteps) * 100) : 0;
  };

  return {
    progress,
    completeLevel,
    completeScenarioStep,
    completeScenario,
    resetProgress,
    isLevelUnlocked,
    isLevelCompleted,
    isScenarioUnlocked,
    isScenarioCompleted,
    getScenarioProgress,
  };
}
