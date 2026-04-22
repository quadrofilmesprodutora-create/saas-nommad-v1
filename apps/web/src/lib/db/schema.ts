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
  name: text('name').notNull(),
  artistName: text('artist_name'),
  genre: text('genre'),
  stage: text('stage').default('iniciante'),      // iniciante | intermediario | avancado
  plan: text('plan').notNull().default('free'),   // free | pro | premium
  stripeCustomerId: text('stripe_customer_id'),
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
