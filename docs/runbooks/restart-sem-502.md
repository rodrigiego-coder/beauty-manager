# Runbook: Restart da API sem 502 para o Usuário

## Contexto

Ao reiniciar o serviço `beauty-manager-api`, o Nginx atua como proxy reverso e detecta que o backend está indisponível. Em vez de retornar um erro genérico 502/503, configuramos o Nginx para retornar uma resposta estruturada que permite ao frontend fazer retry automático.

## Como Funciona

### 1. Nginx (Produção)

Quando o backend está offline, o Nginx retorna:

```http
HTTP/1.1 503 Service Unavailable
Retry-After: 5
Content-Type: application/json

{"status":"starting","service":"beauty-manager-api"}
```

### 2. Frontend (React)

O interceptor axios no frontend detecta:
- Status 503
- Body com `status === "starting"`

E automaticamente:
1. Aguarda o tempo do header `Retry-After` (default 5s)
2. Refaz a requisição (até 6 tentativas, ~30s total)
3. Mostra banner discreto ao usuário: "Atualizando sistema..."
4. Se todas tentativas falharem, mostra mensagem amigável

## Procedimento de Restart

### Via systemctl (Recomendado)

```bash
# Restart graceful do serviço
sudo systemctl restart beauty-manager-api

# Verificar status
sudo systemctl status beauty-manager-api

# Verificar logs se necessário
sudo journalctl -u beauty-manager-api -f --lines=50
```

### Deploy com Git Pull

```bash
cd /var/www/beauty-manager

# Pull das mudanças
git pull origin main

# Instalar dependências (se package.json mudou)
npm install

# Build da API
cd apps/api && npm run build && cd ../..

# Restart do serviço
sudo systemctl restart beauty-manager-api
```

## Verificação

### Testar se a API está respondendo

```bash
curl -s http://localhost:3000/api/health | jq
```

Resposta esperada:
```json
{"status":"ok","timestamp":"..."}
```

### Testar comportamento 503

Com a API parada, o Nginx deve retornar:
```bash
curl -i http://localhost/api/health
```

Resposta esperada:
```http
HTTP/1.1 503 Service Unavailable
Retry-After: 5
Content-Type: application/json

{"status":"starting","service":"beauty-manager-api"}
```

## Configuração do Nginx

A configuração relevante fica em `/etc/nginx/sites-available/beauty-manager`:

```nginx
upstream api_backend {
    server 127.0.0.1:3000;
}

# Página de erro customizada para 502/503
error_page 502 503 =503 @api_starting;

location @api_starting {
    default_type application/json;
    add_header Retry-After 5 always;
    return 503 '{"status":"starting","service":"beauty-manager-api"}';
}
```

## Troubleshooting

### API não inicia

1. Verificar logs: `journalctl -u beauty-manager-api -n 100`
2. Verificar variáveis de ambiente: `/var/www/beauty-manager/apps/api/.env`
3. Verificar conexão com banco: `psql -U beauty_manager -h localhost -d beauty_manager`

### Frontend não faz retry

1. Verificar console do browser para erros
2. Confirmar que response body contém `{"status":"starting",...}`
3. Verificar header `Retry-After`

### Nginx não retorna 503 customizado

1. Verificar configuração: `sudo nginx -t`
2. Recarregar configuração: `sudo nginx -s reload`
3. Verificar se error_page está no location correto

## Rollback

Se a nova versão da API apresentar problemas:

```bash
# Ver commits recentes
git log --oneline -10

# Reverter para commit anterior
git checkout <commit-hash> -- apps/api/

# Rebuild e restart
cd apps/api && npm run build && cd ../..
sudo systemctl restart beauty-manager-api
```

## Contato

- Responsável: Equipe de Desenvolvimento
- Escalação: Via canal de suporte interno
