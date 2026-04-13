# Security Hardening & Tech Debt — Plan v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les 4 failles critiques, 5 dettes techniques et 3 améliorations identifiées lors de l'analyse forensique du projet EduLinux.

**Architecture:** Chaque tâche est indépendante et commitable séparément. Critiques d'abord (Tâches 1-4), dettes ensuite (5-7), améliorations en dernier (8-10).

**Tech Stack:** Node.js CJS (`lib/`), Next.js 16 App Router TypeScript (`app/api/`), Zod, node-pty, ws, Docker Compose, Supabase PostgreSQL.

---

## Fichiers touchés

| Fichier | Statut |
|---|---|
| `lib/rate-limit.js` | Créer |
| `__tests__/rate-limit.test.ts` | Créer |
| `app/api/pty-token/route.ts` | Modifier |
| `app/api/progress/route.ts` | Modifier |
| `app/api/notes/route.ts` | Modifier |
| `lib/security.js` | Modifier (ajouter isAllowedOrigin) |
| `__tests__/security.test.ts` | Modifier (ajouter tests isAllowedOrigin) |
| `server.js` | Modifier (origin check, OSC dedup, SIGTERM) |
| `supabase/migrations/20260413000000_rls.sql` | Créer |
| `.env.production.example` | Modifier (notes RLS + labs) |
| `docker-compose.labs.yml` | Modifier (caps, resources, env secrets) |
| `hooks/useScenarioTimer.ts` | Modifier (scenarioId param) |
| `app/scenarios/[id]/page.tsx` | Modifier (passer scenarioId) |
| `next.config.mjs` | Modifier (bundle analyzer) |
| `package.json` | Modifier (@next/bundle-analyzer, pino) |
| `lib/logger.js` | Créer |
| `components/RealTerminal.tsx` | Modifier (aria-labels) |

---

## BLOC 1 — CRITIQUES

---

### Tâche 1 : Rate limiting in-memory

**Fichiers :** `lib/rate-limit.js`, `__tests__/rate-limit.test.ts`, 3 routes API

> Pas de Redis : serveur single-node. Map en mémoire, sliding window par userId.
> Patterns de la codebase : lib/*.js en CJS, importé via `require()` depuis les routes TS.

- [ ] **Étape 1 : Créer `__tests__/rate-limit.test.ts`**

```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { checkRateLimit, _rlStore } = require('../lib/rate-limit');

describe('checkRateLimit', () => {
  beforeEach(() => { _rlStore.clear(); });

  test('première requête : allowed=true, remaining=limit-1', () => {
    const r = checkRateLimit('u1', 5, 60_000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4);
    expect(r.resetAt).toBeGreaterThan(Date.now());
  });

  test('dépassement : allowed=false, remaining=0', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('u2', 5, 60_000);
    const r = checkRateLimit('u2', 5, 60_000);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  test('5e requête sur limit=5 : allowed=true (dernière autorisée)', () => {
    for (let i = 0; i < 4; i++) checkRateLimit('u3', 5, 60_000);
    const r = checkRateLimit('u3', 5, 60_000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(0);
  });

  test('nouvelle fenêtre après windowMs : compteur réinitialisé', () => {
    checkRateLimit('u4', 2, 80);
    checkRateLimit('u4', 2, 80);
    const blocked = checkRateLimit('u4', 2, 80);
    expect(blocked.allowed).toBe(false);
    return new Promise<void>(resolve => setTimeout(() => {
      const r = checkRateLimit('u4', 2, 80);
      expect(r.allowed).toBe(true);
      resolve();
    }, 120));
  });

  test('clés différentes : indépendantes', () => {
    checkRateLimit('u5', 1, 60_000);
    const blocked = checkRateLimit('u5', 1, 60_000);
    const other   = checkRateLimit('u6', 1, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(other.allowed).toBe(true);
  });

  test('resetAt est dans ~windowMs ms du premier appel', () => {
    const before = Date.now();
    const r = checkRateLimit('u7', 5, 60_000);
    expect(r.resetAt).toBeGreaterThanOrEqual(before + 59_900);
    expect(r.resetAt).toBeLessThanOrEqual(before + 60_200);
  });
});
```

- [ ] **Étape 2 : Vérifier que les tests échouent**

```bash
npx jest --testPathPatterns="rate-limit" --no-coverage
```

Attendu : `FAIL — Cannot find module '../lib/rate-limit'`

- [ ] **Étape 3 : Créer `lib/rate-limit.js`**

```javascript
'use strict';

const MAX_ENTRIES = 10_000;
/** @type {Map<string, {count:number, windowStart:number}>} */
const _rlStore = new Map();

