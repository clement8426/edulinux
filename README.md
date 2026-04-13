# EduLinux

Plateforme interactive d'apprentissage du terminal Linux avec un vrai shell embarqué dans le navigateur. 150 niveaux, 20 scénarios, validation par interception des commandes réellement exécutées.

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique](#stack-technique)
3. [Démarrage en développement](#démarrage-en-développement)
4. [Déploiement en production](#déploiement-en-production)
   - [Prérequis](#prérequis)
   - [Générer les secrets](#générer-les-secrets)
   - [Configurer .env.production](#configurer-envproduction)
   - [Configurer Supabase](#configurer-supabase)
   - [Build et démarrage](#build-et-démarrage)
   - [Nginx (reverse proxy)](#nginx-reverse-proxy)
   - [Checklist de sécurité complète](#checklist-de-sécurité-complète)
5. [Labs Docker (scénarios pentest)](#labs-docker-scénarios-pentest)
6. [Architecture](#architecture)
7. [Comment fonctionne le terminal](#comment-fonctionne-le-terminal)
8. [Tests](#tests)
9. [Ajouter un niveau](#ajouter-un-niveau)

---

## Vue d'ensemble

EduLinux exécute un vrai shell `bash` dans le navigateur — pas de simulation, pas de sortie fictive. Chaque exercice crée un filesystem isolé, valide les commandes en interceptant ce que bash a réellement exécuté (pas les frappes clavier), et laisse l'utilisateur explorer librement.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 + Tailwind CSS 4 |
| Terminal | xterm.js (`@xterm/xterm`) |
| Shell | node-pty (vrai bash via PTY) |
| Transport | WebSocket (`ws`) |
| Serveur | Node.js HTTP + WS custom (`server.js`) |
| Auth | Supabase Auth |
| Base de données | Supabase PostgreSQL (avec RLS) |
| Logging | Pino (JSON structuré) |
| Tests | Jest + ts-jest |

---

## Démarrage en développement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement (Next.js + WebSocket sur le port 3000)
npm run dev
```

Si le port 3000 est déjà utilisé :

```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null; npm run dev
```

Variables d'environnement minimales pour le dev — créer un fichier `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## Déploiement en production

### Prérequis

- Node.js 18+ installé sur le serveur
- Un projet Supabase créé (gratuit ou payant)
- Un domaine pointant vers le serveur (ex: `edulinux.mondomaine.com`)
- Nginx installé (pour le reverse proxy HTTPS)
- Optionnel : Docker + Docker Compose (pour les labs pentest)

---

### Générer les secrets

> **Important :** Ne réutilise jamais les mêmes secrets entre environnements. Génère des valeurs fraîches pour chaque déploiement.

#### PTY_TOKEN_SECRET — obligatoire

C'est la clé HMAC-SHA256 qui signe les tokens d'accès au terminal. Elle **doit** être définie avant le démarrage en production, sinon le serveur en génère une aléatoire à chaque boot (ce qui invalide toutes les sessions actives à chaque redémarrage).

```bash
# Générer un secret de 64 caractères hexadécimaux (256 bits)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Exemple de sortie :
```
a3f8e2d1c4b5907623841fedcba09876543210abcdef1234567890abcdef1234
```

Copie cette valeur dans ton `.env.production` (voir section suivante).

#### Mots de passe MySQL des labs (si tu utilises les scénarios Docker)

```bash
# Générer un mot de passe root MySQL
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"

# Générer un mot de passe user MySQL (un second appel)
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

---

### Configurer .env.production

Sur le serveur, crée le fichier `/chemin/vers/edulinux/.env.production` :

```bash
cp .env.production.example .env.production
nano .env.production   # ou vim, ou l'éditeur de ton choix
```

Remplis **chaque** variable — voir `.env.production.example` pour le détail de chacune.

> **Ne commite jamais `.env.production`** — il est listé dans `.gitignore`.

---

### Configurer Supabase

#### 1. Activer Row Level Security (obligatoire)

Sans cette étape, n'importe quel utilisateur peut lire et modifier les données des autres.

Dans le **SQL Editor** de ton projet Supabase (`https://supabase.com/dashboard/project/<ton-projet>/sql`) :

```sql
-- Copie-colle le contenu de ce fichier :
-- supabase/migrations/20260413000000_rls.sql
```

Contenu du fichier à exécuter :

```sql
ALTER TABLE IF EXISTS user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_progress" ON user_progress;
CREATE POLICY "users_own_progress" ON user_progress
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE IF EXISTS user_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_notes" ON user_notes;
CREATE POLICY "users_own_notes" ON user_notes
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Vérifie que ça a bien marché :

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('user_progress', 'user_notes');
```

Résultat attendu : `rowsecurity = true` pour les deux lignes.

#### 2. Récupérer les clés Supabase

Dans le dashboard Supabase → **Project Settings → API** :

- `NEXT_PUBLIC_SUPABASE_URL` : l'URL du projet (ex: `https://abcdefgh.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` : la clé `anon` (publique)
- `SUPABASE_SERVICE_ROLE_KEY` : la clé `service_role` (secrète — ne jamais exposer côté client)

---

### Build et démarrage

```bash
# 1. Installer les dépendances de production
npm ci --omit=dev

# 2. Appliquer les correctifs de sécurité des dépendances
npm audit fix

# 3. Builder l'application Next.js
npm run build

# 4. Démarrer le serveur en production
NODE_ENV=production npm start
```

Pour un démarrage automatique avec PM2 (recommandé) :

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer avec PM2
pm2 start server.js --name edulinux --env production

# Démarrer automatiquement au reboot du serveur
pm2 startup
pm2 save

# Voir les logs en temps réel
pm2 logs edulinux

# Redémarrer après une mise à jour
pm2 reload edulinux
```

---

### Nginx (reverse proxy)

Nginx gère le HTTPS et redirige les connexions vers Node.js.

Fichier de configuration : `/etc/nginx/sites-available/edulinux`

```nginx
# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name edulinux.mondomaine.com;
    return 301 https://$host$request_uri;
}

# HTTPS + WebSocket
server {
    listen 443 ssl http2;
    server_name edulinux.mondomaine.com;

    ssl_certificate     /etc/letsencrypt/live/edulinux.mondomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/edulinux.mondomaine.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Rate limiting nginx (couche supplémentaire avant l'app)
    limit_req_zone $binary_remote_addr zone=pty:10m rate=2r/s;
    limit_req zone=pty burst=5 nodelay;

    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    # Proxy vers Node.js
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;  # connexions WebSocket longues
    }
}
```

Activer et recharger :

```bash
ln -s /etc/nginx/sites-available/edulinux /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Obtenir un certificat SSL avec Certbot
certbot --nginx -d edulinux.mondomaine.com
```

---

### Checklist de sécurité complète

Avant de mettre en ligne, vérifie **chaque point** :

```
── Secrets ──────────────────────────────────────────────────────────────────
[ ] PTY_TOKEN_SECRET est défini dans .env.production (64 chars hex)
[ ] SUPABASE_SERVICE_ROLE_KEY est correct et différent de la clé anon
[ ] NEXT_PUBLIC_APP_URL est défini (ex: https://edulinux.mondomaine.com)
[ ] NODE_ENV=production est bien passé au démarrage
[ ] .env.production n'est pas dans git (vérifier avec : git status)

── Supabase ─────────────────────────────────────────────────────────────────
[ ] RLS activée sur user_progress (SELECT rowsecurity FROM pg_tables ...)
[ ] RLS activée sur user_notes (même vérification)
[ ] Authentification Supabase configurée (providers activés, URLs de redirect)

── Serveur ───────────────────────────────────────────────────────────────────
[ ] npm audit fix exécuté, 0 vulnérabilités HIGH/CRITICAL
[ ] npm run build réussi sans erreur
[ ] npx tsc --noEmit passe (0 erreurs TypeScript)
[ ] npx jest --no-coverage passe (154+ tests verts)
[ ] PM2 configuré et démarrage automatique activé (pm2 startup && pm2 save)

── Nginx ─────────────────────────────────────────────────────────────────────
[ ] HTTPS actif (certificat Let's Encrypt)
[ ] Redirection HTTP → HTTPS en place
[ ] En-têtes de sécurité présents (HSTS, X-Frame-Options...)
[ ] Rate limiting nginx configuré dans le bloc http {}
[ ] WebSocket proxy_read_timeout ≥ 3600s

── Labs Docker (si utilisés) ────────────────────────────────────────────────
[ ] LAB_MYSQL_ROOT_PASSWORD changé (pas "ChangeMe_Before_Prod!")
[ ] LAB_MYSQL_PASSWORD changé (pas "dbpass_change_me")
[ ] Variables définies dans .env.production ou dans un .env séparé pour docker
[ ] docker compose -f docker-compose.labs.yml up -d --build fonctionne
```

---

## Labs Docker (scénarios pentest)

Les labs sont des conteneurs Docker optionnels utilisés par les scénarios avancés (niveaux 11-20 pentest).

### Démarrage rapide

```bash
# Démarrer tous les labs
docker compose -f docker-compose.labs.yml up -d --build

# Vérifier que les conteneurs tournent
docker compose -f docker-compose.labs.yml ps

# Entrer sur la machine attaquante
docker exec -it lab-attacker bash

# Arrêter les labs
docker compose -f docker-compose.labs.yml down
```

### Infrastructure réseau

| Réseau | Sous-réseau | Rôle |
|---|---|---|
| `lab_pentest` | `172.20.0.0/24` | Attaquant + cibles exposées |
| `lab_internal` | `172.21.0.0/24` | Cibles internes (pivot requis) |

Pour plus de détails : voir `README-labs.md`.

---

## Architecture

```
edulinux/
├── server.js                    # Serveur Node.js (Next.js + WebSocket PTY)
├── lib/
│   ├── security.js              # Path traversal, tokens HMAC, origin WS, Zod
│   ├── rate-limit.js            # Rate limiting en mémoire (sliding window)
│   ├── buffer-utils.js          # Borne mémoire du buffer PTY (500k chars)
│   └── logger.js                # Pino (JSON prod, pretty dev)
├── app/
│   ├── page.tsx                 # Accueil
│   ├── levels/[id]/page.tsx     # Runner de niveau
│   ├── scenarios/[id]/page.tsx  # Runner de scénario
│   └── api/
│       ├── pty-token/route.ts   # Génère un token d'accès PTY (rate-limité)
│       ├── progress/route.ts    # Sauvegarde/lecture progression (rate-limité)
│       └── notes/route.ts       # Notes utilisateur (rate-limité)
├── components/
│   └── RealTerminal.tsx         # Client xterm.js + WebSocket
├── data/
│   ├── levels/                  # 150 niveaux répartis en 16 fichiers
│   └── scenarios.ts             # 20 scénarios
├── hooks/
│   ├── useProgress.ts           # Progression (Supabase + localStorage)
│   └── useScenarioTimer.ts      # Timer par scénario (reset sur changement)
├── supabase/
│   └── migrations/
│       └── 20260413000000_rls.sql  # RLS user_progress + user_notes
└── __tests__/
    ├── validation.test.ts       # matchesRule() — 26 tests
    ├── security.test.ts         # lib/security.js — 50 tests
    ├── rate-limit.test.ts       # lib/rate-limit.js — 12 tests
    ├── server-safety.test.ts    # buffer PTY, DoS — 6 tests
    ├── levels.test.ts           # intégrité des niveaux — 30 tests
    └── scenarios.test.ts        # intégrité des scénarios — 31 tests
```

---

## Comment fonctionne le terminal

1. Le navigateur se connecte à `wss://ton-domaine.com/pty`
2. Le serveur vérifie l'en-tête `Origin` (CSRF protection)
3. Le client envoie un token HMAC signé (obtenu via `/api/pty-token`)
4. Le serveur vérifie le token (TTL 30s, usage unique)
5. Un processus `bash` est créé via node-pty dans un répertoire temporaire isolé (`/tmp/edulinux/<userId>-<random>/`)
6. Le filesystem du niveau est écrit sur disque depuis `data/levels/`
7. Un `.bashrc` injecte `PROMPT_COMMAND` qui envoie chaque commande exécutée via une séquence OSC invisible (`\x1b]777;CMD\x07`)
8. Le serveur intercepte ces séquences, valide la commande via `matchesRule()`, et les supprime avant d'envoyer la sortie à xterm.js
9. Le buffer de sortie est borné à 500k caractères (protection DoS mémoire)

---

## Tests

```bash
npm test                  # Lancer tous les tests
npm run test:watch        # Mode watch
npm run test:coverage     # Avec rapport de couverture
```

154 tests répartis en 6 suites :

| Suite | Tests | Couverture |
|---|---|---|
| `validation.test.ts` | 26 | Parsing commandes, pipes, redirections, ANSI |
| `security.test.ts` | 50 | Path traversal, tokens, origin WS, Zod |
| `rate-limit.test.ts` | 12 | Sliding window, reset, isolation des clés |
| `server-safety.test.ts` | 6 | Buffer PTY borné, protection DoS mémoire |
| `levels.test.ts` | 30 | Intégrité des 150 niveaux |
| `scenarios.test.ts` | 31 | Intégrité des 20 scénarios, scan ReDoS |

---

## Ajouter un niveau

Ajoute une entrée dans le fichier approprié dans `data/levels/` (chaque fichier couvre 10 niveaux) :

```typescript
{
  id: 151,
  title: "Titre du niveau",
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  category: "Catégorie",
  objective: "Objectif en une ligne",
  description: "Description en Markdown.",
  commands: ['cmd1', 'cmd2'],
  hints: ["Indice 1", "Indice 2"],
  fileSystem: {
    'readme.txt': 'Contenu du fichier',
    'subdir': {
      'nested.txt': 'Contenu imbriqué'
    }
  },
  validation: [
    { type: 'command', value: 'cat readme.txt', description: 'Lire le fichier' }
  ],
  story: "Contexte narratif du niveau."
}
```

Types de validation disponibles :
- `command` — vérifie la commande exécutée par bash
- `fileContent` — vérifie le contenu d'un fichier
- `fileExists` — vérifie qu'un fichier existe

---

## License

MIT
