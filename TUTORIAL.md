# 📚 Tutorial Completo - FlowMaster

## 🎯 Como Funciona o Sistema Multi-Tenant

**Cada conta que você cria é TOTALMENTE INDEPENDENTE!**

Quando você se registra:
- ✅ Você ganha um **link único** para sua loja: `/s/seu-slug`
- ✅ Seus **serviços** são só seus
- ✅ Seus **profissionais** são só seus
- ✅ Seus **clientes** são só seus
- ✅ Seus **agendamentos** são só seus

**Exemplo:**
- Salão da Maria: `http://localhost:5173/s/salao-da-maria`
- Barbearia do João: `http://localhost:5173/s/barbearia-do-joao`

Cada um tem seu próprio sistema, completamente isolado! 🔒

---

## 🚀 Passo a Passo - Primeiro Acesso

### 1️⃣ Registrar sua Conta

1. Acesse `http://localhost:5173`
2. Clique em **"Começar Agora"**
3. Preencha o formulário:
   ```
   Nome da Organização: Salão Beleza Total
   Seu Nome: Maria Silva
   Email: maria@salaobele zatotal.com
   Senha: ********
   ```
4. Clique em **"Criar Conta"**

**O que acontece:**
- ✅ Sistema cria sua conta
- ✅ Gera seu slug único: `salao-beleza-total`
- ✅ Cria um serviço padrão: "Consultoria / Avaliação"
- ✅ Cria você como profissional padrão
- ✅ Redireciona para o Dashboard

---

### 2️⃣ Personalizar seu Estabelecimento

**Vá para:** `/admin/settings`

#### Logo
1. Clique na área de upload
2. Selecione sua logo (PNG, JPG, SVG)
3. Máximo 2MB

#### Cor do Tema
1. Escolha uma cor predefinida OU
2. Use o seletor de cor personalizada
3. Veja o preview em tempo real

#### Informações
1. **Nome Público**: Como aparece para clientes
2. **Chave PIX**: Para receber pagamentos

**Clique em "Salvar Alterações"** ✅

---

### 3️⃣ Adicionar Serviços

**Vá para:** `/admin/services`

1. Clique em **"Novo Serviço"**
2. Preencha:
   ```
   Nome: Corte Feminino
   Descrição: Corte moderno com finalização
   Preço: 80.00
   Duração: 60 (minutos)
   Categoria: Cabelo
   ```
3. Clique em **"Criar Serviço"**

**Repita para todos os serviços:**
- Corte Masculino - R$ 40 - 30min - Cabelo
- Manicure - R$ 35 - 45min - Unhas
- Pedicure - R$ 40 - 50min - Unhas
- Escova - R$ 50 - 40min - Cabelo

**Resultado:** Serviços organizados por categoria! 📋

---

### 4️⃣ Adicionar Profissionais

**Vá para:** `/admin/professionals`

1. Clique em **"Novo Profissional"**
2. Preencha:
   ```
   Nome: Ana Costa
   Função: Cabeleireira
   ```
3. **Selecione os serviços** que ela faz:
   - ✅ Corte Feminino
   - ✅ Corte Masculino
   - ✅ Escova
4. Clique em **"Adicionar Profissional"**

**Adicione mais profissionais:**
```
Nome: Juliana Santos
Função: Manicure
Serviços: Manicure, Pedicure
```

**Resultado:** Equipe completa cadastrada! 👥

---

### 5️⃣ Compartilhar com Clientes

**Seu link único é:**
```
http://localhost:5173/s/salao-beleza-total
```

**Compartilhe este link:**
- 📱 WhatsApp
- 📘 Facebook
- 📷 Instagram
- 🌐 Site próprio

**Quando o cliente acessar:**
1. Verá seus serviços
2. Poderá escolher o profissional
3. Selecionará data e horário
4. Fará o agendamento
5. Enviará comprovante PIX

---

### 6️⃣ Gerenciar Agendamentos

**Vá para:** `/admin/agenda`

**Você pode:**
- 📅 Ver agendamentos por dia/semana
- 🔍 Filtrar por profissional
- 🔍 Filtrar por serviço
- ✅ Confirmar agendamentos
- ❌ Cancelar agendamentos
- ✔️ Marcar como concluído

**Clique em um agendamento** para ver detalhes completos.

