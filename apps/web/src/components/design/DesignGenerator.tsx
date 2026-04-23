'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { GlassCard } from '@/components/ui'
import { createSupabaseClient } from '@/lib/supabase/client'
import { DesignJobCard, type DesignJob } from './DesignJobCard'
import { useWorkerOnline } from './WorkerBadge'

type Workflow = {
  slug: string
  type: string
  name: string
  description: string | null
  paramSchema: Record<string, unknown>
  defaults: Record<string, unknown> | null
}

type Props = {
  type: 'capa' | 'arte'
  title: string
  description: string
  placeholder: string
}

export function DesignGenerator({ type, title, description, placeholder }: Props) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [slug, setSlug] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [jobs, setJobs] = useState<DesignJob[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workerOnline = useWorkerOnline()

  // Carrega workflows do tipo.
  useEffect(() => {
    let alive = true
    fetch(`/api/design/workflows?type=${type}`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        const ws = (data.workflows ?? []) as Workflow[]
        setWorkflows(ws)
        if (ws.length > 0) setSlug(ws[0].slug)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [type])

  // Carrega jobs existentes.
  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch(`/api/design/jobs?type=${type}&limit=24`)
      const data = await res.json()
      setJobs(mapJobs(data.jobs ?? []))
    } catch {}
  }, [type])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  // Realtime subscribe — atualiza qualquer job visível.
  useEffect(() => {
    const supabase = createSupabaseClient()
    const channel = supabase
      .channel(`design_jobs_${type}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'design_jobs', filter: `type=eq.${type}` },
        (payload) => {
          const row = payload.new as Record<string, unknown> | undefined
          if (!row) return
          const newJob = mapJob(row)
          setJobs((prev) => {
            const idx = prev.findIndex((j) => j.id === newJob.id)
            if (idx === -1) return [newJob, ...prev].slice(0, 24)
            const next = [...prev]
            next[idx] = newJob
            return next
          })
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [type])

  const handleSubmit = async () => {
    if (!slug || !prompt.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const wf = workflows.find((w) => w.slug === slug)
      const defaults = wf?.defaults ?? {}
      const res = await fetch('/api/design/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workflow_slug: slug,
          params: { ...defaults, prompt: prompt.trim() },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Falha ao enviar')

      // Preview mode: resposta traz result_url imediato → injeta como job sintético.
      if (data._preview) {
        setJobs((prev) => [
          {
            id: data.job_id,
            status: 'done',
            progress: 100,
            params: { prompt: prompt.trim() },
            resultUrl: data.result_url,
            thumbnailUrl: data.result_url,
            error: null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
      } else {
        // Otimista: insere placeholder que será atualizado via realtime.
        setJobs((prev) => [
          {
            id: data.job_id,
            status: data.status,
            progress: 0,
            params: { prompt: prompt.trim() },
            resultUrl: null,
            thumbnailUrl: null,
            error: null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }
      setPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = !!slug && prompt.trim().length >= 4 && !submitting && workerOnline

  return (
    <>
      <GlassCard variant="accent" className="p-6 mb-6 anim-fade-up">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-yellow-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-100 mb-1">{title}</p>
            <p className="text-xs text-neutral-400 mb-4">{description}</p>

            {workflows.length > 1 && (
              <div className="flex gap-2 mb-3">
                {workflows.map((w) => (
                  <button
                    key={w.slug}
                    type="button"
                    onClick={() => setSlug(w.slug)}
                    className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
                      slug === w.slug
                        ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200'
                        : 'border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) handleSubmit() }}
                placeholder={placeholder}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/40 transition-colors"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-sm font-semibold press-scale glow-accent disabled:opacity-40 disabled:cursor-not-allowed"
                title={!workerOnline ? 'Render local offline' : undefined}
              >
                {submitting ? 'Enviando…' : 'Gerar'}
              </button>
            </div>
            {!workerOnline && (
              <p className="text-[11px] text-red-400/80 mt-2">
                Render local está offline — ligue o PC com ComfyUI pra gerar.
              </p>
            )}
            {error && <p className="text-[11px] text-red-400/80 mt-2">{error}</p>}
          </div>
        </div>
      </GlassCard>

      <p className="label-caps mb-3">Suas gerações</p>
      {jobs.length === 0 ? (
        <GlassCard className="p-12 text-center anim-fade-up">
          <p className="text-sm text-neutral-500">Nenhuma geração ainda.</p>
          <p className="text-xs text-neutral-600 mt-1">Descreva o mood e clique Gerar.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-4 gap-3 stagger">
          {jobs.map((j) => <DesignJobCard key={j.id} job={j} />)}
        </div>
      )}
    </>
  )
}

function mapJob(row: Record<string, unknown>): DesignJob {
  return {
    id: row.id as string,
    status: row.status as string,
    progress: (row.progress as number | null) ?? 0,
    params: (row.params as Record<string, unknown> | null) ?? null,
    resultUrl: (row.result_url as string | null) ?? (row.resultUrl as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? (row.thumbnailUrl as string | null) ?? null,
    error: (row.error as string | null) ?? null,
    createdAt: (row.created_at as string | null) ?? (row.createdAt as string | null) ?? null,
  }
}

function mapJobs(rows: Record<string, unknown>[]): DesignJob[] {
  return rows.map(mapJob)
}
