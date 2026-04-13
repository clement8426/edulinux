import type { Level } from './_types';

export const levels91_100: Level[] = [
  // levels 91-100 verbatim
  {
    id: 91,
    title: "CTF — Stéganographie & encodages",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Décoder des données cachées dans différents formats",
    description: "Les CTF utilisent souvent plusieurs encodages imbriqués. `xxd` affiche un dump hexadécimal. `base64 -d` décode du base64. `python3 -c` pour des décodages custom. Cherche les patterns : `==` (fin de base64), `0x` (hex).",
    commands: ['xxd', 'base64', 'python3', 'strings', 'cat'],
    hints: [
      "`xxd fichier.bin | head` — voir les premiers octets en hex.",
      "`base64 -d encoded.txt` — décoder si c'est du base64.",
      "`python3 -c \"print(bytes.fromhex('48656c6c6f'))\"` — hex vers ASCII."
    ],
    fileSystem: {
      'encoded_flag.txt': 'RkxBR3tiNHMzNjRfM3N0X2wxbl9zMWduM19kM3NfdGVjaG5pcXVlc19DVEYhfQ==',
      'hex_data.bin': '464c41477b6865785f74305f4153434949217d',
      'README.txt': `Challenge : trouver le flag caché dans ces fichiers.

encoded_flag.txt : semble encodé en base64
hex_data.bin     : données en hexadécimal

Indices :
- base64 decode → observe la sortie
- hex → ASCII : chaque paire = 1 caractère
- Format du flag : FLAG{...}`,
      'hint.py': `# Aide pour le décodage
# base64 : base64 -d encoded_flag.txt
# hex : python3 -c "print(bytes.fromhex(open('hex_data.bin').read().strip()).decode())"
`
    },
    validation: [
      { type: 'command', value: 'base64 -d', description: 'Décoder le fichier base64' },
      { type: 'command', value: 'xxd', description: 'Inspecter les données hex' }
    ],
    story: "🏴 Premier CTF ! Les flags sont cachés dans des encodages multiples. Commence par identifier le type d'encodage avant de décoder."
  },
  {
    id: 92,
    title: "CTF — Chiffrement César & ROT13",
    difficulty: 'intermediate',
    category: "CTF",
    objective: "Déchiffrer des messages ROT13 et César avec les outils bash",
    description: "ROT13 décale chaque lettre de 13 positions. `tr 'A-Za-z' 'N-ZA-Mn-za-m'` décode ROT13 en bash. Le chiffre de César utilise un décalage variable (1-25). `python3` permet de tester tous les décalages.",
    commands: ['tr', 'python3', 'echo', 'cat'],
    hints: [
      "`echo 'Guvf vf n grfg' | tr 'A-Za-z' 'N-ZA-Mn-za-m'` — décode ROT13.",
      "Pour César : teste tous les décalages avec python3 ou un script bash.",
      "Pattern du flag connu → cherche `FLAG{` dans les sorties décodées."
    ],
    fileSystem: {
      'message_rot13.txt': 'SYNTfpevcrq_pvcure_vf_abg_rapelcgvba}',
      'message_cesar.txt': 'IODJ_ohv_fkliiuhv_fodvvltxhv_vrqw_srxu_ohv_qxov}',
      'cesar_decoder.py': `#!/usr/bin/env python3
# Décodeur César — teste tous les décalages

message = open('message_cesar.txt').read().strip()

for shift in range(26):
    decoded = ''
    for c in message:
        if c.isalpha():
            base = ord('A') if c.isupper() else ord('a')
            decoded += chr((ord(c) - base - shift) % 26 + base)
        else:
            decoded += c
    print(f"Décalage {shift:2d}: {decoded}")
    if 'FLAG' in decoded:
        print(f"          ^^^ TROUVÉ ! Décalage = {shift}")
`
    },
    validation: [
      { type: 'command', value: 'tr', description: 'Décoder le message ROT13' },
      { type: 'command', value: 'python3 cesar_decoder.py', description: 'Brute-forcer le chiffre de César' }
    ],
    story: "🔐 La cryptographie classique, ça se casse vite. ROT13 en bash, César en Python — quelques secondes."
  },
  {
    id: 93,
    title: "CTF — Analyse de logs web",
    difficulty: 'intermediate',
    category: "CTF",
    objective: "Retrouver une attaque dans des logs Apache via des commandes bash",
    description: "Les logs Apache contiennent : IP, méthode HTTP, chemin, code réponse, taille. Analyse : identifier les IPs malveillantes, les chemins suspects (`/admin`, `/../`, `?cmd=`), les scans automatisés (user-agent Nikto/sqlmap).",
    commands: ['grep', 'awk', 'sort', 'uniq', 'cut', 'wc'],
    hints: [
      "`awk '{print $1}' access.log | sort | uniq -c | sort -rn | head` — top IPs.",
      "`grep -E '\\?.*cmd=|exec=|system=' access.log` — détection d'injection.",
      "`grep '404' access.log | awk '{print $7}' | sort | uniq -c | sort -rn` — chemins introuvables les plus scannés."
    ],
    fileSystem: {
      'access.log': `192.168.1.10 - - [15/Jan/2024:09:00:01] "GET /index.php HTTP/1.1" 200 4521 "Mozilla/5.0"
192.168.1.10 - - [15/Jan/2024:09:00:05] "GET /about.html HTTP/1.1" 200 1234 "Mozilla/5.0"
185.220.101.5 - - [15/Jan/2024:09:01:00] "GET /admin HTTP/1.1" 404 289 "Nikto/2.1.6"
185.220.101.5 - - [15/Jan/2024:09:01:01] "GET /admin/ HTTP/1.1" 403 289 "Nikto/2.1.6"
185.220.101.5 - - [15/Jan/2024:09:01:02] "GET /wp-admin HTTP/1.1" 404 289 "Nikto/2.1.6"
185.220.101.5 - - [15/Jan/2024:09:01:03] "GET /phpmyadmin HTTP/1.1" 404 289 "Nikto/2.1.6"
185.220.101.5 - - [15/Jan/2024:09:01:10] "GET /index.php?page=../../../etc/passwd HTTP/1.1" 200 2048 "curl/7.68"
185.220.101.5 - - [15/Jan/2024:09:01:15] "GET /index.php?cmd=id HTTP/1.1" 200 42 "curl/7.68"
185.220.101.5 - - [15/Jan/2024:09:01:20] "GET /index.php?cmd=cat+/etc/shadow HTTP/1.1" 200 1024 "curl/7.68"
192.168.1.20 - - [15/Jan/2024:09:05:00] "POST /contact HTTP/1.1" 200 512 "Mozilla/5.0"
10.0.0.5 - - [15/Jan/2024:09:10:00] "GET /api/users HTTP/1.1" 200 8921 "Python/3.8"`,
      'challenge_questions.txt': `Questions du CTF :
1. Quelle IP a effectué l'attaque ? → grep/awk
2. Combien de requêtes en 404 de l'attaquant ?
3. Quel outil de scan a été utilisé ? (User-Agent)
4. Quel fichier sensible a été accédé via path traversal ?
5. Quel code de commande a été injecté ?`
    },
    validation: [
      { type: 'command', value: 'grep', description: 'Filtrer les requêtes suspectes dans les logs' },
      { type: 'command', value: 'awk', description: 'Analyser les patterns d\'attaque' },
      { type: 'command', value: 'sort', description: 'Trier et compter les occurrences' }
    ],
    story: "🕵️ Un site a été attaqué. Les logs ne mentent pas. Remonte l'attaque pas à pas avec les commandes bash."
  },
  {
    id: 94,
    title: "CTF — Variables d'environnement et injection",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Comprendre et exploiter les injections via variables d'environnement",
    description: "Les variables d'environnement mal utilisées peuvent être dangereuses. `$()` ou backticks permettent l'injection de commandes si une variable n'est pas correctement échappée. `env` expose les variables accessibles à un processus.",
    commands: ['env', 'printenv', 'export', 'cat', 'bash'],
    hints: [
      "`env | grep -i 'pass\\|secret\\|key\\|token'` — chercher des secrets dans l'environnement.",
      "`printenv HOME` — valeur d'une variable spécifique.",
      "Un processus hérite de l'environnement de son parent — les secrets dans les variables sont visibles via /proc/PID/environ."
    ],
    fileSystem: {
      'vulnerable_app.sh': `#!/bin/bash
# Application vulnérable à l'injection via variable

# ATTENTION : ne JAMAIS faire ça en production !
USER_INPUT="$1"

# Mauvais pattern : variable non quotée dans eval
echo "Bienvenue $(echo $USER_INPUT)"

# Pattern sûr : toujours quoter les variables
# echo "Bienvenue \${USER_INPUT}"
`,
      'env_investigation.txt': `Secrets fréquemment exposés via variables d'environnement :
  DATABASE_URL=postgres://user:password@host/db
  AWS_SECRET_ACCESS_KEY=xxxxx
  JWT_SECRET=monsecret
  REDIS_PASSWORD=pass

Comment les trouver (si accès au système) :
  cat /proc/PID/environ | tr '\\0' '\\n'
  strings /proc/PID/environ
  env (dans le contexte du processus)

Bonne pratique : utiliser des gestionnaires de secrets
  (Vault, AWS Secrets Manager, etc.)`,
      'flag_in_env.sh': `#!/bin/bash
# Ce script cache un flag dans son environnement
export CTF_FLAG="FLAG{3nv_v4r5_4r3_n0t_s3cr3t}"
export DB_PASS="weak_password"
# Lance une sous-tâche...
bash -c 'env | grep CTF'`
    },
    validation: [
      { type: 'command', value: 'env', description: 'Lister les variables d\'environnement' },
      { type: 'command', value: 'bash flag_in_env.sh', description: 'Récupérer le flag via les variables d\'env' }
    ],
    story: "🌍 Un processus en production a des variables d'environnement suspectes. Si tu as accès au système, les secrets sont peut-être à portée."
  },
  {
    id: 95,
    title: "CTF — Path traversal et lecture de fichiers",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Comprendre la vulnérabilité path traversal et l'identifier dans des logs",
    description: "Le **path traversal** (`../../../etc/passwd`) exploite une mauvaise validation de chemin. `cat` et `find` permettent de lire et naviguer dans le système. Identifier : chemins avec `../`, encodage URL `%2e%2e`, null bytes.",
    commands: ['find', 'cat', 'grep', 'ls'],
    hints: [
      "`find / -name '*.conf' -readable 2>/dev/null` — fichiers de config lisibles.",
      "`cat /proc/self/environ` — variables d'environnement du processus courant.",
      "`grep -r 'FLAG{' /home/ /tmp/ /var/www/ 2>/dev/null` — chercher le flag."
    ],
    fileSystem: {
      'web_root': {
        'index.php': '<?php echo "Bienvenue"; ?>',
        'config.php': '<?php $db_pass = "FLAG{p4th_tr4v3rs4l_1s_d4ng3r0us}"; ?>',
        'uploads': {
          'photo.jpg': '[IMAGE]'
        }
      },
      'traversal_patterns.txt': `Patterns de path traversal à détecter (dans les logs) :
  ../../../etc/passwd
  ....//....//etc/passwd  (double encodage)
  %2e%2e%2f%2e%2e%2f     (URL encoding)
  ..%c0%af..%c0%af        (overlong UTF-8)
  /var/www/html/../../etc/passwd

Fichiers cibles courants :
  /etc/passwd        : liste des utilisateurs
  /etc/shadow        : hashes des mots de passe
  ~/.ssh/id_rsa      : clé privée SSH
  /proc/self/environ : variables d'env du processus web`
    },
    validation: [
      { type: 'command', value: 'cat web_root/config.php', description: 'Lire le fichier config.php' },
      { type: 'command', value: 'find web_root', description: 'Explorer l\'arborescence web' }
    ],
    story: "🗂️ L'application web inclut des fichiers sans valider le chemin. Explore l'arborescence pour trouver le flag."
  },
  {
    id: 96,
    title: "CTF — Forensic mémoire et /proc",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Extraire des informations depuis le pseudo-filesystem /proc",
    description: "`/proc` expose l'état du système en temps réel. `/proc/self` = le processus courant. `/proc/PID/maps` = carte mémoire. `/proc/PID/cmdline` = commande lancée. `/proc/PID/fd/` = descripteurs de fichiers ouverts.",
    commands: ['cat', 'ls', 'find', 'grep', 'strings'],
    hints: [
      "`ls /proc/` — liste les PIDs actifs + infos système.",
      "`cat /proc/self/cmdline | tr '\\0' ' '` — commande du processus courant.",
      "`find /proc -name 'cmdline' -readable 2>/dev/null | head -5` — commandes de tous les processus."
    ],
    fileSystem: {
      'proc_cheatsheet.txt': `/proc — référence rapide :

  /proc/version       : kernel + compilateur
  /proc/cpuinfo       : infos CPU
  /proc/meminfo       : infos RAM
  /proc/net/tcp       : connexions TCP (format hex)
  /proc/PID/cmdline   : commande du processus
  /proc/PID/environ   : variables d'environnement
  /proc/PID/maps      : carte mémoire
  /proc/PID/fd/       : fichiers ouverts (liens symboliques)
  /proc/PID/net/      : état réseau du namespace

Astuce forensic : même si un fichier est "supprimé",
il reste accessible via /proc/PID/fd/N tant que le
processus l'a ouvert.`,
      'deleted_secret.txt': 'FLAG{/pr0c_1s_4_g0ldm1n3_f0r_f0r3ns1c}'
    },
    validation: [
      { type: 'command', value: 'cat /proc', description: 'Explorer le pseudo-filesystem /proc' },
      { type: 'command', value: 'cat proc_cheatsheet.txt', description: 'Lire la référence /proc' }
    ],
    story: "🧠 Le système Linux expose son état via /proc. Un forensicien y lit les commandes en cours, les connexions, et même des fichiers supprimés."
  },
  {
    id: 97,
    title: "CTF — Analyse binaire avec xxd et strings",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Extraire des données d'un fichier binaire inconnu",
    description: "`file` identifie le type d'un fichier (magic bytes). `xxd fichier | head` montre les premiers octets. `strings -n 8 fichier` extrait les chaînes de min 8 caractères. Le flag est souvent caché dans un binaire.",
    commands: ['file', 'xxd', 'strings', 'grep'],
    hints: [
      "`file unknown.bin` — identifie le vrai type du fichier (pas juste l'extension).",
      "`strings unknown.bin | grep 'FLAG'` — cherche directement le flag.",
      "`xxd unknown.bin | grep -A2 '4647'` — cherche 'FG' en hex (début de FLAG)."
    ],
    fileSystem: {
      'unknown.bin': `\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00
FLAG{str1ngs_r3v34l5_s3cr3ts}
config: debug=true
secret_key: hunter2
database: postgres://admin:admin@localhost/prod`,
      'fake_image.jpg': 'Not actually a JPEG - just renamed!',
      'analysis_notes.txt': `Analyser un fichier inconnu - méthodologie :
1. file unknown.bin        : type réel (ELF ? PDF ? Archive ?)
2. xxd unknown.bin | head  : magic bytes (premiers octets)
3. strings unknown.bin     : chaînes lisibles
4. grep FLAG strings.txt   : cherche le flag
5. binwalk unknown.bin     : fichiers cachés dans le binaire

Magic bytes courants :
  7f 45 4c 46 → ELF (Linux executable)
  ff d8 ff    → JPEG image
  50 4b 03 04 → ZIP archive
  25 50 44 46 → PDF`
    },
    validation: [
      { type: 'command', value: 'strings unknown.bin', description: 'Extraire les chaînes du binaire' },
      { type: 'command', value: 'xxd', description: 'Inspecter le contenu hexadécimal' }
    ],
    story: "🔬 Un fichier `unknown.bin` a été trouvé sur le serveur compromis. Pas d'extension fiable. Analyse-le pour en extraire des informations."
  },
  {
    id: 98,
    title: "CTF — Cryptographie : hash cracking",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Identifier et craquer des hashes avec les outils bash",
    description: "`sha256sum`, `md5sum`, `openssl dgst` génèrent des hashes. Pour identifier un hash : longueur + caractères (MD5=32 hex, SHA1=40, SHA256=64). Craquage par dictionnaire : `for word in $(cat wordlist.txt); do echo -n $word | sha256sum; done`.",
    commands: ['sha256sum', 'md5sum', 'openssl', 'echo', 'grep'],
    hints: [
      "`echo -n 'password' | md5sum` — hash MD5 du mot 'password'.",
      "`for w in $(cat wordlist.txt); do [ $(echo -n $w | sha256sum | cut -d' ' -f1) = '$HASH' ] && echo FOUND: $w; done`",
      "Longueur : MD5=32, SHA1=40, SHA256=64, SHA512=128 caractères hexadécimaux."
    ],
    fileSystem: {
      'hashes_to_crack.txt': `# Hashes récupérés depuis /etc/shadow (simulation)
admin:5f4dcc3b5aa765d61d8327deb882cf99  (MD5)
user1:aec070645fe53ee3b3763059376134f058cc337869c006edc3ae1e5f77af534d  (SHA256 ?)
flag_user:1a1dc91c907325c69271ddf0c944bc72  (MD5)`,
      'wordlist.txt': `password
password123
admin
root
letmein
qwerty
monkey
dragon
master
sunshine
princess
hello
flag
edulinux
linux
hacking`,
      'hash_identifier.py': `#!/usr/bin/env python3
# Identifier le type de hash

def identify_hash(h):
    length = len(h)
    if length == 32: return "MD5 probablement"
    if length == 40: return "SHA1 probablement"
    if length == 64: return "SHA256 probablement"
    if length == 128: return "SHA512 probablement"
    return "Inconnu"

hashes = open('hashes_to_crack.txt').readlines()
for line in hashes:
    if ':' in line and not line.startswith('#'):
        user, h = line.strip().split(':')
        print(f"{user}: {identify_hash(h)} ({len(h)} chars)")`
    },
    validation: [
      { type: 'command', value: 'echo -n', description: 'Générer un hash MD5 ou SHA256' },
      { type: 'command', value: 'md5sum', description: 'Vérifier un hash MD5' }
    ],
    story: "🔑 Des hashes ont été récupérés depuis le système compromis. Identifie leur type et tente un craquage par dictionnaire."
  },
  {
    id: 99,
    title: "CTF — Docker et isolation",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Comprendre l'isolation Docker et les vecteurs d'évasion",
    description: "Docker isole les processus via des namespaces Linux. Vecteurs d'évasion : **privileged mode** (`--privileged`), **montage de /host**, **socket Docker** accessible, **capabilities** dangereuses. `cat /proc/1/cgroup` révèle si on est dans un container.",
    commands: ['cat', 'find', 'ls', 'env'],
    hints: [
      "`cat /proc/1/cgroup` — lignes avec 'docker' = on est dans un container.",
      "`find / -name 'docker.sock' 2>/dev/null` — socket Docker accessible = évasion possible.",
      "`cat /.dockerenv` — fichier présent = on est dans un container Docker."
    ],
    fileSystem: {
      '.dockerenv': '',
      'container_check.sh': `#!/bin/bash
# Détection d'environnement container

echo "=== Détection container ==="

# Test 1 : fichier .dockerenv
if [ -f /.dockerenv ]; then
    echo "✓ .dockerenv trouvé → Docker container"
fi

# Test 2 : cgroups
if grep -q docker /proc/1/cgroup 2>/dev/null; then
    echo "✓ cgroup docker → container confirmé"
fi

# Test 3 : hostname (souvent un hash dans Docker)
echo "Hostname: $(hostname)"

# Test 4 : socket Docker accessible
if [ -S /var/run/docker.sock ]; then
    echo "⚠ Socket Docker accessible → ÉVASION POSSIBLE"
fi
`,
      'docker_escape.txt': `Techniques d'évasion Docker (éducatif — lab uniquement) :

1. Privileged mode + /dev/sda
   docker run --privileged → monter le disque hôte
   mount /dev/sda1 /mnt && chroot /mnt

2. Socket Docker exposé
   curl --unix-socket /var/run/docker.sock http://v1.41/containers/json
   → créer un container privlegied avec montage /host

3. Montage de répertoire hôte sensible
   docker run -v /:/host → accès à tout le système hôte

4. SYS_ADMIN capability
   Permet de monter des filesystems et modifier les namespaces

Mitigation :
  - Ne jamais monter /var/run/docker.sock en prod
  - User namespace mapping
  - Seccomp profiles
  - AppArmor/SELinux`
    },
    validation: [
      { type: 'command', value: 'cat /.dockerenv', description: 'Détecter l\'environnement Docker' },
      { type: 'command', value: 'bash container_check.sh', description: 'Exécuter le script de détection container' }
    ],
    story: "🐳 Tu te retrouves dans un shell. Où es-tu exactement ? Machine physique ? VM ? Container Docker ? Ça change tout pour la suite."
  },
  {
    id: 100,
    title: "CTF FINAL — Machine complète",
    difficulty: 'advanced',
    category: "CTF",
    objective: "Chaîne complète : recon → foothold web → privesc → root → 3 flags",
    description: "La machine finale. Trois flags à capturer. **Flag 1** : dans les headers HTTP ou un fichier web exposé. **Flag 2** : après accès SSH avec les credentials trouvés. **Flag 3** : après élévation de privilèges vers root. Chaque flag vaut des points.",
    commands: ['nmap', 'curl', 'cat', 'find', 'sudo', 'grep', 'ssh'],
    hints: [
      "Flag 1 : inspecte les headers HTTP (`curl -I`) et le code source. Cherche dans `/robots.txt` et `/.git`.",
      "Flag 2 : les credentials sont peut-être dans un fichier de config ou dans l'historique bash.",
      "Flag 3 : `sudo -l` en premier. Sinon `find / -perm -4000`. GTFOBins pour l'exploitation."
    ],
    fileSystem: {
      'web_root': {
        'index.html': `<!DOCTYPE html>
<html>
<head><title>MegaCorp Internal Portal</title></head>
<!-- FLAG{w3b_s0urc3_1nsp3ct10n_101} -->
<body><h1>Welcome</h1></body>
</html>`,
        'robots.txt': `User-agent: *
Disallow: /admin/
Disallow: /backup/
Disallow: /.git/
# FLAG{r0b0ts_txt_1s_n0t_4_s3cr3t}`,
        'backup': {
          'db_config.php.bak': `<?php
$db_host = "localhost";
$db_name = "megacorp_prod";
$db_user = "admin";
$db_pass = "MegaC0rp2024!";
// SSH creds: student / MegaC0rp2024! (same password reuse)
?>`,
        },
        '.git': {
          'config': '[core]\n\trepositoryformatversion = 0'
        }
      },
      'home': {
        'student': {
          '.bash_history': `ls -la
cat /etc/passwd
sudo -l
sudo find . -exec /bin/bash \\; -quit
cat /root/flag3.txt`,
          'notes.txt': 'Remember: same password for SSH and DB. TODO: change this!'
        }
      },
      'root': {
        'flag3.txt': 'FLAG{r00t_0wn3d_pr1v3sc_v14_sud0_f1nd}'
      }
    },
    validation: [
      { type: 'command', value: 'cat web_root/robots.txt', description: 'Flag 1 — robots.txt' },
      { type: 'command', value: 'cat web_root/backup/db_config.php.bak', description: 'Flag 2 — credentials en backup' },
      { type: 'command', value: 'cat root/flag3.txt', description: 'Flag 3 — root compromise' }
    ],
    story: "🏆 MACHINE FINALE — 100 niveaux parcourus. Recon, foothold, post-exploitation, privesc. Tu as tout appris. Maintenant prouve-le. Trois flags. Bonne chance, hacker."
  }
];
