'use strict';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const pty = require('node-pty');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');
const {
  validateFileSystemPath,
  verifyPtyToken,
  validateTerminalSize,
  generateWorkDir,
  isAllowedOrigin,
} = require('./lib/security');
const logger = require('./lib/logger');
const { capBuffer } = require('./lib/buffer-utils');

// ─── Sandbox mode ─────────────────────────────────────────────────────────────
// When WORKDIR_HOST_PATH is set (production), PTY sessions run in isolated
// sibling Docker containers instead of directly in this container.
const WORKDIR_HOST_PATH = process.env.WORKDIR_HOST_PATH || null;
const USE_SANDBOX = Boolean(WORKDIR_HOST_PATH);

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ─── Filesystem helpers ───────────────────────────────────────────────────────

function createFiles(baseDir, fileSystem) {
  if (!fileSystem || typeof fileSystem !== 'object') return;
  for (const [key, value] of Object.entries(fileSystem)) {
    const fullPath = validateFileSystemPath(baseDir, key);
    if (!fullPath) continue; // path traversal bloqué

    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
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
      } else if (typeof value === 'object' && value !== null && 'content' in value && typeof value.content === 'string') {
        // { content: string, mode: number } — fichier avec permissions explicites
        const content = value.content.endsWith('\n') ? value.content : value.content + '\n';
        fs.writeFileSync(fullPath, content, 'utf8');
        if (typeof value.mode === 'number') {
          fs.chmodSync(fullPath, value.mode);
        }
      } else if (typeof value === 'object' && value !== null) {
        fs.mkdirSync(fullPath, { recursive: true });
        createFiles(fullPath, value);
      }
    } catch (e) {
      logger.warn({ path: fullPath, err: e.message }, 'createFiles: skipped path');
    }
  }
}

// ─── Input buffer helpers ─────────────────────────────────────────────────────

/** Bash sur macOS/Linux (prod = Linux dans Docker, local souvent Apple Silicon). */
function resolveBashPath() {
  if (process.platform === 'win32') return 'cmd.exe';
  const candidates = ['/bin/bash', '/usr/local/bin/bash', '/opt/homebrew/bin/bash'];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      /* ignore */
    }
  }
  return '/bin/bash';
}

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

// ─── Flag-based output detection ─────────────────────────────────────────────

function checkFlags(ws, outputChunk) {
  if (!ws._flags || ws._flags.length === 0) return;

  // Accumulate output, strip ANSI escape codes before scanning
  const stripped = outputChunk.replace(/\x1b\[[0-9;]*[mGKHFABCDJlh]/g, '').replace(/\x1b\][^\x07]*\x07/g, '');
  ws._outputBuffer = capBuffer((ws._outputBuffer || '') + stripped);

  const flags = ws._flags;
  const completed = ws._completedFlags;
  const newly = [];

  for (let i = 0; i < flags.length; i++) {
    if (completed.has(i)) continue;
    const flag = flags[i];
    let matched = false;

    if (flag.outputPattern) {
      try {
        matched = new RegExp(flag.outputPattern, 'i').test(ws._outputBuffer);
      } catch { /* invalid regex */ }
    } else if (flag.outputContains) {
      matched = ws._outputBuffer.includes(flag.outputContains);
    }

    if (matched) {
      completed.add(i);
      newly.push(i);
    }
  }

  for (const idx of newly) {
    try {
      ws.send(JSON.stringify({
        type: 'flag_found',
        index: idx,
        id: flags[idx].id,
        question: flags[idx].question,
      }));
    } catch {}
  }

  if (newly.length > 0 && completed.size === flags.length) {
    try { ws.send(JSON.stringify({ type: 'all_flags_found' })); } catch {}
  }
}

// ─── OSC 777 extraction — partagé entre shell local et docker ────────────────
const OSC_MAX_BUF = 4096;

/**
 * Extrait les séquences OSC 777 d'un chunk PTY, valide les commandes,
 * et retourne les données épurées à envoyer au client.
 * @param {string} data      - chunk brut
 * @param {string} oscBuf    - buffer OSC accumulé
 * @param {object} ws        - WebSocket client
 * @returns {{ out: string, nextBuf: string }}
 */
