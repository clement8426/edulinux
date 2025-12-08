# ⚡ Démarrage Rapide - EduLinux

## 🎯 En 5 Minutes

### 1️⃣ Le serveur est déjà lancé ! 🎉

Ouvre ton navigateur et va sur :
```
http://localhost:3000
```

### 2️⃣ Explore l'Application

#### Page d'Accueil
- Présentation d'EduLinux
- Clique sur **"🚀 Commencer l'Aventure"**

#### Liste des Niveaux (`/levels`)
- 30 niveaux organisés par difficulté
- Seul le niveau 1 est débloqué au départ
- Clique sur **Niveau 1** pour commencer

#### Niveau 1 - Ton Premier Challenge
```
📋 Objectif : Utiliser la commande echo
💡 Indice : echo Hello
```

**Dans le terminal (panneau droit), tape :**
```bash
echo Hello World
```

**Appuie sur Entrée** → ✅ Validation automatique !

### 3️⃣ Continue ta Progression

Après avoir complété le niveau 1 :
- 🎉 Modal de célébration
- ⭐ +100 XP
- 🔓 Niveau 2 débloqué

Clique sur **"Suivant →"** pour continuer !

---

## 🎮 Tutoriel Interactif

### Niveau 1 : echo
```bash
$ echo Bonjour
```

### Niveau 2 : ls
```bash
$ ls
# Affiche : welcome.txt  password.txt  info.txt
```

### Niveau 3 : cd
```bash
$ ls
# documents/  images/  here.txt
$ cd documents
$ ls
# secret.txt
```

### Niveau 4 : cat
```bash
$ ls
# password.txt  readme.txt
$ cat password.txt
# Le mot de passe secret est : TERMINAL_MASTER
```

### Niveau 7 : grep
```bash
$ grep password log.txt
# Ligne 3: password: GREP_WARRIOR_2024
```

### Niveau 9 : base64
```bash
$ cat encoded.txt
# VEVSTUlOQUxfREVDT0RFUl8yMDI0
$ cat encoded.txt | base64 -d
# TERMINAL_DECODER_2024
```

---

## 🏆 Objectifs Rapides

### 🎯 Session 1 (30 min) : Niveaux 1-5
**But** : Maîtriser la navigation
- echo, ls, cd, pwd, cat

### 🎯 Session 2 (30 min) : Niveaux 6-10
**But** : Recherche et SSH
- chmod, grep, find, base64, ssh
- 🏅 Badge : **SSH Master**

### 🎯 Session 3 (45 min) : Niveaux 11-15
**But** : Manipulation avancée
- Pipes, redirections, permissions

---

## 💡 Astuces Rapides

### Navigation Terminal
- **↑** : Commande précédente
- **↓** : Commande suivante
- **Entrée** : Exécuter

### Besoin d'aide ?
- 💡 Section **Indices** en bas du terminal
- 📚 Panneau gauche : objectif et description
- ⚡ Commandes clés affichées

### Bloqué ?
1. Lis les indices (section dépliable)
2. Vérifie l'objectif (panneau gauche)
3. Consulte `COMMANDS.md` pour la référence complète

---

## 🚀 Commandes Essentielles

### Top 10 pour Commencer
1. `echo` - Afficher du texte
2. `ls` - Lister fichiers
3. `cd` - Changer de dossier
4. `pwd` - Où suis-je ?
5. `cat` - Lire un fichier
6. `grep` - Chercher dans fichier
7. `find` - Trouver un fichier
8. `chmod` - Modifier permissions
9. `|` - Pipe (enchaîner commandes)
10. `>` - Redirection (sauvegarder résultat)

---

## 📊 Ta Progression

### Vérifier ton Statut
Sur la page `/levels` :
- **Barre de progression** : % de complétion
- **XP** : Points accumulés (max 3000)
- **Badges** : Récompenses débloquées
- **Niveau actuel** : Prochain niveau accessible

### Badges à Obtenir
- 🔑 **SSH Master** - Niveau 10 (1000 XP)
- ⚙️ **Automation Expert** - Niveau 20 (2000 XP)
- 👑 **Terminal Warrior** - Niveau 30 (3000 XP)

---

## 🎓 Parcours Recommandé

### Débutant (Niveaux 1-10)
**Temps estimé** : 2-3 heures
```
✓ Navigation basique
✓ Lecture de fichiers
✓ Recherche simple
✓ SSH
```

### Intermédiaire (Niveaux 11-20)
**Temps estimé** : 3-4 heures
```
✓ Pipes et redirections
✓ Scripts Bash
✓ Archives
✓ Téléchargement web
```

