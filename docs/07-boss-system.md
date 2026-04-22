# 07 — Boss System (pós-MVP)

Status: **mapeado, não implementado.** Entra em sprint dedicado depois do MVP rodando.

---

## 1. O que muda vs. versão original do `nommad agent gamificado.txt`

Original: chefões genéricos ("fechar primeira gig", "primeiro conteúdo viral").
Refinado: **chefões são pessoas reais da carreira do artista** — contratantes, bookers, donos de casa, A&R, parceiros. O sistema identifica quem é o boss automaticamente, puxando do histórico.

> **Regra central:** o boss não é um objetivo abstrato — é alguém que o artista já interagiu (ou vai interagir). O objetivo (fechar gig, follow-up, segunda data) é a prova de que o relacionamento avançou.

Isso vira um **CRM artístico gamificado**, não um jogo.

---

## 2. Fluxo end-to-end

```
[1] artista cola conversa (WhatsApp, DM, email)
          │
          ▼
[2] Proof Interpreter Agent → extrai: {nome, contexto, resultado, tom, oportunidade}
          │
          ▼
[3] Network Builder Agent → cria/atualiza contato em `network_contacts`
          │
          ▼
[4] Boss Trigger Detector → esse contato + contexto = boss fight?
          │  (ex: "Arena Bar respondeu te chamando pra tocar" → dispara boss)
          ▼
[5] Challenge Generator → define o objetivo do boss (ex: "fechar gig Arena Bar")
          │
          ▼
[6] Boss criado em `bosses` com status=active, linked a network_contact_id
          │
          ▼
[7] artista vai colando updates da conversa ao longo do tempo
          │
          ▼
[8] Proof Interpreter reanalisa a cada update → atualiza boss.status
          │
          ▼
[9] Boss Feedback Agent responde em linguagem "chefão" após cada update
          │
          ▼
[10] Trigger de vitória: contratante aceita / agenda / marca retorno
          │   "parabéns, Arena Bar quer fechar novamente" = boss derrotado + XP + badge
          ▼
[11] Ranking Agent recalcula score
```

---

## 3. Triggers de detecção de Boss Fight

O sistema identifica automaticamente momentos de boss fight a partir de sinais no banco:

### 3.1 Triggers a partir de conversa (Proof Interpreter)
- Menção a local de show (bar, festival, club)
- Menção a valor / cachê / contrato
- Menção a data específica
- Pergunta do contratante ("quanto cobra?", "tem data livre?")
- Feedback pós-gig ("gostamos do seu set")

### 3.2 Triggers a partir de perfil do artista (Brain)
- Fase `pre_lancamento` + objetivo "fechar primeira gig" → primeiro contato vira boss
- Fase `construcao_base` + baixa execução → boss de consistência (agendar 3 shows)
- Contratante já aparece 3+ vezes no histórico → promover a "boss recorrente"

### 3.3 Triggers a partir de Mission Agent
- Missão envolve pessoa específica ("mandar mensagem pro Gabriel do Arena") → Mission cria o boss automaticamente

---

## 4. Tipos de Boss (catálogo híbrido)

**Arquétipos fixos (20-30 no catálogo)** — IA preenche com nome real do contratante:

| Arquétipo | Exemplo instanciado |
|---|---|
| `gig_first_contact` | "Fechar primeira gig com {nome_contratante}" |
| `gig_followup` | "Conseguir segunda data no {local}" |
| `gig_upsell` | "Subir cachê com {nome_contratante}" |
| `collab_pitch` | "Fechar collab com {nome_artista}" |
| `media_pitch` | "Entrar no {nome_playlist/veículo}" |
| `label_outreach` | "Resposta do A&R da {label}" |
| `festival_pitch` | "Abrir no {festival}" |
| `network_warm` | "Reativar contato frio com {nome}" |
| `audience_milestone` | "Primeiro post com 10k views" *(não tem pessoa)* |
| `revenue_first` | "Primeira receita paga por {fonte}" |

Catálogo vive em `bosses_archetypes` (seed data). IA escolhe o arquétipo certo pelo contexto + instancia com dados reais.

---

## 5. Schema DB (drizzle)

