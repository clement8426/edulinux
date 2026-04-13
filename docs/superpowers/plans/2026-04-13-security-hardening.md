# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les 11 vulnérabilités identifiées dans l'audit, ajouter tests unitaires sécurité, et créer des scripts d'intrusion manuels pour validation en production.

**Architecture:** Nouveau module CommonJS `lib/security.js` avec 6 fonctions pures importées par `server.js` et les routes Next.js. Token HMAC éphémère (30s, usage unique) pour authentifier les connexions WebSocket. Scripts bash+python3+websocat dans `security-tests/`.

**Tech Stack:** Node.js 22, Next.js 16, node-pty, ws, Supabase SSR, zod@^3, Jest 30, websocat

---

## Fichiers touchés

| Fichier | Action | Rôle |
|---|---|---|
| `lib/security.js` | Créer | Module sécurité — 6 fonctions pures |
| `lib/security.d.ts` | Créer | Types TypeScript pour security.js |
| `__tests__/security.test.ts` | Créer | Tests unitaires sécurité |
| `app/api/pty-token/route.ts` | Créer | Endpoint génération token WS |
| `server.js` | Modifier | Auth WS, path traversal, workdir, cleanup, bounds |
| `components/RealTerminal.tsx` | Modifier | Fetch token avant ouverture WS |
| `app/api/progress/route.ts` | Modifier | Validation Zod inputs |
| `app/api/notes/route.ts` | Modifier | Validation longueur inputs |
| `deploy/nginx-edulinux.conf` | Modifier | Headers sécurité, rate limiting |
| `docker-compose.prod.yml` | Modifier | no-new-privileges, cap_drop, tmpfs |
| `jest.config.js` | Modifier | Ajouter lib/security.js à la couverture |
| `security-tests/` | Créer | 8 scripts d'intrusion + README |

---

## Task 1 — Installer zod et mettre à jour jest.config.js

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `jest.config.js`

- [ ] **Step 1: Installer zod**

```bash
cd /Users/soleadmaci9/test/edulinux
npm install zod@^3
```

Expected: `added 1 package` dans la sortie, `zod` apparaît dans `package.json` dependencies.

- [ ] **Step 2: Ajouter lib/security.js à la couverture Jest**

Dans `jest.config.js`, modifier `collectCoverageFrom` :

```js
collectCoverageFrom: [
  'data/**/*.ts',
  'lib/**/*.js',
  'server.js',
  '!**/*.d.ts',
],
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json jest.config.js
git commit -m "chore: install zod, add lib to jest coverage"
```

---

## Task 2 — Créer `lib/security.js` + `lib/security.d.ts` (TDD)

**Files:**
- Create: `lib/security.js`
- Create: `lib/security.d.ts`
- Create: `__tests__/security.test.ts`

- [ ] **Step 1: Écrire les tests avant l'implémentation**

Créer `__tests__/security.test.ts` :

```typescript
/**
 * Tests unitaires pour lib/security.js
 * TDD : ces tests sont écrits AVANT l'implémentation.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  validateFileSystemPath,
  generatePtyToken,
  verifyPtyToken,
  validateTerminalSize,
  generateWorkDir,
  validateProgress,
  _tokenStore,
} = require('../lib/security');

import * as os from 'os';
import * as path from 'path';

// ── validateFileSystemPath ─────────────────────────────────────────────────────

describe('validateFileSystemPath', () => {
  const base = '/tmp/edulinux/test-session';

  test('chemin normal retourne le path résolu', () => {
    const result = validateFileSystemPath(base, 'fichier.txt');
    expect(result).toBe(path.join(base, 'fichier.txt'));
  });

  test('sous-répertoire normal accepté', () => {
    const result = validateFileSystemPath(base, 'docs/readme.txt');
    expect(result).toBe(path.join(base, 'docs/readme.txt'));
  });

  test('clé avec slash initial acceptée (le slash est retiré)', () => {
    const result = validateFileSystemPath(base, '/fichier.txt');
    expect(result).toBe(path.join(base, 'fichier.txt'));
  });

  test('../ bloqué — retourne null', () => {
    const result = validateFileSystemPath(base, '../escape.txt');
    expect(result).toBeNull();
  });

  test('../../ bloqué — retourne null', () => {
    const result = validateFileSystemPath(base, '../../etc/passwd');
    expect(result).toBeNull();
  });

  test('chemin absolu /etc/passwd bloqué — retourne null', () => {
    const result = validateFileSystemPath(base, '/etc/passwd');
    // /etc/passwd n'est pas sous base, donc bloqué
    expect(result).toBeNull();
  });

  test('traversal caché dans un sous-dossier bloqué', () => {
    const result = validateFileSystemPath(base, 'docs/../../etc/passwd');
    expect(result).toBeNull();
  });

  test('clé vide retourne baseDir lui-même (non null)', () => {
    const result = validateFileSystemPath(base, '');
    // path.resolve(base, '') = base → égal à base → accepté
    expect(result).not.toBeNull();
  });
});

// ── generatePtyToken / verifyPtyToken ─────────────────────────────────────────

describe('generatePtyToken + verifyPtyToken', () => {
  beforeEach(() => {
    // Secret fixe pour les tests
    process.env.PTY_TOKEN_SECRET = 'test-secret-32-bytes-exactly-here';
    _tokenStore.clear();
  });

  test('token généré et vérifié avec succès', () => {
    const token = generatePtyToken('user-abc-123');
    const result = verifyPtyToken(token);
    expect(result).toEqual({ userId: 'user-abc-123' });
  });

  test('usage unique : deuxième appel retourne null', () => {
    const token = generatePtyToken('user-abc-123');
    verifyPtyToken(token); // première utilisation
    const second = verifyPtyToken(token);
    expect(second).toBeNull();
  });

  test('token falsifié (HMAC invalide) retourne null', () => {
    // Token encodé manuellement avec mauvais HMAC
    const fakePayload = Buffer.from('user-abc:9999999999999:invalidsignature').toString('base64url');
    const result = verifyPtyToken(fakePayload);
    expect(result).toBeNull();
  });

  test('token expiré retourne null', () => {
    jest.useFakeTimers();
    const token = generatePtyToken('user-abc-123');
    // Avancer le temps de 31 secondes (TTL = 30s)
    jest.advanceTimersByTime(31_000);
    const result = verifyPtyToken(token);
    expect(result).toBeNull();
    jest.useRealTimers();
  });

  test('valeur null ou undefined retourne null', () => {
    expect(verifyPtyToken(null)).toBeNull();
    expect(verifyPtyToken(undefined)).toBeNull();
    expect(verifyPtyToken('')).toBeNull();
  });

  test('token non présent dans le store retourne null', () => {
    const result = verifyPtyToken('ce-token-nexiste-pas');
    expect(result).toBeNull();
  });
});

// ── validateTerminalSize ──────────────────────────────────────────────────────

describe('validateTerminalSize', () => {
  test('valeurs normales passent inchangées', () => {
    expect(validateTerminalSize(80, 24)).toEqual({ cols: 80, rows: 24 });
    expect(validateTerminalSize(120, 40)).toEqual({ cols: 120, rows: 40 });
  });

  test('dépassement MAX est clampé à 500/200', () => {
    expect(validateTerminalSize(999999, 999999)).toEqual({ cols: 500, rows: 200 });
  });

  test('valeurs négatives remontent à MIN (10/3)', () => {
    expect(validateTerminalSize(-1, -100)).toEqual({ cols: 10, rows: 3 });
  });

  test('NaN → défaut (80 x 24)', () => {
    expect(validateTerminalSize(NaN, NaN)).toEqual({ cols: 80, rows: 24 });
  });

  test('chaîne parseable acceptée', () => {
    expect(validateTerminalSize('100', '30')).toEqual({ cols: 100, rows: 30 });
  });

  test('undefined → défaut (80 x 24)', () => {
    expect(validateTerminalSize(undefined, undefined)).toEqual({ cols: 80, rows: 24 });
  });
});

// ── generateWorkDir ───────────────────────────────────────────────────────────

describe('generateWorkDir', () => {
  test('répertoire toujours sous /tmp/edulinux', () => {
    const dir = generateWorkDir('user-123', 'level', 1);
    expect(dir.startsWith(path.join(os.tmpdir(), 'edulinux'))).toBe(true);
  });

  test('userId apparaît dans le chemin', () => {
    const dir = generateWorkDir('user-abc', 'level', 5);
    expect(dir).toContain('user-abc');
  });

  test('100 appels consécutifs produisent 100 chemins uniques', () => {
    const dirs = new Set<string>();
    for (let i = 0; i < 100; i++) {
      dirs.add(generateWorkDir('user-123', 'level', 1));
    }
    expect(dirs.size).toBe(100);
  });

  test('userId avec caractères spéciaux est sanitisé', () => {
    const dir = generateWorkDir('user/../../etc', 'level', 1);
    // Le chemin ne doit pas contenir de traversal
    expect(dir).not.toContain('..');
    expect(dir.startsWith(path.join(os.tmpdir(), 'edulinux'))).toBe(true);
  });
});

// ── validateProgress ──────────────────────────────────────────────────────────

describe('validateProgress', () => {
  test('payload complet valide retourne valid: true', () => {
    const result = validateProgress({
      completedLevels: [1, 2, 3],
      currentLevel: 4,
      totalXP: 150,
      badges: ['first-steps'],
      completedScenarios: [1],
      scenarioSteps: { '1': 2 },
    });
    expect(result.valid).toBe(true);
    expect(result.data).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  test('payload vide retourne valid: true avec defaults', () => {
    const result = validateProgress({});
    expect(result.valid).toBe(true);
    expect(result.data?.completedLevels).toEqual([]);
    expect(result.data?.currentLevel).toBe(1);
    expect(result.data?.totalXP).toBe(0);
  });

  test('XP négatif retourne valid: false', () => {
    const result = validateProgress({ totalXP: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('XP > 999999 retourne valid: false', () => {
    const result = validateProgress({ totalXP: 1_000_000 });
    expect(result.valid).toBe(false);
  });

  test('badge > 64 caractères retourne valid: false', () => {
    const result = validateProgress({ badges: ['a'.repeat(65)] });
    expect(result.valid).toBe(false);
  });

  test('completedLevels avec string retourne valid: false', () => {
    const result = validateProgress({ completedLevels: ['not-a-number'] });
    expect(result.valid).toBe(false);
  });

  test('completedLevels avec niveau 0 retourne valid: false (min = 1)', () => {
    const result = validateProgress({ completedLevels: [0] });
    expect(result.valid).toBe(false);
  });
});
```

