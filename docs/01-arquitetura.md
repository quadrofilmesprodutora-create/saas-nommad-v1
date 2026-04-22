# 01 — Arquitetura Técnica

## 1. Decisões fundadoras

| Decisão | Escolha | Razão |
|---|---|---|
| Linguagem | TypeScript end-to-end | Tipos nos contratos entre agentes são críticos |
| Framework | Next.js 15 (App Router) | Mesma base do ref, Vercel, RSC para UI complexa |
| Banco | Supabase (Postgres + pgvector + Auth + Storage) | Multi-tenant via RLS, vector built-in, auth pronto |
| ORM | Drizzle | Tipagem forte, migrations versionadas |
| IA | Anthropic direto via SDK + Vercel AI SDK para UI streaming | Tool-calls nativos, JSON schema estável |
| Transcrição | Groq Whisper (fallback OpenAI) | Latência < 3s em áudios de 2min |
| Pagamentos | Stripe | Assinatura recorrente, portal self-service |
| Deploy | Vercel | Paridade com ref, edge functions |
| Observabilidade | Sentry + PostHog | Erros + analytics de produto |

## 2. Topologia

```
┌──────────────────────────────────────────────────────────────────┐
│ Browser (Next.js RSC + Client Components)                        │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Next.js Route Handlers  │
                    │  /api/transcribe        │
                    │  /api/orchestrate       │
                    │  /api/agents/[name]     │
                    │  /api/webhooks/stripe   │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐     ┌─────────▼──────────┐   ┌─────────▼────────┐
│ Agents Runtime │     │ Brain Orchestrator │   │ Memory Service   │
│ (pure TS mods) │◄────┤   (parallel exec)  ├──►│ (Postgres+vector)│
└───────┬────────┘     └─────────┬──────────┘   └──────────────────┘
        │                        │
┌───────▼────────┐       ┌───────▼────────┐
│ Anthropic API  │       │ Supabase DB    │
└────────────────┘       └────────────────┘
```

## 3. Princípios de design

### 3.1 Contratos JSON versionados
Cada agente expõe **input schema** e **output schema** em Zod. O orquestrador valida. Se o agente devolver fora do schema, retry (max 2) → fallback.

### 3.2 Responsabilidade única
Um agente faz **uma** coisa. Analyst não sugere missão. Strategist não diagnostica. Quebra isso, quebra consistência.

### 3.3 Paralelismo onde faz sentido
Após o Cleaner, **Analyst + Classifier + Strategist rodam em `Promise.all`**. Ganho ~2.5× de latência no caminho crítico.

### 3.4 Cérebro central > consenso
Agentes podem discordar. O Brain consolida e decide. Sem Brain, o sistema vira comitê confuso.

### 3.5 Memória resumida
A cada 20 interações ou 10k tokens acumulados, rodar **agente Summarizer interno** que comprime histórico mantendo: identidade (lossless), últimas 5 missões (lossless), restante (resumo).

### 3.6 Prompts como código
Prompts vivem em `/agents/*/prompt.md`, versionados no git. Alterar prompt = PR com review. Nunca hard-code em JS.

## 4. Segurança

- **RLS Supabase** em todas as tabelas com `user_id` — isolamento multi-tenant por padrão
- **Storage de áudio** com signed URLs (TTL 5min)
- **Sem API keys no cliente** — toda chamada de IA no server
- **Rate limit** por usuário: 10 onboardings/dia, 50 missões/dia, 3 psycho/mês
- **Sanitização de inputs** antes de entrar em prompt (prompt injection)

## 5. Custos estimados por usuário/mês

| Item | Custo |
|---|---|
| Transcrição áudio (3× mês × 2min) | ~R$ 0,15 |
| Pipeline completo (Haiku + Sonnet) × 4 interações/semana | ~R$ 8 |
| Psycho Agent (Opus, 1×/mês) — premium only | ~R$ 6 |
| Supabase (rateio) | ~R$ 2 |
| Vercel (rateio) | ~R$ 1 |
| **Total Pro (R$500)** | ~R$ 11 → **margem 97%** |
| **Total Premium (R$1500)** | ~R$ 17 → **margem 98%** |

## 6. O que NÃO fazer agora (anti-escopo)

- ❌ App mobile (PWA resolve 90%)
- ❌ Integrações de distribuição musical (DistroKid/ONErpm) — fase 2
- ❌ Fine-tuning de modelo — system prompt + memória resolvem
- ❌ LangChain / LlamaIndex — overhead sem benefício no nosso caso
- ❌ Microserviços — Next.js route handlers chegam até seed series A
