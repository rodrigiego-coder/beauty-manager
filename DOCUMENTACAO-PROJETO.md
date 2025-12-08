# 📚 DOCUMENTAÇÃO DO PROJETO BEAUTY MANAGER

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Comandos Úteis](#comandos-úteis)
5. [Credenciais](#credenciais)
6. [Arquitetura de Autenticação JWT](#arquitetura-de-autenticação-jwt)
7. [Validação de Dados (DTOs)](#validação-de-dados-dtos)
8. [Banco de Dados](#banco-de-dados)
9. [Guards de Segurança](#guards-de-segurança)
10. [Seeds Automáticos](#seeds-automáticos)
11. [Problemas Comuns e Soluções](#problemas-comuns-e-soluções)
12. [Histórico de Implementações](#histórico-de-implementações)

---

## 🎯 Visão Geral

**Beauty Manager** é um sistema de gestão inteligente para salões de beleza.

| Componente | Tecnologia | Porta |
|------------|------------|-------|
| Frontend | Vite + React | 5173 |
| Backend (API) | NestJS + Fastify | 3000 |
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
│   │   │   │   └── schema.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   ├── dto.ts            # DTOs de validação
│   │   │   │   │   └── index.ts
│   │   │   │   ├── users/
│   │   │   │   ├── appointments/
│   │   │   │   ├── clients/
│   │   │   │   └── ... (outros módulos)
│   │   │   ├── seed.ts                   # Script de seed
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   └── main.ts                   # Configuração ValidationPipe
│   │   └── package.json
│   ├── web/                    # Frontend React
│   └── mobile/                 # Mobile (futuro)
├── packages/
├── .env                        # Variáveis de ambiente
├── .env.example
├── docker-compose.yml
├── package.json
└── DOCUMENTACAO-PROJETO.md
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

# JWT SECRETS (IMPORTANTE!)
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
npm run db:push --workspace=apps/api

# Rodar seed (popular banco com dados iniciais)
npm run db:seed --workspace=apps/api

# Acessar o banco diretamente
docker exec -it beauty-manager-db psql -U beauty_admin -d beauty_manager
```

### Matar Processo em Porta
```powershell
# Ver qual processo usa a porta 3000
netstat -ano | findstr :3000

# Matar processo por PID
taskkill /PID  /F

# Ou usar npx
npx kill-port 3000
```

### Instalar Dependências
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao

# Instalar todas as dependências
npm install

# Instalar pacote específico na API
npm install  --workspace=apps/api

# Instalar pacote de desenvolvimento
npm install  --workspace=apps/api --save-dev
```

---

## 🔐 Credenciais

### Usuários do Sistema

| Email | Senha | Role | Permissões |
|-------|-------|------|------------|
| owner@salao.com | senhaforte | OWNER | Acesso total |
| gerente@salao.com | manager123 | MANAGER | Acesso administrativo |
| profissional@salao.com | stylist123 | STYLIST | Próprios agendamentos |
| recepcao@salao.com | recepcao123 | RECEPTIONIST | Agendamentos e clientes |

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

## 🔒 Arquitetura de Autenticação JWT

### Visão Geral

O sistema usa **JWT (JSON Web Tokens)** para autenticação segura:

| Token | Duração | Uso |
|-------|---------|-----|
| Access Token | 30 minutos | Autenticar requisições |
| Refresh Token | 7 dias | Renovar Access Token |

### Fluxo de Autenticação
```
1. LOGIN
   └── POST /auth/login
       ├── Valida email/senha (bcrypt)
       ├── Valida dados com DTO (class-validator)
       └── Retorna: accessToken + refreshToken

2. REQUISIÇÕES AUTENTICADAS
   └── Header: Authorization: Bearer <accessToken>
       └── AuthGuard valida o token JWT

3. RENOVAÇÃO DE TOKEN
   └── POST /auth/refresh
       ├── Envia: refreshToken
       └── Retorna: novo accessToken + novo refreshToken
```

### Arquivos do Módulo Auth

| Arquivo | Caminho | Função |
|---------|---------|--------|
| `auth.controller.ts` | `apps/api/src/modules/auth/` | Rotas /login e /refresh |
| `auth.service.ts` | `apps/api/src/modules/auth/` | Lógica de autenticação |
| `auth.module.ts` | `apps/api/src/modules/auth/` | Configuração do módulo |
| `jwt.strategy.ts` | `apps/api/src/modules/auth/` | Estratégia Passport JWT |
| `dto.ts` | `apps/api/src/modules/auth/` | DTOs de validação |

### Endpoints de Autenticação

#### POST /auth/login
```json
// Request
{
  "email": "owner@salao.com",
  "password": "senhaforte"
}

// Response (Sucesso)
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

// Response (Erro de Validação)
{
  "statusCode": 400,
  "message": ["Email inválido", "Senha deve ter no mínimo 6 caracteres"],
  "error": "Bad Request"
}
```

#### POST /auth/refresh
```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 1800,
  "message": "Token renovado com sucesso"
}
```

### Payload do JWT
```typescript
interface JwtPayload {
  sub: string;      // userId
  email: string;
  role: string;     // OWNER, MANAGER, STYLIST, RECEPTIONIST
  salonId: string;
  type: 'access' | 'refresh';
}
```

---

## ✅ Validação de Dados (DTOs)

### Configuração Global

O `ValidationPipe` está configurado globalmente no `main.ts`:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // Remove propriedades não declaradas
    forbidNonWhitelisted: true, // Erro se enviar propriedades extras
    transform: true,            // Transforma tipos automaticamente
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### DTOs Implementados

#### LoginDto
```typescript
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

### Como Criar Novos DTOs
```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateExemploDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome!: string;

  @IsNumber()
  @IsOptional()
  valor?: number;

  @IsUUID()
  @IsNotEmpty()
  salonId!: string;
}
```

### Decorators Disponíveis (class-validator)

| Decorator | Uso |
|-----------|-----|
| `@IsString()` | Deve ser string |
| `@IsNumber()` | Deve ser número |
| `@IsEmail()` | Deve ser email válido |
| `@IsNotEmpty()` | Não pode ser vazio |
| `@IsOptional()` | Campo opcional |
| `@MinLength(n)` | Mínimo de n caracteres |
| `@MaxLength(n)` | Máximo de n caracteres |
| `@IsUUID()` | Deve ser UUID válido |
| `@IsDate()` | Deve ser data |
| `@IsBoolean()` | Deve ser boolean |
| `@IsEnum(Enum)` | Deve ser valor do enum |

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
| OWNER | Proprietário | Acesso total ao sistema |
| MANAGER | Gerente | Acesso administrativo (exceto config críticas) |
| RECEPTIONIST | Recepcionista | Agendamentos e clientes |
| STYLIST | Profissional | Apenas próprios agendamentos |

---

## 🛡️ Guards de Segurança

### Ordem de Execução

1. **AuthGuard** - Valida token JWT
2. **RolesGuard** - Verifica permissões por role
3. **SalonAccessGuard** - Verifica acesso ao salão (multi-tenancy)

### Como Usar nos Controllers
```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('exemplo')
export class ExemploController {

  // Rota pública (sem autenticação)
  @Public()
  @Post('login')
  async login() { }

  // Rota que requer apenas autenticação
  @Get('profile')
  async getProfile() { }

  // Rota que requer role específica
  @Roles('OWNER', 'MANAGER')
  @Get('relatorios')
  async getRelatorios() { }
}
```

### Arquivos dos Guards

| Arquivo | Caminho | Função |
|---------|---------|--------|
| `auth.guard.ts` | `apps/api/src/common/guards/` | Valida JWT |
| `roles.guard.ts` | `apps/api/src/common/guards/` | Verifica roles |
| `salon-access.guard.ts` | `apps/api/src/common/guards/` | Multi-tenancy |

---

## 🌱 Seeds Automáticos

### Executar Seed
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao

npm run db:seed --workspace=apps/api
```

### O que o Seed Cria

1. **Salão Demo**
   - ID: `aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
   - Nome: Salão Demo

2. **Usuários**
   - owner@salao.com / senhaforte (OWNER)
   - gerente@salao.com / manager123 (MANAGER)
   - profissional@salao.com / stylist123 (STYLIST)
   - recepcao@salao.com / recepcao123 (RECEPTIONIST)

### Arquivo do Seed
```
📂 apps/api/src/seed.ts
```

---

## 🔧 Problemas Comuns e Soluções

### 1. Erro "EADDRINUSE: address already in use"

**Causa:** Porta 3000 já está em uso

**Solução:**
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao
netstat -ano | findstr :3000
taskkill /PID  /F
npm run dev
```

### 2. Erro "DATABASE_URL missing"

**Causa:** Variável de ambiente não definida

**Solução:**
```powershell
# Verificar arquivo .env na raiz do projeto
# Ou definir manualmente:
$env:DATABASE_URL = "postgresql://beauty_admin:beauty_secret_2025@localhost:5432/beauty_manager"
```

### 3. Login retorna "Email ou senha inválidos"

**Causa:** Hash da senha incorreto no banco

**Solução:**
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao

# Rodar seed novamente para recriar usuários
npm run db:seed --workspace=apps/api
```

### 4. Erro "Token inválido ou expirado"

**Causa:** Access Token expirou (após 30 minutos)

**Solução:**
- O frontend deve chamar `POST /auth/refresh` com o refreshToken
- Ou fazer login novamente

### 5. Erro "Cannot find module"

**Causa:** Dependências não instaladas

**Solução:**
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao
npm install
```

### 6. PostgreSQL não está rodando

**Causa:** Container Docker parado

**Solução:**
```powershell
# PASTA: C:\Users\Rodrigo Viana\Desktop\sistema-salao
docker ps                  # Verificar
npm run docker:up          # Iniciar
```

### 7. Erro de validação (Bad Request)

**Causa:** Dados enviados não passam na validação do DTO

**Solução:**
- Verificar mensagens de erro retornadas
- Ajustar dados enviados conforme regras do DTO

### 8. Erro "fastify-plugin version mismatch"

**Causa:** Versão incompatível de plugin Fastify

**Solução:**
```powershell
# Instalar versão compatível
npm install @fastify/cookie@9 --workspace=apps/api
```

---

## 📝 Histórico de Implementações

### Data: 08/12/2025

#### ✅ Opção 1: Limpeza Pós-Implementação
- Removido código mock de login
- Configurado arquivo `.env` na raiz
- API lê variáveis de ambiente automaticamente

#### ✅ Opção 2: Guards de Segurança
- Criado `AuthGuard` para validação de token
- Registrado `AuthGuard` globalmente no `app.module.ts`
- Rota `/auth/login` marcada como `@Public()`
- `RolesGuard` e `SalonAccessGuard` já existiam

#### ✅ Opção 3: Seeds Automáticos
- Criado arquivo `seed.ts` com script de seed
- Adicionado comando `npm run db:seed`
- Seed cria: 1 salão + 4 usuários (OWNER, MANAGER, STYLIST, RECEPTIONIST)

#### ✅ Opção 4: JWT Real + Refresh Token
- Instalado `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- Criado `jwt.strategy.ts` com estratégia Passport
- Atualizado `auth.service.ts` com geração de tokens JWT
- Atualizado `auth.controller.ts` com rota `/auth/refresh`
- Atualizado `auth.guard.ts` para validar JWT
- Access Token: 30 minutos | Refresh Token: 7 dias

#### ✅ Opção 5: Validação de DTOs
- Instalado `class-validator`, `class-transformer`
- Instalado `@fastify/cookie@9` (compatível com Fastify 4)
- Configurado `ValidationPipe` global no `main.ts`
- Criado `dto.ts` com `LoginDto` e `RefreshTokenDto`
- Atualizado `auth.controller.ts` para usar DTOs

---

## 🚀 Próximos Passos Sugeridos

1. [ ] 🧪 Implementar testes automatizados (Jest)
2. [ ] 🤖 Configurar CI/CD (GitHub Actions)
3. [ ] 📝 Criar DTOs para outros módulos (appointments, products, clients)
4. [ ] 🔐 Implementar logout (invalidar refresh token)
5. [ ] 📧 Implementar recuperação de senha por email
6. [ ] 🔒 Configurar HTTPS para produção
7. [ ] 📊 Adicionar logs estruturados (Winston/Pino)
8. [ ] 🚦 Adicionar rate limiting nas rotas de auth

---

## 📞 Suporte

Para resolver problemas ou fazer alterações no sistema, consulte este documento e forneça:

1. **Erro exato** (print da tela ou mensagem)
2. **Comando executado**
3. **Pasta onde estava** ao executar
4. **O que estava tentando fazer**

---

*Última atualização: 08/12/2025 - Validação de DTOs implementada*