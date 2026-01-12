# ==============================================================================
# Deploy Hardening - Beauty Manager
# ==============================================================================
# Executa deploy dos arquivos de hardening para a VPS
# ==============================================================================

$VPS_IP = "72.61.131.18"
$VPS_USER = "root"
$BASE_PATH = "C:\Users\RODRIGO\OneDrive\Área de Trabalho\sistema-salao\sistema-salao"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY HARDENING - Beauty Manager" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Copiar migração SQL
Write-Host "`n[1/4] Copiando migração anti-overbooking..." -ForegroundColor Yellow
scp "$BASE_PATH\apps\api\drizzle\0014_anti_overbooking_constraint.sql" "${VPS_USER}@${VPS_IP}:/var/www/beauty-manager/apps/api/drizzle/"
scp "$BASE_PATH\apps\api\drizzle\0014_test_anti_overbooking.sql" "${VPS_USER}@${VPS_IP}:/var/www/beauty-manager/apps/api/drizzle/"

# 2. Copiar configuração Nginx
Write-Host "`n[2/4] Copiando configuração Nginx..." -ForegroundColor Yellow
scp "$BASE_PATH\nginx\beauty-manager.conf" "${VPS_USER}@${VPS_IP}:/tmp/beauty-manager.conf"

# 3. Copiar script SW cleanup
Write-Host "`n[3/4] Copiando script SW cleanup..." -ForegroundColor Yellow
scp "$BASE_PATH\apps\web\public\sw_cleanup.js" "${VPS_USER}@${VPS_IP}:/var/www/beauty-manager/apps/web/dist/"

# 4. Copiar documentação
Write-Host "`n[4/4] Copiando documentação..." -ForegroundColor Yellow
scp "$BASE_PATH\docs\HARDENING_VALIDACAO.md" "${VPS_USER}@${VPS_IP}:/var/www/beauty-manager/docs/"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "ARQUIVOS COPIADOS COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nPRÓXIMOS PASSOS (executar na VPS):" -ForegroundColor Yellow
Write-Host @"

# 1. Aplicar migração SQL:
psql -U beauty_admin -d beauty_manager -f /var/www/beauty-manager/apps/api/drizzle/0014_anti_overbooking_constraint.sql

# 2. Testar constraint:
psql -U beauty_admin -d beauty_manager -f /var/www/beauty-manager/apps/api/drizzle/0014_test_anti_overbooking.sql

# 3. Instalar Nginx config:
cp /tmp/beauty-manager.conf /etc/nginx/sites-available/beauty-manager
ln -sf /etc/nginx/sites-available/beauty-manager /etc/nginx/sites-enabled/beauty-manager
nginx -t && systemctl reload nginx

# 4. Validar:
curl -I http://localhost/index.html
"@
