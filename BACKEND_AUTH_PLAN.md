# Plan — Authentification & Persistance Backend

> Objectif : ajouter la connexion GitHub / Google / email+mot de passe pour persister la progression (niveaux, scénarios, notes) côté serveur. Tout hébergé sur Render.

---

## 1. Architecture cible

```
┌─────────────────────────────────────────────────────┐
│                  Render Web Service                  │
│                                                      │
│  Next.js 16 + server.js (WebSocket PTY)             │
│  ├── /api/auth/[...nextauth]  ← Auth.js             │
│  ├── /api/progress            ← GET / POST           │
│  └── /api/notes               ← GET / POST           │
└─────────────────────────────────────────────────────┘
              │
              │ SQL
              ▼
┌─────────────────────────────────────────────────────┐
│          Render PostgreSQL (même compte)             │
│                                                      │
│  tables : users, accounts, sessions,                │
│           user_progress, user_notes                  │
└─────────────────────────────────────────────────────┘
```

**Aucun service externe** — tout tourne sur Render : le Web Service existant + une base PostgreSQL managée.

---

## 2. Stack technique retenue

| Besoin | Outil | Pourquoi |
|---|---|---|
| Auth (OAuth + credentials) | **Auth.js v5** (NextAuth) | natif Next.js, 1 config pour 3 providers |
| Base de données | **Render PostgreSQL** | gratuit sur le même compte, pas de compte tiers |
| ORM | **Prisma** | TypeScript-first, migrations simples |
| Hash passwords | **bcryptjs** | légère, pas de dépendances natives |
| Session | JWT (stateless) | pas de table session à gérer, compatible edge |

---

## 3. Providers Auth

### 3.1 GitHub
- Créer une OAuth App sur `github.com/settings/developers`
- Callback URL : `https://ton-app.onrender.com/api/auth/callback/github`
- Variables : `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

### 3.2 Google
- Créer un projet sur `console.cloud.google.com`
- Activer Google+ API, créer des identifiants OAuth
- Callback URL : `https://ton-app.onrender.com/api/auth/callback/google`
- Variables : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### 3.3 Email + Mot de passe
- Provider `Credentials` de Auth.js
- Vérification hash bcrypt à la connexion
- Route `/api/auth/register` pour la création de compte (hors Auth.js)
- Pas d'email de vérification dans un premier temps (optionnel plus tard)

---

## 4. Schéma base de données

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Tables Auth.js ────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // null pour les comptes OAuth
  createdAt     DateTime  @default(now())

  accounts  Account[]
  progress  UserProgress?
  notes     UserNote[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  access_token      String?
  refresh_token     String?
  expires_at        Int?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

// ── Tables application ────────────────────────────────

model UserProgress {
  userId            String   @id
  levelsCompleted   Int[]    @default([])
  scenariosCompleted Int[]   @default([])
  scenarioSteps     Json     @default("{}")  // { "1": [101, 102], "2": [201] }
  xp                Int      @default(0)
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserNote {
  id        String   @id @default(cuid())
  userId    String
  key       String   // ex: "level-1" ou "scenario-2"
  content   String   @default("")
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, key])
}
```

---

## 5. Variables d'environnement à configurer sur Render

```env
# Base de données (fourni par Render PostgreSQL)
DATABASE_URL=postgresql://...

# Auth.js
NEXTAUTH_URL=https://ton-app.onrender.com
NEXTAUTH_SECRET=<openssl rand -base64 32>

# GitHub OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 6. API Routes à créer

### `GET/POST /api/progress`
- `GET` → retourne la progression de l'utilisateur connecté
- `POST` → met à jour `levelsCompleted`, `scenariosCompleted`, `scenarioSteps`, `xp`

### `GET/POST /api/notes`
- `GET ?key=level-1` → retourne la note pour cette clé
- `POST { key, content }` → upsert de la note

### `POST /api/auth/register`
- Crée un compte email/password (hash bcrypt + insert User)
- Retourne une session Auth.js

---

## 7. Migration localStorage → backend

La stratégie : **conserver localStorage comme cache local**, synchroniser avec le backend.

```
Connexion utilisateur
  ├─► Charger la progression depuis le backend
  └─► Fusionner avec localStorage (prendre le max entre les deux)

Action (compléter un niveau)
  ├─► Mettre à jour localStorage (immédiat, pas de latence)
  └─► POST /api/progress en arrière-plan (fire and forget)

Notes
  ├─► Sauvegarder dans localStorage (onChange)
  └─► POST /api/notes avec debounce 1s
```

Avantages :
- L'app reste 100% fonctionnelle sans compte (localStorage only)
- La connexion enrichit l'expérience sans la bloquer
- Offline-friendly

---

## 8. UI à ajouter

### Page `/auth/login`
- Bouton "Continuer avec GitHub" (logo GitHub)
- Bouton "Continuer avec Google" (logo Google)
- Séparateur "— ou —"
- Formulaire email / mot de passe
- Lien "Créer un compte"

### Page `/auth/register`
- Formulaire : nom, email, mot de passe, confirmation
- Après inscription → connexion automatique

### Composant `UserMenu` dans la nav (toutes les pages)
- Non connecté : bouton "Connexion" → `/auth/login`
- Connecté : avatar + pseudo + "Déconnexion"

### Badge de progression globale (optionnel phase 2)
- XP total, niveaux/scénarios complétés visible dans le profil

---

## 9. Ordre d'implémentation recommandé

```
Phase 1 — Infrastructure (1-2h)
  1. Créer la base PostgreSQL sur Render
  2. Installer Prisma + Auth.js + bcryptjs
  3. Configurer schema.prisma + migration initiale
  4. Configurer auth.config.ts (providers, callbacks JWT)

Phase 2 — API (1-2h)
  5. Route /api/auth/[...nextauth]
  6. Route /api/auth/register
  7. Route /api/progress (GET + POST)
  8. Route /api/notes (GET + POST)

Phase 3 — Frontend (2-3h)
  9. Pages /auth/login et /auth/register
  10. Composant UserMenu dans la nav
  11. Hook useProgress → synchronisation localStorage + backend
  12. useNotes → debounced sync

Phase 4 — Polish (1h)
  13. Fusion intelligente localStorage/backend à la connexion
  14. Messages d'erreur (email déjà pris, mauvais mot de passe…)
  15. Redirect après login vers la page d'origine
```

---

## 10. Dépendances à installer

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client bcryptjs
npm install -D @types/bcryptjs
```

---

## Notes importantes

- **Render PostgreSQL gratuit** expire après 90 jours sur le plan Hobby (Jan 2025). Pour un usage permanent, prévoir le plan Starter ($7/mois pour la DB) ou migrer vers **Neon** (PostgreSQL serverless, free tier permanent).
- **Auth.js v5** est en beta mais stable pour Next.js App Router. La v4 (NextAuth) fonctionne aussi mais avec un setup légèrement différent.
- **Pas d'email de vérification** dans ce plan pour rester simple. Peut s'ajouter avec Resend (gratuit jusqu'à 3000 emails/mois) en phase 2.
- La progression **sans compte reste possible** (localStorage) — les utilisateurs ne sont jamais forcés de créer un compte.
