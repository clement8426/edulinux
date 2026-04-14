'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { scenarios, getScenarioCategoryIcon, getScenarioCategoryLabel, getScenarioCategoryColor } from '@/data/scenarios';
import { useProgress } from '@/hooks/useProgress';
import { useScenarioTimer, getMedalForTime, getMedalEmoji, getMedalColor } from '@/hooks/useScenarioTimer';
import UserMenu from '@/components/UserMenu';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TutorialOverlay, { TutorialStep } from '@/components/TutorialOverlay';

const RealTerminal = dynamic(() => import('@/components/RealTerminal'), { ssr: false });

const MOBILE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: 'mobile-scenario-strip',
    title: "L'étape courante",
    description: "Le titre et l'objectif de l'étape en cours sont affichés ici. Lis bien l'objectif avant d'agir.",
  },
  {
    target: 'mobile-scenario-info-btn',
    title: "Mission & notes",
    description: "Appuie ici pour voir le briefing, les étapes, les indices et prendre des notes. Reviens au terminal en fermant.",
  },
  {
    target: 'scenario-terminal',
    title: "Le terminal",
    description: "Tape tes commandes ici. Chaque étape a son propre environnement avec ses propres fichiers.",
  },
];

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: 'scenario-header',
    title: 'La mission',
    description: "Chaque scénario simule un cas réel (forensic, intrusion, IR…). Lis le briefing pour comprendre le contexte avant d'agir.",
  },
  {
    target: 'scenario-steps',
    title: 'Les étapes',
    description: "Le scénario se déroule en étapes séquentielles. Chaque étape débloque la suivante une fois ses objectifs accomplis.",
  },
  {
    target: 'scenario-objective',
    title: "L'objectif de l'étape",
    description: "Lis l'objectif et la liste de validations avant de commencer. Chaque étape a son propre environnement dans le terminal.",
  },
  {
    target: 'scenario-notes',
    title: 'Tes notes',
    description: "Prends des notes ici : IPs trouvées, mots de passe, flags, commandes utiles. Sauvegardées automatiquement.",
  },
  {
    target: 'scenario-terminal',
    title: 'Le terminal',
    description: "C'est ici que tu travailles. Chaque étape repart d'un environnement propre avec ses propres fichiers.",
  },
];

