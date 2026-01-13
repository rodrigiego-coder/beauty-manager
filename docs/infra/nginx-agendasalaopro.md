# Nginx + SSL Configuration for agendasalaopro.com.br

## Domains Served

- `app.agendasalaopro.com.br` (primary)
- `agendasalaopro.com.br`
- `www.agendasalaopro.com.br`

## Server Block (sanitized)

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

    # API PROXY - same-origin (strips /api prefix)
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Other API routes (auth, public, webhook, automation)
    location /auth/ {
        proxy_pass http://127.0.0.1:3000/auth/;
        # ... same headers
    }

    location /public/ {
        proxy_pass http://127.0.0.1:3000/public/;
        # ... same headers
    }

    location /webhook/ {
        proxy_pass http://127.0.0.1:3000/webhook/;
        # ... same headers
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

    # SSL managed by Certbot
    ssl_certificate /etc/letsencrypt/live/app.agendasalaopro.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.agendasalaopro.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP to HTTPS redirect (auto-configured by Certbot)
server {
    listen 80;
    server_name app.agendasalaopro.com.br agendasalaopro.com.br www.agendasalaopro.com.br;
    return 301 https://$host$request_uri;
}
```

## SSL Certificate

- **Provider**: Let's Encrypt (free)
- **Tool**: Certbot with nginx plugin
- **Auto-renewal**: Enabled via systemd timer (`certbot.timer`)
- **Expiration**: 90 days (auto-renews ~30 days before expiry)

### Commands

```bash
# Issue certificate for domains
certbot --nginx -d app.agendasalaopro.com.br -d agendasalaopro.com.br -d www.agendasalaopro.com.br

# Test renewal
certbot renew --dry-run

# Check certificate status
certbot certificates
```

## API CORS Configuration

The NestJS API (`apps/api/src/main.ts`) allows these origins:

- `https://app.agendasalaopro.com.br`
- `https://agendasalaopro.com.br`
- `https://www.agendasalaopro.com.br`
- `http://localhost:5173` (dev)

## Frontend Configuration

The frontend (`apps/web/src/services/api.ts`) uses:

- **Production**: `/api` (relative, same-origin)
- **Development**: `http://localhost:3000/api`

This ensures API calls go to the same domain, avoiding CORS preflight issues.
