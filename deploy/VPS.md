# Déploiement EduLinux sur VPS — Guide complet

> Ce guide te permet de déployer EduLinux sur n'importe quel VPS Ubuntu 24.04 (Hetzner, OVH, DigitalOcean…) en partant de zéro, ou de migrer vers un nouveau serveur.

---

## Architecture

```
Internet
  │
  ▼ :80 / :443
Nginx (reverse proxy + SSL)
  │
  ▼ 127.0.0.1:3000
Docker → Node.js (Next.js + server.js WebSocket PTY)
  │
  ▼ HTTPS
Supabase (auth + base de données, service externe gratuit)
```

L'app n'est **jamais** exposée directement sur Internet — uniquement via Nginx.

---

## Étape 0 — Créer le VPS

### Chez Hetzner (ou autre provider)
- OS : **Ubuntu 24.04 LTS**
- Ajoute ta **clé SSH publique** lors de la création (pas de mot de passe root par email)
- Active les **backups** (+20%, recommandé en prod)
- Firewall : ouvre les ports **22**, **80**, **443**

### Récupérer ta clé SSH publique (depuis ton Mac)
```bash
cat ~/.ssh/hetzner_edulinux.pub   # ou id_ed25519.pub selon ta clé
```

---

## Étape 1 — Première connexion et sécurisation

Connecte-toi en root :
```bash
ssh root@<IP_VPS>
```

### Mettre à jour le système
```bash
apt update && apt upgrade -y
```

### Créer l'utilisateur `deploy`
```bash
adduser deploy
usermod -aG sudo deploy

# Copier ta clé SSH pour deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

### Tester depuis ton Mac avant de couper root
```bash
ssh deploy@<IP_VPS>
```

### Durcir SSH (optionnel mais recommandé)
```bash
nano /etc/ssh/sshd_config
```
Modifier :
```
PermitRootLogin no
PasswordAuthentication no
```
```bash
systemctl restart ssh
```

### Firewall UFW
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Étape 2 — Installer Docker

```bash
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker deploy
```

**Important** : déconnecte-toi et reconnecte-toi pour que le groupe `docker` soit actif :
```bash
exit
ssh deploy@<IP_VPS>
groups   # doit afficher "docker"
```

---

## Étape 3 — Cloner le projet

```bash
sudo mkdir -p /opt/edulinux
sudo chown deploy:deploy /opt/edulinux
cd /opt/edulinux
git clone https://github.com/clement8426/edulinux.git .
```

---

## Étape 4 — Fichier des secrets (jamais dans Git)

```bash
cp .env.production.example .env.production
nano .env.production
```

Remplis les **3 variables** avec tes clés Supabase (Supabase → Settings → API) :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Sécurise le fichier et crée un lien pour Docker Compose :
```bash
chmod 600 .env.production
ln -sf .env.production .env   # Compose lit .env pour interpoler le docker-compose.yml
```

> **Pourquoi le lien `.env` ?**
> Docker Compose cherche automatiquement un fichier `.env` à la racine pour remplacer les `${VARIABLE}` dans `docker-compose.prod.yml`. Sans ce lien, les `NEXT_PUBLIC_*` sont vides au build et l'app plante.

---

## Étape 5 — Build et démarrage

```bash
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

Vérifie que l'app répond (attendre ~15s au premier démarrage) :
```bash
sleep 15 && curl -fsS http://127.0.0.1:3000/ | head -c 200
```

Tu dois voir du HTML. Si ce n'est pas le cas, lis les logs :
```bash
docker compose -f docker-compose.prod.yml logs edulinux --tail=50
```

---

## Étape 6 — Nginx

### Installer Nginx
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Sans domaine (accès via IP, pour tester)
```bash
sudo cp deploy/nginx-edulinux.conf /etc/nginx/sites-available/edulinux
sudo ln -sf /etc/nginx/sites-available/edulinux /etc/nginx/sites-enabled/edulinux
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Ouvre **`http://<IP_VPS>`** dans ton navigateur — le site s'affiche.

### Avec un domaine + SSL (quand tu en auras un)

