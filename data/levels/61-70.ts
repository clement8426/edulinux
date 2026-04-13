import type { Level } from './_types';

export const levels61_70: Level[] = [
  // levels 61-70 (originally 21-30, renumbered+fixed)
  {
    id: 61,
    title: "Ports et scan",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Comprendre les ports",
    description: "Les services utilisent des ports. Simule un scan pour trouver les ports ouverts.",
    commands: ['nmap'],
    hints: [
      "nmap -sV 192.168.1.10",
      "nmap -p- scanne tous les ports de 0 à 65535"
    ],
    fileSystem: {
      'targets.txt': '192.168.1.1\n192.168.1.10\n10.0.0.1'
    },
    validation: [
      { type: 'command', value: 'nmap', description: 'Scanner une adresse IP avec nmap' }
    ],
    story: "🛰️ Un serveur inconnu. Scanne-le pour découvrir ses services actifs !"
  },
  {
    id: 62,
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
    id: 63,
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
    id: 64,
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
    id: 65,
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
    id: 66,
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
    id: 67,
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
    id: 68,
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
    id: 69,
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
    id: 70,
    title: "Récognition complète",
    difficulty: 'advanced',
    category: "Sécurité",
    objective: "Assembler toutes tes compétences",
    description: "Tu as un serveur cible. Fais une reconnaissance complète : nmap pour les ports, curl pour les en-têtes HTTP, base64 pour décoder un message encodé caché dans les headers.",
    commands: ['nmap', 'curl', 'grep', 'base64', 'file'],
    hints: [
      "nmap -sV 192.168.1.100",
      "curl -I http://192.168.1.100",
      "curl http://192.168.1.100/robots.txt",
      "grep -i 'x-secret' headers.txt",
      "base64 -d <<< 'ENCODED_VALUE'"
    ],
    fileSystem: {
      'targets.txt': '192.168.1.100',
      'expected_ports.txt': 'Port 22: SSH\nPort 80: HTTP\nPort 443: HTTPS'
    },
    validation: [
      { type: 'command', value: 'nmap', description: 'Scanner le serveur cible' },
      { type: 'command', value: 'curl -I', description: 'Récupérer les en-têtes HTTP' },
      { type: 'command', value: 'base64 -d', description: 'Décoder le message encodé' }
    ],
    story: "🔭 Avant toute attaque, la reconnaissance. nmap, curl, robots.txt — construis ta carte de la cible avant de frapper."
  },
];
