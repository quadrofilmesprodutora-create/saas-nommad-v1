import { Lock, TrendingUp, ArrowRight } from 'lucide-react'
import { PageShell, PageHeader, GlassCard, RadialGauge } from '@/components/ui'
import { getSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { identity } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function getData(userId: string) {
  const db = getDb()
  const [id] = await db.select().from(identity).where(eq(identity.userId, userId)).limit(1)
  return id ?? null
}

const DIMENSION_LABELS = [
  'Clareza de posicionamento',
  'Consistência de voz',
  'Presença sonora',
  'Estratégia de conteúdo',
  'Rede de contatos',
]

export default async function MarcaPage() {
  const session = await getSession()
  const userId = session?.user?.id

  const isPreview = PREVIEW_MODE || !userId || userId === '00000000-0000-0000-0000-000000000000'

  let id: Awaited<ReturnType<typeof getData>> | null = null

  if (!isPreview) {
    try {
      id = await getData(userId!)
    } catch {
      // DB not configured yet
    }
  }

  const forcaMarca = id?.forcaMarca ?? 0
  const teses = (id?.tesesCentrais as string[] | null) ?? []
  const dna = id?.dna as Record<string, string> | null
  const pos = id?.posicionamento as Record<string, string> | null

  const dimensionScores = [
    Math.min(forcaMarca, 100),
    forcaMarca > 0 ? Math.round(forcaMarca * 0.85) : 0,
    forcaMarca > 0 ? Math.round(forcaMarca * 0.7) : 0,
    forcaMarca > 0 ? Math.round(forcaMarca * 0.9) : 0,
    0,
  ]

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
          <RadialGauge value={forcaMarca} size={156} thickness={8} />
          <p className="text-xs text-neutral-500 mt-4 text-center">
            {forcaMarca > 0 ? `${forcaMarca}/100` : '0–100, calculado após a entrevista IA'}
          </p>
        </GlassCard>

        <GlassCard floating className="col-span-2 p-6">
          <p className="label-caps mb-4">Dimensões</p>
          <div className="flex flex-col gap-3">
            {DIMENSION_LABELS.map((label, i) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>{label}</span>
                  <span>{dimensionScores[i]}/100</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-[width] duration-700"
                    style={{ width: `${dimensionScores[i]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {id ? (
        <div className="grid grid-cols-2 gap-4 stagger">
          {id.essencia && (
            <GlassCard hover className="p-6">
              <p className="label-caps mb-3">Essência</p>
              <p className="text-sm text-neutral-300 leading-relaxed">{id.essencia}</p>
            </GlassCard>
          )}

          {teses.length > 0 && (
            <GlassCard hover className="p-6">
              <p className="label-caps mb-3">Teses centrais</p>
              <ul className="flex flex-col gap-2">
                {teses.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-300">
                    <span className="text-yellow-500 font-mono shrink-0">{i + 1}.</span>
                    {t}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {dna && (
            <GlassCard hover className="p-6">
              <p className="label-caps mb-3">DNA</p>
              <div className="flex flex-col gap-2">
                {Object.entries(dna).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[10px] text-neutral-600 uppercase tracking-widest">{k}</span>
                    <p className="text-sm text-neutral-300">{v}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {pos && (
            <GlassCard hover className="p-6">
              <p className="label-caps mb-3">Posicionamento</p>
              <div className="flex flex-col gap-2">
                {Object.entries(pos).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[10px] text-neutral-600 uppercase tracking-widest">{k}</span>
                    <p className="text-sm text-neutral-300">{v}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 stagger">
          <GlassCard hover className="p-6">
            <div className="flex items-center gap-2 label-caps mb-3">
              <Lock size={12} /> Diagnóstico
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {isPreview
                ? 'Configure Supabase + Anthropic para ativar o diagnóstico real.'
                : 'Depois que você completar o onboarding, o Analyst vai ler sua fala e listar padrões: incoerências, temas dominantes, diferenciais reais vs. percebidos. Sem floreio.'}
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
              className="inline-flex items-center gap-2 mt-4 text-xs text-yellow-500 hover:text-yellow-400 press-scale"
            >
              Começar onboarding <ArrowRight size={12} />
            </a>
          </GlassCard>
        </div>
      )}
    </PageShell>
  )
}