// Nettoyage des entrées stale toutes les 5 min
setInterval(() => {
  const cutoff = Date.now() - 120_000;
  for (const [k, v] of _rlStore.entries()) {
    if (v.windowStart < cutoff) _rlStore.delete(k);
  }
}, 300_000).unref();

/**
 * Vérifie si une clé dépasse le rate limit (sliding window).
 * @param {string} key       - identifiant (userId)
 * @param {number} limit     - max requêtes par fenêtre
 * @param {number} windowMs  - durée fenêtre en ms
 * @returns {{ allowed:boolean, remaining:number, resetAt:number }}
 */
function checkRateLimit(key, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = _rlStore.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    if (_rlStore.size >= MAX_ENTRIES) _rlStore.delete(_rlStore.keys().next().value);
    _rlStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  return {
    allowed:   entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt:   entry.windowStart + windowMs,
  };
}

module.exports = { checkRateLimit, _rlStore };
```

- [ ] **Étape 4 : Vérifier que les 6 tests passent**

```bash
npx jest --testPathPatterns="rate-limit" --no-coverage
```

Attendu : `6 passed`

- [ ] **Étape 5 : Appliquer sur `/api/pty-token/route.ts`**

Remplacer le fichier entier :

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generatePtyToken } = require('@/lib/security');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { checkRateLimit } = require('@/lib/rate-limit');

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`pty:${user.id}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests', resetAt: rl.resetAt },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const token: string = generatePtyToken(user.id);
  return NextResponse.json({ token });
}
```

- [ ] **Étape 6 : Appliquer sur `/api/progress/route.ts`**

Remplacer le fichier entier :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { validateProgress } = require('@/lib/security');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { checkRateLimit } = require('@/lib/rate-limit');

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`progress:${user.id}`, 60, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { data, error } = await supabase
    .from('user_progress').select('*').eq('user_id', user.id).single();
  if (error && error.code !== 'PGRST116')
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ progress: data ?? null });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`progress:${user.id}`, 60, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { valid, data: validated, errors } = validateProgress(body);
  if (!valid) return NextResponse.json({ error: 'Invalid input', details: errors }, { status: 400 });

  const { error } = await supabase.from('user_progress').upsert({
    user_id:             user.id,
    completed_levels:    validated!.completedLevels,
    current_level:       validated!.currentLevel,
    total_xp:            validated!.totalXP,
    badges:              validated!.badges,
    completed_scenarios: validated!.completedScenarios,
    scenario_steps:      validated!.scenarioSteps,
    updated_at:          new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Étape 7 : Appliquer sur `/api/notes/route.ts`**

Remplacer le fichier entier :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { checkRateLimit } = require('@/lib/rate-limit');

const CONTEXT_MAX = 64;
const CONTENT_MAX = 50_000;

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`notes:${user.id}`, 30, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const context = searchParams.get('context');
  if (context && context.length > CONTEXT_MAX)
    return NextResponse.json({ error: 'context too long' }, { status: 400 });

  const query = supabase.from('user_notes').select('context, content').eq('user_id', user.id);
  if (context) query.eq('context', context);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkRateLimit(`notes:${user.id}`, 30, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  let context: string, content: string;
  try {
    const body = await req.json() as { context?: unknown; content?: unknown };
    context = String(body.context ?? '');
    content = String(body.content ?? '');
  } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!context)                          return NextResponse.json({ error: 'Missing context' }, { status: 400 });
  if (context.length > CONTEXT_MAX)      return NextResponse.json({ error: 'context too long (max 64)' }, { status: 400 });
  if (content.length > CONTENT_MAX)      return NextResponse.json({ error: 'content too long (max 50000)' }, { status: 400 });

  const { error } = await supabase.from('user_notes').upsert(
    { user_id: user.id, context, content, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,context' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Étape 8 : Vérifier**

```bash
npx tsc --noEmit && npx jest --no-coverage
```

Attendu : 0 erreurs TS, 137 tests passent

- [ ] **Étape 9 : Commit**

```bash
git add lib/rate-limit.js __tests__/rate-limit.test.ts \
        app/api/pty-token/route.ts app/api/progress/route.ts app/api/notes/route.ts
