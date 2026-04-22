# SETUP — Como rodar o NOMMAD

## Pré-requisitos

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- Conta Supabase (supabase.com)
- Chave API Anthropic (console.anthropic.com)
- Chave API Groq (console.groq.com) — para transcrição
- Conta Stripe (para billing — pode pular no começo)

---

## 1. Variáveis de ambiente

```bash
cd apps/web
cp ../../.env.example .env.local
```

Preencha `.env.local` com as chaves. Mínimo para rodar:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
```

---

## 2. Instalar dependências

```bash
cd apps/web
pnpm install
```

---

## 3. Banco de dados (Supabase)

### 3.1 Criar projeto no Supabase
1. Acesse supabase.com → New Project
2. Copie a `DATABASE_URL` (Settings → Database → Connection string, modo "Transaction Pooler")
3. Copie `NEXT_PUBLIC_SUPABASE_URL` e as chaves anon/service_role

### 3.2 Rodar migrations
```bash
# Gerar SQL das migrations
pnpm db:generate

# Aplicar no banco
pnpm db:push
```

### 3.3 Ativar RLS no Supabase Dashboard
Para cada tabela criada, vá em Authentication → Policies e ative RLS.
Copie as policies do `docs/05-modelo-dados.md`.

### 3.4 Ativar pgvector (para memória semântica)
No SQL Editor do Supabase:
```sql
create extension if not exists vector;
```

---

## 4. Rodar em desenvolvimento

```bash
cd apps/web
pnpm dev
```

Acesse: http://localhost:3000

Fluxo: `/ → /onboarding → grave áudio → diagnóstico → /estrategia`

---

## 5. Build de produção

```bash
pnpm build
```

---

## 6. Deploy Vercel

```bash
npx vercel deploy
```

Adicione todas as env vars no Vercel Dashboard (Settings → Environment Variables).

---

## 7. Stripe (billing — opcional no início)

1. Crie os produtos no Stripe Dashboard:
   - `NOMMAD Pro` — R$500/mês → copie o Price ID pra `STRIPE_PRICE_ID_PRO`
   - `NOMMAD Premium` — R$1500/mês → `STRIPE_PRICE_ID_PREMIUM`
2. Configure o webhook apontando para `https://seu-dominio.vercel.app/api/webhooks/stripe`
3. Copie o webhook secret para `STRIPE_WEBHOOK_SECRET`

---

## 8. Estrutura de pastas key

```
apps/web/src/
├── lib/
│   ├── agents/         ← 8 agentes TS (cleaner, analyst, ...)
│   ├── brain/          ← orchestrator + consolidator
│   ├── db/             ← drizzle schema + client
│   ├── supabase/       ← server + client helpers
│   └── anthropic.ts    ← cliente + model config
├── app/
│   ├── (app)/          ← páginas autenticadas (sidebar)
│   ├── (auth)/         ← login
│   └── api/            ← route handlers
└── middleware.ts        ← proteção de rotas
```

---

## 9. Teste rápido do pipeline

Com o servidor rodando e `.env.local` preenchido, teste a API direto:

```bash
curl -X POST http://localhost:3000/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"rawText": "Minha história: comecei aos 16 anos fazendo techno no quarto. Hoje tenho 22k no Spotify mas tô travado em conteúdo. Quero tocar no D-Edge mas ninguém me conhece direito.", "artistName": "Teste"}'
```

Retorno esperado:
```json
{
  "response": "...",
  "mission": { "missao": "...", "tarefas": ["..."], ... },
  "brain": { "nivel": "intermediario", "confronto": 3, ... }
}
```

---

## 10. Próximos passos técnicos (M2+)

- Implementar `/api/webhooks/stripe`
- Salvar resultados do pipeline no banco (sessions, identity, missions, kanban_cards)
- Kanban com drag-and-drop (react-beautiful-dnd ou dnd-kit)
- Gerador de hooks usando identidade do artista
- Check-in flow no frontend