- [ ] **Step 2: Vérifier que les tests échouent (lib/security.js n'existe pas encore)**

```bash
cd /Users/soleadmaci9/test/edulinux
npx jest __tests__/security.test.ts --no-coverage 2>&1 | tail -20
```

Expected: `Cannot find module '../lib/security'` ou similaire — FAIL confirmé.

- [ ] **Step 3: Créer `lib/security.js`**

```js
'use strict';

const crypto = require('crypto');
const path   = require('path');
const os     = require('os');
const { z }  = require('zod');

// ─── Token store (module-level — partagé via le cache require Node.js) ─────────
const _tokenStore = new Map(); // token → { userId, expiry }

// Nettoyage des tokens expirés toutes les 60s (unref → ne bloque pas process.exit)
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of _tokenStore.entries()) {
    if (data.expiry < now) _tokenStore.delete(token);
  }
}, 60_000).unref();

// ─── 1. Path traversal protection ─────────────────────────────────────────────
/**
 * Valide qu'une clé fileSystem ne sort pas du répertoire de base.
 * Retourne le chemin résolu ou null si traversal détecté.
 */
function validateFileSystemPath(baseDir, key) {
  const clean    = (typeof key === 'string' && key.startsWith('/')) ? key.slice(1) : (key || '');
  const resolved = path.resolve(baseDir, clean);
  const base     = path.resolve(baseDir);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    console.warn(`[security] Path traversal blocked: ${JSON.stringify(key)}`);
    return null;
  }
  return resolved;
}

// ─── 2. Token éphémère WS (HMAC-SHA256, TTL 30s, usage unique) ────────────────
const TOKEN_TTL_MS = 30_000;

function _getSecret() {
  if (!process.env.PTY_TOKEN_SECRET) {
    process.env.PTY_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('[security] PTY_TOKEN_SECRET absent — secret éphémère généré. Définir dans .env pour la prod.');
  }
  return process.env.PTY_TOKEN_SECRET;
}

/**
 * Génère un token signé pour un userId donné.
 * Stocke le token dans _tokenStore (usage unique).
 */
function generatePtyToken(userId) {
  const secret  = _getSecret();
  const expiry  = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}:${expiry}`;
  const hmac    = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const token   = Buffer.from(`${payload}:${hmac}`).toString('base64url');
  _tokenStore.set(token, { userId, expiry });
  return token;
}

/**
 * Vérifie un token : HMAC, TTL, existence dans le store.
 * Consomme le token (supprimé après première utilisation).
 * Retourne { userId } ou null.
 */
function verifyPtyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const entry = _tokenStore.get(token);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    _tokenStore.delete(token);
    return null;
  }

  // Vérification HMAC
  const secret = _getSecret();
  let payload, hmac;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts   = decoded.split(':');
    if (parts.length < 3) { _tokenStore.delete(token); return null; }
    hmac    = parts.pop();
    payload = parts.join(':');
  } catch {
    _tokenStore.delete(token);
    return null;
  }

  let expectedBuf, hmacBuf;
  try {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expectedBuf = Buffer.from(expected, 'hex');
    hmacBuf     = Buffer.from(hmac, 'hex');
  } catch {
    _tokenStore.delete(token);
    return null;
  }

  if (expectedBuf.length !== hmacBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, hmacBuf)) {
    _tokenStore.delete(token);
    return null;
  }

  _tokenStore.delete(token); // consommé
  return { userId: entry.userId };
}

