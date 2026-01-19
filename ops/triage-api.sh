#!/usr/bin/env bash
# ops/triage-api.sh - Coleta evidencias para diagnostico rapido
# Uso: sudo bash ops/triage-api.sh [--short|--full]
#   --short: pula fallback de 120 linhas (menos ruido)
#   --full:  mostra tudo (padrao)
#
# IMPORTANTE: Este script NAO expoe secrets (.env, tokens, senhas).
# Saida segura para colar em chat/ticket.

set -uo pipefail

# ============================================
# PARSE ARGS
# ============================================
MODE="full"
for arg in "$@"; do
  case "$arg" in
    --short) MODE="short" ;;
    --full)  MODE="full" ;;
  esac
done

# ============================================
# CONFIGURACAO
# ============================================
SERVICE="beauty-manager-api"
LOCAL_HEALTHZ="http://127.0.0.1:3000/healthz"
NGINX_HEALTHZ="https://app.agendasalaopro.com.br/api/healthz"
LOG_LINES=120
JOURNAL_SINCE_MIN="30min"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================
# HELPERS
# ============================================
have() {
  command -v "$1" >/dev/null 2>&1
}

safe() {
  local label="$1"
  shift
  if "$@" 2>&1; then
    return 0
  else
    echo -e "${RED}Falha: $label${NC}"
    return 0  # nao interrompe o script
  fi
}

section() {
  echo ""
  echo -e "${CYAN}================================================================================${NC}"
  echo -e "${CYAN}>>> $1${NC}"
  echo -e "${CYAN}================================================================================${NC}"
}

# ============================================
# COLETA DE EVIDENCIAS
# ============================================

section "DATA/HORA E HOSTNAME"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "Hostname:  $(hostname)"
echo "Uptime:    $(uptime -p 2>/dev/null || uptime)"

section "GIT INFO"
if [ -d .git ]; then
  echo "Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
  echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
  echo "Status: $(git status --porcelain 2>/dev/null | wc -l) arquivo(s) modificado(s)"
else
  echo "Nao esta em um repositorio git"
fi

section "SYSTEMD STATUS"
echo "Service: $SERVICE"
echo -n "is-active: "
safe "systemctl is-active" systemctl is-active "$SERVICE" || true
echo ""
echo "--- systemctl status (resumo) ---"
safe "systemctl status" systemctl status "$SERVICE" --no-pager -l 2>/dev/null | head -20

echo ""
echo "--- systemctl show (sinais de falha) ---"
systemctl show "$SERVICE" --property=ActiveState,SubState,Result,ExecMainStatus,ExecMainCode,NRestarts,MainPID,ActiveEnterTimestamp 2>/dev/null || echo "Falha ao obter propriedades"

section "JOURNAL LOGS (warnings+errors since $JOURNAL_SINCE_MIN)"
if have journalctl; then
  echo "--- Warnings/Errors recentes ---"
  journalctl -u "$SERVICE" --since "-${JOURNAL_SINCE_MIN}" -p warning..emerg --no-pager 2>/dev/null || echo "Nenhum warning/error recente"
  if [ "$MODE" = "full" ]; then
    echo ""
    echo "--- Fallback: ultimas $LOG_LINES linhas ---"
    journalctl -u "$SERVICE" --no-pager -n "$LOG_LINES" 2>/dev/null || echo "Falha ao obter logs"
  else
    echo ""
    echo -e "${YELLOW}(--short: fallback de $LOG_LINES linhas omitido)${NC}"
  fi
else
  echo -e "${RED}journalctl nao disponivel${NC}"
fi

section "LISTENER PORTA 3000"
if ss -ltnp 2>/dev/null | grep -q ':3000'; then
  ss -ltnp 2>/dev/null | grep ':3000'
else
  echo -e "${RED}NO_LISTENER_3000${NC}"
fi

section "HEALTHZ LOCAL (127.0.0.1:3000)"
HTTP_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$LOCAL_HEALTHZ" 2>/dev/null || echo "000")
if [ "$HTTP_LOCAL" = "200" ]; then
  echo -e "${GREEN}HTTP $HTTP_LOCAL OK${NC}"
else
  echo -e "${RED}HTTP $HTTP_LOCAL FAIL${NC}"
fi

section "HEALTHZ NGINX (app.agendasalaopro.com.br)"
HTTP_NGINX=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$NGINX_HEALTHZ" 2>/dev/null || echo "000")
if [ "$HTTP_NGINX" = "200" ]; then
  echo -e "${GREEN}HTTP $HTTP_NGINX OK${NC}"
else
  echo -e "${RED}HTTP $HTTP_NGINX FAIL${NC}"
fi

section "NGINX CONFIG TEST"
if have nginx; then
  nginx -t 2>&1 || echo "Falha no teste de config"
else
  echo -e "${YELLOW}nginx nao encontrado no PATH${NC}"
fi

section "MEMORIA (free -h)"
free -h 2>/dev/null || echo "Comando free nao disponivel"

section "DISCO (df -h)"
df -h 2>/dev/null | grep -E '^/|Filesystem' || echo "Comando df nao disponivel"

section "RESUMO"
echo ""
echo "  Mode:          $MODE"
echo "  Service:       $SERVICE"
echo "  is-active:     $(systemctl is-active "$SERVICE" 2>/dev/null || echo 'UNKNOWN')"
echo "  Listener:      $(ss -ltnp 2>/dev/null | grep -q ':3000' && echo 'OK' || echo 'NO')"
echo "  Healthz Local: $HTTP_LOCAL"
echo "  Healthz Nginx: $HTTP_NGINX"
echo "  Journal:       warnings+errors since $JOURNAL_SINCE_MIN"
echo ""
echo -e "${YELLOW}Cole este output completo no chat para diagnostico.${NC}"
echo ""
echo -e "${CYAN}--- Dica P0 (comandos uteis sem secrets) ---${NC}"
echo "  sudo systemctl restart $SERVICE"
echo "  sudo journalctl -u $SERVICE -f"
echo "  curl -v http://127.0.0.1:3000/healthz"
echo ""