git commit -m "feat(security): in-memory rate limiting on all API endpoints"
```

---

### Tâche 2 : WebSocket — vérification d'origine

**Fichiers :** `lib/security.js`, `__tests__/security.test.ts`, `server.js`

- [ ] **Étape 1 : Ajouter les tests dans `__tests__/security.test.ts`**

Ajouter à la fin du fichier (juste avant la fermeture du dernier `});`) :

```typescript
describe('isAllowedOrigin', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { isAllowedOrigin } = require('../lib/security');

  test('localhost toujours accepté', () => {
    expect(isAllowedOrigin('http://localhost:3000', undefined)).toBe(true);
    expect(isAllowedOrigin('http://localhost:9999', undefined)).toBe(true);
  });

  test('hostname de APP_URL accepté', () => {
    expect(isAllowedOrigin('https://edulinux.io', 'https://edulinux.io')).toBe(true);
  });

  test('hostname différent refusé', () => {
    expect(isAllowedOrigin('https://evil.com', 'https://edulinux.io')).toBe(false);
  });

  test('origin vide en prod refusé', () => {
    expect(isAllowedOrigin('', 'https://edulinux.io')).toBe(false);
  });

  test('origin undefined sans APP_URL : accepté (dev)', () => {
    expect(isAllowedOrigin(undefined, undefined)).toBe(true);
  });
});
```

- [ ] **Étape 2 : Vérifier que les tests échouent**

```bash
npx jest --testPathPatterns="security" --no-coverage
```

Attendu : `FAIL — isAllowedOrigin is not a function`

- [ ] **Étape 3 : Ajouter `isAllowedOrigin` dans `lib/security.js`**

Ajouter avant `module.exports` :

```javascript
// ─── 6. WebSocket origin validation ──────────────────────────────────────────
/**
 * Vérifie qu'une origin WebSocket est autorisée.
 * localhost toujours OK. En prod, compare le hostname à NEXT_PUBLIC_APP_URL.
 * @param {string|undefined} origin
 * @param {string|undefined} appUrl  - process.env.NEXT_PUBLIC_APP_URL
 * @returns {boolean}
 */
