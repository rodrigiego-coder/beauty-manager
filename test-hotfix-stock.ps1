# Smoke Test: HOTFIX + HARDENING de estoque
# Testa os cenarios criticos do contrato de itens de comanda

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SMOKE TEST: HOTFIX + HARDENING STOCK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuracao
$API_URL = "http://localhost:3000"
$DB_CONTAINER = "sistema-salao-db-1"

# Buscar token de autenticacao
Write-Host "`n[1/6] Buscando credenciais..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@belezza.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.access_token
    Write-Host "  Token obtido com sucesso" -ForegroundColor Green
} catch {
    Write-Host "  ERRO: Falha no login - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# Buscar um produto para teste
Write-Host "`n[2/6] Buscando produto para teste..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$API_URL/products" -Method GET -Headers $headers
    if ($products.Count -eq 0) {
        Write-Host "  ERRO: Nenhum produto encontrado" -ForegroundColor Red
        exit 1
    }
    $testProduct = $products[0]
    $productId = $testProduct.id
    $productName = $testProduct.name
    $productPrice = [decimal]$testProduct.salePrice
    $stockBefore = $testProduct.currentStock
    Write-Host "  Produto: $productName (ID: $productId)" -ForegroundColor Green
    Write-Host "  Estoque atual: $stockBefore" -ForegroundColor Green
} catch {
    Write-Host "  ERRO: Falha ao buscar produtos - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# TESTE 1: PRODUCT sem referenceId (deve falhar com 400)
Write-Host "`n[3/6] TESTE 1: PRODUCT sem referenceId (deve falhar 400)..." -ForegroundColor Yellow

# Primeiro criar uma comanda
try {
    $commandResponse = Invoke-RestMethod -Uri "$API_URL/commands/open" -Method POST -Headers $headers -Body "{}"
    $commandId = $commandResponse.id
    Write-Host "  Comanda criada: $commandId" -ForegroundColor Gray
} catch {
    Write-Host "  ERRO: Falha ao criar comanda - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Tentar adicionar PRODUCT sem referenceId
$itemNoRef = @{
    type = "PRODUCT"
    description = "Produto Teste Sem Ref"
    quantity = 1
    unitPrice = $productPrice
} | ConvertTo-Json

try {
    $null = Invoke-RestMethod -Uri "$API_URL/commands/$commandId/items" -Method POST -Headers $headers -Body $itemNoRef
    Write-Host "  FALHA: Deveria ter retornado erro 400!" -ForegroundColor Red
    $test1 = $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "  SUCESSO: Retornou 400 como esperado" -ForegroundColor Green
        $test1 = $true
    } else {
        Write-Host "  FALHA: Status $statusCode (esperado 400)" -ForegroundColor Red
        $test1 = $false
    }
}

# Cancelar comanda do teste 1
try {
    $null = Invoke-RestMethod -Uri "$API_URL/commands/$commandId/cancel" -Method POST -Headers $headers -Body '{"reason":"teste"}'
} catch {}

# TESTE 2: SERVICE sem referenceId (deve funcionar)
Write-Host "`n[4/6] TESTE 2: SERVICE sem referenceId (deve funcionar)..." -ForegroundColor Yellow

try {
    $commandResponse = Invoke-RestMethod -Uri "$API_URL/commands/open" -Method POST -Headers $headers -Body "{}"
    $commandId2 = $commandResponse.id
    Write-Host "  Comanda criada: $commandId2" -ForegroundColor Gray
} catch {
    Write-Host "  ERRO: Falha ao criar comanda - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$itemService = @{
    type = "SERVICE"
    description = "Servico Teste"
    quantity = 1
    unitPrice = 50.00
} | ConvertTo-Json

try {
    $null = Invoke-RestMethod -Uri "$API_URL/commands/$commandId2/items" -Method POST -Headers $headers -Body $itemService
    Write-Host "  SUCESSO: SERVICE aceito sem referenceId" -ForegroundColor Green
    $test2 = $true
} catch {
    Write-Host "  FALHA: SERVICE deveria funcionar sem referenceId" -ForegroundColor Red
    $test2 = $false
}

# Cancelar comanda do teste 2
try {
    $null = Invoke-RestMethod -Uri "$API_URL/commands/$commandId2/cancel" -Method POST -Headers $headers -Body '{"reason":"teste"}'
} catch {}

# TESTE 3: PRODUCT com referenceId (deve funcionar E baixar estoque)
Write-Host "`n[5/6] TESTE 3: PRODUCT com referenceId (deve baixar estoque)..." -ForegroundColor Yellow

try {
    $commandResponse = Invoke-RestMethod -Uri "$API_URL/commands/open" -Method POST -Headers $headers -Body "{}"
    $commandId3 = $commandResponse.id
    Write-Host "  Comanda criada: $commandId3" -ForegroundColor Gray
} catch {
    Write-Host "  ERRO: Falha ao criar comanda - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$itemProduct = @{
    type = "PRODUCT"
    description = $productName
    quantity = 1
    unitPrice = $productPrice
    referenceId = $productId.ToString()
} | ConvertTo-Json

try {
    $null = Invoke-RestMethod -Uri "$API_URL/commands/$commandId3/items" -Method POST -Headers $headers -Body $itemProduct
    Write-Host "  Item adicionado com sucesso" -ForegroundColor Green

    # Verificar se estoque baixou
    $productsAfter = Invoke-RestMethod -Uri "$API_URL/products" -Method GET -Headers $headers
    $productAfter = $productsAfter | Where-Object { $_.id -eq $productId }
    $stockAfter = $productAfter.currentStock

    if ($stockAfter -eq ($stockBefore - 1)) {
        Write-Host "  SUCESSO: Estoque baixou de $stockBefore para $stockAfter" -ForegroundColor Green
        $test3 = $true
    } else {
        Write-Host "  FALHA: Estoque era $stockBefore, agora e $stockAfter (esperado $($stockBefore - 1))" -ForegroundColor Red
        $test3 = $false
    }
} catch {
    Write-Host "  FALHA: Erro ao adicionar item - $($_.Exception.Message)" -ForegroundColor Red
    $test3 = $false
}

# Cancelar comanda do teste 3 (devolve estoque)
try {
    $null = Invoke-RestMethod -Uri "$API_URL/commands/$commandId3/cancel" -Method POST -Headers $headers -Body '{"reason":"teste"}'
} catch {}

# RESUMO
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "              RESULTADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allPassed = $test1 -and $test2 -and $test3

Write-Host "`nTESTE 1 (PRODUCT sem referenceId = 400): $(if($test1){'PASSOU'}else{'FALHOU'})" -ForegroundColor $(if($test1){'Green'}else{'Red'})
Write-Host "TESTE 2 (SERVICE sem referenceId = OK):   $(if($test2){'PASSOU'}else{'FALHOU'})" -ForegroundColor $(if($test2){'Green'}else{'Red'})
Write-Host "TESTE 3 (PRODUCT com referenceId = OK):   $(if($test3){'PASSOU'}else{'FALHOU'})" -ForegroundColor $(if($test3){'Green'}else{'Red'})

Write-Host "`n----------------------------------------" -ForegroundColor Gray
if ($allPassed) {
    Write-Host "TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "ALGUNS TESTES FALHARAM!" -ForegroundColor Red
    exit 1
}
