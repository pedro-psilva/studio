# Studio

Plataforma full stack de e-commerce e back-office construída com Next.js (App Router), React e TypeScript. Reúne loja virtual, painel administrativo, gestão de pedidos e produção, pagamentos e e-mails transacionais.

## Funcionalidades

**Loja**
- Catálogo e página de produto
- Carrinho e checkout
- Conta do cliente e histórico de pedidos

**Autenticação (Firebase)**
- Login, cadastro e verificação de e-mail
- Recuperação e redefinição de senha

**Painel administrativo**
- Pedidos, produtos, usuários e cupons
- Financeiro, relatórios em PDF e notificações
- Configurações da loja

**Produção**
- Esteira de produção em etapas: triagem → CAD/CAM → acabamento → expedição

**ESAP — gestão de desempenho**
- KPIs, metas, planos de ação, equipe e painel individual

**Integrações**
- Pagamentos via InfinitePay (criação de link, verificação e webhooks)
- E-mail transacional (SMTP/Brevo via Nodemailer): confirmação de pedido e atualização de status
- IA com Genkit + Google Gemini (configurado para evolução de recursos generativos)

## Stack

- Next.js 15 (App Router), React, TypeScript
- Tailwind CSS, Radix UI, Recharts
- Firebase Auth + Firebase Admin
- Genkit + Google GenAI (Gemini 2.5 Flash)
- Zod, React Hook Form
- Deploy: Firebase App Hosting

## Como rodar

Pré-requisitos: Node.js 20+ e um projeto Firebase.

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env.local` com as variáveis necessárias (Firebase, SMTP/Brevo, InfinitePay). Os nomes estão documentados em [`docs/env-variables.md`](docs/env-variables.md).
3. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
   App disponível em http://localhost:9002
4. (Opcional) Inicie o Genkit para os fluxos de IA:
   ```bash
   npm run genkit:dev
   ```

## Scripts

- `npm run dev` — ambiente de desenvolvimento (porta 9002)
- `npm run build` — build de produção
- `npm run start` — sobe o build de produção
- `npm run lint` — lint
- `npm run typecheck` — checagem de tipos
