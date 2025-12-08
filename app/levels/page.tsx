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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Retour à l'accueil
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎮 Niveaux EduLinux
          </h1>

          {/* Progress Bar */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">Ta Progression</span>
              <span className="text-blue-400 font-bold">
                {progress.completedLevels.length} / {levels.length} niveaux
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐</span>
                <span className="text-gray-300">{progress.totalXP} XP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">🏆</span>
                <span className="text-gray-300">{progress.badges.length} badges</span>
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
                  relative bg-gray-800 border-2 rounded-lg p-6 text-left transition-all
                  ${unlocked 
                    ? 'border-gray-700 hover:border-blue-500 hover:shadow-lg hover:scale-105 cursor-pointer' 
                    : 'border-gray-800 opacity-50 cursor-not-allowed'
                  }
                  ${completed ? 'bg-gradient-to-br from-gray-800 to-green-900/30' : ''}
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