1. Ajoute un **enregistrement DNS A** chez ton registrar : `ton-domaine.com → <IP_VPS>`
2. Attends la propagation DNS (5-30 min)
3. Modifie le fichier Nginx :
```bash
sudo nano /etc/nginx/sites-available/edulinux
```
→ Commente le bloc "Sans domaine", décommente le bloc "Avec domaine", remplace `ton-domaine.com`

4. Active le SSL :
```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d ton-domaine.com
```
Certbot configure SSL et renouvellement automatique.

5. Dans **Supabase → Authentication → URL configuration** :
   - **Site URL** : `https://ton-domaine.com`
   - **Redirect URLs** : `https://ton-domaine.com/**`

---

## Étape 7 — Redémarrage du VPS (kernel update)

Lors de l'installation, Ubuntu a dit `System restart required`. Redémarre proprement :
```bash
sudo reboot
```

Reconnecte-toi après ~30s. Docker relancera l'app automatiquement (`restart: unless-stopped`).

---

## Mise à jour du code (déploiement)

À chaque push sur `main`, pour mettre à jour le VPS :

```bash
cd /opt/edulinux
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker image prune -f
```

---

## Migration vers un nouveau VPS

1. Crée le nouveau VPS (Ubuntu 24.04)
2. Suis les étapes 0 à 6 ci-dessus
3. Copie `.env.production` du vieux VPS vers le nouveau :
```bash
# Depuis ton Mac
scp deploy@<ANCIEN_IP>:/opt/edulinux/.env.production deploy@<NOUVEL_IP>:/opt/edulinux/.env.production
```
4. Change l'IP dans ton DNS (si tu as un domaine)
5. Éteins l'ancien VPS une fois le nouveau validé

---

## Dépannage

| Symptôme | Commande de diagnostic | Cause probable |
|----------|----------------------|----------------|
| Conteneur `Restarting` | `docker compose -f docker-compose.prod.yml logs edulinux --tail=50` | Erreur Node.js au démarrage |
| `curl: (7) Failed to connect` | `docker compose -f docker-compose.prod.yml ps` | Conteneur pas encore démarré ou crashé |
| `curl: (56) Recv failure` | Attendre 15s puis retenter | Next.js encore en cours de démarrage |
| Variables Supabase vides | `docker compose -f docker-compose.prod.yml run --rm --no-deps edulinux env \| grep SUPABASE` | Lien `.env` manquant ou `.env.production` mal formaté |
| `pty.node not found` | `git pull && docker compose ... build --no-cache` | Ancien Dockerfile sans `npm rebuild node-pty` |
| Next.js installe TypeScript au démarrage | `git pull && docker compose ... build --no-cache` | Ancien `next.config.ts` → remplacé par `next.config.mjs` |
| Nginx 502 | `docker compose -f docker-compose.prod.yml ps` | App pas démarrée ou port 3000 incorrect |

### Format correct de `.env.production`
```env
# Une variable par ligne, sans guillemets, sans espaces autour du =
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Sécurité — checklist

| Fait ? | Action |
|--------|--------|
| ☐ | Connexion SSH par clé uniquement (pas de mot de passe) |
| ☐ | `PermitRootLogin no` dans `/etc/ssh/sshd_config` |
| ☐ | UFW actif : ports 22, 80, 443 uniquement |
| ☐ | `chmod 600 .env.production` |
| ☐ | `.env.production` dans `.gitignore` (jamais commité) |
| ☐ | Backups Hetzner activés |
| ☐ | `sudo reboot` après mises à jour kernel |

---

## Résumé des fichiers de déploiement

| Fichier | Rôle |
|---------|------|
| `Dockerfile` | Build de l'image Docker (Next.js + node-pty) |
| `docker-compose.prod.yml` | Lancement du conteneur en production |
| `.env.production.example` | Modèle des variables (à copier sur le VPS) |
| `.env.production` | **Secrets réels — sur le VPS uniquement, jamais dans Git** |
| `deploy/nginx-edulinux.conf` | Config Nginx (IP-only + version SSL commentée) |
| `deploy/VPS.md` | Ce guide |
