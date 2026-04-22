# NOMMAD — Artist OS

> Sistema operacional de carreira para artistas/DJs.
> Sociedade Matheus Oliveira × Diogo O'Band (Nomad Media).

O que um estrategista de carreira faz manualmente (clareza, posicionamento, execução), o NOMMAD faz em escala — via pipeline multi-agente orquestrado por um cérebro central, alimentado pela voz e método do Diogo O'Band.

---

## 1. Visão de produto

- **ICP primário:** DJs e artistas de música eletrônica (BR → EUA)
- **Dor:** talento sem identidade, conteúdo sem consistência, carreira sem direção
- **Promessa:** do áudio ao plano em < 10 minutos, com clareza que parece que o Diogo está dentro do sistema
- **Preço-alvo:** R$ 500/mês (assinatura), com add-on premium para análise psicológica
- **Diferencial vs ferramentas genéricas:** roteiro + edição pronta + release system + voz Diogo

Ver `docs/00-visao.md`.

---

## 2. Arquitetura em 10 segundos

```
ÁUDIO DO ARTISTA
   ↓
[ Cleaner ]
   ↓
[ Analyst ∥ Classifier ∥ Strategist ]  ← paralelo
   ↓
[ Brain Central ] ← memória
   ↓
[ Response ] → chat
[ Mission  ] → Kanban
   ↓
[ Check-in ] (loop)
[ Psycho   ] (premium)
```

- **8 agentes** com responsabilidade única, I/O JSON estruturado (Zod).
- **Cérebro central** consolida, resolve conflitos, garante coerência.
- **Memória tripla**: identidade (persistente) + comportamento + histórico de missões.
- **Execução paralela** nos 3 analíticos — ganho real de latência.

Detalhe em `docs/01-arquitetura.md` e `brain/pipeline.md`.

---

## 3. Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui |
| Backend | Next.js Route Handlers + Supabase (Postgres + pgvector + Auth + Storage) |
| ORM | Drizzle |
| IA | Anthropic (Opus/Sonnet/Haiku) via Vercel AI SDK |
| Transcrição | Whisper (Groq) ou OpenAI |
| Pagamentos | Stripe |
| Deploy | Vercel |

Decisões em `docs/01-arquitetura.md`.

---

## 4. Estrutura do repo

```
/
├── README.md                    # este arquivo
├── docs/                        # visão, arquitetura, roadmap
├── agents/                      # os 8 agentes (prompt + I/O + regras)
├── brain/                       # orquestrador + cérebro central
├── memory/                      # camadas de memória
├── prompts/                     # system prompts base (voz do Diogo)
├── apps/web/                    # Next.js app (a criar)
├── frames sistema referência/   # screenshots do Influencia IA
├── PROJETO SAAS NOMMAD.TXT      # documento original da visão
├── REUNIAO DIOGO NOMMAD.txt     # resumo da reunião 21/04/2026
└── transcrição diogo mostrando sistema referência.txt
```

---

## 5. Próximos passos

1. `npm create next-app@latest apps/web` com TS + Tailwind
2. Supabase project + schema inicial (ver `docs/05-modelo-dados.md`)
3. Implementar `/agents/cleaner` + `/agents/analyst` + `/brain/orchestrator` (vertical slice mínima)
4. Landing + onboarding por áudio (vertical slice de conversão)
5. Replicar UI do Influencia IA em shadcn/ui (`docs/04-modulos.md`)

Roadmap completo em `docs/06-roadmap.md`.

---

## 6. Filosofia

> "Você não precisa de mais conteúdo. Você precisa de direção."

- Nunca gerar estratégia genérica
- Nunca copiar tendências sem contexto
- Sempre partir da essência do artista
- Sempre priorizar consistência sobre hype