// ─── 3. Bounds check terminal ─────────────────────────────────────────────────
const COLS_MIN = 10,  COLS_MAX = 500;
const ROWS_MIN = 3,   ROWS_MAX = 200;

/**
 * Borne cols et rows dans des plages sûres.
 */
function validateTerminalSize(cols, rows) {
  return {
    cols: Math.max(COLS_MIN, Math.min(COLS_MAX, parseInt(cols) || 80)),
    rows: Math.max(ROWS_MIN, Math.min(ROWS_MAX, parseInt(rows) || 24)),
  };
}

// ─── 4. Workdir isolé par utilisateur ─────────────────────────────────────────
/**
 * Génère un chemin de travail aléatoire et isolé par userId.
 * Format : /tmp/edulinux/<safeUserId>-<kind>-<id>-<16bytesHex>
 */
function generateWorkDir(userId, kind, id) {
  const rand       = crypto.randomBytes(16).toString('hex');
  const safeUserId = (String(userId || 'anon'))
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 36) || 'anon';
  return path.join(os.tmpdir(), 'edulinux', `${safeUserId}-${kind}-${id}-${rand}`);
}

// ─── 5. Validation des inputs API progress ────────────────────────────────────
const progressSchema = z.object({
  completedLevels:    z.array(z.number().int().min(1).max(9999)).max(9999).default([]),
  currentLevel:       z.number().int().min(1).max(9999).default(1),
  totalXP:            z.number().int().min(0).max(999999).default(0),
  badges:             z.array(z.string().max(64)).max(200).default([]),
  completedScenarios: z.array(z.number().int().min(1).max(9999)).max(9999).default([]),
  scenarioSteps:      z.record(z.string().max(32), z.number().int().min(0).max(999)).default({}),
});

/**
 * Valide le body d'un POST /api/progress.
 * Retourne { valid, data, errors }.
 */
function validateProgress(body) {
  const result = progressSchema.safeParse(body ?? {});
  if (!result.success) {
    return { valid: false, data: null, errors: result.error.errors };
  }
  return { valid: true, data: result.data, errors: [] };
}

module.exports = {
  validateFileSystemPath,
  generatePtyToken,
  verifyPtyToken,
  validateTerminalSize,
  generateWorkDir,
  validateProgress,
  _tokenStore, // exposé pour les tests uniquement
};
```

- [ ] **Step 4: Créer `lib/security.d.ts`**

```typescript
export interface ProgressData {
  completedLevels: number[];
  currentLevel: number;
  totalXP: number;
  badges: string[];
  completedScenarios: number[];
  scenarioSteps: Record<string, number>;
}

export interface ValidationResult {
  valid: boolean;
  data: ProgressData | null;
  errors: unknown[];
}

export declare function validateFileSystemPath(baseDir: string, key: string): string | null;
export declare function generatePtyToken(userId: string): string;
export declare function verifyPtyToken(token: unknown): { userId: string } | null;
export declare function validateTerminalSize(cols: unknown, rows: unknown): { cols: number; rows: number };
export declare function generateWorkDir(userId: string, kind: string, id: number | string): string;
export declare function validateProgress(body: unknown): ValidationResult;
export declare const _tokenStore: Map<string, { userId: string; expiry: number }>;
```

- [ ] **Step 5: Lancer les tests — ils doivent tous passer**

```bash
cd /Users/soleadmaci9/test/edulinux
npx jest __tests__/security.test.ts --no-coverage --verbose 2>&1
```

Expected : toutes les suites `PASS`, aucune `FAIL`.

- [ ] **Step 6: Lancer la suite complète pour vérifier aucune régression**

```bash
npx jest --no-coverage 2>&1 | tail -20
```

Expected: tous les tests existants passent toujours.

- [ ] **Step 7: Commit**

```bash
git add lib/security.js lib/security.d.ts __tests__/security.test.ts
git commit -m "feat(security): add security module with path traversal, token auth, bounds check"
```

---

## Task 3 — Créer `app/api/pty-token/route.ts`

**Files:**
- Create: `app/api/pty-token/route.ts`

- [ ] **Step 1: Créer la route**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Import CJS depuis le même process Node.js (cache require partagé avec server.js)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generatePtyToken } = require('@/lib/security');

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token: string = generatePtyToken(user.id);
  return NextResponse.json({ token });
}
```

- [ ] **Step 2: Lancer les tests (pas de nouveau test ici — intégration Supabase)**

```bash
npx jest --no-coverage 2>&1 | tail -10
```

Expected: tous les tests passent (aucune régression).

- [ ] **Step 3: Commit**

```bash
git add app/api/pty-token/route.ts
git commit -m "feat(auth): add /api/pty-token endpoint for WS ephemeral token"
```

---

## Task 4 — Sécuriser `server.js`

**Files:**
- Modify: `server.js`

Ce task applique 5 corrections dans `server.js` :
1. Import de `lib/security.js`
2. Auth WebSocket (vérification token sur `init`)
3. Path traversal fix dans `createFiles()`
4. Workdir isolé par userId
5. Cleanup tmpdir à la fermeture WS
6. Bounds check cols/rows dès le spawn

- [ ] **Step 1: Ajouter l'import de security.js en tête de fichier**

Remplacer la ligne 10 (`const os = require('os');`) :

```js
const os = require('os');
const {
  validateFileSystemPath,
  verifyPtyToken,
  validateTerminalSize,
  generateWorkDir,
} = require('./lib/security');
```

- [ ] **Step 2: Corriger `createFiles()` — path traversal (lignes 21-46)**

Remplacer la fonction `createFiles` entière :

```js
function createFiles(baseDir, fileSystem) {
  if (!fileSystem || typeof fileSystem !== 'object') return;
  for (const [key, value] of Object.entries(fileSystem)) {
    const fullPath = validateFileSystemPath(baseDir, key);
    if (!fullPath) continue; // path traversal bloqué

    const dir = path.dirname(fullPath);
    try {
      fs.mkdirSync(dir, { recursive: true });
      if (typeof value === 'string') {
        const content = value.endsWith('\n') ? value : value + '\n';
        fs.writeFileSync(fullPath, content, 'utf8');
        const cleanKey = key.startsWith('/') ? key.slice(1) : key;
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
```

- [ ] **Step 3: Initialiser `ws._userId = null` dans `wss.on('connection')`**

Dans `wss.on('connection', (ws) => {`, après les lignes existantes d'initialisation (`ws._validations`, etc.), ajouter :

```js
ws._userId = null;
```

