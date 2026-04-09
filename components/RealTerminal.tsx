'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface ValidationRule {
  type: 'command' | 'output' | 'fileContent' | 'fileExists';
  value: string;
  description?: string;
}

export interface RealTerminalProps {
  /** Unique identifier for the level or scenario step — change it to reinit the terminal */
  id: number;
  kind: 'level' | 'scenario';
  fileSystem?: Record<string, unknown>;
  validations: ValidationRule[];
  hints?: string[];
  /** Called once when all validations are satisfied */
  onAllComplete?: () => void;
  /** Called when the user clicks "Étape suivante" in a scenario context */
  onNextStep?: () => void;
  /** Data for the next scenario step (triggers next_step on server) */
  nextStepData?: { fileSystem?: Record<string, unknown>; validations: ValidationRule[] };
}

export default function RealTerminal({
  id,
  kind,
  fileSystem = {},
  validations,
  hints,
  onAllComplete,
  onNextStep,
  nextStepData,
}: RealTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const termRef = useRef<import('@xterm/xterm').Terminal | null>(null);
  const fitRef = useRef<import('@xterm/addon-fit').FitAddon | null>(null);

  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [allDone, setAllDone] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'ready' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);

  // true once the user typed "ok" to proceed — prevents double-fire
  const okSentRef = useRef(false);
  // track allDone in a ref so the onData closure can read it without stale capture
  const allDoneRef = useRef(false);

  // Keep props in ref so WS callbacks always see latest values
  const propsRef = useRef({ validations, hints, fileSystem, onAllComplete });
  propsRef.current = { validations, hints, fileSystem, onAllComplete };

  const addNotification = useCallback((msg: string) => {
    setNotifications(prev => [...prev.slice(-4), msg]);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 4000);
  }, []);

  // ── Bootstrap terminal & WebSocket ─────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    let ws: WebSocket;

    // Dynamic import — xterm must run client-side only
    Promise.all([
      import('@xterm/xterm'),
      import('@xterm/addon-fit'),
    ]).then(([{ Terminal }, { FitAddon }]) => {
      if (destroyed || !containerRef.current) return;

      // Dispose previous instance
      termRef.current?.dispose();
      wsRef.current?.close();

      const term = new Terminal({
        theme: {
          background:    '#0a0e17',
          foreground:    '#e2e8f0',
          cursor:        '#a3e635',
          cursorAccent:  '#0a0e17',
          selectionBackground: 'rgba(163,230,53,0.25)',
          black:         '#0a0e17',
          brightBlack:   '#334155',
          red:           '#ef4444',
          brightRed:     '#f87171',
          green:         '#a3e635',
          brightGreen:   '#bef264',
          yellow:        '#eab308',
          brightYellow:  '#facc15',
          blue:          '#3b82f6',
          brightBlue:    '#60a5fa',
          magenta:       '#a855f7',
          brightMagenta: '#c084fc',
          cyan:          '#22d3ee',
          brightCyan:    '#67e8f9',
          white:         '#cbd5e1',
          brightWhite:   '#f1f5f9',
        },
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, "Courier New", monospace',
        fontSize: 13,
        lineHeight: 1.45,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 2000,
        convertEol: true,
      });

      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(containerRef.current);

      setTimeout(() => { try { fit.fit(); } catch {} }, 30);

      termRef.current = term;
      fitRef.current = fit;

      // Resize observer
      const observer = new ResizeObserver(() => {
        try { fit.fit(); } catch {}
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
        }
      });
      observer.observe(containerRef.current);

      // ── WebSocket ──────────────────────────────────────────────────────────
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const port = window.location.port ? `:${window.location.port}` : '';
      const wsUrl = `${proto}://${window.location.hostname}${port}/pty`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (destroyed) { ws.close(); return; }
        ws.send(JSON.stringify({
          type: 'init',
          id,
          kind,
          fileSystem: propsRef.current.fileSystem,
          validations: propsRef.current.validations,
          hints: propsRef.current.hints,
          cols: term.cols,
          rows: term.rows,
        }));
      };

      ws.onmessage = (event) => {
        if (destroyed) return;
        let msg: Record<string, unknown>;
        try { msg = JSON.parse(event.data); } catch { return; }

        if (msg.type === 'output') {
          term.write(msg.data as string);
        }

        if (msg.type === 'ready') {
          setWsStatus('ready');
        }

        if (msg.type === 'validation') {
          const idx = msg.index as number;
          const desc = (msg.description as string) || validations[idx]?.description || '';
          setCompletedSet(prev => new Set([...prev, idx]));
          // Show non-intrusive notification in terminal output
          if (desc) term.write(`\r\n\x1b[1;32m✓ ${desc}\x1b[0m\r\n`);
          addNotification(`✓ ${desc || 'Objectif validé'}`);
        }

        if (msg.type === 'all_complete') {
          allDoneRef.current = true;
          okSentRef.current = false;
          setAllDone(true);
          // Affiche le message DANS le terminal — pas de modal
          term.write(
            '\r\n' +
            '\x1b[1;32m┌─────────────────────────────────────────┐\x1b[0m\r\n' +
            '\x1b[1;32m│  ★  Tous les objectifs sont complétés !  │\x1b[0m\r\n' +
            '\x1b[1;32m└─────────────────────────────────────────┘\x1b[0m\r\n' +
            '\x1b[90m  Le shell reste actif — explore librement.\x1b[0m\r\n' +
            '\x1b[33m  Tape \x1b[1mok\x1b[0m\x1b[33m puis Entrée pour passer à la suite.\x1b[0m\r\n\r\n'
          );
          // onAllComplete est appelé UNIQUEMENT quand l'utilisateur tape "ok"
        }

        if (msg.type === 'step_ready') {
          term.write('\r\n\x1b[33m─── Étape suivante — nouveaux fichiers disponibles ───\x1b[0m\r\n\r\n');
        }

        if (msg.type === 'error') {
          setWsStatus('error');
          setErrorMsg(msg.message as string);
        }

        if (msg.type === 'pty_exit') {
          term.write('\r\n\x1b[31m[shell terminé]\x1b[0m\r\n');
        }
      };

      ws.onerror = () => {
        setWsStatus('error');
        setErrorMsg(
          "Impossible de se connecter. Assure-toi de lancer le serveur avec 'npm run dev'."
        );
      };

      ws.onclose = () => {
        if (!destroyed) setWsStatus('connecting');
      };

      // Buffer to detect "ok\r" typed by the user
      let okBuffer = '';

      // Forward keystrokes to server, intercept "ok" when level is complete
      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }));
        }

        // Accumulate printable chars + detect Enter
        for (const ch of data) {
          if (ch === '\r' || ch === '\n') {
            const typed = okBuffer.trim().toLowerCase();
            if (typed === 'ok' && allDoneRef.current && !okSentRef.current) {
              okSentRef.current = true;
              // Small delay so the shell echoes the Enter before we navigate
              setTimeout(() => propsRef.current.onAllComplete?.(), 300);
            }
            okBuffer = '';
          } else if (ch === '\x7f' || ch === '\b') {
            okBuffer = okBuffer.slice(0, -1);
          } else if (ch >= ' ') {
            okBuffer += ch;
          }
        }
      });

      return () => { observer.disconnect(); };
    });

    return () => {
      destroyed = true;
      wsRef.current?.close();
      termRef.current?.dispose();
      termRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, kind]); // Re-init only when level changes

  // ── Next step (scenario) ───────────────────────────────────────────────────
  const handleNextStep = useCallback(() => {
    if (!nextStepData || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    setCompletedSet(new Set());
    setAllDone(false);
    wsRef.current.send(JSON.stringify({
      type: 'next_step',
      fileSystem: nextStepData.fileSystem ?? {},
      validations: nextStepData.validations,
    }));
    onNextStep?.();
  }, [nextStepData, onNextStep]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col h-full bg-[#0a0e17] rounded overflow-hidden border border-white/5">

      {/* Terminal title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#060a10] border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-[#a3e635]/70" />
        </div>
        <span className="text-gray-600 text-xs font-mono">
          student@edulinux — bash
        </span>
        <div className="flex items-center gap-2">
          {/* Validation counter */}
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${
            allDone
              ? 'text-[#a3e635] bg-[#a3e635]/10'
              : 'text-gray-600 bg-white/5'
          }`}>
            {completedSet.size}/{validations.length} objectifs
          </span>
          {/* Connection dot */}
          <span className={`w-2 h-2 rounded-full ${
            wsStatus === 'ready'      ? 'bg-[#a3e635]' :
            wsStatus === 'error'      ? 'bg-red-500' :
                                        'bg-yellow-500 animate-pulse'
          }`} title={wsStatus} />
        </div>
      </div>

      {/* xterm.js container */}
      <div className="flex-1 overflow-hidden p-2">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Error overlay */}
      {wsStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e17]/95 z-10 p-6">
          <div className="text-center max-w-md">
            <p className="text-red-400 font-mono text-sm mb-2">⚠ Connexion impossible</p>
            <p className="text-gray-500 font-mono text-xs leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Validation notification toasts */}
      <div className="absolute bottom-14 right-4 flex flex-col gap-1.5 pointer-events-none z-20">
        {notifications.map((n, i) => (
          <div
            key={i}
            className="bg-[#0a0e17] border border-[#a3e635]/40 text-[#a3e635] text-xs font-mono px-3 py-1.5 rounded animate-fadeIn"
          >
            {n}
          </div>
        ))}
      </div>

      {/* Bottom bar — shown when all objectives complete */}
      {allDone && (
        <div className="flex-shrink-0 border-t border-[#a3e635]/30 bg-[#0a0e17] px-4 py-2.5 flex items-center justify-between animate-fadeIn">
          <span className="text-[#a3e635] text-xs font-mono">
            ★ Objectifs complétés — continue d&apos;explorer ou passe à la suite
          </span>
          {onNextStep && nextStepData ? (
            <button
              onClick={handleNextStep}
              className="bg-[#a3e635] text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-[#bef264] transition-colors"
            >
              Étape suivante →
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
