import { Headphones, Waves } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'
import { avatarUrl } from '@/lib/placeholders'

const PILARES = [
  { slug: 'ritmica',   titulo: 'Assinatura rítmica',   descr: 'BPM, swing, kick pattern que se repete nos teus sets.' },
  { slug: 'textura',   titulo: 'Textura e ambiência',  descr: 'Pads, reverbs, camadas — o que torna "seu som" reconhecível em 5 segundos.' },
  { slug: 'referencia',titulo: 'Referências cruzadas', descr: 'Artistas/labels que moldam seu vocabulário estético.' },
]

const REFERENCIAS_MOCK = [
  'Dixon', 'Innervisions', 'Keinemusik', 'Afterlife', 'Diynamic',
]

export default function SoundPage() {
  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="★ Exclusivo NOMMAD"
        title="Sound"
        accent="Design"
        subtitle="Assinatura sonora, referências e identidade acústica da sua marca musical."
      />

      <div className="grid grid-cols-3 gap-3 mb-8 stagger">
        {PILARES.map(({ slug, titulo, descr }) => (
          <GlassCard key={slug} floating float className="p-5">
            <Waves size={18} className="text-yellow-500 mb-3" />
            <p className="text-sm text-neutral-100 font-semibold mb-1">{titulo}</p>
            <p className="text-xs text-neutral-400 leading-relaxed">{descr}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard floating className="p-6 mb-4 anim-fade-up">
        <p className="label-caps mb-3">Referências mapeadas</p>
        <div className="flex flex-wrap gap-2">
          {REFERENCIAS_MOCK.map((r) => (
            <div key={r} className="flex items-center gap-2 glass-pill px-3 py-1.5 text-xs text-neutral-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl(r, 'shapes')}
                alt={r}
                className="w-5 h-5 rounded-full border border-white/10 bg-neutral-900"
              />
              {r}
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-600 mt-4">
          Adicione links de tracks / sets no onboarding para o sistema cruzar sua assinatura sonora.
        </p>
      </GlassCard>

      <GlassCard variant="accent" className="p-6 flex items-start gap-4 anim-fade-up">
        <Headphones size={22} className="text-yellow-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-neutral-100 font-semibold mb-1">Módulo exclusivo do NOMMAD</p>
          <p className="text-xs text-neutral-400 leading-relaxed">
            O ref (Influencia IA) não tem isso. Diogo traz esse módulo do método dele pra DJs — ajuda a
            traduzir "quem você é musicalmente" em decisão de produção, seleção de track e posicionamento.
          </p>
        </div>
      </GlassCard>
    </PageShell>
  )
}