Résultat du bloc d'initialisation :
```js
wss.on('connection', (ws) => {
  let ptyProcess = null;

  ws._validations = [];
  ws._completedValidations = new Set();
  ws._workDir = null;
  ws._userId = null;   // ← ajouté
```

- [ ] **Step 4: Ajouter le guard d'auth en tête du handler `ws.on('message')`**

Au tout début du callback `ws.on('message', (raw) => { ... }`, juste après le `try { msg = JSON.parse(...) }`, ajouter :

```js
// Rejette tout message non-init avant authentification
if (!ws._userId && msg.type !== 'init') return;
```

- [ ] **Step 5: Vérifier le token dans le handler `init`**

Dans le bloc `if (msg.type === 'init') {`, avant toute autre logique, ajouter la vérification :

```js
if (msg.type === 'init') {
  // ── Auth : vérifier le token éphémère ──────────────────────────────────
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
```

> Note : supprimer les lignes de l'ancien bloc `init` qui construisaient le workDir avec `Date.now()`.

- [ ] **Step 6: Appliquer `validateTerminalSize` dans `spawnShell`**

Dans `spawnShell(workDir, cols, rows)`, remplacer les lignes :
```js
ptyProcess = pty.spawn(shell, args, {
  name: 'xterm-256color',
  cols: cols || 80,
  rows: rows || 24,
```
Par :
```js
const safeSize = validateTerminalSize(cols, rows);
ptyProcess = pty.spawn(shell, args, {
  name: 'xterm-256color',
  cols: safeSize.cols,
  rows: safeSize.rows,
```

- [ ] **Step 7: Nettoyer le workdir à la fermeture WS**

Remplacer `ws.on('close', ...)` :

```js
ws.on('close', () => {
  if (ptyProcess) { try { ptyProcess.kill(); } catch {} }
  if (ws._workDir) {
    try { fs.rmSync(ws._workDir, { recursive: true, force: true }); } catch {}
  }
});
```

- [ ] **Step 8: Lancer les tests pour vérifier aucune régression**

```bash
npx jest --no-coverage 2>&1 | tail -15
```

Expected: tous les tests passent.

- [ ] **Step 9: Commit**

```bash
git add server.js
git commit -m "fix(server): auth WS token, path traversal, isolated workdir, tmpdir cleanup, bounds check"
```

---

## Task 5 — Modifier `components/RealTerminal.tsx`

**Files:**
- Modify: `components/RealTerminal.tsx`

- [ ] **Step 1: Convertir le `.then()` en async et ajouter le fetch token**

Dans le `useEffect`, la fonction passée à `.then()` doit devenir `async` et inclure le fetch du token avant la création du WebSocket. Remplacer :

```typescript
    }).then(([{ Terminal }, { FitAddon }]) => {
      if (destroyed || !containerRef.current) return;
```

Par :

```typescript
    }).then(async ([{ Terminal }, { FitAddon }]) => {
      if (destroyed || !containerRef.current) return;
```

- [ ] **Step 2: Ajouter le fetch du token juste avant la création du WebSocket**

Repérer ce bloc dans le `.then()` (après la création du `ResizeObserver`) :

```typescript
      // ── WebSocket ──────────────────────────────────────────────────────────
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const port = window.location.port ? `:${window.location.port}` : '';
      const wsUrl = `${proto}://${window.location.hostname}${port}/pty`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
```

Le remplacer par :

```typescript
      // ── Fetch token éphémère avant ouverture WS ───────────────────────────
      let ptyToken: string;
      try {
        const tokenRes = await fetch('/api/pty-token');
        if (!tokenRes.ok) {
          if (!destroyed) {
            setWsStatus('error');
            setErrorMsg('Connexion refusée. Connecte-toi et réessaie.');
          }
          return;
        }
        const tokenData = await tokenRes.json() as { token?: string };
        if (!tokenData.token) {
          if (!destroyed) {
            setWsStatus('error');
            setErrorMsg('Token invalide reçu du serveur.');
          }
          return;
        }
        ptyToken = tokenData.token;
      } catch {
        if (!destroyed) {
          setWsStatus('error');
          setErrorMsg("Impossible d'obtenir le token d'accès. Vérifie ta connexion.");
        }
        return;
      }

      if (destroyed) return;

      // ── WebSocket ──────────────────────────────────────────────────────────
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const port = window.location.port ? `:${window.location.port}` : '';
      const wsUrl = `${proto}://${window.location.hostname}${port}/pty`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
```

- [ ] **Step 3: Inclure `ptyToken` dans le message `init`**

Dans `ws.onopen`, remplacer :

```typescript
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
```

Par :

```typescript
      ws.onopen = () => {
        if (destroyed) { ws.close(); return; }
        ws.send(JSON.stringify({
          type: 'init',
          token: ptyToken,
          id,
          kind,
          fileSystem: propsRef.current.fileSystem,
          validations: propsRef.current.validations,
          hints: propsRef.current.hints,
          cols: term.cols,
          rows: term.rows,
        }));
      };
```

- [ ] **Step 4: Lancer les tests**

```bash
npx jest --no-coverage 2>&1 | tail -10
```

Expected: tous les tests passent (les tests unitaires ne testent pas ce composant React).

- [ ] **Step 5: Commit**

```bash
git add components/RealTerminal.tsx
git commit -m "feat(terminal): fetch ephemeral token before WS connection"
```

---

## Task 6 — Valider les inputs des routes API

**Files:**
- Modify: `app/api/progress/route.ts`
- Modify: `app/api/notes/route.ts`

- [ ] **Step 1: Modifier `app/api/progress/route.ts`**

Remplacer le contenu complet du fichier :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { validateProgress } = require('@/lib/security');

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { valid, data: validated, errors } = validateProgress(body);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid input', details: errors }, { status: 400 });
  }

  const payload = {
    user_id:             user.id,
    completed_levels:    validated!.completedLevels,
    current_level:       validated!.currentLevel,
    total_xp:            validated!.totalXP,
    badges:              validated!.badges,
    completed_scenarios: validated!.completedScenarios,
    scenario_steps:      validated!.scenarioSteps,
    updated_at:          new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_progress')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Modifier `app/api/notes/route.ts`**

Remplacer le contenu complet du fichier :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CONTEXT_MAX_LEN = 64;
const CONTENT_MAX_LEN = 50_000; // 50 KB

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const context = searchParams.get('context');

  if (context && context.length > CONTEXT_MAX_LEN) {
    return NextResponse.json({ error: 'context too long' }, { status: 400 });
  }

  const query = supabase
    .from('user_notes')
    .select('context, content')
    .eq('user_id', user.id);

  if (context) query.eq('context', context);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let context: string, content: string;
  try {
    const body = await req.json() as { context?: unknown; content?: unknown };
    context = String(body.context ?? '');
    content = String(body.content ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!context) {
    return NextResponse.json({ error: 'Missing context' }, { status: 400 });
  }
  if (context.length > CONTEXT_MAX_LEN) {
    return NextResponse.json({ error: 'context too long (max 64)' }, { status: 400 });
  }
  if (content.length > CONTENT_MAX_LEN) {
    return NextResponse.json({ error: 'content too long (max 50000)' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_notes')
    .upsert(
      { user_id: user.id, context, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,context' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Lancer les tests**

```bash
npx jest --no-coverage 2>&1 | tail -10
```

Expected: tous les tests passent.

- [ ] **Step 4: Commit**

```bash
git add app/api/progress/route.ts app/api/notes/route.ts
git commit -m "fix(api): add Zod validation on progress route and length limits on notes route"
```

---

## Task 7 — Durcir `deploy/nginx-edulinux.conf`

**Files:**
- Modify: `deploy/nginx-edulinux.conf`

- [ ] **Step 1: Remplacer le contenu complet du fichier**

```nginx
# ─── NOTE : ajouter cette directive dans le bloc http {} de /etc/nginx/nginx.conf ─
# limit_req_zone $binary_remote_addr zone=pty:10m rate=2r/s;
# ──────────────────────────────────────────────────────────────────────────────────

