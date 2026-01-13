# Runbook de Deploy — Beauty Manager (VPS + Nginx + systemd)

## Visão geral (fonte da verdade)
- Frontend (Vite build): servido pelo Nginx a partir de:
  `/var/www/beauty-manager/apps/web/dist`
- Backend (Nest build): roda via systemd (não PM2):
  `beauty-manager-api.service` → `/usr/bin/node /var/www/beauty-manager/apps/api/dist/main.js`
- Nginx faz reverse proxy same-origin:
  - `/api/*` → proxy para `http://127.0.0.1:3000/*` stripando `/api`
  - Regra do /api: `proxy_pass http://127.0.0.1:3000/;` (barra no final = strip)

## Regras de ouro
1) Nginx se edita em arquivo, depois `nginx -t` e `systemctl reload nginx`.
2) Nunca deixar backups dentro de `/etc/nginx/sites-enabled/` (ex.: `.save`).
   Guardar backups fora (ex.: `/root/nginx-backup/`).
3) Deploy é: build local → copiar artefatos → restart.
   Nunca commitar `dist/` nem `apps/api/dist/`.

---

## 0) Pré-check (VPS)
No SSH:

```bash
systemctl status beauty-manager-api --no-pager -l
nginx -t