---

### 7️⃣ Aprovar Pagamentos

**Vá para:** `/admin/payments`

**Você verá:**
- Lista de pagamentos pendentes
- Comprovante enviado pelo cliente
- Informações do agendamento

**Para aprovar:**
1. Clique em "Ver Comprovante"
2. Verifique se o valor está correto
3. Clique em **"Aprovar"**

**Status muda para:** ✅ Confirmado

---

## 🎨 Dicas de Uso

### Cores Recomendadas
- **Salão de Beleza:** Rosa (#EC4899), Roxo (#8B5CF6)
- **Barbearia:** Azul escuro (#1E40AF), Preto (#000000)
- **Spa:** Verde (#10B981), Azul claro (#3B82F6)

### Categorias Sugeridas
- Cabelo
- Unhas
- Estética
- Massagem
- Depilação
- Maquiagem
- Sobrancelha

### Preços Competitivos
Pesquise sua região e:
- Não seja o mais caro
- Não seja o mais barato
- Ofereça qualidade pelo preço justo

---

## 🔐 Segurança

**Seu sistema é 100% isolado:**
- ❌ Outros usuários NÃO veem seus dados
- ❌ Outros usuários NÃO acessam seus clientes
- ❌ Outros usuários NÃO veem seus agendamentos

**Cada tenant (conta) tem:**
- 🔒 Banco de dados isolado
- 🔒 Link único
- 🔒 Autenticação própria

---

## 📱 Portal do Funcionário

**Crie contas para seus funcionários:**

1. Vá para o banco de dados
2. Crie um usuário com `role: EMPLOYEE`
3. Funcionário acessa `/login`
4. É redirecionado para `/employee`

**Funcionário pode:**
- Ver seus próprios agendamentos
- Marcar como concluído
- Ver histórico

**Funcionário NÃO pode:**
- Acessar financeiro
- Criar/editar serviços
- Criar/editar profissionais
- Ver dados de outros profissionais

---

## 🆘 Problemas Comuns

### "Não consigo fazer login"
- ✅ Verifique se o email está correto
- ✅ Verifique se a senha está correta
- ✅ Certifique-se que o backend está rodando

### "Meu link não funciona"
- ✅ Verifique se está usando o slug correto
- ✅ Formato: `/s/seu-slug` (tudo minúsculo, sem espaços)
- ✅ Exemplo: `/s/salao-beleza-total`

### "Não vejo meus serviços"
- ✅ Certifique-se que está logado
- ✅ Vá para `/admin/services`
- ✅ Verifique se criou pelo menos um serviço

### "Cliente não consegue agendar"
- ✅ Verifique se tem serviços cadastrados
- ✅ Verifique se tem profissionais cadastrados
- ✅ Verifique se o profissional está vinculado ao serviço

---

## 🎯 Fluxo Completo - Resumo

```
1. VOCÊ se registra
   ↓
2. Sistema cria seu TENANT único
   ↓
3. Você personaliza (logo, cor, PIX)
   ↓
4. Você adiciona SERVIÇOS
   ↓
5. Você adiciona PROFISSIONAIS
   ↓
6. Você compartilha seu LINK único
   ↓
7. CLIENTES acessam seu link
   ↓
8. CLIENTES fazem agendamentos
   ↓
9. CLIENTES enviam comprovante PIX
   ↓
10. VOCÊ aprova pagamentos
    ↓
11. VOCÊ gerencia a agenda
    ↓
12. VOCÊ marca como concluído
    ↓
13. CLIENTE deixa avaliação
```

---

## 🚀 Próximos Passos

Depois de dominar o básico:

1. **Explore o Dashboard**
   - Veja suas métricas
   - Acompanhe receitas
   - Monitore agendamentos

2. **Configure Horários**
   - Adicione/remova horários disponíveis
   - Personalize para cada dia

3. **Gerencie Portfolio**
   - Adicione fotos dos seus trabalhos
   - Mostre para os clientes

4. **Analise Relatórios**
   - Veja os serviços mais vendidos
   - Identifique horários de pico
   - Planeje melhor sua agenda

---

**Pronto! Seu sistema está 100% configurado e pronto para receber clientes!** 🎉

**Dúvidas?** Consulte o README.md ou entre em contato.