export default function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const scenarioId = parseInt(id);
  const scenario = scenarios.find(s => s.id === scenarioId);
  const { completeScenarioStep, completeScenario, recordScenarioTime, isScenarioUnlocked, progress, loaded } = useProgress();
  const router = useRouter();

  const { elapsed, formatted: timerFormatted } = useScenarioTimer(scenarioId);
  const [completionMedal, setCompletionMedal] = useState<'gold' | 'silver' | 'bronze' | null | undefined>(undefined);
  const [foundFlags, setFoundFlags] = useState<Set<number>>(new Set());

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepsDone, setStepsDone] = useState<Set<number>>(new Set());
  const [showBriefing, setShowBriefing] = useState(true);
  const [stepAllDone, setStepAllDone] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'mission' | 'notes'>('mission');
  const [notes, setNotes] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWRef = useRef(320);

  useEffect(() => {
    if (!scenario) return;
    const saved = progress.scenarioSteps[scenarioId] ?? [];
    setStepsDone(new Set(saved));
    const firstIncomplete = scenario.steps.findIndex(s => !saved.includes(s.id));
    setCurrentStepIdx(firstIncomplete >= 0 ? firstIncomplete : 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load notes
  useEffect(() => {
    const saved = localStorage.getItem(`notes-scenario-${scenarioId}`);
    if (saved) setNotes(saved);
    fetch(`/api/notes?context=scenario-${scenarioId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const note = data?.notes?.[0];
        if (note?.content) {
          setNotes(note.content);
          localStorage.setItem(`notes-scenario-${scenarioId}`, note.content);
        }
      })
      .catch(() => {});
  }, [scenarioId]);

  // Auto-show tutorial on first visit
  useEffect(() => {
    const seen = localStorage.getItem('tutorial-scenario-seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
        localStorage.setItem('tutorial-scenario-seen', '1');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Resizable sidebar
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = e.clientX - startXRef.current;
      setSidebarWidth(Math.max(220, Math.min(600, startWRef.current + delta)));
    };
    const onUp = () => { resizingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWRef.current = sidebarWidth;
    e.preventDefault();
  };

  // Derived values — with null safety so hooks below can run unconditionally
  const totalSteps = scenario?.steps.length ?? 0;
  const nextStepIdx = currentStepIdx + 1 < totalSteps ? currentStepIdx + 1 : null;
  const nextStep = nextStepIdx !== null ? scenario?.steps[nextStepIdx] ?? null : null;

  // All hooks BEFORE conditional returns
  const handleNextStep = useCallback(() => {
    if (nextStepIdx === null) return;
    setCurrentStepIdx(nextStepIdx);
    setStepAllDone(false);
    // Pas de setTerminalKey ici — la transition est gérée par le message
    // next_step sur le WebSocket existant (pas besoin de remonter le terminal)
  }, [nextStepIdx]);

  const jumpToStep = useCallback((idx: number) => {
    if (!scenario) return;
    if (!stepsDone.has(scenario.steps[idx].id) && idx !== currentStepIdx) return;
    setCurrentStepIdx(idx);
    setStepAllDone(stepsDone.has(scenario.steps[idx].id));
    setTerminalKey(k => k + 1);
  }, [stepsDone, scenario, currentStepIdx]);

  const notesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNotes = (v: string) => {
    setNotes(v);
    localStorage.setItem(`notes-scenario-${scenarioId}`, v);
    if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    notesDebounceRef.current = setTimeout(() => {
      fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: `scenario-${scenarioId}`, content: v }),
      }).catch(() => {});
    }, 1500);
  };

  const handleFlagFound = useCallback((index: number, _flagId: string, _question: string) => {
    setFoundFlags(prev => new Set([...prev, index]));
  }, []);

  // Conditional returns AFTER all hooks
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

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#a3e635]/30 border-t-[#a3e635] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-xs">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!isScenarioUnlocked(scenarioId, scenario?.prerequisites?.completedLevels)) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center font-mono">
        <div className="text-center max-w-sm px-6">
          <p className="text-gray-500 text-4xl mb-4">🔒</p>
          <p className="text-white font-bold mb-2">Scénario verrouillé</p>
          <p className="text-gray-500 text-sm mb-2">{scenario?.prerequisites?.description}</p>
          <p className="text-gray-700 text-xs mb-6">
            {scenario?.prerequisites?.completedLevels.filter((lvlId: number) => !progress.completedLevels.includes(lvlId)).length ?? 0} niveaux restants
          </p>
          <Link href="/levels" className="border border-[#a3e635]/40 text-[#a3e635] hover:bg-[#a3e635] hover:text-black px-5 py-2 rounded text-sm font-bold transition-all">
            → continuer les niveaux
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = scenario.steps[currentStepIdx];
  const progressPct = Math.round((stepsDone.size / totalSteps) * 100);

  const handleStepAllComplete = () => {
    if (stepAllDone) return;
    const newDone = new Set(stepsDone);
    newDone.add(currentStep.id);
    setStepsDone(newDone);
    completeScenarioStep(scenarioId, currentStep.id, Math.round(scenario.xpReward / totalSteps));
    setStepAllDone(true);
    if (newDone.size === totalSteps) {
      // Record time and medal on scenario completion
      const defaultMedals = { gold: 600, silver: 1200, bronze: 2400 };
      const medals = scenario.medals ?? defaultMedals;
      const medal = getMedalForTime(elapsed, medals);
      setCompletionMedal(medal);
      recordScenarioTime(scenarioId, elapsed, medals);
      completeScenario(scenarioId, scenario.badge, scenario.xpReward);
      // Don't auto-redirect — show completion screen first
    }
  };

  // Mission panel content
  const missionPanel = (
    <div className="space-y-4 p-5">
      {/* Scenario header */}
      <div data-tutorial="scenario-header">
        <h1 className="text-base font-bold text-white">{scenario.title}</h1>
        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{scenario.description}</p>
        <div className="flex gap-3 mt-2 text-xs text-gray-600">
          <span className="text-[#a3e635]">+{scenario.xpReward} XP</span>
          <span>⏱ {scenario.duration}</span>
        </div>
      </div>

      {/* Lab targets info (docker labs) */}
      {scenario.labTargets && scenario.labTargets.length > 0 && (
        <div className="border border-blue-400/20 bg-blue-400/3 rounded p-3">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Cibles Lab</p>
          {scenario.labTargets.map(t => (
            <div key={t.name} className="text-xs text-gray-400 mb-1">
              <span className="text-blue-300 font-mono">{t.ip}</span>
              <span className="text-gray-600 mx-1">→</span>
              <span className="text-gray-300 font-mono">{t.name}</span>
              <p className="text-gray-600 ml-0 mt-0.5">{t.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Briefing */}
      <div className="border border-white/5 rounded overflow-hidden">
        <button
          onClick={() => setShowBriefing(!showBriefing)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/2 transition-colors"
        >
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Briefing mission</span>
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

      {/* Steps navigation */}
      <div>
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-2">Étapes</p>
        <div data-tutorial="scenario-steps" className="space-y-1.5">
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
                  done ? 'bg-[#a3e635]/20 text-[#a3e635]'
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
      <div data-tutorial="scenario-objective" className="border border-white/5 rounded p-4 space-y-3">
        <div>
          <p className="text-white text-sm font-bold">{currentStep.title}</p>
          <p className="text-gray-600 text-xs mt-0.5">Étape {currentStepIdx + 1} sur {totalSteps}</p>
        </div>
        <div className="border border-[#a3e635]/20 bg-[#a3e635]/5 rounded p-3">
          <p className="text-[#a3e635] text-xs font-bold uppercase tracking-widest mb-1">Objectif</p>
          <p className="text-gray-200 text-xs leading-relaxed">{currentStep.objective}</p>
        </div>

        {/* Flags to find */}
        {currentStep.flags && currentStep.flags.length > 0 && (
          <div className="border border-yellow-400/20 bg-yellow-400/3 rounded-lg p-3">
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <span>🚩</span> À découvrir
            </p>
            <ul className="space-y-2">
              {currentStep.flags.map((flag, i) => {
                const found = foundFlags.has(i);
                return (
                  <li key={flag.id} className="flex items-start gap-2.5 text-xs">
                    <span className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      found
                        ? 'bg-[#a3e635]/20 border-[#a3e635] text-[#a3e635]'
                        : 'border-yellow-400/30 text-yellow-400/30'
                    }`}>
                      {found ? '✓' : '?'}
                    </span>
                    <span className={`leading-relaxed transition-colors ${found ? 'text-[#a3e635]' : 'text-gray-300'}`}>
                      {flag.question}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

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

      {/* Le passage à l'étape suivante se fait via le bouton dans la barre du terminal */}
      {stepAllDone && nextStep && (
        <div className="border border-[#a3e635]/20 bg-[#a3e635]/5 rounded p-3 text-xs text-[#a3e635]">
          ★ Étape validée — clique sur <span className="font-bold">Étape suivante →</span> dans le terminal
        </div>
      )}
    </div>
  );

  // Notes panel
  const notesPanel = (
    <div className="p-5 flex flex-col h-full">
      <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-3">
        Notes — {scenario.title}
      </p>
      <textarea
        value={notes}
        onChange={e => handleNotes(e.target.value)}
        placeholder={`Tes notes pour ce scénario...\n\nExemples :\n- IPs / ports découverts\n- Mots de passe trouvés\n- Flags collectés\n- Commandes clés`}
        className="flex-1 min-h-[300px] lg:min-h-0 lg:flex-1 w-full bg-black/40 border border-white/8 rounded p-3 text-gray-300 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-[#a3e635]/30 placeholder:text-gray-700 transition-colors"
        spellCheck={false}
      />
      {notes && (
        <p className="text-gray-700 text-xs mt-2 text-right">{notes.length} caractères · sauvegardé</p>
      )}
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#0a0e17] text-white font-mono flex flex-col">
      {/* Tutorial */}
      {showTutorial && (
        <TutorialOverlay steps={TUTORIAL_STEPS} mobileSteps={MOBILE_TUTORIAL_STEPS} onClose={() => setShowTutorial(false)} />
      )}

      {/* Completion overlay */}
      {stepsDone.size === totalSteps && completionMedal !== undefined && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-[#0f1520] border border-white/10 rounded-xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">{getMedalEmoji(completionMedal) || '✅'}</div>
            <h2 className="text-white font-bold text-xl mb-2">Scénario terminé !</h2>
            <p className="text-gray-400 text-sm mb-1">Temps : <span className="text-white font-mono">{timerFormatted}</span></p>
            {completionMedal && (
              <p className={`text-sm font-bold mb-4 ${getMedalColor(completionMedal).split(' ')[0]}`}>
                {getMedalEmoji(completionMedal)} Médaille {completionMedal === 'gold' ? 'Or' : completionMedal === 'silver' ? 'Argent' : 'Bronze'}
              </p>
            )}
            <p className="text-[#a3e635] font-bold mb-4">+{scenario.xpReward} XP</p>
            <button
              onClick={() => router.push('/scenarios')}
              className="w-full bg-[#a3e635] text-black font-bold py-2.5 rounded hover:bg-[#bef264] transition-colors"
            >
              ← Retour aux scénarios
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Link href="/scenarios" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-2 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span className="hidden sm:inline">scénarios</span>
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#a3e635] font-mono text-xs tabular-nums">⏱ {timerFormatted}</span>
          <UserMenu />
          <button
            onClick={() => setShowTutorial(true)}
            className="text-gray-600 hover:text-[#a3e635] border border-white/8 hover:border-[#a3e635]/30 px-2.5 py-1 rounded text-xs transition-all"
            title="Revoir le tutoriel"
          >
            ? Tuto
          </button>
          <span className={`px-2 py-0.5 rounded border text-xs ${getScenarioCategoryColor(scenario.category)}`}>
            {getScenarioCategoryIcon(scenario.category)}
            <span className="hidden sm:inline ml-1">{getScenarioCategoryLabel(scenario.category)}</span>
          </span>
          <span className="text-gray-600">
            <span className="text-white font-bold">{currentStepIdx + 1}</span>/{totalSteps}
          </span>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5 flex-shrink-0">
        <div className="h-full bg-[#a3e635] transition-all duration-700" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Mobile compact strip */}
      <div className="lg:hidden border-b border-white/5 bg-[#060a10] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div data-tutorial="mobile-scenario-strip" className="min-w-0 mr-3">
          <p className="text-white text-sm font-bold truncate leading-tight">{currentStep.title}</p>
          <p className="text-[#a3e635] text-xs truncate mt-0.5">{currentStep.objective}</p>
        </div>
        <button
          data-tutorial="mobile-scenario-info-btn"
          onClick={() => setShowMobileInfo(true)}
          className="flex-shrink-0 border border-white/10 text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded transition-colors"
        >
          Étapes
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar — desktop only, resizable */}
        <div
          className="hidden lg:flex flex-col border-r border-white/5 overflow-hidden flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          {/* Tab bar */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            <button
              onClick={() => setActiveTab('mission')}
              className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-widest transition-colors ${
                activeTab === 'mission' ? 'text-white border-b-2 border-[#a3e635]' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              Mission
            </button>
            <button
              data-tutorial="scenario-notes"
              onClick={() => setActiveTab('notes')}
              className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-widest transition-colors relative ${
                activeTab === 'notes' ? 'text-white border-b-2 border-[#a3e635]' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              Notes
              {notes && <span className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-[#a3e635]" />}
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'mission' ? missionPanel : notesPanel}
          </div>
        </div>

        {/* Resize handle — desktop only */}
        <div
          className="hidden lg:block w-1 cursor-col-resize flex-shrink-0 hover:bg-[#a3e635]/20 transition-colors"
          onMouseDown={handleResizeStart}
        />

        {/* Terminal */}
        <div data-tutorial="scenario-terminal" className="flex-1 min-w-0 overflow-hidden p-2 lg:p-3">
          <RealTerminal
            key={`${scenarioId}-${terminalKey}`}
            id={scenarioId * 100 + currentStep.id}
            kind="scenario"
            fileSystem={currentStep.fileSystem as Record<string, unknown> ?? {}}
            validations={[]}
            flags={currentStep.flags}
            labContainer={scenario.labContainer}
            hints={currentStep.hints}
            onAllComplete={handleStepAllComplete}
            onFlagFound={handleFlagFound}
            onNextStep={nextStep ? handleNextStep : undefined}
            nextStepData={nextStep ? {
              fileSystem: nextStep.fileSystem as Record<string, unknown> ?? {},
              validations: [],
              flags: nextStep.flags,
            } : undefined}
          />
        </div>
      </div>

      {/* Mobile info overlay */}
      {showMobileInfo && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0a0e17] flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 flex-shrink-0 bg-[#060a10]">
            <div className="min-w-0 mr-3">
              <span className={`text-xs px-1.5 py-0.5 rounded border ${getScenarioCategoryColor(scenario.category)}`}>
                {getScenarioCategoryIcon(scenario.category)} {getScenarioCategoryLabel(scenario.category)}
              </span>
              <p className="text-white font-bold text-sm mt-1 truncate">{scenario.title}</p>
            </div>
            <button
              onClick={() => setShowMobileInfo(false)}
              className="flex-shrink-0 text-gray-500 hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>
          {/* Mobile tabs */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            <button
              onClick={() => setActiveTab('mission')}
              className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-widest transition-colors ${
                activeTab === 'mission' ? 'text-white border-b-2 border-[#a3e635]' : 'text-gray-600'
              }`}
            >
              Mission
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-widest transition-colors relative ${
                activeTab === 'notes' ? 'text-white border-b-2 border-[#a3e635]' : 'text-gray-600'
              }`}
            >
              Notes
              {notes && <span className="absolute top-1.5 right-6 w-1.5 h-1.5 rounded-full bg-[#a3e635]" />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'mission' ? missionPanel : notesPanel}
          </div>
        </div>
      )}
    </div>
  );
}
