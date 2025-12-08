# 🎯 Fonctionnalités Détaillées - EduLinux

## 📊 Vue d'Ensemble

EduLinux est une plateforme complète d'apprentissage du terminal Linux avec **30 niveaux progressifs** organisés en 3 difficultés.

---

## 🟢 NIVEAUX 1-10 : Bases Terminal & SSH

### Niveau 1 : Découvrir le terminal
- **Commande** : `echo`
- **Objectif** : Première interaction avec le terminal
- **Validation** : Utiliser echo pour afficher un message

### Niveau 2 : Lister les fichiers
- **Commande** : `ls`
- **Système de fichiers** : welcome.txt, password.txt, info.txt
- **Objectif** : Découvrir ce qui se trouve dans un dossier

### Niveau 3 : Se déplacer
- **Commandes** : `cd`, `pwd`
- **Arborescence** : documents/, images/, here.txt
- **Objectif** : Naviguer dans les dossiers

### Niveau 4 : Lire des fichiers
- **Commandes** : `cat`, `less`
- **Fichiers** : password.txt, readme.txt
- **Objectif** : Ouvrir et lire un fichier

### Niveau 5 : Navigation profonde
- **Arborescence** : home/user/documents/work/flag.txt
- **Objectif** : Descendre dans une hiérarchie complexe
- **Challenge** : Utiliser cd plusieurs fois

### Niveau 6 : Permissions basiques
- **Commande** : `chmod +r`
- **Fichier** : locked.txt (verrouillé)
- **Objectif** : Débloquer un fichier pour le lire

### Niveau 7 : Recherche dans fichier
- **Commande** : `grep`
- **Fichier** : log.txt (5 lignes)
- **Objectif** : Trouver "password" dans le fichier

### Niveau 8 : Recherche de fichier
- **Commande** : `find`
- **Arborescence** : 3 dossiers avec secret.txt caché
- **Objectif** : Localiser un fichier par son nom

### Niveau 9 : Décodage simple
- **Commande** : `base64 -d`
- **Fichier** : encoded.txt (base64)
- **Objectif** : Décoder un message crypté

### Niveau 10 : SSH - Connexion distante
- **Commande** : `ssh user@host -p port`
- **Objectif** : Maîtriser la syntaxe SSH complète
- **Badge** : 🔑 **SSH Master** débloqué !

---

## 🟡 NIVEAUX 11-20 : Manipulation & Automatisation

### Niveau 11 : Redirections & Pipes
- **Symboles** : `>`, `|`
- **Objectif** : Comprendre les flux de données

### Niveau 12 : Append vs Overwrite
- **Symboles** : `>` vs `>>`
- **Objectif** : Écrire sans écraser

### Niveau 13 : Analyse de texte
- **Commandes** : `wc`, `sort`, `uniq`
- **Fichier** : data.txt avec doublons
- **Objectif** : Compter et analyser

### Niveau 14 : Wildcards (*, ?)
- **Patterns** : `*.txt`, `file?.txt`
- **Fichiers** : report1.txt, report2.txt, data.csv
- **Objectif** : Filtrer par pattern

### Niveau 15 : Permissions avancées
- **Commande** : `chmod +x`
- **Fichier** : script.sh
- **Objectif** : Rendre un script exécutable

### Niveau 16 : Variables d'environnement
- **Commandes** : `export`, `echo $VAR`
- **Objectif** : Créer et afficher des variables

### Niveau 17 : Premier script Bash
- **Structure** : `#!/bin/bash`
- **Objectif** : Créer et exécuter hello.sh

### Niveau 18 : Chaîne de pipes
- **Commandes** : `grep | cut`
- **Fichier** : users.txt (format user:pass:id)
- **Objectif** : Extraire le mot de passe admin

### Niveau 19 : Compression
- **Commandes** : `tar -xvf`
- **Fichier** : archive.tar.gz
- **Objectif** : Extraire une archive

### Niveau 20 : Curl/Wget
- **Commandes** : `curl`, `wget`
- **Objectif** : Télécharger depuis le web
- **Badge** : ⚙️ **Automation Expert** débloqué !

---

## 🔴 NIVEAUX 21-30 : Techniques Avancées

