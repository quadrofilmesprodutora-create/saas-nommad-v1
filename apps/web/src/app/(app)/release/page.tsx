import { Rocket, Calendar, Music } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'
import { coverArt } from '@/lib/placeholders'

const FASES = [
  { label: 'Teaser',   dias: 'D-30', desc: '3 posts criando universo' },
  { label: 'Pré-save', dias: 'D-14', desc: 'link pré-save + story' },
  { label: 'Release',  dias: 'D-0',  desc: 'drop + 2 reels com hook' },
  { label: 'Pós',      dias: 'D+7',  desc: 'UGC, cases, behind the scenes' },
]

const RELEASES_MOCK = [
  { slug: 'maquina-de-ansiedade', titulo: 'Máquina de Ansiedade', tipo: 'Single',  fase: 'Pré-save · D-14' },
  { slug: 'liminar',               titulo: 'Liminar',              tipo: 'EP',      fase: 'Teaser · D-30'   },
]

export default function ReleasePage() {
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
      <div className="grid grid-cols-2 gap-3 mb-8 stagger">
        {RELEASES_MOCK.map((r) => (
          <GlassCard key={r.slug} floating className="p-4 flex items-center gap-4 cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverArt(r.slug, 160)}
              alt={r.titulo}
              className="w-20 h-20 rounded-lg object-cover border border-white/10 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="label-caps">{r.tipo}</p>
              <p className="text-base text-neutral-100 font-semibold truncate">{r.titulo}</p>
              <p className="text-xs text-yellow-500 mt-1 font-mono">{r.fase}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard floating className="p-8 flex flex-col items-center text-center anim-fade-up">
        <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-4 glow-accent">
          <Rocket size={22} className="text-yellow-500" />
        </div>
        <p className="text-base font-semibold text-neutral-100 mb-1">Cadastrar novo release</p>
        <p className="text-sm text-neutral-400 max-w-md mb-6">
          Cadastre sua próxima faixa / EP. O sistema cria os cards de conteúdo no Kanban e
          agenda as peças no calendário automaticamente.
        </p>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-sm font-semibold hover:brightness-110 transition-all press-scale flex items-center gap-2 glow-accent">
            <Music size={14} /> Novo release
          </button>
          <button className="px-5 py-2.5 rounded-lg glass-pill text-sm text-neutral-200 press-scale flex items-center gap-2">
            <Calendar size={14} /> Ver timeline completa
          </button>
        </div>
      </GlassCard>
    </PageShell>
  )
}
