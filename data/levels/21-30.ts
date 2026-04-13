import type { Level } from './_types';

export const levels21_30: Level[] = [
  // levels 21-30 (originally 81-90 "Bash Avancé", renumbered)
  {
    id: 21,
    title: "Boucles — for et while",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Utiliser les boucles for et while dans un script bash",
    description: "`for item in liste; do ... done` itère sur une liste. `while condition; do ... done` boucle tant que la condition est vraie. `for i in $(seq 1 10)` génère une séquence de nombres.",
    commands: ['for', 'while', 'seq', 'echo'],
    hints: [
      "`for f in *.log; do echo \"Fichier : $f\"; done` — itère sur des fichiers.",
      "`while read line; do echo \"$line\"; done < fichier.txt` — lit un fichier ligne par ligne.",
      "`for i in $(seq 1 5); do echo \"Itération $i\"; done`"
    ],
    fileSystem: {
      'logs': {
        'app.log': 'ERROR: connexion refusée\nINFO: démarrage ok\nERROR: timeout\nINFO: requête traitée'
      },
      'names.txt': `alice
bob
charlie
diana
eve`
    },
    validation: [
      { type: 'command', value: 'for', description: 'Écrire une boucle for' },
      { type: 'command', value: 'while', description: 'Écrire une boucle while' }
    ],
    story: "🔁 Automatise une tâche répétitive. Les boucles bash te feront gagner des heures sur des fichiers en masse."
  },
  {
    id: 22,
    title: "Fonctions bash",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Définir et appeler des fonctions dans un script bash",
    description: "Une fonction bash : `nom_fonction() { commandes; }`. Appelée par son nom. Paramètres accessibles via `$1`, `$2`... `$@` = tous les paramètres. `return N` retourne un code de sortie.",
    commands: ['echo', 'cat', 'chmod'],
    hints: [
      "Définition : `greet() { echo \"Bonjour $1\"; }`",
      "Appel : `greet Alice` → affiche \"Bonjour Alice\"",
      "`$?` = code de retour de la dernière commande (0 = succès, ≠0 = erreur)"
    ],
    fileSystem: {
      'functions_template.sh': `#!/bin/bash

# Exemple de fonctions bash

# Fonction avec paramètres
log_message() {
    local level="$1"
    local msg="$2"
    echo "[$(date +%H:%M:%S)] [$level] $msg"
}

# Fonction avec valeur de retour
is_root() {
    [ "$(id -u)" -eq 0 ]
    return $?
}

# Utilisation
log_message "INFO" "Script démarré"
log_message "ERROR" "Quelque chose a échoué"
`,
    },
    validation: [
      { type: 'command', value: 'cat functions_template.sh', description: 'Lire le template de fonctions' },
      { type: 'command', value: 'chmod +x', description: 'Rendre le script exécutable' }
    ],
    story: "🧩 Un bon script bash est modulaire. Les fonctions évitent la duplication et rendent le code maintenable."
  },
  {
    id: 23,
    title: "Conditions — if / elif / case",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Utiliser les structures conditionnelles bash",
    description: "`if [ condition ]; then ... elif ...; else ...; fi`. Tests courants : `-f fichier` (existe et est un fichier), `-d dir` (est un répertoire), `-z string` (chaîne vide), `-eq` (égalité numérique). `case` pour des alternatives multiples.",
    commands: ['if', 'test', 'echo', 'cat'],
    hints: [
      "`if [ -f /etc/passwd ]; then echo 'Existe'; fi`",
      "`if [ $VAR -gt 10 ]; then echo 'Plus grand que 10'; fi`",
      "`case $1 in start) echo start;; stop) echo stop;; *) echo inconnu;; esac`"
    ],
    fileSystem: {
      'check_system.sh': `#!/bin/bash
# Vérifications système avec conditions

TARGET_FILE="/etc/hosts"
THRESHOLD=90

# Test existence de fichier
if [ -f "$TARGET_FILE" ]; then
    echo "✓ $TARGET_FILE existe"
else
    echo "✗ $TARGET_FILE introuvable"
fi

# Test numérique
DISK_USAGE=$(df / | awk 'NR==2{print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt "$THRESHOLD" ]; then
    echo "Disque presque plein : \${DISK_USAGE}%"
elif [ "$DISK_USAGE" -gt 70 ]; then
    echo "Disque a surveiller : \${DISK_USAGE}%"
else
    echo "Disque ok : \${DISK_USAGE}%"
fi
`,
    },
    validation: [
      { type: 'command', value: 'cat check_system.sh', description: 'Lire le script de conditions' },
      { type: 'command', value: 'bash check_system.sh', description: 'Exécuter le script de vérification' }
    ],
    story: "🤔 Un script robuste prend des décisions. Sans conditions, un script crash au premier obstacle."
  },
  {
    id: 24,
    title: "Parsing d'arguments — getopts",
    difficulty: 'advanced',
    category: "Bash Avancé",
    objective: "Parser les arguments CLI avec getopts",
    description: "`getopts 'opts' var` parse les options court format (`-v`, `-f fichier`). `$OPTARG` contient la valeur de l'option. `$OPTIND` = index du prochain argument. Standard POSIX, inclus dans bash.",
    commands: ['getopts', 'bash', 'cat', 'chmod'],
    hints: [
      "`while getopts 'vf:h' opt; do case $opt in ...`",
      "`f:` signifie que `-f` attend un argument. `v` (sans `:`) est un flag booléen.",
      "Teste : `./script.sh -v -f monFichier.txt`"
    ],
    fileSystem: {
      'cli_tool.sh': `#!/bin/bash
# Outil CLI avec getopts

VERBOSE=false
FILE=""
OUTPUT="output.txt"

usage() {
    echo "Usage: $0 [-v] [-f fichier] [-o output]"
    echo "  -v : mode verbeux"
    echo "  -f : fichier d'entrée"
    echo "  -o : fichier de sortie (défaut: output.txt)"
    exit 1
}

while getopts 'vf:o:h' opt; do
    case $opt in
        v) VERBOSE=true ;;
        f) FILE="$OPTARG" ;;
        o) OUTPUT="$OPTARG" ;;
        h|?) usage ;;
    esac
done

if [ -z "$FILE" ]; then
    echo "Erreur : fichier d'entrée requis (-f)"
    usage
fi

$VERBOSE && echo "Mode verbeux activé"
echo "Fichier : $FILE → $OUTPUT"
`
    },
    validation: [
      { type: 'command', value: 'cat cli_tool.sh', description: 'Lire le script avec getopts' },
      { type: 'command', value: 'bash cli_tool.sh', description: 'Tester le script CLI' }
    ],
    story: "⚙️ Les outils professionnels acceptent des arguments. `getopts` est la méthode standard POSIX pour les scripts portables."
  },
  {
    id: 25,
    title: "Arrays et manipulation de données",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Utiliser les tableaux bash et les opérations sur strings",
    description: "Bash supporte les tableaux indexés (`arr=(a b c)`) et associatifs (`declare -A map`). Manipulation de strings : `${#var}` (longueur), `${var:0:5}` (substring), `${var/ancien/nouveau}` (remplacement).",
    commands: ['echo', 'declare', 'bash', 'cat'],
    hints: [
      "`arr=(foo bar baz); echo ${arr[1]}` → 'bar'",
      "`echo ${#arr[@]}` → nombre d'éléments",
      "`for item in ${arr[@]}; do echo $item; done` — itérer sur un array"
    ],
    fileSystem: {
      'arrays_demo.sh': `#!/bin/bash
# Démonstration des arrays bash

# Array indexé
SERVERS=("web01" "web02" "db01" "cache01")
echo "Nb serveurs : \${#SERVERS[@]}"
echo "Premier : \${SERVERS[0]}"
echo "Dernier : \${SERVERS[-1]}"

for server in "\${SERVERS[@]}"; do
    echo "Ping $server..."
done

# Array associatif
declare -A PORTS
PORTS["ssh"]=22
PORTS["http"]=80
PORTS["https"]=443

for service in "\${!PORTS[@]}"; do
    echo "$service -> port \${PORTS[$service]}"
done

# Manipulation de strings
URL="https://api.example.com/v2/users"
echo "Longueur : \${#URL}"
echo "Domaine  : \${URL#*//}"
echo "Protocole: \${URL%%://*}"
`
    },
    validation: [
      { type: 'command', value: 'cat arrays_demo.sh', description: 'Lire la démo des arrays' },
      { type: 'command', value: 'bash arrays_demo.sh', description: 'Exécuter la démo' }
    ],
    story: "📦 Les arrays bash permettent de gérer des listes de serveurs, d'IPs, de fichiers. Indispensable en administration système."
  },
  {
    id: 26,
    title: "Expressions régulières avec grep et sed",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Maîtriser les regex avec grep -E et sed",
    description: "`grep -E 'regex'` utilise les regex étendues. Quantificateurs : `+` (1+), `*` (0+), `?` (0 ou 1), `{n,m}` (n à m). Groupes : `(abc)`. `sed 's/pattern/replacement/g'` pour substitution.",
    commands: ['grep', 'sed', 'cat'],
    hints: [
      "`grep -E '^[0-9]{1,3}(\\.[0-9]{1,3}){3}$' ips.txt` — valider des IPs",
      "`grep -E '(ERROR|WARN|CRIT)' logs.txt` — filtrer plusieurs niveaux",
      "`sed 's/password=[^ ]*/password=REDACTED/g'` — masquer les mots de passe"
    ],
    fileSystem: {
      'mixed_data.txt': `admin@company.com
not-an-email
user@example.org
invalid@@domain
dev@subdomain.company.io
192.168.1.1
10.0.0.256
172.16.0.1
not-an-ip
ERROR: connexion refusée à 14:23:01
INFO: ping ok
WARN: CPU > 90%
CRITICAL: disque plein
DEBUG: requête traitée`,
      'logs_with_secrets.txt': `2024-01-15 login user=admin password=SecretPass123 ip=192.168.1.10
2024-01-15 query db=prod token=eyJhbGci... status=ok
2024-01-15 error user=root password=TotoRoot! msg=access denied`
    },
    validation: [
      { type: 'command', value: 'grep -E', description: 'Utiliser grep avec regex étendue' },
      { type: 'command', value: 'sed', description: 'Substitution avec sed' }
    ],
    story: "🔍 Les regex sont l'arme secrète de l'analyste. Filtrer 10 millions de lignes de logs en 2 secondes ? Regex + grep."
  },
  {
    id: 27,
    title: "Trap et gestion des signaux",
    difficulty: 'advanced',
    category: "Bash Avancé",
    objective: "Intercepter les signaux système avec trap",
    description: "`trap 'commande' SIGNAL` intercepte un signal et exécute une action. Signaux courants : `INT` (Ctrl+C), `TERM` (kill), `EXIT` (fin du script), `ERR` (erreur). Utilisé pour le nettoyage de ressources.",
    commands: ['trap', 'kill', 'bash', 'cat'],
    hints: [
      "`trap 'echo Nettoyage...; rm -f /tmp/monfichier' EXIT` — nettoyage en fin de script.",
      "`trap 'echo Ctrl+C intercepté; exit 0' INT` — gestion propre de Ctrl+C.",
      "`trap 'echo Erreur ligne $LINENO' ERR` — débogage des erreurs."
    ],
    fileSystem: {
      'resilient_script.sh': `#!/bin/bash
# Script avec gestion des signaux

LOCKFILE="/tmp/script.lock"
TMPFILE="/tmp/script_data.tmp"

# Nettoyage automatique à la sortie
cleanup() {
    echo "Nettoyage des fichiers temporaires..."
    rm -f "$LOCKFILE" "$TMPFILE"
    echo "✓ Nettoyage terminé"
}

# Interception des signaux
trap cleanup EXIT
trap 'echo "Interruption reçue, arrêt propre..."; exit 1' INT TERM

# Vérification de lock
if [ -f "$LOCKFILE" ]; then
    echo "⚠ Script déjà en cours (PID: $(cat $LOCKFILE))"
    exit 1
fi

echo $$ > "$LOCKFILE"
echo "Script PID: $$"
echo "Simule un travail long..."
sleep 30
echo "Travail terminé"
`
    },
    validation: [
      { type: 'command', value: 'cat resilient_script.sh', description: 'Lire le script avec trap' },
      { type: 'command', value: 'bash resilient_script.sh', description: 'Tester la gestion des signaux' }
    ],
    story: "🛡️ Un script professionnel ne laisse pas de déchets. `trap` garantit le nettoyage même en cas d'interruption."
  },
  {
    id: 28,
    title: "Awk — traitement de colonnes",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Maîtriser awk pour le traitement de données structurées",
    description: "`awk '{print $1, $3}'` affiche les colonnes 1 et 3. `awk -F: '{print $1}'` utilise `:` comme délimiteur. `awk 'NR>1 && $3>1000'` filtre par numéro de ligne et valeur. Blocs `BEGIN` et `END` pour l'init et le total.",
    commands: ['awk', 'cat'],
    hints: [
      "`awk -F: '{print $1}' /etc/passwd` — noms d'utilisateurs.",
      "`awk '{sum+=$2} END {print \"Total:\", sum}' data.txt` — somme d'une colonne.",
      "`awk 'NR%2==0' fichier.txt` — lignes paires uniquement."
    ],
    fileSystem: {
      'access_log.txt': `192.168.1.10 - GET /api/users 200 1523 0.045
10.0.0.5 - POST /api/login 401 342 0.012
185.220.101.5 - GET /admin 403 89 0.003
192.168.1.10 - GET /api/data 200 8921 0.234
10.0.0.5 - POST /api/login 200 512 0.018
185.220.101.5 - GET /api/users 200 1523 0.067
185.220.101.5 - POST /upload 200 0 1.234
185.220.101.5 - GET /shell.php 200 42 0.001`,
      'awk_cheatsheet.txt': `Commandes awk essentielles :
  awk '{print $1}'          : première colonne
  awk '{print NF}'          : nombre de champs par ligne
  awk '{print NR, $0}'      : numéro + ligne complète
  awk '/pattern/'           : lignes matchant le pattern
  awk '$3 > 1000'           : filtre sur valeur numérique
  awk '{sum+=$4} END{print sum}' : somme colonne 4
  awk -F, '{print $2}'      : délimiteur virgule (CSV)`
    },
    validation: [
      { type: 'command', value: 'awk', description: 'Utiliser awk pour analyser le log d\'accès' }
    ],
    story: "📊 `awk` est le tableur du terminal. Analyse des logs d'accès Apache en temps réel, stats par IP, total de bande passante — tout ça en une ligne."
  },
  {
    id: 29,
    title: "Sed avancé — transformations en masse",
    difficulty: 'intermediate',
    category: "Bash Avancé",
    objective: "Utiliser sed pour des transformations complexes de fichiers",
    description: "`sed -n 'p'` supprime l'affichage par défaut. `sed -n '5,10p'` affiche les lignes 5 à 10. `sed '/pattern/d'` supprime les lignes. `sed -i` modifie le fichier en place. Adressage : `/regex/`, `N,M`, `$` (dernière ligne).",
    commands: ['sed', 'cat', 'grep'],
    hints: [
      "`sed -n '1,5p' fichier.txt` — afficher les 5 premières lignes.",
      "`sed '/^#/d' config.txt` — supprimer les commentaires.",
      "`sed 's/\\b192\\.168\\.1\\./10.0.0./g'` — remplacer des IPs en masse."
    ],
    fileSystem: {
      'config_raw.txt': `# Fichier de configuration (à nettoyer)
# Auteur : admin
# Version : 1.0

server_host = 192.168.1.100    # ancien réseau
server_port = 8080
database_host = 192.168.1.200  # ancien réseau
database_port = 5432

# Section sécurité
password = toto123  # TODO: changer
api_key = sk-dev-12345  # clé de développement
debug = true  # à désactiver en prod
`,
      'sed_tasks.txt': `Tâches à effectuer sur config_raw.txt :
1. Supprimer toutes les lignes commençant par #
2. Remplacer 192.168.1. par 10.20.30.
3. Supprimer les commentaires inline ( # ...)
4. Changer debug = true en debug = false
5. Masquer les valeurs sensibles (password, api_key)`
    },
    validation: [
      { type: 'command', value: 'sed', description: 'Utiliser sed pour transformer le fichier de config' }
    ],
    story: "✂️ Un fichier de config legacy avec de vieilles IPs et des secrets en clair. `sed` pour tout nettoyer en une passe."
  },
  {
    id: 30,
    title: "Script de monitoring système",
    difficulty: 'advanced',
    category: "Bash Avancé",
    objective: "Écrire un script complet de monitoring qui agrège plusieurs métriques",
    description: "Un script de monitoring combine : CPU (`top -bn1`), RAM (`free -m`), disque (`df -h`), processus (`ps`), connexions réseau (`ss`). Les résultats sont formatés et envoyés en alerte si des seuils sont dépassés.",
    commands: ['top', 'free', 'df', 'ps', 'ss', 'awk', 'echo'],
    hints: [
      "`top -bn1 | grep 'Cpu' | awk '{print $2}'` — % CPU utilisé.",
      "`free -m | awk 'NR==2{printf \"%.1f%%\\n\", $3*100/$2}'` — % RAM utilisée.",
      "`df -h / | awk 'NR==2{print $5}'` — % disque utilisé sur /."
    ],
    fileSystem: {
      'monitor.sh': `#!/bin/bash
# Script de monitoring — complète les sections manquantes

ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEM=85
ALERT_THRESHOLD_DISK=90

check_cpu() {
    local cpu=$(top -bn1 | grep 'Cpu' | awk '{print $2}' | cut -d. -f1)
    echo "CPU: \${cpu}%"
    [ "\${cpu:-0}" -gt "$ALERT_THRESHOLD_CPU" ] && echo "Alerte CPU > \${ALERT_THRESHOLD_CPU}%"
}

check_memory() {
    # TODO : implémenter avec free -m et awk
    echo "TODO: vérifier la RAM"
}

check_disk() {
    # TODO : implémenter avec df -h
    echo "TODO: vérifier le disque"
}

echo "=== Rapport monitoring $(date) ==="
check_cpu
check_memory
check_disk
echo "=== Processus top 5 CPU ==="
ps aux --sort=-%cpu | head -6
`
    },
    validation: [
      { type: 'command', value: 'cat monitor.sh', description: 'Lire le script de monitoring' },
      { type: 'command', value: 'bash monitor.sh', description: 'Exécuter le script de monitoring' }
    ],
    story: "📈 En production, le monitoring automatique détecte les anomalies avant que les utilisateurs ne les signalent. Ce script est le point de départ."
  },
];