function isAllowedOrigin(origin, appUrl) {
  if (!origin) return !appUrl; // sans origin : OK en dev, KO en prod

  let originHost;
  try { originHost = new URL(origin).hostname; }
  catch { return false; }

  if (originHost === 'localhost' || originHost === '127.0.0.1' || originHost === '::1') {
    return true;
  }

  if (appUrl) {
    try { return originHost === new URL(appUrl).hostname; }
    catch { return false; }
  }

  return true; // dev sans APP_URL configurée
}
```

Ajouter `isAllowedOrigin` dans `module.exports` :

```javascript
module.exports = {
  validateFileSystemPath,
  generatePtyToken,
  verifyPtyToken,
  validateTerminalSize,
  generateWorkDir,
  validateProgress,
  isAllowedOrigin,
  _tokenStore,
};
```

- [ ] **Étape 4 : Vérifier que les 5 nouveaux tests passent**

```bash
npx jest --testPathPatterns="security" --no-coverage
```

Attendu : tous les tests security passent

- [ ] **Étape 5 : Brancher dans `server.js`**

Modifier l'import security (ligne ~12) :

```javascript
const {
  validateFileSystemPath,
  verifyPtyToken,
  validateTerminalSize,
  generateWorkDir,
  isAllowedOrigin,
} = require('./lib/security');
```

Modifier le handler `upgrade` (lignes ~262-271) :

```javascript
server.on('upgrade', (req, socket, head) => {
  const { pathname } = parse(req.url || '/');
  if (pathname === '/pty') {
    const origin = req.headers['origin'];
    if (!isAllowedOrigin(origin, process.env.NEXT_PUBLIC_APP_URL)) {
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
```

- [ ] **Étape 6 : Vérifier**

```bash
npx tsc --noEmit && npx jest --no-coverage
```

- [ ] **Étape 7 : Commit**

```bash
git add lib/security.js __tests__/security.test.ts server.js
git commit -m "feat(security): validate WebSocket upgrade origin header"
```

---

### Tâche 3 : Supabase RLS — migration SQL

**Fichiers :** `supabase/migrations/20260413000000_rls.sql`, `.env.production.example`

- [ ] **Étape 1 : Créer le répertoire migrations**

```bash
mkdir -p supabase/migrations
```

- [ ] **Étape 2 : Créer `supabase/migrations/20260413000000_rls.sql`**

```sql
-- Activation Row Level Security sur les tables utilisateurs
-- Idempotent : peut être rejoué sans erreur
-- Exécuter dans Supabase SQL Editor ou via : supabase db push

-- ── user_progress ─────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_progress" ON user_progress;
CREATE POLICY "users_own_progress" ON user_progress
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── user_notes ────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS user_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_notes" ON user_notes;
CREATE POLICY "users_own_notes" ON user_notes
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Vérification (lancer manuellement) ───────────────────────────────────────
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE tablename IN ('user_progress','user_notes');
-- Résultat attendu : rowsecurity = true pour les deux lignes
```

- [ ] **Étape 3 : Documenter dans `.env.production.example`**

Ajouter à la fin :

```bash
# ── Sécurité base de données ───────────────────────────────────────────────────
# OBLIGATOIRE avant prod : exécuter supabase/migrations/20260413000000_rls.sql
# dans le Supabase SQL Editor pour activer Row Level Security.

# ── Docker labs (optionnel) ───────────────────────────────────────────────────
LAB_MYSQL_ROOT_PASSWORD=change_me_strong_password
LAB_MYSQL_PASSWORD=change_me_db_password
```

- [ ] **Étape 4 : Commit**

```bash
git add supabase/migrations/20260413000000_rls.sql .env.production.example
git commit -m "feat(security): Supabase RLS migration + document prod checklist"
```

---

### Tâche 4 : Docker labs — durcissement

**Fichiers :** `docker-compose.labs.yml`

- [ ] **Étape 1 : Remplacer le bloc `lab-attacker` (lignes 25-41)**

```yaml
  lab-attacker:
    build:
      context: ./labs/attacker
    container_name: lab-attacker
    restart: unless-stopped
    networks:
      lab_pentest:
        ipv4_address: 172.20.0.2
      lab_internal:
        ipv4_address: 172.21.0.2
    volumes:
      - lab_attacker_data:/workspace
    stdin_open: true
    tty: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_RAW          # nmap raw sockets (SYN scan, ping)
      - NET_BIND_SERVICE # nc listeners sur ports < 1024
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 768M
```

- [ ] **Étape 2 : Remplacer les credentials MySQL hardcodés (lignes ~197-200)**

```yaml
    environment:
      MYSQL_ROOT_PASSWORD: ${LAB_MYSQL_ROOT_PASSWORD:-ChangeMe_Before_Prod!}
      MYSQL_DATABASE: corporate_data
      MYSQL_USER: dbuser
      MYSQL_PASSWORD: ${LAB_MYSQL_PASSWORD:-dbpass_change_me}
```

- [ ] **Étape 3 : Rebuilder et tester**

```bash
docker compose -f docker-compose.labs.yml down lab-attacker
docker compose -f docker-compose.labs.yml up -d --build lab-attacker
docker compose -f docker-compose.labs.yml exec lab-attacker nmap -sn 172.20.0.10
```

Attendu : host détecté (NET_RAW présent)

- [ ] **Étape 4 : Commit**

```bash
git add docker-compose.labs.yml
git commit -m "feat(docker): harden lab-attacker — cap_drop ALL + resource limits + env secrets"
```

---

## BLOC 2 — DETTES TECHNIQUES

---

### Tâche 5 : Déduplication OSC + borne buffer

**Fichiers :** `server.js`

> La logique d'extraction OSC 777 est dupliquée dans `spawnShell` (~ligne 338) et `spawnDockerShell` (~ligne 408).
> On extrait en `processOscData()` partagée + on ajoute la borne à 4096 octets.

- [ ] **Étape 1 : Ajouter `processOscData` juste avant `wss.on('connection', ...)` (~ligne 273)**

```javascript
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
```

- [ ] **Étape 2 : Remplacer le bloc `onData` dans `spawnShell` (~lignes 338-385)**

```javascript
let oscBuf = '';
ptyProcess.onData((data) => {
  if (ws._flags && ws._flags.length > 0) checkFlags(ws, data);
  const { out, nextBuf } = processOscData(data, oscBuf, ws);
  oscBuf = nextBuf;
  if (out) { try { ws.send(JSON.stringify({ type: 'output', data: out })); } catch {} }
});
```

- [ ] **Étape 3 : Remplacer le bloc `onData` dans `spawnDockerShell` (~lignes 408-444)**

```javascript
let oscBuf = '';
ptyProcess.onData((data) => {
  if (ws._flags && ws._flags.length > 0) checkFlags(ws, data);
  const { out, nextBuf } = processOscData(data, oscBuf, ws);
  oscBuf = nextBuf;
  if (out) { try { ws.send(JSON.stringify({ type: 'output', data: out })); } catch {} }
});
```

- [ ] **Étape 4 : Tester manuellement**

```bash
npm run dev
# Ouvrir http://localhost:3000/levels/1
# Taper `ls` → validation doit fonctionner, output lisible
```

- [ ] **Étape 5 : Commit**

```bash
git add server.js
git commit -m "refactor(server): extract processOscData, cap oscBuf at 4096 bytes"
```

---

### Tâche 6 : Graceful shutdown SIGTERM

**Fichiers :** `server.js`

- [ ] **Étape 1 : Remplacer les dernières lignes de `server.js`**

Les lignes actuelles (approx 552-558) sont :

```javascript
  server.listen(port, hostname, () => {
    console.log(`\n  \x1b[32m▶ EduLinux\x1b[0m  http://${hostname}:${port}\n`);
  });
}).catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
```

Remplacer par :

```javascript
  server.listen(port, hostname, () => {
    console.log(`\n  \x1b[32m▶ EduLinux\x1b[0m  http://${hostname}:${port}\n`);
  });

  function shutdown(signal) {
    console.log(`\n[edulinux] ${signal} — graceful shutdown`);
    wss.clients.forEach(c => { try { c.close(1001, 'Server shutdown'); } catch {} });
    server.close(() => {
      console.log('[edulinux] HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => { console.error('[edulinux] Forced exit after 10s'); process.exit(1); }, 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

}).catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
```

- [ ] **Étape 2 : Tester**

```bash
npm run dev &
BGPID=$!
sleep 2
kill -SIGTERM $BGPID
```

Attendu : `[edulinux] SIGTERM — graceful shutdown` puis `HTTP server closed` dans le terminal

- [ ] **Étape 3 : Commit**

```bash
git add server.js
git commit -m "feat(server): handle SIGTERM/SIGINT for graceful shutdown"
```

---

### Tâche 7 : useScenarioTimer — reset sur changement de scénario

**Fichiers :** `hooks/useScenarioTimer.ts`, `app/scenarios/[id]/page.tsx`

> Le useEffect de démarrage auto a `[]` comme dépendances → ne se réinitialise jamais.
> Fix : accepter `scenarioId` en param, l'utiliser comme dépendance du useEffect de reset.

- [ ] **Étape 1 : Modifier `hooks/useScenarioTimer.ts`**

Remplacer uniquement la signature de la fonction et le `useEffect` auto-start (lignes 11 et 48-55) :

Ligne 11 — nouvelle signature :
```typescript
export function useScenarioTimer(scenarioId?: number | string) {
```

Lignes 48-55 — remplacer le useEffect auto-start par :
```typescript
  // Auto-start et reset quand scenarioId change
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
    startTimeRef.current = Date.now();
    setIsRunning(true);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scenarioId]); // ← scenarioId en dépendance
```

- [ ] **Étape 2 : Modifier `app/scenarios/[id]/page.tsx` ligne 68**

```typescript
// Avant
const { elapsed, formatted: timerFormatted } = useScenarioTimer();

// Après
const { elapsed, formatted: timerFormatted } = useScenarioTimer(scenarioId);
```

- [ ] **Étape 3 : Vérifier**

```bash
npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Étape 4 : Commit**

```bash
git add hooks/useScenarioTimer.ts app/scenarios/\[id\]/page.tsx
git commit -m "fix(timer): reset scenario timer when navigating between scenarios"
```

---

## BLOC 3 — AMÉLIORATIONS

---

### Tâche 8 : Bundle analyzer

**Fichiers :** `package.json`, `next.config.mjs`

- [ ] **Étape 1 : Installer**

```bash
npm install --save-dev @next/bundle-analyzer
```

- [ ] **Étape 2 : Modifier `next.config.mjs`**

```javascript
import BundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xterm/xterm', '@xterm/addon-fit'],
};

export default withBundleAnalyzer(nextConfig);
```

- [ ] **Étape 3 : Tester**

```bash
ANALYZE=true npm run build
```

Attendu : build réussi, deux onglets ouverts dans le navigateur (bundle client + server)

- [ ] **Étape 4 : Commit**

```bash
git add package.json package-lock.json next.config.mjs
git commit -m "feat(tooling): bundle analyzer via ANALYZE=true npm run build"
```

---

### Tâche 9 : Logging structuré — pino

**Fichiers :** `lib/logger.js`, `server.js`, `package.json`

- [ ] **Étape 1 : Installer**

```bash
npm install pino
npm install --save-dev pino-pretty
```

- [ ] **Étape 2 : Créer `lib/logger.js`**

```javascript
'use strict';

const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname' } }
    : undefined,
  base: { service: 'edulinux' },
});

module.exports = logger;
```

- [ ] **Étape 3 : Ajouter l'import dans `server.js`** (après les autres `require`)

```javascript
const logger = require('./lib/logger');
```

- [ ] **Étape 4 : Remplacer les console.* dans `server.js`**

Remplacements ligne par ligne :

| Emplacement | Avant | Après |
|---|---|---|
| `createFiles` catch (~ligne 51) | `console.warn('[edulinux] Skipped...')` | `logger.warn({ path: fullPath, err: e.message }, 'createFiles: skipped path')` |
| `spawnShell` catch (~ligne 333) | `console.error('[edulinux] pty.spawn failed:', shell, e)` | `logger.error({ shell, err: e.message }, 'pty.spawn failed')` |
| `spawnDockerShell` catch (~ligne 404) | `console.error('[edulinux] docker exec failed:...')` | `logger.error({ container, err: e.message }, 'docker exec failed')` |
| `ws.on('error')` (~ligne 548) | `console.error('[edulinux ws]', err.message)` | `logger.error({ err: err.message }, 'WebSocket error')` |
| `server.listen` callback (~ligne 553) | `console.log('▶ EduLinux ...')` | `logger.info({ port, hostname }, 'EduLinux ready')` |
| `shutdown` logs | `console.log(...)` / `console.error(...)` | `logger.info(...)` / `logger.error(...)` |

- [ ] **Étape 5 : Vérifier démarrage**

```bash
npm run dev
```

Attendu : logs colorisés pino-pretty dans le terminal

- [ ] **Étape 6 : Vérifier tests**

```bash
npx jest --no-coverage
```

Attendu : tous les tests passent

- [ ] **Étape 7 : Commit**

```bash
git add lib/logger.js server.js package.json package-lock.json
git commit -m "feat(logging): structured logging with pino (replaces console.*)"
```

---

### Tâche 10 : Aria-labels — accessibilité boutons

**Fichiers :** `components/RealTerminal.tsx`

- [ ] **Étape 1 : Modifier `components/RealTerminal.tsx` — bouton "Continuer →" (~ligne 406)**

```tsx
<button
  type="button"
  aria-label="Passer à l'étape suivante maintenant"
  onClick={handleContinueNow}
  className="bg-[#a3e635] text-black text-xs font-bold px-4 py-1.5 rounded hover:bg-[#bef264] transition-colors"
>
  Continuer →
</button>
```

- [ ] **Étape 2 : Modifier le bouton "Étape suivante →" (~ligne 414)**

```tsx
<button
  type="button"
  aria-label="Charger l'étape suivante du scénario"
  onClick={handleNextStep}
  className="border border-[#a3e635]/50 text-[#a3e635] text-xs font-bold px-4 py-1.5 rounded hover:bg-[#a3e635]/10 transition-colors"
>
  Étape suivante →
</button>
```

- [ ] **Étape 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : 0 erreurs

- [ ] **Étape 4 : Commit**

```bash
git add components/RealTerminal.tsx
git commit -m "feat(a11y): add aria-labels on terminal completion buttons"
```

---

## Vérification finale

```bash
npx jest --no-coverage
```
Attendu : **137+ tests passent** (131 existants + 6 rate-limit + 5 isAllowedOrigin)

```bash
npx tsc --noEmit
```
Attendu : **0 erreurs TypeScript**

```bash
ANALYZE=true npm run build
```
Attendu : **build réussi**

---

## Ordre et durées estimées

| # | Tâche | Priorité | ~Durée |
|---|---|---|---|
| 1 | Rate limiting | CRITIQUE | 30 min |
| 2 | WS Origin check | CRITIQUE | 20 min |
| 3 | RLS Supabase | CRITIQUE | 10 min |
| 4 | Docker hardening | CRITIQUE | 15 min |
| 5 | OSC dedup + borne | DETTE | 20 min |
| 6 | SIGTERM graceful | DETTE | 10 min |
| 7 | Timer scenarioId | DETTE | 10 min |
| 8 | Bundle analyzer | AMÉLIORATION | 5 min |
| 9 | Logging pino | AMÉLIORATION | 20 min |
| 10 | Aria-labels | AMÉLIORATION | 10 min |

**Total estimé : ~2h30**
