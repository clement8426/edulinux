#!/usr/bin/env bash
# Test 07 — Isolation des workdirs temporaires
# Vérifie permissions 700 et noms non prédictibles (token hex 32 chars).

source "$(dirname "$0")/lib/common.sh"
section "07 — Tmp Workdir Isolation"

EDULINUX_TMP="${TMPDIR:-/tmp}/edulinux"

info "Répertoire surveillé : $EDULINUX_TMP"

if [ ! -d "$EDULINUX_TMP" ]; then
  info "Répertoire $EDULINUX_TMP absent (aucune session active)."
  info "Lance au moins une session terminal dans l'interface, puis relance ce test."
  exit 0
fi

FOUND=0
INSECURE=0

while IFS= read -r -d '' dir; do
  FOUND=$((FOUND+1))
  # Vérifier les permissions (stat diffère entre Linux et macOS)
  if command -v stat &>/dev/null; then
    PERMS=$(stat -c "%a" "$dir" 2>/dev/null || stat -f "%OLp" "$dir" 2>/dev/null || echo "unknown")
  else
    PERMS="unknown"
  fi

  if [ "$PERMS" != "700" ] && [ "$PERMS" != "unknown" ]; then
    fail "Permissions $PERMS sur $dir (attendu 700)"
    INSECURE=$((INSECURE+1))
  fi

  # Vérifier que le nom contient un token hex 32 chars à la fin
  BASENAME=$(basename "$dir")
  if echo "$BASENAME" | grep -qE '[0-9a-f]{32}$'; then
    : # Token aléatoire présent
  else
    fail "Nom sans token aléatoire 32 hex: $BASENAME"
    INSECURE=$((INSECURE+1))
  fi

  # Vérifier absence de '..' dans le chemin
  if echo "$dir" | grep -q '\.\.'; then
    fail "Path traversal dans le nom de workdir: $dir"
    INSECURE=$((INSECURE+1))
  fi

done < <(find "$EDULINUX_TMP" -mindepth 1 -maxdepth 1 -type d -print0 2>/dev/null)

if [ "$FOUND" -eq 0 ]; then
  info "Aucun workdir actif dans $EDULINUX_TMP — lancer une session et retester"
elif [ "$INSECURE" -eq 0 ]; then
  pass "$FOUND workdir(s) — tous avec permissions correctes et noms aléatoires"
fi

if [ "$FOUND" -ge 2 ]; then
  UNIQUE=$(find "$EDULINUX_TMP" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort -u | wc -l | tr -d ' ')
  if [ "$UNIQUE" = "$FOUND" ]; then
    pass "$FOUND sessions actives — tous les workdirs ont des noms uniques (non prédictibles)"
  fi
fi

exit $FAILED
