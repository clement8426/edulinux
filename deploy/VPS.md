# Déploiement sur VPS (Hetzner) — EduLinux

Objectif : Next.js + `server.js` (WebSocket PTY) derrière Nginx + HTTPS, secrets **uniquement** sur le serveur.

## Prérequis sur le VPS

- Ubuntu 24.04, utilisateur `deploy` avec `sudo`
- UFW : ports 22, 80, 443 ouverts
- Un **nom de domaine** pointant vers l’IP du VPS (A record vers IPv4, AAAA vers IPv6 si tu l’utilises)

## 1. Installer Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker deploy
```

Déconnecte-toi et reconnecte (`ssh deploy@IP`) pour que le groupe `docker` soit actif.

## 2. Cloner le projet (sans secrets)

```bash
sudo mkdir -p /opt/edulinux
sudo chown deploy:deploy /opt/edulinux
cd /opt/edulinux
git clone https://github.com/clement8426/edulinux.git .
```

## 3. Fichier d’environnement (secret — jamais dans Git)

```bash
cp .env.production.example .env.production
nano .env.production
```

Renseigne les **3** variables (Supabase → Settings → API) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Permissions :

```bash
chmod 600 .env.production
```

Compose lit automatiquement un fichier **`.env`** à la racine pour remplacer `${NEXT_PUBLIC_*}` dans `docker-compose.prod.yml`. Sans ça, le build peut partir avec des clés **vides** et le conteneur plante. Crée un lien :

```bash
ln -sf .env.production .env
```

Docker Compose charge `.env.production` au **runtime** (`env_file`). Les `NEXT_PUBLIC_*` doivent aussi être présentes au **build** (via `.env` ou `--env-file`).

## 4. Build et démarrage

`--env-file .env.production` injecte les `NEXT_PUBLIC_*` pour le **build** Docker et le **runtime**.

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production build --no-cache
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

Vérifie :

```bash
curl -fsS http://127.0.0.1:3000/ | head -c 200
docker compose -f docker-compose.prod.yml ps
```

L’app n’écoute que sur **127.0.0.1:3000** (pas exposée sur Internet directement).

### Dépannage — conteneur `Restarting` ou `curl` refuse la connexion

1. **Voir l’erreur réelle** (indispensable) :

```bash
cd /opt/edulinux
docker compose -f docker-compose.prod.yml logs edulinux --tail=80
```

2. **Vérifier que les variables ne sont pas vides** dans le conteneur :

```bash
docker compose -f docker-compose.prod.yml run --rm --no-deps edulinux env | grep -E 'NEXT_PUBLIC|SUPABASE'
```

3. **Fichier `.env` pour Compose** : si tu n’as pas fait `ln -sf .env.production .env`, refais le lien puis **rebuild** (les `NEXT_PUBLIC_*` sont figées dans l’image au build) :

```bash
ln -sf .env.production .env
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

4. **Format de `.env.production`** : une variable par ligne, sans espaces autour du `=`, pas de guillemets inutiles, fichier en UTF-8 / LF (pas de CRLF Windows).

5. **`node-pty` / erreur `Cannot find module ... pty.node`** : l’image Docker reconstruit le module natif après `npm prune`. Fais un `git pull` pour avoir le dernier `Dockerfile`, puis `build --no-cache` comme ci-dessus.

## 5. Nginx + Let’s Encrypt

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx-edulinux.conf /etc/nginx/sites-available/edulinux
sudo nano /etc/nginx/sites-available/edulinux   # remplace ton-domaine.com
sudo ln -sf /etc/nginx/sites-available/edulinux /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d ton-domaine.com
```

Certbot configure SSL et le renouvellement automatique.

## 6. Mise à jour (déploiement)

```bash
cd /opt/edulinux
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
docker image prune -f
```

## 7. Sécurité — rappels

| À faire | Pourquoi |
|--------|----------|
| Clé SSH pour `deploy`, pas de mot de passe SSH | Réduit le brute-force |
| `chmod 600 .env.production` | Fichier lisible seulement par toi |
| Ne jamais committer `.env.production` | Déjà dans `.gitignore` si tu l’ajoutes |
| Backups Hetzner activés | Restauration en cas de casse |
| Firewall Hetzner + UFW alignés | Seuls 22/80/443 (ou ton port SSH) |

### Supabase — URLs autorisées

Dans Supabase → **Authentication → URL configuration** :

- **Site URL** : `https://ton-domaine.com`
- **Redirect URLs** : `https://ton-domaine.com/**`, `https://ton-domaine.com/auth/callback`

## 8. CI/CD (optionnel)

Tu peux ajouter un workflow GitHub Actions qui build l’image, la pousse vers GHCR, puis SSH sur le VPS pour `docker compose pull && up -d`. Les secrets GitHub ne doivent contenir que la clé SSH et l’hôte — **pas** les clés Supabase (elles restent dans `.env.production` sur le VPS).
