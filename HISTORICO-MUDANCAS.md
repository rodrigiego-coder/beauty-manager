# Histórico de Mudanças - Beauty Manager

## [1.1.0] - 09/12/2025

### ✨ Novas Funcionalidades

#### Sistema de Comandas (Backend)
- Módulo completo em `apps/api/src/modules/commands/`
- Endpoints: abrir, adicionar itens, pagamentos, encerrar, fechar, cancelar
- Quick Access: busca ou cria comanda automaticamente (`GET /commands/quick-access/:code`)
- Auditoria: todos os eventos são registrados na tabela `command_events`

#### Sistema de Comandas (Frontend)
- Campo de busca rápida no Dashboard (atalho Ctrl+K)
- Página de detalhes da comanda (`/comandas/:id`)
- Cards de totais (bruto, descontos, líquido, restante)
- Tabela de itens com ícones por tipo
- Tabela de pagamentos
- Timeline de atividade
- Modal de registrar pagamento
- Modal de cancelamento com motivo obrigatório

#### Dashboard
- Módulo de dashboard em `apps/api/src/modules/dashboard/`
- Estatísticas: agendamentos, clientes, receita, estoque baixo

### 🔧 Correções

- JWT: adicionado `id` como alias de `sub` para compatibilidade
- Permissões por role no Sidebar (STYLIST só vê Agenda e Perfil)
- Renovação automática de token no frontend
- Hash de senha na criação de usuário

### 🗃️ Banco de Dados

Tabelas criadas:
- `commands` - comanda principal
- `command_items` - itens da comanda
- `command_payments` - pagamentos
- `command_events` - auditoria/timeline

Constraints adicionadas:
- `users_email_unique` - email único
- `clients_phone_salon_unique` - telefone único por salão

---

## [1.0.0] - Versão Inicial

- Sistema base com autenticação
- Módulos: usuários, salões, agendamentos, clientes, produtos, financeiro
- Interface React com Tailwind CSS