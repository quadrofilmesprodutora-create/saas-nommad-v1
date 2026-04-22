# 06 — Roadmap

## Milestone 0 — Terreno (FEITO)
- [x] Leitura e síntese da visão
- [x] Arquitetura em docs
- [x] Estrutura de pastas + agentes especificados
- [x] Decisão de stack

## Milestone 1 — Vertical Slice (2 semanas)

Objetivo: um artista real grava um áudio e recebe Minha Marca + primeira missão.

- [ ] `npm create next-app@latest apps/web` (TS, Tailwind, App Router)
- [ ] Supabase project + migrations iniciais (profiles, identity, sessions, missions)
- [ ] Auth Supabase (email + magic link)
- [ ] `/api/transcribe` (Groq Whisper)
- [ ] Implementar **Cleaner + Analyst + Strategist + Brain + Response + Mission** em TS
- [ ] `/api/orchestrate` rodando o pipeline completo (sem Classifier, sem Check-in, sem Psycho)
- [ ] UI: onboarding por áudio + reveal Minha Marca + card da primeira missão
- [ ] Deploy Vercel + teste com 3 artistas reais

Critério de sucesso: 2/3 dos testados dizem "isso me descreveu bem".

## Milestone 2 — Sistema base (3 semanas)

- [ ] Classifier (nível + confronto)
- [ ] Check-in agent + UI de retorno
- [ ] Kanban Editorial (colunas, drag, card modal)
- [ ] Gerador (Hooks) com ações Salvar/Roteiro/Aprofundar
- [ ] Memory chunks + pgvector para contexto de check-in
- [ ] Stripe subscription (plano Pro R$ 500)
- [ ] Landing page + pricing
- [ ] Logs estruturados (Sentry + tabela `agent_runs`)

## Milestone 3 — Diferenciais (3 semanas)

- [ ] Release System (timeline + auto-geração de cards)
- [ ] Evolução (dashboard de métricas)
- [ ] Calendário (drag do Kanban)
- [ ] Editor de Carrossel (templates)
- [ ] Cérebro (grafo inicial com react-flow)
- [ ] **Boss System — Sprint 1+2** (ver `docs/07-boss-system.md`): proof interpreter, network builder, bosses + proofs + avatar upload, UI `/chefoes`, integração com Brain onboarding

## Milestone 3.5 — Boss System completo (2 semanas)

Referência: `docs/07-boss-system.md`. Decisão: arquétipos híbridos (catálogo curado + IA personaliza).

- [ ] Sprint 3 — Scoring: ranking determinístico, cron semanal, UI `/ranking`, badges
- [ ] Sprint 4 — Premium: Psycho lê boss history, CRM UI completa `/network`

## Milestone 4 — Premium (2 semanas)

- [ ] Psycho Agent (Opus) + UI
- [ ] Plano Premium R$ 1500 (Stripe)
- [ ] Relatório mensal PDF

## Milestone 5 — Escala (contínuo)

- [ ] Integração Spotify (stats + track import)
- [ ] Integração Instagram/TikTok (métricas de post publicado)
- [ ] Versão EN-US + Stripe USD
- [ ] App mobile (PWA primeiro, nativo só se justificar)
- [ ] Fine-tuning de voz (só depois de 500+ usuários de dados)

## Quando rodar o quê

| Fase | Foco | Quem executa |
|---|---|---|
| M1 | Pipeline técnico + onboarding | Matheus (dev) |
| M2 | Produtização + monetização | Matheus + Diogo (tom) |
| M3 | Moats (release, cérebro) | Matheus + Diogo |
| M4 | Premium | Matheus |
| M5 | Crescimento | Matheus + marketing |

## Anti-escopo permanente

- App mobile nativo no M1-M4
- Dashboard administrativo (usar Supabase Studio)
- Internacionalização antes dos EUA (M5)
- Fine-tuning antes de 500 usuários
- Integrações de distribuição musical (M5+)
