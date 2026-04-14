'use client';

import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';

export default function HeroCta() {
  const { progress, loaded } = useProgress();

  // Avant que la progression soit chargée, on affiche le bouton par défaut
  if (!loaded) {
    return (
      <Link
        href="/levels"
        className="bg-[#a3e635] text-black font-bold px-6 py-3 rounded text-sm hover:bg-[#bef264] transition-colors"
      >
        Commencer — Niveau 01
      </Link>
    );
  }

  const lvl = progress.currentLevel ?? 1;

  if (lvl > 1) {
    return (
      <Link
        href={`/levels/${lvl}`}
        className="bg-[#a3e635] text-black font-bold px-6 py-3 rounded text-sm hover:bg-[#bef264] transition-colors"
      >
        Reprendre — Niveau {String(lvl).padStart(2, '0')}
      </Link>
    );
  }

  return (
    <Link
      href="/levels"
      className="bg-[#a3e635] text-black font-bold px-6 py-3 rounded text-sm hover:bg-[#bef264] transition-colors"
    >
      Commencer — Niveau 01
    </Link>
  );
}
