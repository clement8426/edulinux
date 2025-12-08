# 📟 Référence des Commandes - EduLinux

Guide complet de toutes les commandes disponibles dans le terminal simulé d'EduLinux.

---

## 🟢 NIVEAU DÉBUTANT - Commandes de Base

### 📢 echo - Afficher du texte
```bash
echo Hello World
echo "Message avec espaces"
echo 'Autre message'
```
**Description** : Affiche du texte dans le terminal  
**Niveau(x)** : 1, 11, 12, 16  
**Cas d'usage** : Messages, création de variables, tests

---

### 📁 ls - Lister les fichiers
```bash
ls                    # Liste simple
ls -l                 # Liste détaillée
ls -a                 # Inclut fichiers cachés
ls *.txt              # Avec wildcard
ls -la                # Combiné
```
**Description** : Affiche le contenu d'un dossier  
**Niveau(x)** : 2, 3, 14, 15  
**Cas d'usage** : Explorer, trouver des fichiers

---

### 🗺️ cd - Changer de dossier
```bash
cd documents          # Aller dans documents
cd /home/user         # Chemin absolu
cd ..                 # Remonter d'un niveau
cd ../..              # Remonter de 2 niveaux
cd ~                  # Retour au home
```
**Description** : Navigue dans l'arborescence  
**Niveau(x)** : 3, 5  
**Cas d'usage** : Se déplacer entre dossiers

---

### 📍 pwd - Afficher le chemin actuel
```bash
pwd                   # Print Working Directory
```
**Description** : Montre où tu te trouves  
**Niveau(x)** : 3, 5  
**Cas d'usage** : S'orienter dans le système

---

### 📖 cat - Lire un fichier
```bash
cat fichier.txt              # Afficher le contenu
cat fichier1.txt fichier2.txt # Multiple files
cat file.txt | grep "mot"    # Avec pipe
```
**Description** : Affiche le contenu complet d'un fichier  
**Niveau(x)** : 4, 7, 9, 18  
**Cas d'usage** : Lire des fichiers texte

---

### 🔍 grep - Rechercher dans un fichier
```bash
grep "password" log.txt           # Recherche simple
grep -i "ERROR" log.txt           # Insensible à la casse
grep -E "flag\{.*\}" data.txt     # Avec regex
cat file.txt | grep "admin"       # Avec pipe
```
**Description** : Trouve des lignes contenant un motif  
**Niveau(x)** : 7, 18, 26  
**Cas d'usage** : Filtrer, chercher des patterns

---

### 🔎 find - Trouver des fichiers
```bash
find . -name "secret.txt"        # Par nom exact
find . -name "*.txt"             # Avec wildcard
find /home -type f               # Seulement fichiers
find /home -type d               # Seulement dossiers
```
**Description** : Localise des fichiers dans l'arborescence  
**Niveau(x)** : 8, 29  
**Cas d'usage** : Chercher des fichiers perdus

---

## 🟡 NIVEAU INTERMÉDIAIRE - Manipulation & Automatisation

### 🔀 Redirections - >, >>, |
```bash
echo "texte" > fichier.txt       # Écrire (écrase)
echo "texte" >> fichier.txt      # Ajouter (append)
cat file.txt | grep "mot"        # Pipe vers grep
ls | wc -l                       # Compter fichiers
```
**Description** : Dirige les flux de données  
**Niveau(x)** : 11, 12  
**Cas d'usage** : Sauvegarder, enchaîner commandes

---

### 📊 wc - Compter
```bash
wc -l fichier.txt                # Nombre de lignes
wc -w fichier.txt                # Nombre de mots
wc -c fichier.txt                # Nombre de caractères
cat file.txt | wc -l             # Avec pipe
```
**Description** : Compte lignes/mots/caractères  
**Niveau(x)** : 13  
**Cas d'usage** : Analyser la taille de fichiers

---

### 🔃 sort - Trier
```bash
sort fichier.txt                 # Tri alphabétique
sort -r fichier.txt              # Tri inverse
sort -n fichier.txt              # Tri numérique
cat data.txt | sort | uniq       # Avec uniq
```
**Description** : Trie les lignes  
**Niveau(x)** : 13  
**Cas d'usage** : Organiser des données

---

### 🎯 uniq - Supprimer doublons
```bash
uniq fichier.txt                 # Enlever doublons adjacents
sort file.txt | uniq             # Avec sort d'abord
sort file.txt | uniq -c          # Compter occurrences
```
**Description** : Élimine les lignes en double  
**Niveau(x)** : 13  
**Cas d'usage** : Nettoyer des listes

---

### 🔒 chmod - Modifier permissions
```bash
chmod +r fichier.txt             # Ajouter lecture
chmod +w fichier.txt             # Ajouter écriture
chmod +x script.sh               # Rendre exécutable
chmod 755 script.sh              # Notation octale
```
**Description** : Change les permissions de fichiers  
**Niveau(x)** : 6, 15, 17, 30  
**Cas d'usage** : Débloquer, sécuriser fichiers

