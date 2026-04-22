import { Network } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'

export default function CerebroPage() {
  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="Sinapses Criativas"
        title="Seu"
        accent="Cérebro"
        subtitle="Grafo de ideias, temas recorrentes e conexões entre conteúdos."
      />

      <GlassCard floating className="min-h-[60vh] relative overflow-hidden anim-fade-up">
        {/* placeholder graph */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 600 400">
          <defs>
            <radialGradient id="nodeGlow">
              <stop offset="0%" stopColor="#EAB308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
            </radialGradient>
          </defs>
          <line x1="300" y1="200" x2="150" y2="110" stroke="#52525b" strokeWidth="1" />
          <line x1="300" y1="200" x2="460" y2="110" stroke="#52525b" strokeWidth="1" />
          <line x1="300" y1="200" x2="150" y2="300" stroke="#52525b" strokeWidth="1" />
          <line x1="300" y1="200" x2="460" y2="300" stroke="#52525b" strokeWidth="1" />
          <line x1="150" y1="110" x2="460" y2="110" stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2" />
          <line x1="150" y1="300" x2="460" y2="300" stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2" />
          <circle cx="300" cy="200" r="28" fill="url(#nodeGlow)" />
          <circle cx="150" cy="110" r="6" fill="#71717a" />
          <circle cx="460" cy="110" r="6" fill="#71717a" />
          <circle cx="150" cy="300" r="6" fill="#71717a" />
          <circle cx="460" cy="300" r="6" fill="#71717a" />
          <circle cx="300" cy="200" r="10" fill="#EAB308" className="anim-pulse-glow" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center max-w-sm px-6">
            <div className="w-14 h-14 rounded-full glass border border-yellow-500/30 flex items-center justify-center glow-accent">
              <Network size={22} className="text-yellow-500" />
            </div>
            <p className="text-sm text-neutral-200 font-semibold">Grafo em construção</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              À medida que você cria conteúdos e completa missões, o Cérebro conecta temas, expõe obsessões
              reais e identifica lacunas no seu discurso.
            </p>
          </div>
        </div>
      </GlassCard>
    </PageShell>
  )
}
