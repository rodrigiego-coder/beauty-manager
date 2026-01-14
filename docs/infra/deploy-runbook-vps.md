# Runbook de Deploy — Beauty Manager VPS

## A. Visao Geral

**Objetivo:** Minimizar janela de 502 durante deploy/restart no VPS.

### Paths Relevantes

| Item | Path |
|------|------|
| Repositorio | `/var/www/beauty-manager` |
| API dist | `/var/www/beauty-manager/apps/api/dist/main.js` |
| Web dist | `/var/www/beauty-manager/apps/web/dist` |
| Unit systemd | `/etc/systemd/system/beauty-manager-api.service` |
| Override | `/etc/systemd/system/beauty-manager-api.service.d/override.conf` |
| Nginx site | `/etc/nginx/sites-available/beauty-manager` |
| Nginx backup | `/root/nginx-backup/` |

### Arquitetura

- **Frontend:** Vite build servido pelo Nginx (static files)
- **Backend:** NestJS via systemd (`beauty-manager-api.service`)
- **Proxy:** Nginx faz strip de `/api/` → backend recebe sem prefixo

---

## B. Checklist Pre-Deploy

```bash
# 1. Git limpo
git status -sb

# 2. Servico saudavel
systemctl is-active beauty-manager-api

# 3. Nginx OK
sudo nginx -t

# 4. Healthcheck OK
curl -s -o /dev/null -w "%{http_code}" https://app.agendasalaopro.com.br/api/healthz

# 5. Recursos (opcional)
free -h && df -h /
```

**Esperado:** git limpo, active, syntax ok, 200, disco/memoria OK.

---

## C. Procedimento de Deploy

### Opcao 1: Deploy Rapido (Recomendada)

Quando o artefato (dist) ja existe ou foi buildado externamente:

```bash
cd /var/www/beauty-manager

# 1. Backup rapido do estado atual
git stash || true

# 2. Atualizar codigo
git fetch origin main
git reset --hard origin/main

# 3. Restart controlado
sudo systemctl restart beauty-manager-api

# 4. Aguardar boot (5s)
sleep 5

# 5. Validar
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://app.agendasalaopro.com.br/api/healthz
```

### Opcao 2: Build no VPS (Modo Memoria)

Quando precisar rebuildar no VPS (cuidado com OOM):

```bash
cd /var/www/beauty-manager

# 1. Parar servico para liberar RAM
sudo systemctl stop beauty-manager-api

# 2. Build com heap limitado
NODE_OPTIONS="--max-old-space-size=3072" npm run build:api

# 3. Reiniciar
sudo systemctl start beauty-manager-api

# 4. Aguardar boot
sleep 5

# 5. Validar
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://app.agendasalaopro.com.br/api/healthz
```

**Nota:** Durante o build (~1-3min) o servico fica offline. Preferir janela de baixo trafego.

---

## D. Pos-Deploy: Validacao

Copiar e colar no terminal:

```bash
# Status do servico (primeiras linhas)
sudo systemctl status beauty-manager-api --no-pager | head -15

# Healthcheck (esperado: 200)
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://app.agendasalaopro.com.br/api/healthz

# Proxy funcionando (esperado: 400, NAO 502)
curl -s -o /dev/null -w "auth=%{http_code}\n" -X POST https://app.agendasalaopro.com.br/api/auth/login -H "Content-Type: application/json" -d '{}'

# Logs de boot
sudo journalctl -u beauty-manager-api -n 20 --no-pager | tail -10
```

**Criterios de sucesso:**
- Status: `active (running)`
- healthz: `200`
- auth: `400` (nao 502)
- Logs: `Nest application successfully started`

---

## E. Rollback Rapido

### Cenario 1: Rollback de Nginx

```bash
# Restaurar backup
sudo cp /root/nginx-backup/beauty-manager.<TIMESTAMP> /etc/nginx/sites-available/beauty-manager

# Validar e aplicar
sudo nginx -t && sudo systemctl reload nginx
```

### Cenario 2: Rollback de Codigo

```bash
cd /var/www/beauty-manager

# Ver commits recentes
git log --oneline -5

# Voltar para commit anterior (substitua HASH)
git reset --hard <HASH_ANTERIOR>

# Restart
sudo systemctl restart beauty-manager-api

# Validar
curl -s -o /dev/null -w "healthz=%{http_code}\n" https://app.agendasalaopro.com.br/api/healthz
```

**Alternativa com revert (mantém histórico):**

```bash
git revert HEAD --no-edit
sudo systemctl restart beauty-manager-api
```

---

## F. Anti-502: Dicas Operacionais

1. **Evitar restart repetido** — cada restart = ~5s offline
2. **Preferir reload para nginx** — `reload` nao derruba conexoes, `restart` sim
3. **Janela de manutencao** — DDL pesado ou migracao em horario de baixo trafego
4. **Sempre testar healthz** — antes e depois de qualquer mudanca
5. **Backup antes de editar nginx** — `cp ... /root/nginx-backup/`

---

## Referencia Rapida

| Acao | Comando |
|------|---------|
| Status API | `systemctl status beauty-manager-api --no-pager` |
| Restart API | `sudo systemctl restart beauty-manager-api` |
| Logs API | `journalctl -u beauty-manager-api -f` |
| Nginx test | `sudo nginx -t` |
| Nginx reload | `sudo systemctl reload nginx` |
| Healthcheck | `curl -s https://app.agendasalaopro.com.br/api/healthz` |

---

*Atualizado em: 2026-01-14*
