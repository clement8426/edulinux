'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { scenarios, getScenarioCategoryIcon, getScenarioCategoryLabel, getScenarioCategoryColor } from '@/data/scenarios';
import { useProgress } from '@/hooks/useProgress';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RealTerminal = dynamic(() => import('@/components/RealTerminal'), { ssr: false });

export default function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const scenarioId = parseInt(id);
  const scenario = scenarios.find(s => s.id === scenarioId);
  const { completeScenarioStep, completeScenario, isScenarioUnlocked, progress } = useProgress();
  const router = useRouter();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepsDone, setStepsDone] = useState<Set<number>>(new Set());
  const [showBriefing, setShowBriefing] = useState(true);
  const [stepAllDone, setStepAllDone] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);

  useEffect(() => {
    if (!scenario) return;
    const saved = progress.scenarioSteps[scenarioId] ?? [];
    setStepsDone(new Set(saved));
    const firstIncomplete = scenario.steps.findIndex(s => !saved.includes(s.id));
    setCurrentStepIdx(firstIncomplete >= 0 ? firstIncomplete : 0);
    // Scénario déjà complété → retour à la liste
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center font-mono">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">Scénario introuvable</p>
          <Link href="/scenarios" className="text-[#a3e635] hover:underline text-sm">← scénarios</Link>
        </div>
      </div>
    );
  }

  if (!isScenarioUnlocked(scenarioId)) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center font-mono">
        <div className="text-center max-w-sm">
          <p className="text-gray-500 text-4xl mb-4">○</p>
          <p className="text-white font-bold mb-2">Scénario verrouillé</p>
          <p className="text-gray-500 text-sm mb-6">Complète au moins 10 niveaux pour accéder aux scénarios.</p>
          <Link href="/levels" className="border border-[#a3e635]/40 text-[#a3e635] hover:bg-[#a3e635] hover:text-black px-5 py-2 rounded text-sm font-bold transition-all">
            → niveaux
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = scenario.steps[currentStepIdx];
  const totalSteps = scenario.steps.length;
  const progressPct = Math.round((stepsDone.size / totalSteps) * 100);
  const nextStepIdx = currentStepIdx + 1 < totalSteps ? currentStepIdx + 1 : null;
  const nextStep = nextStepIdx !== null ? scenario.steps[nextStepIdx] : null;

  const handleStepAllComplete = useCallback(() => {
    const newDone = new Set(stepsDone);
    newDone.add(currentStep.id);
    setStepsDone(newDone);
    completeScenarioStep(scenarioId, currentStep.id, Math.round(scenario.xpReward / totalSteps));
    setStepAllDone(true);

    // Scénario terminé → redirige directement (l'utilisateur a déjà tapé "ok")
    if (newDone.size === totalSteps) {
      completeScenario(scenarioId, scenario.badge, scenario.xpReward);
      router.push('/scenarios');
    }
  }, [stepsDone, currentStep.id, completeScenarioStep, scenarioId, scenario, totalSteps, completeScenario, router]);

  const handleNextStep = useCallback(() => {
    if (nextStepIdx === null) return;
    setCurrentStepIdx(nextStepIdx);
    setStepAllDone(false);
    setTerminalKey(k => k + 1);
  }, [nextStepIdx]);

  const jumpToStep = useCallback((idx: number) => {
    if (!stepsDone.has(scenario.steps[idx].id) && idx !== currentStepIdx) return;
    setCurrentStepIdx(idx);
    setStepAllDone(stepsDone.has(scenario.steps[idx].id));
    setTerminalKey(k => k + 1);
  }, [stepsDone, scenario.steps, currentStepIdx]);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-mono flex flex-col">

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Link href="/scenarios" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-2 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          scénarios
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <span className={`px-2 py-0.5 rounded border text-xs ${getScenarioCategoryColor(scenario.category)}`}>
            {getScenarioCategoryIcon(scenario.category)} {getScenarioCategoryLabel(scenario.category)}
          </span>
          <span className="text-gray-600">
            étape <span className="text-white font-bold">{currentStepIdx + 1}</span> / {totalSteps}
          </span>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5 flex-shrink-0">
        <div
          className="h-full bg-[#a3e635] transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main */}
      <div className="flex-1 grid lg:grid-cols-[300px_1fr] overflow-hidden">

        {/* Left panel */}
        <div className="border-r border-white/5 overflow-y-auto p-5 space-y-4">

          {/* Scenario title */}
          <div>
            <h1 className="text-base font-bold text-white">{scenario.title}</h1>
            <p className="text-gray-600 text-xs mt-0.5">{scenario.description}</p>
            <div className="flex gap-3 mt-2 text-xs text-gray-600">
              <span className="text-[#a3e635]">+{scenario.xpReward} XP</span>
              <span>⏱ {scenario.duration}</span>
            </div>
          </div>

          {/* Briefing (collapsible) */}
          <div className="border border-white/5 rounded overflow-hidden">
            <button
              onClick={() => setShowBriefing(!showBriefing)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/2 transition-colors"
            >
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                📋 Briefing mission
              </span>
              <span className="text-gray-600 text-xs">{showBriefing ? '▾' : '▸'}</span>
            </button>
            {showBriefing && (
              <div className="px-4 pb-4">
                <pre className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap bg-black/20 rounded p-3">
                  {scenario.context}
                </pre>
              </div>
            )}
          </div>

          {/* Steps nav */}
          <div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-2">Étapes</p>
            <div className="space-y-1.5">
              {scenario.steps.map((step, i) => {
                const done = stepsDone.has(step.id);
                const active = i === currentStepIdx;
                return (
                  <button
                    key={step.id}
                    onClick={() => jumpToStep(i)}
                    disabled={!done && !active}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-all ${
                      active
                        ? 'bg-[#a3e635]/10 border border-[#a3e635]/30 text-white'
                        : done
                        ? 'text-gray-400 hover:bg-white/5 cursor-pointer'
                        : 'text-gray-700 cursor-default'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      done    ? 'bg-[#a3e635]/20 text-[#a3e635]'
                      : active ? 'bg-white/10 text-white'
                               : 'bg-white/5 text-gray-700'
                    }`}>
                      {done ? '✓' : i + 1}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current step details */}
          <div className="border border-white/5 rounded p-4 space-y-3">
            <div>
              <p className="text-white text-sm font-bold">{currentStep.title}</p>
              <p className="text-gray-600 text-xs mt-0.5">Étape {currentStepIdx + 1} sur {totalSteps}</p>
            </div>
            <div className="border border-[#a3e635]/20 bg-[#a3e635]/5 rounded p-3">
              <p className="text-[#a3e635] text-xs font-bold uppercase tracking-widest mb-1">Objectif</p>
              <p className="text-gray-200 text-xs leading-relaxed">{currentStep.objective}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-1.5">À valider</p>
              <ul className="space-y-1">
                {currentStep.validation.map((v, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                    <span className="text-[#a3e635] flex-shrink-0">›</span>
                    {v.description}
                  </li>
                ))}
              </ul>
            </div>
            {currentStep.hints.length > 0 && (
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-1.5">Indices</p>
                <ul className="space-y-1">
                  {currentStep.hints.map((h, i) => (
                    <li key={i} className="text-xs text-gray-500 leading-relaxed">
                      <span className="text-gray-700">{i + 1}.</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Next step button (when step complete, no more steps to show in terminal bar) */}
          {stepAllDone && nextStep && (
            <button
              onClick={handleNextStep}
              className="w-full bg-[#a3e635] text-black font-bold py-2.5 rounded text-sm hover:bg-[#bef264] transition-colors"
            >
              {nextStep.title} →
            </button>
          )}
        </div>

        {/* Real Terminal */}
        <div className="overflow-hidden p-3">
          <RealTerminal
            key={`${scenarioId}-${currentStepIdx}-${terminalKey}`}
            id={scenarioId * 100 + currentStep.id}
            kind="scenario"
            fileSystem={currentStep.fileSystem as Record<string, unknown> ?? {}}
            validations={currentStep.validation}
            hints={currentStep.hints}
            onAllComplete={handleStepAllComplete}
            onNextStep={nextStep ? handleNextStep : undefined}
            nextStepData={nextStep ? {
              fileSystem: nextStep.fileSystem as Record<string, unknown> ?? {},
              validations: nextStep.validation,
            } : undefined}
          />
        </div>
      </div>

    </div>
  );
}
