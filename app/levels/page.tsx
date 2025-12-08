'use client';

import { levels, getDifficultyColor, getDifficultyEmoji } from '@/data/levels';
import { useProgress } from '@/hooks/useProgress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LevelsPage() {
  const { progress, isLevelUnlocked, isLevelCompleted } = useProgress();
  const router = useRouter();

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Bases': '📚',
      'Navigation': '🗺️',
      'Lecture': '📖',
      'Permissions': '🔒',
      'Recherche': '🔍',
      'Encodage': '🔐',
      'SSH': '🌐',
      'Flux': '🔀',
      'Analyse': '📊',
      'Glob': '🌟',
      'Environnement': '🎯',
      'Scripts': '📜',
      'Archives': '📦',
      'Réseau': '🛰️',
      'Édition': '✏️',
      'Patterns': '🎯',
      'Système': '⚙️',
      'Sécurité': '🔓',
      'CTF': '🏆'
    };
    return icons[category] || '📌';
  };

  const progressPercentage = (progress.completedLevels.length / levels.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 font-semibold transition-colors group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span>Retour à l'accueil</span>
          </Link>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎮 Niveaux EduLinux
          </h1>

          {/* Progress Bar */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-bold text-xl">Ta Progression</span>
              <span className="text-cyan-400 font-black text-xl">
                {progress.completedLevels.length} / {levels.length} niveaux
              </span>
            </div>
            
            <div className="w-full bg-gray-800/50 rounded-full h-6 mb-6 border border-gray-700/50 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 h-6 rounded-full transition-all duration-500 shadow-lg flex items-center justify-end pr-2"
                style={{ width: `${progressPercentage}%` }}
              >
                <span className="text-white text-xs font-bold">{Math.round(progressPercentage)}%</span>
              </div>
            </div>

            <div className="flex gap-6 text-base">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                <span className="text-yellow-400 text-xl">⭐</span>
                <span className="text-yellow-300 font-bold">{progress.totalXP} XP</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30">
                <span className="text-purple-400 text-xl">🏆</span>
                <span className="text-purple-300 font-bold">{progress.badges.length} badges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level.id);
            const completed = isLevelCompleted(level.id);

            return (
              <button
                key={level.id}
                onClick={() => unlocked && router.push(`/levels/${level.id}`)}
                disabled={!unlocked}
                className={`
                  relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 rounded-2xl p-6 text-left transition-all shadow-lg
                  ${unlocked 
                    ? 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-105 cursor-pointer' 
                    : 'border-gray-800 opacity-40 cursor-not-allowed'
                  }
                  ${completed ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50' : ''}
                `}
              >
                {/* Level Number Badge */}
                <div className="absolute -top-3 -left-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  {level.id}
                </div>

                {/* Completed Badge */}
                {completed && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                    ✓
                  </div>
                )}

                {/* Locked Badge */}
                {!unlocked && (
                  <div className="absolute -top-3 -right-3 bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                    🔒
                  </div>
                )}

                {/* Content */}
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(level.category)}</span>
                    <span className={`text-sm font-semibold ${getDifficultyColor(level.difficulty)}`}>
                      {getDifficultyEmoji(level.difficulty)} {level.difficulty.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2">
                    {level.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {level.objective}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {level.commands.slice(0, 3).map((cmd, i) => (
                      <span 
                        key={i}
                        className="bg-gray-900 text-blue-400 text-xs px-2 py-1 rounded font-mono"
                      >
                        {cmd}
                      </span>
                    ))}
                    {level.commands.length > 3 && (
                      <span className="text-gray-500 text-xs px-2 py-1">
                        +{level.commands.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Badges Section */}
        {progress.badges.length > 0 && (
          <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">🏆 Tes Badges</h2>
            <div className="flex gap-4">
              {progress.badges.includes('ssh_master') && (
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">🔑</div>
                  <div className="text-white font-semibold">SSH Master</div>
                  <div className="text-xs text-gray-500">Niveau 10</div>
                </div>
              )}
              {progress.badges.includes('automation_expert') && (
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">⚙️</div>
                  <div className="text-white font-semibold">Automation Expert</div>
                  <div className="text-xs text-gray-500">Niveau 20</div>
                </div>
              )}
              {progress.badges.includes('terminal_warrior') && (
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">👑</div>
                  <div className="text-white font-semibold">Terminal Warrior</div>
                  <div className="text-xs text-gray-500">Niveau 30</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

