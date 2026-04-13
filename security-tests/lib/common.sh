#!/usr/bin/env bash
# Fonctions utilitaires partagées par tous les scripts de test

TARGET="${TARGET:-http://localhost:3000}"
WS_TARGET="${TARGET/http:/ws:}"
WS_TARGET="${WS_TARGET/https:/wss:}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; FAILED=$((FAILED+1)); }
info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
section() { echo -e "\n${BLUE}── $1 ──${NC}"; }

FAILED=0

# Vérifie qu'un binaire est disponible
require_bin() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}[ERROR]${NC} '$1' est requis mais non trouvé."
    echo "  → $2"
    exit 1
  fi
}

# Vérifie websocat et propose l'installation si absent
check_websocat() {
  if ! command -v websocat &>/dev/null; then
    info "websocat non trouvé. Tentative d'installation automatique..."
    if command -v apt-get &>/dev/null; then
      sudo apt-get install -y websocat 2>/dev/null || true
    fi
    if ! command -v websocat &>/dev/null; then
      ARCH=$(uname -m)
      if [ "$ARCH" = "x86_64" ]; then
        WC_BIN="websocat.x86_64-unknown-linux-musl"
      elif [ "$ARCH" = "aarch64" ]; then
        WC_BIN="websocat.aarch64-unknown-linux-musl"
      else
        fail "Architecture non supportée pour websocat: $ARCH — installe-le manuellement"
        exit 1
      fi
      WC_URL="https://github.com/vi/websocat/releases/download/v1.13.0/${WC_BIN}"
      info "Téléchargement de websocat depuis GitHub..."
      sudo curl -sSL "$WC_URL" -o /usr/local/bin/websocat
      sudo chmod +x /usr/local/bin/websocat
    fi
    if ! command -v websocat &>/dev/null; then
      fail "Impossible d'installer websocat."
      exit 1
    fi
    info "websocat installé."
  fi
}

# Vérifie python3 et le module websockets
check_python_ws() {
  require_bin python3 "sudo apt-get install python3 python3-pip"
  python3 -c "import websockets" 2>/dev/null || {
    info "Installation du module python3 websockets..."
    pip3 install websockets --quiet
  }
}

# Retourne la réponse / code de fermeture WebSocket via Python
ws_close_code() {
  local url="$1"
  local msg="$2"
  python3 - <<PYEOF
import asyncio, sys
try:
    import websockets
except ImportError:
    print("NO_WEBSOCKETS")
    sys.exit(0)

async def run():
    try:
        async with websockets.connect("$url", open_timeout=5) as ws:
            await ws.send('''$msg''')
            try:
                resp = await asyncio.wait_for(ws.recv(), timeout=3)
                print("RECV:" + str(resp))
            except asyncio.TimeoutError:
                print("TIMEOUT")
    except websockets.exceptions.InvalidStatusCode as e:
        print("HTTP_ERROR:" + str(e.status_code))
    except websockets.exceptions.ConnectionClosedError as e:
        print("CLOSED:" + str(e.code))
    except Exception as e:
        print("ERROR:" + str(e))

asyncio.run(run())
PYEOF
}
