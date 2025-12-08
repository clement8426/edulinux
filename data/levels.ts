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
      { type: 'command', value: 'cd home/user/documents/work', description: 'Atteindre le dossier work' }
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
    objective: "Décoder du base64",
    description: "Le base64 est un encodage. Pour décoder : `echo 'texte' | base64 -d`",
    commands: ['base64', 'echo'],
    hints: [
      "cat encoded.txt pour voir le contenu",
      "cat encoded.txt | base64 -d pour décoder"
    ],
    fileSystem: {
      'encoded.txt': 'VEVSTUlOQUxfREVDT0RFUl8yMDI0',
      'info.txt': 'Le fichier encoded.txt contient un message en base64'
    },
    validation: [
      { type: 'command', value: 'base64 -d', description: 'Utiliser base64 -d pour décoder' }
    ],
    story: "🔐 Un message est encodé en base64. Décode-le pour révéler le secret !"
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
    objective: "Maîtriser > et |",
    description: "`>` écrit dans un fichier, `|` envoie la sortie d'une commande vers une autre.",
    commands: ['echo', 'grep', 'cat'],
    hints: [
      "echo 'texte' > fichier.txt pour écrire",
      "cat fichier | grep 'mot' pour filtrer"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'echo', description: 'Utiliser echo avec >' },
      { type: 'command', value: '|', description: 'Utiliser un pipe' }
    ],
    story: "🔀 Les commandes peuvent s'enchaîner. Apprends à diriger les flux de données !"
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
    objective: "Écrire et exécuter un script",
    description: "Un script est un fichier de commandes. Commence par `#!/bin/bash`.",
    commands: ['echo', 'chmod'],
    hints: [
      "echo '#!/bin/bash' > hello.sh",
      "chmod +x hello.sh",
      "./hello.sh pour exécuter"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: './hello.sh', description: 'Exécuter le script hello.sh' }
    ],
    story: "📜 Crée ton premier script automatisé. Le futur de l'administration système !"
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
    objective: "Comprendre les binaires SUID",
    description: "Les fichiers SUID s'exécutent avec les droits du propriétaire.",
    commands: ['ls', 'find'],
    hints: [
      "find / -perm -4000 trouve les SUID",
      "Un binaire SUID root peut donner des privilèges"
    ],
    fileSystem: {
      '/usr/bin/secret_reader': '[SUID] Exécute avec privilèges root'
    },
    validation: [
      { type: 'command', value: './secret_reader', description: 'Exécuter le binaire SUID' }
    ],
    story: "🔓 Un binaire avec SUID peut lire des fichiers protégés. Trouve-le !"
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

