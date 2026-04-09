'use client';

import { useState, useEffect } from 'react';

export interface UserProgress {
  completedLevels: number[];
  currentLevel: number;
  totalXP: number;
  badges: string[];
  completedScenarios: number[];
  scenarioSteps: Record<number, number[]>; // scenarioId -> completed step ids
}

const STORAGE_KEY = 'edulinux_progress';

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress({
          completedLevels: parsed.completedLevels ?? [],
          currentLevel: parsed.currentLevel ?? 1,
          totalXP: parsed.totalXP ?? 0,
          badges: parsed.badges ?? [],
          completedScenarios: parsed.completedScenarios ?? [],
          scenarioSteps: parsed.scenarioSteps ?? {},
        });
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const completeLevel = (levelId: number) => {
    const newProgress = { ...progress };

    if (!newProgress.completedLevels.includes(levelId)) {
      newProgress.completedLevels.push(levelId);
      newProgress.totalXP += 100;

      if (levelId === newProgress.currentLevel) {
        newProgress.currentLevel = levelId + 1;
      }

      // Badges niveaux classiques
      if (levelId === 10 && !newProgress.badges.includes('ssh_master')) {
        newProgress.badges.push('ssh_master');
      }
      if (levelId === 20 && !newProgress.badges.includes('automation_expert')) {
        newProgress.badges.push('automation_expert');
      }
      if (levelId === 30 && !newProgress.badges.includes('terminal_warrior')) {
        newProgress.badges.push('terminal_warrior');
      }
      // Badges nouveaux chapitres
      if (levelId === 40 && !newProgress.badges.includes('sysadmin')) {
        newProgress.badges.push('sysadmin');
      }
      if (levelId === 50 && !newProgress.badges.includes('network_guru')) {
        newProgress.badges.push('network_guru');
      }
      if (levelId === 60 && !newProgress.badges.includes('forensic_analyst')) {
        newProgress.badges.push('forensic_analyst');
      }
      if (levelId === 70 && !newProgress.badges.includes('recon_specialist')) {
        newProgress.badges.push('recon_specialist');
      }
      if (levelId === 80 && !newProgress.badges.includes('hacker')) {
        newProgress.badges.push('hacker');
      }
      if (levelId === 90 && !newProgress.badges.includes('script_master')) {
        newProgress.badges.push('script_master');
      }
      if (levelId === 100 && !newProgress.badges.includes('ctf_champion')) {
        newProgress.badges.push('ctf_champion');
      }

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

  const isLevelUnlocked = (levelId: number) => {
    return levelId <= progress.currentLevel;
  };

  const isLevelCompleted = (levelId: number) => {
    return progress.completedLevels.includes(levelId);
  };

  const isScenarioUnlocked = (scenarioId: number) => {
    // Scénarios débloqués après le niveau 15
    return progress.currentLevel >= 15 || progress.completedLevels.length >= 10;
  };

  const isScenarioCompleted = (scenarioId: number) => {
    return progress.completedScenarios.includes(scenarioId);
  };

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
