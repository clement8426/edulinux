# EduLinux — Security Hardening Design

**Date:** 2026-04-13  
**Status:** Approved  
**Scope:** Corriger 11 vulnérabilités, ajouter tests unitaires sécurité, créer scripts d'intrusion manuels

---

## 1. Contexte

EduLinux est une plateforme d'apprentissage du terminal Linux qui spawn un vrai shell bash (via node-pty) pour chaque utilisateur connecté. Un audit de sécurité a identifié des failles critiques liées à ce modèle : path traversal, WebSocket non authentifié, isolation inter-utilisateurs absente, nettoyage tmpdir manquant.

---

## 2. Architecture cible

### 2.1 Nouveau module `lib/security.js`

Module CommonJS (pour compatibilité avec `server.js`). Contient 6 fonctions pures, toutes exportées et testables unitairement.

```
lib/security.js
├── validateFileSystemPath(baseDir, key) → string|null
├── generatePtyToken(userId)             → string
├── verifyPtyToken(token)                → { userId } | null
├── validateTerminalSize(cols, rows)     → { cols, rows }
├── generateWorkDir(userId, kind, id)    → string
└── validateProgress(body)              → { valid, data, errors }
```

**Dépendances** : `crypto` (natif Node.js), `path` (natif), `os` (natif), `zod` (**à ajouter** : `npm install zod`).

> Note : `zod` n'est pas encore dans `package.json` — l'étape 1 du plan d'implémentation inclut l'ajout de cette dépendance.

### 2.2 Nouvelle route `app/api/pty-token/route.ts`

- `GET /api/pty-token` — vérifie la session Supabase, retourne `{ token: string }`
- Authentification requise (401 sinon)
- Token valide 30 secondes, usage unique

### 2.3 Fichiers modifiés

| Fichier | Changements |
|---|---|
| `server.js` | Auth WS, path traversal fix, workdir isolé, cleanup, bounds check |
| `app/api/progress/route.ts` | Validation Zod des inputs |
| `app/api/notes/route.ts` | Validation Zod des inputs |
| `deploy/nginx-edulinux.conf` | Headers sécurité, rate limiting, server_tokens off |
| `docker-compose.prod.yml` | no-new-privileges, cap_drop, tmpfs |
| `components/RealTerminal.tsx` | fetch token avant ouverture WS |

### 2.4 Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `lib/security.js` | Module sécurité |
| `app/api/pty-token/route.ts` | Endpoint token éphémère |
| `__tests__/security.test.ts` | Tests unitaires sécurité |
| `security-tests/` | Scripts d'intrusion manuels |

---

## 3. Design détaillé par vulnérabilité

### 3.1 Path traversal (CRITIQUE) — `server.js:createFiles()`

**Problème** : `path.join(baseDir, cleanKey)` résout les `../` sans vérification.

**Fix dans `lib/security.js`** :
```js
function validateFileSystemPath(baseDir, key) {
  const clean = key.startsWith('/') ? key.slice(1) : key;
  const resolved = path.resolve(baseDir, clean);
  const base = path.resolve(baseDir);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    console.warn(`[security] Path traversal blocked: ${key}`);
    return null;
  }
  return resolved;
}
```

`createFiles()` appelle `validateFileSystemPath()` et skip les clés qui retournent `null`.

### 3.2 Authentification WebSocket (CRITIQUE) — `server.js`

**Problème** : toute connexion à `/pty` est acceptée sans vérification d'identité.

**Fix — flux token éphémère** :

1. Client (RealTerminal.tsx) fait `GET /api/pty-token` avant d'ouvrir le WS
2. La route vérifie la session Supabase, génère un token HMAC-SHA256
3. Token format : `base64url(userId + ':' + expiry + ':' + hmac)`
4. Token stocké dans un `Map<token, {userId, expiry}>` en mémoire dans `server.js`
5. Client envoie le token dans le message `init` : `{ type: 'init', token: '...', ... }`
6. `server.js` appelle `verifyPtyToken(token)` : vérifie HMAC + TTL + consomme (supprime du Map)
7. Si invalide → `ws.close(4401, 'Unauthorized')` immédiatement

**Clé HMAC** : variable d'env `PTY_TOKEN_SECRET`. Si absente au démarrage, générée automatiquement avec `crypto.randomBytes(32).toString('hex')` et loggée en warning.

