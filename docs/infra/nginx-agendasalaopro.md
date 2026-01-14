# Nginx + SSL Configuration for agendasalaopro.com.br

## 1. Visao Geral

- **Vhost (config):** `/etc/nginx/sites-available/beauty-manager`
- **Symlink ativo:** `/etc/nginx/sites-enabled/beauty-manager`
- **Inspecionar config efetiva:**
  ```bash
  nginx -T | grep -n "beauty-manager"
  nginx -T | sed -n '/upstream beauty_manager_api {/,/}/p'
  ```

## 2. Domains Served

- `app.agendasalaopro.com.br` (primary)
- `agendasalaopro.com.br`
- `www.agendasalaopro.com.br`

## 3. Active Nginx Site (VPS)

- **Enabled (symlink)**: `/etc/nginx/sites-enabled/beauty-manager`
- **Source file**: `/etc/nginx/sites-available/beauty-manager`

> Regra: em `/etc/nginx/sites-enabled/` deve existir apenas o symlink do site ativo.
> Não deixar arquivos extras como `.save`/backups ali, pois podem causar `conflicting server name`
> e comportamento imprevisível.

## 4. Upstream API

Bloco correto (apenas 1 servidor):

```nginx
upstream beauty_manager_api {
    server 127.0.0.1:3000 max_fails=0 fail_timeout=0;
    keepalive 32;
}
```

> **ATENCAO:** Upstream duplicado (2 linhas `server` identicas) ja causou confusao e deve ser evitado.
> Foi corrigido em 2026-01-14.

## 5. Procedimentos Operacionais

```bash
# Validar configuracao (SEMPRE antes de reload)
sudo nginx -t

# Recarregar sem derrubar conexoes
sudo systemctl reload nginx

# Checar status
sudo systemctl status nginx --no-pager | head -n 20
```

## 6. Rollback

Sempre criar backup com timestamp antes de editar:

```bash
sudo cp /etc/nginx/sites-available/beauty-manager /root/nginx-backup.beauty-manager.$(date +%F_%H%M%S)
```

Exemplo de rollback (usando backup do incidente 2026-01-14):

```bash
sudo cp /root/nginx-backup.beauty-manager.2026-01-14_151930 /etc/nginx/sites-available/beauty-manager
sudo nginx -t && sudo systemctl reload nginx
```

## 7. Incidente 2026-01-14 (Registro)

## Healthcheck (monitoramento)

O endpoint público de healthcheck (sem autenticação) é:

- URL (via proxy): `https://app.agendasalaopro.com.br/api/healthz`
- Resposta esperada: `HTTP 200` com `{"status":"ok"}`

### Teste rápido (VPS ou qualquer máquina)

```bash
curl -s -o /dev/null -w "HTTP=%{http_code}\n" "https://app.agendasalaopro.com.br/api/healthz"

- **Sintoma:** HTTP 502 em `/api/auth/login` e outros endpoints.
- **Causa raiz:** Restarts manuais do servico `beauty-manager-api` durante manutencao de banco de dados (operacoes `DROP SCHEMA`). Durante os ~2-8s entre stop e start, nginx nao conseguia conectar ao upstream (porta 3000 sem listener).
- **Problema paralelo:** Upstream duplicado no nginx (2 linhas `server` identicas) — corrigido.
- **Evidencia:** Logs nginx com erro 111 (Connection refused); journalctl com 5 restarts entre 12:30 e 13:48 UTC.
- **Correcao:** Removida linha duplicada do upstream; reload do nginx; servico estavel desde 13:48:27 UTC.

## 8. Checklist Rapido (Evitar 502 em Manutencao)

- [ ] Preferir `reload` do nginx (nao `restart`)
- [ ] Se precisar reiniciar API, fazer em janela de manutencao
- [ ] Validar upstream/porta 3000 antes: `ss -tlnp | grep 3000`
- [ ] Smoke test apos mudancas: `curl -s -o /dev/null -w "%{http_code}" https://app.agendasalaopro.com.br/api/auth/login -X POST -H "Content-Type: application/json" -d '{}'` (400/401 = OK; 502 = problema)

---

## 9. Server Block (sanitized / reference)

> Este bloco é referência/documentação. A configuração real deve ser editada em arquivo e validada com `nginx -t`.

```nginx
server {
    listen 443 ssl;
    server_name app.agendasalaopro.com.br
                agendasalaopro.com.br
                www.agendasalaopro.com.br;

    root /var/www/beauty-manager/apps/web/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # API PROXY - same-origin (strip /api prefix -> backend routes are /auth, /public, etc.)
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;  # barra no final => REMOVE o prefixo /api
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # AUTH PROXY
    location /auth/ {
        proxy_pass http://127.0.0.1:3000/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # PUBLIC BOOKING PROXY
    location /public/ {
        proxy_pass http://127.0.0.1:3000/public/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WEBHOOK PROXY
    location /webhook/ {
        proxy_pass http://127.0.0.1:3000/webhook/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # AUTOMATION PROXY
    location /automation/ {
        proxy_pass http://127.0.0.1:3000/automation/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets - long cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # SSL managed by Certbot (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/app.agendasalaopro.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.agendasalaopro.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name app.agendasalaopro.com.br agendasalaopro.com.br www.agendasalaopro.com.br;
    return 301 https://$host$request_uri;
}

## Healthcheck (monitoramento)

O endpoint público de healthcheck (sem autenticação) é:

- URL (via proxy): `https://app.agendasalaopro.com.br/api/healthz`
- Resposta esperada: `HTTP 200` com `{"status":"ok"}`

### Teste rápido (VPS ou qualquer máquina)

```bash
curl -s -o /dev/null -w "HTTP=%{http_code}\n" "https://app.agendasalaopro.com.br/api/healthz"



```
