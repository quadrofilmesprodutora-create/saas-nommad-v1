'use client'

import { Zap, FileText, Layers, Users, Bookmark, FileCode, Sparkles } from 'lucide-react'
import { PageShell, PageHeader, GlassCard, Tabs } from '@/components/ui'
import type { TabItem } from '@/components/ui'

const TABS: TabItem[] = [
  { value: 'hooks',      label: 'Hooks',      icon: Zap },
  { value: 'reels',      label: 'Reels',      icon: FileText },
  { value: 'carrosseis', label: 'Carrosséis', icon: Layers },
  { value: 'comunidade', label: 'Comunidade', icon: Users },
]

const HOOKS_EXEMPLO = [
  {
    hook: 'O que ninguém fala sobre produzir techno depois dos 30.',
    angulo: 'contra-narrativa · autoral',
  },
  {
    hook: 'Você tá postando set. Precisava tá postando identidade.',
    angulo: 'confronto · posicionamento',
  },
  {
    hook: '3 erros que travam DJ brasileiro de chegar no D-Edge.',
    angulo: 'listicle · aspiracional',
  },
  {
    hook: 'A diferença entre DJ genérico e DJ contratado é uma só.',
    angulo: 'autoridade · direto',
  },
]

function HooksPanel() {
  return (
    <>
      <GlassCard className="p-4 mb-6 flex items-center gap-3">
        <Sparkles size={16} className="text-yellow-500 shrink-0" />
        <input
          placeholder='Ex: "hooks sobre a cena techno brasileira depois da pandemia"'
          className="flex-1 bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
          disabled
        />
        <button type="button" className="px-4 py-1.5 rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-xs font-semibold hover:brightness-110 press-scale transition-all duration-200 glow-accent">
          Gerar
        </button>
      </GlassCard>

      <p className="label-caps mb-3">Exemplos</p>
      <div className="grid grid-cols-2 gap-3 stagger">
        {HOOKS_EXEMPLO.map((h) => (
          <GlassCard key={h.hook} floating className="p-5">
            <p className="text-sm text-neutral-100 font-medium mb-3 leading-snug">&ldquo;{h.hook}&rdquo;</p>
            <p className="label-caps mb-4">{h.angulo}</p>
            <div className="flex gap-1.5">
              <button type="button" className="glass-pill flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-neutral-300 press-scale">
                <Bookmark size={11} /> Salvar
              </button>
              <button type="button" className="glass-pill flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-neutral-300 press-scale">
                <FileCode size={11} /> Roteiro
              </button>
              <button type="button" className="glass-pill flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-neutral-300 press-scale">
                <Sparkles size={11} /> Aprofundar
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <p className="text-xs text-neutral-600 mt-6">
        Com onboarding completo, o gerador usa sua voz, diferenciais e referências reais.
      </p>
    </>
  )
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <GlassCard className="p-12 flex flex-col items-center text-center">
      <p className="text-sm text-neutral-500 mb-1">{label} em construção</p>
      <p className="text-xs text-neutral-700">Complete o onboarding para desbloquear.</p>
    </GlassCard>
  )
}

export default function GeradorPage() {
  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="Motor de Conteúdo"
        title="Gerador de"
        accent="Conteúdo"
        subtitle="Hooks · Reels · Carrosséis · Posts de comunidade — alinhados à sua voz e diferenciais."
      />

      <Tabs tabs={TABS} variant="underline" defaultValue="hooks">
        {(active) => {
          if (active === 'hooks')      return <HooksPanel />
          if (active === 'reels')      return <EmptyPanel label="Reels" />
          if (active === 'carrosseis') return <EmptyPanel label="Carrosséis" />
          if (active === 'comunidade') return <EmptyPanel label="Comunidade" />
          return null
        }}
      </Tabs>
    </PageShell>
  )
}
