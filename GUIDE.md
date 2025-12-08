# 🚀 Guide de Démarrage EduLinux

## ✅ L'application est prête !

Le serveur de développement est lancé et accessible sur :
- **Local**: http://localhost:3000
- **Réseau**: http://192.168.0.101:3000

## 📋 Fonctionnalités Principales

### 1️⃣ Page d'Accueil
- Design moderne et attractif
- Présentation des 30 niveaux
- Badges et système de progression
- Appel à l'action "Commencer l'Aventure"

### 2️⃣ Liste des Niveaux (`/levels`)
- Grille de 30 niveaux organisés
- Indicateurs visuels :
  - 🟢 Vert = Débutant (1-10)
  - 🟡 Jaune = Intermédiaire (11-20)
  - 🔴 Rouge = Avancé (21-30)
- Système de verrouillage/déverrouillage
- Badge ✓ sur les niveaux complétés
- Barre de progression globale
- Affichage XP et badges gagnés

### 3️⃣ Page de Niveau (`/levels/[id]`)
**Panneau gauche - Informations :**
- Numéro et difficulté du niveau
- Objectif pédagogique
- Description détaillée
- Histoire/contexte
- Liste des commandes clés
- Critères de validation

**Panneau droit - Terminal :**
- Terminal simulé réaliste
- Header avec boutons macOS (rouge/jaune/vert)
- Chemin actuel affiché
- Historique de commandes (↑ ↓)
- Auto-completion visuelle
- Section d'indices dépliable

### 4️⃣ Système de Validation
- Validation en temps réel des commandes
- Messages de succès ✅
- Détection automatique de la complétion
- Modal de célébration avec :
  - Animation
  - +100 XP
  - Badges débloqués
  - Boutons "Niveaux" et "Suivant"

### 5️⃣ Progression Sauvegardée
- LocalStorage pour sauvegarder la progression
- Niveaux complétés mémorisés
- XP total cumulé
- Badges collectés
- Niveau actuel débloqué

## 🎮 Comment Jouer

### Étape 1 : Accueil
Visite http://localhost:3000 et clique sur "Commencer l'Aventure"

### Étape 2 : Choisir un Niveau
- Les niveaux débloqués ont une bordure bleue au survol
- Les niveaux verrouillés ont un cadenas 🔒
- Clique sur un niveau pour le lancer

### Étape 3 : Lire l'Objectif
- Lis attentivement l'objectif à gauche
- Consulte les indices si besoin (section dépliable)

### Étape 4 : Taper des Commandes
- Clique dans le terminal (panneau droit)
- Tape des commandes Linux
- Appuie sur Entrée pour exécuter
- Utilise ↑ et ↓ pour naviguer dans l'historique

### Étape 5 : Validation Automatique
- Chaque validation complétée affiche ✅
- Quand toutes les validations sont OK :
  - Message de célébration
  - +100 XP ajoutés
  - Niveau suivant débloqué
  - Badge possible (niveaux 10, 20, 30)

## 🏆 Badges Disponibles

### 🔑 SSH Master - Niveau 10
Récompense : Maîtrise des bases du terminal et SSH

### ⚙️ Automation Expert - Niveau 20
Récompense : Maîtrise des scripts et automatisation

### 👑 Terminal Warrior - Niveau 30
Récompense : Expert Linux complet !

## 💡 Exemples de Commandes

### Niveau 1 - echo
```bash
echo Hello World
```

### Niveau 2 - ls
```bash
ls
```

### Niveau 4 - cat
```bash
cat password.txt
```

### Niveau 7 - grep
```bash
grep password log.txt
```

### Niveau 9 - base64
```bash
cat encoded.txt | base64 -d
```

### Niveau 18 - Pipe complexe
```bash
cat users.txt | grep admin | cut -d':' -f2
```

### Niveau 30 - Mission finale
```bash
scan target
wget http://target/file.tar.gz
tar -xvf file.tar.gz
cd hidden
cat encoded.txt | base64 -d > decode.txt
chmod +x unlock.sh
./unlock.sh
```

## 🛠️ Commandes Terminal Supportées

| Commande | Description | Exemple |
|----------|-------------|---------|
| `echo` | Afficher du texte | `echo "Hello"` |
| `ls` | Lister fichiers | `ls` ou `ls *.txt` |
| `cd` | Changer de dossier | `cd documents` |
| `pwd` | Chemin actuel | `pwd` |
| `cat` | Lire un fichier | `cat file.txt` |
| `grep` | Rechercher | `grep "mot" fichier` |
| `find` | Trouver fichiers | `find . -name "*.txt"` |
| `chmod` | Permissions | `chmod +x script.sh` |
| `base64` | Encoder/Décoder | `echo "text" \| base64 -d` |
| `ssh` | Connexion | `ssh user@host -p 22` |
| `export` | Variable | `export VAR=value` |
| `tar` | Archive | `tar -xvf file.tar.gz` |
| `wget/curl` | Télécharger | `curl url -o file` |
| `scan` | Scanner ports | `scan 192.168.1.1` |
| `sudo` | Privilèges | `sudo cat /root/file` |
| `ssh-keygen` | Clé SSH | `ssh-keygen -t rsa` |
| `md5` | Hash | `echo "text" \| md5` |
| `sed` | Substitution | `sed 's/old/new/g'` |
| `ps` | Processus | `ps aux` |
| `kill` | Tuer processus | `kill 1234` |
| `scp` | Copie distante | `scp file user@host:/path` |

## 📱 Navigation Clavier

- **Entrée** : Exécuter la commande
- **↑** : Commande précédente
- **↓** : Commande suivante
- **Clic** : Focus sur le terminal

## 🎨 Design

- Theme sombre (mode terminal)
- Gradients bleu/violet/gris
- Animations fluides
- Responsive (mobile, tablet, desktop)
- Typographie claire
- Couleurs accessibles

## 🔄 Réinitialiser la Progression

Pour recommencer depuis le début, ouvre la console du navigateur (F12) et tape :
```javascript
localStorage.removeItem('edulinux_progress')
location.reload()
```

## 🚀 Prochaines Étapes

1. **Teste l'application** sur http://localhost:3000
2. **Complète les premiers niveaux** pour tester la progression
3. **Vérifie les badges** en complétant les niveaux 10, 20, 30
4. **Explore le code** pour personnaliser ou ajouter des niveaux

## 📞 Support

Si tu veux ajouter :
- ➕ Plus de niveaux (31-50)
- 🎨 Nouveaux thèmes
- 🌍 Multi-langues
- 🏅 Plus de badges
- 🎯 Nouveaux challenges

N'hésite pas à modifier les fichiers :
- `data/levels.ts` - Ajouter des niveaux
- `components/Terminal.tsx` - Ajouter des commandes
- `hooks/useProgress.ts` - Modifier le système de progression

## 🎉 Bon Apprentissage !

**EduLinux - Apprends, Pratique, Maîtrise Linux** 🐧

