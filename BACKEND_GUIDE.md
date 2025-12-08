# 🔧 Guide : Ajouter un Backend à EduLinux

## 📊 État Actuel

**Architecture** : Frontend uniquement
- ✅ Next.js (SSR/SSG)
- ✅ localStorage pour progression
- ✅ Données statiques dans `data/levels.ts`
- ❌ Pas d'API backend
- ❌ Pas de base de données

---

## 🎯 Pourquoi Ajouter un Backend ?

### Cas d'Usage
- ✅ Synchronisation multi-appareils
- ✅ Classement global
- ✅ Statistiques partagées
- ✅ Authentification utilisateurs
- ✅ Progression sauvegardée dans le cloud
- ✅ Mode multijoueur

---

## 🚀 Option 1 : API Routes Next.js (Recommandé)

### Avantages
- ✅ Intégré à Next.js
- ✅ Pas de serveur séparé
- ✅ Déploiement simple (Vercel)
- ✅ Gratuit pour petits projets

### Structure

```
app/
├── api/
│   ├── progress/
│   │   ├── route.ts          # GET, POST progression
│   │   └── [userId]/route.ts # Progression par user
│   ├── levels/
│   │   └── route.ts          # GET niveaux
│   ├── leaderboard/
│   │   └── route.ts          # GET classement
│   └── auth/
│       └── route.ts          # POST login/register
```

### Exemple : API Progression

**`app/api/progress/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';

// Base de données simple (remplacer par vraie DB)
const progressDB = new Map<string, any>();

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  
  const progress = progressDB.get(userId) || {
    completedLevels: [],
    currentLevel: 1,
    totalXP: 0,
    badges: []
  };
  
  return NextResponse.json(progress);
}

export async function POST(request: NextRequest) {
  const { userId, progress } = await request.json();
  
  if (!userId || !progress) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  
  progressDB.set(userId, progress);
  
  return NextResponse.json({ success: true });
}
```

### Utilisation dans le Frontend

**`hooks/useProgress.ts` (modifié)**
```typescript
'use client';

import { useState, useEffect } from 'react';

export function useProgress(userId?: string) {
  const [progress, setProgress] = useState<UserProgress>({
    completedLevels: [],
    currentLevel: 1,
    totalXP: 0,
    badges: []
  });

  // Charger depuis API si userId fourni, sinon localStorage
  useEffect(() => {
    if (userId) {
      fetch(`/api/progress?userId=${userId}`)
        .then(res => res.json())
        .then(data => setProgress(data));
    } else {
      // Fallback localStorage
      const saved = localStorage.getItem('edulinux_progress');
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    }
  }, [userId]);

  const saveProgress = async (newProgress: UserProgress) => {
    setProgress(newProgress);
    
    if (userId) {
      // Sauvegarder sur serveur
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, progress: newProgress })
      });
    } else {
      // Fallback localStorage
      localStorage.setItem('edulinux_progress', JSON.stringify(newProgress));
    }
  };

  // ... reste du code
}
```

---

## 🗄️ Option 2 : Base de Données

### A. SQLite (Simple, Local)

**Installation**
```bash
npm install better-sqlite3
npm install @types/better-sqlite3 --save-dev
```

**`lib/db.ts`**
```typescript
import Database from 'better-sqlite3';

const db = new Database('edulinux.db');

// Créer tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT PRIMARY KEY,
    completed_levels TEXT,
    current_level INTEGER,
    total_xp INTEGER,
    badges TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export default db;
```

**`app/api/progress/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  const progress = db.prepare('SELECT * FROM progress WHERE user_id = ?').get(userId);
  
  return NextResponse.json(progress || {
    completedLevels: [],
    currentLevel: 1,
    totalXP: 0,
    badges: []
  });
}
```

### B. PostgreSQL (Production)

**Installation**
```bash
npm install pg
npm install @types/pg --save-dev
```

