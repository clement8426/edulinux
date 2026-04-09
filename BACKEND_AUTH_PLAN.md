# Plan — Authentification & Persistance Backend (Supabase)

> Objectif : ajouter la connexion GitHub / Google / email+mot de passe pour persister la progression (niveaux, scénarios, notes). App sur Render, base de données + auth sur Supabase (gratuit sans limite de durée).

---

## Pourquoi Supabase plutôt que Render PostgreSQL

| Critère | Render PostgreSQL | Supabase |
|---|---|---|
| Durée gratuite | **90 jours** puis expire | **Illimité** (500MB) |
| Auth intégrée | ❌ (besoin d'Auth.js) | ✅ (GitHub, Google, email natif) |
| Dashboard data | basique | ✅ éditeur visuel de tables |
| Dépendances code | Prisma + Auth.js + bcryptjs | **`@supabase/supabase-js` uniquement** |
| Setup OAuth | dans le code | **dans le dashboard Supabase** |
| Sécurité | manuelle | Row Level Security (RLS) intégré |

**Conclusion** : Supabase divise par 3 la quantité de code à écrire et supprime le problème des 90 jours.

---

## 1. Architecture cible

```
┌─────────────────────────────────────────────────────┐
│              Render Web Service (inchangé)           │
│                                                      │
│  Next.js 16 + server.js (WebSocket PTY)             │
│  ├── /api/progress     ← GET / POST                 │
│  └── /api/notes        ← GET / POST                 │
│  (auth gérée par Supabase Auth directement)         │
└─────────────────────────────────────────────────────┘
              │  HTTPS
              ▼
┌─────────────────────────────────────────────────────┐
│              Supabase (service externe gratuit)      │
│                                                      │
│  ├── Auth    — GitHub, Google, email+password       │
│  ├── PostgreSQL — user_progress, user_notes         │
│  └── RLS     — chaque user ne voit que ses données  │
└─────────────────────────────────────────────────────┘
```

---

## 2. Stack technique retenue

| Besoin | Outil | Pourquoi |
|---|---|---|
| Auth (OAuth + email) | **Supabase Auth** | GitHub/Google/email configurés en dashboard, aucun code |
| Base de données | **Supabase PostgreSQL** | gratuit, illimité, même projet |
| Client JS | **`@supabase/supabase-js`** | remplace Prisma + Auth.js + bcryptjs |
| Sessions SSR | **`@supabase/ssr`** | gère les cookies de session côté serveur Next.js |
| Sécurité | **Row Level Security** | politiques SQL : chaque user accède uniquement à ses données |

**Total dépendances à ajouter : 2 packages** (`@supabase/supabase-js` + `@supabase/ssr`)

---

## 3. Ce que TU dois faire (sans code)

### 3.1 Créer le projet Supabase
1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Nomme-le `edulinux`, choisis une région **EU West** (ou US West)
3. Génère un mot de passe fort pour la DB (sauvegarde-le)
4. Attends 2 minutes que le projet se crée

### 3.2 Configurer GitHub OAuth
1. Va sur [github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**
   - Homepage : `https://ton-projet.supabase.co`
   - Callback URL : `https://ton-projet.supabase.co/auth/v1/callback`
2. Copie **Client ID** et **Client Secret**
3. Dans Supabase → **Authentication → Providers → GitHub** → active et colle les clés

### 3.3 Configurer Google OAuth
1. Va sur [console.cloud.google.com](https://console.cloud.google.com) → nouveau projet → **Identifiants OAuth**
   - Redirect URI : `https://ton-projet.supabase.co/auth/v1/callback`
2. Copie **Client ID** et **Client Secret**
3. Dans Supabase → **Authentication → Providers → Google** → active et colle les clés

### 3.4 Créer les tables dans Supabase
Va dans **Supabase → SQL Editor** et exécute ce SQL :

```sql
-- Table progression
create table user_progress (
  user_id uuid references auth.users(id) on delete cascade primary key,
  levels_completed integer[] default '{}',
  scenarios_completed integer[] default '{}',
  scenario_steps jsonb default '{}',
  xp integer default 0,
  updated_at timestamptz default now()
);

-- Table notes
create table user_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  key text not null,
  content text default '',
  updated_at timestamptz default now(),
  unique(user_id, key)
);

-- Sécurité : chaque utilisateur ne voit que ses propres données
alter table user_progress enable row level security;
alter table user_notes enable row level security;

create policy "own_progress" on user_progress for all using (auth.uid() = user_id);
create policy "own_notes" on user_notes for all using (auth.uid() = user_id);
```

### 3.5 Récupérer les clés Supabase
Dans Supabase → **Settings → API** :
- **Project URL** → `https://xxxxxxxx.supabase.co`
- **anon (public) key** → clé longue commençant par `eyJ...`
- **service_role key** → pour les routes API serveur (garde-la secrète)

### 3.6 Ajouter les variables sur Render
Dans ton Web Service Render → **Environment** → ajoute ces 3 variables :

```
NEXT_PUBLIC_SUPABASE_URL          → ton Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY     → ta clé anon
SUPABASE_SERVICE_ROLE_KEY         → ta clé service_role
```

---

## 4. Ce que MOI je fais (le code)

Une fois tes 3 variables Render configurées :

```
Phase 1 — Setup (30 min)
  1. npm install @supabase/supabase-js @supabase/ssr
  2. lib/supabase.ts — client browser + client server
  3. middleware.ts — refresh sessions automatique

Phase 2 — Auth pages (1h)
  4. app/auth/login/page.tsx — GitHub, Google, email+password
  5. app/auth/register/page.tsx — inscription email
  6. app/auth/callback/route.ts — handler OAuth redirect
  7. Composant UserMenu dans la nav (toutes les pages)

Phase 3 — API routes (1h)
  8. app/api/progress/route.ts — GET / POST (service_role)
  9. app/api/notes/route.ts — GET / POST (service_role)

Phase 4 — Sync localStorage ↔ backend (1h)
  10. Hook useProgress — sync silencieux en arrière-plan
  11. useNotes — debounce 1s avant POST
  12. Fusion à la connexion (prendre le max des deux)
```

**Total : ~3h30 de code côté moi.**

---

## 5. Variables d'environnement finales sur Render

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Existantes (inchangées)
PORT=10000
NODE_ENV=production
```

Aucune variable `NEXTAUTH_*`, `DATABASE_URL`, `GITHUB_CLIENT_*` ou `GOOGLE_CLIENT_*`
côté Render — tout ça est géré dans le dashboard Supabase.

---

## 6. Fonctionnement de l'auth Supabase

```
Utilisateur clique "GitHub"
  → redirigé vers github.com (Supabase gère)
  → revient sur /auth/callback
  → Supabase crée/met à jour l'entrée dans auth.users
  → session stockée dans un cookie HttpOnly
  → hook côté client détecte la session
  → fusion localStorage ↔ backend silencieuse
```

Pour email+password : Supabase gère le hash (bcrypt natif), pas besoin de bcryptjs.

---

## 7. Migration localStorage → backend (inchangée)

```
Connexion utilisateur
  ├─► Charger progression depuis Supabase
  └─► Fusionner avec localStorage (prendre le max)

Action (compléter un niveau)
  ├─► Mettre à jour localStorage (immédiat)
  └─► POST /api/progress en arrière-plan

Notes (onChange)
  ├─► Sauvegarder localStorage
  └─► POST /api/notes avec debounce 1s
```

L'app reste 100% fonctionnelle sans compte (localStorage only).

---

## 8. Limites du plan gratuit Supabase

| Ressource | Gratuit |
|---|---|
| Stockage DB | 500 MB (largement suffisant) |
| Auth users | illimité |
| Bande passante | 5 GB/mois |
| Durée | **Illimitée** (projet actif) |
| Inactivité | projet mis en pause après **1 semaine sans requête** — 1 clic pour réactiver |

> Pour éviter la mise en pause : un simple cron job gratuit (ex: UptimeRobot) qui ping `/api/progress` toutes les 5 min suffit.
