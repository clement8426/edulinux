# EduLinux — Scripts de test de sécurité

Tests d'intrusion manuels pour valider les corrections de sécurité, en local ou sur le VPS Hetzner.

## Prérequis

| Outil | Installation |
|---|---|
| `bash` | Natif Linux |
| `curl` | `sudo apt-get install curl` |
| `python3` | `sudo apt-get install python3 python3-pip` |
| `websockets` (pip) | `pip3 install websockets` |
| `websocat` | Installé automatiquement par les scripts via apt ou binaire GitHub |

## Usage

```bash
# Rendre les scripts exécutables (une seule fois)
chmod +x security-tests/*.sh security-tests/lib/common.sh

# Tester en local (serveur sur localhost:3000)
cd security-tests
./run_all.sh

# Tester sur le VPS Hetzner
TARGET=https://ton-domaine.com ./run_all.sh

# Avec un token de session Supabase (pour les tests authentifiés)
AUTH_TOKEN=eyJhbGc... TARGET=https://ton-domaine.com ./run_all.sh
```

## Obtenir le AUTH_TOKEN Supabase

Dans la console JavaScript du navigateur, sur l'app EduLinux connectée :

```javascript
(await supabase.auth.getSession()).data.session.access_token
```

## Tests individuels

```bash
./01_path_traversal.sh     # Path traversal via fileSystem (../../../etc/passwd)
./02_ws_unauthenticated.sh # WS sans token → rejet 4401
./03_ws_invalid_token.sh   # HMAC forgé → rejet
./04_level_bypass.sh       # Accès niveau 999 (comportement attendu : autorisé si auth)
./05_dos_resize.sh         # cols/rows excessifs → bornés, serveur vivant
./06_api_xp_injection.sh   # XP > 999999 → 400 Zod
./07_tmp_isolation.sh      # Workdirs permissions 700, noms aléatoires
```

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `TARGET` | `http://localhost:3000` | URL du serveur à tester |
| `AUTH_TOKEN` | (vide) | Token Supabase pour les tests qui nécessitent une session |

## Interprétation des résultats

- `[PASS]` — Le fix est en place, l'attaque est bloquée
- `[FAIL]` — Vulnérabilité encore présente → corriger avant mise en production
- `[INFO]` — Comportement documenté (non un problème de sécurité)

## Correspondance fix ↔ test

| Test | Vulnérabilité | Fix appliqué |
|---|---|---|
| `01` | Path traversal `../` | `validateFileSystemPath()` dans `lib/security.js` |
| `02` | WS non authentifié | Token HMAC éphémère dans `server.js` |
| `03` | HMAC forgé | `verifyPtyToken()` avec `timingSafeEqual` |
| `04` | Level bypass | Accès libre (by design) pour utilisateurs auth |
| `05` | DoS cols/rows | `validateTerminalSize()` bounds check |
| `06` | XP injection API | Schéma Zod dans `app/api/progress/route.ts` |
| `07` | Isolation workdir | `generateWorkDir()` + mode 0700 |