**Partage du secret et du Map entre Next.js et server.js** : les deux tournent dans le même process Node.js (`server.js` lance Next.js via `app.prepare()`). Le Map des tokens (`Map<string, {userId, expiry}>`) est une variable module-level dans `lib/security.js`. Grâce au cache de modules Node.js (`require.cache`), `require('./lib/security')` depuis `server.js` et `require('@/lib/security')` depuis une route Next.js résolvent vers le **même objet en mémoire** — le Map est donc partagé sans IPC ni Redis. `process.env.PTY_TOKEN_SECRET` est également accessible aux deux.

### 3.3 Isolation workdir inter-utilisateurs (CRITIQUE) — `server.js`

**Problème** : workdir basé sur `Date.now()` → prédictible, partageable entre users.

**Fix dans `lib/security.js`** :
```js
function generateWorkDir(userId, kind, id) {
  const rand = crypto.randomBytes(16).toString('hex');
  const safeUserId = userId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 36);
  return path.join(os.tmpdir(), 'edulinux', `${safeUserId}-${kind}-${id}-${rand}`);
}
```

Permissions à la création : `fs.mkdirSync(workDir, { recursive: true, mode: 0o700 })`.

### 3.4 Nettoyage tmpdir (MOYEN) — `server.js`

**Problème** : les répertoires de travail s'accumulent indéfiniment dans `/tmp`.

**Fix** :
```js
ws.on('close', () => {
  if (ptyProcess) { try { ptyProcess.kill(); } catch {} }
  if (ws._workDir) {
    try { fs.rmSync(ws._workDir, { recursive: true, force: true }); } catch {}
  }
});
```

### 3.5 Bounds check cols/rows (MOYEN) — `server.js`

**Problème** : au spawn initial, cols/rows ne sont pas bornés (uniquement sur resize).

**Fix dans `lib/security.js`** :
```js
const COLS_MIN = 10, COLS_MAX = 500, ROWS_MIN = 3, ROWS_MAX = 200;
function validateTerminalSize(cols, rows) {
  return {
    cols: Math.max(COLS_MIN, Math.min(COLS_MAX, parseInt(cols) || 80)),
    rows: Math.max(ROWS_MIN, Math.min(ROWS_MAX, parseInt(rows) || 24)),
  };
}
```

Appliqué à la fois dans `spawnShell()` et dans le handler `resize`.

### 3.6 Validation API progress/notes (MOYEN) — routes API

**Problème** : les routes acceptent n'importe quelle valeur pour XP, badges, niveaux.

**Fix dans `lib/security.js`** (schéma Zod) :
```js
const progressSchema = z.object({
  completedLevels:   z.array(z.number().int().min(1).max(9999)).max(9999),
  currentLevel:      z.number().int().min(1).max(9999),
  totalXP:           z.number().int().min(0).max(999999),
  badges:            z.array(z.string().max(64)).max(200),
  completedScenarios: z.array(z.number().int().min(1).max(9999)).max(9999),
  scenarioSteps:     z.record(z.string().max(32), z.number().int().min(0).max(999)),
});
```

Les routes appellent `validateProgress(body)` et retournent 400 si invalide.

### 3.7 Nginx — headers sécurité + rate limiting

Ajouts dans `nginx-edulinux.conf` :
- `server_tokens off`
- `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always` (bloc HTTPS uniquement)
- `add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss: https://*.supabase.co" always`
- `add_header X-XSS-Protection "1; mode=block" always`
- `limit_req_zone $binary_remote_addr zone=pty:10m rate=2r/s` sur `/pty`

### 3.8 Docker Compose — hardening

Ajouts dans `docker-compose.prod.yml` :
```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
tmpfs:
  - /tmp:size=512m,mode=1777
```

---

## 4. Tests unitaires — `__tests__/security.test.ts`

### Suites

| Suite | Cas couverts |
|---|---|
| `validateFileSystemPath` | Chemin normal OK, `../` bloqué, `../../` bloqué, chemin absolu `/etc/passwd` bloqué, objet imbriqué OK, clé vide OK |
| `generatePtyToken / verifyPtyToken` | Token valide accepté, expiré rejeté (TTL mock), usage unique (2e appel → null), HMAC falsifié rejeté, userId mal formé rejeté |
| `validateTerminalSize` | Valeurs normales passthrough, dépassement MAX clampé, valeurs négatives → MIN, NaN → défaut (80×24), valeurs string parsées |
| `generateWorkDir` | Toujours sous `/tmp/edulinux`, unicité sur 100 appels, userId dans le chemin, userId avec caractères spéciaux sanitisé |
| `validateProgress` | Payload complet valide, XP négatif → erreur, XP > 999999 → erreur, badge > 64 chars → erreur, completedLevels avec string → erreur, payload vide → defaults OK |
| Intégration `createFiles` | Fichier normal créé, `../escape` bloqué et fichier absent hors workdir, sous-objet crée répertoire, `.sh` chmod 755, `.py` chmod 755 |

