import { DollarSign, Users, Target, BarChart2, Plus } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'

const KPIS = [
  { label: 'Faturamento / mês', value: 'R$ —', icon: DollarSign, sub: 'soma de cachês + streaming + merch' },
  { label: 'Ouvintes Spotify',   value: '—',    icon: Users,       sub: 'últimos 28 dias' },
  { label: 'Cachê médio',        value: 'R$ —', icon: Target,      sub: 'últimos 3 meses' },
  { label: 'Conversão feed → DM', value: '—',   icon: BarChart2,   sub: 'leads de contratação' },
]

const FUNIL = [
  { label: 'Descoberta (feed / playlist)', valor: 0 },
  { label: 'Engajamento (save / share)',   valor: 0 },
  { label: 'Consideração (perfil / site)', valor: 0 },
  { label: 'Contato (DM / email)',         valor: 0 },
  { label: 'Fechamento (contrato)',        valor: 0 },
]

export default function NegocioPage() {
  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="Monetização"
        title="Meu"
        accent="Negócio"
        subtitle="Ofertas, funil de contratação e métricas financeiras da carreira."
      />

      <div className="grid grid-cols-4 gap-3 mb-8 stagger">
        {KPIS.map(({ label, value, icon: Icon, sub }) => (
          <GlassCard key={label} floating float className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="label-caps">{label}</span>
              <Icon size={14} className="text-neutral-600" />
            </div>
            <p className="text-xl font-bold text-neutral-100">{value}</p>
            <p className="text-[11px] text-neutral-500 mt-1">{sub}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 stagger">
        <GlassCard floating className="p-6">
          <p className="label-caps mb-4">Funil do artista</p>
          <div className="flex flex-col gap-3">
            {FUNIL.map((f, i) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-[11px] text-neutral-600 font-mono w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>{f.label}</span>
                    <span>{f.valor}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-[width] duration-700"
                      style={{ width: `${f.valor}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard floating className="p-6">
          <p className="label-caps mb-4">Ofertas ativas</p>
          <div className="flex flex-col gap-3">
            <div className="border border-dashed border-white/10 rounded-lg p-4 text-center text-xs text-neutral-500">
              Nenhuma oferta cadastrada
            </div>
            <button className="w-full py-2.5 rounded-lg glass-pill text-sm text-neutral-200 flex items-center justify-center gap-2 press-scale">
              <Plus size={14} /> Criar oferta (set, produção, mentoria)
            </button>
          </div>
          <p className="text-xs text-neutral-600 mt-4 leading-relaxed">
            Estratégia de monetização puxada do Strategist depois do onboarding.
          </p>
        </GlassCard>
      </div>
    </PageShell>
  )
}