```ts
// Catálogo curado
export const bossArchetypes = pgTable('boss_archetypes', {
  slug: text('slug').primaryKey(),             // 'gig_first_contact'
  titulo: text('titulo').notNull(),            // "Fechar primeira gig com {nome}"
  categoria: text('categoria').notNull(),      // mercado | audiencia | network | financeiro
  dificuldade: text('dificuldade').notNull(),  // facil | medio | dificil
  xpReward: integer('xp_reward').notNull(),    // 50 | 100 | 200
  criterioValidacao: text('criterio_validacao').notNull(),
  requer_contato: boolean('requer_contato').default(true),
})

// CRM de contatos
export const networkContacts = pgTable('network_contacts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  nome: text('nome').notNull(),
  tipo: text('tipo').notNull(),                // contratante | artista | label | booker | media | fan_key
  contexto: text('contexto'),                  // "dono Arena Bar, zona sul sp"
  local: text('local'),                        // "Arena Bar, São Paulo"
  nivelRelacao: text('nivel_relacao').default('frio'), // frio | morno | quente | recorrente
  historico: jsonb('historico'),               // interactions log
  potencial: integer('potencial').default(0),  // 0-100 score
  avatarUrl: text('avatar_url'),               // default ou upload
  ultimaInteracao: timestamp('ultima_interacao', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Bosses ativos/concluídos
export const bosses = pgTable('bosses', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  archetypeSlug: text('archetype_slug').notNull(),
  contactId: uuid('contact_id'),               // null se boss sem pessoa (audience_milestone)
  titulo: text('titulo').notNull(),            // instanciado com nome real
  objetivo: text('objetivo').notNull(),
  criterioValidacao: text('criterio_validacao').notNull(),
  status: text('status').notNull().default('active'), // active | won | partial | failed | abandoned
  dificuldade: text('dificuldade').notNull(),
  xpReward: integer('xp_reward').notNull(),
  dispatchedBy: text('dispatched_by'),         // trigger | mission | manual
  avatarUrl: text('avatar_url'),               // foto do contratante (default ou real)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
})

// Provas enviadas (prints, conversas coladas)
export const bossProofs = pgTable('boss_proofs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  bossId: uuid('boss_id').notNull(),
  userId: uuid('user_id').notNull(),
  tipo: text('tipo').notNull(),                // conversa | print | voz | texto
  conteudo: text('conteudo').notNull(),        // conversa colada ou URL de upload
  interpretacao: jsonb('interpretacao'),       // output do Proof Interpreter
  feedbackBoss: text('feedback_boss'),         // output do Boss Feedback
  veredicto: text('veredicto'),                // sucesso | parcial | falha
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Score composto
export const leaderboardScores = pgTable('leaderboard_scores', {
  userId: uuid('user_id').primaryKey(),
  scoreTotal: integer('score_total').default(0),
  execScore: integer('exec_score').default(0),      // 25%
  bossScore: integer('boss_score').default(0),      // 35%
  impactScore: integer('impact_score').default(0),  // 25%
  evolScore: integer('evol_score').default(0),      // 15%
  fase: text('fase'),
  cidade: text('cidade'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Histórico de ranking
export const rankingSnapshots = pgTable('ranking_snapshots', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  score: integer('score').notNull(),
  positionGlobal: integer('position_global'),
  positionFase: integer('position_fase'),
  positionCidade: integer('position_cidade'),
  period: text('period').notNull(),            // weekly | monthly
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Badges
export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  slug: text('slug').notNull(),                // 'primeira_gig', 'primeiro_cache_pago', etc.
  titulo: text('titulo').notNull(),
  bossId: uuid('boss_id'),                     // de que boss veio
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow(),
})
```

RLS: policies padrão `user_id = auth.uid()` em todas exceto `boss_archetypes` (público read).

---

## 6. Agentes novos (apps/web/src/lib/agents/boss/)

### 6.1 `proof-interpreter.ts`
**Modelo:** sonnet (temp 0.3)
**Input:** `{ conversa: string, userId, existing_contacts?: NetworkContact[] }`
**Output:**
```json
{
  "contato_identificado": { "nome": "", "tipo": "", "contexto": "" },
  "resultado": "sucesso | parcial | falha | indeterminado",
  "analise": "o que aconteceu, tom, posicionamento do artista",
  "proximo_passo_sugerido": "",
  "oportunidade_futura": "",
  "triggers_detectados": ["gig_first_contact", ...],
  "sentimento_contratante": "receptivo | neutro | frio | fechado"
}
```
**Regra:** se `contato_identificado.nome` match com `existing_contacts`, reutiliza. Senão, cria novo.

### 6.2 `network-builder.ts`
**Modelo:** haiku (temp 0.2)
**Input:** output do Proof Interpreter + histórico do contato
**Output:** upsert em `network_contacts` + atualização de `nivel_relacao` (frio→morno→quente→recorrente).

