'use strict';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const pty = require('node-pty');
const fs = require('fs');
const path = require('path');
const os = require('os');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ─── Filesystem helpers ───────────────────────────────────────────────────────

function createFiles(baseDir, fileSystem) {
  if (!fileSystem || typeof fileSystem !== 'object') return;
  for (const [key, value] of Object.entries(fileSystem)) {
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    const fullPath = path.join(baseDir, cleanKey);
    const dir = path.dirname(fullPath);
    try {
      fs.mkdirSync(dir, { recursive: true });
      if (typeof value === 'string') {
        // Garantit un \n final pour que le prompt s'affiche sur une nouvelle ligne
        const content = value.endsWith('\n') ? value : value + '\n';
        fs.writeFileSync(fullPath, content, 'utf8');
        // Scripts et fichiers dans bin/ sont rendus exécutables
        const inBin = cleanKey.startsWith('bin/') || cleanKey === 'bin';
        if (key.endsWith('.sh') || key.endsWith('.py') || key.endsWith('.pl') || inBin) {
          fs.chmodSync(fullPath, 0o755);
        }
      } else if (typeof value === 'object' && value !== null) {
        fs.mkdirSync(fullPath, { recursive: true });
        createFiles(fullPath, value);
      }
    } catch (e) {
      console.warn(`[edulinux] Skipped ${fullPath}: ${e.message}`);
    }
  }
}

// ─── Input buffer helpers ─────────────────────────────────────────────────────

function cleanBuffer(buf) {
  let result = '';
  let i = 0;
  while (i < buf.length) {
    const code = buf.charCodeAt(i);
    if (code === 0x7f || code === 0x08) {
      // Backspace / DEL
      result = result.slice(0, -1);
      i++;
    } else if (code === 0x1b) {
      // Escape sequence — skip entirely
      i++;
      if (buf[i] === '[') {
        i++;
        while (i < buf.length && !/[A-Za-z~]/.test(buf[i])) i++;
        i++;
      } else {
        i++;
      }
    } else if (code === 0x03 || code === 0x04 || code === 0x15) {
      // Ctrl+C / Ctrl+D / Ctrl+U — reset buffer
      result = '';
      i++;
    } else {
      result += buf[i];
      i++;
    }
  }
  return result.trim();
}

// ─── Validation logic ─────────────────────────────────────────────────────────

// Commands that are semantically valid without arguments
const NO_ARG_COMMANDS = new Set([
  'pwd', 'id', 'whoami', 'ls', 'env', 'printenv', 'who', 'last',
  'top', 'free', 'df', 'ps', 'history', 'uptime', 'uname', 'date',
  'groups', 'umask', 'lsattr', 'sudo -l', 'ss', 'ip', 'netstat',
]);

