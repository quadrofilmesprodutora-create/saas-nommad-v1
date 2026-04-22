import { Flame, Target, Clock, ArrowRight } from 'lucide-react'
import { PageShell, PageHeader, GlassCard, StatCard } from '@/components/ui'

const TODAY = [
  {
    tipo: 'Missão ativa',
    titulo: 'Lançar 3 reels usando seu hook central',
    prazo: '4 dias restantes',
    accent: true,
  },
  {
    tipo: 'Conteúdo',
    titulo: 'Gravar hook sobre erros de produção em techno',
    prazo: 'hoje',
  },
  {
    tipo: 'Release',
    titulo: 'Confirmar masterização do EP antes de sexta',
    prazo: 'quinta',
  },
]

const FOCO = [
  { label: 'Streak',          value: '—',     sub: 'dias consecutivos' },
  { label: 'Missão',          value: '2 / 3', sub: 'tarefas concluídas' },
  { label: 'Próx. check-in',  value: 'dom',   sub: 'reporte na aba Evolução' },
  { label: 'Confronto',       value: 'alto',  sub: 'modo direto' },
]

export default function EstrategiaPage() {
  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="Método Diogo O'Band"
        title="Sua"
        accent="Estratégia"
        subtitle="Seu plano para hoje — missão ativa, conteúdos em andamento e próximo check-in."
        right={
          <div className="glass-pill flex items-center gap-2 text-xs text-yellow-500 px-3 py-1.5">
            <Flame size={12} /> Foco do dia
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-10 stagger">
        {FOCO.map((f) => (
          <StatCard key={f.label} label={f.label} value={f.value} sub={f.sub} />
        ))}
      </div>

      <p className="label-caps mb-3">Agenda do dia</p>
      <div className="flex flex-col gap-3 mb-10 stagger">
        {TODAY.map((item) => (
          <GlassCard
            key={item.titulo}
            variant={item.accent ? 'accent' : 'default'}
            hover
            className="flex items-center gap-4 p-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              item.accent ? 'bg-yellow-500/10 text-yellow-500 glow-accent' : 'bg-white/5 text-neutral-400'
            }`}>
              {item.accent ? <Target size={18} /> : <Clock size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="label-caps mb-0.5">{item.tipo}</p>
              <p className="text-sm text-neutral-100 truncate">{item.titulo}</p>
            </div>
            <span className="text-xs text-neutral-500 shrink-0">{item.prazo}</span>
            <ArrowRight size={14} className="text-neutral-600 shrink-0" />
          </GlassCard>
        ))}
      </div>

      <GlassCard floating className="p-6 anim-fade-up">
        <p className="label-caps mb-2">Leitura do sistema</p>
        <p className="text-sm text-neutral-300 leading-relaxed">
          Complete o onboarding por áudio para gerar seu plano real. Até lá, esses cards são exemplos do formato
          da agenda diária. O sistema vai puxar missão ativa, conteúdos do Kanban e releases em andamento.
        </p>
        <a
          href="/onboarding"
          className="inline-flex items-center gap-2 mt-4 text-xs text-yellow-500 hover:text-yellow-400 press-scale"
        >
          Fazer onboarding agora <ArrowRight size={12} />
        </a>
      </GlassCard>
    </PageShell>
  )
}
