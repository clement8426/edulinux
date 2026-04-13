#!/usr/bin/env bash
# run_all.sh — Lance tous les tests de sécurité EduLinux
#
# Usage :
#   ./run_all.sh                                   # teste localhost:3000
#   TARGET=https://monserveur.com ./run_all.sh
#   AUTH_TOKEN=xxx TARGET=https://... ./run_all.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export TARGET="${TARGET:-http://localhost:3000}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════════╗"
echo "║   EduLinux Security Test Suite               ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  Target   : ${YELLOW}$TARGET${NC}"
if [ -n "${AUTH_TOKEN:-}" ]; then
  echo -e "  Auth      : ${GREEN}AUTH_TOKEN défini${NC}"
else
  echo -e "  Auth      : ${YELLOW}AUTH_TOKEN non défini (tests authentifiés ignorés)${NC}"
fi
echo ""
echo -e "  ${YELLOW}Astuce :${NC} pour obtenir ton AUTH_TOKEN Supabase depuis le navigateur :"
echo -e "  → Ouvre la console JS sur l'app connectée et tape :"
echo -e "  → (await supabase.auth.getSession()).data.session.access_token"
echo ""

TOTAL=0
PASS_COUNT=0
FAIL_COUNT=0

run_test() {
  local script="$1"
  local name="$2"
  TOTAL=$((TOTAL+1))

  set +e
  bash "$SCRIPT_DIR/$script" 2>&1
  EXIT_CODE=$?
  set -e

  if [ $EXIT_CODE -eq 0 ]; then
    PASS_COUNT=$((PASS_COUNT+1))
  else
    FAIL_COUNT=$((FAIL_COUNT+1))
  fi
  echo ""
}

run_test "01_path_traversal.sh"     "01 Path Traversal"
run_test "02_ws_unauthenticated.sh" "02 WS Unauthenticated"
run_test "03_ws_invalid_token.sh"   "03 WS Invalid Token"
run_test "04_level_bypass.sh"       "04 Level Bypass"
run_test "05_dos_resize.sh"         "05 DoS Resize"
run_test "06_api_xp_injection.sh"   "06 API XP Injection"
run_test "07_tmp_isolation.sh"      "07 Tmp Isolation"

echo "──────────────────────────────────────────────────"
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}[RÉSULTAT] $PASS_COUNT/$TOTAL PASS — Aucune vulnérabilité détectée${NC}"
else
  echo -e "${RED}${BOLD}[RÉSULTAT] $PASS_COUNT/$TOTAL PASS — $FAIL_COUNT FAIL — Vulnérabilités détectées !${NC}"
fi
echo ""

exit $FAIL_COUNT
