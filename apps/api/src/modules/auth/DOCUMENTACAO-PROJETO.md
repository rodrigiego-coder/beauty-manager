# 📚 DOCUMENTAÇÃO DO PROJETO BEAUTY MANAGER

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Comandos Úteis](#comandos-úteis)
5. [Credenciais](#credenciais)
6. [Arquitetura de Autenticação](#arquitetura-de-autenticação)
7. [Banco de Dados](#banco-de-dados)
8. [Guards de Segurança](#guards-de-segurança)
9. [Problemas Comuns e Soluções](#problemas-comuns-e-soluções)
10. [Histórico de Implementações](#histórico-de-implementações)

---

## 🎯 Visão Geral

**Beauty Manager** é um sistema de gestão inteligente para salões de beleza.

| Componente | Tecnologia | Porta |
|------------|------------|-------|
| Frontend | Vite + React | 5173 |
| Backend (API) | NestJS | 3000 |
| Banco de Dados | PostgreSQL | 5432 |
| Container | Docker | - |

---

## 📁 Estrutura do Projeto
```
C:\Users\Rodrigo Viana\Desktop\sistema-salao\
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   ├── public.decorator.ts
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   ├── salon-access.guard.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── interceptors/
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   └── schema.ts       # Definição das tabelas
│   │   │   ├── modules/
│   │   │   │   ├── auth/           # Módulo de autenticação
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── users/
│   │   │   │   ├── appointments/
│   │   │   │   ├── clients/
│   │   │   │   ├── products/
│   │   │   │   ├── transactions/
│   │   │   │   └── ... (outros módulos)
│   │   │   ├── app.module.ts       # Módulo principal
│   │   │   ├── app.controller.ts
│   │   │   └── main.ts
│   │   └── package.json
│   ├── web/                    # Frontend React
│   └── mobile/                 # Mobile (futuro)
├── packages/                   # Pacotes compartilhados
├── .env                        # Variáveis de ambiente
├── .env.example
├── docker-compose.yml          # Configuração Docker
├── package.json                # Scripts do monorepo
└── DOCUMENTACAO-PROJETO.md     # Este arquivo
```

---

## ⚙️ Configuração do Ambiente

### Arquivo `.env` (raiz do projeto)
```dotenv
# DATABASE
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=beauty_admin
DATABASE_PASSWORD=beauty_secret_2025
DATABASE_NAME=beauty_manager
DATABASE_URL=postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager

# API & ENVIRONMENT
API_PORT=3000
NODE_ENV=development

# JWT SECRETS
ACCESS_TOKEN_SECRET=SEGREDO_ACESSO_FORTE_AQUI
REFRESH_TOKEN_SECRET=SEGREDO_REFRESH_FORTE_AQUI

# Web
VITE_API_URL=http://localhost:3000

# AI (Google Gemini)
GEMINI_API_KEY=sua_chave_aqui
```

---

## 💻 Comandos Úteis

### Iniciar o Projeto
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao

# Iniciar Docker (PostgreSQL)
npm run docker:up

# Iniciar API + Frontend
npm run dev

# Iniciar apenas API
npm run dev:api

# Iniciar apenas Frontend
npm run dev:web
```

### Banco de Dados
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao

# Verificar se PostgreSQL está rodando
docker ps

# Rodar migrations (criar/atualizar tabelas)
$env:DATABASE_URL = "postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager"
npm run db:push --workspace=apps/api

# Acessar o banco diretamente
docker exec -it beauty-manager-db psql -U beauty_admin -d beauty_manager
```

### Matar Processo em Porta
```powershell
# Ver qual processo usa a porta 3000
netstat -ano | findstr :3000

# Matar processo por PID
taskkill /PID <numero_do_pid> /F

# Ou usar npx
npx kill-port 3000
```

### Instalar Dependências
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao

# Instalar todas as dependências
npm install

# Instalar pacote específico na API
npm install <pacote> --workspace=apps/api

# Instalar pacote de desenvolvimento
npm install <pacote> --workspace=apps/api --save-dev
```

---

## 🔐 Credenciais

### Login do Sistema

| Campo | Valor |
|-------|-------|
| Email | `owner@salao.com` |
| Senha | `senhaforte` |
| Role | OWNER |

### Banco de Dados PostgreSQL

| Campo | Valor |
|-------|-------|
| Host | localhost |
| Porta | 5432 |
| Usuário | beauty_admin |
| Senha | beauty_secret_2025 |
| Database | beauty_manager |

### URL de Conexão
```
postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager
```

---

## 🔒 Arquitetura de Autenticação

### Fluxo de Login

1. Usuário envia email/senha para `POST /auth/login`
2. `AuthService` busca usuário por email
3. Valida senha com `bcrypt.compare()`
4. Retorna token + dados do usuário
5. Frontend armazena token e envia em requisições

### Arquivos Principais

| Arquivo | Caminho | Função |
|---------|---------|--------|
| `auth.controller.ts` | `apps/api/src/modules/auth/` | Rota POST /auth/login |
| `auth.service.ts` | `apps/api/src/modules/auth/` | Lógica de validação |
| `auth.module.ts` | `apps/api/src/modules/auth/` | Registro do módulo |
| `users.service.ts` | `apps/api/src/modules/users/` | Método findByEmail |

### Token

Atualmente usa token Base64 simples. Para produção, implementar JWT real:
```typescript
// Token atual (Base64)
const token = Buffer.from(JSON.stringify({ sub: userId, iat: Date.now() })).toString('base64');
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `salons` | Salões cadastrados |
| `users` | Usuários/profissionais |
| `clients` | Clientes do salão |
| `appointments` | Agendamentos |
| `products` | Produtos (estoque) |
| `transactions` | Movimentações financeiras |
| `notifications` | Notificações do sistema |

### Schema da Tabela Users
```typescript
// apps/api/src/database/schema.ts

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  role: userRoleEnum('role').default('STYLIST').notNull(),
  commissionRate: decimal('commission_rate').default('0.50'),
  workSchedule: json('work_schedule'),
  specialties: text('specialties'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Roles de Usuário

| Role | Descrição | Permissões |
|------|-----------|------------|
| OWNER | Proprietário | Acesso total |
| MANAGER | Gerente | Acesso administrativo |
| RECEPTIONIST | Recepcionista | Agendamentos e clientes |
| STYLIST | Profissional | Próprios agendamentos |

---

## 🛡️ Guards de Segurança

### Ordem de Execução

1. **AuthGuard** - Verifica se tem token válido
2. **RolesGuard** - Verifica permissões por role
3. **SalonAccessGuard** - Verifica acesso ao salão

### Como Usar
```typescript
// Rota pública (sem autenticação)
@Public()
@Post('login')
async login() { }

// Rota que requer autenticação
@Get('profile')
async getProfile() { }

// Rota que requer role específica
@Roles('OWNER', 'MANAGER')
@Get('reports')
async getReports() { }
```

### Arquivos dos Guards

| Arquivo | Caminho |
|---------|---------|
| `auth.guard.ts` | `apps/api/src/common/guards/` |
| `roles.guard.ts` | `apps/api/src/common/guards/` |
| `salon-access.guard.ts` | `apps/api/src/common/guards/` |

---

## 🔧 Problemas Comuns e Soluções

### 1. Erro "EADDRINUSE: address already in use"

**Causa:** Porta 3000 já está em uso

**Solução:**
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao
netstat -ano | findstr :3000
taskkill /PID <numero> /F
npm run dev
```

### 2. Erro "DATABASE_URL missing"

**Causa:** Variável de ambiente não definida

**Solução:**
```powershell
# Opção 1: Definir no PowerShell
$env:DATABASE_URL = "postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager"

# Opção 2: Verificar arquivo .env na raiz
```

### 3. Login retorna "Email ou senha inválidos"

**Causa:** Hash da senha incorreto no banco

**Solução:**
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao

# 1. Gerar novo hash
node -e "require('bcryptjs').hash('senhaforte', 10).then(h => console.log(h))"

# 2. Criar arquivo fix-password.sql com o hash
# 3. Executar:
Get-Content fix-password.sql | docker exec -i beauty-manager-db psql -U beauty_admin -d beauty_manager
```

### 4. Erro "Cannot find module"

**Causa:** Dependências não instaladas

**Solução:**
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao
npm install
```

### 5. PostgreSQL não está rodando

**Causa:** Container Docker parado

**Solução:**
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao
docker ps                  # Verificar
npm run docker:up          # Iniciar
```

---

## 📝 Histórico de Implementações

### Data: 08/12/2025

#### ✅ Módulo de Autenticação (Auth)
- Criado `auth.controller.ts` com rota POST /auth/login
- Criado `auth.service.ts` com validação bcrypt
- Criado `auth.module.ts` para registro
- Adicionado campo `passwordHash` no schema de users
- Instalado `bcryptjs` e `@types/bcryptjs`

#### ✅ Limpeza Pós-Implementação
- Removido código mock de login
- Configurado arquivo `.env` na raiz
- API lê variáveis de ambiente automaticamente

#### ✅ Guards de Segurança
- Criado `AuthGuard` para validação de token
- Registrado `AuthGuard` globalmente no `app.module.ts`
- Rota `/auth/login` marcada como `@Public()`
- `RolesGuard` e `SalonAccessGuard` já existiam

#### ✅ Seed do Banco de Dados
- Criado salão demo (ID: aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa)
- Criado usuário owner@salao.com (ID: 11111111-1111-1111-1111-111111111111)
- Senha: senhaforte (hash bcrypt)

---

## 🚀 Próximos Passos Sugeridos

1. [ ] Implementar JWT real (substituir token Base64)
2. [ ] Criar script de seed automático
3. [ ] Implementar refresh token
4. [ ] Adicionar validação de DTOs
5. [ ] Implementar testes automatizados
6. [ ] Configurar CI/CD

---

## 📞 Suporte

Para resolver problemas ou fazer alterações no sistema, consulte este documento e forneça:

1. **Erro exato** (print da tela ou mensagem)
2. **Comando executado**
3. **Pasta onde estava** ao executar
4. **O que estava tentando fazer**

---

*Última atualização: 08/12/2025*