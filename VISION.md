# Vision EduLinux — Au-delà du parcours 1 à 30

Ce document décrit **l’ambition du projet** : aujourd’hui l’application tourne en **développement local** (`http://localhost:3000`), sans infrastructure imposée ; demain, le même esprit doit préparer à être **à l’aise sur Linux**, en **ligne de commande**, sur le **système**, le **réseau** et les **scénarios type forensic** — avec des **mises en situation** qui complètent un catalogue de niveaux plus large.

---

## Où on en est aujourd’hui

- **Environnement** : exécution locale (Next.js), progression stockée dans le navigateur (**localStorage**). Pas de compte obligatoire, pas de serveur applicatif imposé pour apprendre.
- **Parcours principal** : **30 niveaux** linéaires, du débutant à des sujets avancés (flux, scripts, réseau, privilèges, etc.), avec un **terminal simulé** et des objectifs validés automatiquement.
- **Limite assumée** : ce n’est pas un Linux réel ; c’est un **atelier pédagogique**. La valeur est la **progression des concepts** et des gestes, pas la fidélité bit à bit d’une distribution.

Objectif de ce document : fixer **la direction** pour ajouter beaucoup plus de contenu et un **deuxième type d’expérience** : les scénarios.

---

## Objectif final pour l’apprenant

À terme, un utilisateur qui suit EduLinux devrait pouvoir :

| Domaine | En ligne de commande, viser… |
|--------|-------------------------------|
| **Système Linux** | Arborescence, permissions, utilisateurs/groupes, services, journaux, processus, espace disque, scripts d’administration courants. |
| **Réseau** | Lecture d’états (interfaces, routes, ports), logique client/serveur, transferts, clés SSH, notions de pare-feu et de capture (au moins **concepts** + commandes d’observation). |
| **Forensic Linux (intro)** | **Tri** : retrouver des artefacts dans des arborescences et des logs, enchaîner `grep` / `find` / filtres, comprendre **chaînes d’événements** (timelines simplifiées), hashs, métadonnées de base — toujours dans un cadre **légal et éthique** (lab, exercice, CTF autorisé). |

Tout cela reste **centré terminal** : pas remplacer une formation complète en forensic judiciaire, mais **rendre les bons réflexes** avant d’ouvrir des outils graphiques ou des environnements spécialisés.

---

## Deux piliers de contenu futurs

### 1. Niveaux supplémentaires (parcours élargi)

Le passage **1 → 30** pose des **fondations**. La suite logique est d’**allonger le parcours** avec des niveaux thématiques, par exemple :

- **Système** : `systemd` / unités (vue utilisateur), `journalctl`, quotas ou `df`/`du`, `cron` / timers, `umask`, ACL (notions).
- **Réseau** : `ip`, `ss` / `netstat` (observation), `tcpdump` en lecture de sortie simplifiée, diagnostics DNS (`dig` / `host`), routage (notions).
- **Forensic léger** : analyse de **fichiers de log** fournis dans le simulateur, corrélation de lignes, recherche d’IOC textuels, extraction de champs, comparaison de hashs.

Chaque niveau reste **court**, **validable**, avec indices — comme aujourd’hui.

### 2. Mises en situation (« Scénarios »)

En parallèle du parcours numéroté, l’idée est d’ajouter un mode **Scénario** (ou **Mission**), accessible **après** un certain socle (par ex. fin du 30) **ou** en parallèle pour les profils plus avancés.

**Principe**

1. **Brève mise en contexte** (texte) : qui tu es, quel système, quelle contrainte (ex. « incident sur un serveur de logs », « poste compromis à auditer », « réseau interne à cartographier »).
2. **Objectif ouvert** : pas toujours une seule commande magique — il faut **enchaîner** ce qu’on a appris : explorer, filtrer, lire, parfois **configurer** (dans le simulateur : variables, petits fichiers, « services » fictifs).
3. **Validation par jalons** : plusieurs étapes (indices progressifs), pour éviter le blocage tout en gardant le côté enquête.

**Exemples de scénarios (à titre d’intention, pas de données réelles)**

- **Incident logs** : un fichier `auth.log` (fictif) est fourni ; retrouver les IP suspectes, les heures, et la séquence d’événements.
- **Poste isolé** : arborescence « home » simulée ; trouver un script persistant et le chemin d’exécution.
- **Réseau minimal** : à partir de sorties `ss` / `ip` simulées, dire quel port écoute et quel service est cohérent avec le contexte.

Ces scénarios sont le bon endroit pour **« torturer » les connaissances** : moins guidé que le niveau 7, plus proche d’un **mini CTF pédagogique** intégré à la plateforme.

---

## Principes pour la suite du développement

- **Transparence** : rappeler où le simulateur **simplifie** par rapport à un vrai OS (chemins, droits, réseau).
- **Éthique** : forensic et réseau présentés comme **observation et défense** dans un cadre autorisé (lab, entreprise, compétition réglementée).
- **Progression** : parcours linéaire pour les **bases** ; scénarios pour la **synthèse** et la **motivation** à long terme.
- **Local d’abord** : tant que le projet vit en local, la progression peut rester côté client ; plus tard, export/import ou backend si besoin de classes / équipes.

---

## Feuille de route indicative (non contractuelle)

| Phase | Contenu |
|-------|--------|
| **Court terme** | Enrichir `levels.ts` (nouveaux niveaux), durcir le simulateur (`Terminal`) là où la pédagogie le demande (fichiers, redirections). |
| **Moyen terme** | Introduire le **type de contenu « scénario »** (données + texte + validations multi-étapes), même avec peu de scénarios au début. |
| **Long terme** | Couverture **système + réseau + intro forensic** alignée sur les objectifs ci-dessus ; documentation « limites du simulateur » pour les apprenants exigeants. |

---

## Lien avec le dépôt

- **README principal** : installation, fonctionnalités actuelles, liens utiles.
- **Ce fichier (`VISION.md`)** : **pourquoi** on construit EduLinux et **vers quoi** tendre au-delà des 30 premiers niveaux et du simple localhost.

Les contributions futures (niveaux, scénarios, améliorations du terminal) peuvent s’y référer pour rester **cohérentes** avec cette vision.
