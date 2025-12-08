# 🤝 Guide de Contribution - EduLinux

Merci de ton intérêt pour contribuer à EduLinux ! Ce guide t'aidera à ajouter des niveaux, améliorer le code, ou proposer de nouvelles fonctionnalités.

---

## 🎯 Comment Contribuer

### 1. Ajouter un Nouveau Niveau

Les niveaux sont définis dans `data/levels.ts`. Voici la structure :

```typescript
{
  id: 31, // Numéro unique
  title: "Titre du niveau",
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  category: "Catégorie", // Ex: "Réseau", "Scripts", etc.
  objective: "Ce que l'utilisateur doit accomplir",
  description: "Explication détaillée de la commande/concept",
  commands: ['commande1', 'commande2'], // Commandes clés
  hints: [
    "Premier indice",
    "Deuxième indice",
    "Exemple de commande"
  ],
  fileSystem: {
    'fichier.txt': 'Contenu du fichier',
    'dossier': {
      'sous-fichier.txt': 'Contenu imbriqué'
    }
  },
  validation: [
    {
      type: 'command',
      value: 'commande_attendue',
      description: 'Message de validation'
    }
  ],
  story: "📖 Contexte narratif du niveau"
}
```

### Exemple Complet : Niveau 31 - Introduction à AWK

```typescript
{
  id: 31,
  title: "AWK - Traitement de colonnes",
  difficulty: 'intermediate',
  category: "Analyse",
  objective: "Utiliser awk pour extraire des colonnes",
  description: "`awk` permet de traiter du texte structuré en colonnes. Syntaxe : `awk '{print $1}' fichier.txt`",
  commands: ['awk'],
  hints: [
    "awk '{print $1}' affiche la première colonne",
    "awk '{print $2}' affiche la deuxième colonne",
    "Les colonnes sont séparées par des espaces par défaut"
  ],
  fileSystem: {
    'data.txt': `John 25 Developer
Jane 30 Designer
Bob 28 Manager`
  },
  validation: [
    {
      type: 'command',
      value: 'awk',
      description: 'Utiliser awk pour traiter le fichier'
    }
  ],
  story: "📊 Un fichier de données structurées contient des informations sur des employés. Extrais uniquement les noms (première colonne)."
}
```

### 2. Ajouter une Nouvelle Commande au Terminal

Édite `components/Terminal.tsx` dans la fonction `simulateCommand` :

```typescript
// Exemple : Ajouter la commande awk
if (trimmedCmd.includes('awk')) {
  const parts = trimmedCmd.split(' ');
  const filename = parts[parts.length - 1];
  
  if (level.fileSystem[filename]) {
    const content = level.fileSystem[filename] as string;
    const lines = content.split('\n');
    
    // Extraire la première colonne
    const result = lines.map(line => line.split(' ')[0]);
    return result;
  }
  
  return ['awk: file not found'];
}
```

### 3. Ajouter un Nouveau Badge

Édite `hooks/useProgress.ts` :

```typescript
// Dans la fonction completeLevel
if (levelId === 40 && !newProgress.badges.includes('network_ninja')) {
  newProgress.badges.push('network_ninja');
}
```

Puis affiche-le dans `app/levels/[id]/page.tsx` :

```typescript
{levelId === 40 && (
  <div className="text-purple-400">🌐 Badge débloqué : Network Ninja</div>
)}
```

---

## 🔧 Structure du Code

### Architecture

```
edulinux/
├── app/
│   ├── page.tsx                    # 🏠 Page d'accueil
│   ├── layout.tsx                  # Layout global
│   ├── globals.css                 # Styles globaux
│   └── levels/
│       ├── page.tsx                # 📋 Liste des niveaux
│       └── [id]/
│           └── page.tsx            # 🎮 Page de niveau individuel
├── components/
│   └── Terminal.tsx                # 💻 Composant terminal simulé
├── data/
│   └── levels.ts                   # 📚 Définition des 30 niveaux
├── hooks/
│   └── useProgress.ts              # 📊 Hook de progression
├── README.md                       # Documentation principale
├── GUIDE.md                        # Guide utilisateur
├── FEATURES.md                     # Détails des fonctionnalités
└── CONTRIBUTING.md                 # Ce fichier
```

