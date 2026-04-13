import type { Level } from './_types';

export const levels41_50: Level[] = [
  {
    id: 41,
    title: "Interfaces réseau",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Observer les interfaces avec ip addr",
    description: "`ip addr` (ou `ip a`) liste toutes les interfaces réseau, leurs adresses IP et leur état (UP/DOWN). Remplace l'ancien `ifconfig` sur les systèmes modernes.",
    commands: ['ip'],
    hints: [
      "`ip addr` — toutes les interfaces avec leurs IPs.",
      "`ip addr show eth0` — uniquement l'interface eth0.",
      "Repère l'adresse IPv4 (inet) et IPv6 (inet6) de chaque interface."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ip addr', description: 'Lister les interfaces et adresses IP' }
    ],
    story: "🌐 Le serveur ne répond pas sur le réseau. Quelle est son adresse IP et son interface principale ?"
  },
  {
    id: 42,
    title: "Ports ouverts",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Lister les connexions avec ss",
    description: "`ss -tulnp` liste les ports en écoute : `t`=TCP, `u`=UDP, `l`=listen, `n`=numérique, `p`=processus. Remplace `netstat` sur les systèmes récents.",
    commands: ['ss'],
    hints: [
      "`ss -tulnp` — tous les ports en écoute avec le processus.",
      "`ss -tnp` — connexions TCP établies.",
      "Cherche un port inhabituel ou un service inconnu dans la liste."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ss -tulnp', description: 'Lister les ports en écoute' }
    ],
    story: "🔍 Un port inconnu est ouvert sur ce serveur. Identifie quel processus l'utilise."
  },
  {
    id: 43,
    title: "Table de routage",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Lire la table de routage avec ip route",
    description: "`ip route` (ou `ip r`) affiche la table de routage : quelle interface pour quelle destination, et quelle passerelle (default gateway).",
    commands: ['ip'],
    hints: [
      "`ip route` — affiche toutes les routes.",
      "La ligne `default via X.X.X.X` indique la passerelle par défaut.",
      "`ip route get 8.8.8.8` — quelle route serait utilisée pour joindre cette IP ?"
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ip route', description: 'Afficher la table de routage' }
    ],
    story: "🗺️ Le serveur ne peut pas atteindre Internet. La passerelle par défaut est-elle correctement configurée ?"
  },
  {
    id: 44,
    title: "Diagnostic DNS",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Résoudre un nom de domaine avec dig",
    description: "`dig domaine` interroge les serveurs DNS. La section ANSWER contient les enregistrements trouvés (A=IPv4, AAAA=IPv6, MX=mail, CNAME=alias). `dig +short domaine` affiche juste l'IP.",
    commands: ['dig'],
    hints: [
      "`dig google.com` — résolution complète avec TTL.",
      "`dig +short google.com` — juste l'adresse IP.",
      "`dig MX gmail.com` — serveurs mail de Gmail."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'dig', description: 'Résoudre un nom de domaine via DNS' }
    ],
    story: "🌍 Le site web répond à l'IP mais pas au nom de domaine. Le DNS est-il bien configuré ?"
  },
  {
    id: 45,
    title: "Test de connectivité",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Utiliser ping et traceroute",
    description: "`ping hôte` envoie des paquets ICMP pour tester la joignabilité. `traceroute hôte` (ou `tracepath`) trace le chemin réseau saut par saut.",
    commands: ['ping', 'traceroute'],
    hints: [
      "`ping 8.8.8.8` — teste si l'hôte répond (3 paquets dans le simulateur).",
      "`traceroute 8.8.8.8` — voit chaque routeur traversé.",
      "Un `* * *` dans traceroute = ce saut ne répond pas (firewall)."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'ping', description: 'Tester la joignabilité d\'un hôte' },
      { type: 'command', value: 'traceroute', description: 'Tracer le chemin réseau' }
    ],
    story: "📡 Le serveur de backup ne répond plus. Est-il joignable ? Y a-t-il un blocage réseau en route ?"
  },
  {
    id: 46,
    title: "Capture réseau (lecture)",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Lire une sortie tcpdump simulée",
    description: "`tcpdump` capture les paquets réseau. **Sur un vrai système il faut des droits root.** Ici on te donne une sortie simulée à analyser : identifie les IPs, protocoles et ports impliqués.",
    commands: ['tcpdump', 'cat', 'grep'],
    hints: [
      "Commence par lire `capture.txt` avec cat.",
      "`grep 'SYN' capture.txt` — connexions TCP initiées.",
      "Format : `heure IP_source.port > IP_dest.port: flags`."
    ],
    fileSystem: {
      'capture.txt': `14:23:01.123456 IP 192.168.1.50.54321 > 10.0.0.1.22: Flags [S], seq 0, win 65535
14:23:01.124000 IP 10.0.0.1.22 > 192.168.1.50.54321: Flags [S.], seq 0, ack 1, win 65535
14:23:01.125000 IP 192.168.1.50.54321 > 10.0.0.1.22: Flags [.], ack 1, win 65535
14:23:05.000000 IP 10.10.10.99.45678 > 10.0.0.1.80: Flags [S], seq 0 (connexion HTTP suspecte)
14:23:05.001000 IP 10.10.10.99.45678 > 10.0.0.1.80: Flags [S], seq 1 (tentative répétée)
14:23:10.000000 IP 192.168.1.1.53 > 192.168.1.50.12345: UDP DNS réponse google.com`
    },
    validation: [
      { type: 'command', value: 'grep', description: 'Filtrer les lignes de capture intéressantes' }
    ],
    story: "🎣 Une capture réseau a été faite lors d'un incident. Analyse-la pour repérer les connexions anormales."
  },
  {
    id: 47,
    title: "Règles de pare-feu",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Lire les règles iptables",
    description: "`iptables -L -n -v` liste les règles (sans résolution DNS). Colonnes : target (action), prot (protocole), source, destination. Les actions courantes : ACCEPT, DROP, REJECT.",
    commands: ['iptables'],
    hints: [
      "`iptables -L -n -v` — toutes les chaînes (INPUT, OUTPUT, FORWARD).",
      "Une règle `DROP` en INPUT bloque les paquets entrants.",
      "Dans ce simulateur, la sortie est statique mais réaliste."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'iptables -L', description: 'Lister les règles du pare-feu' }
    ],
    story: "🛡️ Le port 443 ne répond plus alors que nginx tourne. Le pare-feu bloque-t-il le trafic HTTPS ?"
  },
  {
    id: 48,
    title: "Transfert sécurisé avancé",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Utiliser rsync pour synchroniser des dossiers",
    description: "`rsync -avz source/ user@host:/dest/` synchronise en ne transférant que les fichiers modifiés. Plus efficace que scp pour des dossiers. `-a`=archive (préserve droits/dates), `-v`=verbose, `-z`=compression.",
    commands: ['rsync'],
    hints: [
      "`rsync -avz /var/www/ admin@backup:/ var/www/` — synchronise le site.",
      "`rsync -avzn` — dry-run (simulation sans transfert réel).",
      "Option `--delete` : supprime côté destination ce qui n'existe plus à la source."
    ],
    fileSystem: {
      'var': {
        'www': {
          'index.html': '<html><body>EduLinux Site</body></html>',
          'style.css': 'body { background: #0a0a0a; }'
        }
      }
    },
    validation: [
      { type: 'command', value: 'rsync', description: 'Synchroniser un dossier avec rsync' }
    ],
    story: "🔄 Le serveur de production et le serveur de backup ont divergé. Synchronise les fichiers web efficacement."
  },
  {
    id: 49,
    title: "Tunnel SSH",
    difficulty: 'advanced',
    category: "Réseau",
    objective: "Comprendre le port-forwarding SSH",
    description: "SSH peut créer des tunnels : `ssh -L port_local:hote_distant:port_distant user@jump` redirige un port à travers SSH. Utile pour accéder à un service interne depuis l'extérieur de façon sécurisée.",
    commands: ['ssh'],
    hints: [
      "`ssh -L 8080:10.0.0.5:80 admin@jumpserver` — accède au port 80 interne via localhost:8080.",
      "Le `-L` signifie Local forwarding.",
      "Le `-N` ajoute en option empêche l'ouverture d'un shell (tunnel pur)."
    ],
    fileSystem: {
      'network_map.txt': `Réseau interne:
  jumpserver : 192.168.1.100 (accessible depuis Internet)
  db-server  : 10.0.0.5 (port 5432, PostgreSQL — interne uniquement)
  web-server : 10.0.0.10 (port 80 — interne uniquement)

Objectif : accède au web-server interne (port 80) depuis ton poste.`
    },
    validation: [
      { type: 'command', value: 'ssh -L', description: 'Créer un tunnel SSH local' }
    ],
    story: "🔒 Le serveur de base de données n'est pas exposé à Internet. Crée un tunnel SSH pour y accéder en toute sécurité."
  },
  {
    id: 50,
    title: "Requêtes HTTP en ligne de commande",
    difficulty: 'intermediate',
    category: "Réseau",
    objective: "Analyser des réponses HTTP avec curl -I et curl -v",
    description: "`curl -I URL` envoie uniquement la requête HEAD (headers). `curl -v URL` affiche la connexion complète (handshake, headers, corps). Utile pour diagnostiquer des API ou des sites.",
    commands: ['curl'],
    hints: [
      "`curl -I https://example.com` — code HTTP + headers sans corps.",
      "`curl -v https://example.com` — tout : connexion TLS, headers, réponse.",
      "Le code de statut : 200=OK, 301=redirect, 403=interdit, 404=introuvable, 500=erreur serveur."
    ],
    fileSystem: {},
    validation: [
      { type: 'command', value: 'curl -I', description: 'Récupérer uniquement les headers HTTP' },
      { type: 'command', value: 'curl -v', description: 'Mode verbeux pour diagnostiquer' }
    ],
    story: "🌐 L'API renvoie une erreur mystérieuse. Inspecte les headers HTTP pour comprendre ce qui se passe."
  },
];