---

### 🎯 export - Variables d'environnement
```bash
export VAR="valeur"              # Créer variable
export FLAG="success"            # Exemple
echo $VAR                        # Afficher
```
**Description** : Définit des variables système  
**Niveau(x)** : 16  
**Cas d'usage** : Configuration, scripts

---

### 📜 Scripts Bash
```bash
#!/bin/bash                      # Shebang
echo "Hello"                     # Commandes
chmod +x script.sh               # Rendre exécutable
./script.sh                      # Exécuter
```
**Description** : Automatise des tâches  
**Niveau(x)** : 17, 30  
**Cas d'usage** : Automatisation, workflows

---

### ✂️ cut - Découper par colonnes
```bash
cut -d':' -f1 users.txt          # 1ère colonne (délimiteur :)
cut -d':' -f2 users.txt          # 2ème colonne
cat file.txt | cut -d' ' -f3     # Avec pipe
```
**Description** : Extrait des champs  
**Niveau(x)** : 18  
**Cas d'usage** : Parser des fichiers structurés

---

### 📦 tar - Archives
```bash
tar -xvf archive.tar             # Extraire .tar
tar -xzvf archive.tar.gz         # Extraire .tar.gz
tar -cvf archive.tar dossier/    # Créer archive
```
**Description** : Manipule des archives  
**Niveau(x)** : 19, 30  
**Cas d'usage** : Décompresser, compresser

---

### 🌐 wget - Télécharger
```bash
wget https://example.com/file.txt       # Télécharger
wget https://example.com -O page.html   # Avec nom
```
**Description** : Récupère des fichiers web  
**Niveau(x)** : 20, 30  
**Cas d'usage** : Downloads, automation

---

### 🌐 curl - Requêtes HTTP
```bash
curl https://example.com                    # GET simple
curl https://example.com -o fichier.html    # Sauvegarder
curl -X POST https://api.com                # POST
```
**Description** : Interagit avec des URLs  
**Niveau(x)** : 20  
**Cas d'usage** : APIs, téléchargements

---

## 🔴 NIVEAU AVANCÉ - Réseau, Crypto, Système

### 🛰️ scan - Scanner des ports (custom)
```bash
scan 192.168.1.10               # Scanner une IP
scan target                     # Scanner la cible
```
**Description** : Détecte les ports ouverts (simulé)  
**Niveau(x)** : 21, 30  
**Cas d'usage** : Reconnaissance réseau

---

### 🌐 ssh - Connexion distante
```bash
ssh user@host                    # Connexion basique
ssh user@host -p 2222            # Avec port spécifique
ssh-keygen -t rsa                # Générer clé
```
**Description** : Se connecte à un serveur distant  
**Niveau(x)** : 10, 23  
**Cas d'usage** : Administration serveurs

---

### 👑 sudo - Privilèges élevés
```bash
sudo cat /root/secret.txt        # Lire avec sudo
sudo command                     # Exécuter en root
```
**Description** : Exécute avec droits admin  
**Niveau(x)** : 22  
**Cas d'usage** : Actions système

---

### 🔐 base64 - Encoder/Décoder
```bash
echo "hello" | base64            # Encoder
echo "aGVsbG8=" | base64 -d      # Décoder
cat file.txt | base64 -d         # Depuis fichier
```
**Description** : Encode/décode en base64  
**Niveau(x)** : 9, 30  
**Cas d'usage** : Obfuscation, transmission

---

### 🧩 md5 - Hash MD5
```bash
echo -n "hello" | md5            # Hash d'une chaîne
md5 fichier.txt                  # Hash d'un fichier
```
**Description** : Calcule un hash MD5  
**Niveau(x)** : 24  
**Cas d'usage** : Vérifier intégrité, crypto

---

### 🔐 sha256sum - Hash SHA256
```bash
echo -n "hello" | sha256sum      # Hash SHA256
sha256sum fichier.txt            # Depuis fichier
```
**Description** : Hash cryptographique fort  
**Niveau(x)** : 24  
**Cas d'usage** : Sécurité, vérifications

---

### ✏️ sed - Substitution
```bash
sed 's/ancien/nouveau/' file.txt          # Remplacer 1ère occurrence
sed 's/ancien/nouveau/g' file.txt         # Remplacer toutes
sed 's/password/*****/g' config.txt       # Masquer passwords
```
**Description** : Éditeur de flux  
**Niveau(x)** : 25  
**Cas d'usage** : Remplacements en masse

---

### ⚙️ ps - Processus
```bash
ps                               # Processus actuels
ps aux                           # Tous les processus
ps aux | grep malicious          # Filtrer
```
**Description** : Liste les processus en cours  
**Niveau(x)** : 27  
**Cas d'usage** : Monitoring, debug

---

