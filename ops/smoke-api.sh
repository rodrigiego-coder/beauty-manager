#!/usr/bin/env bash
# ops/smoke-api.sh - Smoke test para API Beauty Manager
# Uso: ./smoke-api.sh [BASE_URL]
# Exemplo: ./smoke-api.sh http://localhost:3000

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
TIMEOUT=5
PASSED=0
FAILED=0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((PASSED++))
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((FAILED++))
}

log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

# Test 1: Health check endpoint
test_healthz() {
  log_info "Testando /healthz..."

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL/healthz" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    log_pass "/healthz retornou 200"
  else
    log_fail "/healthz retornou $HTTP_CODE (esperado 200)"
  fi
}

# Test 2: Auth guard - deve retornar 401 sem token
test_auth_guard() {
  log_info "Testando auth guard (sem token)..."

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL/users/me" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "401" ]; then
    log_pass "/users/me sem token retornou 401"
  else
    log_fail "/users/me sem token retornou $HTTP_CODE (esperado 401)"
  fi
}

# Test 3: Rota pública deve funcionar sem auth
test_public_route() {
  log_info "Testando rota publica..."

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$BASE_URL/public/salon/test-slug/availability" 2>/dev/null || echo "000")

  # 404 é aceitável (slug não existe), mas não deve ser 401/403
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    log_pass "Rota publica acessivel (HTTP $HTTP_CODE)"
  elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    log_fail "Rota publica bloqueada por auth (HTTP $HTTP_CODE)"
  else
    log_fail "Rota publica retornou $HTTP_CODE"
  fi
}

# Test 4: Verificar se API responde JSON
test_json_response() {
  log_info "Testando Content-Type JSON..."

  CONTENT_TYPE=$(curl -s -I --max-time "$TIMEOUT" "$BASE_URL/healthz" 2>/dev/null | grep -i "content-type" | head -1 || echo "")

  if echo "$CONTENT_TYPE" | grep -qi "application/json"; then
    log_pass "API retorna Content-Type JSON"
  else
    log_fail "API nao retorna JSON: $CONTENT_TYPE"
  fi
}

# Executar testes
echo "========================================"
echo "  SMOKE TEST - Beauty Manager API"
echo "  URL: $BASE_URL"
echo "========================================"
echo ""

test_healthz
test_auth_guard
test_public_route
test_json_response

echo ""
echo "========================================"
echo -e "  Resultado: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "========================================"

# Exit code baseado em falhas
if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

exit 0
