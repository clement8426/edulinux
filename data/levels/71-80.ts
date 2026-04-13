import type { Level } from './_types';

export const levels71_80: Level[] = [
  // levels 71-80 (originally 61-70, renumbered)
  {
    id: 71,
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
    id: 72,
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
    id: 73,
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
    id: 74,
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
    id: 75,
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
    id: 76,
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
    id: 77,
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
    id: 78,
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
    id: 79,
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
    id: 80,
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
];