### ❌ kill - Terminer un processus
```bash
kill 1234                        # Par PID
kill -9 1234                     # Force kill
pkill processname                # Par nom
```
**Description** : Arrête un processus  
**Niveau(x)** : 27  
**Cas d'usage** : Stopper programmes

---

### 📡 scp - Copie sécurisée
```bash
scp local.txt user@host:/remote/         # Upload
scp user@host:/remote/file.txt ./        # Download
scp -P 2222 file.txt user@host:/path     # Avec port
```
**Description** : Transfère des fichiers via SSH  
**Niveau(x)** : 28  
**Cas d'usage** : Backup, transferts sécurisés

---

## 🔥 COMMANDES SPÉCIALES

### less - Pager
```bash
less fichier.txt                 # Navigation page par page
```
**Description** : Affiche de gros fichiers  
**Niveau(x)** : 4  
**Cas d'usage** : Lire de longs logs

---

### ssh-keygen - Générer clés SSH
```bash
ssh-keygen                       # Clé RSA par défaut
ssh-keygen -t rsa                # Spécifier type
```
**Description** : Crée une paire de clés SSH  
**Niveau(x)** : 23  
**Cas d'usage** : Authentification sans mot de passe

---

## 📊 Récapitulatif par Catégorie

### Navigation (5 commandes)
- `ls` - Lister
- `cd` - Changer dossier
- `pwd` - Où suis-je
- `cat` - Afficher
- `less` - Pager

### Recherche (2 commandes)
- `grep` - Dans fichier
- `find` - Par nom

### Manipulation (7 commandes)
- `echo` - Afficher
- `>` / `>>` - Redirection
- `|` - Pipe
- `cut` - Colonnes
- `sort` - Trier
- `uniq` - Doublons
- `wc` - Compter

### Permissions (1 commande)
- `chmod` - Modifier droits

### Archives (1 commande)
- `tar` - Compresser/Extraire

### Réseau (4 commandes)
- `ssh` - Connexion
- `scp` - Transfert
- `wget` - Télécharger
- `curl` - HTTP

### Cryptographie (3 commandes)
- `base64` - Encoder
- `md5` - Hash
- `sha256sum` - Hash fort

### Système (3 commandes)
- `sudo` - Privilèges
- `ps` - Processus
- `kill` - Terminer

### Édition (1 commande)
- `sed` - Substituer

### Scripts (2 concepts)
- `#!/bin/bash` - Shebang
- `export` - Variables

---

## 🎓 Commandes par Niveau d'Apprentissage

| Niveau | Commandes Introduites |
|--------|----------------------|
| 1 | `echo` |
| 2 | `ls` |
| 3 | `cd`, `pwd` |
| 4 | `cat`, `less` |
| 5 | `cd ..` (navigation) |
| 6 | `chmod +r` |
| 7 | `grep` |
| 8 | `find` |
| 9 | `base64 -d` |
| 10 | `ssh` |
| 11 | `>`, `\|` |
| 12 | `>>` |
| 13 | `wc`, `sort`, `uniq` |
| 14 | `*`, `?` (wildcards) |
| 15 | `chmod +x` |
| 16 | `export` |
| 17 | Scripts bash |
| 18 | `cut`, pipes multiples |
| 19 | `tar` |
| 20 | `wget`, `curl` |
| 21 | `scan` (custom) |
| 22 | `sudo` |
| 23 | `ssh-keygen` |
| 24 | `md5`, `sha256sum` |
| 25 | `sed` |
| 26 | `grep -E` (regex) |
| 27 | `ps`, `kill` |
| 28 | `scp` |
| 29 | SUID (concepts) |
| 30 | Mission complète |

---

## 💡 Astuces & Combinaisons

### Recherche Puissante
```bash
find . -name "*.txt" | xargs grep "password"
```

### Pipeline de Traitement
```bash
cat log.txt | grep "ERROR" | sort | uniq -c | sort -nr
```

### Extraction Complexe
```bash
cat users.txt | grep "admin" | cut -d':' -f2 | base64 -d
```

### Script de Backup
```bash
tar -czvf backup.tar.gz /home
scp backup.tar.gz user@backup-server:/backups/
```

### Monitoring
```bash
ps aux | grep nginx | awk '{print $2}' | xargs kill
```

---

## 🎯 Progression Recommandée

1. **Semaine 1** : Niveaux 1-10 (Navigation, lecture)
2. **Semaine 2** : Niveaux 11-20 (Manipulation, automation)
3. **Semaine 3** : Niveaux 21-30 (Avancé, CTF)

**Total** : 21 jours pour devenir Terminal Warrior ! 🏆

---

## 📚 Ressources pour Aller Plus Loin

- **Man Pages** : `man command` (dans un vrai terminal)
- **ExplainShell** : https://explainshell.com
- **Linux Journey** : https://linuxjourney.com
- **OverTheWire** : https://overthewire.org

---

**EduLinux - Maîtrise ces commandes et deviens un expert Linux ! 💻🚀**

