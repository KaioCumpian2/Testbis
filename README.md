# 🚀 FlowMaster - Sistema SaaS de Agendamento Multi-Tenant

Sistema completo de agendamento online para salões de beleza, barbearias e estabelecimentos de serviços. Arquitetura multi-tenant com isolamento completo de dados.

## ✨ Funcionalidades

### 🎯 Para Proprietários (Admin)
- ✅ **Registro SaaS** - Crie sua conta e tenha seu próprio sistema
- ✅ **Dashboard Completo** - Visão geral de receitas, agendamentos e métricas
- ✅ **Gestão de Serviços** - CRUD completo com categorias e preços
- ✅ **Gestão de Profissionais** - Vincule profissionais aos serviços
- ✅ **Agenda Inteligente** - Visualização por dia/semana com filtros
- ✅ **Gestão de Pagamentos** - Aprovação de comprovantes PIX
- ✅ **Personalização** - Logo, cores do tema e configurações
- ✅ **Portal do Funcionário** - Acesso separado para colaboradores

### 👥 Para Clientes
- ✅ **Agendamento Online** - Interface intuitiva para marcar horários
- ✅ **Seleção de Profissional** - Escolha quem vai te atender
- ✅ **Pagamento PIX** - Upload de comprovante
- ✅ **Histórico** - Acompanhe seus agendamentos
- ✅ **Avaliações** - Deixe feedback sobre os serviços

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool ultra-rápido
- **TanStack Query** - Gerenciamento de estado assíncrono
- **React Router** - Roteamento multi-tenant
- **Shadcn/ui** - Componentes modernos
- **Tailwind CSS** - Estilização utilitária

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação stateless
- **Bcrypt** - Hash de senhas

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/KaioCumpian2/Testbis.git
cd Testbis
```

### 2. Configure o Backend

```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL

# Execute as migrations
npx prisma generate
npx prisma db push

# Inicie o servidor
npm run dev
```

O backend estará rodando em `http://localhost:3000`

### 3. Configure o Frontend

```bash
cd bizflow-harmony-main

# Instale as dependências
npm install

# Configure as variáveis de ambiente (opcional)
# O frontend já está configurado para usar localhost:3000

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/flowmaster"
JWT_SECRET="seu-secret-super-seguro-aqui"
PORT=3000
```

### Frontend (.env - opcional)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🚀 Uso

### Primeiro Acesso

1. **Acesse** `http://localhost:5173`
2. **Clique em "Começar Agora"** na landing page
3. **Preencha o formulário de registro:**
   - Nome da organização
   - Seu nome e email
   - Senha
4. **Você será redirecionado para o Admin Dashboard**

### Configuração Inicial

1. **Vá para Settings** (`/admin/settings`)
   - Faça upload do logo
   - Escolha a cor do tema
   - Configure a chave PIX

2. **Adicione Serviços** (`/admin/services`)
   - Clique em "Novo Serviço"
   - Preencha nome, preço, duração e categoria
   - Salve

3. **Adicione Profissionais** (`/admin/professionals`)
   - Clique em "Novo Profissional"
   - Preencha nome e função
   - Vincule aos serviços
   - Salve

### Compartilhe com Clientes

Seu link único de agendamento é:
```
http://localhost:5173/s/seu-slug
```

Compartilhe este link com seus clientes para que eles possam agendar online!

## 📁 Estrutura do Projeto

```
FLOW MASTEEEEEEEER/
├── backend/                  # API Node.js + Express
│   ├── prisma/              # Schema e migrations
│   ├── src/
│   │   ├── middleware/      # Auth, Tenant Context
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Lógica de negócio
│   │   └── server.ts        # Entry point
│   └── Dockerfile           # Container do backend
│
└── bizflow-harmony-main/    # Frontend React
    ├── src/
    │   ├── components/      # Componentes reutilizáveis
    │   ├── contexts/        # React Context (Theme, Establishment)
    │   ├── pages/           # Páginas da aplicação
    │   │   ├── admin/       # Dashboard Admin
    │   │   ├── auth/        # Login/Register
    │   │   ├── client/      # Interface do Cliente
    │   │   └── employee/    # Portal do Funcionário
    │   ├── lib/             # Utilitários e API client
    │   └── App.tsx          # Roteamento principal
    └── public/              # Assets estáticos
```

## 🔒 Segurança

- ✅ **Multi-tenancy** - Isolamento completo de dados por tenant
- ✅ **JWT Authentication** - Tokens seguros com expiração
- ✅ **Password Hashing** - Bcrypt com salt rounds
- ✅ **CORS** - Configurado para produção
- ✅ **Tenant Context Middleware** - Garante que cada usuário só acessa seus dados
- ✅ **Role-based Access Control** - Admin, Employee, User

## 🎨 Personalização

Cada tenant pode personalizar:
- **Logo** - Upload de imagem (base64)
- **Cor do Tema** - Seletor de cores com preview
- **Nome Público** - Como aparece para clientes
- **Chave PIX** - Para receber pagamentos

## 📊 Funcionalidades Técnicas

### Multi-Tenancy
- Slug único por tenant (`/s/:slug`)
- Isolamento de dados via `tenantId`
- Middleware automático de contexto

### Autenticação
- JWT com payload: `userId`, `tenantId`, `email`, `role`
- Refresh token (planejado)
- Proteção de rotas no frontend e backend

### Estado e Cache
- React Query para cache inteligente
- Invalidação automática após mutations
- Loading e error states

## 🐛 Troubleshooting

### Erro "Authorization header missing"
- Certifique-se de estar logado
- Verifique se o token está no localStorage
- Reinicie o backend

### Erro "EPERM: operation not permitted"
- Mate todos os processos Node: `taskkill /F /IM node.exe`
- Use `npx ts-node src/server.ts` ao invés de `npm run dev`

### Prisma não gera o client
- Rode manualmente: `npx prisma generate`
- Se falhar, delete `node_modules/.prisma` e tente novamente

## 🚢 Deploy

### Backend (Docker)
```bash
cd backend
docker build -t flowmaster-backend .
docker run -p 3000:3000 --env-file .env flowmaster-backend
```

### Frontend
```bash
cd bizflow-harmony-main
npm run build
# Deploy a pasta 'dist' para seu hosting (Vercel, Netlify, etc)
```

## 📝 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Desenvolvido por

**Kaio Cumpian**
- GitHub: [@KaioCumpian2](https://github.com/KaioCumpian2)

---

**Status do Projeto:** ✅ Produção Ready

**Última Atualização:** Dezembro 2024
