#!/bin/bash
# deploy-prod-artifacts.sh
# Script de deploy para Beauty Manager VPS
# Executa backup, swap de dist, restart e validacao com rollback automatico
#
# Uso: ./deploy-prod-artifacts.sh
# Espera arquivos em /tmp/: dist-api.tgz, dist-web.tgz, BUILD_TIMESTAMP, BUILD_SHA

set -euo pipefail

# === CONFIGURACAO ===
DEPLOY_PATH="/var/www/beauty-manager"
BACKUP_PATH="/var/www/beauty-manager-backups"
SERVICE_NAME="beauty-manager-api"
HEALTHZ_URL="https://app.agendasalaopro.com.br/api/healthz"
AUTH_URL="https://app.agendasalaopro.com.br/api/auth/login"
MAX_WAIT_SECONDS=30

# === CORES PARA OUTPUT ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# === VARIAVEIS DE ESTADO ===
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_PATH}/${TIMESTAMP}"
ROLLBACK_NEEDED=false

# === FUNCOES ===

check_prerequisites() {
    log_info "Verificando pre-requisitos..."

    # Arquivos de artefato
    for file in /tmp/dist-api.tgz /tmp/dist-web.tgz; do
        if [[ ! -f "$file" ]]; then
            log_error "Arquivo nao encontrado: $file"
            exit 1
        fi
    done

       # Servico existe (unit file)
    if ! systemctl cat "${SERVICE_NAME}.service" >/dev/null 2>&1; then
        log_error "Servico ${SERVICE_NAME}.service nao encontrado"
        systemctl list-unit-files --type=service --no-pager | grep -i "$SERVICE_NAME" || true
        exit 1
    fi


    log_info "Pre-requisitos OK"
}

create_backup() {
    log_info "Criando backup em $BACKUP_DIR..."

    mkdir -p "$BACKUP_DIR"

    # Backup do dist da API
    if [[ -d "${DEPLOY_PATH}/apps/api/dist" ]]; then
        tar -czf "${BACKUP_DIR}/dist-api.tgz" -C "${DEPLOY_PATH}/apps/api" dist
        log_info "Backup API: ${BACKUP_DIR}/dist-api.tgz"
    else
        log_warn "API dist nao existe, pulando backup"
    fi

    # Backup do dist do Web
    if [[ -d "${DEPLOY_PATH}/apps/web/dist" ]]; then
        tar -czf "${BACKUP_DIR}/dist-web.tgz" -C "${DEPLOY_PATH}/apps/web" dist
        log_info "Backup Web: ${BACKUP_DIR}/dist-web.tgz"
    else
        log_warn "Web dist nao existe, pulando backup"
    fi

    # Metadados
    if [[ -f /tmp/BUILD_SHA ]]; then
        cp /tmp/BUILD_SHA "${BACKUP_DIR}/DEPLOYED_SHA"
    fi
    echo "$TIMESTAMP" > "${BACKUP_DIR}/BACKUP_TIMESTAMP"

    log_info "Backup concluido"
}

deploy_artifacts() {
    log_info "Extraindo artefatos..."

    # Remover dist antigo e extrair novo (API)
    rm -rf "${DEPLOY_PATH}/apps/api/dist"
    tar -xzf /tmp/dist-api.tgz -C "${DEPLOY_PATH}/apps/api"
    log_info "API dist atualizado"

    # Remover dist antigo e extrair novo (Web)
    rm -rf "${DEPLOY_PATH}/apps/web/dist"
    tar -xzf /tmp/dist-web.tgz -C "${DEPLOY_PATH}/apps/web"
    log_info "Web dist atualizado"

    # Copiar metadados
    if [[ -f /tmp/BUILD_SHA ]]; then
        cp /tmp/BUILD_SHA "${DEPLOY_PATH}/CURRENT_BUILD_SHA"
    fi
    if [[ -f /tmp/BUILD_TIMESTAMP ]]; then
        cp /tmp/BUILD_TIMESTAMP "${DEPLOY_PATH}/CURRENT_BUILD_TIMESTAMP"
    fi

    log_info "Artefatos extraidos"
}

restart_service() {
    log_info "Reiniciando $SERVICE_NAME..."
    sudo systemctl restart "$SERVICE_NAME"
    log_info "Servico reiniciado"
}

