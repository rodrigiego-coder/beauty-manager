# Ops - Beauty Manager Runbook

Guia operacional para deploy e manutenção do sistema.

## Fonte da Verdade

**VPS Hostinger (Ubuntu 22.04)**:
- **Serviço systemd**: `beauty-manager-api`
- **Proxy reverso**: nginx
- **Domínio**: https://app.agendasalaopro.com.br

> **IMPORTANTE**: Não usar PM2. Systemd é a única fonte da verdade para gerenciamento do processo.

## Estrutura

```
ops/
├── deploy-api-safe.sh  # Deploy completo (pull + restart + rollback hint)
├── restart-api-safe.sh # Restart com health check
├── smoke-api.sh        # Smoke test (LOCAL + NGINX)
└── README.md           # Este arquivo
```

## Deploy Checklist

### 1. Pré-Deploy (máquina local)

```bash
# Verificar branch e status
git status
git log --oneline -5

# Rodar builds localmente
cd apps/api && npm run build
cd apps/web && npm run build

# Rodar testes
npm test
```

### 2. Deploy API (fonte da verdade)

**Fluxo correto**: Build no Windows -> Push -> Pull no VPS -> Restart

> **IMPORTANTE**: O build da API (`npm run build`) deve ser feito **no Windows antes do push**.
> O VPS apenas faz pull + restart. Isso evita instalar devDependencies no servidor.

```bash
# Conectar no VPS
ssh root@72.61.131.18

# Ir para o diretório do projeto
cd /var/www/beauty-manager

# Deploy completo (cria restore point, pull, restart, valida healthz)
sudo bash ops/deploy-api-safe.sh

# (Opcional) Smoke test adicional
./ops/smoke-api.sh
```

**O que `deploy-api-safe.sh` faz:**
1. Valida que está no repositório correto
2. Cria tag de restore point: `vps-restore-YYYYMMDD-HHMM`
3. `git fetch --all --prune`
4. `git pull --ff-only`
5. Chama `restart-api-safe.sh` (que valida healthz)
6. Imprime instrução de rollback

**Rollback manual (se necessário):**
```bash
git reset --hard vps-restore-YYYYMMDD-HHMM
sudo bash ops/restart-api-safe.sh
```

> **NOTA**: O `smoke-api.sh` pode falhar temporariamente após restart enquanto a API sobe.
> O `restart-api-safe.sh` já aguarda o healthz ficar 200 antes de retornar.

### 3. Deploy Web (no VPS)

```bash
# Build
cd apps/web && npm run build

# Copiar dist para nginx
sudo cp -r dist/* /var/www/beauty-manager-web/

# Verificar nginx
sudo nginx -t && sudo systemctl reload nginx
```

## Comandos Úteis

### Logs

```bash
# Logs da API (tempo real)
sudo journalctl -u beauty-manager-api -f

# Últimas 100 linhas
sudo journalctl -u beauty-manager-api -n 100 --no-pager

# Logs de hoje
sudo journalctl -u beauty-manager-api --since today
```

### Systemd

```bash
# Status
sudo systemctl status beauty-manager-api

# Restart
sudo systemctl restart beauty-manager-api

# Stop
sudo systemctl stop beauty-manager-api

# Enable on boot
sudo systemctl enable beauty-manager-api

# Ver unit file
sudo systemctl cat beauty-manager-api
```

### Nginx

```bash
# Status
sudo systemctl status nginx

# Testar configuração
sudo nginx -t

# Reload (sem downtime)
sudo systemctl reload nginx

# Ver config do site
cat /etc/nginx/sites-enabled/beauty-manager
```

### Database

```bash
# Verificar conexão
psql -h localhost -U postgres -d beauty_manager -c "SELECT 1"

# Backup (FORA do repo!)
pg_dump -h localhost -U postgres beauty_manager > /root/backups/backup_$(date +%Y%m%d).sql
```

> **IMPORTANTE**: Nunca criar pastas de backup dentro do repositório no VPS. Usar `/root/backups/` ou outro diretório fora do repo.

## Troubleshooting

### API não responde

1. Verificar se serviço está rodando:
   ```bash
   sudo systemctl status beauty-manager-api
   ```

2. Verificar logs:
   ```bash
   sudo journalctl -u beauty-manager-api -n 80 --no-pager
   ```

3. Verificar porta:
   ```bash
   ss -tlnp | grep 3000
   ```

4. Testar healthz local:
   ```bash
   curl -v http://127.0.0.1:3000/healthz
   ```

5. Testar healthz via nginx:
   ```bash
   curl -v https://app.agendasalaopro.com.br/api/healthz
   ```

### Erro 401 em rotas protegidas

1. Verificar se está enviando token:
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://127.0.0.1:3000/users/me
   ```

2. Verificar validade do token (JWT decode)

3. Verificar variáveis JWT no .env:
   ```
   JWT_SECRET=...
   JWT_EXPIRES_IN=...
   ```

### Erro de conexão com banco

1. Verificar PostgreSQL:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verificar DATABASE_URL no .env

3. Testar conexão:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1"
   ```

### Nginx retorna 502 Bad Gateway

1. API está rodando?
   ```bash
   sudo systemctl status beauty-manager-api
   ```

2. API está ouvindo na porta correta?
   ```bash
   ss -tlnp | grep 3000
   ```

3. Verificar logs do nginx:
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   ```

### Memory leak / Alta CPU

1. Verificar consumo:
   ```bash
   htop -p $(pgrep -f "node.*api")
   ```

2. Verificar heap:
   ```bash
   # Adicionar ao start da API
   node --max-old-space-size=512 dist/main.js
   ```

3. Restart preventivo:
   ```bash
   ./ops/restart-api-safe.sh
   ```

## Variáveis de Ambiente

Arquivo `.env` na raiz de `apps/api/` (não commitar!):

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/beauty_manager

# JWT
JWT_SECRET=sua-chave-secreta
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d

# Swagger (opcional)
ENABLE_SWAGGER=false
SWAGGER_USER=admin
SWAGGER_PASSWORD=senha-forte

# API
PORT=3000
NODE_ENV=production
```

## Arquitetura de Produção

```
[Internet]
    │
    ▼
[Nginx :443]  ─────► /api/* ────► [Node :3000] beauty-manager-api
    │
    └────────► /* (static) ────► /var/www/beauty-manager-web/
```

## Contatos

- **Repositório**: github.com/rodrigiego-coder/beauty-manager