### Niveau 21 : Ports et scan
- **Commande custom** : `scan`
- **Objectif** : Découvrir les services actifs

### Niveau 22 : Sudo & privilèges
- **Commande** : `sudo`
- **Fichier** : /root/secret.txt
- **Objectif** : Accéder à des fichiers protégés

### Niveau 23 : Clés SSH
- **Commande** : `ssh-keygen`
- **Objectif** : Générer une paire de clés RSA

### Niveau 24 : Hashing
- **Commandes** : `md5`, `sha256sum`
- **Challenge** : Trouver le mot original d'un hash

### Niveau 25 : Sed - Substitution
- **Commande** : `sed 's/ancien/nouveau/g'`
- **Fichier** : config.txt
- **Objectif** : Masquer les mots de passe

### Niveau 26 : Regex
- **Commande** : `grep -E`
- **Pattern** : `flag\{.*\}`
- **Objectif** : Extraire un flag avec regex

### Niveau 27 : Processus
- **Commandes** : `ps`, `kill`
- **Objectif** : Identifier et tuer un processus suspect

### Niveau 28 : SCP - Copie distante
- **Commande** : `scp`
- **Objectif** : Transférer un fichier vers un serveur

### Niveau 29 : SUID Exploit
- **Commandes** : `find`, `ls -l`
- **Binaire** : /usr/bin/secret_reader (SUID)
- **Objectif** : Comprendre les privilèges SUID

### Niveau 30 : Mission Finale 🏆
- **Multi-étapes** :
  1. `scan target` - Scanner le réseau
  2. `wget http://target/file.tar.gz` - Télécharger
  3. `tar -xvf file.tar.gz` - Extraire
  4. `cd hidden` - Naviguer
  5. `base64 -d` - Décoder
  6. `chmod +x unlock.sh` - Rendre exécutable
  7. `./unlock.sh` - Exécuter

- **Badge Final** : 👑 **Terminal Warrior** !

---

## 🎮 Système de Jeu

### Progression
- **XP** : +100 XP par niveau complété
- **Total** : 3000 XP maximum (30 niveaux)
- **Sauvegarde** : Automatique dans le navigateur

### Verrouillage
- Niveau 1 : Débloqué par défaut
- Niveau N : Débloqué après complétion du niveau N-1
- Système linéaire pour apprentissage progressif

### Badges
| Badge | Niveau | Condition |
|-------|--------|-----------|
| 🔑 SSH Master | 10 | Compléter niveau 10 |
| ⚙️ Automation Expert | 20 | Compléter niveau 20 |
| 👑 Terminal Warrior | 30 | Compléter niveau 30 |

### Validation
- **Temps réel** : Chaque commande est validée instantanément
- **Multi-critères** : Plusieurs validations par niveau possible
- **Feedback visuel** : ✅ pour chaque étape complétée
- **Célébration** : Animation + modal à la fin

---

## 🎨 Interface Utilisateur

### Page d'Accueil
```
┌─────────────────────────────────┐
│         💻 EduLinux             │
│  Apprends le Terminal comme     │
│       jamais auparavant         │
│                                 │
│  [🎮 30 Niveaux]               │
│  [🏆 Badges & XP]              │
│  [⚡ Terminal Réel]            │
│                                 │
│  [🚀 Commencer l'Aventure]     │
└─────────────────────────────────┘
```

### Liste des Niveaux
```
┌────────────────────────────────────────┐
│  Progression : ████████░░ 80% (24/30)  │
│  ⭐ 2400 XP  🏆 2 badges               │
├────────────────────────────────────────┤
│  [1] ✓  Découvrir le terminal    🟢   │
│  [2] ✓  Lister les fichiers      🟢   │
│  [3] ✓  Se déplacer              🟢   │
│  ...                                   │
│  [25] 🔓 Sed - Substitution       🔴   │
│  [26] 🔒 Regex (verrouillé)       🔴   │
└────────────────────────────────────────┘
```

