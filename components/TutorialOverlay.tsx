'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TutorialStep {
  target: string;   // valeur de l'attribut data-tutorial="xxx"
  title: string;
  description: string;
}

interface Props {
  steps: TutorialStep[];          // étapes desktop
  mobileSteps?: TutorialStep[];   // étapes mobile (optionnel)
  onClose: () => void;
}

const PAD = 10;
const TOOLTIP_W_DESKTOP = 300;
const TOOLTIP_H = 260;

export default function TutorialOverlay({ steps, mobileSteps, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const [hl, setHl] = useState<{ top: number; left: number; w: number; h: number } | null>(null);
  const [win, setWin] = useState({ w: 1280, h: 800 });

  const isMobile = win.w < 1024;
  const activeSteps = isMobile && mobileSteps ? mobileSteps : steps;
  const step = activeSteps[idx] ?? activeSteps[0];

  // Reset step index when switching between mobile/desktop step sets
  useEffect(() => {
    setIdx(0);
  }, [isMobile]);

  // Track window size
  useEffect(() => {
    const update = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Find target element and compute spotlight rect
  useEffect(() => {
    const el = document.querySelector(`[data-tutorial="${step.target}"]`);
    if (!el) { setHl(null); return; }
    // 'instant' évite l'animation de scroll qui décale getBoundingClientRect
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    // Double rAF : garantit que le layout est recalculé après le scroll
    let rafId: number;
    const rafTimer = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setHl({ top: r.top, left: r.left, w: r.width, h: r.height });
      });
    });
    return () => cancelAnimationFrame(rafId ?? rafTimer);
  }, [idx, step.target, isMobile]);

  // Keyboard navigation (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, isMobile]);

  const goNext = useCallback(() => {
    if (idx < activeSteps.length - 1) setIdx(i => i + 1);
    else onClose();
  }, [idx, activeSteps.length, onClose]);

  const goPrev = useCallback(() => {
    if (idx > 0) setIdx(i => i - 1);
  }, [idx]);

  // Spotlight coordinates
  const sTop  = hl ? Math.max(0, hl.top  - PAD) : 0;
  const sLeft = hl ? Math.max(0, hl.left - PAD) : 0;
  const sW    = hl ? hl.w + PAD * 2 : 0;
  const sH    = hl ? hl.h + PAD * 2 : 0;

  // Tooltip width adapts to screen
  const TOOLTIP_W = isMobile ? Math.min(win.w - 32, 340) : TOOLTIP_W_DESKTOP;

  // Tooltip placement
  let tTop: number;
  let tLeft: number;

  if (!hl) {
    // No element found → center
    tTop  = win.h / 2 - TOOLTIP_H / 2;
    tLeft = win.w / 2 - TOOLTIP_W / 2;
  } else if (isMobile) {
    // Mobile : centré horizontalement, sous l'élément (ou au-dessus si trop bas)
    tLeft = Math.max(16, Math.min(win.w / 2 - TOOLTIP_W / 2, win.w - TOOLTIP_W - 16));
    tTop  = sTop + sH + 16;
    if (tTop + TOOLTIP_H > win.h - 16) tTop = sTop - TOOLTIP_H - 16;
    if (tTop < 16) tTop = win.h / 2 - TOOLTIP_H / 2;
  } else {
    // Desktop : droite ou gauche selon la position de l'élément
    const elemCenterX = sLeft + sW / 2;
    const inLeftHalf  = elemCenterX < win.w / 2;
    const rightStart  = sLeft + sW + 24;
    const leftStart   = sLeft - TOOLTIP_W - 24;

    if (inLeftHalf && rightStart + TOOLTIP_W < win.w - 16) {
      tLeft = rightStart;
      tTop  = Math.max(16, Math.min(sTop + sH / 2 - TOOLTIP_H / 2, win.h - TOOLTIP_H - 16));
    } else if (!inLeftHalf && leftStart > 16) {
      tLeft = leftStart;
      tTop  = Math.max(16, Math.min(sTop + sH / 2 - TOOLTIP_H / 2, win.h - TOOLTIP_H - 16));
    } else {
      // Fallback : bas → haut → centre
      tLeft = Math.max(16, Math.min(sLeft, win.w - TOOLTIP_W - 16));
      tTop  = sTop + sH + 20;
      if (tTop + TOOLTIP_H > win.h - 16) tTop = sTop - TOOLTIP_H - 20;
      if (tTop < 16) tTop = win.h / 2 - TOOLTIP_H / 2;
    }
  }

  return (
    <div className="fixed inset-0 z-[200] select-none" style={{ pointerEvents: 'all' }}>
      {/* Spotlight: 4 dark panels surrounding the highlighted element */}
      {hl ? (
        <>
          <div className="absolute bg-black/80" style={{ top: 0, left: 0, right: 0, height: sTop }} />
          <div className="absolute bg-black/80" style={{ top: sTop + sH, left: 0, right: 0, bottom: 0 }} />
          <div className="absolute bg-black/80" style={{ top: sTop, left: 0, width: sLeft, height: sH }} />
          <div className="absolute bg-black/80" style={{ top: sTop, left: sLeft + sW, right: 0, height: sH }} />
          <div
            className="absolute rounded pointer-events-none"
            style={{
              top: sTop, left: sLeft, width: sW, height: sH,
              boxShadow: '0 0 0 2px #a3e635, 0 0 20px 4px rgba(163,230,53,0.15)',
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/80" />
      )}

      {/* Tooltip card */}
      <div
        className="absolute bg-[#0d1117] border border-[#a3e635]/30 rounded-xl p-4 shadow-2xl"
        style={{ width: TOOLTIP_W, top: tTop, left: tLeft }}
      >
        {/* Dot progress */}
        <div className="flex items-center gap-1.5 mb-2">
          {activeSteps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === idx ? 'w-5 h-1.5 bg-[#a3e635]' : i < idx ? 'w-1.5 h-1.5 bg-[#a3e635]/40' : 'w-1.5 h-1.5 bg-white/15'
              }`}
            />
          ))}
          <span className="ml-auto text-gray-600 text-xs">{idx + 1}/{activeSteps.length}</span>
        </div>

        <p className="text-[#a3e635] text-xs font-bold uppercase tracking-widest mb-1">{step.title}</p>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{step.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={idx === 0}
            className="text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>
          <button
            onClick={goNext}
            className="bg-[#a3e635] text-black text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#bef264] transition-colors"
          >
            {idx < activeSteps.length - 1 ? 'Suivant →' : 'Terminer ✓'}
          </button>
        </div>
      </div>

      {/* Passer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-white text-sm transition-colors px-3 py-1 rounded border border-white/10 hover:border-white/30"
      >
        Passer ✕
      </button>

      {/* Keyboard hint — desktop only */}
      {!isMobile && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-700 text-xs">
          ← → pour naviguer · Échap pour quitter
        </p>
      )}
    </div>
  );
}