// Normalise un chemin/argument : supprime les slashes finaux, guillemets, doubles espaces
function normalise(s) {
  return s
    .replace(/['"]/g, '')      // retire les guillemets simples et doubles
    .replace(/\/+$/, '')       // retire les slashes finaux (documents/ → documents)
    .replace(/\s+/g, ' ')      // normalise les espaces multiples
    .trim()
    .toLowerCase();
}

function matchesRule(cmd, rule) {
  if (rule.type !== 'command') return false;
  const c = normalise(cmd);
  const v = normalise(rule.value);

  // Cas spécial cd : "cd work" doit matcher "cd home/user/documents/work"
  if (v.startsWith('cd ') && c.startsWith('cd ')) {
    const vPath = v.slice(3).replace(/\/+$/, '');
    const cPath = c.slice(3).replace(/\/+$/, '');
    if (cPath === vPath || cPath.endsWith('/' + vPath)) return true;
  }

  // Opérateurs purs (|, >, >>) : vérifier la présence dans la commande
  if (v === '|') return c.includes('|');
  if (v === '>>') return c.includes('>>');
  if (v === '>') return c.includes('>');

  // Règle de type "cmd >" ou "cmd |" : cmd présent en début ET opérateur présent
  const opMatch = v.match(/^(\S+)\s+(>>|>|\|)$/);
  if (opMatch) {
    const [, baseCmd, op] = opMatch;
    if (c.startsWith(baseCmd + ' ') && c.includes(op)) return true;
  }

  // ls : flags équivalents peu importe l'ordre ou le regroupement (-la == -al == -l -a)
  if (v.startsWith('ls') && c.startsWith('ls')) {
    const extractFlags = s => (s.match(/-([a-zA-Z]+)/g) || []).join('').replace(/-/g, '').split('').sort();
    const vFlags = extractFlags(v);
    const cFlagsSet = new Set(extractFlags(c));
    if (vFlags.length > 0 && vFlags.every(f => cFlagsSet.has(f))) return true;
  }

  // Pipe chains : vérifier chaque segment AVANT le return sur v.includes(' ')
  // (sinon "cat file | base64 -d" ne matcherait jamais la règle "base64 -d")
  if (c.includes('|')) {
    return c.split('|').some(part => matchesRule(part.trim(), rule));
  }

  // Rule has arguments → accept exact match or starts with
  if (v.includes(' ')) {
    return c === v || c.startsWith(v + ' ') || c.startsWith(v);
  }

  // Rule is a bare command name
  if (c.startsWith(v + ' ')) return true;
  if (c === v && NO_ARG_COMMANDS.has(v)) return true;

  return false;
}

function checkValidations(ws, command) {
  if (!command) return;
  const validations = ws._validations || [];
  const completed = ws._completedValidations;
  const newly = [];

  for (let i = 0; i < validations.length; i++) {
    if (completed.has(i)) continue;
    if (matchesRule(command, validations[i])) {
      completed.add(i);
      newly.push(i);
    }
  }

  for (const idx of newly) {
    try {
      ws.send(JSON.stringify({
        type: 'validation',
        index: idx,
        description: validations[idx].description,
        completed: completed.size,
        total: validations.length,
      }));
    } catch {}
  }

  if (newly.length > 0 && completed.size === validations.length) {
    try { ws.send(JSON.stringify({ type: 'all_complete' })); } catch {}
  }
}

// ─── Server bootstrap ─────────────────────────────────────────────────────────

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url || '/', true);
    await handle(req, res, parsedUrl);
  });

  // noServer: true → on gère manuellement l'upgrade pour filtrer par chemin
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url || '/');
    // Seul /pty appartient au terminal — tout le reste (HMR Next.js) est ignoré
    if (pathname === '/pty') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
    // On ne détruit pas les autres sockets : Next.js gère lui-même son HMR
  });

  wss.on('connection', (ws) => {
    let ptyProcess = null;

    ws._validations = [];
    ws._completedValidations = new Set();
    ws._workDir = null;

    function spawnShell(workDir, cols, rows) {
      const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
      const histFile = path.join(workDir, '.bash_history');
      const bashrcFile = path.join(workDir, '.bashrc');

      // Bashrc minimal — PROMPT_COMMAND envoie la dernière commande dans le flux PTY
      // via une séquence OSC invisible (ESC]777;CMD\x07).
      // Le serveur l'intercepte dans onData, valide, et la supprime avant envoi au client.
      // Fonctionne avec l'autocomplétion Tab, les flèches, tout.
      fs.writeFileSync(bashrcFile, [
        `PS1='\\[\\033[01;32m\\]student@edulinux\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '`,
        `HISTFILE="${histFile}"`,
        'HISTSIZE=1000',
        'HISTFILESIZE=1000',
        'HISTCONTROL=ignoredups',
        `PROMPT_COMMAND='__ec=$(history 1 | sed "s/^ *[0-9]* *//"); printf "\\033]777;%s\\007" "$__ec"; history -a'`,
        // pwd affiche ~ à la place du répertoire temporaire (plus lisible pour les débutants)
        `pwd() { command pwd | sed "s|${workDir}|~|g"; }`,
        // ~/bin en tête de PATH : permet aux niveaux de fournir des commandes simulées (ex: ssh)
        `export PATH="$HOME/bin:$PATH"`,
      ].join('\n') + '\n', 'utf8');

      const args = process.platform === 'win32'
        ? []
        : ['--noprofile', '--rcfile', bashrcFile, '-i'];

      ptyProcess = pty.spawn(shell, args, {
        name: 'xterm-256color',
        cols: cols || 80,
        rows: rows || 24,
        cwd: workDir,
        env: {
          ...process.env,
          HOME: workDir,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          PATH: (process.env.PATH || '') + ':/usr/local/sbin:/usr/sbin:/sbin:/usr/local/bin',
          LANG: 'en_US.UTF-8',
        },
      });

      // Buffer pour assembler les séquences OSC qui peuvent arriver en plusieurs chunks
      let oscBuf = '';

      ptyProcess.onData((data) => {
        // Cherche et extrait les séquences OSC 777 : ESC]777;COMMANDE\x07
        // Elles arrivent parfois en plusieurs chunks → on bufférise
        oscBuf += data;

        let out = oscBuf;
        let changed = false;

        // Extraire toutes les séquences complètes
        const OSC_RE = /\x1b\]777;([^\x07]*)\x07/g;
        let match;
        while ((match = OSC_RE.exec(oscBuf)) !== null) {
          const cmd = match[1].trim();
          if (cmd) {
            checkValidations(ws, cmd);
          }
          changed = true;
        }

        if (changed) {
          // Supprimer les séquences avant d'envoyer au client (invisible)
          out = oscBuf.replace(/\x1b\]777;[^\x07]*\x07/g, '');
          // Garder les séquences incomplètes dans le buffer
          oscBuf = oscBuf.replace(/.*\x07/gs, '');
          if (!oscBuf.includes('\x1b]777;')) oscBuf = '';
        } else {
          // Pas de séquence complète — garder seulement ce qui pourrait être le début d'une
          const partial = oscBuf.lastIndexOf('\x1b]777;');
          if (partial !== -1) {
            out = oscBuf.slice(0, partial);
            oscBuf = oscBuf.slice(partial);
          } else {
            out = oscBuf;
            oscBuf = '';
          }
        }

        if (out) {
          try { ws.send(JSON.stringify({ type: 'output', data: out })); } catch {}
        }
      });

      ptyProcess.onExit(() => {
        try { ws.send(JSON.stringify({ type: 'pty_exit' })); } catch {}
      });
    }

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      // ── init ──────────────────────────────────────────────────────────────
      if (msg.type === 'init') {
        if (ptyProcess) { try { ptyProcess.kill(); } catch {} }
        ws._validations = msg.validations || [];
        ws._completedValidations = new Set();

        const workId = `${msg.kind || 'level'}-${msg.id}-${Date.now()}`;
        const workDir = path.join(os.tmpdir(), 'edulinux', workId);
        fs.mkdirSync(workDir, { recursive: true });
        ws._workDir = workDir;

        createFiles(workDir, msg.fileSystem || {});

        if (msg.hints && msg.hints.length > 0) {
          const txt = '# Indices\n\n' + msg.hints.map((h, i) => `${i + 1}. ${h}`).join('\n');
          fs.writeFileSync(path.join(workDir, '.hints'), txt, 'utf8');
        }

        try {
          spawnShell(workDir, msg.cols, msg.rows);
          ws.send(JSON.stringify({ type: 'ready' }));
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', message: String(err.message) }));
        }
      }

      // ── next_step (scenarios) ─────────────────────────────────────────────
      if (msg.type === 'next_step' && ws._workDir) {
        createFiles(ws._workDir, msg.fileSystem || {});
        ws._validations = msg.validations || [];
        ws._completedValidations = new Set();
        // Inject a separator into the terminal
        if (ptyProcess) {
          ptyProcess.write('\r');
        }
        try { ws.send(JSON.stringify({ type: 'step_ready' })); } catch {}
      }

      // ── input ─────────────────────────────────────────────────────────────
      // La validation se fait via PROMPT_COMMAND+history -a, pas ici
      if (msg.type === 'input' && ptyProcess) {
        try { ptyProcess.write(msg.data || ''); } catch {}
      }

      // ── resize ────────────────────────────────────────────────────────────
      if (msg.type === 'resize' && ptyProcess) {
        try {
          ptyProcess.resize(Math.max(10, msg.cols || 80), Math.max(3, msg.rows || 24));
        } catch {}
      }
    });

    ws.on('close', () => {
      if (ptyProcess) { try { ptyProcess.kill(); } catch {} }
    });

    ws.on('error', (err) => {
      console.error('[edulinux ws]', err.message);
    });
  });

  server.listen(port, hostname, () => {
    console.log(`\n  \x1b[32m▶ EduLinux\x1b[0m  http://${hostname}:${port}\n`);
  });
}).catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