### Composants Clés

#### 1. Terminal.tsx
**Responsabilités** :
- Afficher l'interface terminal
- Gérer l'input utilisateur
- Simuler les commandes
- Valider les objectifs
- Afficher les résultats

**Props** :
```typescript
interface TerminalProps {
  level: Level;        // Niveau actuel
  onSuccess: () => void; // Callback de complétion
}
```

#### 2. useProgress.ts
**Responsabilités** :
- Sauvegarder la progression (localStorage)
- Gérer les XP
- Débloquer les niveaux
- Attribuer les badges

**API** :
```typescript
const {
  progress,           // État actuel
  completeLevel,      // Marquer un niveau comme complété
  resetProgress,      // Réinitialiser
  isLevelUnlocked,    // Vérifier si un niveau est accessible
  isLevelCompleted    // Vérifier si un niveau est complété
} = useProgress();
```

#### 3. levels.ts
**Responsabilités** :
- Définir tous les niveaux
- Structurer les données
- Fournir les fonctions utilitaires

**Fonctions** :
```typescript
getDifficultyColor(difficulty) // → 'text-green-500'
getDifficultyEmoji(difficulty) // → '🟢'
```

---

## 🎨 Guidelines de Design

### Couleurs
```css
Difficultés :
  - Débutant  : Vert  (#10b981) 🟢
  - Inter     : Jaune (#f59e0b) 🟡
  - Avancé    : Rouge (#ef4444) 🔴

Terminal :
  - Fond      : Gray-900 (#111827)
  - Input     : Cyan-400 (#22d3ee)
  - Output    : Gray-300 (#d1d5db)
  - Erreur    : Red-400 (#f87171)
  - Succès    : Green-400 (#4ade80)

Accents :
  - Primaire  : Blue-500 (#3b82f6)
  - Secondaire: Purple-600 (#9333ea)
```

### Typographie
- **Titres** : font-bold, text-2xl à text-6xl
- **Corps** : text-sm à text-base
- **Terminal** : font-mono
- **Badges** : text-xs avec background

### Animations
- **Hover** : scale-105, border color change
- **Modal** : bounce-in (0.5s)
- **Progression** : transition-all duration-500

---

## 📝 Bonnes Pratiques

### Niveaux
1. **Progression graduelle** : Chaque niveau doit introduire un seul nouveau concept
2. **Storytelling** : Ajoute un contexte narratif engageant
3. **Indices clairs** : Au moins 2-3 indices par niveau
4. **Validation simple** : Commence par une seule validation
5. **Fichiers réalistes** : Utilise des noms de fichiers crédibles

### Code
1. **TypeScript strict** : Toujours typer les variables
2. **Composants purs** : Évite les side-effects
3. **Hooks personnalisés** : Pour la logique réutilisable
4. **Comments** : Explique la logique complexe
5. **Tests** : (À venir) Ajoute des tests pour les nouvelles commandes

### UI/UX
1. **Responsive** : Teste sur mobile, tablet, desktop
2. **Accessibilité** : Utilise les attributs ARIA
3. **Feedback visuel** : Toujours confirmer les actions
4. **Performance** : Optimise les rendus
5. **Erreurs gracieuses** : Messages d'erreur compréhensibles

---

## 🧪 Tester Tes Modifications

### 1. Installation
```bash
cd /Users/soleadmaci9/test/edulinux
npm install
```

### 2. Développement
```bash
npm run dev
# → http://localhost:3000
```

### 3. Build de Production
```bash
npm run build
npm start
```

### 4. Linter
```bash
npm run lint
```

### 5. Tests Manuels
- [ ] Teste le nouveau niveau du début à la fin
- [ ] Vérifie que les commandes fonctionnent
- [ ] Confirme que les validations se déclenchent
- [ ] Assure que le niveau suivant se débloque
- [ ] Teste sur mobile et desktop