### Avancé (Niveaux 21-30)
**Temps estimé** : 4-5 heures
```
✓ Réseau avancé
✓ Cryptographie
✓ Processus
✓ Mission finale CTF
```

---

## 🐛 Problèmes Courants

### Le serveur ne répond pas
```bash
# Vérifier que le serveur tourne
# Dans un nouveau terminal :
cd /Users/soleadmaci9/test/edulinux
npm run dev
```

### Ma progression est perdue
La progression est sauvegardée dans le **navigateur** (localStorage).
- Ne vide pas le cache du navigateur
- Utilise toujours le même navigateur

### Réinitialiser la progression
```javascript
// Console du navigateur (F12) :
localStorage.removeItem('edulinux_progress')
location.reload()
```

### Le terminal ne répond pas
- Clique dans le terminal pour le focus
- Rafraîchis la page (F5)

---

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| `README.md` | Présentation générale |
| `GUIDE.md` | Guide utilisateur détaillé |
| `FEATURES.md` | Toutes les fonctionnalités |
| `COMMANDS.md` | Référence des commandes |
| `CONTRIBUTING.md` | Contribuer au projet |
| `PROJECT_SUMMARY.md` | Résumé technique |
| `CHANGELOG.md` | Historique des versions |
| `QUICKSTART.md` | Ce fichier |

---

## ⌨️ Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `Entrée` | Exécuter commande |
| `↑` | Commande précédente |
| `↓` | Commande suivante |
| `Clic` | Focus terminal |

---

## 🎯 Premiers Objectifs

### ✅ Checklist Débutant
- [ ] Compléter le niveau 1
- [ ] Atteindre 500 XP (5 niveaux)
- [ ] Compléter le niveau 10
- [ ] Obtenir le badge SSH Master
- [ ] Utiliser grep pour la première fois
- [ ] Décoder un message base64

---

## 💻 Interface Rapide

### Structure de l'Écran
```
┌─────────────────────────────────────┐
│         📋 Informations             │
│  ┌───────────┐                      │
│  │ [Niveau]  │  🎯 Objectif         │
│  │  Détails  │  📖 Description      │
│  │           │  📜 Histoire         │
│  │  ⚡ Cmd   │                      │
│  │  💡 Help  │                      │
│  └───────────┘                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     💻 TERMINAL                     │
│                                     │
│  $ ls                               │
│  file1.txt file2.txt                │
│  $ cat file1.txt                    │
│  Hello World                        │
│  $ _                                │
│                                     │
│  ───────────────────────────        │
│  💡 Indices (cliquer pour voir)     │
└─────────────────────────────────────┘
```

---

## 🎊 Premiers Pas

### 1. Lance l'App
```
✅ Serveur actif sur http://localhost:3000
```

### 2. Crée ton Premier Compte Virtuel
- Aucune inscription nécessaire
- La progression se sauvegarde automatiquement
- Commence directement à jouer

### 3. Apprends en Jouant
- Chaque niveau = nouveau concept
- Feedback instantané
- Progression sauvegardée

### 4. Débloque des Badges
- Niveaux 10, 20, 30 = badges spéciaux
- Célébrations visuelles
- Fierté d'avoir accompli

---

## 🏁 Challenge du Jour

### Mission : Devenir SSH Master 🔑

**Objectif** : Compléter les niveaux 1 à 10
**Temps** : ~2 heures
**Récompense** : Badge SSH Master + 1000 XP

**Commencer maintenant** : http://localhost:3000

---

## 🎉 Prêt à Commencer ?

### Clique ici pour lancer :
👉 **http://localhost:3000** 👈

### Ou tape dans ton terminal :
```bash
open http://localhost:3000  # macOS
xdg-open http://localhost:3000  # Linux
start http://localhost:3000  # Windows
```

---

## 💬 Besoin d'Aide ?

### Documentation
- 📖 Consulte `GUIDE.md` pour plus de détails
- 📟 Référence des commandes dans `COMMANDS.md`
- 🎯 Fonctionnalités complètes dans `FEATURES.md`

### Support
- 💡 Utilise les indices dans chaque niveau
- 📚 Lis la description à gauche
- 🔍 Cherche dans la documentation

---

**🚀 Bon apprentissage avec EduLinux !**
**💻 Transforme-toi en Terminal Warrior ! 🏆**

---

*P.S. : N'oublie pas de compléter le niveau 1 dès maintenant ! 😉*

