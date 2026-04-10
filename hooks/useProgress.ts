'use client';

import { useState, useEffect, useRef } from 'react';

export interface UserProgress {
  completedLevels: number[];
  currentLevel: number;
  totalXP: number;
  badges: string[];
  completedScenarios: number[];
  scenarioSteps: Record<number, number[]>;
}

const EMPTY: UserProgress = {
  completedLevels: [],
  currentLevel: 1,
  totalXP: 0,
  badges: [],
  completedScenarios: [],
  scenarioSteps: {},
};

async function fetchProgress(): Promise<UserProgress | null> {
  try {
    const res = await fetch('/api/progress');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.progress) return null;
    const p = data.progress;
    return {
      completedLevels:   p.completed_levels   ?? [],
      currentLevel:      p.current_level       ?? 1,
      totalXP:           p.total_xp            ?? 0,
      badges:            p.badges              ?? [],
      completedScenarios: p.completed_scenarios ?? [],
      scenarioSteps:     p.scenario_steps      ?? {},
    };
  } catch {
    return null;
  }
}

async function pushProgress(progress: UserProgress) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });
  } catch { /* silencieux */ }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const latestRef = useRef<UserProgress>(EMPTY);

  useEffect(() => {
    fetchProgress().then(remote => {
      const p = remote ?? EMPTY;
      setProgress(p);
      latestRef.current = p;
      setLoaded(true);
    });
  }, []);

  // Met à jour l'état ET pousse au serveur
  const save = (next: UserProgress) => {
    setProgress(next);
    latestRef.current = next;
    pushProgress(next);
  };

  const completeLevel = (levelId: number) => {
    const p = { ...latestRef.current };
    if (p.completedLevels.includes(levelId)) return;

    p.completedLevels = [...p.completedLevels, levelId];
    p.totalXP += 100;
    if (levelId === p.currentLevel) p.currentLevel = levelId + 1;

    const BADGES: Record<number, string> = {
      10: 'ssh_master', 20: 'automation_expert', 30: 'terminal_warrior',
      40: 'sysadmin',   50: 'network_guru',      60: 'forensic_analyst',
      70: 'recon_specialist', 80: 'hacker', 90: 'script_master', 100: 'ctf_champion',
    };
    if (BADGES[levelId] && !p.badges.includes(BADGES[levelId])) {
      p.badges = [...p.badges, BADGES[levelId]];
    }
    save(p);
  };

  const completeScenarioStep = (scenarioId: number, stepId: number, xpReward = 50) => {
    const p = { ...latestRef.current };
    const steps = p.scenarioSteps[scenarioId] ?? [];
    if (steps.includes(stepId)) return;
    p.scenarioSteps = { ...p.scenarioSteps, [scenarioId]: [...steps, stepId] };
    p.totalXP += xpReward;
    save(p);
  };

  const completeScenario = (scenarioId: number, badge?: string, xpReward = 500) => {
    const p = { ...latestRef.current };
    if (p.completedScenarios.includes(scenarioId)) return;
    p.completedScenarios = [...p.completedScenarios, scenarioId];
    p.totalXP += xpReward;
    if (badge && !p.badges.includes(badge)) p.badges = [...p.badges, badge];
    save(p);
  };

  const resetProgress = () => save({ ...EMPTY });

  const isLevelUnlocked    = (levelId: number)   => levelId <= progress.currentLevel;
  const isLevelCompleted   = (levelId: number)   => progress.completedLevels.includes(levelId);
  const isScenarioUnlocked = (_id?: number)       => progress.currentLevel >= 15 || progress.completedLevels.length >= 10;
  const isScenarioCompleted = (id: number)        => progress.completedScenarios.includes(id);
  const getScenarioProgress = (id: number, total: number) => {
    const done = (progress.scenarioSteps[id] ?? []).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  return {
    progress,
    loaded,
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
