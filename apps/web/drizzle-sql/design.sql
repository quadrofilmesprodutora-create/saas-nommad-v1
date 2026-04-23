-- ============================================================
-- NOMMAD Design module — RLS + Storage bucket
-- Rodar manualmente no Supabase SQL Editor APÓS `pnpm db:push`
-- ============================================================

-- ----- RLS enable ------------------------------------------------
alter table public.design_jobs      enable row level security;
alter table public.design_workflows enable row level security;
alter table public.design_workers   enable row level security;

-- ----- design_jobs: user só vê/mexe nos próprios ----------------
drop policy if exists "design_jobs_select_own" on public.design_jobs;
create policy "design_jobs_select_own"
  on public.design_jobs for select
  using (auth.uid() = user_id);

drop policy if exists "design_jobs_insert_own" on public.design_jobs;
create policy "design_jobs_insert_own"
  on public.design_jobs for insert
  with check (auth.uid() = user_id);

-- update/delete: só service role (worker updates, user não edita histórico)
-- (service_role bypassa RLS automaticamente — sem policies = sem acesso pra auth users)

-- ----- design_workflows: leitura pra qualquer user logado -------
drop policy if exists "design_workflows_select_auth" on public.design_workflows;
create policy "design_workflows_select_auth"
  on public.design_workflows for select
  to authenticated
  using (enabled = true);

-- write: só service role (seed via API admin)

-- ----- design_workers: leitura pra qualquer user logado ---------
-- (UI mostra badge "online/offline", não expõe URL pro client)
drop policy if exists "design_workers_select_auth" on public.design_workers;
create policy "design_workers_select_auth"
  on public.design_workers for select
  to authenticated
  using (true);

-- write: só service role (heartbeat via API)

-- ----- Storage bucket -------------------------------------------
insert into storage.buckets (id, name, public)
  values ('design-assets', 'design-assets', false)
  on conflict (id) do nothing;

-- RLS Storage: user só lê do próprio prefixo {user_id}/*
drop policy if exists "design_assets_read_own" on storage.objects;
create policy "design_assets_read_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'design-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Worker (service role) escreve via upload — sem policy de insert pra authenticated,
-- só service_role bypassa.

-- ----- Realtime publication pra UI dar subscribe em design_jobs --
-- (pub supabase_realtime é criada pelo Supabase por default)
alter publication supabase_realtime add table public.design_jobs;
