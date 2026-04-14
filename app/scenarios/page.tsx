'use client';

import { scenarios, getScenarioCategoryLabel } from '@/data/scenarios';
import { useProgress } from '@/hooks/useProgress';
import { getMedalEmoji } from '@/hooks/useScenarioTimer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import UserMenu from '@/components/UserMenu';

type ScenarioTier = 'easy' | 'medium' | 'advanced' | 'extreme';

const CAT_COLOR: Record<string, string> = {
  forensic: 'text-orange-400 border-orange-400/20',
  reseau:   'text-blue-400 border-blue-400/20',
  systeme:  'text-[#a3e635] border-[#a3e635]/20',
};

const TIERS: ScenarioTier[] = ['easy', 'medium', 'advanced', 'extreme'];
const TIER_LABELS: Record<ScenarioTier, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  advanced: 'Avancé',
  extreme: 'Extrême',
};
const TIER_COLORS: Record<ScenarioTier, string> = {
  easy: 'text-green-400 border-green-400/20',
  medium: 'text-yellow-400 border-yellow-400/20',
  advanced: 'text-orange-400 border-orange-400/20',
  extreme: 'text-red-400 border-red-400/20',
};

export default function ScenariosPage() {
  const { progress, isScenarioUnlocked, isScenarioCompleted, getScenarioProgress } = useProgress();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-mono">
      {/* Nav */}
      <nav className="border-b border-white/5 px-4 sm:px-6 md:px-16 py-4 flex items-center justify-between">
        <Link href="/" className="text-[#a3e635] font-bold tracking-widest text-sm">EDULINUX</Link>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <Link href="/levels" className="hover:text-white transition-colors">niveaux</Link>
          <span className="text-white font-bold">scénarios</span>
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-16 py-8 md:py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[#a3e635] text-xs tracking-[0.3em] uppercase mb-2">Mode avancé</p>
          <h1 className="text-3xl font-bold text-white mb-3">Scénarios</h1>
          <p className="text-gray-500 text-sm max-w-xl leading-relaxed">
            Mises en situation réalistes — forensic, réseau, réponse à incident. Enchaîne tes connaissances sur des cas concrets.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 border border-[#a3e635]/15 bg-[#a3e635]/5 rounded-lg px-4 py-3 mb-8">
          <svg className="w-4 h-4 text-[#a3e635] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
          </svg>
          <div className="text-xs text-gray-400 leading-relaxed">
            Les scénarios se débloquent en complétant les niveaux correspondants.{' '}
            <Link href="/levels" className="text-[#a3e635] hover:underline">
              Commence par les niveaux →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-px bg-white/5 rounded overflow-hidden mb-10">
          {[
            { v: scenarios.length, l: 'scénarios' },
            { v: progress.completedScenarios.length, l: 'complétés' },
            { v: Object.keys(progress.scenarioMedals ?? {}).length, l: 'médailles' },
            { v: `${progress.totalXP}`, l: 'XP total' },
          ].map(s => (
            <div key={s.l} className="bg-[#0a0e17] px-6 py-4 text-center">
              <div className="text-[#a3e635] font-bold text-xl">{s.v}</div>
              <div className="text-gray-600 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Scenario list grouped by tier */}
        <div>
          {TIERS.map(tier => {
            const tierScenarios = scenarios.filter(s => s.tier === tier);
            if (tierScenarios.length === 0) return null;
            return (
              <div key={tier} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold uppercase tracking-widest border px-2 py-1 rounded ${TIER_COLORS[tier]}`}>
                    {TIER_LABELS[tier]}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-gray-700 text-xs">
                    {tierScenarios.filter(s => isScenarioCompleted(s.id)).length}/{tierScenarios.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tierScenarios.map(scenario => {
                    const unlocked = isScenarioUnlocked(scenario.id, scenario.prerequisites?.completedLevels);
                    const completed = isScenarioCompleted(scenario.id);
                    const pct = getScenarioProgress(scenario.id, scenario.steps.length);
                    const medal = progress.scenarioMedals?.[scenario.id];

                    return (
                      <div
                        key={scenario.id}
                        onClick={() => unlocked && router.push(`/scenarios/${scenario.id}`)}
                        className={`
                          border rounded p-5 transition-all relative overflow-hidden
                          ${unlocked
                            ? 'border-white/8 bg-[#0f1520] hover:border-white/15 cursor-pointer'
                            : 'border-white/4 bg-[#0c1018] opacity-40 cursor-not-allowed'}
                          ${completed ? 'border-[#a3e635]/20 bg-[#a3e635]/3' : ''}
                        `}
                      >
                        {/* Progress bar */}
                        {pct > 0 && (
                          <div className="absolute top-0 left-0 h-0.5 bg-[#a3e635] transition-all" style={{ width: `${pct}%` }} />
                        )}

                        <div className="flex items-start gap-3 sm:gap-5">
                          {/* Status indicator */}
                          <div className={`w-10 h-10 rounded border flex items-center justify-center text-sm flex-shrink-0 ${
                            completed ? 'border-[#a3e635]/40 text-[#a3e635]' : 'border-white/8 text-gray-600'
                          }`}>
                            {completed
                              ? (medal ? getMedalEmoji(medal) : '✓')
                              : !unlocked ? '🔒' : String(scenario.id).padStart(2, '0')}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1.5">
                              <h2 className="text-white font-bold text-sm">{scenario.title}</h2>
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed mb-3">{scenario.description}</p>
                            {!unlocked && scenario.prerequisites && (
                              <p className="text-gray-500 text-xs mt-1 mb-2 flex items-center gap-1.5">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Requis : {scenario.prerequisites.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className={`border px-2 py-0.5 rounded ${CAT_COLOR[scenario.category] || 'text-gray-400 border-gray-400/20'}`}>
                                {getScenarioCategoryLabel(scenario.category)}
                              </span>
                              <span className="text-gray-600">⏱ {scenario.duration}</span>
                              <span className="text-[#a3e635]">+{scenario.xpReward} XP</span>
                              <span className="text-gray-600">{scenario.steps.length} étapes</span>
                            </div>
                          </div>

                          {/* Right status */}
                          <div className="flex-shrink-0 text-right">
                            {pct > 0 && !completed && (
                              <span className="text-[#a3e635] text-xs font-bold">{pct}%</span>
                            )}
                            {completed && (
                              <div>
                                <span className="text-[#a3e635] text-xs">terminé</span>
                                {medal && (
                                  <p className="text-xs mt-0.5">{getMedalEmoji(medal)}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Coming soon */}
          <div className="border border-dashed border-white/5 rounded p-5 text-center">
            <p className="text-gray-600 text-xs">Nouveaux scénarios en préparation — déploiement compromis, exfiltration DNS, forensic mémoire…</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
