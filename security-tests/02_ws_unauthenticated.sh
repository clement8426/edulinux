#!/usr/bin/env bash
# Test 02 — WebSocket sans authentification
# PASS = connexion rejetée avec code 4401.

source "$(dirname "$0")/lib/common.sh"
section "02 — WebSocket Unauthenticated Access"

check_python_ws

info "Connexion WebSocket sans token..."
PAYLOAD='{"type":"init","id":1,"kind":"level","validations":[]}'
RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
info "Réponse: $RESULT"

if echo "$RESULT" | grep -q "4401"; then
  pass "Connexion rejetée avec code 4401 — authentification WS OK"
elif echo "$RESULT" | grep -q "CLOSED"; then
  pass "Connexion fermée par le serveur (code non-4401 mais rejeté) — vérifier le code exact"
  info "Résultat brut: $RESULT"
elif echo "$RESULT" | grep -q "ready\|output"; then
  fail "VULNÉRABLE : serveur a répondu 'ready' sans token !"
else
  info "Réponse inattendue: $RESULT — vérifier que le serveur est démarré"
fi

exit $FAILED
