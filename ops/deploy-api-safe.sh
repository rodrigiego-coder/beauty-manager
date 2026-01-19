#!/usr/bin/env bash
# ops/deploy-api-safe.sh - Deploy seguro da API no VPS
# Uso: sudo bash ops/deploy-api-safe.sh
#
# O que faz:
# 1. Cria tag de restore point
# 2. git fetch + pull --ff-only
# 3. Chama restart-api-safe.sh (que valida healthz)
# 4. Imprime instrução de rollback
#
# IMPORTANTE: Build é feito no Windows ANTES do push. Não roda build no VPS.

set -euo pipefail

# ============================================
# CONFIGURAÇÃO
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
RESTART_SCRIPT="$SCRIPT_DIR/restart-api-safe.sh"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
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

log_section() {
  echo ""
  echo -e "${CYAN}>>> $1${NC}"
}

# ============================================
# VALIDAÇÕES
# ============================================
validate_repo() {
  log_info "Validando repositorio..."

  if [ ! -f "$RESTART_SCRIPT" ]; then
    log_error "Arquivo ops/restart-api-safe.sh nao encontrado!"
    log_error "Certifique-se de estar no diretorio correto do repo."
    exit 1
  fi

  if [ ! -d "$REPO_ROOT/.git" ]; then
    log_error "Diretorio .git nao encontrado!"
    exit 1
  fi

  log_success "Repositorio validado"
}

# ============================================
# RESTORE POINT
# ============================================
create_restore_point() {
  local TAG_NAME="vps-restore-$(date '+%Y%m%d-%H%M')"

  log_info "Criando restore point: $TAG_NAME"

  cd "$REPO_ROOT"

  # Criar tag local
  if git tag -a "$TAG_NAME" -m "Restore point antes do deploy $(date '+%Y-%m-%d %H:%M')"; then
    log_success "Tag criada: $TAG_NAME"
    echo "$TAG_NAME"
  else
    log_error "Falha ao criar tag de restore point"
    exit 1
  fi
}

# ============================================
# GIT OPERATIONS
# ============================================
git_fetch_pull() {
  log_info "Executando git fetch..."
  cd "$REPO_ROOT"

  if git fetch --all --prune; then
    log_success "Fetch concluido"
  else
    log_error "Falha no git fetch"
    exit 1
  fi

  log_info "Executando git pull --ff-only..."

  if git pull --ff-only; then
    log_success "Pull concluido"
  else
    log_error "Falha no git pull --ff-only"
    log_error "Pode haver conflitos ou a branch local divergiu."
    log_error "Verifique manualmente com: git status"
    exit 1
  fi
}

# ============================================
# RESTART API
# ============================================
restart_api() {
  log_info "Chamando restart-api-safe.sh..."

  if sudo bash "$RESTART_SCRIPT"; then
    log_success "API reiniciada com sucesso"
  else
    log_error "Falha ao reiniciar API"
    exit 1
  fi
}

# ============================================
# PRINT SUMMARY
# ============================================
print_summary() {
  local RESTORE_TAG="$1"
  local CURRENT_BRANCH
  local CURRENT_COMMIT

  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  CURRENT_COMMIT=$(git rev-parse --short HEAD)

  echo ""
  echo "========================================"
  echo -e "${GREEN}  DEPLOY CONCLUIDO COM SUCESSO${NC}"
  echo "========================================"
  echo ""
  echo -e "  Branch:  ${CYAN}$CURRENT_BRANCH${NC}"
  echo -e "  Commit:  ${CYAN}$CURRENT_COMMIT${NC}"
  echo -e "  Restore: ${YELLOW}$RESTORE_TAG${NC}"
  echo ""
  echo "========================================"
  echo -e "${YELLOW}  ROLLBACK (se necessario):${NC}"
  echo "========================================"
  echo ""
  echo "  1) git reset --hard $RESTORE_TAG"
  echo "  2) sudo bash ops/restart-api-safe.sh"
  echo ""
  echo "========================================"
}

# ============================================
# MAIN
# ============================================
main() {
  echo "========================================"
  echo "  DEPLOY API SAFE - Beauty Manager"
  echo "========================================"

  log_section "Validacao"
  validate_repo

  log_section "Restore Point"
  RESTORE_TAG=$(create_restore_point)

  log_section "Git Fetch + Pull"
  git_fetch_pull

  log_section "Restart API"
  restart_api

  print_summary "$RESTORE_TAG"
}

main "$@"
