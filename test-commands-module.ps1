# Smoke Test: Modulo de Comandas
# Testa os cenarios criticos do contrato de comandas

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SMOKE TEST: MODULO DE COMANDAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuracao
$API_URL = "http://localhost:3000"
$results = @{}

# Funcao auxiliar para fazer requests
function Invoke-API {
    param (
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers,
        [object]$Body = $null
    )

    try {
        $params = @{
            Uri = "$API_URL$Endpoint"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }

        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $statusCode }
    }
}

# Login
Write-Host "`n[AUTH] Fazendo login..." -ForegroundColor Yellow
$loginResult = Invoke-API -Method POST -Endpoint "/auth/login" -Headers @{} -Body @{
    email = "admin@belezza.com"
    password = "admin123"
}

if (-not $loginResult.Success) {
    Write-Host "  ERRO: Login falhou - $($loginResult.Error)" -ForegroundColor Red
    Write-Host "  Verifique se a API esta rodando e as credenciais estao corretas." -ForegroundColor Yellow
    exit 1
}

$TOKEN = $loginResult.Data.access_token
$headers = @{ "Authorization" = "Bearer $TOKEN" }
Write-Host "  Login OK" -ForegroundColor Green

# Buscar dados para testes
Write-Host "`n[SETUP] Buscando dados para testes..." -ForegroundColor Yellow

# Buscar produto
$productsResult = Invoke-API -Method GET -Endpoint "/products" -Headers $headers
if (-not $productsResult.Success -or $productsResult.Data.Count -eq 0) {
    Write-Host "  ERRO: Nenhum produto encontrado" -ForegroundColor Red
    exit 1
}
$testProduct = $productsResult.Data[0]
$productId = $testProduct.id
$productStock = $testProduct.currentStock
Write-Host "  Produto: $($testProduct.name) (ID: $productId, Estoque: $productStock)" -ForegroundColor Gray

# Buscar cliente
$clientsResult = Invoke-API -Method GET -Endpoint "/clients" -Headers $headers
if (-not $clientsResult.Success -or $clientsResult.Data.Count -eq 0) {
    Write-Host "  AVISO: Nenhum cliente encontrado, alguns testes serao pulados" -ForegroundColor Yellow
    $testClient = $null
} else {
    $testClient = $clientsResult.Data[0]
    Write-Host "  Cliente: $($testClient.name) (ID: $($testClient.id))" -ForegroundColor Gray
}

# Buscar servico
$servicesResult = Invoke-API -Method GET -Endpoint "/services" -Headers $headers
if (-not $servicesResult.Success -or $servicesResult.Data.Count -eq 0) {
    $testService = $null
} else {
    $testService = $servicesResult.Data[0]
    Write-Host "  Servico: $($testService.name)" -ForegroundColor Gray
}

# ============================================
# TESTES
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  EXECUTANDO TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# T2: Adicionar item sem cliente
Write-Host "`n[T2] Adicionar item sem cliente vinculado..." -ForegroundColor Yellow
$cmdResult = Invoke-API -Method POST -Endpoint "/commands" -Headers $headers -Body @{}
if ($cmdResult.Success) {
    $cmdId = $cmdResult.Data.id

    # Tentar adicionar item sem cliente
    $itemResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/items" -Headers $headers -Body @{
        type = "SERVICE"
        description = "Teste sem cliente"
        quantity = 1
        unitPrice = 50.00
    }

    if (-not $itemResult.Success -and $itemResult.StatusCode -eq 400) {
        Write-Host "  PASSOU: Erro 400 retornado como esperado" -ForegroundColor Green
        $results["T2"] = $true
    } else {
        Write-Host "  FALHOU: Deveria retornar erro 400" -ForegroundColor Red
        $results["T2"] = $false
    }

    # Limpa: cancela comanda
    Invoke-API -Method POST -Endpoint "/commands/$cmdId/cancel" -Headers $headers -Body @{ reason = "teste" } | Out-Null
} else {
    Write-Host "  PULADO: Nao conseguiu criar comanda" -ForegroundColor Yellow
    $results["T2"] = $null
}

# T3: Adicionar item COM cliente
if ($testClient) {
    Write-Host "`n[T3] Adicionar item COM cliente vinculado..." -ForegroundColor Yellow
    $cmdResult = Invoke-API -Method POST -Endpoint "/commands" -Headers $headers -Body @{ clientId = $testClient.id }
    if ($cmdResult.Success) {
        $cmdId = $cmdResult.Data.id

        # Adicionar PRODUCT com referenceId
        $itemResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/items" -Headers $headers -Body @{
            type = "PRODUCT"
            description = $testProduct.name
            quantity = 1
            unitPrice = [decimal]$testProduct.salePrice
            referenceId = $productId.ToString()
        }

        if ($itemResult.Success) {
            # Verificar se estoque baixou
            $prodAfter = (Invoke-API -Method GET -Endpoint "/products" -Headers $headers).Data | Where-Object { $_.id -eq $productId }
            if ($prodAfter.currentStock -eq ($productStock - 1)) {
                Write-Host "  PASSOU: Item adicionado e estoque baixou" -ForegroundColor Green
                $results["T3"] = $true
            } else {
                Write-Host "  FALHOU: Estoque nao baixou corretamente" -ForegroundColor Red
                $results["T3"] = $false
            }
        } else {
            Write-Host "  FALHOU: Erro ao adicionar item - $($itemResult.Error)" -ForegroundColor Red
            $results["T3"] = $false
        }

        # Cancela para restaurar estoque
        Invoke-API -Method POST -Endpoint "/commands/$cmdId/cancel" -Headers $headers -Body @{ reason = "teste" } | Out-Null
    }
} else {
    Write-Host "`n[T3] PULADO: Sem cliente de teste" -ForegroundColor Yellow
    $results["T3"] = $null
}

