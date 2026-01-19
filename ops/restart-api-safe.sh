#!/usr/bin/env bash
# ops/restart-api-safe.sh - Restart seguro da API com verificação de health
# Uso: ./restart-api-safe.sh [SERVICE_NAME] [MAX_WAIT]
# Exemplo: ./restart-api-safe.sh beauty-api 60

set -euo pipefail

SERVICE_NAME="${1:-beauty-api}"
MAX_WAIT="${2:-60}"
HEALTH_URL="http://localhost:3000/healthz"
CHECK_INTERVAL=2

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
  echo -e "${YELLOW}[INFO]${NC} $(date '+%H:%M:%S') $1"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $(date '+%H:%M:%S') $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $(date '+%H:%M:%S') $1"
}

# Verificar se está rodando como root ou com sudo
check_permissions() {
  if [ "$EUID" -ne 0 ] && ! groups | grep -q sudo; then
    log_error "Este script precisa de permissoes sudo"
    exit 1
  fi
}

# Verificar status do serviço
check_service_status() {
  if systemctl is-active --quiet "$SERVICE_NAME"; then
    return 0
  else
    return 1
  fi
}

# Aguardar healthz retornar 200
wait_for_health() {
  local elapsed=0

  log_info "Aguardando API ficar healthy..."

  while [ $elapsed -lt "$MAX_WAIT" ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$HEALTH_URL" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
      log_success "API healthy apos ${elapsed}s"
      return 0
    fi

    sleep "$CHECK_INTERVAL"
    elapsed=$((elapsed + CHECK_INTERVAL))
    echo -n "."
  done

  echo ""
  log_error "Timeout: API nao ficou healthy em ${MAX_WAIT}s"
  return 1
}

# Main
main() {
  echo "========================================"
  echo "  RESTART SEGURO - $SERVICE_NAME"
  echo "========================================"
  echo ""

  # 1. Verificar permissões
  log_info "Verificando permissoes..."

  # 2. Verificar status atual
  log_info "Verificando status atual do servico..."
  if check_service_status; then
    log_success "Servico $SERVICE_NAME esta rodando"
  else
    log_info "Servico $SERVICE_NAME nao esta rodando"
  fi

  # 3. Fazer restart
  log_info "Reiniciando $SERVICE_NAME..."
  if sudo systemctl restart "$SERVICE_NAME"; then
    log_success "Comando de restart enviado"
  else
    log_error "Falha ao enviar comando de restart"
    exit 1
  fi

  # 4. Aguardar serviço subir no systemd
  sleep 2
  if check_service_status; then
    log_success "Servico iniciado no systemd"
  else
    log_error "Servico falhou ao iniciar"
    sudo journalctl -u "$SERVICE_NAME" --no-pager -n 20
    exit 1
  fi

  # 5. Aguardar health check
  if wait_for_health; then
    log_success "Restart concluido com sucesso!"
  else
    log_error "API nao respondeu ao health check"
    log_info "Verificando logs..."
    sudo journalctl -u "$SERVICE_NAME" --no-pager -n 30
    exit 1
  fi

  echo ""
  echo "========================================"
  log_success "Deploy finalizado com sucesso"
  echo "========================================"
}

main "$@"