---

## 5. Scripts d'intrusion — `security-tests/`

### Structure

```
security-tests/
├── README.md
├── run_all.sh
├── lib/
│   └── common.sh           # fonctions partagées (print_pass, print_fail, ws_send)
├── 01_path_traversal.sh
├── 02_ws_unauthenticated.sh
├── 03_ws_invalid_token.sh
├── 04_level_bypass.sh
├── 05_dos_resize.sh
├── 06_api_xp_injection.sh
└── 07_tmp_isolation.sh
```

### Détail des scripts

**`01_path_traversal.sh`** : se connecte via websocat (avec token valide si le fix est présent, sans token si on teste avant fix), envoie `fileSystem: { "../../../tmp/pwned_edulinux": "hacked" }`, puis vérifie avec `test -f /tmp/pwned_edulinux` si le fichier a été créé hors workdir. `[PASS]` = fichier absent (fix ok), `[FAIL]` = fichier présent (vulnérable).

**`02_ws_unauthenticated.sh`** : tente une connexion WebSocket sans token, envoie `{ type: 'init', id: 1 }`, attend la réponse. `[PASS]` = connexion fermée avec 4401, `[FAIL]` = `{ type: 'ready' }` reçu.

**`03_ws_invalid_token.sh`** : même chose avec un token HMAC forgé manuellement (`fakeuserid:9999999999:invalidsignature`). Vérifie le rejet.

**`04_level_bypass.sh`** : connexion authentifiée, tente d'accéder au niveau 999. Vérifie que le shell est bien spawné (normal, accès libre authentifié) — ce test documente le comportement attendu.

**`05_dos_resize.sh`** : envoie `{ type: 'init', cols: 999999, rows: 999999 }` et ensuite `{ type: 'resize', cols: -1, rows: -1 }`. Vérifie que le serveur ne crashe pas et que le terminal reste fonctionnel.

**`06_api_xp_injection.sh`** : `curl -X POST /api/progress` sans cookie → 401 attendu. Avec cookie de session valide + `totalXP: 999999999` → 400 attendu (validation Zod). Avec payload valide → 200.

**`07_tmp_isolation.sh`** : crée deux sessions avec deux tokens différents (deux "utilisateurs" simulés), vérifie que leurs workdirs sont des paths distincts non-prédictibles, et que les permissions sont `700`.

### Prérequis automatiquement vérifiés par `run_all.sh`

- `curl` — installé sur tout Linux
- `python3` — installé sur tout Debian/Ubuntu
- `websocat` — le script propose de l'installer si absent (`apt install websocat` ou download binaire)

### Format de sortie

```
[INFO] EduLinux Security Test Suite
[INFO] Target: http://localhost:3000
──────────────────────────────────────
[PASS] 01 Path Traversal Protection
[PASS] 02 WS Unauthenticated Rejected
[PASS] 03 WS Invalid Token Rejected
[INFO] 04 Level Bypass (expected: open access) — OK
[PASS] 05 DoS Resize Bounded
[PASS] 06 API XP Injection Blocked
[PASS] 07 Tmp Workdir Isolation
──────────────────────────────────────
[RESULT] 6/7 PASS, 0 FAIL, 1 INFO
```

---

## 6. Plan d'implémentation (ordre)

1. `lib/security.js` — module pur, sans dépendances externes sauf Zod
2. `__tests__/security.test.ts` — tests unitaires du module
3. `app/api/pty-token/route.ts` — endpoint token
4. `server.js` — intégration des fixes (auth, path traversal, workdir, cleanup, bounds)
5. `components/RealTerminal.tsx` — fetch token avant WS
6. `app/api/progress/route.ts` + `app/api/notes/route.ts` — validation Zod
7. `deploy/nginx-edulinux.conf` — headers + rate limiting
8. `docker-compose.prod.yml` — hardening
9. `security-tests/` — scripts d'intrusion

---

## 7. Ce qui n'est PAS dans le scope

- Réécriture de `server.js` (architecture conservée)
- Modification de la logique de validation des commandes (matchesRule, etc.)
- Ajout de monitoring/alerting
- Chiffrement des hints (impact pédagogique nul, scope trop large)
- Rotation automatique des clés Supabase (action manuelle documentée dans README)
