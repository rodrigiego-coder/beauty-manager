# 💇 BEAUTY MANAGER - DOCUMENTAÇÃO COMPLETA

> Sistema SaaS completo para gestão de salões de beleza

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-69%20passing-brightgreen)
![Node](https://img.shields.io/badge/node-20+-green)

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Sistema](#-arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Estrutura do Projeto](#-estrutura-do-projeto)
5. [Configuração do Ambiente](#-configuração-do-ambiente)
6. [Comandos Úteis](#-comandos-úteis)
7. [Autenticação JWT](#-autenticação-jwt)
8. [Sistema de Permissões (RBAC)](#-sistema-de-permissões-rbac)
9. [Guards de Segurança](#-guards-de-segurança)
10. [Validação de Dados (DTOs)](#-validação-de-dados-dtos)
11. [Banco de Dados](#-banco-de-dados)
12. [Sistema de Assinaturas](#-sistema-de-assinaturas)
13. [API Endpoints](#-api-endpoints)
14. [Seeds e Dados Iniciais](#-seeds-e-dados-iniciais)
15. [Testes Automatizados](#-testes-automatizados)
16. [CI/CD e Deploy](#-cicd-e-deploy)
17. [Troubleshooting](#-troubleshooting)
18. [Roadmap](#-roadmap)
19. [Histórico de Implementações](#-histórico-de-implementações)

---

## 🎯 Visão Geral

O **Beauty Manager** é uma solução SaaS completa para gestão de salões de beleza, desenvolvida com arquitetura moderna e escalável.

### Principais Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 📅 **Agenda** | Agendamento inteligente com visualização por profissional |
| 💰 **Financeiro** | Fluxo de caixa, contas a pagar/receber, relatórios |
| 📦 **Estoque** | Controle de produtos com alertas de estoque baixo |
| 👥 **Clientes** | Cadastro completo com histórico e ficha técnica |
| 👨‍💼 **Equipe** | Gestão de profissionais, horários e comissões |
| 📊 **Relatórios** | Analytics de faturamento, serviços e produtividade |
| 💳 **Assinaturas** | Sistema de planos com período de teste |

### Stack Tecnológica

| Componente | Tecnologia | Porta |
|------------|------------|-------|
| Frontend | Vite + React 18 + TypeScript | 5173 |
| Backend (API) | NestJS + Fastify | 3000 |
| Banco de Dados | PostgreSQL 16 | 5432 |
| Container | Docker | - |

---

## 🏗 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTE                                    │
│                    (Browser / Mobile App)                            │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                          │
│                         Port: 5173                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Pages      │  │  Components  │  │   Contexts   │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTP/REST
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (NestJS + Fastify)                       │
│                          Port: 3000                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      GUARDS LAYER                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐     │    │
│  │  │ AuthGuard   │─▶│ RolesGuard  │─▶│ SalonAccessGuard │     │    │
│  │  │   (JWT)     │  │   (RBAC)    │  │  (Multi-tenant)  │     │    │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      MODULES LAYER                           │    │
│  │  ┌──────┐ ┌───────┐ ┌─────────┐ ┌─────────┐ ┌────────────┐  │    │
│  │  │ Auth │ │ Users │ │ Clients │ │Products │ │Appointments│  │    │
│  │  └──────┘ └───────┘ └─────────┘ └─────────┘ └────────────┘  │    │
│  │  ┌────────────┐ ┌──────────────┐ ┌─────────────────────┐    │    │
│  │  │Transactions│ │Subscriptions │ │   Notifications     │    │    │
│  │  └────────────┘ └──────────────┘ └─────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    DATABASE LAYER                            │    │
│  │              Drizzle ORM + PostgreSQL Driver                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL 16)                         │
│                          Port: 5432                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  salons  │ │  users   │ │ clients  │ │ products │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐            │
│  │ appointments │ │ transactions │ │  subscriptions   │            │
│  └──────────────┘ └──────────────┘ └──────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### Padrões Arquiteturais

| Padrão | Descrição |
|--------|-----------|
| **Multi-tenancy** | Isolamento completo de dados por salão |
| **RBAC** | Role-Based Access Control para permissões |
| **Repository Pattern** | Abstração de acesso a dados |
| **Guard Pattern** | Proteção de rotas com camadas de segurança |
| **DTO Pattern** | Validação e transformação de dados de entrada |

---

## 🛠 Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 20+ | Runtime |
| NestJS | 10.x | Framework principal |
| Fastify | 4.x | HTTP Server (2x mais rápido que Express) |
| Drizzle ORM | Latest | Mapeamento objeto-relacional |
| PostgreSQL | 16 | Banco de dados |
| JWT | - | Autenticação stateless |
| bcrypt | - | Hash de senhas |
| class-validator | - | Validação de DTOs |
| class-transformer | - | Transformação de dados |
| Passport | - | Estratégias de autenticação |
| Jest | - | Testes automatizados |

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.x | Biblioteca UI |
| Vite | 5.x | Build tool e dev server |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 3.x | Estilização |
| Lucide Icons | - | Biblioteca de ícones |
| React Router | 6.x | Navegação SPA |
| Axios | - | Cliente HTTP |

### DevOps

| Tecnologia | Uso |
|------------|-----|
| Docker | Containerização |
| Docker Compose | Orquestração local |
| GitHub Actions | CI/CD |
| PostgreSQL Alpine | Imagem otimizada do banco |

---

## 📁 Estrutura do Projeto

```
C:\Users\Rodrigo Viana\Desktop\sistema-salao\
│
├── 📂 apps/
│   │
│   ├── 📂 api/                           # Backend NestJS
│   │   ├── 📂 src/
│   │   │   │
│   │   │   ├── 📂 common/                # Recursos compartilhados
│   │   │   │   ├── 📂 decorators/
│   │   │   │   │   ├── current-user.decorator.ts   # Extrai usuário do request
│   │   │   │   │   ├── public.decorator.ts         # Marca rotas públicas
│   │   │   │   │   ├── roles.decorator.ts          # Define roles necessárias
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── 📂 guards/
│   │   │   │   │   ├── auth.guard.ts               # Valida JWT
│   │   │   │   │   ├── roles.guard.ts              # Verifica permissões
│   │   │   │   │   ├── salon-access.guard.ts       # Multi-tenancy
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── 📂 interceptors/
│   │   │   │
│   │   │   ├── 📂 database/
│   │   │   │   ├── database.module.ts              # Configuração do módulo
│   │   │   │   └── schema.ts                       # Definição das tabelas
│   │   │   │
│   │   │   ├── 📂 modules/
│   │   │   │   │
│   │   │   │   ├── 📂 auth/                        # Autenticação
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.controller.spec.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.service.spec.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   ├── dto.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── 📂 users/                       # Usuários
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.controller.spec.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   ├── users.service.spec.ts
│   │   │   │   │   ├── users.module.ts
│   │   │   │   │   └── dto.ts
│   │   │   │   │
│   │   │   │   ├── 📂 appointments/                # Agendamentos
│   │   │   │   ├── 📂 clients/                     # Clientes
│   │   │   │   ├── 📂 products/                    # Estoque
│   │   │   │   ├── 📂 transactions/                # Financeiro
│   │   │   │   ├── 📂 subscriptions/               # Assinaturas
│   │   │   │   └── 📂 notifications/               # Notificações
│   │   │   │
│   │   │   ├── seed.ts                             # Script de seed
│   │   │   ├── app.module.ts                       # Módulo principal
│   │   │   ├── app.controller.ts
│   │   │   └── main.ts                             # Bootstrap da aplicação
│   │   │
│   │   ├── 📂 test/                                # Testes e2e
│   │   └── package.json
│   │
│   ├── 📂 web/                           # Frontend React
│   │   ├── 📂 src/
│   │   │   ├── 📂 components/                      # Componentes reutilizáveis
│   │   │   ├── 📂 contexts/                        # Contextos React
│   │   │   ├── 📂 layouts/                         # Layouts de página
│   │   │   ├── 📂 pages/                           # Páginas da aplicação
│   │   │   ├── 📂 services/                        # Serviços de API
│   │   │   ├── 📂 hooks/                           # Custom hooks
│   │   │   ├── 📂 utils/                           # Utilitários
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   │
│   │   └── package.json
│   │
│   └── 📂 mobile/                        # Mobile (futuro)
│
├── 📂 packages/                          # Pacotes compartilhados
│
├── 📂 .github/
│   └── 📂 workflows/
│       └── ci.yml                        # Pipeline CI/CD
│
├── .env                                  # Variáveis de ambiente
├── .env.example                          # Template de variáveis
├── docker-compose.yml                    # Configuração Docker
├── package.json                          # Dependências raiz
├── turbo.json                            # Configuração Turborepo
└── DOCUMENTACAO-BEAUTY-MANAGER.md        # Este arquivo
```

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 20+
- Docker Desktop
- Git
- PowerShell (Windows) ou Terminal (Linux/Mac)

### Arquivo `.env` (raiz do projeto)

```dotenv
# ══════════════════════════════════════════════════════════════════
# DATABASE
# ══════════════════════════════════════════════════════════════════
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=beauty_admin
DATABASE_PASSWORD=beauty_secret_2025
DATABASE_NAME=beauty_manager
DATABASE_URL=postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager

# ══════════════════════════════════════════════════════════════════
# API & ENVIRONMENT
# ══════════════════════════════════════════════════════════════════
API_PORT=3000
NODE_ENV=development

# ══════════════════════════════════════════════════════════════════
# JWT SECRETS (MUDE EM PRODUÇÃO!)
# ══════════════════════════════════════════════════════════════════
ACCESS_TOKEN_SECRET=SEGREDO_ACESSO_FORTE_AQUI_MUDE_EM_PRODUCAO
REFRESH_TOKEN_SECRET=SEGREDO_REFRESH_FORTE_AQUI_MUDE_EM_PRODUCAO

# ══════════════════════════════════════════════════════════════════
# FRONTEND
# ══════════════════════════════════════════════════════════════════
VITE_API_URL=http://localhost:3000

# ══════════════════════════════════════════════════════════════════
# AI (Google Gemini) - Opcional
# ══════════════════════════════════════════════════════════════════
GEMINI_API_KEY=sua_chave_aqui
```

### Credenciais do Banco de Dados

| Campo | Valor |
|-------|-------|
| Host | localhost |
| Porta | 5432 |
| Usuário | beauty_admin |
| Senha | beauty_secret_2025 |
| Database | beauty_manager |
| URL | `postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager` |

---

## 💻 Comandos Úteis

### Inicialização do Projeto

```powershell
# ══════════════════════════════════════════════════════════════════
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao
# ══════════════════════════════════════════════════════════════════

# 1. Instalar dependências
npm install

# 2. Iniciar Docker (PostgreSQL)
npm run docker:up

# 3. Rodar migrations (criar tabelas)
npm run db:push --workspace=apps/api

# 4. Popular banco com dados iniciais
npm run db:seed --workspace=apps/api

# 5. Iniciar API + Frontend
npm run dev

# Ou iniciar separadamente:
npm run dev:api      # Apenas API (porta 3000)
npm run dev:web      # Apenas Frontend (porta 5173)
```

### Banco de Dados

```powershell
# Verificar se PostgreSQL está rodando
docker ps

# Rodar migrations
npm run db:push --workspace=apps/api

# Rodar seed
npm run db:seed --workspace=apps/api

# Acessar o banco via psql
docker exec -it beauty-manager-db psql -U beauty_admin -d beauty_manager

# Parar o banco
npm run docker:down

# Reiniciar o banco (apaga dados!)
npm run docker:down
npm run docker:up
```

### Instalação de Dependências

```powershell
# Instalar pacote na API
npm install <pacote> --workspace=apps/api

# Instalar pacote de desenvolvimento
npm install <pacote> --workspace=apps/api --save-dev

# Instalar pacote no Frontend
npm install <pacote> --workspace=apps/web
```

### Testes

```powershell
# Executar todos os testes
npm test --workspace=apps/api

# Executar testes específicos
npm test --workspace=apps/api -- auth
npm test --workspace=apps/api -- users

# Testes com watch mode
npm test --workspace=apps/api -- --watch

# Testes com cobertura
npm test --workspace=apps/api -- --coverage
```

### Matar Processos em Portas

```powershell
# Ver qual processo usa a porta
netstat -ano | findstr :3000

# Matar processo por PID
taskkill /PID <PID> /F

# Usar npx para matar porta
npx kill-port 3000
npx kill-port 5173
```

---

## 🔒 Autenticação JWT

### Visão Geral

O sistema utiliza **JWT (JSON Web Tokens)** para autenticação stateless e segura.

| Token | Duração | Uso |
|-------|---------|-----|
| **Access Token** | 30 minutos | Autenticar requisições à API |
| **Refresh Token** | 7 dias | Renovar Access Token sem novo login |

### Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUXO DE LOGIN                                │
└─────────────────────────────────────────────────────────────────────┘

     ┌──────────┐                              ┌──────────┐
     │  Client  │                              │   API    │
     └────┬─────┘                              └────┬─────┘
          │                                         │
          │  1. POST /auth/login                    │
          │     {email, password}                   │
          │────────────────────────────────────────▶│
          │                                         │
          │                          2. Valida DTO  │
          │                          3. Busca user  │
          │                          4. Verifica    │
          │                             bcrypt hash │
          │                          5. Gera tokens │
          │                                         │
          │  6. Response                            │
          │     {accessToken, refreshToken, user}   │
          │◀────────────────────────────────────────│
          │                                         │

┌─────────────────────────────────────────────────────────────────────┐
│                   REQUISIÇÕES AUTENTICADAS                           │
└─────────────────────────────────────────────────────────────────────┘

          │  Header: Authorization: Bearer <token>  │
          │────────────────────────────────────────▶│
          │                                         │
          │                          AuthGuard      │
          │                          valida JWT     │
          │                                         │
          │  Response                               │
          │◀────────────────────────────────────────│

┌─────────────────────────────────────────────────────────────────────┐
│                    RENOVAÇÃO DE TOKEN                                │
└─────────────────────────────────────────────────────────────────────┘

          │  POST /auth/refresh                     │
          │  {refreshToken}                         │
          │────────────────────────────────────────▶│
          │                                         │
          │                          Valida refresh │
          │                          Gera novos     │
          │                          tokens         │
          │                                         │
          │  {accessToken, refreshToken}            │
          │◀────────────────────────────────────────│
```

### Payload do JWT

```typescript
interface JwtPayload {
  sub: string;      // User ID (UUID)
  email: string;    // Email do usuário
  role: string;     // OWNER | MANAGER | STYLIST | RECEPTIONIST
  salonId: string;  // ID do salão (multi-tenancy)
  type: 'access' | 'refresh';
}
```

### Arquivos do Módulo Auth

| Arquivo | Caminho | Função |
|---------|---------|--------|
| `auth.controller.ts` | `apps/api/src/modules/auth/` | Rotas `/login` e `/refresh` |
| `auth.service.ts` | `apps/api/src/modules/auth/` | Lógica de autenticação |
| `auth.module.ts` | `apps/api/src/modules/auth/` | Configuração do módulo |
| `jwt.strategy.ts` | `apps/api/src/modules/auth/` | Estratégia Passport JWT |
| `dto.ts` | `apps/api/src/modules/auth/` | DTOs de validação |

### Endpoints de Autenticação

#### POST /auth/login

```typescript
// Request
{
  "email": "owner@salao.com",
  "password": "senhaforte"
}

// Response (200 OK)
{
  "user": {
    "id": "11111111-1111-1111-1111-111111111111",
    "email": "owner@salao.com",
    "name": "Owner Demo",
    "role": "OWNER",
    "salonId": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 1800,
  "message": "Login realizado com sucesso"
}

// Response (400 Bad Request - Validação)
{
  "statusCode": 400,
  "message": ["Email inválido", "Senha deve ter no mínimo 6 caracteres"],
  "error": "Bad Request"
}

// Response (401 Unauthorized)
{
  "statusCode": 401,
  "message": "Email ou senha inválidos",
  "error": "Unauthorized"
}
```

#### POST /auth/refresh

```typescript
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response (200 OK)
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 1800,
  "message": "Token renovado com sucesso"
}

// Response (401 Unauthorized)
{
  "statusCode": 401,
  "message": "Refresh token inválido ou expirado",
  "error": "Unauthorized"
}
```

---

## 👥 Sistema de Permissões (RBAC)

### Roles Disponíveis

| Role | Código | Descrição | Nível |
|------|--------|-----------|-------|
| Proprietário | `OWNER` | Acesso total ao sistema | 1 |
| Gerente | `MANAGER` | Acesso administrativo (exceto config críticas) | 2 |
| Recepcionista | `RECEPTIONIST` | Agendamentos, clientes, caixa básico | 3 |
| Profissional | `STYLIST` | Apenas próprios agendamentos e comissões | 4 |

### Matriz de Permissões

| Funcionalidade | OWNER | MANAGER | RECEPTIONIST | STYLIST |
|----------------|:-----:|:-------:|:------------:|:-------:|
| Configurações do Salão | ✅ | ❌ | ❌ | ❌ |
| Gerenciar Assinatura | ✅ | ❌ | ❌ | ❌ |
| Criar/Editar Usuários | ✅ | ✅ | ❌ | ❌ |
| Relatórios Financeiros | ✅ | ✅ | ❌ | ❌ |
| Gerenciar Estoque | ✅ | ✅ | ❌ | ❌ |
| Ver Todos Agendamentos | ✅ | ✅ | ✅ | ❌ |
| Criar Agendamentos | ✅ | ✅ | ✅ | ❌ |
| Gerenciar Clientes | ✅ | ✅ | ✅ | ❌ |
| Registrar Pagamentos | ✅ | ✅ | ✅ | ❌ |
| Ver Próprios Agendamentos | ✅ | ✅ | ✅ | ✅ |
| Ver Próprias Comissões | ✅ | ✅ | ✅ | ✅ |

### Usuários de Teste

| Email | Senha | Role | Permissões |
|-------|-------|------|------------|
| owner@salao.com | senhaforte | OWNER | Acesso total |
| gerente@salao.com | manager123 | MANAGER | Acesso administrativo |
| profissional@salao.com | stylist123 | STYLIST | Próprios agendamentos |
| recepcao@salao.com | recepcao123 | RECEPTIONIST | Agendamentos e clientes |

---

## 🛡️ Guards de Segurança

### Ordem de Execução

```
Request → AuthGuard → RolesGuard → SalonAccessGuard → Controller
              │            │              │
              ▼            ▼              ▼
         Valida JWT   Verifica Role   Verifica salonId
```

### AuthGuard

Valida o token JWT em todas as requisições (exceto rotas `@Public()`).

```typescript
// apps/api/src/common/guards/auth.guard.ts

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) return true;
    
    // Valida JWT via Passport
    return super.canActivate(context);
  }
}
```

### RolesGuard

Verifica se o usuário tem a role necessária para acessar a rota.

```typescript
// apps/api/src/common/guards/roles.guard.ts

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### SalonAccessGuard

Garante que o usuário só acesse dados do próprio salão (multi-tenancy).

```typescript
// apps/api/src/common/guards/salon-access.guard.ts

@Injectable()
export class SalonAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const salonId = request.params.salonId || request.body.salonId;
    
    // OWNER pode acessar qualquer salão (para admin do sistema)
    if (user.role === 'OWNER') return true;
    
    // Outros usuários só acessam o próprio salão
    return user.salonId === salonId;
  }
}
```

### Como Usar nos Controllers

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { Public, Roles, CurrentUser } from '../../common/decorators';

@Controller('exemplo')
export class ExemploController {

  // ✅ Rota pública (sem autenticação)
  @Public()
  @Post('login')
  async login() { }

  // ✅ Rota que requer apenas autenticação
  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  // ✅ Rota que requer roles específicas
  @Roles('OWNER', 'MANAGER')
  @Get('relatorios')
  async getRelatorios() { }
  
  // ✅ Rota apenas para OWNER
  @Roles('OWNER')
  @Post('configuracoes')
  async updateConfig() { }
}
```

---

## ✅ Validação de Dados (DTOs)

### Configuração Global

O `ValidationPipe` está configurado globalmente no `main.ts`:

```typescript
// apps/api/src/main.ts

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // Remove propriedades não declaradas no DTO
    forbidNonWhitelisted: true, // Retorna erro se enviar propriedades extras
    transform: true,            // Transforma tipos automaticamente
    transformOptions: {
      enableImplicitConversion: true, // Converte string "123" para number 123
    },
  }),
);
```

### DTOs Implementados

#### LoginDto

```typescript
// apps/api/src/modules/auth/dto.ts

import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password!: string;
}
```

#### RefreshTokenDto

```typescript
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token deve ser uma string' })
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken!: string;
}
```

### Decorators Disponíveis (class-validator)

| Decorator | Uso | Exemplo |
|-----------|-----|---------|
| `@IsString()` | Deve ser string | `@IsString()` |
| `@IsNumber()` | Deve ser número | `@IsNumber()` |
| `@IsEmail()` | Deve ser email válido | `@IsEmail()` |
| `@IsNotEmpty()` | Não pode ser vazio | `@IsNotEmpty({ message: 'Campo obrigatório' })` |
| `@IsOptional()` | Campo opcional | `@IsOptional()` |
| `@MinLength(n)` | Mínimo de n caracteres | `@MinLength(6)` |
| `@MaxLength(n)` | Máximo de n caracteres | `@MaxLength(100)` |
| `@IsUUID()` | Deve ser UUID válido | `@IsUUID('4')` |
| `@IsDate()` | Deve ser data | `@IsDate()` |
| `@IsBoolean()` | Deve ser boolean | `@IsBoolean()` |
| `@IsEnum(Enum)` | Deve ser valor do enum | `@IsEnum(UserRole)` |
| `@IsArray()` | Deve ser array | `@IsArray()` |
| `@ValidateNested()` | Valida objetos aninhados | `@ValidateNested({ each: true })` |
| `@Type()` | Transforma tipo | `@Type(() => Number)` |

### Exemplo de DTO Completo

```typescript
import { 
  IsString, IsNotEmpty, IsOptional, IsNumber, 
  IsUUID, IsEnum, MinLength, MaxLength, Min, Max 
} from 'class-validator';

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
  STYLIST = 'STYLIST',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name!: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password!: string;

  @IsEnum(UserRole, { message: 'Role inválida' })
  @IsOptional()
  role?: UserRole = UserRole.STYLIST;

  @IsUUID('4', { message: 'salonId deve ser um UUID válido' })
  @IsNotEmpty()
  salonId!: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Comissão não pode ser negativa' })
  @Max(100, { message: 'Comissão não pode ser maior que 100%' })
  commissionRate?: number;
}
```

---

## 🗄️ Banco de Dados

### Diagrama ER

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     salons      │       │      users      │       │     clients     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │       │ id (PK)         │
│ name            │   │   │ salon_id (FK)   │◀──┐   │ salon_id (FK)   │◀──┐
│ slug            │   │   │ name            │   │   │ name            │   │
│ logo            │   │   │ email           │   │   │ email           │   │
│ address         │   │   │ password_hash   │   │   │ phone           │   │
│ phone           │   │   │ phone           │   │   │ birth_date      │   │
│ settings        │   │   │ role            │   │   │ notes           │   │
│ created_at      │   │   │ commission_rate │   │   │ last_visit      │   │
│ updated_at      │   │   │ work_schedule   │   │   │ created_at      │   │
└─────────────────┘   │   │ specialties     │   │   └─────────────────┘   │
                      │   │ active          │   │                         │
                      │   │ created_at      │   │                         │
                      │   └─────────────────┘   │                         │
                      │                         │                         │
                      │   ┌─────────────────┐   │   ┌─────────────────┐   │
                      │   │  appointments   │   │   │    products     │   │
                      │   ├─────────────────┤   │   ├─────────────────┤   │
                      │   │ id (PK)         │   │   │ id (PK)         │   │
                      └──▶│ salon_id (FK)   │   │   │ salon_id (FK)   │◀──┤
                          │ client_id (FK)  │◀──┼───│ name            │   │
                          │ user_id (FK)    │◀──┘   │ brand           │   │
                          │ service         │       │ quantity        │   │
                          │ start_time      │       │ min_quantity    │   │
                          │ end_time        │       │ cost_price      │   │
                          │ status          │       │ sale_price      │   │
                          │ price           │       │ created_at      │   │
                          │ notes           │       └─────────────────┘   │
                          │ created_at      │                             │
                          └─────────────────┘                             │
                                                                          │
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐   │
│  transactions   │       │  subscriptions  │       │ subscription_   │   │
├─────────────────┤       ├─────────────────┤       │     plans       │   │
│ id (PK)         │       │ id (PK)         │       ├─────────────────┤   │
│ salon_id (FK)   │◀──────│ salon_id (FK)   │◀──────│ id (PK)         │   │
│ type            │       │ plan_id (FK)    │───────│ name            │   │
│ category        │       │ status          │       │ code            │   │
│ description     │       │ trial_ends_at   │       │ monthly_price   │   │
│ amount          │       │ current_period  │       │ max_users       │   │
│ payment_method  │       │ current_period  │       │ max_clients     │   │
│ status          │       │   _start        │       │ features        │   │
│ due_date        │       │   _end          │       │ created_at      │   │
│ paid_at         │       │ canceled_at     │       └─────────────────┘   │
│ created_at      │       │ created_at      │                             │
└─────────────────┘       └─────────────────┘                             │
                                                                          │
                          ┌─────────────────┐                             │
                          │  notifications  │                             │
                          ├─────────────────┤                             │
                          │ id (PK)         │                             │
                          │ salon_id (FK)   │◀────────────────────────────┘
                          │ user_id (FK)    │
                          │ type            │
                          │ title           │
                          │ message         │
                          │ read            │
                          │ created_at      │
                          └─────────────────┘
```

### Schema da Tabela Users

```typescript
// apps/api/src/database/schema.ts

export const userRoleEnum = pgEnum('user_role', [
  'OWNER', 
  'MANAGER', 
  'RECEPTIONIST', 
  'STYLIST'
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  salonId: uuid('salon_id').references(() => salons.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  role: userRoleEnum('role').default('STYLIST').notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('50.00'),
  workSchedule: json('work_schedule').$type<WorkSchedule>(),
  specialties: text('specialties'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Principais Tabelas

| Tabela | Descrição |
|--------|-----------|
| `salons` | Salões cadastrados no sistema |
| `users` | Usuários e profissionais do salão |
| `clients` | Clientes do salão |
| `appointments` | Agendamentos de serviços |
| `products` | Produtos do estoque |
| `transactions` | Movimentações financeiras |
| `subscription_plans` | Planos de assinatura disponíveis |
| `subscriptions` | Assinaturas ativas dos salões |
| `subscription_payments` | Histórico de pagamentos |
| `notifications` | Notificações do sistema |

---

## 💳 Sistema de Assinaturas

### Planos Disponíveis

| Plano | Código | Preço/mês | Usuários | Clientes | Recursos |
|-------|--------|-----------|----------|----------|----------|
| **Básico** | `BASIC` | R$ 79,90 | 3 | 100 | Agenda, Clientes, Caixa básico |
| **Profissional** | `PROFESSIONAL` | R$ 149,90 | 10 | 500 | + Relatórios, Estoque, IA |
| **Premium** | `PREMIUM` | R$ 299,90 | Ilimitado | Ilimitado | + API, Multi-unidades, Suporte prioritário |

### Status de Assinatura

| Status | Descrição | Acesso |
|--------|-----------|--------|
| `TRIAL` | Período de teste (30 dias) | ✅ Completo |
| `ACTIVE` | Assinatura ativa e paga | ✅ Completo |
| `PAST_DUE` | Pagamento pendente (7 dias de carência) | ⚠️ Limitado |
| `SUSPENDED` | Acesso bloqueado por falta de pagamento | ❌ Bloqueado |
| `CANCELED` | Cancelada pelo usuário | ❌ Bloqueado |

### Fluxo de Assinatura

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CICLO DE VIDA DA ASSINATURA                     │
└─────────────────────────────────────────────────────────────────────┘

   Cadastro         Trial           Pagamento        Renovação
      │               │                 │                │
      ▼               ▼                 ▼                ▼
  ┌───────┐      ┌────────┐       ┌──────────┐    ┌──────────┐
  │ TRIAL │─────▶│ ACTIVE │──────▶│ PAST_DUE │───▶│SUSPENDED │
  │30 dias│      │        │       │  7 dias  │    │          │
  └───────┘      └────────┘       └──────────┘    └──────────┘
      │               │                │                │
      │               ▼                ▼                ▼
      │          ┌──────────┐    ┌──────────┐    ┌──────────┐
      └─────────▶│ CANCELED │◀───│  Pagou?  │◀───│Reativou? │
                 │          │    │  ✅ ACTIVE│    │✅ ACTIVE │
                 └──────────┘    └──────────┘    └──────────┘
```

### Tabelas do Sistema de Assinaturas

```sql
-- Planos disponíveis
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  yearly_price DECIMAL(10,2),
  max_users INTEGER,
  max_clients INTEGER,
  features JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assinaturas dos salões
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES salons(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'TRIAL',
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de pagamentos
CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Autenticação (`/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|:----:|
| POST | `/auth/login` | Realizar login | ❌ |
| POST | `/auth/refresh` | Renovar token | ❌ |

### Usuários (`/users`)

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|:----:|-------|
| GET | `/users` | Listar usuários do salão | ✅ | ALL |
| GET | `/users/:id` | Buscar usuário por ID | ✅ | ALL |
| GET | `/users/professionals` | Listar apenas profissionais | ✅ | ALL |
| POST | `/users` | Criar novo usuário | ✅ | OWNER, MANAGER |
| PATCH | `/users/:id` | Atualizar usuário | ✅ | OWNER, MANAGER |
| DELETE | `/users/:id` | Desativar usuário | ✅ | OWNER, MANAGER |

### Clientes (`/clients`)

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|:----:|-------|
| GET | `/clients` | Listar clientes | ✅ | ALL exceto STYLIST |
| GET | `/clients/:id` | Buscar cliente | ✅ | ALL exceto STYLIST |
| GET | `/clients/:id/history` | Histórico do cliente | ✅ | ALL exceto STYLIST |
| POST | `/clients` | Criar cliente | ✅ | ALL exceto STYLIST |
| PATCH | `/clients/:id` | Atualizar cliente | ✅ | ALL exceto STYLIST |
| DELETE | `/clients/:id` | Desativar cliente | ✅ | OWNER, MANAGER |

### Agendamentos (`/appointments`)

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|:----:|-------|
| GET | `/appointments` | Listar agendamentos | ✅ | ALL |
| GET | `/appointments/date/:date` | Agendamentos por data | ✅ | ALL |
| GET | `/appointments/:id` | Buscar agendamento | ✅ | ALL |
| POST | `/appointments` | Criar agendamento | ✅ | ALL exceto STYLIST |
| PATCH | `/appointments/:id` | Atualizar agendamento | ✅ | ALL exceto STYLIST |
| PATCH | `/appointments/:id/status` | Atualizar status | ✅ | ALL |
| DELETE | `/appointments/:id` | Cancelar agendamento | ✅ | ALL exceto STYLIST |

### Produtos (`/products`)

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|:----:|-------|
| GET | `/products` | Listar produtos | ✅ | OWNER, MANAGER |
| GET | `/products/low-stock` | Produtos com estoque baixo | ✅ | OWNER, MANAGER |
| GET | `/products/:id` | Buscar produto | ✅ | OWNER, MANAGER |
| POST | `/products` | Criar produto | ✅ | OWNER, MANAGER |
| PATCH | `/products/:id` | Atualizar produto | ✅ | OWNER, MANAGER |
| PATCH | `/products/:id/stock` | Ajustar estoque | ✅ | OWNER, MANAGER |
| DELETE | `/products/:id` | Desativar produto | ✅ | OWNER, MANAGER |

### Financeiro (`/transactions`)

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|:----:|-------|
| GET | `/transactions` | Listar transações | ✅ | OWNER, MANAGER |
| GET | `/transactions/summary` | Resumo financeiro | ✅ | OWNER, MANAGER |
| GET | `/transactions/:id` | Buscar transação | ✅ | OWNER, MANAGER |
| POST | `/transactions` | Criar transação | ✅ | ALL exceto STYLIST |
| PATCH | `/transactions/:id` | Atualizar transação | ✅ | OWNER, MANAGER |
| GET | `/accounts-payable` | Contas a pagar | ✅ | OWNER, MANAGER |
| GET | `/accounts-receivable` | Contas a receber (fiado) | ✅ | OWNER, MANAGER |

### Assinaturas (`/subscriptions`)

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|:----:|-------|
| GET | `/subscriptions/current` | Assinatura atual | ✅ | OWNER |
| GET | `/subscriptions/plans` | Listar planos | ✅ | OWNER |
| POST | `/subscriptions/subscribe` | Assinar plano | ✅ | OWNER |
| POST | `/subscriptions/cancel` | Cancelar assinatura | ✅ | OWNER |
| GET | `/subscriptions/payments` | Histórico de pagamentos | ✅ | OWNER |

---

## 🌱 Seeds e Dados Iniciais

### Executar Seed

```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao
npm run db:seed --workspace=apps/api
```

### O que o Seed Cria

#### 1. Salão Demo

| Campo | Valor |
|-------|-------|
| ID | `aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa` |
| Nome | Salão Demo |
| Slug | salao-demo |

#### 2. Usuários

| Email | Senha | Role | ID |
|-------|-------|------|-------|
| owner@salao.com | senhaforte | OWNER | `11111111-...` |
| gerente@salao.com | manager123 | MANAGER | `22222222-...` |
| profissional@salao.com | stylist123 | STYLIST | `33333333-...` |
| recepcao@salao.com | recepcao123 | RECEPTIONIST | `44444444-...` |

#### 3. Planos de Assinatura

| Plano | Preço | Código |
|-------|-------|--------|
| Básico | R$ 79,90 | BASIC |
| Profissional | R$ 149,90 | PROFESSIONAL |
| Premium | R$ 299,90 | PREMIUM |

### Arquivo do Seed

```
📂 apps/api/src/seed.ts
```

---

## 🧪 Testes Automatizados

### Cobertura Atual

```
Test Suites: 4 passed, 4 total
Tests:       69 passed, 69 total
Snapshots:   0 total
Time:        ~5s

┌────────────────────┬────────┬────────────────────────────────────┐
│ Test Suite         │ Tests  │ Descrição                          │
├────────────────────┼────────┼────────────────────────────────────┤
│ AuthService        │ 14     │ Lógica de autenticação             │
│ AuthController     │ 16     │ Rotas de autenticação              │
│ UsersService       │ 21     │ Lógica de usuários                 │
│ UsersController    │ 18     │ Rotas de usuários                  │
└────────────────────┴────────┴────────────────────────────────────┘
```

### Comandos de Teste

```powershell
# Todos os testes
npm test --workspace=apps/api

# Testes específicos
npm test --workspace=apps/api -- auth
npm test --workspace=apps/api -- users

# Watch mode (re-executa ao salvar)
npm test --workspace=apps/api -- --watch

# Com cobertura de código
npm test --workspace=apps/api -- --coverage

# Testes e2e
npm run test:e2e --workspace=apps/api
```

### Estrutura de Testes

```
apps/api/src/modules/
├── auth/
│   ├── auth.service.spec.ts      # Testes unitários do service
│   └── auth.controller.spec.ts   # Testes do controller
├── users/
│   ├── users.service.spec.ts
│   └── users.controller.spec.ts
└── ...
```

---

## 🚀 CI/CD e Deploy

### GitHub Actions

O projeto inclui workflow automatizado em `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test --workspace=apps/api
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          ACCESS_TOKEN_SECRET: test-secret
          REFRESH_TOKEN_SECRET: test-refresh-secret
      
      - name: Build
        run: npm run build
```

### Pipeline de Deploy (Exemplo)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Push   │────▶│  Lint   │────▶│  Test   │────▶│  Build  │
│         │     │         │     │         │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                                                     │
                    ┌────────────────────────────────┘
                    │
                    ▼
              ┌───────────┐     ┌───────────┐
              │  Deploy   │────▶│Production │
              │  Staging  │     │           │
              └───────────┘     └───────────┘
```

---

## 🔧 Troubleshooting

### Erro: "EADDRINUSE: address already in use"

**Causa:** Porta 3000 ou 5173 já está em uso

**Solução:**
```powershell
# Ver processo na porta
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <PID> /F

# Ou usar npx
npx kill-port 3000 5173
```

### Erro: "DATABASE_URL missing"

**Causa:** Variável de ambiente não definida

**Solução:**
```powershell
# Verificar arquivo .env na raiz
# Ou definir manualmente:
$env:DATABASE_URL = "postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager"
```

### Erro: "Email ou senha inválidos"

**Causa:** Hash da senha incorreto no banco

**Solução:**
```powershell
# Rodar seed novamente
npm run db:seed --workspace=apps/api
```

### Erro: "Token inválido ou expirado"

**Causa:** Access Token expirou (após 30 minutos)

**Solução:**
- Frontend deve chamar `POST /auth/refresh` com refreshToken
- Ou fazer login novamente

### Erro: "Cannot find module"

**Causa:** Dependências não instaladas

**Solução:**
```powershell
npm install
```

### PostgreSQL não está rodando

**Causa:** Container Docker parado

**Solução:**
```powershell
docker ps                  # Verificar
npm run docker:up          # Iniciar
```

### Erro de validação (400 Bad Request)

**Causa:** Dados enviados não passam na validação do DTO

**Solução:**
- Verificar mensagens de erro retornadas
- Ajustar dados conforme regras do DTO

### Erro: "fastify-plugin version mismatch"

**Causa:** Versão incompatível de plugin Fastify

**Solução:**
```powershell
npm install @fastify/cookie@9 --workspace=apps/api
```

---

## 🗺️ Roadmap

### ✅ Implementado

- [x] Autenticação JWT com Access/Refresh Tokens
- [x] Sistema de permissões RBAC
- [x] Guards de segurança (Auth, Roles, SalonAccess)
- [x] Validação de DTOs com class-validator
- [x] Seeds automáticos
- [x] Testes automatizados (69 testes)
- [x] CI/CD com GitHub Actions
- [x] Multi-tenancy por salão

### 🚧 Em Desenvolvimento

- [ ] Sistema de assinaturas completo
- [ ] Integração com gateway de pagamento
- [ ] Módulo de relatórios avançados

### 📋 Planejado

- [ ] Logout com invalidação de refresh token
- [ ] Recuperação de senha por email
- [ ] Rate limiting nas rotas de auth
- [ ] Logs estruturados (Winston/Pino)
- [ ] HTTPS para produção
- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] Integração com WhatsApp Business
- [ ] Sistema de fidelidade

---

## 📝 Histórico de Implementações

### 08/12/2025 - Release 1.0.0

#### ✅ Autenticação JWT Completa
- Implementado Access Token (30 min) e Refresh Token (7 dias)
- Criado `jwt.strategy.ts` com estratégia Passport
- Atualizado `auth.service.ts` com geração de tokens
- Atualizado `auth.controller.ts` com rota `/auth/refresh`

#### ✅ Guards de Segurança
- Criado `AuthGuard` para validação de token
- Registrado `AuthGuard` globalmente no `app.module.ts`
- Rota `/auth/login` marcada como `@Public()`
- `RolesGuard` e `SalonAccessGuard` funcionais

#### ✅ Validação de DTOs
- Instalado `class-validator` e `class-transformer`
- Instalado `@fastify/cookie@9` (compatível com Fastify 4)
- Configurado `ValidationPipe` global no `main.ts`
- Criado `LoginDto` e `RefreshTokenDto`

#### ✅ Seeds Automáticos
- Criado arquivo `seed.ts` com script de seed
- Adicionado comando `npm run db:seed`
- Seed cria: 1 salão + 4 usuários + 3 planos

#### ✅ Testes Automatizados
- 69 testes passando
- Cobertura de AuthService, AuthController, UsersService, UsersController
- CI/CD configurado no GitHub Actions

#### ✅ Limpeza e Organização
- Removido código mock de login
- Configurado arquivo `.env` na raiz
- API lê variáveis de ambiente automaticamente
- Documentação completa atualizada

---

## 📞 Suporte

Para resolver problemas ou fazer alterações, forneça:

1. **Erro exato** (mensagem ou print)
2. **Comando executado**
3. **Pasta onde executou**
4. **O que estava tentando fazer**

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

**Rodrigo Viana**

---

*Última atualização: 08/12/2025*
*Versão da documentação: 1.0.0*