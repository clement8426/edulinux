#!/usr/bin/env bash
# Test 04 — Level Bypass
# INFO : tout utilisateur authentifié peut accéder à n'importe quel niveau (by design).
# Ce test documente le comportement ATTENDU, pas une vulnérabilité.

source "$(dirname "$0")/lib/common.sh"
section "04 — Level Bypass (comportement attendu)"

check_python_ws

info "Ce test documente le comportement ATTENDU :"
info "  → Tout utilisateur authentifié peut accéder à n'importe quel niveau."
info "  → Ce n'est PAS une vulnérabilité selon la conception de la plateforme."
info "  → L'accès est contrôlé par l'auth, pas par la progression."

if [ -n "${AUTH_TOKEN:-}" ]; then
  TOKEN_RESP=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$TARGET/api/pty-token" 2>/dev/null)
  PTY_TOKEN=$(echo "$TOKEN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
  if [ -n "$PTY_TOKEN" ]; then
    PAYLOAD="{\"type\":\"init\",\"token\":\"$PTY_TOKEN\",\"id\":999,\"kind\":\"level\",\"validations\":[]}"
    RESULT=$(ws_close_code "${WS_TARGET}/pty" "$PAYLOAD")
    if echo "$RESULT" | grep -q "ready\|RECV"; then
      info "Accès au niveau 999 autorisé (comportement attendu pour un utilisateur authentifié)"
    else
      info "Réponse: $RESULT"
    fi
  else
    info "Impossible d'obtenir un PTY token — serveur en cours d'exécution ?"
  fi
else
  info "Définir AUTH_TOKEN=<supabase_access_token> pour tester avec une session réelle."
fi

echo ""
info "→ [INFO OK] — pas de PASS/FAIL pour ce test par design"
exit 0
