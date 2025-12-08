# 📖 Index de la Documentation - EduLinux

Navigation rapide vers tous les documents du projet.

---

## 🚀 Pour Commencer

### ⚡ QUICKSTART.md
**Guide de démarrage en 5 minutes**
- Accéder à l'application
- Premier niveau
- Tutoriel interactif
- Astuces rapides

👉 [Ouvrir QUICKSTART.md](./QUICKSTART.md)

---

## 📚 Documentation Utilisateur

### 📖 GUIDE.md
**Guide utilisateur complet**
- Comment jouer
- Toutes les fonctionnalités
- Navigation de l'interface
- Système de progression
- Badges et récompenses
- Exemples détaillés

👉 [Ouvrir GUIDE.md](./GUIDE.md)

### 📟 COMMANDS.md
**Référence complète des commandes**
- 20+ commandes Linux
- Syntaxe et exemples
- Cas d'usage
- Organisation par catégorie
- Organisation par niveau
- Astuces et combinaisons

👉 [Ouvrir COMMANDS.md](./COMMANDS.md)

---

## 🔧 Documentation Technique

### 📊 PROJECT_SUMMARY.md
**Résumé technique du projet**
- Vue d'ensemble
- Architecture
- Technologies utilisées
- Statistiques du projet
- Roadmap
- État actuel

