# Smoke Test: Log de Atividades de Comandas
# Testa os 10 cenarios criticos do log de atividades

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SMOKE TEST: ACTIVITY LOG (10 CENARIOS)" -ForegroundColor Cyan
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
    Write-Host "  AVISO: Nenhum produto encontrado" -ForegroundColor Yellow
    $testProduct = $null
} else {
    $testProduct = $productsResult.Data[0]
    Write-Host "  Produto: $($testProduct.name)" -ForegroundColor Gray
}

# Buscar cliente
$clientsResult = Invoke-API -Method GET -Endpoint "/clients" -Headers $headers
if (-not $clientsResult.Success -or $clientsResult.Data.Count -eq 0) {
    Write-Host "  AVISO: Nenhum cliente encontrado" -ForegroundColor Yellow
    $testClient = $null
} else {
    $testClient = $clientsResult.Data[0]
    Write-Host "  Cliente: $($testClient.name)" -ForegroundColor Gray
}

# ============================================
# TESTES
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  EXECUTANDO TESTES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Criar comanda base para testes
Write-Host "`n[SETUP] Criando comanda para testes..." -ForegroundColor Yellow
$cmdBody = @{}
if ($testClient) { $cmdBody.clientId = $testClient.id }

$cmdResult = Invoke-API -Method POST -Endpoint "/commands" -Headers $headers -Body $cmdBody
if (-not $cmdResult.Success) {
    Write-Host "  ERRO: Nao conseguiu criar comanda - $($cmdResult.Error)" -ForegroundColor Red
    exit 1
}
$cmdId = $cmdResult.Data.id
$cardNumber = $cmdResult.Data.cardNumber
Write-Host "  Comanda criada: $cardNumber (ID: $cmdId)" -ForegroundColor Green

# Funcao para verificar evento no log
function Test-EventExists {
    param (
        [string]$CommandId,
        [string]$EventType,
        [string]$ExpectedField = $null,
        [string]$ExpectedValue = $null
    )

    $eventsResult = Invoke-API -Method GET -Endpoint "/commands/$CommandId/events" -Headers $headers
    if (-not $eventsResult.Success) {
        return $false
    }

    $events = $eventsResult.Data
    foreach ($event in $events) {
        if ($event.eventType -eq $EventType) {
            # Verificar campo especifico se solicitado
            if ($ExpectedField -and $event.metadata) {
                $value = $event.metadata.$ExpectedField
                if ($value -and ($null -eq $ExpectedValue -or $value -eq $ExpectedValue)) {
                    return $true
                }
            } elseif (-not $ExpectedField) {
                return $true
            }
        }
    }
    return $false
}

# T1: OPENED - Evento de abertura registrado
Write-Host "`n[T1] Evento OPENED registrado com cardNumber..." -ForegroundColor Yellow
if (Test-EventExists -CommandId $cmdId -EventType "OPENED" -ExpectedField "cardNumber") {
    Write-Host "  PASSOU: OPENED com cardNumber no metadata" -ForegroundColor Green
    $results["T1"] = $true
} else {
    Write-Host "  FALHOU: OPENED sem cardNumber" -ForegroundColor Red
    $results["T1"] = $false
}

# T2: CLIENT_LINKED - Vincular cliente
if ($testClient) {
    Write-Host "`n[T2] Evento CLIENT_LINKED com clientName..." -ForegroundColor Yellow
    # Se a comanda ja foi criada com cliente, o evento ja existe
    if (Test-EventExists -CommandId $cmdId -EventType "CLIENT_LINKED" -ExpectedField "clientName") {
        Write-Host "  PASSOU: CLIENT_LINKED com clientName" -ForegroundColor Green
        $results["T2"] = $true
    } else {
        # Tenta vincular novamente
        $linkResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/link-client" -Headers $headers -Body @{ clientId = $testClient.id }
        Start-Sleep -Milliseconds 500
        if (Test-EventExists -CommandId $cmdId -EventType "CLIENT_LINKED" -ExpectedField "clientName") {
            Write-Host "  PASSOU: CLIENT_LINKED com clientName" -ForegroundColor Green
            $results["T2"] = $true
        } else {
            Write-Host "  FALHOU: CLIENT_LINKED sem clientName" -ForegroundColor Red
            $results["T2"] = $false
        }
    }
} else {
    Write-Host "`n[T2] PULADO: Sem cliente de teste" -ForegroundColor Yellow
    $results["T2"] = $null
}

# T3: ITEM_ADDED - Adicionar servico
Write-Host "`n[T3] Evento ITEM_ADDED (SERVICE) com description/quantity/totalPrice..." -ForegroundColor Yellow
$serviceResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/items" -Headers $headers -Body @{
    type = "SERVICE"
    description = "Corte Masculino Teste"
    quantity = 1
    unitPrice = 50.00
}