function processOscData(data, oscBuf, ws) {
  let buf = oscBuf + data;
  if (buf.length > OSC_MAX_BUF) buf = buf.slice(-(OSC_MAX_BUF / 2));

  const OSC_RE = /\x1b\]777;([^\x07]*)\x07/g;
  let out = buf;
  let changed = false;
  let match;

  OSC_RE.lastIndex = 0;
  while ((match = OSC_RE.exec(buf)) !== null) {
    const cmd = match[1].trim();
    if (cmd) checkValidations(ws, cmd);
    changed = true;
  }

  let nextBuf;
  if (changed) {
    out     = buf.replace(/\x1b\]777;[^\x07]*\x07/g, '');
    nextBuf = buf.replace(/.*\x07/gs, '');
    if (!nextBuf.includes('\x1b]777;')) nextBuf = '';
  } else {
    const partial = buf.lastIndexOf('\x1b]777;');
    if (partial !== -1) { out = buf.slice(0, partial); nextBuf = buf.slice(partial); }
    else                { out = buf;                   nextBuf = ''; }
  }
  return { out, nextBuf };
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
    if (pathname === '/pty') {
      const origin = req.headers['origin'];
      if (!isAllowedOrigin(origin, process.env.NEXT_PUBLIC_APP_URL, process.env.NODE_ENV === 'production')) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
    // Next.js HMR gère ses propres sockets — ne pas interférer
  });

  wss.on('connection', (ws) => {
    let ptyProcess = null;

    ws._validations = [];
    ws._completedValidations = new Set();
    ws._workDir = null;
    ws._userId = null;
    ws._flags = [];
    ws._completedFlags = new Set();
    ws._outputBuffer = '';
    ws._containerName = null;

    function spawnShell(workDir, cols, rows) {
      const containerName = `pty-${crypto.randomBytes(8).toString('hex')}`;
      ws._containerName = containerName;

      if (USE_SANDBOX) {
        // ── Sandbox mode (production) — run bash in an isolated sibling container ──
        // HOME inside the container is always /home/student (the bind-mount target)
        const containerHome = '/home/student';
        const histFile = `${containerHome}/.bash_history`;
        const bashrcFile = path.join(workDir, '.bashrc');

        // .edulinux_home stores the container-side home path for the custom pwd() function
        fs.writeFileSync(path.join(workDir, '.edulinux_home'), containerHome, 'utf8');

        // Bashrc minimal — PROMPT_COMMAND envoie la dernière commande dans le flux PTY
        // via une séquence OSC invisible (ESC]777;CMD\x07).
        // Le serveur l'intercepte dans onData, valide, et la supprime avant envoi au client.
        // Fonctionne avec l'autocomplétion Tab, les flèches, tout.
        fs.writeFileSync(bashrcFile, [
          `PS1='\\[\\033[01;32m\\]student@edulinux\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '`,
          `HOME="${containerHome}"`,
          `HISTFILE="${histFile}"`,
          'HISTSIZE=1000',
          'HISTFILESIZE=1000',
          'HISTCONTROL=ignoredups',
          `PROMPT_COMMAND='__ec=$(history 1 | sed "s/^ *[0-9]* *//"); printf "\\033]777;%s\\007" "$__ec"; history -a'`,
          'pwd() {',
          '  local p w',
          '  p=$(command pwd)',
          '  w=""',
          '  [ -f "$HOME/.edulinux_home" ] && IFS= read -r w < "$HOME/.edulinux_home"',
          '  if [ -n "$w" ] && [ "${p#$w}" != "$p" ]; then echo "~${p#$w}"; else echo "$p"; fi',
          '}',
          `export PATH="$HOME/bin:$PATH"`,
        ].join('\n') + '\n', 'utf8');

        // Compute the HOST-side path for the docker -v bind mount.
        // workDir is under /tmp/edulinux/… inside the app container, which is bind-mounted
        // from /opt/edulinux/workdirs/… on the host. Replace the prefix accordingly.
        const appTmpBase = path.join(os.tmpdir(), 'edulinux');
        const hostWorkDir = workDir.replace(appTmpBase, WORKDIR_HOST_PATH);

        const safeSize = validateTerminalSize(cols, rows);
        try {
          ptyProcess = pty.spawn('docker', [
            'run', '--rm',
            '--name', containerName,
            '-it',
            '--network=none',
            '--memory=96m',
            '--memory-swap=96m',
            '--pids-limit=40',
            '--cap-drop=ALL',
            '--security-opt=no-new-privileges',
            '-e', 'HOME=/home/student',
            '-e', 'TERM=xterm-256color',
            '-e', 'COLORTERM=truecolor',
            '-e', `LANG=${process.env.LANG || 'en_US.UTF-8'}`,
            '-v', `${hostWorkDir}:/home/student`,
            '-w', '/home/student',
            '--user', 'student',
            'edulinux-sandbox:latest',
            'bash', '--noprofile', '--rcfile', '/home/student/.bashrc', '-i',
          ], {
            name: 'xterm-256color',
            cols: safeSize.cols,
            rows: safeSize.rows,
          });
        } catch (e) {
          logger.error({ containerName, err: e.message }, 'docker run sandbox failed');
          throw e;
        }
      } else {
        // ── Dev mode fallback — local bash shell (no WORKDIR_HOST_PATH set) ──
        const shell = resolveBashPath();
        const histFile = path.join(workDir, '.bash_history');
        const bashrcFile = path.join(workDir, '.bashrc');
        // Chemin brut dans un fichier — évite sed "s|${workDir}|…" si le chemin contient | ou " (bashrc cassé)
        fs.writeFileSync(path.join(workDir, '.edulinux_home'), workDir, 'utf8');

        fs.writeFileSync(bashrcFile, [
          `PS1='\\[\\033[01;32m\\]student@edulinux\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '`,
          `HISTFILE="${histFile}"`,
          'HISTSIZE=1000',
          'HISTFILESIZE=1000',
          'HISTCONTROL=ignoredups',
          `PROMPT_COMMAND='__ec=$(history 1 | sed "s/^ *[0-9]* *//"); printf "\\033]777;%s\\007" "$__ec"; history -a'`,
          'pwd() {',
          '  local p w',
          '  p=$(command pwd)',
          '  w=""',
          '  [ -f "$HOME/.edulinux_home" ] && IFS= read -r w < "$HOME/.edulinux_home"',
          '  if [ -n "$w" ] && [ "${p#$w}" != "$p" ]; then echo "~${p#$w}"; else echo "$p"; fi',
          '}',
          `export PATH="$HOME/bin:$PATH"`,
        ].join('\n') + '\n', 'utf8');

        const args = process.platform === 'win32'
          ? []
          : ['--noprofile', '--rcfile', bashrcFile, '-i'];

        try {
          const safeSize = validateTerminalSize(cols, rows);
          ptyProcess = pty.spawn(shell, args, {
            name: 'xterm-256color',
            cols: safeSize.cols,
            rows: safeSize.rows,
            cwd: workDir,
            env: {
              ...process.env,
              HOME: workDir,
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              PATH: (process.env.PATH || '') + ':/usr/local/sbin:/usr/sbin:/sbin:/usr/local/bin',
              LANG: process.env.LANG || 'en_US.UTF-8',
            },
          });
        } catch (e) {
          logger.error({ shell, err: e.message }, 'pty.spawn failed');
          throw e;
        }
      }

      let oscBuf = '';
      ptyProcess.onData((data) => {
        if (ws._flags && ws._flags.length > 0) checkFlags(ws, data);
        const { out, nextBuf } = processOscData(data, oscBuf, ws);
        oscBuf = nextBuf;
        if (out) { try { ws.send(JSON.stringify({ type: 'output', data: out })); } catch {} }
      });

      ptyProcess.onExit(() => {
        try { ws.send(JSON.stringify({ type: 'pty_exit' })); } catch {}
      });
    }

    function spawnDockerShell(container, cols, rows) {
      const safeSize = validateTerminalSize(cols, rows);
      try {
        ptyProcess = pty.spawn('docker', [
          'exec', '-it', container,
          'bash', '--login',
        ], {
          name: 'xterm-256color',
          cols: safeSize.cols,
          rows: safeSize.rows,
        });
      } catch (e) {
        logger.error({ container, err: e.message }, 'docker exec failed');
        throw e;
      }

      let oscBuf = '';
      ptyProcess.onData((data) => {
        if (ws._flags && ws._flags.length > 0) checkFlags(ws, data);
        const { out, nextBuf } = processOscData(data, oscBuf, ws);
        oscBuf = nextBuf;
        if (out) { try { ws.send(JSON.stringify({ type: 'output', data: out })); } catch {} }
      });

      ptyProcess.onExit(() => {
        try { ws.send(JSON.stringify({ type: 'pty_exit' })); } catch {}
      });
    }

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      // Rejette tout message non-init avant authentification
      if (!ws._userId && msg.type !== 'init') return;

      // ── init ──────────────────────────────────────────────────────────────
      if (msg.type === 'init') {
        // ── Auth : vérifier le token éphémère ──────────────────────────────
        const authResult = verifyPtyToken(msg.token);
        if (!authResult) {
          try { ws.close(4401, 'Unauthorized'); } catch {}
          return;
        }
        ws._userId = authResult.userId;

        if (ptyProcess) { try { ptyProcess.kill(); } catch {} }
        ws._validations = msg.validations || [];
        ws._completedValidations = new Set();

        const workDir = generateWorkDir(ws._userId, msg.kind || 'level', msg.id);
        fs.mkdirSync(workDir, { recursive: true, mode: 0o700 });
        ws._workDir = workDir;

        // Parse flags for scenario flag-based validation
        ws._flags = msg.flags || [];
        ws._completedFlags = new Set();
        ws._outputBuffer = '';

        // Docker exec mode vs local shell mode
        if (msg.labContainer) {
          // Advanced scenario: exec into Docker container
          try {
            spawnDockerShell(msg.labContainer, msg.cols, msg.rows);
            ws.send(JSON.stringify({ type: 'ready' }));
          } catch (err) {
            ws.send(JSON.stringify({ type: 'error', message: `Lab container '${msg.labContainer}' not available. Start labs with: docker compose -f docker-compose.labs.yml up -d` }));
          }
        } else {
          // Normal mode: local bash shell
          createFiles(workDir, msg.fileSystem || {});

          if (msg.hints && msg.hints.length > 0) {
            const txt = '# Indices\n\n' + msg.hints.map((h, i) => `${i + 1}. ${h}`).join('\n');
            fs.writeFileSync(path.join(workDir, '.hints'), txt, 'utf8');
          }

          const { cols, rows } = validateTerminalSize(msg.cols, msg.rows);
          try {
            spawnShell(workDir, cols, rows);
            ws.send(JSON.stringify({ type: 'ready' }));
          } catch (err) {
            ws.send(JSON.stringify({ type: 'error', message: String(err.message) }));
          }
        }
      }

      // ── next_step (scenarios) ─────────────────────────────────────────────
      if (msg.type === 'next_step' && ws._workDir) {
        // Reset flags for new step
        ws._flags = msg.flags || [];
        ws._completedFlags = new Set();
        ws._outputBuffer = '';

        if (!msg.labContainer) {
          createFiles(ws._workDir, msg.fileSystem || {});
        }
        ws._validations = msg.validations || [];
        ws._completedValidations = new Set();
        // Inject a separator into the terminal
        if (ptyProcess) ptyProcess.write('\r');
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
      if (ws._containerName) {
        // Force-remove container in case it's still running (e.g. ptyProcess kill didn't propagate)
        execFile('docker', ['rm', '-f', ws._containerName], () => {});
      }
      if (ws._workDir) {
        try { fs.rmSync(ws._workDir, { recursive: true, force: true }); } catch {}
      }
    });

    ws.on('error', (err) => {
      logger.error({ err: err.message }, 'WebSocket error');
    });
  });

  server.listen(port, hostname, () => {
    logger.info({ port, hostname }, 'EduLinux ready');
  });

  function shutdown(signal) {
    logger.info({ signal }, 'graceful shutdown');
    wss.clients.forEach(c => { try { c.close(1001, 'Server shutdown'); } catch {} });
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => { logger.error('Forced exit after 10s timeout'); process.exit(1); }, 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}).catch((err) => {
  logger.error({ err: err.message }, 'Server failed to start');
  process.exit(1);
});
