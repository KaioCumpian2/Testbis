# Service Hub - Frontend Documentation

> **Documentação técnica completa para integração com Backend**

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Modelos de Dados (Types)](#modelos-de-dados)
5. [Funcionalidades por Módulo](#funcionalidades-por-módulo)
6. [APIs Esperadas (Endpoints)](#apis-esperadas)
7. [Autenticação](#autenticação)
8. [Storage & Uploads](#storage--uploads)
9. [Como Rodar](#como-rodar)

---

## Visão Geral

**Service Hub** é um sistema de agendamentos para estabelecimentos de estética e beleza. O frontend foi construído em React com TypeScript e atualmente usa dados mock. O backend precisa implementar as APIs REST documentadas abaixo.

### Fluxos Principais

1. **Cliente**: Visualiza serviços → Escolhe profissional → Seleciona data/hora → Confirma → Paga via PIX
2. **Admin**: Gerencia agenda → Valida pagamentos → Gerencia serviços/profissionais → Configura estabelecimento

---

## Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.8.3 | Tipagem |
| Vite | 5.4.19 | Build tool |
| React Router | 6.30.1 | Navegação |
| TanStack Query | 5.83.0 | Cache/Fetching |
| Tailwind CSS | 3.4.17 | Estilização |
| Radix UI | Várias | Componentes acessíveis |
| Zod | 3.25.76 | Validação |
| Sonner | 1.7.4 | Toasts/Notificações |
| date-fns | 3.6.0 | Manipulação de datas |
| Recharts | 2.15.4 | Gráficos |

---

## Estrutura do Projeto

```
src/
├── assets/               # Imagens e assets estáticos
│   └── logo.png
├── components/
│   ├── layout/           # Layouts (AdminLayout, ClientLayout, Sidebar)
│   └── ui/               # Componentes UI reutilizáveis (shadcn/ui)
├── contexts/
│   ├── ThemeContext.tsx      # Tema claro/escuro + cor do tema
│   └── EstablishmentContext.tsx  # Dados do estabelecimento
├── data/
│   └── mockData.ts       # ⚠️ DADOS MOCK - Substituir por API
├── hooks/                # Custom hooks
├── lib/
│   └── utils.ts          # Utilitários (cn, etc)
├── pages/
│   ├── admin/            # Páginas do painel admin
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminAgenda.tsx
│   │   ├── AdminServices.tsx
│   │   ├── AdminProfessionals.tsx
│   │   ├── AdminPayments.tsx
│   │   ├── AdminReports.tsx
│   │   ├── AdminReviews.tsx
│   │   ├── AdminWhatsApp.tsx
│   │   ├── AdminSettings.tsx
│   │   └── AdminNotifications.tsx
│   └── client/           # Páginas do cliente
│       ├── ClientHome.tsx
│       ├── ClientBooking.tsx
│       ├── ClientAppointments.tsx
│       ├── ClientReviews.tsx
│       └── ClientPortfolio.tsx
├── types/
│   └── index.ts          # Definições de tipos TypeScript
├── App.tsx               # Rotas principais
└── main.tsx              # Entry point
```

---

## Modelos de Dados

### Establishment (Estabelecimento)

```typescript
interface Establishment {
  id: string;
  name: string;
  logo?: string;              // URL da logo
  themeColor: string;         // Cor hex (#8B5CF6)
  pixKey: string;             // Chave PIX para pagamentos
  portfolioImages: PortfolioImage[];
  availableTimeSlots: TimeSlot[];
  workingHours: {
    open: string;             // "09:00"
    close: string;            // "19:00"
  };
}

interface PortfolioImage {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
}

interface TimeSlot {
  id: string;
  time: string;               // "09:00", "09:30", etc
  isActive: boolean;
}
```

### Service (Serviço)

```typescript
interface Service {
  id: string;
  name: string;               // "Corte Feminino"
  description: string;
  price: number;              // Em reais (80.00)
  duration: number;           // Em minutos (60)
  category: string;           // "Cabelo", "Unhas", etc
}
```

### Professional (Profissional)

```typescript
interface Professional {
  id: string;
  name: string;
  avatar?: string;            // URL da foto
  role: string;               // "Cabeleireira", "Manicure"
  services: string[];         // IDs dos serviços que realiza
}
```

### Appointment (Agendamento)

```typescript
type AppointmentStatus = 
  | 'requested'           // Cliente solicitou
  | 'awaiting_payment'    // Aguardando pagamento PIX
  | 'awaiting_validation' // PIX enviado, aguardando validação
  | 'confirmed'           // Pagamento validado
  | 'completed'           // Serviço realizado
  | 'cancelled';          // Cancelado

interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;               // "2024-01-15" (ISO date)
  time: string;               // "09:00"
  status: AppointmentStatus;
  price: number;
  paymentReceipt?: string;    // URL do comprovante
  paymentDate?: string;       // ISO datetime
  createdAt: string;          // ISO datetime
}
```

### Review (Avaliação)

```typescript
interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  rating: number;             // 1-5 estrelas
  comment: string;
  createdAt: string;
  response?: string;          // Resposta do estabelecimento
  isHidden: boolean;          // Se está oculta publicamente
}
```

### WhatsApp Agent (Agente IA)

```typescript
interface WhatsAppAgent {
  id: string;
  name: string;               // "Bia"
  persona: string;            // Descrição da persona
  tone: string;               // "Amigável, profissional"
  isActive: boolean;
  totalConversations: number;
  appointmentsGenerated: number;
}

interface ConversationLog {
  id: string;
  clientPhone: string;
  messages: {
    role: 'client' | 'agent';
    content: string;
    timestamp: string;
  }[];
  appointmentId?: string;
  createdAt: string;
}
```

### Financial Reports

```typescript
interface FinancialKPI {
  totalRevenue: number;
  totalAppointments: number;
  avgTicket: number;
  completionRate: number;     // 0-100%
}

interface CommissionReport {
  professionalId: string;
  professionalName: string;
  totalAppointments: number;
  totalRevenue: number;
  commission: number;
  commissionRate: number;     // 0-100%
}
```

---

## Funcionalidades por Módulo

### 🏠 Cliente - Home (`/client`)
- Exibe informações do estabelecimento
- Lista serviços em destaque
- Mostra equipe
- Avaliações recentes
- Portfolio/Vitrine

### 📅 Cliente - Agendamento (`/client/booking`)
- Wizard de 4 etapas:
  1. Seleção de serviço
  2. Seleção de profissional (filtrado por serviço)
  3. Seleção de data e horário (usa `timeSlots` ativos)
  4. Confirmação e resumo
- Após confirmar: status = `requested`

### 📋 Cliente - Meus Agendamentos (`/client/appointments`)
- Lista agendamentos do cliente
- Filtra por status
- Exibe instruções de pagamento PIX
- Upload de comprovante

### ⭐ Cliente - Avaliações (`/client/reviews`)
- Lista avaliações do cliente
- Formulário para avaliar serviços concluídos

### 🖼️ Cliente - Portfolio (`/client/portfolio`)
- Galeria de imagens do estabelecimento

---

### 📊 Admin - Dashboard (`/admin`)
- KPIs: Receita, Agendamentos hoje, Pagamentos pendentes, Avaliação média
- Agenda do dia
- Pagamentos aguardando validação
- Ações rápidas (Confirmar, Aprovar pagamento)

### 📅 Admin - Agenda (`/admin/agenda`)
- Visualização por dia/semana
- Filtros por profissional e serviço
- Modal de detalhes do agendamento
- Ações: Confirmar, Concluir, Cancelar

### ✂️ Admin - Serviços (`/admin/services`)
- CRUD de serviços
- Campos: nome, descrição, preço, duração, categoria

### 👥 Admin - Profissionais (`/admin/professionals`)
- CRUD de profissionais
- Associação com serviços

### 💳 Admin - Pagamentos (`/admin/payments`)
- Lista de pagamentos por status
- Validação de comprovantes
- Ações: Aprovar, Rejeitar
- Histórico de transações

### 📈 Admin - Relatórios (`/admin/reports`)
- Gráficos de receita por período
- Agendamentos por profissional
- Relatório de comissões
- Serviços mais populares

### ⭐ Admin - Avaliações (`/admin/reviews`)
- Lista todas avaliações
- Responder avaliações
- Ocultar/Mostrar avaliações

### 🤖 Admin - WhatsApp IA (`/admin/whatsapp`)
- Configuração do agente
- Histórico de conversas
- Estatísticas

### ⚙️ Admin - CMS/Configurações (`/admin/settings`)
- Nome do estabelecimento
- Upload de logo
- Chave PIX
- Cor do tema
- **Gerenciamento de horários** (Adicionar/Remover/Ativar/Desativar)
- Gerenciamento do portfolio

### 🔔 Admin - Notificações (`/admin/notifications`)
- Central de notificações
- Marcar como lida

---

## APIs Esperadas

### Establishment

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/establishment` | Retorna dados do estabelecimento |
| PUT | `/api/establishment` | Atualiza dados (nome, pix, themeColor) |
| POST | `/api/establishment/logo` | Upload de logo (multipart) |
| DELETE | `/api/establishment/logo` | Remove logo |
| PUT | `/api/establishment/time-slots` | Atualiza lista de horários |
| PUT | `/api/establishment/portfolio` | Atualiza portfolio |

### Services

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/services` | Lista todos serviços |
| GET | `/api/services/:id` | Detalhe de um serviço |
| POST | `/api/services` | Cria serviço |
| PUT | `/api/services/:id` | Atualiza serviço |
| DELETE | `/api/services/:id` | Remove serviço |

### Professionals

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/professionals` | Lista todos profissionais |
| GET | `/api/professionals/:id` | Detalhe de um profissional |
| POST | `/api/professionals` | Cria profissional |
| PUT | `/api/professionals/:id` | Atualiza profissional |
| DELETE | `/api/professionals/:id` | Remove profissional |

### Appointments

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/appointments` | Lista agendamentos (query: date, status, professionalId) |
| GET | `/api/appointments/:id` | Detalhe de um agendamento |
| POST | `/api/appointments` | Cria agendamento (status inicial: `requested`) |
| PUT | `/api/appointments/:id/status` | Atualiza status |
| POST | `/api/appointments/:id/payment-receipt` | Upload comprovante |
| DELETE | `/api/appointments/:id` | Cancela agendamento |

### Reviews

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/reviews` | Lista avaliações (query: isHidden) |
| POST | `/api/reviews` | Cria avaliação |
| PUT | `/api/reviews/:id/response` | Responde avaliação |
| PUT | `/api/reviews/:id/visibility` | Oculta/Mostra avaliação |

### WhatsApp Agent

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/whatsapp/agent` | Retorna configuração do agente |
| PUT | `/api/whatsapp/agent` | Atualiza configuração |
| GET | `/api/whatsapp/conversations` | Lista conversas |
| GET | `/api/whatsapp/conversations/:id` | Detalhe da conversa |

### Reports

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/reports/revenue` | Receita por período (query: startDate, endDate) |
| GET | `/api/reports/appointments` | Agendamentos por período |
| GET | `/api/reports/commissions` | Relatório de comissões |
| GET | `/api/reports/kpis` | KPIs do dashboard |

### Notifications

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/notifications` | Lista notificações |
| PUT | `/api/notifications/:id/read` | Marca como lida |
| PUT | `/api/notifications/read-all` | Marca todas como lidas |

---

## Autenticação

O frontend espera autenticação via **JWT**. Endpoints necessários:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login (email + senha) |
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Dados do usuário logado |
| POST | `/api/auth/refresh` | Refresh token |

### Roles Esperadas
- `admin` - Acesso ao painel administrativo
- `client` - Acesso às funcionalidades de cliente

---

## Storage & Uploads

### Uploads Esperados

1. **Logo do estabelecimento**
   - Formato: PNG, JPG, SVG
   - Tamanho máximo: 2MB
   - Retorno: URL da imagem

2. **Fotos do portfolio**
   - Formato: PNG, JPG
   - Tamanho máximo: 5MB
   - Retorno: URL da imagem

3. **Comprovantes de pagamento**
   - Formato: PNG, JPG, PDF
   - Tamanho máximo: 5MB
   - Retorno: URL do arquivo

4. **Avatar de profissionais**
   - Formato: PNG, JPG
   - Tamanho máximo: 2MB
   - Retorno: URL da imagem

---

## Como Rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd bizflow-harmony-main

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

### Variáveis de Ambiente

Criar arquivo `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_UPLOAD_URL=http://localhost:3000/uploads
```

### Build para Produção

```bash
npm run build
npm run preview
```

---

## Observações Importantes

1. **Dados Mock**: Atualmente todos os dados vêm de `src/data/mockData.ts`. Este arquivo deve ser substituído por chamadas à API.

2. **Contextos**: `ThemeContext` e `EstablishmentContext` gerenciam estado global. Após integração, esses contextos devem buscar dados da API.

3. **TanStack Query**: Já está configurado e pronto para ser usado com as APIs.

4. **Horários**: Os horários disponíveis são gerenciados pelo admin. O cliente só vê os horários marcados como `isActive: true`.

5. **Fluxo de Pagamento**:
   - Cliente agenda → status `requested`
   - Admin confirma → status `awaiting_payment`
   - Cliente envia comprovante → status `awaiting_validation`
   - Admin valida → status `confirmed`
   - Serviço realizado → status `completed`

6. **Websockets** (Opcional): Para notificações em tempo real, considerar Socket.IO ou Server-Sent Events.

---

## Contato

Para dúvidas sobre o frontend, entre em contato com a equipe de frontend.

---

*Documentação gerada em 16/12/2024*
