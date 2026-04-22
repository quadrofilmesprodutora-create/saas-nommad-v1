# 05 — Modelo de Dados (Supabase / Postgres)

Rascunho da camada de persistência. Toda tabela com `user_id` tem **RLS ativado** com policy `auth.uid() = user_id`.

## 1. Core

### `users`
Gerenciado por Supabase Auth. Extensão via `profiles`:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  artist_name text,
  genre text,             -- principal gênero
  stage text,             -- iniciante | intermediario | avancado (read-only, set by Classifier)
  plan text not null default 'free', -- free | pro | premium
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `identity` (Minha Marca, persistente)
```sql
create table identity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  essencia text,
  teses_centrais jsonb,       -- string[]
  teses_secundarias jsonb,    -- string[]
  assuntos jsonb,             -- string[]
  forca_marca int,            -- 0..100
  dna jsonb,                  -- personalidade, arquetipo, diferencial
  posicionamento jsonb,       -- nicho, publico, cena
  updated_at timestamptz default now()
);
```

### `behavior` (memória de comportamento)
```sql
create table behavior (
  user_id uuid primary key references auth.users(id),
  consistencia_score int,             -- 0..100
  exec_streak int default 0,          -- dias
  padroes jsonb,                      -- padrões identificados
  autossabotagens jsonb,              -- lista
  updated_at timestamptz default now()
);
```

## 2. Sessões e agentes

### `sessions`
Um ciclo de pipeline (onboarding ou check-in).

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,        -- onboarding | checkin | psycho | regen
  input_audio_url text,
  input_text text,
  created_at timestamptz default now()
);
```

### `agent_runs`
Telemetria por agente.

```sql
create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  agent_name text not null,  -- cleaner | analyst | ...
  model text not null,
  input jsonb,
  output jsonb,
  latency_ms int,
  tokens_in int,
  tokens_out int,
  cost_usd numeric(10,6),
  status text not null,      -- ok | degraded | error
  error text,
  created_at timestamptz default now()
);
create index on agent_runs (session_id);
create index on agent_runs (agent_name, created_at desc);
```

## 3. Missões e Kanban

### `missions`
```sql
create table missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references sessions(id),
  titulo text not null,
  descricao text,
  duracao_dias int default 7,
  status text not null default 'active', -- active | completed | abandoned
  confronto_nivel int,        -- 1..5 no momento da criação
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table mission_tasks (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  descricao text not null,
  done boolean default false,
  order_index int default 0
);
```

### `kanban_cards`
```sql
create table kanban_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  tipo text not null,        -- conteudo | musica | branding
  coluna text not null,      -- ideias | em_desenvolvimento | agendado | publicado | arquivado
  prioridade int default 0,
  relacao_missao_id uuid references missions(id),
  insights text,
  metricas jsonb,            -- after publicado
  resultado text,            -- viralizou | normal | flopou
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 4. Conteúdo gerado

### `generated_hooks`, `scripts`, `carousels`
```sql
create table generated_hooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  session_id uuid references sessions(id),
  texto text not null,
  categoria text,
  saved boolean default false,
  created_at timestamptz default now()
);

create table scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  hook_id uuid references generated_hooks(id),
  gancho text,
  introducao text,
  desenvolvimento text,
  encerramento text,
  created_at timestamptz default now()
);
```

## 5. Release System

```sql
create table releases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  titulo text not null,
  tipo text,               -- single | ep | album
  release_date date,
  status text,             -- planning | in_progress | released | post
  timeline jsonb,          -- fases T-60 ... T+30
  created_at timestamptz default now()
);
```

## 6. Memória semântica

### `memory_chunks` (pgvector)
Armazena embeddings para retrieval em conversas longas / check-ins.

```sql
create extension if not exists vector;

create table memory_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,        -- history | insight | message | mission_summary
  content text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);
create index on memory_chunks using ivfflat (embedding vector_cosine_ops);
create index on memory_chunks (user_id, kind, created_at desc);
```

## 7. Billing

```sql
create table subscriptions (
  user_id uuid primary key references auth.users(id),
  stripe_subscription_id text unique,
  plan text not null,
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);
```

## 8. RLS (exemplo)

```sql
alter table identity enable row level security;

create policy "owner can read" on identity
  for select using (auth.uid() = user_id);

create policy "owner can write" on identity
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Replicar padrão em toda tabela com `user_id`.

## 9. Migrations

Via Drizzle Kit. Cada mudança em branch + PR. Rodar `drizzle-kit generate` → commit dos SQL → `drizzle-kit migrate` no deploy.
