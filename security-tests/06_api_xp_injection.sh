#!/usr/bin/env bash
# Test 06 — XP Injection via API /api/progress
# PASS = 401 sans auth, 400 avec XP > 999999, 400 pour JSON invalide.

source "$(dirname "$0")/lib/common.sh"
section "06 — API XP Injection"

require_bin curl "sudo apt-get install curl"

info "Test 1/3 : POST sans authentification → 401 attendu"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
  -X POST "$TARGET/api/progress" \
  -H "Content-Type: application/json" \
  -d '{"totalXP":999999999}' 2>/dev/null)
if [ "$HTTP_CODE" = "401" ]; then
  pass "Sans auth → 401 Unauthorized"
elif [ -z "$HTTP_CODE" ]; then
  info "Serveur non joignable — lancer le serveur d'abord"
else
  fail "Sans auth → $HTTP_CODE (attendu 401)"
fi

info "Test 2/3 : JSON invalide → 400 ou 401 attendu"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
  -X POST "$TARGET/api/progress" \
  -H "Content-Type: application/json" \
  -d 'PAS_DU_JSON_DU_TOUT' 2>/dev/null)
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
  pass "JSON invalide → $HTTP_CODE (correct)"
else
  fail "JSON invalide → $HTTP_CODE (attendu 400 ou 401)"
fi

info "Test 3/3 : XP = 1000000 (> 999999) avec auth → 400 attendu"
if [ -n "${AUTH_TOKEN:-}" ]; then
  BODY='{"totalXP":1000000,"completedLevels":[],"currentLevel":1,"badges":[]}'
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -X POST "$TARGET/api/progress" \
    -H "Content-Type: application/json" \
    -H "Cookie: sb-auth-token=$AUTH_TOKEN" \
    -d "$BODY" 2>/dev/null)
  if [ "$HTTP_CODE" = "400" ]; then
    pass "XP > 999999 avec auth → 400 (validation Zod OK)"
  elif [ "$HTTP_CODE" = "401" ]; then
    info "AUTH_TOKEN non reconnu comme cookie Supabase — test partiel (récupère le token via le navigateur)"
  else
    fail "XP invalide avec auth → $HTTP_CODE (attendu 400)"
  fi
else
  info "AUTH_TOKEN non défini — test 3/3 ignoré"
  info "Pour le tester : AUTH_TOKEN=<supabase_access_token> ./06_api_xp_injection.sh"
fi

exit $FAILED