**`lib/db.ts`**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
```

**`.env.local`**
```
DATABASE_URL=postgresql://user:password@localhost:5432/edulinux
```

### C. Prisma (ORM Recommandé)

**Installation**
```bash
npm install prisma @prisma/client
npx prisma init
```

**`prisma/schema.prisma`**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  progress  Progress?
}

model Progress {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  completedLevels Int[]
  currentLevel    Int      @default(1)
  totalXP         Int      @default(0)
  badges          String[]
  updatedAt       DateTime @updatedAt
}
```

**`lib/prisma.ts`**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

**`app/api/progress/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  const progress = await prisma.progress.findUnique({
    where: { userId }
  });
  
  return NextResponse.json(progress || {
    completedLevels: [],
    currentLevel: 1,
    totalXP: 0,
    badges: []
  });
}
```

---

## 🔐 Option 3 : Authentification

### NextAuth.js (Recommandé)

**Installation**
```bash
npm install next-auth
```

**`app/api/auth/[...nextauth]/route.ts`**
```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export default NextAuth(authOptions);
```

**`app/layout.tsx`**
```typescript
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## 📊 Option 4 : Classement Global

**`app/api/leaderboard/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const leaderboard = await prisma.progress.findMany({
    orderBy: { totalXP: 'desc' },
    take: 100,
    include: {
      user: {
        select: { email: true }
      }
    }
  });
  
  return NextResponse.json(leaderboard);
}
```

**`app/leaderboard/page.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setScores(data));
  }, []);
  
  return (
    <div>
      <h1>🏆 Classement</h1>
      <ol>
        {scores.map((entry, i) => (
          <li key={i}>
            {i + 1}. {entry.user.email} - {entry.totalXP} XP
          </li>
        ))}
      </ol>
    </div>
  );
}
```

---

## 🚀 Déploiement avec Backend

### Vercel (Recommandé)
- ✅ Support API Routes automatique
- ✅ Variables d'environnement
- ✅ Base de données Vercel Postgres (gratuite)

### Netlify
- ✅ Functions serverless
- ✅ Variables d'environnement

### Railway / Render
- ✅ Base de données PostgreSQL incluse
- ✅ Déploiement simple

---

## 📋 Checklist Migration

### Étape 1 : Préparer
- [ ] Choisir solution (API Routes + DB)
- [ ] Installer dépendances
- [ ] Configurer variables d'environnement

### Étape 2 : Créer API
- [ ] `/api/progress` - GET/POST
- [ ] `/api/auth` - Login/Register
- [ ] `/api/leaderboard` - Classement

### Étape 3 : Modifier Frontend
- [ ] Adapter `useProgress.ts` pour API
- [ ] Ajouter authentification
- [ ] Ajouter page classement

### Étape 4 : Migrer Données
- [ ] Script migration localStorage → DB
- [ ] Tester synchronisation

### Étape 5 : Déployer
- [ ] Configurer DB production
- [ ] Déployer sur Vercel/Railway
- [ ] Tester en production

---

## 💡 Recommandations

### Pour Débuter
**API Routes Next.js + SQLite** (local)
- Simple
- Pas de configuration complexe
- Parfait pour tester

### Pour Production
**API Routes Next.js + Prisma + PostgreSQL**
- Scalable
- Type-safe
- Professionnel

### Pour Petits Projets
**API Routes Next.js + Vercel KV** (Redis)
- Gratuit
- Rapide
- Pas de DB à gérer

---

## 🎯 Exemple Complet Minimal

**`app/api/progress/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store (remplacer par DB)
const store = new Map();

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  return NextResponse.json(store.get(userId) || {
    completedLevels: [],
    currentLevel: 1,
    totalXP: 0,
    badges: []
  });
}

export async function POST(request: NextRequest) {
  const { userId, progress } = await request.json();
  store.set(userId, progress);
  return NextResponse.json({ success: true });
}
```

**Modifier `hooks/useProgress.ts`**
```typescript
// Remplacer localStorage par fetch('/api/progress')
```

---

## 📚 Ressources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

**💡 Conseil** : Commence simple avec API Routes + in-memory, puis migre vers une vraie DB quand nécessaire !