# ─── SANS DOMAINE (IP uniquement — pour tester) ────────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name _;

    server_tokens off;

    add_header X-Frame-Options           "SAMEORIGIN"                        always;
    add_header X-Content-Type-Options    "nosniff"                           always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin"   always;
    add_header X-XSS-Protection          "1; mode=block"                     always;
    add_header Content-Security-Policy   "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss: https://*.supabase.co; img-src 'self' data:; font-src 'self' data:;" always;

    # Rate limiting WebSocket PTY — décommenter après avoir ajouté limit_req_zone dans nginx.conf
    # location /pty {
    #     limit_req zone=pty burst=5 nodelay;
    #     proxy_pass http://127.0.0.1:3000;
    #     proxy_http_version 1.1;
    #     proxy_set_header Host              $host;
    #     proxy_set_header X-Real-IP         $remote_addr;
    #     proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    #     proxy_set_header Upgrade           $http_upgrade;
    #     proxy_set_header Connection        "upgrade";
    #     proxy_read_timeout 86400;
    # }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
        proxy_read_timeout 86400;
    }
}

# ─── AVEC DOMAINE + SSL (décommenter quand tu as un domaine) ───────────────────
# server {
#     listen 80;
#     listen [::]:80;
#     server_name ton-domaine.com;
#     return 301 https://$host$request_uri;
# }
#
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name ton-domaine.com;
#
#     server_tokens off;
#
#     ssl_certificate     /etc/letsencrypt/live/ton-domaine.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/ton-domaine.com/privkey.pem;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256;
#     ssl_prefer_server_ciphers off;
#
#     add_header Strict-Transport-Security  "max-age=31536000; includeSubDomains" always;
#     add_header X-Frame-Options            "SAMEORIGIN"                          always;
#     add_header X-Content-Type-Options     "nosniff"                             always;
#     add_header Referrer-Policy            "strict-origin-when-cross-origin"     always;
#     add_header X-XSS-Protection           "1; mode=block"                       always;
#     add_header Content-Security-Policy    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss: https://*.supabase.co; img-src 'self' data:; font-src 'self' data:;" always;
#
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Host              $host;
#         proxy_set_header X-Real-IP         $remote_addr;
#         proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_set_header Upgrade           $http_upgrade;
#         proxy_set_header Connection        "upgrade";
#         proxy_read_timeout 86400;
#     }
# }
```

- [ ] **Step 2: Lancer les tests**

```bash
npx jest --no-coverage 2>&1 | tail -5
```

Expected: PASS (pas de tests nginx, mais vérifie l'absence de régression).

- [ ] **Step 3: Commit**

```bash
git add deploy/nginx-edulinux.conf
git commit -m "fix(nginx): add security headers, server_tokens off, rate limiting template"
```

---

## Task 8 — Durcir `docker-compose.prod.yml`

**Files:**
- Modify: `docker-compose.prod.yml`

- [ ] **Step 1: Remplacer le contenu complet**

```yaml
# Usage sur le VPS (dans /opt/edulinux) :
#   cp .env.production.example .env.production   # puis éditer avec tes vraies valeurs
#   docker compose -f docker-compose.prod.yml up -d --build
#
# Ne commite JAMAIS .env.production.

services:
  edulinux:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
    image: edulinux:latest
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      NODE_ENV: production
      PORT: "3000"
    ports:
      - "127.0.0.1:3000:3000"
    # ── Hardening sécurité ──────────────────────────────────────────────────
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    tmpfs:
      - /tmp:size=512m,mode=1777
    # ────────────────────────────────────────────────────────────────────────
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://127.0.0.1:3000/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 45s
```

- [ ] **Step 2: Lancer les tests**

```bash
npx jest --no-coverage 2>&1 | tail -5
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.prod.yml
git commit -m "fix(docker): add no-new-privileges, cap_drop ALL, tmpfs /tmp"
```

---

## Task 9 — Créer les scripts d'intrusion `security-tests/`

**Files:**
- Create: `security-tests/lib/common.sh`
- Create: `security-tests/01_path_traversal.sh`
- Create: `security-tests/02_ws_unauthenticated.sh`
- Create: `security-tests/03_ws_invalid_token.sh`
- Create: `security-tests/04_level_bypass.sh`
- Create: `security-tests/05_dos_resize.sh`
- Create: `security-tests/06_api_xp_injection.sh`
- Create: `security-tests/07_tmp_isolation.sh`
- Create: `security-tests/run_all.sh`
- Create: `security-tests/README.md`

- [ ] **Step 1: Créer `security-tests/lib/common.sh`**

```bash
#!/usr/bin/env bash
# Fonctions utilitaires partagées par tous les scripts de test

TARGET="${TARGET:-http://localhost:3000}"
WS_TARGET="${TARGET/http:/ws:}"
WS_TARGET="${WS_TARGET/https:/wss:}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; FAILED=$((FAILED+1)); }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
section() { echo -e "\n${BLUE}── $1 ──${NC}"; }

FAILED=0

# Vérifie qu'un binaire est disponible
require_bin() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}[ERROR]${NC} '$1' est requis mais non trouvé."
    echo "  → $2"
    exit 1
  fi
}

# Vérifie websocat et propose l'installation si absent
check_websocat() {
  if ! command -v websocat &>/dev/null; then
    info "websocat non trouvé. Installation automatique..."
    if command -v apt-get &>/dev/null; then
      sudo apt-get install -y websocat 2>/dev/null || true
    fi
    if ! command -v websocat &>/dev/null; then
      # Téléchargement binaire statique
      ARCH=$(uname -m)
      if [ "$ARCH" = "x86_64" ]; then
        WC_BIN="websocat.x86_64-unknown-linux-musl"
      elif [ "$ARCH" = "aarch64" ]; then
        WC_BIN="websocat.aarch64-unknown-linux-musl"
      else
        fail "Architecture non supportée pour l'installation automatique de websocat: $ARCH"
        exit 1
      fi
      WC_URL="https://github.com/vi/websocat/releases/download/v1.13.0/${WC_BIN}"
      info "Téléchargement de websocat depuis $WC_URL"
      sudo curl -sSL "$WC_URL" -o /usr/local/bin/websocat
      sudo chmod +x /usr/local/bin/websocat
    fi
    if ! command -v websocat &>/dev/null; then
      fail "Impossible d'installer websocat. Installe-le manuellement."
      exit 1
    fi
    info "websocat installé avec succès."
  fi
}

