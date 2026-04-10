'use client';

import { use, useState, useCallback, useEffect, useRef } from 'react';
import { levels, getDifficultyEmoji } from '@/data/levels';
import { useProgress } from '@/hooks/useProgress';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TutorialOverlay, { TutorialStep } from '@/components/TutorialOverlay';
import UserMenu from '@/components/UserMenu';

const RealTerminal = dynamic(() => import('@/components/RealTerminal'), { ssr: false });

const DIFF_LABEL: Record<string, string> = {
  beginner: 'DÉBUTANT', intermediate: 'INTERMÉDIAIRE', advanced: 'AVANCÉ',
};
const DIFF_COLOR: Record<string, string> = {
  beginner: 'text-[#a3e635]', intermediate: 'text-yellow-400', advanced: 'text-red-400',
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: 'level-objective',
    title: "L'objectif",
    description: "Commence toujours par lire l'objectif. Il décrit exactement ce que tu dois accomplir pour valider le niveau.",
  },
  {
    target: 'level-validation',
    title: "À valider",
    description: "Ces étapes s'affichent en vert au fur et à mesure de ta progression. Accomplis-les dans l'ordre indiqué.",
  },
  {
    target: 'level-hints',
    title: "Les indices",
    description: "Bloqué ? Ouvre les indices. Ils te guident sans tout révéler — entraîne-toi à chercher avant de les consulter.",
  },
  {
    target: 'level-notes',
    title: "Tes notes",
    description: "Prends des notes ici : commandes découvertes, flags, astuces. Elles sont sauvegardées automatiquement par niveau.",
  },
  {
    target: 'level-terminal',
    title: "Le terminal",
    description: "Tape tes commandes Linux ici. Utilise Tab pour l'autocomplétion et ↑ pour naviguer dans l'historique.",
  },
];

const MOBILE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: 'mobile-level-strip',
    title: "L'objectif du niveau",
    description: "Le titre et l'objectif du niveau sont affichés ici. Lis l'objectif avant de commencer.",
  },
  {
    target: 'mobile-level-info-btn',
    title: "Détails & notes",
    description: "Appuie ici pour voir la description complète, les indices et prendre des notes. Reviens au terminal en fermant.",
  },
  {
    target: 'level-terminal',
    title: "Le terminal",
    description: "Tape tes commandes Linux ici. Utilise Tab pour l'autocomplétion et ↑ pour l'historique.",
  },
];

