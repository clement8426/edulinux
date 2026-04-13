import type { Level } from './_types';

export const levels11_20: Level[] = [
  {
    id: 11,
    title: "Redirections & Pipes",
    difficulty: 'intermediate',
    category: "Flux",
    objective: "Rediriger avec > puis enchaîner avec |",
    description: "Ce niveau comporte **deux objectifs séparés** (tu peux utiliser deux commandes, une après l'autre) : (1) écrire du texte dans un fichier avec `echo ... > fichier` ; (2) utiliser le pipe `|` pour envoyer la sortie d'une commande à une autre (ex. `cat fichier | grep mot`).",
    commands: ['echo', 'grep', 'cat'],
    hints: [
      "Étape A — redirection : `echo 'texte' > essai.txt` (le `>` crée ou écrase le fichier).",
      "Étape B — pipe : `cat essai.txt | grep texte` (ou toute commande qui contient `|`).",
      "Chaque étape déclenche une validation quand tu valides la commande avec Entrée."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'echo >', description: 'Rediriger la sortie de echo avec >' },
      { type: 'command', value: '|', description: 'Enchaîner deux commandes avec le pipe |' }
    ],
    story: "🔀 Les flux de données : d'abord écrire dans un fichier, puis relier deux commandes. Prends le temps de faire les deux manipulations."
  },
  {
    id: 12,
    title: "Append vs Overwrite",
    difficulty: 'intermediate',
    category: "Flux",
    objective: "Différence entre > et >>",
    description: "`>` écrase le fichier, `>>` ajoute à la fin.",
    commands: ['echo'],
    hints: [
      "echo 'ligne1' > log.txt (écrase)",
      "echo 'ligne2' >> log.txt (ajoute)"
    ],
    fileSystem: {
      'journal.log': 'Entrée initiale'
    },
    validation: [
      { type: 'command', value: '>>', description: 'Utiliser >> pour ajouter' }
    ],
    story: "📝 Un journal doit garder toutes ses entrées. N'écrase pas l'historique !"
  },
  {
    id: 13,
    title: "Analyse de texte",
    difficulty: 'intermediate',
    category: "Analyse",
    objective: "Utiliser wc, sort, uniq",
    description: "`wc -l` compte les lignes, `sort` trie, `uniq` élimine les doublons.",
    commands: ['wc', 'sort', 'uniq'],
    hints: [
      "wc -l fichier.txt compte les lignes",
      "cat fichier | sort | uniq supprime les doublons"
    ],
    fileSystem: {
      'data.txt': `apple
banana
apple
cherry
banana
apple`
    },
    validation: [
      { type: 'command', value: 'wc -l data.txt', description: 'Compter les lignes' }
    ],
    story: "📊 Analyse des données : combien de lignes ? Combien de valeurs uniques ?"
  },
  {
    id: 14,
    title: "Wildcards (*, ?)",
    difficulty: 'intermediate',
    category: "Glob",
    objective: "Utiliser les patterns glob",
    description: "`*` remplace n'importe quoi, `?` remplace un caractère.",
    commands: ['ls'],
    hints: [
      "ls *.txt pour tous les .txt",
      "ls file?.txt pour file1.txt, file2.txt, etc."
    ],
    fileSystem: {
      'report1.txt': 'Rapport 1',
      'report2.txt': 'Rapport 2',
      'report3.txt': 'Rapport 3',
      'data.csv': 'Données',
      'secret_flag.txt': 'FLAG: GLOB_MASTER'
    },
    validation: [
      { type: 'command', value: 'ls *.txt', description: 'Lister tous les fichiers .txt' }
    ],
    story: "🌟 Des dizaines de fichiers. Liste seulement les .txt avec un pattern !"
  },
  {
    id: 15,
    title: "Permissions avancées",
    difficulty: 'intermediate',
    category: "Permissions",
    objective: "Comprendre rwx et chmod +x",
    description: "`r`=read, `w`=write, `x`=execute. `chmod +x` rend exécutable.",
    commands: ['chmod', 'ls'],
    hints: [
      "chmod +x script.sh",
      "ls -l pour voir les permissions"
    ],
    fileSystem: {
      'script.sh': '#!/bin/bash\necho "FLAG: EXECUTABLE_UNLOCKED"'
    },
    validation: [
      { type: 'command', value: 'chmod +x script.sh', description: 'Rendre script.sh exécutable' }
    ],
    story: "⚙️ Un script ne peut pas s'exécuter sans permission. Débloque-le !"
  },
  {
    id: 16,
    title: "Variables d'environnement",
    difficulty: 'intermediate',
    category: "Environnement",
    objective: "Utiliser export et $",
    description: "Les variables stockent des données. `export VAR='valeur'` et `echo $VAR`.",
    commands: ['export', 'echo'],
    hints: [
      "export FLAG='success'",
      "echo $FLAG pour afficher"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'export FLAG=', description: 'Créer la variable FLAG' }
    ],
    story: "🎯 Le système utilise des variables. Crée FLAG='success' et affiche-la !"
  },
  {
    id: 17,
    title: "Premier script Bash",
    difficulty: 'intermediate',
    category: "Scripts",
    objective: "Créer hello.sh et l'exécuter avec ./hello.sh",
    description: "Un script est un fichier de commandes. Parcours typique : créer `hello.sh` (avec `echo` et des lignes commençant par `#!/bin/bash`), le rendre exécutable avec `chmod +x hello.sh`, puis lancer **`./hello.sh`**. Dans EduLinux, **c'est la commande `./hello.sh` qui valide le niveau** — les étapes précédentes t'apprennent le chemin complet qu'on suivrait sur un vrai système.",
    commands: ['echo', 'chmod'],
    hints: [
      "Création (exemple) : `echo '#!/bin/bash' > hello.sh` puis ajoute une ligne `echo Hello` (tu peux refaire echo avec `>>` si besoin).",
      "Rends le fichier exécutable : `chmod +x hello.sh`.",
      "Validation du niveau : tape `./hello.sh` et valide avec Entrée."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: './hello.sh', description: 'Exécuter le script ./hello.sh' }
    ],
    story: "📜 Écris un petit script, rends-le exécutable, puis lance-le : c'est le geste quotidien de l'administration système."
  },
  {
    id: 18,
    title: "Chaîne de pipes",
    difficulty: 'intermediate',
    category: "Flux",
    objective: "Combiner grep et cut",
    description: "`cut` découpe par délimiteur. `cut -d':' -f2` prend le 2e champ.",
    commands: ['grep', 'cut', 'cat'],
    hints: [
      "cat users.txt | grep 'admin' trouve la ligne",
      "| cut -d':' -f2 extrait le champ"
    ],
    fileSystem: {
      'users.txt': `user:john:1001
admin:FLAG_PIPELINE_MASTER:1002
guest:visitor:1003`
    },
    validation: [
      { type: 'command', value: "grep admin users.txt | cut -d':' -f2", description: 'Extraire le mot de passe admin' }
    ],
    story: "🔗 Les vraies données nécessitent plusieurs étapes. Enchaîne les commandes !"
  },
  {
    id: 19,
    title: "Compression",
    difficulty: 'intermediate',
    category: "Archives",
    objective: "Extraire avec tar et gzip",
    description: "`tar -xvf fichier.tar` extrait une archive.",
    commands: ['tar', 'unzip', 'cat'],
    hints: [
      "tar -xvf archive.tar.gz",
      "Le fichier sera extrait dans le dossier"
    ],
    fileSystem: {
      'archive.tar.gz': '[ARCHIVE_CONTAINS: password.txt]'
    },
    validation: [
      { type: 'command', value: 'tar -xvf archive.tar.gz', description: 'Extraire l\'archive' }
    ],
    story: "📦 Le mot de passe est dans une archive compressée. Extrais-la !"
  },
  {
    id: 20,
    title: "Curl/Wget",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Télécharger une ressource web",
    description: "`curl URL -o fichier` télécharge une page web.",
    commands: ['curl', 'wget', 'cat'],
    hints: [
      "curl https://example.com -o page.html",
      "cat page.html pour lire"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'curl', description: 'Utiliser curl pour télécharger' }
    ],
    story: "🌐 Le serveur distant contient un fichier avec le mot de passe. Télécharge-le !"
  },
];
