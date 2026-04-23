import { Rocket } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'
import { PREVIEW_MODE } from '@/lib/env'
import { requireSession } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/client'
import { releases } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ReleaseForm } from './release-form'

const FASES = [
  { label: 'Teaser',   dias: 'D-30', desc: '3 posts criando universo' },
  { label: 'Pré-save', dias: 'D-14', desc: 'link pré-save + story' },
  { label: 'Release',  dias: 'D-0',  desc: 'drop + 2 reels com hook' },
  { label: 'Pós',      dias: 'D+7',  desc: 'UGC, cases, behind the scenes' },
]

const MOCK = [
  { id: '1', titulo: 'Máquina de Ansiedade', tipo: 'single', status: 'in_progress' },
  { id: '2', titulo: 'Liminar', tipo: 'ep', status: 'planning' },
]

type Release = {
  id: string
  titulo: string
  tipo: string | null
  status: string | null
  releaseDate?: Date | null
}

async function getReleases(): Promise<Release[]> {
  if (PREVIEW_MODE) return MOCK
  try {
    const session = await requireSession()
    const db = getDb()
    const rows = await db.select().from(releases)
      .where(eq(releases.userId, session.user.id))
      .orderBy(desc(releases.createdAt))
    return rows as Release[]
  } catch {
    return []
  }
}

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planejamento',
  in_progress: 'Em andamento',
  released: 'Lançado',
  post: 'Pós-lançamento',
}

export default async function ReleasePage() {
  const list = await getReleases()

  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="★ Exclusivo NOMMAD"
        title="Release"
        accent="System"
        subtitle="Timeline automática de lançamento: teaser → pré-save → drop → pós."
      />

      <p className="label-caps mb-3">Fases padrão</p>
      <div className="flex items-start gap-2 mb-10 overflow-x-auto stagger">
        {FASES.map((f, i) => (
          <GlassCard key={f.label} floating float className="flex-1 min-w-44 p-5 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="label-caps">Fase {i + 1}</span>
              <span className="text-xs text-yellow-500 font-mono">{f.dias}</span>
            </div>
            <p className="text-sm font-semibold text-neutral-100 mb-1">{f.label}</p>
            <p className="text-xs text-neutral-400 leading-relaxed">{f.desc}</p>
          </GlassCard>
        ))}
      </div>

      <p className="label-caps mb-3">Releases em andamento</p>
      {list.length === 0 ? (
        <GlassCard floating className="p-6 mb-8 text-center text-sm text-neutral-400">
          Nenhum release cadastrado ainda. Comece pelo formulário abaixo.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-8 stagger">
          {list.map((r) => (
            <GlassCard key={r.id} floating className="p-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg border border-white/10 bg-neutral-900 flex items-center justify-center shrink-0">
                <Rocket size={24} className="text-yellow-500/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="label-caps">{r.tipo ?? 'single'}</p>
                <p className="text-base text-neutral-100 font-semibold truncate">{r.titulo}</p>
                <p className="text-xs text-yellow-500 mt-1 font-mono">{STATUS_LABEL[r.status ?? 'planning']}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ReleaseForm />
    </PageShell>
  )
}