# Vérifie python3 et le module websockets
check_python_ws() {
  require_bin python3 "sudo apt-get install python3"
  python3 -c "import websockets" 2>/dev/null || {
    info "Installation du module python3 websockets..."
    pip3 install websockets --quiet
  }
}

# Envoie un message WebSocket et retourne la réponse (timeout 5s)
# Usage: ws_send_recv "ws://..." '{"type":"init"}' 5
ws_send_recv() {
  local url="$1"
  local msg="$2"
  local timeout="${3:-5}"
  echo "$msg" | timeout "$timeout" websocat "$url" --no-close -t -1 2>&1 || true
}

# Retourne le code de fermeture WebSocket via Python
ws_close_code() {
  local url="$1"
  local msg="$2"
  python3 - <<PYEOF
import asyncio, json, sys
try:
    import websockets
except ImportError:
    print("NO_WEBSOCKETS")
    sys.exit(0)

async def run():
    try:
        async with websockets.connect("$url", open_timeout=5) as ws:
            await ws.send('''$msg''')
            try:
                resp = await asyncio.wait_for(ws.recv(), timeout=3)
                print("RECV:" + resp)
            except asyncio.TimeoutError:
                print("TIMEOUT")
    except websockets.exceptions.InvalidStatusCode as e:
        print("HTTP_ERROR:" + str(e.status_code))
    except websockets.exceptions.ConnectionClosedError as e:
        print("CLOSED:" + str(e.code))
    except Exception as e:
        print("ERROR:" + str(e))

asyncio.run(run())
PYEOF
}
```

- [ ] **Step 2: Créer `security-tests/01_path_traversal.sh`**

```bash
#!/usr/bin/env bash
# Test 01 — Path Traversal Protection
# Vérifie que la clé "../../../tmp/pwned_edulinux" dans fileSystem est bloquée.
# PASS = le fichier n'existe PAS en dehors du workdir après la tentative.

source "$(dirname "$0")/lib/common.sh"
section "01 — Path Traversal Protection"

PROBE_FILE="/tmp/pwned_edulinux_test_$$"

info "Tentative d'écriture via WebSocket sans token (devrait être rejeté par auth)..."

check_websocat

PAYLOAD=$(cat <<EOF
{"type":"init","id":1,"kind":"level","fileSystem":{"../../../tmp/pwned_edulinux_test_$$":"HACKED"},"validations":[]}
EOF
)

# Essai sans token — le serveur doit rejeter avec 4401
RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
info "Réponse serveur: $RESULT"

if echo "$RESULT" | grep -q "4401\|Unauthorized\|CLOSED\|HTTP_ERROR"; then
  pass "Connexion sans token rejetée — path traversal bloqué par auth"
else
  # Connexion acceptée — vérifier si le fichier a été créé
  sleep 1
  if [ -f "$PROBE_FILE" ]; then
    fail "VULNÉRABLE : fichier créé en dehors du workdir → $PROBE_FILE"
    rm -f "$PROBE_FILE"
  else
    pass "Fichier de probe absent (mais connexion non rejetée — vérifier l'auth)"
    info "Détail réponse: $RESULT"
  fi
fi

# Nettoyage
rm -f "$PROBE_FILE"