wait_for_healthy() {
    log_info "Aguardando servico ficar saudavel (max ${MAX_WAIT_SECONDS}s)..."

    local elapsed=0
    local interval=2

    while [[ $elapsed -lt $MAX_WAIT_SECONDS ]]; do
        local status=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTHZ_URL" 2>/dev/null || echo "000")

        if [[ "$status" == "200" ]]; then
            log_info "Healthz OK (${elapsed}s)"
            return 0
        fi

        sleep $interval
        elapsed=$((elapsed + interval))
        echo -n "."
    done

    echo ""
    log_error "Timeout: servico nao respondeu em ${MAX_WAIT_SECONDS}s"
    return 1
}

validate_deploy() {
    log_info "Validando deploy..."

    # Healthz
    local healthz=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTHZ_URL")
    if [[ "$healthz" != "200" ]]; then
        log_error "Healthz falhou: esperado 200, recebido $healthz"
        return 1
    fi
    log_info "Healthz: $healthz OK"

    # Auth (400 = endpoint funcionando, apenas falta payload)
    local auth=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$AUTH_URL" \
        -H "Content-Type: application/json" -d '{}')
    if [[ "$auth" != "400" ]]; then
        log_error "Auth falhou: esperado 400, recebido $auth"
        return 1
    fi
    log_info "Auth: $auth OK"

    log_info "Validacao concluida com sucesso"
    return 0
}

rollback() {
    log_error "Iniciando ROLLBACK..."

    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_error "Backup dir nao encontrado: $BACKUP_DIR"
        log_error "ROLLBACK MANUAL NECESSARIO!"
        exit 1
    fi

    # Restaurar API
    if [[ -f "${BACKUP_DIR}/dist-api.tgz" ]]; then
        rm -rf "${DEPLOY_PATH}/apps/api/dist"
        tar -xzf "${BACKUP_DIR}/dist-api.tgz" -C "${DEPLOY_PATH}/apps/api"
        log_info "API dist restaurado"
    fi

    # Restaurar Web
    if [[ -f "${BACKUP_DIR}/dist-web.tgz" ]]; then
        rm -rf "${DEPLOY_PATH}/apps/web/dist"
        tar -xzf "${BACKUP_DIR}/dist-web.tgz" -C "${DEPLOY_PATH}/apps/web"
        log_info "Web dist restaurado"
    fi

    # Restart
    sudo systemctl restart "$SERVICE_NAME"
    log_info "Servico reiniciado"

    # Validar rollback
    sleep 15
    if wait_for_healthy; then
        log_warn "ROLLBACK CONCLUIDO - sistema restaurado"
    else
        log_error "ROLLBACK FALHOU - INTERVENCAO MANUAL NECESSARIA!"
        exit 1
    fi
}

cleanup_old_backups() {
    log_info "Limpando backups antigos (mantendo ultimos 5)..."

    if [[ -d "$BACKUP_PATH" ]]; then
        local count=$(ls -1d "${BACKUP_PATH}"/20* 2>/dev/null | wc -l)
        if [[ $count -gt 5 ]]; then
            ls -1d "${BACKUP_PATH}"/20* | head -n -5 | xargs rm -rf
            log_info "Backups antigos removidos"
        fi
    fi
}

cleanup_tmp() {
    log_info "Limpando arquivos temporarios..."
    rm -f /tmp/dist-api.tgz /tmp/dist-web.tgz /tmp/BUILD_TIMESTAMP /tmp/BUILD_SHA
    rm -f /tmp/deploy-prod-artifacts.sh
}

# === MAIN ===

main() {
    echo "========================================"
    echo "  Beauty Manager - Deploy de Artefatos"
    echo "  Timestamp: $TIMESTAMP"
    echo "========================================"

    check_prerequisites
    create_backup
    deploy_artifacts
    restart_service

    if wait_for_healthy && validate_deploy; then
        log_info "========================================="
        log_info "  DEPLOY CONCLUIDO COM SUCESSO"
        log_info "========================================="
        cleanup_old_backups
        cleanup_tmp
        exit 0
    else
        log_error "Deploy falhou, iniciando rollback..."
        rollback
        cleanup_tmp
        exit 1
    fi
}

main "$@"
