#!/usr/bin/env bash
# Test 03 — Token WebSocket forgé (HMAC invalide)
# PASS = connexion rejetée malgré un token au bon format base64url.

source "$(dirname "$0")/lib/common.sh"
section "03 — Invalid HMAC Token"

check_python_ws

# Forge un token au format base64url correct mais HMAC incorrect
FAKE_TOKEN=$(python3 -c "
import base64
raw = b'user-hacker:9999999999999:deadbeefdeadbeef0000000000000000deadbeefdeadbeef'
print(base64.urlsafe_b64encode(raw).decode().rstrip('='))
")
info "Token forgé: $FAKE_TOKEN"

PAYLOAD="{\"type\":\"init\",\"token\":\"$FAKE_TOKEN\",\"id\":1,\"kind\":\"level\",\"validations\":[]}"
RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
info "Réponse: $RESULT"

if echo "$RESULT" | grep -q "4401\|CLOSED"; then
  pass "Token forgé rejeté — vérification HMAC OK"
elif echo "$RESULT" | grep -q "ready\|output"; then
  fail "VULNÉRABLE : token forgé accepté — HMAC non vérifié !"
else
  info "Réponse inattendue: $RESULT"
fi

exit $FAILED
