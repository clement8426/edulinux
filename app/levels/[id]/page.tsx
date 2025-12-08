'use client';

import { use, useState } from 'react';
import { levels, getDifficultyEmoji } from '@/data/levels';
import { useProgress } from '@/hooks/useProgress';
import Terminal from '@/components/Terminal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LevelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const levelId = parseInt(resolvedParams.id);
  const level = levels.find(l => l.id === levelId);
  const { completeLevel, isLevelUnlocked } = useProgress();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-white mb-4">❌ Niveau introuvable</h1>
          <Link href="/levels" className="text-blue-400 hover:underline">
            ← Retour aux niveaux
          </Link>
        </div>
      </div>
    );
  }

  if (!isLevelUnlocked(levelId)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl text-white mb-4">Niveau verrouillé</h1>
          <p className="text-gray-400 mb-6">Tu dois compléter les niveaux précédents d'abord.</p>
          <Link 
            href="/levels"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            ← Retour aux niveaux
          </Link>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    completeLevel(levelId);
    setShowSuccess(true);
  };

  const goToNextLevel = () => {
    if (levelId < levels.length) {
      router.push(`/levels/${levelId + 1}`);
    } else {
      router.push('/levels');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Link 
            href="/levels"
            className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span>Tous les niveaux</span>
          </Link>
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-cyan-500/30">
            <span className="text-cyan-300 text-sm font-semibold">
              Niveau {levelId} / {levels.length}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Level Info */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 shadow-2xl overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl w-16 h-16 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/50">
                {levelId}
              </div>
              <div>
                <div className="text-xs text-cyan-300 font-semibold mb-1">
                  {getDifficultyEmoji(level.difficulty)} {level.difficulty.toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  {level.title}
                </h1>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm shadow-lg">
                <h3 className="text-cyan-300 font-bold mb-3 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span>Objectif</span>
                </h3>
                <p className="text-white text-sm leading-relaxed">{level.objective}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                <h3 className="text-gray-200 font-bold mb-3 flex items-center gap-2">
                  <span className="text-xl">📖</span>
                  <span>Description</span>
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{level.description}</p>
              </div>

              {level.story && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm shadow-lg">
                  <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2">
                    <span className="text-xl">📜</span>
                    <span>Contexte</span>
                  </h3>
                  <p className="text-gray-200 text-sm italic leading-relaxed">{level.story}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-cyan-300 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span>Commandes clés</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {level.commands.map((cmd, i) => (
                  <span 
                    key={i}
                    className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 text-sm px-4 py-2 rounded-lg font-mono border border-cyan-500/30 font-semibold shadow-md"
                  >
                    {cmd}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-green-300 font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span>Validations</span>
              </h3>
              <ul className="space-y-3">
                {level.validation.map((rule, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                    <span className="text-yellow-400 font-bold text-lg">→</span>
                    <span className="flex-1">{rule.description || rule.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Panel - Terminal */}
          <div className="lg:col-span-2">
            <Terminal level={level} onSuccess={handleSuccess} />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-green-500/50 shadow-2xl shadow-green-500/20 animate-bounce-in">
            <div className="text-center">
              <div className="text-7xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                Niveau Complété !
              </h2>
              <p className="text-gray-300 mb-6 text-lg">
                Tu as maîtrisé : <span className="text-cyan-400 font-bold">{level.title}</span>
              </p>
              
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 mb-6 border border-yellow-500/30">
                <div className="text-yellow-400 font-bold text-3xl mb-3">+100 XP</div>
                {levelId === 10 && (
                  <div className="text-cyan-400 font-semibold text-lg">🔑 Badge débloqué : SSH Master</div>
                )}
                {levelId === 20 && (
                  <div className="text-purple-400 font-semibold text-lg">⚙️ Badge débloqué : Automation Expert</div>
                )}
                {levelId === 30 && (
                  <div className="text-red-400 font-semibold text-lg">👑 Badge débloqué : Terminal Warrior</div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/levels')}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  📋 Niveaux
                </button>
                {levelId < levels.length && (
                  <button
                    onClick={goToNextLevel}
                    className="flex-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/50"
                  >
                    Suivant →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