### 6.3 `challenge-generator.ts`
**Modelo:** sonnet (temp 0.5)
**Input:** `{ identidade, fase, contato?, trigger, historico }`
**Output:**
```json
{
  "archetype_slug": "gig_first_contact",
  "titulo": "Fechar primeira gig com Gabriel (Arena Bar)",
  "objetivo": "Conseguir confirmação de data + cachê",
  "criterio_validacao": "Mensagem do contratante com data e valor confirmados",
  "dificuldade": "medio"
}
```

### 6.4 `boss-feedback.ts`
**Modelo:** sonnet (temp 0.8)
**Input:** interpretação + boss + histórico de proofs
**Output:** texto 80-150 palavras em **voz do chefão** — direto, simbólico leve, sem motivação barata. Exemplos:

- Vitória: *"Arena Bar caiu. Mas não confunda um sim com um cliente. Próxima conversa não pode depender do acaso."*
- Parcial: *"Ele não disse não. Disse que 'vai ver'. Em casa de show, isso é não. Reativa em 5 dias com proposta concreta."*
- Falha: *"Você esperou 2 semanas pra responder. Ele já contratou outro. Aprende: velocidade > perfeição na primeira resposta."*

### 6.5 `ranking.ts`
**Sem LLM** — cálculo determinístico. Roda em cron semanal.

```
execScore  = (missions_completed / missions_total) * 100 * freq_factor
bossScore  = Σ(boss_xp_reward)  por dificuldade
impactScore= gigs_fechadas*150 + collabs*100 + receita_normalizada
evolScore  = delta_consistencia * 100 (últimos 30d vs 30d anteriores)

scoreTotal = exec*0.25 + boss*0.35 + impact*0.25 + evol*0.15
```

### 6.6 `boss-trigger-detector.ts`
**Sem LLM** — rules engine. Roda:
- após cada `proof` submetida (checa se dispara novo boss)
- após brain onboarding (gera bosses iniciais baseados em fase + objetivos)

---

## 7. API routes

```
POST /api/boss/proof              → recebe conversa colada
                                    └─ proof-interpreter
                                       └─ network-builder
                                          └─ boss-trigger-detector
                                             └─ boss-feedback
                                    resposta: { boss_atualizado, feedback, novo_boss? }

POST /api/boss/generate-manual    → artista cria boss direto (sem prova)
GET  /api/boss/list               → bosses do user (active | won | failed)
GET  /api/boss/[id]               → detalhe + proofs + feedbacks
POST /api/boss/[id]/avatar        → upload de foto real do contratante

GET  /api/network                 → CRM completo
GET  /api/network/[id]            → detalhe + bosses relacionados + histórico

GET  /api/ranking                 → ?scope=global|fase|cidade|semanal
GET  /api/badges                  → badges do user
```

---

## 8. UX da aba Chefões

### 8.1 `/chefoes` (lista)
```
┌─────────────────────────────────────────────────┐
│ CHEFÕES ATIVOS                    [+ novo boss] │
├─────────────────────────────────────────────────┤
│ [avatar] Gabriel — Arena Bar                     │
│          Fechar primeira gig · médio · 100 XP    │
│          ⚡ última prova há 2 dias               │
├─────────────────────────────────────────────────┤
│ [avatar] Label XYZ — A&R Marcela                 │
│          Resposta do A&R · difícil · 200 XP      │
│          🟡 aguardando resposta                  │
├─────────────────────────────────────────────────┤
│ CONCLUÍDOS (3)                     RANKING #47  │
└─────────────────────────────────────────────────┘
```

### 8.2 `/chefoes/[id]` (arena)
```
┌─────────────────────────────────────────────────┐
│ [foto grande do boss]                            │
│ GABRIEL — ARENA BAR                              │
│ "Fechar primeira gig"                            │
│ médio · 100 XP · em andamento há 5 dias          │
├─────────────────────────────────────────────────┤
│ timeline de interações:                          │
│   [2d] você mandou proposta → parcial            │
│   [1d] ele respondeu morno → manter ritmo        │
│   [hoje] aguardando resposta                     │
├─────────────────────────────────────────────────┤
│ [ enviar prova / cola conversa ▼ ]              │
├─────────────────────────────────────────────────┤
│ ÚLTIMO FEEDBACK DO CHEFÃO:                       │
│ "Ele não disse não. Disse que 'vai ver'..."      │
└─────────────────────────────────────────────────┘
```

