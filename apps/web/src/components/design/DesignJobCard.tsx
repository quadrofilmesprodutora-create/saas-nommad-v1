'use client'

import { Download, AlertCircle, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui'

export type DesignJob = {
  id: string
  status: string
  progress: number | null
  params: Record<string, unknown> | null
  resultUrl: string | null
  thumbnailUrl: string | null
  error: string | null
  createdAt: string | Date | null
}

export function DesignJobCard({ job }: { job: DesignJob }) {
  const prompt = typeof job.params?.prompt === 'string' ? (job.params.prompt as string) : null
  const isDone = job.status === 'done' && job.resultUrl
  const isErr = job.status === 'error'
  const isRunning = job.status === 'running' || job.status === 'dispatched'
  const isQueued = job.status === 'queued'

  return (
    <GlassCard floating className="p-0 overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-neutral-900/60">
        {isDone && job.resultUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={job.thumbnailUrl ?? job.resultUrl} alt={prompt ?? 'resultado'} className="w-full h-full object-cover" />
        )}
        {isRunning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="text-yellow-500 animate-spin" />
            <p className="text-[11px] text-neutral-400">{job.progress ?? 0}%</p>
          </div>
        )}
        {isQueued && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[11px] text-neutral-500">na fila…</p>
          </div>
        )}
        {isErr && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-[10px] text-red-400 text-center line-clamp-3">{job.error ?? 'falha'}</p>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs text-neutral-300 line-clamp-2 min-h-[2rem]">{prompt ?? '—'}</p>
        {isDone && job.resultUrl && (
          <a
            href={job.resultUrl}
            download
            className="inline-flex items-center gap-1.5 text-[11px] text-yellow-500 hover:text-yellow-400"
          >
            <Download size={11} /> baixar
          </a>
        )}
      </div>
    </GlassCard>
  )
}