---

## 🐛 Signaler un Bug

### Template d'Issue

```markdown
## 🐛 Description du Bug
[Description claire]

## 📍 Niveau Concerné
Niveau X - [Titre]

## 🔄 Étapes pour Reproduire
1. Aller sur /levels/X
2. Taper la commande '...'
3. Observer l'erreur

## ✅ Comportement Attendu
[Ce qui devrait se passer]

## ❌ Comportement Actuel
[Ce qui se passe réellement]

## 🖥️ Environnement
- OS: [macOS / Windows / Linux]
- Navigateur: [Chrome 120 / Firefox 119]
- Version: [1.0.0]

## 📸 Captures d'Écran
[Si applicable]
```

---

## 💡 Proposer une Fonctionnalité

### Template de Feature Request

```markdown
## 💡 Fonctionnalité Proposée
[Titre de la fonctionnalité]

## 🎯 Problème à Résoudre
[Quel problème cette fonctionnalité résout-elle ?]

## 🔧 Solution Proposée
[Comment l'implémenter ?]

## 🎨 Design/UX
[Mockups ou descriptions visuelles]

## 🚀 Valeur Ajoutée
[Pourquoi c'est important ?]

## 📊 Alternatives Considérées
[Autres approches possibles]
```

---

## 🌟 Exemples de Contributions

### Niveau Facile : Ajouter des Indices
```typescript
// Avant
hints: [
  "Utilise ls"
]

// Après
hints: [
  "Utilise ls pour voir les fichiers",
  "ls -la affiche aussi les fichiers cachés",
  "Les fichiers cachés commencent par un point (.)"
]
```

### Niveau Moyen : Ajouter une Commande
```typescript
// Dans Terminal.tsx
if (trimmedCmd.startsWith('head ')) {
  const lines = trimmedCmd.match(/-n\s+(\d+)/)?.[1] || 10;
  const filename = trimmedCmd.split(' ').pop();
  const content = level.fileSystem[filename];
  
  if (typeof content === 'string') {
    return content.split('\n').slice(0, Number(lines));
  }
}
```

### Niveau Avancé : Système de Hints Progressifs
```typescript
// Hook personnalisé
function useProgressiveHints(hints: string[], delay: number) {
  const [visibleHints, setVisibleHints] = useState(1);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleHints(prev => 
        prev < hints.length ? prev + 1 : prev
      );
    }, delay);
    
    return () => clearInterval(timer);
  }, [hints.length, delay]);
  
  return hints.slice(0, visibleHints);
}
```

---

## 📚 Ressources Utiles

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react)

### Inspiration
- [OverTheWire Bandit](https://overthewire.org/wargames/bandit/)
- [Linux Journey](https://linuxjourney.com/)
- [Command Line Challenge](https://cmdchallenge.com/)

### Commandes Linux
- [Man Pages](https://man7.org/linux/man-pages/)
- [ExplainShell](https://explainshell.com/)
- [TLDR Pages](https://tldr.sh/)

---

## 🎖️ Hall of Fame

Contributeurs qui ont aidé à améliorer EduLinux :

- 🥇 **[Ton nom ici]** - Premier contributeur externe !

---

## 📬 Contact

- **Issues** : Ouvre une issue sur GitHub
- **Discussions** : Utilise les Discussions GitHub
- **Pull Requests** : Toujours les bienvenues !

---

## ✅ Checklist Avant Pull Request

- [ ] Le code compile sans erreur (`npm run build`)
- [ ] Pas d'erreur de linting (`npm run lint`)
- [ ] Les nouveaux niveaux sont testés manuellement
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les messages de commit sont clairs
- [ ] Les fichiers non nécessaires ne sont pas inclus
- [ ] Le code respecte les conventions du projet

---

**Merci de contribuer à EduLinux ! Ensemble, rendons l'apprentissage du terminal accessible à tous ! 🚀🐧**

