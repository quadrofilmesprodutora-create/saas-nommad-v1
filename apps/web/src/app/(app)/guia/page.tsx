import { PageShell, PageHeader, GlassCard } from '@/components/ui'

const STEPS: [string, string][] = [
  ['1. Onboarding', 'Grave um áudio de 2-5 minutos contando sua história, objetivos e travas.'],
  ['2. Leia o diagnóstico', 'O sistema vai revelar sua incoerência central e posicionamento real.'],
  ['3. Execute a missão', 'Máximo 3 tarefas em 7 dias. Simples e mensurável.'],
  ['4. Check-in semanal', 'Volte e reporte o que fez. O sistema ajusta a rota.'],
  ['5. Kanban Editorial', 'Todas as ideias e conteúdos organizados em um board.'],
]

export default function GuiaPage() {
  return (
    <PageShell max="md">
      <PageHeader
        eyebrow="Como funciona"
        title="Guia de"
        accent="Uso"
        subtitle="Cinco passos pra extrair o máximo do NOMMAD — do onboarding ao check-in semanal."
      />
      <div className="flex flex-col gap-3 max-w-xl stagger">
        {STEPS.map(([title, desc], i) => (
          <GlassCard key={title} floating className="p-5 flex items-start gap-4">
            <span className="num-display text-2xl text-yellow-500/50 leading-none font-mono shrink-0 w-8">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-100 mb-1">{title.replace(/^\d+\.\s*/, '')}</p>
              <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  )
}
