#!/usr/bin/env bash
# Test 01 — Path Traversal Protection
# Vérifie que "../../../tmp/pwned_edulinux" dans fileSystem est bloqué.
# PASS = le fichier n'existe PAS en dehors du workdir.

source "$(dirname "$0")/lib/common.sh"
section "01 — Path Traversal Protection"

PROBE_FILE="/tmp/pwned_edulinux_test_$$"

check_python_ws

info "Tentative sans token (doit être rejeté par auth)..."
PAYLOAD="{\"type\":\"init\",\"id\":1,\"kind\":\"level\",\"fileSystem\":{\"../../../tmp/pwned_edulinux_test_$$\":\"HACKED\"},\"validations\":[]}"
RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
info "Réponse: $RESULT"

if echo "$RESULT" | grep -q "4401\|Unauthorized\|CLOSED"; then
  pass "Connexion sans token rejetée (code 4401) — path traversal bloqué par auth"
elif echo "$RESULT" | grep -q "ready\|output"; then
  # Connexion acceptée sans token — grave !
  sleep 1
  if [ -f "$PROBE_FILE" ]; then
    fail "VULNÉRABLE : fichier créé hors workdir ET pas d'auth → double vulnérabilité !"
    rm -f "$PROBE_FILE"
  else
    fail "Connexion acceptée sans token mais fichier de probe absent — auth manquante !"
  fi
else
  info "Réponse inattendue: $RESULT"
fi

# Test avec token valide si AUTH_TOKEN est fourni
if [ -n "${AUTH_TOKEN:-}" ]; then
  info "Test avec token valide (AUTH_TOKEN défini)..."
  TOKEN_RESP=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$TARGET/api/pty-token" 2>/dev/null)
  PTY_TOKEN=$(echo "$TOKEN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
  if [ -n "$PTY_TOKEN" ]; then
    PROBE2="/tmp/pwned_edulinux_auth_$$"
    PAYLOAD2="{\"type\":\"init\",\"token\":\"$PTY_TOKEN\",\"id\":1,\"kind\":\"level\",\"fileSystem\":{\"../../../tmp/pwned_edulinux_auth_$$\":\"HACKED\"},\"validations\":[]}"
    ws_close_code "${WS_TARGET}/pty" "$PAYLOAD2" >/dev/null
    sleep 1
    if [ -f "$PROBE2" ]; then
      fail "VULNÉRABLE avec auth : path traversal fonctionne encore !"
      rm -f "$PROBE2"
    else
      pass "Path traversal bloqué même avec token valide — validateFileSystemPath() OK"
    fi
  else
    info "Impossible d'obtenir un PTY token depuis $TARGET/api/pty-token"
  fi
fi

rm -f "$PROBE_FILE"
exit $FAILED
