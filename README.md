# 🏷️ Price Tagger

Sistema web para gerenciamento de pedidos de etiquetas de preço, desenvolvido com Next.js e Supabase.

## 📋 Sobre o Projeto

Price Tagger é uma aplicação que desenvolvi para mim e meus colegas de trabalho com o intuito de facilitar a solicitação de etiquetas de preço para os produtos da loja onde trabalhamos. O sistema nos ajuda a gerenciar os pedidos de forma eficiente, o que antes eram feitos através de caneta e papel, ficando sujeitos a erros de titulo, preço e quantidade de etiquetas. O sistema oferece autenticação segura, controle de acesso baseado em tipos de cadastro (admin ou employee) e uma interface responsiva construída com React e TailwindCSS com componentes seguindo o padrão minimalista do shadcn/ui.

## ✨ Funcionalidades

### Para Funcionários
- 📝 Criar novos pedidos de etiquetas
- 💰 Solicitar etiquetas com preço atual ou atualização de preço
- 📊 Visualizar histórico de pedidos
- 🔔 Acompanhar status dos pedidos (pendente, concluído, cancelado)
- 📝 Adicionar observações e detalhes do produto
- 👤 Gerenciar perfil e senha

### Para Administradores
- 🎯 Visualizar todos os pedidos pendentes
- ⚙️ Atualizar status dos pedidos
- 📈 Acessar histórico completo de pedidos
- 👥 Criar novos pedidos em nome de funcionários
- 🗑️ Deletar pedidos quando necessário
- ✅ Marcar pedidos como concluídos ou cancelados

### Autenticação
- 🔐 Login seguro com Supabase Auth
- 🔑 Recuperação de senha via email
- 🔄 Redefinição de senha
- 🛡️ Proteção de rotas baseada em funções (admin/employee)

## 🚀 Tecnologias Utilizadas

- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca para construção de interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Supabase](https://supabase.com/)** - Backend as a Service (autenticação e banco de dados)
- **[TailwindCSS 4](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis e sem estilo
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação de schemas
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones
- **[date-fns](https://date-fns.org/)** - Manipulação de datas
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificações toast

## 📦 Instalação

### Pré-requisitos

- Node.js 20 ou superior
- npm, yarn, pnpm ou bun
- Conta no [Supabase](https://supabase.com/)

### Configuração

1. **Clone o repositório**
   ```bash
   git clone https://github.com/douglasshinzato/price-tagger.git
   cd price-tagger
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   # ou
   bun install
   ```

3. **Configure as variáveis de ambiente**
   
   Copie o arquivo de exemplo e preencha com suas credenciais do Supabase:
   ```bash
   cp env.example .env.local
   ```
   
   Edite o arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
   ```

4. **Configure o banco de dados no Supabase**
   
   Execute os seguintes comandos SQL no editor SQL do seu projeto Supabase:
   
   **Tabela de Funcionários:**
   ```sql
   CREATE TABLE public.employees (
     id uuid NOT NULL,
     name text NOT NULL,
     email text NOT NULL UNIQUE,
     role text NOT NULL DEFAULT 'employee'::text 
       CHECK (role = ANY (ARRAY['admin'::text, 'employee'::text])),
     created_at timestamp with time zone DEFAULT now(),
     CONSTRAINT employees_pkey PRIMARY KEY (id),
     CONSTRAINT employees_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
   );
   ```

   **Tabela de Pedidos de Etiquetas:**
   ```sql
   CREATE TABLE public.label_orders (
     id uuid NOT NULL DEFAULT gen_random_uuid(),
     product_name text NOT NULL,
     current_price numeric NOT NULL,
     needs_price_update boolean DEFAULT false,
     new_price numeric,
     label_quantity integer NOT NULL CHECK (label_quantity > 0),
     status text NOT NULL DEFAULT 'pending'::text 
       CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'cancelled'::text])),
     employee_id uuid NOT NULL,
     employee_name text NOT NULL,
     created_at timestamp with time zone DEFAULT now(),
     completed_at timestamp with time zone,
     observations text,
     product_details text,
     CONSTRAINT label_orders_pkey PRIMARY KEY (id),
     CONSTRAINT label_orders_employee_id_fkey FOREIGN KEY (employee_id) 
       REFERENCES public.employees(id)
   );
   ```

   **Políticas de Segurança (RLS):**
   ```sql
   -- Habilitar RLS
   ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.label_orders ENABLE ROW LEVEL SECURITY;

   -- Políticas para employees
   CREATE POLICY "Usuários podem ver seu próprio perfil"
     ON public.employees FOR SELECT
     USING (auth.uid() = id);

   CREATE POLICY "Admins podem ver todos os funcionários"
     ON public.employees FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM public.employees
         WHERE id = auth.uid() AND role = 'admin'
       )
     );

   -- Políticas para label_orders
   CREATE POLICY "Funcionários podem ver seus próprios pedidos"
     ON public.label_orders FOR SELECT
     USING (employee_id = auth.uid());

   CREATE POLICY "Admins podem ver todos os pedidos"
     ON public.label_orders FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM public.employees
         WHERE id = auth.uid() AND role = 'admin'
       )
     );

   CREATE POLICY "Funcionários podem criar pedidos"
     ON public.label_orders FOR INSERT
     WITH CHECK (employee_id = auth.uid());

   CREATE POLICY "Admins podem criar qualquer pedido"
     ON public.label_orders FOR INSERT
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM public.employees
         WHERE id = auth.uid() AND role = 'admin'
       )
     );

   CREATE POLICY "Admins podem atualizar pedidos"
     ON public.label_orders FOR UPDATE
     USING (
       EXISTS (
         SELECT 1 FROM public.employees
         WHERE id = auth.uid() AND role = 'admin'
       )
     );

   CREATE POLICY "Admins podem deletar pedidos"
     ON public.label_orders FOR DELETE
     USING (
       EXISTS (
         SELECT 1 FROM public.employees
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

5. **Configure o primeiro usuário admin**
   
   Após criar um usuário via Supabase Auth, insira-o na tabela employees como admin:
   ```sql
   INSERT INTO public.employees (id, name, email, role)
   VALUES (
     'uuid-do-usuario-criado',
     'Nome do Admin',
     'email@exemplo.com',
     'admin'
   );
   ```

6. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   # ou
   bun dev
   ```

7. **Acesse a aplicação**
   
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🏗️ Estrutura do Projeto

```
price-tagger/
├── app/                      # Diretório do App Router
│   ├── (protected)/         # Rotas protegidas
│   │   ├── admin/          # Dashboard do administrador
│   │   └── employee/       # Dashboard do funcionário
│   ├── actions/            # Server Actions
│   ├── forgot-password/    # Recuperação de senha
│   ├── reset-password/     # Redefinição de senha
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página de login
│   └── globals.css         # Estilos globais
├── components/             # Componentes React
│   ├── ui/                # Componentes de UI reutilizáveis
│   ├── login-form.tsx     # Formulário de login
│   ├── order-form.tsx     # Formulário de pedidos
│   ├── order-list-item.tsx # Item de pedido
│   ├── order-history-list.tsx # Lista de histórico
│   └── ...
├── lib/                   # Utilitários e configurações
│   └── supabase/         # Cliente Supabase
│       ├── server.ts     # Cliente server-side
│       └── client.ts     # Cliente client-side
├── public/               # Arquivos estáticos
└── package.json          # Dependências do projeto
```

## 📊 Modelo de Dados

### Tabela: employees
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID do usuário (referência auth.users) |
| name | text | Nome do funcionário |
| email | text | Email único do funcionário |
| role | text | Papel (admin ou employee) |
| created_at | timestamp | Data de criação |

### Tabela: label_orders
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID único do pedido |
| product_name | text | Nome do produto |
| current_price | numeric | Preço atual do produto |
| needs_price_update | boolean | Indica se precisa atualizar preço |
| new_price | numeric | Novo preço (se aplicável) |
| label_quantity | integer | Quantidade de etiquetas |
| status | text | Status (pending/completed/cancelled) |
| employee_id | uuid | ID do funcionário solicitante |
| employee_name | text | Nome do funcionário |
| created_at | timestamp | Data de criação |
| completed_at | timestamp | Data de conclusão |
| observations | text | Observações adicionais |
| product_details | text | Detalhes do produto |

## 🎨 Componentes Principais

- **LoginForm**: Formulário de autenticação com validação
- **OrderForm**: Criação e edição de pedidos de etiquetas com campos para:
  - Nome do produto
  - Preço atual
  - Atualização de preço (opcional)
  - Quantidade de etiquetas
  - Observações e detalhes
- **OrderListItem**: Card de pedido com ações (atualizar status, deletar)
- **OrderHistoryList**: Lista de histórico de pedidos com filtros
- **Header**: Navegação e informações do usuário

## 🔐 Autenticação e Autorização

O sistema usa Supabase Auth e Row Level Security (RLS) para implementar dois níveis de acesso:

- **Funcionário (employee)**: 
  - Pode criar e visualizar seus próprios pedidos
  - Acesso à rota `/employee`
  
- **Administrador (admin)**: 
  - Acesso completo a todos os pedidos
  - Pode atualizar status, deletar e criar pedidos
  - Acesso à rota `/admin`

As rotas são protegidas e redirecionam usuários não autenticados para a página de login.

## 🎯 Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Cria build de produção
npm run start    # Inicia o servidor de produção
npm run lint     # Executa o linter
```

## 🌐 Deploy

### Vercel (Recomendado)

A maneira mais fácil de fazer deploy é usar a [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Faça push do código para o GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy automático!

Consulte a [documentação de deploy do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.

### Variáveis de Ambiente de Produção

Para produção, considere adicionar:
```env
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
SUPABASE_SERVICE_ROLE_KEY=sua-service-key (apenas server-side)
```
