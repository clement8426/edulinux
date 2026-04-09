'use client';

import { use, useState, useCallback } from 'react';
import { levels, getDifficultyEmoji } from '@/data/levels';
import { useProgress } from '@/hooks/useProgress';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RealTerminal = dynamic(() => import('@/components/RealTerminal'), { ssr: false });

const DIFF_LABEL: Record<string, string> = {
  beginner: 'DÉBUTANT', intermediate: 'INTERMÉDIAIRE', advanced: 'AVANCÉ',
};
const DIFF_COLOR: Record<string, string> = {
  beginner: 'text-[#a3e635]', intermediate: 'text-yellow-400', advanced: 'text-red-400',
};

const BADGE_MILESTONES: Record<number, string> = {
  10: '🔑 Badge SSH Master débloqué',
  20: '⚙️ Badge Automation Expert débloqué',
  30: '👑 Badge Terminal Warrior débloqué',
  40: '🖥️ Badge Sysadmin débloqué',
  50: '🛰️ Badge Network Guru débloqué',
  60: '🔬 Badge Forensic Analyst débloqué',
  70: '🎯 Badge Recon Specialist débloqué',
  80: '💀 Badge Hacker débloqué',
  90: '📜 Badge Script Master débloqué',
  100: '🏆 Badge CTF Champion débloqué',
};

export default function LevelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const levelId = parseInt(id);
  const level = levels.find(l => l.id === levelId);
  const { completeLevel, isLevelUnlocked } = useProgress();
  const router = useRouter();
  const [showHints, setShowHints] = useState(false);

  // Appelé quand l'utilisateur tape "ok" dans le terminal
  const handleAllComplete = useCallback(() => {
    completeLevel(levelId);
    if (levelId < levels.length) router.push(`/levels/${levelId + 1}`);
    else router.push('/levels');
  }, [completeLevel, levelId, router]);

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

  if (!isLevelUnlocked(levelId)) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center font-mono">
        <div className="text-center max-w-sm">
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

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-mono flex flex-col">

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Link href="/levels" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-2 group">
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          niveaux
        </Link>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className={DIFF_COLOR[level.difficulty]}>
            {getDifficultyEmoji(level.difficulty)} {DIFF_LABEL[level.difficulty]}
          </span>
          <span>
            niveau <span className="text-white font-bold">{String(levelId).padStart(2, '0')}</span>
            {' '}/ {String(levels.length).padStart(2, '0')}
          </span>
        </div>
      </nav>

      {/* Main grid */}
      <div className="flex-1 grid lg:grid-cols-[300px_1fr] overflow-hidden">

        {/* Left panel */}
        <div className="border-r border-white/5 overflow-y-auto p-5 space-y-4">

          {/* Title */}
          <div>
            <span className="text-[#a3e635] text-xs tracking-widest font-bold">
              {String(levelId).padStart(2, '0')}
            </span>
            <h1 className="text-lg font-bold text-white mt-1">{level.title}</h1>
            <p className="text-gray-600 text-xs mt-0.5">{level.category}</p>
          </div>

          {/* Objective */}
          <div className="border border-[#a3e635]/20 bg-[#a3e635]/5 rounded p-3">
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
          <div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-2">À valider</p>
            <ul className="space-y-1.5">
              {level.validation.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-[#a3e635] font-bold mt-0.5 flex-shrink-0">›</span>
                  {rule.description || rule.value}
                </li>
              ))}
            </ul>
          </div>

          {/* Hints (collapsible) */}
          {level.hints && level.hints.length > 0 && (
            <div>
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

        {/* Real Terminal — key prop forces full remount on level change */}
        <div className="overflow-hidden p-3">
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

      {/* Pas de modal — la confirmation se fait directement dans le terminal (tape "ok") */}
    </div>
  );
}
