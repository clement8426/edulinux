import type { Level } from './_types';

export const levels101_110: Level[] = [
  {
    id: 101,
    title: "Gobuster — Directory Bruteforce",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Découvrir les répertoires cachés d'un serveur web avec gobuster",
    description: "`gobuster dir` effectue une attaque par dictionnaire sur les chemins d'un serveur web. `-u` = URL cible, `-w` = wordlist, `-x` = extensions à tester, `-t` = threads. Résultat : liste des codes HTTP 200/301/403.",
    commands: ['gobuster'],
    hints: [
      "gobuster dir -u http://target.local -w /usr/share/wordlists/dirb/common.txt",
      "Ajoute -x php,txt,html pour tester les extensions courantes",
      "gobuster dir -u http://target.local -w wordlist.txt -t 50 -o results.txt"
    ],
    fileSystem: {
      'wordlist_small.txt': `/admin
/login
/dashboard
/api
/backup
/config
/uploads
/secret
/dev
/.git
/phpinfo.php
/readme.txt`,
      'notes.txt': `Cible : http://192.168.1.100
Objectif : trouver les répertoires cachés
Technique : bruteforce de chemins avec dictionnaire`
    },
    validation: [
      { type: 'command', value: 'gobuster', description: 'Lancer gobuster sur la cible' }
    ],
    story: "🌐 Un serveur web tourne sur la cible. Les vrais répertoires ne sont pas tous dans le code source public. gobuster va frapper chaque chemin potentiel et noter les réponses."
  },
  {
    id: 102,
    title: "ffuf — Fuzzing de paramètres web",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Fuzzer les paramètres et endpoints d'une API web avec ffuf",
    description: "`ffuf` (Fuzz Faster U Fool) est un fuzzer HTTP rapide. `-u` avec `FUZZ` comme placeholder, `-w` = wordlist. Peut fuzzer URLs, paramètres GET/POST, headers. `-mc` = codes à matcher, `-fs` = filtrer par taille.",
    commands: ['ffuf'],
    hints: [
      "ffuf -u http://target.local/FUZZ -w wordlist.txt",
      "ffuf -u http://target.local/api/FUZZ -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt",
      "Filtre les faux positifs : -fs 1234 (taille de la réponse 404)"
    ],
    fileSystem: {
      'endpoints_wordlist.txt': `users
login
register
profile
admin
settings
config
backup
version
health
status
debug`,
      'ffuf_help.txt': `Exemples ffuf :
  ffuf -u URL/FUZZ -w wordlist.txt          # bruteforce dirs
  ffuf -u URL?param=FUZZ -w values.txt      # fuzzer paramètre GET
  ffuf -u URL -X POST -d 'user=FUZZ' -w w   # fuzzer POST body
  ffuf -u URL/FUZZ -mc 200,301,302,403      # filtrer codes
  ffuf -u URL/FUZZ -fs 0                    # exclure réponses vides`
    },
    validation: [
      { type: 'command', value: 'ffuf', description: 'Fuzzer les endpoints avec ffuf' }
    ],
    story: "⚡ ffuf envoie des milliers de requêtes par seconde pour trouver des endpoints cachés, des paramètres non documentés, des fichiers de config oubliés."
  },
  {
    id: 103,
    title: "Nikto — Scanner de vulnérabilités web",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Analyser un serveur web avec nikto pour trouver des failles connues",
    description: "`nikto -h target` scanne un serveur HTTP pour : fichiers dangereux, config mal faite, headers de sécurité absents, versions vulnérables. Pas discret (beaucoup de requêtes) mais très complet.",
    commands: ['nikto'],
    hints: [
      "nikto -h http://192.168.1.100",
      "nikto -h http://192.168.1.100 -p 8080 (port custom)",
      "nikto -h http://target -o rapport.txt -Format txt (sauvegarder)"
    ],
    fileSystem: {
      'nikto_sample_output.txt': `- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          192.168.1.100
+ Target Hostname:    target.local
+ Target Port:        80
---------------------------------------------------------------------------
+ Server: Apache/2.4.29 (Ubuntu)
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined.
+ The X-Content-Type-Options header is not set.
+ Retrieved x-powered-by header: PHP/7.2.24
+ Allowed HTTP Methods: GET, POST, OPTIONS, HEAD
+ OSVDB-3268: /backup/: Directory indexing found.
+ OSVDB-3092: /backup/: This might be interesting...
+ OSVDB-3233: /phpinfo.php: PHP is installed, and a test script was found.
+ 8498 requests: 0 error(s) and 7 item(s) reported`
    },
    validation: [
      { type: 'command', value: 'nikto', description: 'Lancer un scan nikto' }
    ],
    story: "🔬 nikto regarde derrière les apparences : config Apache par défaut, dossiers de backup exposés, PHP info public, headers de sécurité manquants. Chaque finding est un vecteur d'attaque potentiel."
  },
  {
    id: 104,
    title: "WhatWeb — Fingerprinting web",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Identifier les technologies d'un serveur web avec whatweb",
    description: "`whatweb` identifie les CMS, frameworks, serveurs, versions. Mode agressif `-a 3` envoie plus de requêtes pour plus de détails. Résultats : server, CMS, country, IP, plugins détectés.",
    commands: ['whatweb'],
    hints: [
      "whatweb http://target.local",
      "whatweb -a 3 http://target.local (agressif)",
      "whatweb -v http://target.local (verbeux, détails complets)"
    ],
    fileSystem: {
      'targets.txt': `http://192.168.1.100
http://192.168.1.101
http://10.0.0.50`,
      'whatweb_output_example.txt': `http://192.168.1.100 [200 OK]
  Apache[2.4.29]
  Country[RESERVED][ZZ]
  HTML5
  HTTPServer[Ubuntu Linux][Apache/2.4.29 (Ubuntu)]
  IP[192.168.1.100]
  JQuery[3.3.1]
  WordPress[5.2.4]
  PHP[7.2.24]
  Title[My Company - Home]`
    },
    validation: [
      { type: 'command', value: 'whatweb', description: 'Identifier les technologies web' }
    ],
    story: "🕵️ Avant d'attaquer un mur, tu dois savoir de quoi il est fait. WhatWeb te dit : WordPress 5.2.4 ? Apache 2.4.29 ? PHP 7.2 ? Chaque version est cherchable dans les CVE."
  },
  {
    id: 105,
    title: "Méthodes HTTP & en-têtes",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Analyser les méthodes HTTP autorisées et les en-têtes de sécurité",
    description: "`curl -I` récupère les headers. `curl -X OPTIONS` liste les méthodes. En-têtes de sécurité à vérifier : `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`. Méthodes dangereuses : `PUT`, `DELETE`, `TRACE`.",
    commands: ['curl'],
    hints: [
      "curl -I http://target.local (en-têtes seulement)",
      "curl -X OPTIONS http://target.local -i (méthodes autorisées)",
      "curl -v http://target.local 2>&1 | grep -E '< |> ' (request/response)"
    ],
    fileSystem: {
      'http_security_checklist.txt': `Headers de sécurité à vérifier :
  ✓ X-Frame-Options: DENY ou SAMEORIGIN (anti-clickjacking)
  ✓ X-Content-Type-Options: nosniff (MIME sniffing)
  ✓ Content-Security-Policy (anti-XSS)
  ✓ Strict-Transport-Security (HSTS, HTTPS only)
  ✓ X-XSS-Protection: 1; mode=block
  ✓ Referrer-Policy
  ✓ Permissions-Policy

Méthodes HTTP dangereuses :
  ✗ PUT    → upload de fichiers arbitraires
  ✗ DELETE → suppression de fichiers
  ✗ TRACE  → cross-site tracing (XST)
  ✗ CONNECT → tunneling`
    },
    validation: [
      { type: 'command', value: 'curl -I', description: 'Récupérer les headers HTTP' }
    ],
    story: "📋 Un serveur bien configuré cache ses versions, refuse les méthodes dangereuses, et envoie tous les headers de sécurité. Apprends à détecter ceux qui manquent."
  },
  {
    id: 106,
    title: "robots.txt & sitemap",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Exploiter robots.txt et sitemap.xml pour la reconnaissance",
    description: "`robots.txt` liste les chemins que les moteurs de recherche ne doivent PAS indexer — et souvent ce sont les plus intéressants. `sitemap.xml` liste toutes les URLs du site. `curl` suffit pour les lire.",
    commands: ['curl', 'grep'],
    hints: [
      "curl http://target.local/robots.txt",
      "curl http://target.local/sitemap.xml",
      "grep 'Disallow' robots.txt (chemins interdits = intéressants !)"
    ],
    fileSystem: {
      'robots_example.txt': `User-agent: *
Disallow: /admin/
Disallow: /backup/
Disallow: /config.php
Disallow: /.git/
Disallow: /wp-admin/
Disallow: /secret_panel/
Allow: /

# Sitemap: http://target.local/sitemap.xml`,
      'recon_notes.txt': `Checklist robots.txt :
1. curl http://target/robots.txt
2. Lister tous les Disallow
3. Tester chaque chemin manuellement
4. Chercher des fichiers de backup (.bak, .old, ~)
5. Vérifier /.git/ (dépôt git exposé ?)`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Lire robots.txt avec curl' }
    ],
    story: "🤖 L'ironie de robots.txt : pour cacher des pages aux robots, les admins y écrivent exactement où sont les trucs sensibles. C'est la première chose à lire sur une cible."
  },
  {
    id: 107,
    title: "DNS — Enumération et AXFR",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Enumérer les sous-domaines et tenter un transfert de zone DNS",
    description: "`dig` interroge les serveurs DNS. `dig axfr @ns1.target.com target.com` tente un transfert de zone (liste TOUS les sous-domaines si le serveur est mal configuré). `host`, `nslookup`, et `dnsenum` complètent l'arsenal.",
    commands: ['dig', 'host', 'nslookup'],
    hints: [
      "dig @ns1.target.com target.com AXFR (transfert de zone)",
      "host -t mx target.com (enregistrements mail)",
      "dig +short target.com (IP rapide)",
      "dig txt target.com (enregistrements TXT : SPF, DKIM, vérifications)"
    ],
    fileSystem: {
      'dns_enumeration.txt': `Techniques d'énumération DNS :

1. Brute-force sous-domaines :
   for sub in $(cat subdomains.txt); do
     host $sub.target.com 2>/dev/null | grep 'has address'
   done

2. Transfert de zone (AXFR) :
   dig axfr @ns1.target.com target.com

3. Enregistrements utiles :
   dig target.com A      → IPv4
   dig target.com AAAA   → IPv6
   dig target.com MX     → mail servers
   dig target.com TXT    → SPF, DKIM, vérifications
   dig target.com NS     → name servers
   dig target.com CNAME  → alias`,
      'subdomains_mini.txt': `www
mail
ftp
admin
dev
staging
api
vpn
remote
gitlab`
    },
    validation: [
      { type: 'command', value: 'dig', description: 'Interroger le DNS avec dig' }
    ],
    story: "🌍 Le DNS est l'annuaire Internet. Un transfert de zone réussi révèle toute l'infrastructure interne d'une organisation en quelques secondes."
  },
  {
    id: 108,
    title: "Analyse des métadonnées",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Extraire des métadonnées de fichiers publics avec exiftool",
    description: "`exiftool` extrait les métadonnées des fichiers (PDF, images, Office). Un PDF peut contenir : auteur, logiciel utilisé, chemin interne Windows, hostname. Ces données permettent l'OSINT et la recherche d'utilisateurs valides.",
    commands: ['exiftool', 'strings'],
    hints: [
      "exiftool document.pdf (tous les metadata)",
      "strings binary_file | grep -E '[a-z]+@[a-z]+' (emails dans binaire)",
      "exiftool *.jpg | grep -E 'GPS|Author|Creator'"
    ],
    fileSystem: {
      'fake_document_meta.txt': `ExifTool Version Number         : 12.42
File Name                       : rapport_annuel.pdf
File Size                       : 2.3 MB
File Type                       : PDF
PDF Version                     : 1.6
Creator                         : Microsoft Word 2019
Author                          : jean.dupont
Producer                        : Acrobat PDFMaker 19
Create Date                     : 2024:03:15 14:23:01+01:00
Modify Date                     : 2024:03:15 14:23:45+01:00
Company                         : ACME Corporation
Source                          : C:\\Users\\jean.dupont\\Documents\\internal\\rapport_annuel.docx`,
      'osint_notes.txt': `Données utiles dans les métadonnées :
- Noms d'utilisateurs (pour attaques auth)
- Logiciels et versions (CVE)
- Chemins internes Windows (structure AD)
- Emails (phishing, spraying)
- GPS (géolocalisation)
- Hostname (interne vs externe)`
    },
    validation: [
      { type: 'command', value: 'exiftool', description: 'Extraire les métadonnées du fichier' }
    ],
    story: "📄 Un PDF mis en ligne publiquement peut révéler le nom d'utilisateur Windows de son auteur, le chemin réseau interne, et la version du logiciel. OSINT passif, zéro contact avec la cible."
  },
  {
    id: 109,
    title: "TheHarvester — OSINT emails & domaines",
    difficulty: 'intermediate',
    category: "Web Recon",
    objective: "Collecter des emails et sous-domaines depuis les sources publiques",
    description: "`theHarvester -d domain -b source` collecte emails, noms d'hôtes, IPs depuis Google, Bing, LinkedIn, Shodan, etc. Technique OSINT passive : aucune requête directe à la cible.",
    commands: ['theHarvester'],
    hints: [
      "theHarvester -d target.com -b google",
      "theHarvester -d target.com -b all (toutes les sources)",
      "theHarvester -d target.com -b linkedin (noms d'employés)"
    ],
    fileSystem: {
      'harvester_output_example.txt': `*******************************************************************
*  _   _                                            _             *
* | |_| |__   ___  /\\  /\\__ _ _ ____   _____  ___| |_ ___ _ __  *
* | __| '_ \\ / _ \\/ /_/ / _\` | '__\\ \\ / / _ \\/ __| __/ _ \\ '__| *
*  \\__|_| |_|\\___/\\____/ (_| | |   \\ V /  __/\\__ \\ ||  __/ |    *
*                       |___/|_|    \\_/ \\___||___/\\__\\___|_|    *
*                                                                  *
* theHarvester 4.0                                                 *
*******************************************************************

[*] Target: target.com

[*] Searching Google...

Emails found:
--------------
john.smith@target.com
admin@target.com
j.dupont@target.com
hr@target.com

Hosts found:
--------------
mail.target.com: 185.60.X.X
vpn.target.com: 185.60.X.X
dev.target.com: 10.0.X.X (internal !)
gitlab.target.com: 185.60.X.X`,
      'osint_checklist.txt': `OSINT sans contact direct :
1. theHarvester (emails, sous-domaines)
2. LinkedIn (employés, postes, stack technique)
3. GitHub (code source leaké, tokens)
4. Shodan (services exposés, bannières)
5. Google Dorks : site:target.com filetype:pdf`
    },
    validation: [
      { type: 'command', value: 'theHarvester', description: 'Collecter des informations OSINT' }
    ],
    story: "🕸️ Avant de toucher la cible, collecte tout ce qui est public. Emails pour le spraying, sous-domaines pour étendre la surface d'attaque, employés LinkedIn pour le phishing ciblé."
  },
  {
    id: 110,
    title: "Shodan — Intelligence sur les services exposés",
    difficulty: 'advanced',
    category: "Web Recon",
    objective: "Utiliser Shodan CLI pour trouver des services exposés",
    description: "`shodan` CLI permet de chercher des hôtes depuis la base de données Shodan. `shodan host IP` donne les ports, services, CVE d'une IP. `shodan search 'apache 2.4.29 country:FR'` cherche des cibles spécifiques.",
    commands: ['shodan'],
    hints: [
      "shodan host 192.168.1.100 (infos sur une IP)",
      "shodan search 'product:Apache httpd 2.4.29'",
      "shodan stats --facets country 'port:22 openssh'"
    ],
    fileSystem: {
      'shodan_demo_output.txt': `IP: 185.60.XX.XX
Organization: OVH SAS
OS: None detected
Ports: 22, 80, 443, 8080

Port 22:
  SSH-2.0-OpenSSH_7.4
  Key type: ssh-rsa

Port 80:
  HTTP/1.1 200 OK
  Server: Apache/2.4.29 (Ubuntu)
  X-Powered-By: PHP/7.2.24

Vulnerabilities:
  CVE-2019-0211 (Apache)
  CVE-2019-11043 (PHP)`,
      'shodan_queries.txt': `Queries Shodan utiles :
  product:nginx country:FR port:8080
  org:"OVH SAS" port:3389 (RDP exposé)
  "default password" country:DE
  apache struts CVE-2017-5638
  port:27017 -auth (MongoDB sans auth)
  http.title:"Dashboard" country:FR`
    },
    validation: [
      { type: 'command', value: 'shodan', description: 'Rechercher sur Shodan' }
    ],
    story: "🌐 Shodan est le moteur de recherche des appareils connectés. Serveurs, caméras, imprimantes, SCADA industriels — tout ce qui répond sur Internet est indexé. Connais ta surface d'exposition avant l'attaquant."
  }
];
