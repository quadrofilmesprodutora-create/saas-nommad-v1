// Drizzle schema — run `npx drizzle-kit generate` after changes
// Mirrors docs/05-modelo-dados.md

import {
  pgTable, uuid, text, integer, boolean, timestamp, jsonb, index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ----------------------------------------------------------------
// profiles (extends Supabase auth.users)
// ----------------------------------------------------------------

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),                   // = auth.users.id
  name: text('name').notNull().default(''),
  artistName: text('artist_name'),
  genre: text('genre'),
  stage: text('stage').default('iniciante'),      // iniciante | intermediario | avancado
  plan: text('plan').notNull().default('free'),   // free | pro | premium
  stripeCustomerId: text('stripe_customer_id'),
  configJson: jsonb('config_json'),               // gamification config map (fields filled by user)
  xp: integer('xp').default(0),
  np: integer('np').default(0),
  badges: jsonb('badges'),                         // string[]
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// identity
// ----------------------------------------------------------------

export const identity = pgTable('identity', {
  userId: uuid('user_id').primaryKey(),
  essencia: text('essencia'),
  tesesCentrais: jsonb('teses_centrais'),         // string[]
  tesesSecundarias: jsonb('teses_secundarias'),   // string[]
  assuntos: jsonb('assuntos'),                    // string[]
  forcaMarca: integer('forca_marca').default(0),
  dna: jsonb('dna'),
  posicionamento: jsonb('posicionamento'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// behavior
// ----------------------------------------------------------------

export const behavior = pgTable('behavior', {
  userId: uuid('user_id').primaryKey(),
  consistenciaScore: integer('consistencia_score').default(0),
  execStreak: integer('exec_streak').default(0),
  padroes: jsonb('padroes'),          // string[]
  autossabotagens: jsonb('autossabotagens'), // string[]
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// sessions
// ----------------------------------------------------------------

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  kind: text('kind').notNull(), // onboarding | checkin | psycho | regen
  inputAudioUrl: text('input_audio_url'),
  inputText: text('input_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// agent_runs (telemetry)
// ----------------------------------------------------------------

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id').notNull(),
    agentName: text('agent_name').notNull(),
    model: text('model').notNull(),
    input: jsonb('input'),
    output: jsonb('output'),
    latencyMs: integer('latency_ms'),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    status: text('status').notNull().default('ok'), // ok | degraded | error
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({ sessionIdx: index('agent_runs_session_idx').on(t.sessionId) }),
)

// ----------------------------------------------------------------
// agent_messages — di\u00e1logo inter-agentes (critique + revise loop)
// ----------------------------------------------------------------

export const agentMessages = pgTable(
  'agent_messages',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id').notNull(),
    fromAgent: text('from_agent').notNull(),
    toAgent: text('to_agent'),
    turn: integer('turn').notNull().default(0),
    kind: text('kind').notNull(),         // draft | critique | revise | final
    content: jsonb('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    sessionTurnIdx: index('agent_messages_session_turn_idx').on(t.sessionId, t.turn),
  }),
)

// ----------------------------------------------------------------
// psycho_profiles — an\u00e1lise comportamental de 90d
// ----------------------------------------------------------------

export const psychoProfiles = pgTable('psycho_profiles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  sessionId: uuid('session_id'),
  arquetipoCrescimento: text('arquetipo_crescimento'),
  padroesDominantes: jsonb('padroes_dominantes'),
  autossabotagens: jsonb('autossabotagens'),
  alavancas: jsonb('alavancas'),
  riscoAtual: text('risco_atual'),
  proximoPasso: text('proximo_passo'),
  observacaoCritica: text('observacao_critica'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// boss_cases — CRM gamificado do Boss System
// ----------------------------------------------------------------

export const bossCases = pgTable(
  'boss_cases',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    bossId: text('boss_id').notNull(),               // slug do chef\u00e3o
    status: text('status').notNull().default('aberto'), // aberto | em_desafio | conquistado | fechado
    provas: jsonb('provas'),                          // string[]
    feedback: text('feedback'),
    abertoEm: timestamp('aberto_em', { withTimezone: true }).defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
  },
  (t) => ({ userIdx: index('boss_cases_user_idx').on(t.userId) }),
)

// ----------------------------------------------------------------
// missions + tasks
// ----------------------------------------------------------------

export const missions = pgTable('missions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  sessionId: uuid('session_id'),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  duracaoDias: integer('duracao_dias').default(7),
  status: text('status').notNull().default('active'), // active | completed | abandoned
  confrontoNivel: integer('confronto_nivel'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export const missionTasks = pgTable('mission_tasks', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  missionId: uuid('mission_id').notNull(),
  descricao: text('descricao').notNull(),
  done: boolean('done').default(false),
  orderIndex: integer('order_index').default(0),
})

// ----------------------------------------------------------------
// kanban_cards
// ----------------------------------------------------------------

export const kanbanCards = pgTable('kanban_cards', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  titulo: text('titulo').notNull(),
  tipo: text('tipo').notNull(),         // conteudo | musica | branding
  coluna: text('coluna').notNull(),     // ideias | em_desenvolvimento | agendado | publicado | arquivado
  prioridade: integer('prioridade').default(0),
  relacaoMissaoId: uuid('relacao_missao_id'),
  insights: text('insights'),
  metricas: jsonb('metricas'),
  resultado: text('resultado'),         // viralizou | normal | flopou
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// generated_hooks
// ----------------------------------------------------------------

export const generatedHooks = pgTable('generated_hooks', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  sessionId: uuid('session_id'),
  texto: text('texto').notNull(),
  categoria: text('categoria'),
  saved: boolean('saved').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// scripts
// ----------------------------------------------------------------

export const scripts = pgTable('scripts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  hookId: uuid('hook_id'),
  gancho: text('gancho'),
  introducao: text('introducao'),
  desenvolvimento: text('desenvolvimento'),
  encerramento: text('encerramento'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// releases (Release System)
// ----------------------------------------------------------------

export const releases = pgTable('releases', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  titulo: text('titulo').notNull(),
  tipo: text('tipo'),               // single | ep | album
  releaseDate: timestamp('release_date', { withTimezone: true }),
  status: text('status').default('planning'), // planning | in_progress | released | post
  timeline: jsonb('timeline'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// subscriptions
// ----------------------------------------------------------------

export const subscriptions = pgTable('subscriptions', {
  userId: uuid('user_id').primaryKey(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  plan: text('plan').notNull(),
  status: text('status').notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ----------------------------------------------------------------
// design — aba Design (ComfyUI pipeline local)
// ----------------------------------------------------------------

export const designWorkflows = pgTable('design_workflows', {
  slug: text('slug').primaryKey(),
  type: text('type').notNull(),                // capa | arte
  name: text('name').notNull(),
  description: text('description'),
  comfyJson: jsonb('comfy_json').notNull(),    // workflow ComfyUI em "API format"
  paramSchema: jsonb('param_schema').notNull(),// { prompt: { type:'string', required:true }, ... }
  defaults: jsonb('defaults'),                 // valores-base pra cada param
  enabled: boolean('enabled').default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const designWorkers = pgTable('design_workers', {
  id: text('id').primaryKey(),                 // uuid fixo por m\u00e1quina
  name: text('name').notNull().default('worker'),
  tailnetUrl: text('tailnet_url').notNull(),   // https://<host>.<tailnet>.ts.net
  vramMb: integer('vram_mb'),
  vramFreeMb: integer('vram_free_mb'),
  status: text('status').notNull().default('offline'), // online | busy | offline
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const designJobs = pgTable(
  'design_jobs',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id').notNull(),
    workerId: text('worker_id'),
    workflowSlug: text('workflow_slug').notNull(),
    type: text('type').notNull(),              // capa | arte
    status: text('status').notNull().default('queued'), // queued | dispatched | running | done | error
    params: jsonb('params').notNull(),         // { prompt, style, aspect, seed, ... }
    progress: integer('progress').default(0),  // 0..100
    comfyPromptId: text('comfy_prompt_id'),
    resultUrl: text('result_url'),
    thumbnailUrl: text('thumbnail_url'),
    error: text('error'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    userIdx: index('design_jobs_user_idx').on(t.userId),
    statusIdx: index('design_jobs_status_idx').on(t.status),
  }),
)
