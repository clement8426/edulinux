import type { Level } from './_types';

export const levels01_10: Level[] = [
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
    objective: "Afficher le contenu d'un fichier avec cat",
    description: "Pour lire un fichier, utilise `cat nom_fichier`. Tu peux d'abord faire `ls` pour voir les fichiers disponibles.",
    commands: ['cat', 'ls'],
    hints: [
      "Tape `ls` pour voir les fichiers disponibles.",
      "Tape `cat password.txt` pour afficher le contenu du fichier."
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
    objective: "Naviguer jusqu'au dossier work et lire le flag",
    description: "Navigue dans une arborescence complexe. `cd ..` remonte d'un niveau. Utilise `ls` à chaque étape pour voir ce qu'il y a.",
    commands: ['cd', 'pwd', 'ls', 'cat'],
    hints: [
      "Commence par `ls` pour voir le contenu du dossier courant.",
      "`cd nom_dossier` pour descendre, `cd ..` pour remonter.",
      "Le flag est dans `home/user/documents/work/flag.txt`."
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
      { type: 'command', value: 'cd work', description: 'Atteindre le dossier work' },
      { type: 'command', value: 'cat flag.txt', description: 'Lire le flag' }
    ],
    story: "🏔️ Le trésor est au fond de l'arborescence. Descends jusqu'au bout et lis le flag !"
  },
  {
    id: 6,
    title: "Permissions basiques",
    difficulty: 'beginner',
    category: "Permissions",
    objective: "Utiliser chmod pour débloquer un fichier, puis le lire",
    description: "Les fichiers ont des permissions. `chmod +r fichier` ajoute la permission de lecture. Sans elle, `cat` affiche une erreur.",
    commands: ['chmod', 'cat', 'ls'],
    hints: [
      "`ls -la` pour voir les permissions (la colonne `-rw-r--r--`).",
      "`chmod +r locked.txt` pour ajouter la permission de lecture.",
      "Ensuite `cat locked.txt` pour lire le contenu débloqué."
    ],
    fileSystem: {
      'locked.txt': 'Contenu secret : PASSWORD_IS_CHMOD_MASTER'
    },
    validation: [
      { type: 'command', value: 'chmod +r locked.txt', description: 'Rendre le fichier lisible avec chmod' },
      { type: 'command', value: 'cat locked.txt', description: 'Lire le fichier débloqué' }
    ],
    story: "🔒 Un fichier est verrouillé. Change ses permissions puis lis son contenu !"
  },
  {
    id: 7,
    title: "Recherche dans fichier",
    difficulty: 'beginner',
    category: "Recherche",
    objective: "Utiliser grep pour trouver le mot de passe dans un long fichier de log",
    description: "`grep 'mot' fichier` cherche et affiche uniquement les lignes contenant ce mot. Indispensable quand le fichier est trop long pour être lu en entier.",
    commands: ['grep', 'cat', 'wc'],
    hints: [
      "`wc -l log.txt` pour voir combien de lignes fait le fichier.",
      "`grep 'password' log.txt` pour extraire uniquement la ligne qui contient le mot de passe.",
      "`cat log.txt` fonctionne aussi mais tu vas devoir faire défiler 150 lignes..."
    ],
    fileSystem: {
      'log.txt': `[2024-01-15 00:00:01] INFO  kernel: system boot sequence initiated
[2024-01-15 00:00:02] INFO  kernel: loading modules... ok
[2024-01-15 00:00:03] INFO  systemd: starting network manager
[2024-01-15 00:00:04] INFO  networkd: interface eth0 up
[2024-01-15 00:00:05] INFO  networkd: DHCP lease acquired 192.168.1.42
[2024-01-15 00:00:06] INFO  sshd: listening on 0.0.0.0 port 22
[2024-01-15 00:00:07] INFO  cron: daemon started
[2024-01-15 00:00:08] INFO  rsyslog: logging to /var/log/syslog
[2024-01-15 00:00:09] INFO  auditd: audit daemon started
[2024-01-15 00:00:10] INFO  kernel: all modules loaded
[2024-01-15 00:01:02] INFO  sshd: accepted connection from 10.0.0.5
[2024-01-15 00:01:03] INFO  sshd: user admin authenticated
[2024-01-15 00:01:05] INFO  bash: session opened for user admin
[2024-01-15 00:01:10] INFO  sudo: admin ran /usr/bin/apt-get update
[2024-01-15 00:01:45] INFO  apt: reading package lists
[2024-01-15 00:01:46] INFO  apt: 0 packages upgraded, 0 newly installed
[2024-01-15 00:02:01] INFO  cron: running daily backup script
[2024-01-15 00:02:03] INFO  backup: /home compressed → /var/backup/home.tar.gz
[2024-01-15 00:02:04] INFO  backup: /etc compressed → /var/backup/etc.tar.gz
[2024-01-15 00:02:05] INFO  backup: completed successfully, 2 archives
[2024-01-15 00:03:12] WARN  diskd: /dev/sda1 usage at 78%
[2024-01-15 00:03:13] INFO  diskd: threshold not reached, no action
[2024-01-15 00:04:00] INFO  ntpd: time synchronized with pool.ntp.org
[2024-01-15 00:04:01] INFO  ntpd: offset -0.0023s, stratum 2
[2024-01-15 00:05:00] INFO  monit: all services running normally
[2024-01-15 00:05:01] INFO  monit: cpu 4%, mem 31%, load 0.12
[2024-01-15 00:06:30] INFO  sshd: connection closed by 10.0.0.5
[2024-01-15 00:06:31] INFO  bash: session closed for user admin
[2024-01-15 00:10:00] INFO  cron: running health check
[2024-01-15 00:10:01] INFO  health: web service responding on :8080
[2024-01-15 00:10:02] INFO  health: database responding on :5432
[2024-01-15 00:10:03] INFO  health: redis responding on :6379
[2024-01-15 00:15:00] INFO  logrotate: rotating /var/log/nginx/access.log
[2024-01-15 00:15:01] INFO  logrotate: rotation complete, 7 files kept
[2024-01-15 00:20:00] INFO  cron: running cleanup script
[2024-01-15 00:20:02] INFO  cleanup: removed 14 tmp files older than 7 days
[2024-01-15 00:20:03] INFO  cleanup: freed 234 MB in /tmp
[2024-01-15 00:25:11] WARN  sshd: failed login attempt for user root from 185.220.101.5
[2024-01-15 00:25:12] WARN  sshd: failed login attempt for user root from 185.220.101.5
[2024-01-15 00:25:13] WARN  sshd: failed login attempt for user admin from 185.220.101.5
[2024-01-15 00:25:14] WARN  fail2ban: banning 185.220.101.5 for 600s
[2024-01-15 00:30:00] INFO  cron: running certificate check
[2024-01-15 00:30:01] INFO  certbot: certificate expires in 47 days
[2024-01-15 00:30:02] INFO  certbot: no renewal needed
[2024-01-15 00:35:00] INFO  monit: all services running normally
[2024-01-15 00:40:00] INFO  ntpd: time synchronized with pool.ntp.org
[2024-01-15 00:45:00] INFO  cron: running db snapshot
[2024-01-15 00:45:02] INFO  postgres: snapshot /var/db/snap-20240115.sql created
[2024-01-15 00:45:03] INFO  postgres: snapshot size 1.2 GB
[2024-01-15 00:50:00] INFO  monit: all services running normally
[2024-01-15 00:55:00] INFO  logd: flushing buffer to disk
[2024-01-15 01:00:00] INFO  cron: hourly tasks complete
[2024-01-15 01:00:01] INFO  monit: cpu 3%, mem 29%, load 0.08
[2024-01-15 01:05:42] INFO  sshd: accepted connection from 10.0.0.8
[2024-01-15 01:05:43] INFO  sshd: user deploy authenticated via key
[2024-01-15 01:05:50] INFO  bash: session opened for user deploy
[2024-01-15 01:06:00] INFO  deploy: starting deployment v2.4.1
[2024-01-15 01:06:05] INFO  deploy: pulling docker image app:2.4.1
[2024-01-15 01:06:45] INFO  deploy: image pulled successfully
[2024-01-15 01:06:46] INFO  deploy: stopping container app:2.4.0
[2024-01-15 01:06:48] INFO  deploy: container stopped
[2024-01-15 01:06:49] INFO  deploy: starting container app:2.4.1
[2024-01-15 01:06:52] INFO  deploy: container started, health check pending
[2024-01-15 01:07:05] INFO  deploy: health check passed
[2024-01-15 01:07:06] INFO  deploy: deployment v2.4.1 successful
[2024-01-15 01:07:07] INFO  nginx: reloading configuration
[2024-01-15 01:07:08] INFO  nginx: reload complete, 0 errors
[2024-01-15 01:07:10] INFO  bash: session closed for user deploy
[2024-01-15 01:07:11] INFO  sshd: connection closed by 10.0.0.8
[2024-01-15 01:10:00] INFO  monit: all services running normally
[2024-01-15 01:15:00] INFO  monit: cpu 8%, mem 33%, load 0.21
[2024-01-15 01:20:00] INFO  diskd: /dev/sda1 usage at 79%
[2024-01-15 01:25:00] INFO  cron: running session cleanup
[2024-01-15 01:25:01] INFO  cleanup: expired 42 user sessions
[2024-01-15 01:30:00] INFO  ntpd: time synchronized with pool.ntp.org
[2024-01-15 01:35:00] INFO  monit: all services running normally
[2024-01-15 01:40:00] INFO  logd: rotating in-memory buffer
[2024-01-15 01:45:00] INFO  cron: running api key audit
[2024-01-15 01:45:01] INFO  audit: 14 active api keys found
[2024-01-15 01:45:02] INFO  audit: 2 keys unused for >90 days, flagged for review
[2024-01-15 01:50:00] INFO  monit: all services running normally
[2024-01-15 01:55:00] INFO  logd: flushing buffer to disk
[2024-01-15 02:00:00] INFO  cron: hourly tasks complete
[2024-01-15 02:00:01] INFO  monit: cpu 4%, mem 30%, load 0.10
[2024-01-15 02:05:00] INFO  rsyslog: buffer flush complete
[2024-01-15 02:10:00] INFO  diskd: /dev/sda1 usage still at 79%
[2024-01-15 02:15:33] INFO  app: config reload triggered by SIGHUP
[2024-01-15 02:15:34] INFO  app: loading /etc/app/config.yml
[2024-01-15 02:15:35] INFO  app: password: GREP_WARRIOR_2024
[2024-01-15 02:15:36] INFO  app: database_host: db.internal
[2024-01-15 02:15:37] INFO  app: cache_ttl: 300s
[2024-01-15 02:15:38] INFO  app: config reload complete
[2024-01-15 02:20:00] INFO  monit: all services running normally
[2024-01-15 02:25:00] INFO  ntpd: time synchronized with pool.ntp.org
[2024-01-15 02:30:00] INFO  cron: running integrity check
[2024-01-15 02:30:02] INFO  integrity: checksums verified for 1847 files
[2024-01-15 02:30:03] INFO  integrity: 0 anomalies detected
[2024-01-15 02:35:00] INFO  monit: all services running normally
[2024-01-15 02:40:00] INFO  diskd: /dev/sda1 usage at 79%
[2024-01-15 02:45:00] INFO  cron: running log archive
[2024-01-15 02:45:01] INFO  logarchive: compressing logs older than 30 days
[2024-01-15 02:45:04] INFO  logarchive: archived 2.3 GB to /var/archive/
[2024-01-15 02:50:00] INFO  monit: all services running normally
[2024-01-15 02:55:00] INFO  logd: flushing buffer to disk
[2024-01-15 03:00:00] INFO  cron: hourly tasks complete
[2024-01-15 03:00:01] INFO  monit: cpu 3%, mem 28%, load 0.07
[2024-01-15 03:05:00] INFO  rsyslog: all buffers clean
[2024-01-15 03:10:22] WARN  diskd: /dev/sda1 usage at 80%, threshold reached
[2024-01-15 03:10:23] WARN  diskd: sending alert to admin@company.internal
[2024-01-15 03:10:24] INFO  alertd: email queued for delivery
[2024-01-15 03:15:00] INFO  monit: all services running normally
[2024-01-15 03:20:00] INFO  ntpd: time synchronized with pool.ntp.org
[2024-01-15 03:25:00] INFO  cron: running user audit
[2024-01-15 03:25:01] INFO  audit: 7 active user accounts
[2024-01-15 03:25:02] INFO  audit: last login admin 2024-01-15 00:01:03
[2024-01-15 03:25:03] INFO  audit: last login deploy 2024-01-15 01:05:43
[2024-01-15 03:30:00] INFO  monit: all services running normally
[2024-01-15 03:35:00] INFO  logd: rotating in-memory buffer
[2024-01-15 03:40:00] INFO  cron: running metrics snapshot
[2024-01-15 03:40:01] INFO  metrics: requests_total=184203 errors_total=12 uptime=99.99%
[2024-01-15 03:45:00] INFO  monit: all services running normally
[2024-01-15 03:50:00] INFO  logd: flushing buffer to disk
[2024-01-15 03:55:00] INFO  cron: running final nightly cleanup
[2024-01-15 03:55:01] INFO  cleanup: temp files removed
[2024-01-15 03:55:02] INFO  cleanup: all tasks complete
[2024-01-15 03:59:59] INFO  logd: nightly log rotation complete — 152 entries written`
    },
    validation: [
      { type: 'command', value: 'grep password log.txt', description: 'Trouver la ligne contenant "password" dans log.txt' }
    ],
    story: "🔍 Un fichier de log de 152 lignes contient le mot de passe quelque part. Le lire en entier serait long — utilise grep pour trouver directement ce qui t'intéresse."
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
      { type: 'command', value: 'find', description: 'Utiliser find pour localiser secret.txt' },
      { type: 'command', value: 'cat', description: 'Lire le contenu du fichier trouvé' }
    ],
    story: "📂 Le fichier secret.txt est caché quelque part dans l'arborescence. Trouve-le, puis lis-le !"
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
      'encoded.txt': 'VEVSTUlOQUxfREVDT0RFUl8yMDI0Cg==',
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

⚠️ Attention : utilise le bon port, pas le port par défaut (22) !`,
      'bin/ssh': `#!/bin/bash
# EduLinux SSH simulator — connexion réaliste simulée
HOST="" PORT=22 USER="student" NEXT_PORT=0
for arg in "$@"; do
  if [ "$NEXT_PORT" = "1" ]; then PORT="$arg"; NEXT_PORT=0
  elif [ "$arg" = "-p" ]; then NEXT_PORT=1
  elif echo "$arg" | grep -q "@"; then USER="\${arg%%@*}"; HOST="\${arg##*@}"
  fi
done
# Niveau 10 : le bon port est 2222 — sans -p ou mauvais port → échec explicite (pas de faux succès)
if [ "\${HOST}" = "backup.edulinux.local" ] && [ "\${PORT}" != "2222" ]; then
  printf "\\033[31m✘ Connexion refusée : mauvais port pour ce serveur de backup.\\033[0m\\n"
  printf "\\033[33m   Relis instructions.txt : il faut \\033[1m-p 2222\\033[0m\\033[33m (pas le port 22 par défaut).\\033[0m\\n"
  printf "\\033[90m   Exemple : ssh admin@backup.edulinux.local -p 2222\\033[0m\\n"
  exit 1
fi
printf "ssh: connecting to %s (port %s) as %s...\\n" "\${HOST:-server}" "\${PORT}" "\${USER}"
sleep 0.8
printf "The authenticity of host '[%s]:%s' can't be established.\\n" "\${HOST}" "\${PORT}"
printf "ED25519 key fingerprint is SHA256:xK2m9nPqR7vL4tY1uW8eJ3bC6dF0gH5i.\\n"
printf "Warning: Permanently added '[%s]:%s' (ED25519) to the list of known hosts.\\n" "\${HOST}" "\${PORT}"
sleep 0.4
printf "\\033[32m✔ Connexion SSH établie avec succès !\\033[0m\\n"
printf "\\n"
printf "  ╔══════════════════════════════════════╗\\n"
printf "  ║   EduLinux Backup Server v2.4.1      ║\\n"
printf "  ║   Hostname : backup-server            ║\\n"
printf "  ║   Adresse  : 10.10.10.50:%s          ║\\n" "\${PORT}"
printf "  ║   Dernier login : Lun 15 Jan 03:25   ║\\n"
printf "  ╚══════════════════════════════════════╝\\n"
printf "\\n"
printf "%s@backup-server:~\\\$ [session fermée — simulateur SSH]\\n" "\${USER}"`,
    },
    validation: [
      { type: 'command', value: 'ssh admin@backup.edulinux.local -p 2222', description: 'Se connecter en SSH avec les bonnes informations' }
    ],
    story: "🌐 Un serveur de backup distant contient des données importantes. Tu dois t'y connecter, mais les informations de connexion sont dans un fichier. Trouve-les et connecte-toi !"
  },
];
