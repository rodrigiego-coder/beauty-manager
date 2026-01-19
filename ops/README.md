# Ops - Beauty Manager Runbook

Guia operacional para deploy e manutenção do sistema.

## Estrutura

```
ops/
├── smoke-api.sh        # Smoke test da API
├── restart-api-safe.sh # Restart com health check
└── README.md           # Este arquivo
```

## Deploy Checklist

### 1. Pré-Deploy

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

### 2. Deploy API

```bash
# No servidor
cd /path/to/sistema-salao

# Pull das mudanças
git pull origin main

# Instalar dependências (se necessário)
npm install

# Build
cd apps/api && npm run build

# Restart seguro
./ops/restart-api-safe.sh beauty-api

# Smoke test
./ops/smoke-api.sh http://localhost:3000
```

### 3. Deploy Web

```bash
# Build
cd apps/web && npm run build

# Copiar dist para nginx
sudo cp -r dist/* /var/www/beauty-manager/

# Verificar nginx
sudo nginx -t && sudo systemctl reload nginx
```

## Comandos Úteis

### Logs

```bash
# Logs da API (tempo real)
sudo journalctl -u beauty-api -f

# Últimas 100 linhas
sudo journalctl -u beauty-api -n 100 --no-pager

# Logs de hoje
sudo journalctl -u beauty-api --since today
```

### Systemd

```bash
# Status
sudo systemctl status beauty-api

# Restart
sudo systemctl restart beauty-api

# Stop
sudo systemctl stop beauty-api

# Enable on boot
sudo systemctl enable beauty-api
```

### Database

```bash
# Verificar conexão
psql -h localhost -U postgres -d beauty_manager -c "SELECT 1"

# Backup
pg_dump -h localhost -U postgres beauty_manager > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### API não responde

1. Verificar se serviço está rodando:
   ```bash
   sudo systemctl status beauty-api
   ```

2. Verificar logs:
   ```bash
   sudo journalctl -u beauty-api -n 50 --no-pager
   ```

3. Verificar porta:
   ```bash
   ss -tlnp | grep 3000
   ```

4. Testar healthz:
   ```bash
   curl -v http://localhost:3000/healthz
   ```

### Erro 401 em rotas protegidas

1. Verificar se está enviando token:
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://localhost:3000/users/me
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

Arquivo `.env` necessário na raiz de `apps/api/`:

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

## Contatos

- **Suporte técnico**: [seu-email]
- **Repositório**: [url-do-repo]
