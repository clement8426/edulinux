import type { Level } from './_types';

export const levels31_40: Level[] = [
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
];