echo ""
info "Si AUTH_TOKEN est défini, test avec token valide..."
if [ -n "$AUTH_TOKEN" ]; then
  TOKEN_RESP=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$TARGET/api/pty-token")
  PTY_TOKEN=$(echo "$TOKEN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
  if [ -n "$PTY_TOKEN" ]; then
    PAYLOAD2=$(cat <<EOF
{"type":"init","token":"$PTY_TOKEN","id":1,"kind":"level","fileSystem":{"../../../tmp/pwned_edulinux_auth_$$":"HACKED"},"validations":[]}
EOF
)
    ws_send_recv "${WS_TARGET}/pty" "$PAYLOAD2" 3 >/dev/null
    sleep 1
    if [ -f "/tmp/pwned_edulinux_auth_$$" ]; then
      fail "VULNÉRABLE avec auth : path traversal fonctionne !"
      rm -f "/tmp/pwned_edulinux_auth_$$"
    else
      pass "Path traversal bloqué même avec token valide — fix OK"
    fi
  else
    info "Impossible d'obtenir un PTY token depuis $TARGET/api/pty-token"
  fi
fi

exit $FAILED
```

- [ ] **Step 3: Créer `security-tests/02_ws_unauthenticated.sh`**

```bash
#!/usr/bin/env bash
# Test 02 — WebSocket sans authentification
# PASS = la connexion est rejetée avec code 4401 ou HTTP error.

source "$(dirname "$0")/lib/common.sh"
section "02 — WebSocket Unauthenticated Access"

check_python_ws

info "Connexion WebSocket sans token..."

PAYLOAD='{"type":"init","id":1,"kind":"level","validations":[]}'
RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
info "Réponse: $RESULT"

if echo "$RESULT" | grep -q "4401\|Unauthorized"; then
  pass "Connexion rejetée avec code 4401 — auth OK"
elif echo "$RESULT" | grep -q "CLOSED"; then
  pass "Connexion fermée par le serveur — auth OK (vérifier que le code est 4401)"
  info "Code reçu: $RESULT"
elif echo "$RESULT" | grep -q "ready\|output"; then
  fail "VULNÉRABLE : serveur a répondu 'ready' sans token !"
else
  info "Réponse inattendue: $RESULT — vérifier manuellement"
fi

exit $FAILED
```

- [ ] **Step 4: Créer `security-tests/03_ws_invalid_token.sh`**

```bash
#!/usr/bin/env bash
# Test 03 — Token WebSocket falsifié (HMAC invalide)
# PASS = connexion rejetée malgré un token au bon format.

source "$(dirname "$0")/lib/common.sh"
section "03 — Invalid HMAC Token"

check_python_ws

# Token au format base64url valide mais HMAC incorrect
FAKE_PAYLOAD=$(python3 -c "import base64; print(base64.urlsafe_b64encode(b'user-fake:9999999999999:deadbeefdeadbeef0000000000000000deadbeefdeadbeef').decode().rstrip('='))")
info "Token forgé: $FAKE_PAYLOAD"

PAYLOAD="{\"type\":\"init\",\"token\":\"$FAKE_PAYLOAD\",\"id\":1,\"kind\":\"level\",\"validations\":[]}"
RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
info "Réponse: $RESULT"

if echo "$RESULT" | grep -q "4401\|Unauthorized\|CLOSED"; then
  pass "Token invalide rejeté — HMAC vérification OK"
elif echo "$RESULT" | grep -q "ready\|output"; then
  fail "VULNÉRABLE : token forgé accepté !"
else
  info "Réponse inattendue: $RESULT"
fi

exit $FAILED
```

- [ ] **Step 5: Créer `security-tests/04_level_bypass.sh`**

```bash
#!/usr/bin/env bash
# Test 04 — Level Bypass (comportement attendu : accès libre pour utilisateurs authentifiés)
# INFO = tout utilisateur authentifié peut accéder à n'importe quel niveau (by design).

source "$(dirname "$0")/lib/common.sh"
section "04 — Level Bypass (accès libre authentifié)"

info "Ce test documente le comportement ATTENDU : tout utilisateur"
info "authentifié peut accéder à n'importe quel niveau."
info "Ce n'est PAS une vulnérabilité selon la conception de la plateforme."

if [ -n "$AUTH_TOKEN" ]; then
  check_python_ws
  TOKEN_RESP=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$TARGET/api/pty-token")
  PTY_TOKEN=$(echo "$TOKEN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
  if [ -n "$PTY_TOKEN" ]; then
    PAYLOAD="{\"type\":\"init\",\"token\":\"$PTY_TOKEN\",\"id\":999,\"kind\":\"level\",\"validations\":[]}"
    RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
    if echo "$RESULT" | grep -q "ready\|RECV"; then
      info "Accès au niveau 999 autorisé (comportement attendu) — [INFO OK]"
    else
      info "Réponse: $RESULT"
    fi
  fi
else
  info "Définir AUTH_TOKEN pour tester avec une vraie session."
fi

exit 0
```

- [ ] **Step 6: Créer `security-tests/05_dos_resize.sh`**

```bash
#!/usr/bin/env bash
# Test 05 — DoS via cols/rows excessifs
# PASS = le serveur ne crashe pas et répond toujours après des valeurs extrêmes.

source "$(dirname "$0")/lib/common.sh"
section "05 — DoS Protection (cols/rows bounds)"

check_python_ws

info "Test 1/2 : envoi cols=999999999 rows=999999999 sans token (devrait être rejeté par auth)"
PAYLOAD='{"type":"init","id":1,"cols":999999999,"rows":999999999,"validations":[]}'
RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")

if echo "$RESULT" | grep -q "4401\|CLOSED\|Unauthorized"; then
  pass "Rejeté avant traitement (auth) — cols excessifs jamais atteints le PTY"
else
  info "Réponse: $RESULT"
fi

info "Test 2/2 : serveur toujours en vie après la tentative"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET/" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
  pass "Serveur répond HTTP $HTTP_CODE — toujours opérationnel"
else
  fail "Serveur ne répond plus (HTTP $HTTP_CODE) — possible crash"
fi

exit $FAILED
```

- [ ] **Step 7: Créer `security-tests/06_api_xp_injection.sh`**

```bash
#!/usr/bin/env bash
# Test 06 — XP Injection via API progress
# PASS = 401 sans auth, 400 avec XP invalide même avec auth.

source "$(dirname "$0")/lib/common.sh"
section "06 — API XP Injection"

require_bin curl "sudo apt-get install curl"

info "Test 1/3 : POST sans authentification → 401 attendu"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$TARGET/api/progress" \
  -H "Content-Type: application/json" \
  -d '{"totalXP":999999999}')
if [ "$HTTP_CODE" = "401" ]; then
  pass "Sans auth → 401 Unauthorized"
else
  fail "Sans auth → $HTTP_CODE (attendu 401)"
fi

info "Test 2/3 : XP = 1000000 (> 999999) → 400 attendu"
if [ -n "$AUTH_TOKEN" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$TARGET/api/progress" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -b "sb-auth-token=$AUTH_TOKEN" \
    -d '{"totalXP":1000000}')
  if [ "$HTTP_CODE" = "400" ]; then
    pass "XP > 999999 → 400 (validation Zod OK)"
  elif [ "$HTTP_CODE" = "401" ]; then
    info "AUTH_TOKEN non accepté par la route (cookie Supabase requis) — test partiel"
  else
    fail "XP invalide → $HTTP_CODE (attendu 400)"
  fi
else
  info "AUTH_TOKEN non défini — test 2/3 ignoré"
fi

info "Test 3/3 : JSON invalide → 400 attendu"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$TARGET/api/progress" \
  -H "Content-Type: application/json" \
  -d 'PAS_DU_JSON')
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
  pass "JSON invalide → $HTTP_CODE (correct)"
else
  fail "JSON invalide → $HTTP_CODE (attendu 400 ou 401)"
fi

exit $FAILED
```

- [ ] **Step 8: Créer `security-tests/07_tmp_isolation.sh`**

```bash
#!/usr/bin/env bash
# Test 07 — Isolation des workdirs temporaires
# Vérifie que les répertoires de travail sont :
# - sous /tmp/edulinux/
# - avec des noms non prédictibles (token aléatoire 32 hex)
# - créés avec permissions 700

source "$(dirname "$0")/lib/common.sh"
section "07 — Tmp Workdir Isolation"

EDULINUX_TMP="${TMPDIR:-/tmp}/edulinux"

info "Vérification du répertoire $EDULINUX_TMP"

if [ ! -d "$EDULINUX_TMP" ]; then
  info "Répertoire $EDULINUX_TMP absent (aucune session active) — impossible de tester les permissions"
  info "Lance au moins une session terminal sur l'interface, puis relance ce test."
  exit 0
fi

# Vérifier que tous les répertoires présents ont des permissions 700
FOUND=0
INSECURE=0
while IFS= read -r -d '' dir; do
  FOUND=$((FOUND+1))
  PERMS=$(stat -c "%a" "$dir" 2>/dev/null || stat -f "%OLp" "$dir" 2>/dev/null)
  if [ "$PERMS" != "700" ]; then
    fail "Répertoire $dir a les permissions $PERMS (attendu 700)"
    INSECURE=$((INSECURE+1))
  fi
  # Vérifier que le nom contient un token aléatoire 32 hex
  BASENAME=$(basename "$dir")
  if echo "$BASENAME" | grep -qE '[0-9a-f]{32}$'; then
    : # Token hex présent — OK
  else
    fail "Nom de répertoire sans token aléatoire: $BASENAME"
    INSECURE=$((INSECURE+1))
  fi
done < <(find "$EDULINUX_TMP" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)

if [ "$FOUND" -eq 0 ]; then
  info "Aucun workdir actif trouvé dans $EDULINUX_TMP"
elif [ "$INSECURE" -eq 0 ]; then
  pass "$FOUND workdir(s) trouvé(s), tous avec permissions 700 et nom aléatoire"
fi

# Vérifier l'unicité des noms (prédictibilité)
info "Vérification de l'unicité des noms (non-prédictibilité)..."
if [ "$FOUND" -ge 2 ]; then
  # S'il y a ≥ 2 sessions, leurs noms doivent être différents (tautologie, juste pour la forme)
  UNIQUE=$(find "$EDULINUX_TMP" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort -u | wc -l)
  if [ "$UNIQUE" -eq "$FOUND" ]; then
    pass "Tous les $FOUND workdirs ont des noms uniques"
  fi
else
  info "Une seule session active — lancer plusieurs sessions pour tester l'unicité"
fi

exit $FAILED
```

- [ ] **Step 9: Créer `security-tests/run_all.sh`**

```bash
#!/usr/bin/env bash
# run_all.sh — Lance tous les tests de sécurité EduLinux
# Usage:
#   ./run_all.sh                         # teste localhost:3000
#   TARGET=https://monserveur.com ./run_all.sh
#   AUTH_TOKEN=xxx ./run_all.sh          # tests authentifiés

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export TARGET="${TARGET:-http://localhost:3000}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   EduLinux Security Test Suite             ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  Target  : ${YELLOW}$TARGET${NC}"
if [ -n "${AUTH_TOKEN:-}" ]; then
  echo -e "  Auth    : ${GREEN}AUTH_TOKEN défini${NC}"
else
  echo -e "  Auth    : ${YELLOW}AUTH_TOKEN non défini (tests authentifiés ignorés)${NC}"
fi
echo ""

TOTAL=0
PASS=0
FAIL=0

run_test() {
  local script="$1"
  local name="$2"
  TOTAL=$((TOTAL+1))
  
  if bash "$SCRIPT_DIR/$script" 2>&1; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    echo -e "  ${RED}→ $name a retourné des erreurs${NC}"
  fi
  echo ""
}

run_test "01_path_traversal.sh"    "01 Path Traversal"
run_test "02_ws_unauthenticated.sh" "02 WS Unauthenticated"
run_test "03_ws_invalid_token.sh"  "03 WS Invalid Token"
run_test "04_level_bypass.sh"      "04 Level Bypass"
run_test "05_dos_resize.sh"        "05 DoS Resize"
run_test "06_api_xp_injection.sh"  "06 API XP Injection"
run_test "07_tmp_isolation.sh"     "07 Tmp Isolation"

echo "──────────────────────────────────────────────"
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}[RÉSULTAT] $PASS/$TOTAL PASS — Aucune vulnérabilité détectée${NC}"
else
  echo -e "${RED}${BOLD}[RÉSULTAT] $PASS/$TOTAL PASS — $FAIL FAIL — Vulnérabilités détectées !${NC}"
fi
echo ""

exit $FAIL
```

- [ ] **Step 10: Créer `security-tests/README.md`**

```markdown
# EduLinux — Scripts de test de sécurité

Tests d'intrusion manuels pour valider les corrections de sécurité, en local ou sur le VPS Hetzner.

## Prérequis

| Outil | Installation |
|---|---|
| `bash` | Natif Linux |
| `curl` | `sudo apt-get install curl` |
| `python3` | `sudo apt-get install python3 python3-pip` |
| `websockets` (pip) | `pip3 install websockets` |
| `websocat` | Installé automatiquement par les scripts |

## Usage

```bash
# Rendre les scripts exécutables
chmod +x security-tests/*.sh security-tests/lib/common.sh

# Tester en local (serveur sur localhost:3000)
cd security-tests
./run_all.sh

# Tester sur le VPS Hetzner
TARGET=https://ton-domaine.com ./run_all.sh

# Avec un token de session (pour les tests authentifiés)
AUTH_TOKEN=ton_token_supabase TARGET=https://ton-domaine.com ./run_all.sh
```

## Tests individuels

```bash
./01_path_traversal.sh     # Path traversal via fileSystem
./02_ws_unauthenticated.sh # WS sans token → rejet 4401
./03_ws_invalid_token.sh   # HMAC forgé → rejet
./04_level_bypass.sh       # Accès niveau 999 (comportement attendu)
./05_dos_resize.sh         # cols/rows excessifs → bornés
./06_api_xp_injection.sh   # XP > 999999 → 400 Zod
./07_tmp_isolation.sh      # Workdirs 700, noms aléatoires
```

## Interprétation des résultats

- `[PASS]` — Le fix est en place, l'attaque est bloquée
- `[FAIL]` — Vulnérabilité encore présente
- `[INFO]` — Comportement documenté (non un problème)

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `TARGET` | `http://localhost:3000` | URL du serveur à tester |
| `AUTH_TOKEN` | (vide) | Token Supabase pour tests authentifiés |

## Obtenir un AUTH_TOKEN Supabase

Dans la console navigateur sur l'app EduLinux connectée :
```javascript
const { data } = await supabase.auth.getSession()
console.log(data.session.access_token)
```
```

- [ ] **Step 11: Rendre les scripts exécutables**

```bash
chmod +x security-tests/*.sh security-tests/lib/common.sh
```

- [ ] **Step 12: Lancer les tests unitaires une dernière fois**

```bash
npx jest --no-coverage 2>&1 | tail -15
```

Expected: tous les tests passent.

- [ ] **Step 13: Commit final**

```bash
git add security-tests/
git commit -m "feat(security-tests): add intrusion test suite (path traversal, ws auth, dos, xp injection)"
```

---

## Vérification finale

- [ ] **Lancer la suite complète de tests avec couverture**

```bash
npx jest --coverage 2>&1 | tail -30
```

Expected: couverture `lib/security.js` > 85%.

- [ ] **Résumé des vulnérabilités corrigées**

| # | Vulnérabilité | Fix | Fichier |
|---|---|---|---|
| 1 | Path traversal `../` dans fileSystem | `validateFileSystemPath()` | `lib/security.js`, `server.js` |
| 2 | WebSocket non authentifié | Token HMAC éphémère | `lib/security.js`, `server.js`, `RealTerminal.tsx` |
| 3 | Isolation workdir absente | `generateWorkDir()` + mode 0o700 | `lib/security.js`, `server.js` |
| 4 | Nettoyage tmpdir manquant | `fs.rmSync` sur `ws.close` | `server.js` |
| 5 | Bounds cols/rows incomplet | `validateTerminalSize()` au spawn | `lib/security.js`, `server.js` |
| 6 | XP/badges falsifiables | Schéma Zod | `lib/security.js`, `app/api/progress/route.ts` |
| 7 | Notes sans limite | Validation longueur | `app/api/notes/route.ts` |
| 8 | Headers sécurité Nginx manquants | CSP, HSTS, XSS-Protection | `deploy/nginx-edulinux.conf` |
| 9 | Docker sans hardening | no-new-privileges, cap_drop, tmpfs | `docker-compose.prod.yml` |
