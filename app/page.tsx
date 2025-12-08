import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-5xl w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="text-8xl mb-4 animate-bounce">💻</div>
          </div>
          <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            EduLinux
          </h1>
          <p className="text-3xl md:text-4xl text-cyan-300 mb-4 font-bold">
            Apprends le Terminal comme jamais auparavant
          </p>
          <p className="text-xl text-gray-400">
            Une expérience Duolingo × Bandit pour maîtriser Linux
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 text-center hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all transform hover:scale-105">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-3">30 Niveaux</h3>
            <p className="text-gray-300">
              Progression du débutant à l'expert
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 text-center hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all transform hover:scale-105">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-3">Badges & XP</h3>
            <p className="text-gray-300">
              Gagne des récompenses en progressant
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/20 transition-all transform hover:scale-105">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-white mb-3">Terminal Réel</h3>
            <p className="text-gray-300">
              Simule un vrai environnement Linux
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link 
            href="/levels"
            className="inline-block group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold text-2xl px-16 py-6 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all">
              🚀 Commencer l'Aventure
            </div>
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
