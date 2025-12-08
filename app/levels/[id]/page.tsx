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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <Link 
            href="/levels"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Tous les niveaux
          </Link>
          <div className="text-gray-400 text-sm">
            Niveau {levelId} / {levels.length}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          {/* Left Panel - Level Info */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6 border border-gray-700 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl">
                {levelId}
              </div>
              <div>
                <div className="text-sm text-gray-400">
                  {getDifficultyEmoji(level.difficulty)} {level.difficulty.toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold text-white">{level.title}</h1>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                <h3 className="text-blue-300 font-semibold mb-2">🎯 Objectif</h3>
                <p className="text-white text-sm">{level.objective}</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h3 className="text-gray-300 font-semibold mb-2">📖 Description</h3>
                <p className="text-gray-400 text-sm">{level.description}</p>
              </div>

              {level.story && (
                <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 mb-4">
                  <h3 className="text-purple-300 font-semibold mb-2">📜 Contexte</h3>
                  <p className="text-gray-300 text-sm italic">{level.story}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-gray-300 font-semibold mb-2">⚡ Commandes clés</h3>
              <div className="flex flex-wrap gap-2">
                {level.commands.map((cmd, i) => (
                  <span 
                    key={i}
                    className="bg-gray-900 text-cyan-400 text-sm px-3 py-1 rounded font-mono border border-gray-700"
                  >
                    {cmd}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-gray-300 font-semibold mb-2">✅ Validations</h3>
              <ul className="space-y-2">
                {level.validation.map((rule, i) => (
                  <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-yellow-500">→</span>
                    <span>{rule.description || rule.value}</span>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border-2 border-green-500 animate-bounce-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">Niveau Complété !</h2>
              <p className="text-gray-300 mb-6">
                Tu as maîtrisé : <span className="text-green-400 font-semibold">{level.title}</span>
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <div className="text-yellow-400 font-bold text-2xl mb-2">+100 XP</div>
                {levelId === 10 && (
                  <div className="text-blue-400">🔑 Badge débloqué : SSH Master</div>
                )}
                {levelId === 20 && (
                  <div className="text-purple-400">⚙️ Badge débloqué : Automation Expert</div>
                )}
                {levelId === 30 && (
                  <div className="text-red-400">👑 Badge débloqué : Terminal Warrior</div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/levels')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  📋 Niveaux
                </button>
                {levelId < levels.length && (
                  <button
                    onClick={goToNextLevel}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
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

