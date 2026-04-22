import { Plus } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'
import { thumbnailUrl } from '@/lib/placeholders'

type Card = { id: string; titulo: string; tag: 'hook' | 'reel' | 'carrossel' }

const COLUMNS: { titulo: string; cards: Card[] }[] = [
  {
    titulo: 'Ideias',
    cards: [
      { id: 'hook-erros-dj',     titulo: 'Hook: 3 erros de DJ brasileiro', tag: 'hook' },
      { id: 'reel-warung',       titulo: 'Reel: lado B do set no Warung',  tag: 'reel' },
      { id: 'carr-5-plugins',    titulo: 'Carrossel: 5 plugins que mudei', tag: 'carrossel' },
    ],
  },
  {
    titulo: 'Em Desenvolvimento',
    cards: [{ id: 'roteiro-contra', titulo: 'Roteiro — hook contra-narrativa', tag: 'reel' }],
  },
  {
    titulo: 'Agendado',
    cards: [{ id: 'reel-hook-central', titulo: 'Reel · hook central — seg 15h', tag: 'reel' }],
  },
  { titulo: 'Publicado',  cards: [] },
  { titulo: 'Arquivado',  cards: [] },
]

const TAG_COLOR: Record<Card['tag'], string> = {
  hook:      'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  reel:      'text-violet-400 bg-violet-500/10 border-violet-500/30',
  carrossel: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
}

export default function KanbanPage() {
  return (
    <PageShell max="full">
      <PageHeader
        eyebrow="Fluxo Editorial"
        title="Kanban"
        accent="Editorial"
        subtitle="Ideias → Em Desenvolvimento → Agendado → Publicado → Arquivado."
      />

      <div className="grid grid-cols-5 gap-4 stagger" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {COLUMNS.map((col) => (
          <GlassCard key={col.titulo} variant="flat" className="p-3 flex flex-col" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            <div className="flex items-center justify-between px-1 mb-3 shrink-0">
              <p className="label-caps font-medium">{col.titulo}</p>
              <span className="text-[10px] text-neutral-600">{col.cards.length}</span>
            </div>

            <button type="button" className="shrink-0 mb-2 flex items-center justify-center gap-1 text-[11px] text-neutral-600 hover:text-yellow-500 hover:border-yellow-500/30 border border-dashed border-white/10 rounded-lg py-2 transition-colors press-scale">
              <Plus size={11} /> adicionar
            </button>

            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5">
              {col.cards.map((c) => (
                <div
                  key={c.id}
                  className="glass-card glass-hover p-3 cursor-grab overflow-hidden shrink-0"
                >
                  {(c.tag === 'reel' || c.tag === 'carrossel') && (
                    <div className="aspect-[16/7] -m-3 mb-3 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl(c.id, 280, 120)}
                        alt={c.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                  )}
                  <p className="text-xs text-neutral-200 mb-2 leading-snug">{c.titulo}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${TAG_COLOR[c.tag]}`}>
                    {c.tag}
                  </span>
                </div>
              ))}
              {col.cards.length === 0 && (
                <div className="text-[11px] text-neutral-700 text-center py-6 flex-1">vazio</div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  )
}