👉 [Ouvrir PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

### ✨ FEATURES.md
**Détails de toutes les fonctionnalités**
- 30 niveaux détaillés niveau par niveau
- Système de jeu
- Terminal simulé
- Interface utilisateur
- Progression
- Gamification

👉 [Ouvrir FEATURES.md](./FEATURES.md)

---

## 🤝 Pour les Contributeurs

### 🛠️ CONTRIBUTING.md
**Guide de contribution**
- Comment ajouter un niveau
- Ajouter une commande
- Structure du code
- Bonnes pratiques
- Tests
- Pull requests

👉 [Ouvrir CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📝 Suivi du Projet

### 📝 CHANGELOG.md
**Historique des versions**
- Version 1.0.0 (actuelle)
- Fonctionnalités ajoutées
- Bugs corrigés
- Roadmap future
- Notes de version

👉 [Ouvrir CHANGELOG.md](./CHANGELOG.md)

---

## 📄 Documentation Générale

### 📘 README.md
**Page principale du projet**
- Présentation
- Installation
- Fonctionnalités principales
- Parcours d'apprentissage
- Technologies
- Liens utiles

👉 [Ouvrir README.md](./README.md)

---

## 🗂️ Organisation des Documents

### Par Niveau d'Expérience

#### 🟢 Débutant (Utiliser l'application)
1. **QUICKSTART.md** - Commencer en 5 min
2. **README.md** - Vue d'ensemble
3. **GUIDE.md** - Apprendre à utiliser
4. **COMMANDS.md** - Référence des commandes

#### 🟡 Intermédiaire (Comprendre le projet)
1. **FEATURES.md** - Fonctionnalités détaillées
2. **PROJECT_SUMMARY.md** - Architecture technique
3. **CHANGELOG.md** - Évolution du projet

#### 🔴 Avancé (Contribuer)
1. **CONTRIBUTING.md** - Guide de contribution
2. Code source dans `/app`, `/components`, `/data`

---

## 📂 Structure du Projet

```
edulinux/
├── 📚 Documentation (tu es ici !)
│   ├── INDEX.md              ← Navigation des docs
│   ├── README.md             ← Présentation
│   ├── QUICKSTART.md         ← Démarrage rapide
│   ├── GUIDE.md              ← Guide utilisateur
│   ├── COMMANDS.md           ← Référence commandes
│   ├── FEATURES.md           ← Détails fonctionnalités
│   ├── PROJECT_SUMMARY.md    ← Résumé technique
│   ├── CONTRIBUTING.md       ← Guide contribution
│   └── CHANGELOG.md          ← Historique versions
│
├── 💻 Code Source
│   ├── app/
│   │   ├── page.tsx          ← Accueil
│   │   ├── layout.tsx        ← Layout
│   │   ├── globals.css       ← Styles
│   │   └── levels/
│   │       ├── page.tsx      ← Liste niveaux
│   │       └── [id]/page.tsx ← Niveau individuel
│   ├── components/
│   │   └── Terminal.tsx      ← Terminal simulé
│   ├── data/
│   │   └── levels.ts         ← 30 niveaux
│   └── hooks/
│       └── useProgress.ts    ← Progression
│
├── ⚙️ Configuration
│   ├── package.json          ← Dépendances
│   ├── tsconfig.json         ← TypeScript
│   ├── next.config.ts        ← Next.js
│   └── tailwind.config.*     ← Tailwind CSS
│
└── 📦 Autres
    ├── public/               ← Assets statiques
    └── node_modules/         ← Dépendances installées
```

---

## 🎯 Parcours de Lecture Recommandé

### 1️⃣ Je veux utiliser l'application
```
START → QUICKSTART.md → Application Web → GUIDE.md → COMMANDS.md
```

### 2️⃣ Je veux comprendre le projet
```
START → README.md → PROJECT_SUMMARY.md → FEATURES.md
```

### 3️⃣ Je veux contribuer
```
START → README.md → CONTRIBUTING.md → Code Source → Pull Request
```

### 4️⃣ Je cherche une commande spécifique
```
START → COMMANDS.md → Ctrl+F pour chercher
```

---

## 🔍 Recherche Rapide

### Par Sujet

#### 🎮 Niveaux et Progression
- **QUICKSTART.md** : Premiers niveaux
- **GUIDE.md** : Système de progression
- **FEATURES.md** : Détails des 30 niveaux
- **COMMANDS.md** : Commandes par niveau

#### 💻 Terminal et Commandes
- **COMMANDS.md** : Référence complète
- **GUIDE.md** : Comment utiliser le terminal
- **FEATURES.md** : Terminal simulé

#### 🏆 Badges et XP
- **GUIDE.md** : Système de badges
- **FEATURES.md** : Gamification
- **QUICKSTART.md** : Premiers badges

#### 🛠️ Code et Contribution
- **CONTRIBUTING.md** : Guide développeur
- **PROJECT_SUMMARY.md** : Architecture
- Code source : `/app`, `/components`, `/data`

#### 📊 État du Projet
- **README.md** : Statut actuel
- **CHANGELOG.md** : Versions
- **PROJECT_SUMMARY.md** : Statistiques

---

## 📱 Liens Rapides

### Application
- **Local** : http://localhost:3000
- **Réseau** : http://192.168.0.101:3000

### Commandes Utiles
```bash
# Lancer le serveur
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Linting
npm run lint
```

---

## 💡 Questions Fréquentes

### Où commencer ?
→ **QUICKSTART.md** pour démarrer en 5 minutes

### Comment jouer ?
→ **GUIDE.md** section "Comment Jouer"

### Quelle commande utiliser ?
→ **COMMANDS.md** + Ctrl+F

### Comment ajouter un niveau ?
→ **CONTRIBUTING.md** section "Ajouter un Niveau"

### Quelle version actuelle ?
→ **CHANGELOG.md** ou **README.md**

### L'application ne marche pas ?
→ **QUICKSTART.md** section "Problèmes Courants"

---

## 📊 Statistiques Documentation

| Type | Nombre | Lignes |
|------|--------|--------|
| 📚 Documents | 9 | ~5000 |
| 💻 Fichiers Code | 13 | ~3500 |
| 📦 Total Projet | 22 | ~8500 |

---

## 🎓 Glossaire

**Niveau** : Unité d'apprentissage (30 au total)  
**Terminal** : Interface de ligne de commande simulée  
**XP** : Points d'expérience (100 par niveau)  
**Badge** : Récompense spéciale (niveaux 10, 20, 30)  
**Validation** : Critère de complétion d'un niveau  
**Filesystem** : Système de fichiers virtuel du niveau  
**Pipe** : Opérateur | pour enchaîner commandes  
**Redirection** : Opérateurs > et >> pour sauvegarder  

---

## 🗺️ Plan du Site Web

```
/                        → Page d'accueil
/levels                  → Liste des niveaux
/levels/1                → Niveau 1
/levels/2                → Niveau 2
...
/levels/30               → Niveau 30 (Mission finale)
```

---

## 📞 Support

### Documentation
Tous les documents sont dans le dossier racine (`.md`)

### Code
Fichiers sources dans `/app`, `/components`, `/data`, `/hooks`

### Aide
- Indices dans chaque niveau
- Section FAQ dans GUIDE.md
- Guide de contribution dans CONTRIBUTING.md

---

## ✅ Checklist Première Utilisation

- [ ] Lire INDEX.md (ce fichier)
- [ ] Ouvrir QUICKSTART.md
- [ ] Lancer http://localhost:3000
- [ ] Compléter le niveau 1
- [ ] Consulter COMMANDS.md si bloqué
- [ ] Lire GUIDE.md pour approfondir

---

## 🎯 Navigation Rapide

| Je veux... | Document |
|-----------|----------|
| Démarrer vite | **QUICKSTART.md** |
| Apprendre tout | **GUIDE.md** |
| Référence commande | **COMMANDS.md** |
| Comprendre technique | **PROJECT_SUMMARY.md** |
| Voir fonctionnalités | **FEATURES.md** |
| Contribuer | **CONTRIBUTING.md** |
| Voir l'historique | **CHANGELOG.md** |
| Vue d'ensemble | **README.md** |

---

**📖 Tu es maintenant prêt à naviguer dans toute la documentation !**

**Commence par** : [QUICKSTART.md](./QUICKSTART.md) 🚀

---

*Index mis à jour : Décembre 2025*
*Version documentation : 1.0.0*