### 8.3 Foto do boss
- Default: avatar gerado (iniciais + cor baseada em tipo — contratante laranja, label roxo, artista azul)
- Upload: `POST /api/boss/[id]/avatar` → Supabase Storage bucket `boss-avatars`

### 8.4 `/ranking`
Tabs: Global · Minha Fase · Minha Cidade · Semanal
Cada linha: posição, nome artístico, fase, score, ∆posição últimos 7d
Destaque do próprio user com "você está à frente de X% na sua fase"

---

## 9. Integração com pipeline existente

### 9.1 No onboarding
Brain Central, ao consolidar, dispara `boss-trigger-detector` com fase + objetivos declarados → gera **2-3 bosses iniciais** baseados no catálogo (ex: "Primeira gig", "Primeira collab", "Primeiro post com X views") que **aparecem vazios** até o artista adicionar contato real ou conversa.

### 9.2 No Mission Agent
Mission Agent passa a **consultar bosses ativos** ao gerar missões. Se existe boss `gig_first_contact` com Arena Bar ativo, missão da semana pode ser "Mandar proposta formal pro Gabriel (Arena Bar) até sexta".
Boss e missão ficam **linkados** — completar a missão gera prova automática.

### 9.3 No Psycho Agent (Premium)
Psycho passa a ler `network_contacts.historico` + bosses perdidos → detecta padrões tipo "você perde 70% dos bosses que passam 5 dias sem follow-up" → vira autossabotagem nomeada.

### 9.4 No Check-in semanal
Check-in pergunta sobre bosses ativos. Se user diz "mandei msg pro Gabriel", system pede "cola a resposta aqui" → proof interpreter roda.

---

## 10. Anti-farm (crítico)

- **Peso maior em bosses com prova verificável** (conversa real > ação declarada)
- **Diminuição de peso em bosses repetidos** — 3º boss do mesmo arquétipo vale 50% menos
- **Proof Interpreter detecta inconsistências** (conversa fake, timeline impossível) → marca prova como `suspeita`, não conta pro score
- **Ranking semanal decai** se user parar de interagir (não vira leaderboard de histórico, é de atividade atual)
- **Badges só por vitória comprovada** — não por tempo na plataforma

---

## 11. Decisões pendentes (revisitar em M2)

- [ ] Catálogo inicial de arquétipos — Diogo seleciona os 20-30 mais comuns
- [ ] Leaderboard global vs só-fase no MVP do boss system (recomendação: só-fase no início)
- [ ] Matchmaking entre artistas (pedido original do .txt) — avaliar em M3
- [ ] Ranking visível pra contratantes (selo "Top 10%") — avaliar em M3, implica pública página de perfil

---

## 12. Ordem de implementação (quando for hora)

**Sprint 1 — Foundation**
1. Schema DB (7 tabelas) + RLS
2. Seed catalogo `boss_archetypes`
3. `proof-interpreter` + `network-builder` agents
4. `/api/boss/proof` route
5. Supabase Storage bucket `boss-avatars`

**Sprint 2 — Game loop**
6. `challenge-generator` + `boss-feedback` + `boss-trigger-detector`
7. `/api/boss/list`, `/api/boss/[id]`, `/api/boss/generate-manual`
8. UI `/chefoes` + `/chefoes/[id]`
9. Integração com Brain onboarding (gera bosses iniciais)

**Sprint 3 — Scoring & Rewards**
10. `ranking.ts` determinístico + cron semanal
11. `/api/ranking` + UI `/ranking`
12. Badges engine + UI
13. Integração com Mission Agent (bosses ↔ missões linkadas)

**Sprint 4 — Premium/Escala**
14. Psycho Agent lê boss history
15. CRM UI completa `/network`
16. Decisão sobre matchmaking / reputação pública

---

## 13. Por que isso muda o produto

Antes: NOMMAD é "consultoria estratégica + missões" (produto de conteúdo).
Depois: NOMMAD é "Artist OS com carreira real rastreada e gamificada" (produto de plataforma).

O diferencial defensável passa a ser o **grafo de contatos reais + histórico de validação** que cada artista acumula na plataforma. Isso é impossível de replicar via ChatGPT genérico. É por isso que vale R$1500 o plano premium.

---

**TL;DR** — boss system = CRM gamificado que vira o core da retenção. MVP entrega o pipeline base; boss system transforma o produto em sistema. Mapeado aqui, implementado depois.
