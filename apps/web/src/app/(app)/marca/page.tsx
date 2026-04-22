import { Lock, TrendingUp } from 'lucide-react'
import { PageShell, PageHeader, GlassCard, RadialGauge } from '@/components/ui'

const DIMENSIONS = [
  { label: 'Clareza de posicionamento', score: 0 },
  { label: 'Consistência de voz',       score: 0 },
  { label: 'Presença sonora',           score: 0 },
  { label: 'Estratégia de conteúdo',    score: 0 },
  { label: 'Rede de contatos',          score: 0 },
]

export default function MarcaPage() {
  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="DNA Artístico"
        title="Minha"
        accent="Marca"
        subtitle="Posicionamento, voz e força da marca — calculados a partir da sua entrevista IA."
      />

      <div className="grid grid-cols-3 gap-4 mb-8 stagger">
        <GlassCard floating float className="col-span-1 p-6 flex flex-col items-center justify-center">
          <p className="label-caps mb-4">Força da Marca</p>
          <RadialGauge value={0} size={156} thickness={8} />
          <p className="text-xs text-neutral-500 mt-4 text-center">
            0–100, calculado após a entrevista IA
          </p>
        </GlassCard>

        <GlassCard floating className="col-span-2 p-6">
          <p className="label-caps mb-4">Dimensões</p>
          <div className="flex flex-col gap-3">
            {DIMENSIONS.map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>{d.label}</span>
                  <span>{d.score}/100</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-[width] duration-700"
                    style={{ width: `${d.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-4 stagger">
        <GlassCard hover className="p-6">
          <div className="flex items-center gap-2 label-caps mb-3">
            <Lock size={12} /> Diagnóstico
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Depois que você completar o onboarding, o Analyst vai ler sua fala e listar padrões:
            incoerências, temas dominantes, diferenciais reais vs. percebidos. Sem floreio.
          </p>
        </GlassCard>
        <GlassCard variant="accent" hover className="p-6">
          <div className="flex items-center gap-2 text-yellow-500 label-caps mb-3">
            <TrendingUp size={12} /> Próximo passo
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Grave seu áudio. O sistema revela sua incoerência central e devolve uma primeira missão
            pra fechar o gap entre quem você diz ser e o que sua feed mostra.
          </p>
          <a
            href="/onboarding"
            className="inline-block mt-4 text-xs text-yellow-500 hover:text-yellow-400 press-scale"
          >
            Começar onboarding →
          </a>
        </GlassCard>
      </div>
    </PageShell>
  )
}
