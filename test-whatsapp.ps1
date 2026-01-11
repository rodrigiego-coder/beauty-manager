# Deletar instância antiga
Write-Host "Deletando instância antiga..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/whatsapp/disconnect/teste_novo_789" -Method Delete -TimeoutSec 15 -ErrorAction SilentlyContinue
} catch {
    Write-Host "Instância não existia ou já foi deletada" -ForegroundColor Gray
}

Write-Host "Aguardando 10 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Criar nova instância
Write-Host "Criando nova instância..." -ForegroundColor Yellow
$instance = Invoke-RestMethod -Uri "http://localhost:3000/whatsapp/create/salao_final_123" -Method Post -Body '{}' -ContentType "application/json" -TimeoutSec 15

Write-Host "Instância criada!" -ForegroundColor Green
Write-Host "   Nome: $($instance.instance.instanceName)" -ForegroundColor White
Write-Host "   Status: $($instance.instance.status)" -ForegroundColor White

Write-Host "Aguardando 30 segundos para gerar QR Code..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# Tentar pegar QR Code até 5 vezes
Write-Host "Buscando QR Code..." -ForegroundColor Yellow
for ($i = 1; $i -le 5; $i++) {
    Write-Host "   Tentativa $i/5..." -ForegroundColor Gray
    $qr = Invoke-RestMethod -Uri "http://localhost:3000/whatsapp/qrcode/salao_final_123" -Method Get -TimeoutSec 15
    
    if ($qr.count -gt 0 -and $qr.base64) {
        Write-Host "QR Code gerado com sucesso!" -ForegroundColor Green
        Write-Host "   Base64 length: $($qr.base64.Length) caracteres" -ForegroundColor White
        Write-Host ""
        Write-Host "Acesse este link para ver o QR Code:" -ForegroundColor Cyan
        Write-Host "   http://137.131.188.128:8080/instance/qrcode/salao_final_123" -ForegroundColor White
        break
    }
    
    if ($i -lt 5) {
        Write-Host "   QR Code ainda não disponível, aguardando 10 segundos..." -ForegroundColor Gray
        Start-Sleep -Seconds 10
    }
}

if ($qr.count -eq 0) {
    Write-Host "QR Code não foi gerado após 5 tentativas" -ForegroundColor Red
    Write-Host "   Verifique os logs do Evolution API" -ForegroundColor Yellow
}