# T4: Adicionar SERVICE sem referenceId
if ($testClient) {
    Write-Host "`n[T4] Adicionar SERVICE sem referenceId..." -ForegroundColor Yellow
    $cmdResult = Invoke-API -Method POST -Endpoint "/commands" -Headers $headers -Body @{ clientId = $testClient.id }
    if ($cmdResult.Success) {
        $cmdId = $cmdResult.Data.id

        $itemResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/items" -Headers $headers -Body @{
            type = "SERVICE"
            description = "Servico Teste"
            quantity = 1
            unitPrice = 50.00
        }

        if ($itemResult.Success) {
            Write-Host "  PASSOU: SERVICE aceito sem referenceId" -ForegroundColor Green
            $results["T4"] = $true
        } else {
            Write-Host "  FALHOU: SERVICE deveria ser aceito" -ForegroundColor Red
            $results["T4"] = $false
        }

        Invoke-API -Method POST -Endpoint "/commands/$cmdId/cancel" -Headers $headers -Body @{ reason = "teste" } | Out-Null
    }
} else {
    $results["T4"] = $null
}

# T5: Adicionar PRODUCT sem referenceId
if ($testClient) {
    Write-Host "`n[T5] Adicionar PRODUCT sem referenceId (deve falhar)..." -ForegroundColor Yellow
    $cmdResult = Invoke-API -Method POST -Endpoint "/commands" -Headers $headers -Body @{ clientId = $testClient.id }
    if ($cmdResult.Success) {
        $cmdId = $cmdResult.Data.id

        $itemResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/items" -Headers $headers -Body @{
            type = "PRODUCT"
            description = "Produto sem ref"
            quantity = 1
            unitPrice = 50.00
        }

        if (-not $itemResult.Success -and $itemResult.StatusCode -eq 400) {
            Write-Host "  PASSOU: PRODUCT sem referenceId rejeitado" -ForegroundColor Green
            $results["T5"] = $true
        } else {
            Write-Host "  FALHOU: PRODUCT sem referenceId deveria ser rejeitado" -ForegroundColor Red
            $results["T5"] = $false
        }

        Invoke-API -Method POST -Endpoint "/commands/$cmdId/cancel" -Headers $headers -Body @{ reason = "teste" } | Out-Null
    }
} else {
    $results["T5"] = $null
}

# T6: Cancelar comanda com produtos (deve devolver estoque)
if ($testClient) {
    Write-Host "`n[T6] Cancelar comanda com produtos (estoque deve voltar)..." -ForegroundColor Yellow

    # Pegar estoque atual
    $stockBefore = ((Invoke-API -Method GET -Endpoint "/products" -Headers $headers).Data | Where-Object { $_.id -eq $productId }).currentStock

    # Criar comanda e adicionar produto
    $cmdResult = Invoke-API -Method POST -Endpoint "/commands" -Headers $headers -Body @{ clientId = $testClient.id }
    if ($cmdResult.Success) {
        $cmdId = $cmdResult.Data.id

        # Adicionar produto (baixa estoque)
        Invoke-API -Method POST -Endpoint "/commands/$cmdId/items" -Headers $headers -Body @{
            type = "PRODUCT"
            description = $testProduct.name
            quantity = 1
            unitPrice = [decimal]$testProduct.salePrice
            referenceId = $productId.ToString()
        } | Out-Null

        # Cancelar comanda
        Invoke-API -Method POST -Endpoint "/commands/$cmdId/cancel" -Headers $headers -Body @{ reason = "teste estoque" } | Out-Null

        # Verificar se estoque voltou
        $stockAfter = ((Invoke-API -Method GET -Endpoint "/products" -Headers $headers).Data | Where-Object { $_.id -eq $productId }).currentStock

        if ($stockAfter -eq $stockBefore) {
            Write-Host "  PASSOU: Estoque devolvido apos cancelamento ($stockBefore -> $stockAfter)" -ForegroundColor Green
            $results["T6"] = $true
        } else {
            Write-Host "  FALHOU: Estoque nao voltou ($stockBefore -> $stockAfter)" -ForegroundColor Red
            $results["T6"] = $false
        }
    }
} else {
    $results["T6"] = $null
}

# ============================================
# RESUMO
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESULTADO FINAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = 0
$failed = 0
$skipped = 0

foreach ($test in $results.Keys | Sort-Object) {
    $status = $results[$test]
    if ($status -eq $true) {
        Write-Host "  $test : PASSOU" -ForegroundColor Green
        $passed++
    } elseif ($status -eq $false) {
        Write-Host "  $test : FALHOU" -ForegroundColor Red
        $failed++
    } else {
        Write-Host "  $test : PULADO" -ForegroundColor Yellow
        $skipped++
    }
}

Write-Host "`n----------------------------------------" -ForegroundColor Gray
Write-Host "Passou: $passed | Falhou: $failed | Pulado: $skipped" -ForegroundColor White

if ($failed -eq 0) {
    Write-Host "`nTODOS OS TESTES PASSARAM!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nALGUNS TESTES FALHARAM!" -ForegroundColor Red
    exit 1
}