export default function LevelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const levelId = parseInt(id);
  const level = levels.find(l => l.id === levelId);
  const { completeLevel, isLevelUnlocked, loaded } = useProgress();
  const router = useRouter();

  const [showHints, setShowHints] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'notes'>('info');
  const [notes, setNotes] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWRef = useRef(300);

  // Load notes — localStorage puis sync serveur
  useEffect(() => {
    const saved = localStorage.getItem(`notes-level-${levelId}`);
    if (saved) setNotes(saved);
    fetch(`/api/notes?context=level-${levelId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const note = data?.notes?.[0];
        if (note?.content) {
          setNotes(note.content);
          localStorage.setItem(`notes-level-${levelId}`, note.content);
        }
      })
      .catch(() => {});
  }, [levelId]);

  // Auto-show tutorial on first visit
  useEffect(() => {
    const seen = localStorage.getItem('tutorial-level-seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
        localStorage.setItem('tutorial-level-seen', '1');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Resizable sidebar (desktop)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = e.clientX - startXRef.current;
      setSidebarWidth(Math.max(220, Math.min(560, startWRef.current + delta)));
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

  const handleAllComplete = useCallback(() => {
    completeLevel(levelId);
    if (levelId < levels.length) router.push(`/levels/${levelId + 1}`);
    else router.push('/levels');
  }, [completeLevel, levelId, router]);

  const notesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNotes = (v: string) => {
    setNotes(v);
    localStorage.setItem(`notes-level-${levelId}`, v);
    if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    notesDebounceRef.current = setTimeout(() => {
      fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: `level-${levelId}`, content: v }),
      }).catch(() => {});
    }, 1500);
  };

  if (!level) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center font-mono">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">Niveau introuvable</p>
          <Link href="/levels" className="text-[#a3e635] hover:underline text-sm">← niveaux</Link>
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

  if (!isLevelUnlocked(levelId)) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center font-mono">
        <div className="text-center max-w-sm px-6">
          <p className="text-gray-500 text-4xl mb-4">○</p>
          <p className="text-white font-bold mb-2">Niveau verrouillé</p>
          <p className="text-gray-500 text-sm mb-6">Complète les niveaux précédents d&apos;abord.</p>
          <Link href="/levels" className="border border-[#a3e635]/40 text-[#a3e635] hover:bg-[#a3e635] hover:text-black px-5 py-2 rounded text-sm font-bold transition-all">
            ← niveaux
          </Link>
        </div>
      </div>
    );
  }

  // Info panel — shared between desktop sidebar and mobile overlay
  const infoPanel = (
    <div className="space-y-4 p-5">
      {/* Title */}
      <div>
        <span className="text-[#a3e635] text-xs tracking-widest font-bold">
          {String(levelId).padStart(2, '0')}
        </span>
        <h1 className="text-lg font-bold text-white mt-1">{level.title}</h1>
        <p className="text-gray-600 text-xs mt-0.5">{level.category}</p>
      </div>

      {/* Objective */}
      <div data-tutorial="level-objective" className="border border-[#a3e635]/20 bg-[#a3e635]/5 rounded p-3">
        <p className="text-[#a3e635] text-xs font-bold uppercase tracking-widest mb-1">Objectif</p>
        <p className="text-gray-200 text-sm leading-relaxed">{level.objective}</p>
      </div>

      {/* Description */}
      <div className="border border-white/5 rounded p-3">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1.5">Description</p>
        <p className="text-gray-300 text-sm leading-relaxed">{level.description}</p>
      </div>

      {/* Contexte */}
      {level.story && (
        <div className="border border-white/5 rounded p-3">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1.5">Contexte</p>
          <p className="text-gray-400 text-sm italic leading-relaxed">{level.story}</p>
        </div>
      )}

      {/* Commandes */}
      <div>
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-2">Commandes</p>
        <div className="flex flex-wrap gap-1.5">
          {level.commands.map((cmd, i) => (
            <span key={i} className="bg-black border border-white/8 text-[#a3e635] text-xs px-2 py-0.5 rounded">
              {cmd}
            </span>
          ))}
        </div>
      </div>

      {/* Validations */}
      <div data-tutorial="level-validation" className="border border-[#a3e635]/40 bg-[#a3e635]/5 rounded-lg p-3">
        <p className="text-[#a3e635] text-xs font-bold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <span className="text-[10px]">◉</span> À valider
        </p>
        <ul className="space-y-2">
          {level.validation.map((rule, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs">
              <span className="w-4 h-4 rounded-full border border-white/25 flex-shrink-0 mt-0.5 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </span>
              <span className="text-gray-100 leading-relaxed">{rule.description || rule.value}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Hints */}
      {level.hints && level.hints.length > 0 && (
        <div data-tutorial="level-hints">
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-gray-600 text-xs font-bold uppercase tracking-widest hover:text-gray-400 transition-colors flex items-center gap-1.5 w-full text-left"
          >
            <span>{showHints ? '▾' : '▸'}</span> Indices ({level.hints.length})
          </button>
          {showHints && (
            <ul className="mt-2 space-y-1.5 pl-3 border-l border-white/5">
              {level.hints.map((hint, i) => (
                <li key={i} className="text-xs text-gray-500 leading-relaxed">{hint}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  // Notes panel
  const notesPanel = (
    <div className="p-5 flex flex-col h-full">
      <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-3">
        Notes — Niveau {String(levelId).padStart(2, '0')}
      </p>
      <textarea
        value={notes}
        onChange={e => handleNotes(e.target.value)}
        placeholder={`Tes notes pour ce niveau...\n\nExemples :\n- commandes utiles\n- flags trouvés\n- idées à tester`}
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

      {/* Nav */}
      <nav className="border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Link href="/levels" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-2 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span className="hidden sm:inline">niveaux</span>
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <UserMenu />
          <button
            onClick={() => setShowTutorial(true)}
            className="text-gray-600 hover:text-[#a3e635] border border-white/8 hover:border-[#a3e635]/30 px-2.5 py-1 rounded text-xs transition-all"
            title="Revoir le tutoriel"
          >
            ? Tuto
          </button>
          <span className={DIFF_COLOR[level.difficulty]}>
            {getDifficultyEmoji(level.difficulty)}
            <span className="hidden sm:inline ml-1">{DIFF_LABEL[level.difficulty]}</span>
          </span>
          <span>
            <span className="text-white font-bold">{String(levelId).padStart(2, '0')}</span>
            <span className="text-gray-600">/{String(levels.length).padStart(2, '0')}</span>
          </span>
        </div>
      </nav>

      {/* Mobile compact strip */}
      <div className="lg:hidden border-b border-white/5 bg-[#060a10] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div data-tutorial="mobile-level-strip" className="min-w-0 mr-3">
          <p className="text-white text-sm font-bold truncate leading-tight">{level.title}</p>
          <p className="text-[#a3e635] text-xs truncate mt-0.5">{level.objective}</p>
        </div>
        <button
          data-tutorial="mobile-level-info-btn"
          onClick={() => setShowMobileInfo(true)}
          className="flex-shrink-0 border border-white/10 text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded transition-colors"
        >
          Info
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar — desktop only, resizable */}
        <div
          className="hidden lg:flex flex-col border-r border-white/5 overflow-hidden flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          {/* Tab bar */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-widest transition-colors ${
                activeTab === 'info' ? 'text-white border-b-2 border-[#a3e635]' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              Info
            </button>
            <button
              data-tutorial="level-notes"
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
            {activeTab === 'info' ? infoPanel : notesPanel}
          </div>
        </div>

        {/* Resize handle — desktop only */}
        <div
          className="hidden lg:block w-1 cursor-col-resize flex-shrink-0 hover:bg-[#a3e635]/20 transition-colors group"
          onMouseDown={handleResizeStart}
        />

        {/* Terminal */}
        <div data-tutorial="level-terminal" className="flex-1 min-w-0 overflow-hidden p-2 lg:p-3">
          <RealTerminal
            key={levelId}
            id={levelId}
            kind="level"
            fileSystem={level.fileSystem as Record<string, unknown>}
            validations={level.validation}
            hints={level.hints}
            onAllComplete={handleAllComplete}
          />
        </div>
      </div>

      {/* Mobile info overlay */}
      {showMobileInfo && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0a0e17] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 flex-shrink-0 bg-[#060a10]">
            <div>
              <span className="text-[#a3e635] text-xs font-bold tracking-widest">
                {String(levelId).padStart(2, '0')}
              </span>
              <span className="text-white font-bold text-sm ml-2">{level.title}</span>
            </div>
            <button
              onClick={() => setShowMobileInfo(false)}
              className="text-gray-500 hover:text-white text-lg leading-none ml-4"
            >
              ✕
            </button>
          </div>
          {/* Tabs */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-widest transition-colors ${
                activeTab === 'info' ? 'text-white border-b-2 border-[#a3e635]' : 'text-gray-600'
              }`}
            >
              Info
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
            {activeTab === 'info' ? infoPanel : notesPanel}
          </div>
        </div>
      )}
    </div>
  );
}
