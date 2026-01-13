# Nginx + SSL Configuration for agendasalaopro.com.br

## Domains Served

- `app.agendasalaopro.com.br` (primary)
- `agendasalaopro.com.br`
- `www.agendasalaopro.com.br`

## Active Nginx Site (VPS)

- **Enabled (symlink)**: `/etc/nginx/sites-enabled/beauty-manager`
- **Source file**: `/etc/nginx/sites-available/beauty-manager`

> Regra: em `/etc/nginx/sites-enabled/` deve existir apenas o symlink do site ativo.
> Não deixar arquivos extras como `.save`/backups ali, pois podem causar `conflicting server name`
> e comportamento imprevisível.

## Server Block (sanitized / reference)

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
