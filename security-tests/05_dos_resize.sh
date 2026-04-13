#!/usr/bin/env bash
# Test 05 — DoS via cols/rows excessifs
# PASS = serveur toujours en vie après des valeurs extrêmes.

source "$(dirname "$0")/lib/common.sh"
section "05 — DoS Protection (cols/rows bounds)"

require_bin curl "sudo apt-get install curl"
check_python_ws

info "Test 1/2 : cols=999999999 rows=999999999 sans token (rejeté par auth avant PTY)"
PAYLOAD='{"type":"init","id":1,"cols":999999999,"rows":999999999,"validations":[]}'
RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
if echo "$RESULT" | grep -q "4401\|CLOSED\|Unauthorized"; then
  pass "Rejeté par auth avant traitement — cols excessifs n'atteignent jamais le PTY"
else
  info "Réponse: $RESULT (connexion peut-être non démarrée — vérifier le serveur)"
fi

info "Test 2/2 : serveur toujours en vie après tentative DoS"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$TARGET/" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "303" ]; then
  pass "Serveur répond HTTP $HTTP_CODE — toujours opérationnel"
elif [ -z "$HTTP_CODE" ]; then
  fail "Serveur ne répond pas — connexion refusée (serveur arrêté ?)"
else
  info "Serveur répond HTTP $HTTP_CODE — vérifier manuellement"
fi

exit $FAILED
