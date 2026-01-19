#!/usr/bin/env bash
# ops/smoke-api.sh - Smoke test para API Beauty Manager
# Testa tanto LOCAL (direto na API) quanto NGINX (via proxy reverso)
# Uso: ./smoke-api.sh

set -euo pipefail

# ============================================
# CONFIGURAÇÃO
# ============================================
LOCAL_URL="http://127.0.0.1:3000"
NGINX_URL="https://app.agendasalaopro.com.br/api"
TIMEOUT=5
PASSED=0
FAILED=0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((++PASSED))
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((++FAILED))
}

log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

log_section() {
  echo ""
  echo -e "${CYAN}>>> $1${NC}"
}

# ============================================
# TESTES LOCAL (direto na API porta 3000)
# ============================================
test_local_healthz() {
  log_info "LOCAL: Testando /healthz..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$LOCAL_URL/healthz" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    log_pass "LOCAL /healthz => 200"
  else
    log_fail "LOCAL /healthz => $HTTP_CODE (esperado 200)"
  fi
}

test_local_auth_guard() {
  log_info "LOCAL: Testando auth guard (sem token)..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$LOCAL_URL/users/me" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "401" ]; then
    log_pass "LOCAL /users/me sem token => 401"
  else
    log_fail "LOCAL /users/me sem token => $HTTP_CODE (esperado 401)"
  fi
}

# ============================================
# TESTES NGINX (via proxy reverso)
# ============================================
test_nginx_healthz() {
  log_info "NGINX: Testando /healthz..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$NGINX_URL/healthz" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    log_pass "NGINX /api/healthz => 200"
  else
    log_fail "NGINX /api/healthz => $HTTP_CODE (esperado 200)"
  fi
}

test_nginx_auth_guard() {
  log_info "NGINX: Testando auth guard (sem token)..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$NGINX_URL/users/me" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "401" ]; then
    log_pass "NGINX /api/users/me sem token => 401"
  else
    log_fail "NGINX /api/users/me sem token => $HTTP_CODE (esperado 401)"
  fi
}

# ============================================
# TESTE DE CONECTIVIDADE JSON
# ============================================
test_json_response() {
  log_info "LOCAL: Testando Content-Type JSON..."
  CONTENT_TYPE=$(curl -s -I --max-time "$TIMEOUT" "$LOCAL_URL/healthz" 2>/dev/null | grep -i "content-type" | head -1 || echo "")

  if echo "$CONTENT_TYPE" | grep -qi "application/json"; then
    log_pass "API retorna Content-Type JSON"
  else
    log_fail "API nao retorna JSON: $CONTENT_TYPE"
  fi
}

# ============================================
# EXECUÇÃO
# ============================================
echo "========================================"
echo "  SMOKE TEST - Beauty Manager API"
echo "========================================"

log_section "Testes LOCAL ($LOCAL_URL)"
test_local_healthz
test_local_auth_guard
test_json_response

log_section "Testes NGINX ($NGINX_URL)"
test_nginx_healthz
test_nginx_auth_guard

echo ""
echo "========================================"
echo -e "  Resultado: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "========================================"

# Exit code baseado em falhas
if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

exit 0