if ($serviceResult.Success) {
    Start-Sleep -Milliseconds 500
    if (Test-EventExists -CommandId $cmdId -EventType "ITEM_ADDED" -ExpectedField "description") {
        Write-Host "  PASSOU: ITEM_ADDED com description" -ForegroundColor Green
        $results["T3"] = $true
    } else {
        Write-Host "  FALHOU: ITEM_ADDED sem description" -ForegroundColor Red
        $results["T3"] = $false
    }
} else {
    Write-Host "  FALHOU: Erro ao adicionar servico - $($serviceResult.Error)" -ForegroundColor Red
    $results["T3"] = $false
}

# T4: ITEM_ADDED - Adicionar produto (se disponivel)
if ($testProduct -and $testClient) {
    Write-Host "`n[T4] Evento ITEM_ADDED (PRODUCT) com type=PRODUCT..." -ForegroundColor Yellow
    $productResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/items" -Headers $headers -Body @{
        type = "PRODUCT"
        description = $testProduct.name
        quantity = 1
        unitPrice = [decimal]$testProduct.salePrice
        referenceId = $testProduct.id.ToString()
    }

    if ($productResult.Success) {
        Start-Sleep -Milliseconds 500
        if (Test-EventExists -CommandId $cmdId -EventType "ITEM_ADDED" -ExpectedField "type" -ExpectedValue "PRODUCT") {
            Write-Host "  PASSOU: ITEM_ADDED com type=PRODUCT" -ForegroundColor Green
            $results["T4"] = $true
        } else {
            Write-Host "  FALHOU: ITEM_ADDED sem type=PRODUCT" -ForegroundColor Red
            $results["T4"] = $false
        }
    } else {
        Write-Host "  FALHOU: Erro ao adicionar produto - $($productResult.Error)" -ForegroundColor Red
        $results["T4"] = $false
    }
} else {
    Write-Host "`n[T4] PULADO: Sem produto ou cliente de teste" -ForegroundColor Yellow
    $results["T4"] = $null
}

# T5: DISCOUNT_APPLIED - Aplicar desconto
Write-Host "`n[T5] Evento DISCOUNT_APPLIED com amount/reason..." -ForegroundColor Yellow
$discountResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/discount" -Headers $headers -Body @{
    discountAmount = 5.00
    reason = "Desconto de teste"
}

if ($discountResult.Success) {
    Start-Sleep -Milliseconds 500
    if (Test-EventExists -CommandId $cmdId -EventType "DISCOUNT_APPLIED" -ExpectedField "amount") {
        Write-Host "  PASSOU: DISCOUNT_APPLIED com amount" -ForegroundColor Green
        $results["T5"] = $true
    } else {
        Write-Host "  FALHOU: DISCOUNT_APPLIED sem amount" -ForegroundColor Red
        $results["T5"] = $false
    }
} else {
    Write-Host "  FALHOU: Erro ao aplicar desconto - $($discountResult.Error)" -ForegroundColor Red
    $results["T5"] = $false
}

# T6: SERVICE_CLOSED - Encerrar servicos
Write-Host "`n[T6] Evento SERVICE_CLOSED com totalNet..." -ForegroundColor Yellow
$closeServiceResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/close-service" -Headers $headers -Body @{}

if ($closeServiceResult.Success) {
    Start-Sleep -Milliseconds 500
    if (Test-EventExists -CommandId $cmdId -EventType "SERVICE_CLOSED" -ExpectedField "totalNet") {
        Write-Host "  PASSOU: SERVICE_CLOSED com totalNet" -ForegroundColor Green
        $results["T6"] = $true
    } else {
        Write-Host "  FALHOU: SERVICE_CLOSED sem totalNet" -ForegroundColor Red
        $results["T6"] = $false
    }
} else {
    Write-Host "  FALHOU: Erro ao encerrar servicos - $($closeServiceResult.Error)" -ForegroundColor Red
    $results["T6"] = $false
}

# T7: PAYMENT_ADDED - Registrar pagamento
Write-Host "`n[T7] Evento PAYMENT_ADDED com grossAmount..." -ForegroundColor Yellow

# Buscar metodos de pagamento
$methodsResult = Invoke-API -Method GET -Endpoint "/payment-methods" -Headers $headers
$paymentMethodId = $null
if ($methodsResult.Success -and $methodsResult.Data.Count -gt 0) {
    $paymentMethodId = $methodsResult.Data[0].id
}

$paymentBody = @{ amount = 30.00 }
if ($paymentMethodId) { $paymentBody.paymentMethodId = $paymentMethodId }

$paymentResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/payments" -Headers $headers -Body $paymentBody

if ($paymentResult.Success) {
    Start-Sleep -Milliseconds 500
    if (Test-EventExists -CommandId $cmdId -EventType "PAYMENT_ADDED" -ExpectedField "grossAmount") {
        Write-Host "  PASSOU: PAYMENT_ADDED com grossAmount" -ForegroundColor Green
        $results["T7"] = $true
    } else {
        Write-Host "  FALHOU: PAYMENT_ADDED sem grossAmount" -ForegroundColor Red
        $results["T7"] = $false
    }
} else {
    Write-Host "  FALHOU: Erro ao registrar pagamento - $($paymentResult.Error)" -ForegroundColor Red
    $results["T7"] = $false
}

# T8: actorName - Verificar que todos eventos tem actorName
Write-Host "`n[T8] Todos eventos tem actorName (WHO)..." -ForegroundColor Yellow
$eventsResult = Invoke-API -Method GET -Endpoint "/commands/$cmdId/events" -Headers $headers
if ($eventsResult.Success) {
    $allHaveActor = $true
    foreach ($event in $eventsResult.Data) {
        if (-not $event.actorName) {
            $allHaveActor = $false
            Write-Host "    Evento $($event.eventType) sem actorName" -ForegroundColor Yellow
        }
    }
    if ($allHaveActor) {
        Write-Host "  PASSOU: Todos eventos tem actorName" -ForegroundColor Green
        $results["T8"] = $true
    } else {
        Write-Host "  FALHOU: Alguns eventos sem actorName" -ForegroundColor Red
        $results["T8"] = $false
    }
} else {
    Write-Host "  FALHOU: Erro ao buscar eventos" -ForegroundColor Red
    $results["T8"] = $false
}

# T9: metadata - Verificar que eventos tem metadata nao-vazio
Write-Host "`n[T9] Eventos tem metadata com detalhes..." -ForegroundColor Yellow
if ($eventsResult.Success) {
    $eventsWithMetadata = 0
    foreach ($event in $eventsResult.Data) {
        if ($event.metadata -and ($event.metadata | Get-Member -MemberType NoteProperty).Count -gt 0) {
            $eventsWithMetadata++
        }
    }
    $totalEvents = $eventsResult.Data.Count
    $percentage = [math]::Round(($eventsWithMetadata / $totalEvents) * 100, 0)
    if ($percentage -ge 80) {
        Write-Host "  PASSOU: $percentage% eventos com metadata ($eventsWithMetadata/$totalEvents)" -ForegroundColor Green
        $results["T9"] = $true
    } else {
        Write-Host "  FALHOU: Apenas $percentage% eventos com metadata" -ForegroundColor Red
        $results["T9"] = $false
    }
} else {
    $results["T9"] = $false
}

# T10: STATUS_CHANGED - Cancelar comanda e verificar evento
Write-Host "`n[T10] Evento STATUS_CHANGED (cancelamento) com reason..." -ForegroundColor Yellow
$cancelResult = Invoke-API -Method POST -Endpoint "/commands/$cmdId/cancel" -Headers $headers -Body @{
    reason = "Teste de smoke test"
}

if ($cancelResult.Success) {
    Start-Sleep -Milliseconds 500
    if (Test-EventExists -CommandId $cmdId -EventType "STATUS_CHANGED" -ExpectedField "reason") {
        Write-Host "  PASSOU: STATUS_CHANGED com reason" -ForegroundColor Green
        $results["T10"] = $true
    } else {
        Write-Host "  FALHOU: STATUS_CHANGED sem reason" -ForegroundColor Red
        $results["T10"] = $false
    }
} else {
    Write-Host "  FALHOU: Erro ao cancelar - $($cancelResult.Error)" -ForegroundColor Red
    $results["T10"] = $false
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

# Mostrar resumo dos eventos
Write-Host "`n[DEBUG] Eventos registrados na comanda $cardNumber :" -ForegroundColor Cyan
$finalEventsResult = Invoke-API -Method GET -Endpoint "/commands/$cmdId/events" -Headers $headers
if ($finalEventsResult.Success) {
    foreach ($event in $finalEventsResult.Data) {
        $metaKeys = if ($event.metadata) { ($event.metadata | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name) -join ", " } else { "(vazio)" }
        Write-Host "  - $($event.eventType) por $($event.actorName): [$metaKeys]" -ForegroundColor Gray
    }
}

if ($failed -eq 0) {
    Write-Host "`nTODOS OS TESTES PASSARAM!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nALGUNS TESTES FALHARAM!" -ForegroundColor Red
    exit 1
}
