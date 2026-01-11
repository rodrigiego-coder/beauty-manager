# Test script for booking flow
$baseUrl = "http://localhost:3000/public/booking/salao-camila-sanches"
$phone = "11999887766"

Write-Host "=== TESTE COMPLETO DO FLUXO DE AGENDAMENTO ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get salon info
Write-Host "1. Buscando informacoes do salao..." -ForegroundColor Yellow
try {
    $salonInfo = Invoke-RestMethod -Uri "$baseUrl/info" -Method GET
    Write-Host "   Salao: $($salonInfo.salonName)" -ForegroundColor Green
    Write-Host "   Verificacao de telefone: $($salonInfo.requirePhoneVerification)" -ForegroundColor Green
} catch {
    Write-Host "   ERRO: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get professionals
Write-Host ""
Write-Host "2. Buscando profissionais..." -ForegroundColor Yellow
try {
    $professionals = Invoke-RestMethod -Uri "$baseUrl/professionals" -Method GET
    if ($professionals.Count -gt 0) {
        $professional = $professionals[0]
        Write-Host "   Profissional: $($professional.name) (ID: $($professional.id))" -ForegroundColor Green
    } else {
        Write-Host "   Nenhum profissional encontrado" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ERRO: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Get services
Write-Host ""
Write-Host "3. Buscando servicos..." -ForegroundColor Yellow
try {
    $services = Invoke-RestMethod -Uri "$baseUrl/services" -Method GET
    if ($services.Count -gt 0) {
        $service = $services[0]
        Write-Host "   Servico: $($service.name) (ID: $($service.id))" -ForegroundColor Green
    } else {
        Write-Host "   Nenhum servico encontrado" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ERRO: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Send OTP
Write-Host ""
Write-Host "4. Enviando OTP para $phone..." -ForegroundColor Yellow
$otpBody = @{
    phone = $phone
    type = "PHONE_VERIFICATION"
} | ConvertTo-Json

try {
    $otpResult = Invoke-RestMethod -Uri "$baseUrl/otp/send" -Method POST -Body $otpBody -ContentType "application/json"
    Write-Host "   $($otpResult.message)" -ForegroundColor Green
    Write-Host "   Expira em: $($otpResult.expiresIn) segundos" -ForegroundColor Green
} catch {
    Write-Host "   ERRO: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Get OTP code from database
Write-Host ""
Write-Host "5. Buscando codigo OTP no banco..." -ForegroundColor Yellow
Start-Sleep -Seconds 2  # Wait for DB
try {
    $dbQuery = @"
SELECT code FROM otp_codes
WHERE phone = '$phone'
AND type = 'PHONE_VERIFICATION'
AND used_at IS NULL
ORDER BY created_at DESC
LIMIT 1;
"@
    $env:PGPASSWORD = "beauty_secret_2025"
    $otpCode = & psql -h localhost -U beauty_admin -d beauty_manager -t -c $dbQuery 2>$null
    $otpCode = $otpCode.Trim()

    if ($otpCode) {
        Write-Host "   Codigo OTP: $otpCode" -ForegroundColor Green
    } else {
        Write-Host "   Codigo nao encontrado, digite manualmente:" -ForegroundColor Yellow
        $otpCode = Read-Host "   Codigo"
    }
} catch {
    Write-Host "   Nao foi possivel buscar automaticamente." -ForegroundColor Yellow
    $otpCode = Read-Host "   Digite o codigo OTP recebido"
}

# Step 6: Verify OTP
Write-Host ""
Write-Host "6. Verificando OTP..." -ForegroundColor Yellow
$verifyBody = @{
    phone = $phone
    code = $otpCode
    type = "PHONE_VERIFICATION"
} | ConvertTo-Json

try {
    $verifyResult = Invoke-RestMethod -Uri "$baseUrl/otp/verify" -Method POST -Body $verifyBody -ContentType "application/json"
    Write-Host "   Valido: $($verifyResult.valid)" -ForegroundColor Green
    Write-Host "   $($verifyResult.message)" -ForegroundColor Green
} catch {
    Write-Host "   ERRO: $_" -ForegroundColor Red
    exit 1
}

# Step 7: Confirm booking
Write-Host ""
Write-Host "7. Confirmando agendamento..." -ForegroundColor Yellow
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$confirmBody = @{
    professionalId = $professional.id
    serviceId = $service.id
    date = $tomorrow
    time = "10:00"
    clientPhone = $phone
    clientName = "Cliente Teste"
    clientEmail = "teste@teste.com"
    notes = "Agendamento de teste via script"
    acceptedTerms = $true
} | ConvertTo-Json

Write-Host "   Dados:" -ForegroundColor Gray
Write-Host "   - Profissional: $($professional.id)" -ForegroundColor Gray
Write-Host "   - Servico: $($service.id)" -ForegroundColor Gray
Write-Host "   - Data: $tomorrow" -ForegroundColor Gray
Write-Host "   - Horario: 10:00" -ForegroundColor Gray

try {
    $booking = Invoke-RestMethod -Uri "$baseUrl/confirm" -Method POST -Body $confirmBody -ContentType "application/json"
    Write-Host ""
    Write-Host "   AGENDAMENTO CONFIRMADO!" -ForegroundColor Green
    Write-Host "   ID: $($booking.appointmentId)" -ForegroundColor Green
    Write-Host "   Profissional: $($booking.professionalName)" -ForegroundColor Green
    Write-Host "   Servico: $($booking.serviceName)" -ForegroundColor Green
    Write-Host "   Data: $($booking.date)" -ForegroundColor Green
    Write-Host "   Horario: $($booking.time)" -ForegroundColor Green
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   ERRO: $($errorDetails.message)" -ForegroundColor Red
    Write-Host "   Status: $($errorDetails.statusCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TESTE FINALIZADO ===" -ForegroundColor Cyan
