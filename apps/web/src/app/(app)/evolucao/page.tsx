import { TrendingUp, CheckCircle2, Flame, Activity } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'

const KPIS = [
  { label: 'Publicados',         value: '—',       icon: CheckCircle2 },
  { label: 'Missões concluídas', value: '—',       icon: Flame },
  { label: 'Streak',             value: '— dias',  icon: Activity },
  { label: 'Score de marca',     value: '—',       icon: TrendingUp },
]

const HIST = [
  { data: 'Semana -1', valor: 0 },
  { data: 'Semana -2', valor: 0 },
  { data: 'Semana -3', valor: 0 },
  { data: 'Semana -4', valor: 0 },
]

export default function EvolucaoPage() {
  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="Seu Histórico"
        title="Sua"
        accent="Evolução"
        subtitle="Métricas de execução, streak e histórico de check-ins semanais."
      />

      <div className="grid grid-cols-4 gap-3 mb-8 stagger">
        {KPIS.map(({ label, value, icon: Icon }) => (
          <GlassCard key={label} floating float className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="label-caps">{label}</span>
              <Icon size={14} className="text-neutral-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-200">{value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 stagger">
        <GlassCard floating className="p-6">
          <p className="label-caps mb-4">Score por semana</p>
          <div className="flex items-end gap-3 h-32">
            {HIST.map((h) => (
              <div key={h.data} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t transition-[height] duration-700"
                    style={{ height: `${Math.max(h.valor, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500">{h.data}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard floating className="p-6">
          <p className="label-caps mb-4">Histórico de check-ins</p>
          <div className="text-center text-sm text-neutral-600 py-10">
            Sem check-ins ainda.<br />
            <span className="text-xs text-neutral-700">Complete sua primeira missão pra reportar.</span>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  )
}