### Page de Niveau
```
┌──────────────┬─────────────────────────┐
│ INFOS        │ TERMINAL                │
│              │                         │
│ [10]         │ $ ls                    │
│ 🟢 BEGINNER  │ file1.txt file2.txt    │
│              │ $ cat file1.txt        │
│ 🎯 Objectif  │ Hello World            │
│ ...          │ $ _                    │
│              │                         │
│ ⚡ Commandes │ 💡 Indices (3)         │
│ [ls] [cat]   │ └─ Click to expand     │
└──────────────┴─────────────────────────┘
```

---

## 💻 Fonctionnalités Terminal

### Réalisme
- ✅ Prompt avec `$`
- ✅ Coloration syntaxique
- ✅ Historique avec ↑ ↓
- ✅ Auto-scroll
- ✅ Simulation de filesystem
- ✅ Messages d'erreur

### Commandes Simulées
**20+ commandes** avec comportement réaliste :
- Navigation : ls, cd, pwd
- Lecture : cat, less
- Recherche : grep, find
- Manipulation : sed, cut, sort
- Réseau : ssh, scp, wget, curl
- Système : ps, kill, chmod
- Crypto : base64, md5, sha256
- Archives : tar, gzip

### Filesystem Virtuel
Chaque niveau a son propre système de fichiers simulé :
```javascript
fileSystem: {
  'file.txt': 'contenu',
  'folder': {
    'nested.txt': 'contenu imbriqué'
  }
}
```

---

## 🔧 Architecture Technique

### Stack
- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS 4
- **State** : React Hooks
- **Storage** : LocalStorage

### Structure
```
data/levels.ts        → Définition des 30 niveaux
components/Terminal.tsx → Composant terminal
hooks/useProgress.ts   → Gestion progression
app/page.tsx          → Accueil
app/levels/page.tsx   → Liste niveaux
app/levels/[id]/page.tsx → Niveau individuel
```

### Extensibilité
Ajouter un niveau est simple :
```typescript
{
  id: 31,
  title: "Nouveau niveau",
  difficulty: 'advanced',
  commands: ['command'],
  fileSystem: { ... },
  validation: [{ type: 'command', value: 'command' }]
}
```

---

## 📈 Métriques de Progression

### Par Utilisateur
- Niveaux complétés : 0-30
- XP total : 0-3000
- Badges : 0-3
- Niveau actuel : 1-31

### Globales (potentiel)
- Temps moyen par niveau
- Taux de complétion
- Commandes les plus utilisées
- Niveaux les plus difficiles

---

## 🚀 Évolutions Futures Possibles

### Niveaux 31-50
- Buffer overflow simulé
- Reverse shell
- Cryptographie CTF
- Forensic (logs, metadata)
- Exploitation binaire
- Réseau avancé (netcat, nmap)

### Fonctionnalités
- [ ] Mode multijoueur
- [ ] Classement global
- [ ] Éditeur de niveaux
- [ ] Export/Import progression
- [ ] Certificats de complétion
- [ ] Mode challenge chronométré
- [ ] Intégration Docker réel
- [ ] Support multi-langues
- [ ] Mode sombre/clair
- [ ] Thèmes personnalisables

### Gamification
- [ ] Séries (streaks)
- [ ] Achievements secrets
- [ ] Système de points de vie
- [ ] Power-ups
- [ ] Easter eggs

---

## 🎓 Pédagogie

### Approche
1. **Storytelling** : Chaque niveau a un contexte
2. **Progression** : Difficulté croissante
3. **Répétition** : Concepts réutilisés
4. **Feedback** : Validation instantanée
5. **Récompense** : XP et badges

### Inspirations
- **Duolingo** : Interface ludique, progression
- **Bandit (OverTheWire)** : Challenges réalistes
- **Codecademy** : Exercices interactifs

### Résultats Attendus
Après 30 niveaux, l'utilisateur sait :
✅ Naviguer en ligne de commande
✅ Manipuler fichiers et dossiers
✅ Utiliser SSH et SCP
✅ Écrire des scripts Bash
✅ Comprendre les permissions
✅ Analyser et filtrer du texte
✅ Utiliser grep/find/sed
✅ Gérer des processus
✅ Bases de cryptographie
✅ Réaliser une mission complète

---

**EduLinux - Transforme ton terminal en terrain de jeu éducatif ! 🎮🐧**

