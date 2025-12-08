import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <span className="text-7xl">💻</span>
            EduLinux
          </h1>
          <p className="text-2xl text-blue-300 mb-2">
            Apprends le Terminal comme jamais auparavant
          </p>
          <p className="text-lg text-gray-400">
            Une expérience Duolingo × Bandit pour maîtriser Linux
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-all">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-xl font-bold text-white mb-2">30 Niveaux</h3>
            <p className="text-gray-400 text-sm">
              Progression du débutant à l'expert
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-center hover:border-green-500 transition-all">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Badges & XP</h3>
            <p className="text-gray-400 text-sm">
              Gagne des récompenses en progressant
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-center hover:border-purple-500 transition-all">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Terminal Réel</h3>
            <p className="text-gray-400 text-sm">
              Simule un vrai environnement Linux
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link 
            href="/levels"
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            🚀 Commencer l'Aventure
          </Link>
        </div>

        {/* Learning Path Preview */}
        <div className="mt-16 bg-gray-800/30 backdrop-blur border border-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            📚 Ce que tu vas apprendre
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-500">🟢</span>
                <div>
                  <span className="font-semibold">Niveaux 1-10:</span> Bases Terminal & SSH
                </div>
              </div>
              <ul className="ml-8 text-sm space-y-1 text-gray-400">
                <li>• Navigation (ls, cd, pwd)</li>
                <li>• Lecture de fichiers (cat, less)</li>
                <li>• Recherche (grep, find)</li>
                <li>• SSH et connexions distantes</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-yellow-500">🟡</span>
                <div>
                  <span className="font-semibold">Niveaux 11-20:</span> Manipulation & Auto
                </div>
              </div>
              <ul className="ml-8 text-sm space-y-1 text-gray-400">
                <li>• Pipes et redirections</li>
                <li>• Scripts Bash</li>
                <li>• Compression (tar, gzip)</li>
                <li>• Téléchargement (curl, wget)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-red-500">🔴</span>
                <div>
                  <span className="font-semibold">Niveaux 21-30:</span> Techniques Avancées
                </div>
              </div>
              <ul className="ml-8 text-sm space-y-1 text-gray-400">
                <li>• Réseau et ports</li>
                <li>• Cryptographie & hashing</li>
                <li>• Gestion des processus</li>
                <li>• Mission finale CTF-style</li>
              </ul>
            </div>

            <div className="space-y-2 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">🏆</div>
                <div className="font-semibold text-yellow-400">Terminal Warrior</div>
                <div className="text-xs text-gray-500">Badge final niveau 30</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Inspiré par Duolingo et OverTheWire Bandit</p>
          <p className="mt-2">🐧 Apprends, Pratique, Maîtrise Linux</p>
        </div>
      </div>
    </div>
  );
}
