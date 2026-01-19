#!/usr/bin/env bash
# ops/triage-api.sh - Coleta evidencias para diagnostico rapido
# Uso: sudo bash ops/triage-api.sh
#
# IMPORTANTE: Este script NAO expoe secrets (.env, tokens, senhas).
# Saida segura para colar em chat/ticket.

set -uo pipefail

# ============================================
# CONFIGURACAO
# ============================================
SERVICE="beauty-manager-api"
LOCAL_HEALTHZ="http://127.0.0.1:3000/healthz"
NGINX_HEALTHZ="https://app.agendasalaopro.com.br/api/healthz"
LOG_LINES=120

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

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
systemctl is-active "$SERVICE" 2>/dev/null || echo "UNKNOWN"
echo ""
echo "--- systemctl status (resumo) ---"
systemctl status "$SERVICE" --no-pager -l 2>/dev/null | head -20 || echo "Falha ao obter status"

section "JOURNAL LOGS (ultimas $LOG_LINES linhas)"
journalctl -u "$SERVICE" --no-pager -n "$LOG_LINES" 2>/dev/null || echo "Falha ao obter logs"

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
nginx -t 2>&1 || echo "Falha ou nginx nao instalado"

section "MEMORIA (free -h)"
free -h 2>/dev/null || echo "Comando free nao disponivel"

section "DISCO (df -h)"
df -h 2>/dev/null | grep -E '^/|Filesystem' || echo "Comando df nao disponivel"

section "RESUMO"
echo ""
echo "  Service:      $SERVICE"
echo "  is-active:    $(systemctl is-active "$SERVICE" 2>/dev/null || echo 'UNKNOWN')"
echo "  Listener:     $(ss -ltnp 2>/dev/null | grep -q ':3000' && echo 'OK' || echo 'NO')"
echo "  Healthz Local: $HTTP_LOCAL"
echo "  Healthz Nginx: $HTTP_NGINX"
echo ""
echo -e "${YELLOW}Cole este output completo no chat para diagnostico.${NC}"
echo ""
