'use client';

import { levels, getDifficultyEmoji } from '@/data/levels';
import { useProgress } from '@/hooks/useProgress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

const CHAPTERS = [
  { range: [1,  10], label: 'Terminal & SSH',       tag: '01–10' },
  { range: [11, 20], label: 'Flux & Scripts',       tag: '11–20' },
  { range: [21, 30], label: 'Sécurité',             tag: '21–30' },
  { range: [31, 40], label: 'Système Linux',        tag: '31–40' },
  { range: [41, 50], label: 'Réseau',               tag: '41–50' },
  { range: [51, 60], label: 'Forensic Linux',       tag: '51–60' },
  { range: [61, 70], label: 'Reconnaissance',       tag: '61–70' },
  { range: [71, 80], label: 'Hacking & PrivEsc',   tag: '71–80' },
  { range: [81, 90], label: 'Bash Avancé',          tag: '81–90' },
  { range: [91,100], label: 'CTF Challenges',       tag: '91–100' },
];

const DIFF_COLOR: Record<string, string> = {
  beginner:     'text-[#a3e635]',
  intermediate: 'text-yellow-400',
  advanced:     'text-red-400',
};

const BADGE_META: Record<string, { icon: string; label: string }> = {
  ssh_master:        { icon: '🔑', label: 'SSH Master' },
  automation_expert: { icon: '⚙️', label: 'Automation Expert' },
  terminal_warrior:  { icon: '👑', label: 'Terminal Warrior' },
  sysadmin:          { icon: '🖥️', label: 'Sysadmin' },
  network_guru:      { icon: '🛰️', label: 'Network Guru' },
  forensic_analyst:  { icon: '🔬', label: 'Forensic Analyst' },
  incident_responder: { icon: '🚨', label: 'Incident Responder' },
  web_investigator:   { icon: '🕵️', label: 'Web Investigator' },
  network_mapper:     { icon: '🗺️', label: 'Network Mapper' },
  recon_specialist:   { icon: '🎯', label: 'Recon Specialist' },
  privesc_master:     { icon: '⬆️', label: 'PrivEsc Master' },
  ir_expert:          { icon: '🔥', label: 'IR Expert' },
  network_pentester:  { icon: '🔌', label: 'Network Pentester' },
  hacker:             { icon: '💀', label: 'Hacker' },
  script_master:      { icon: '📜', label: 'Script Master' },
  ctf_champion:       { icon: '🏆', label: 'CTF Champion' },
};

export default function LevelsPage() {
  const { progress, isLevelUnlocked, isLevelCompleted } = useProgress();
  const router = useRouter();
  const pct = Math.round((progress.completedLevels.length / levels.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-mono">
      {/* Nav */}
      <nav className="border-b border-white/5 px-4 sm:px-6 md:px-16 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#a3e635] font-bold tracking-widest text-sm">EDULINUX</Link>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="text-white font-bold">niveaux</span>
          <Link href="/scenarios" className="hover:text-white transition-colors">scénarios</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-16 py-8 md:py-10">
        {/* Header */}
        <div className="flex items-start sm:items-end justify-between mb-6 md:mb-8 gap-4">
          <div>
            <p className="text-[#a3e635] text-xs tracking-[0.3em] uppercase mb-1">Parcours</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Niveaux</h1>
          </div>
          <div className="text-right text-sm flex-shrink-0">
            <div>
              <span className="text-white font-bold">{progress.completedLevels.length}</span>
              <span className="text-gray-600">/{levels.length}</span>
            </div>
            <div className="text-[#a3e635] font-bold">{progress.totalXP} XP</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-1 mb-10">
          <div
            className="h-1 rounded-full bg-[#a3e635] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Badges */}
        {progress.badges.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {progress.badges.map(b => {
              const m = BADGE_META[b];
              if (!m) return null;
              return (
                <span key={b} className="flex items-center gap-1.5 border border-white/10 bg-white/4 rounded px-3 py-1.5 text-xs text-gray-300">
                  {m.icon} {m.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Chapters */}
        {CHAPTERS.map(ch => {
          const chLevels = levels.filter(l => l.id >= ch.range[0] && l.id <= ch.range[1]);
          const done = chLevels.filter(l => isLevelCompleted(l.id)).length;

          return (
            <div key={ch.tag} className="mb-10">
              {/* Chapter header */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                <span className="text-[#a3e635] text-xs font-bold tracking-widest">{ch.tag}</span>
                <span className="text-white text-sm font-bold">{ch.label}</span>
                <span className="ml-auto text-gray-600 text-xs">{done}/{chLevels.length}</span>
              </div>

              {/* Level grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {chLevels.map(level => {
                  const unlocked = isLevelUnlocked(level.id);
                  const completed = isLevelCompleted(level.id);

                  return (
                    <button
                      key={level.id}
                      onClick={() => unlocked && router.push(`/levels/${level.id}`)}
                      disabled={!unlocked}
                      className={`
                        text-left border rounded p-3.5 transition-all
                        ${unlocked && !completed
                          ? 'border-white/8 bg-[#0f1520] hover:border-[#a3e635]/40 hover:bg-[#111827] cursor-pointer'
                          : ''}
                        ${completed
                          ? 'border-[#a3e635]/30 bg-[#a3e635]/5 cursor-pointer'
                          : ''}
                        ${!unlocked
                          ? 'border-white/4 bg-[#0c1018] opacity-40 cursor-not-allowed'
                          : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-xs font-bold">
                          {String(level.id).padStart(2, '0')}
                        </span>
                        <span className="text-xs">
                          {completed
                            ? <span className="text-[#a3e635]">✓</span>
                            : !unlocked
                            ? <span className="text-gray-700">○</span>
                            : <span className={DIFF_COLOR[level.difficulty]}>{getDifficultyEmoji(level.difficulty)}</span>
                          }
                        </span>
                      </div>
                      <p className="text-white text-xs font-bold leading-tight mb-2">{level.title}</p>
                      <p className="text-gray-600 text-xs font-mono">{level.commands[0]}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Scenario CTA */}
        <div className="border border-white/8 rounded p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex-1">
            <p className="text-[#a3e635] text-xs tracking-widest uppercase mb-1">Mode avancé</p>
            <h3 className="text-white font-bold">Scénarios de mise en situation</h3>
            <p className="text-gray-500 text-xs mt-1">Forensic, réseau, réponse à incident — débloqués après 10 niveaux.</p>
          </div>
          <Link href="/scenarios" className="border border-[#a3e635]/40 text-[#a3e635] hover:bg-[#a3e635] hover:text-black px-4 py-2 rounded text-xs font-bold transition-all flex-shrink-0">
            Accéder →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
