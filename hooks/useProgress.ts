'use client';

import { useState, useEffect } from 'react';

export interface UserProgress {
  completedLevels: number[];
  currentLevel: number;
  totalXP: number;
  badges: string[];
}

const STORAGE_KEY = 'edulinux_progress';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>({
    completedLevels: [],
    currentLevel: 1,
    totalXP: 0,
    badges: []
  });

  // Charger la progression depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // Sauvegarder la progression
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const completeLevel = (levelId: number) => {
    const newProgress = { ...progress };
    
    if (!newProgress.completedLevels.includes(levelId)) {
      newProgress.completedLevels.push(levelId);
      newProgress.totalXP += 100; // 100 XP par niveau
      
      // Débloquer le niveau suivant
      if (levelId === newProgress.currentLevel) {
        newProgress.currentLevel = levelId + 1;
      }

      // Attribuer des badges
      if (levelId === 10 && !newProgress.badges.includes('ssh_master')) {
        newProgress.badges.push('ssh_master');
      }
      if (levelId === 20 && !newProgress.badges.includes('automation_expert')) {
        newProgress.badges.push('automation_expert');
      }
      if (levelId === 30 && !newProgress.badges.includes('terminal_warrior')) {
        newProgress.badges.push('terminal_warrior');
      }

      saveProgress(newProgress);
    }
  };

  const resetProgress = () => {
    const newProgress: UserProgress = {
      completedLevels: [],
      currentLevel: 1,
      totalXP: 0,
      badges: []
    };
    saveProgress(newProgress);
  };

  const isLevelUnlocked = (levelId: number) => {
    return levelId <= progress.currentLevel;
  };

  const isLevelCompleted = (levelId: number) => {
    return progress.completedLevels.includes(levelId);
  };

  return {
    progress,
    completeLevel,
    resetProgress,
    isLevelUnlocked,
    isLevelCompleted
  };
}

