'use client'

import {
  Layers, Image as ImageIcon, Palette, Camera, Type, Download, Upload, Plus,
} from 'lucide-react'
import { PageShell, PageHeader, GlassCard, Tabs } from '@/components/ui'
import { thumbnailUrl, coverArt, photoUrl, pressPhoto } from '@/lib/placeholders'
import { DesignGenerator } from '@/components/design/DesignGenerator'
import { WorkerBadge } from '@/components/design/WorkerBadge'

const TABS = [
  { value: 'carrossel', label: 'Carrossel',  icon: Layers },
  { value: 'capas',     label: 'Capas',      icon: ImageIcon },
  { value: 'artes',     label: 'Artes',      icon: Palette },
  { value: 'presskit',  label: 'Press Kit',  icon: Camera, badge: 'IA' },
]

export default function DesignPage() {
  return (
    <PageShell max="xl">
      <PageHeader
        eyebrow="Identidade Visual"
        title="Módulo"
        accent="Design"
        subtitle="Carrosséis, capas, artes e press kit — tudo com a tua cara, gerado dentro do sistema."
      />

      <div className="mb-4 flex justify-end">
        <WorkerBadge />
      </div>

      <Tabs tabs={TABS} variant="pill" defaultValue="carrossel">
        {(active) => {
          if (active === 'carrossel') return <CarrosselPanel />
          if (active === 'capas')     return <CapasPanel />
          if (active === 'artes')     return <ArtesPanel />
          if (active === 'presskit')  return <PressKitPanel />
          return null
        }}
      </Tabs>
    </PageShell>
  )
}

/* ------------------------------------------------------------ */
/* TAB 1 — CARROSSEL                                             */
/* ------------------------------------------------------------ */

const TEMPLATES = [
  { slug: 'hook-3-argumentos',  nome: 'Hook + 3 argumentos', slides: 4, categoria: 'educativo' },
  { slug: 'lista-top-5',         nome: 'Lista · Top 5',        slides: 6, categoria: 'listicle' },
  { slug: 'contra-narrativa',    nome: 'Contra-narrativa',     slides: 5, categoria: 'confronto' },
  { slug: 'case-storytelling',   nome: 'Case / storytelling',  slides: 7, categoria: 'narrativo' },
  { slug: 'faq-comunidade',      nome: 'FAQ / comunidade',     slides: 8, categoria: 'engajamento' },
  { slug: 'antes-vs-depois',     nome: 'Antes vs. depois',     slides: 3, categoria: 'visual' },
]

function CarrosselPanel() {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-6 stagger">
        {TEMPLATES.map((t) => (
          <GlassCard key={t.slug} floating className="p-4 text-left cursor-pointer overflow-hidden">
            <div className="aspect-[4/5] rounded-lg border border-white/10 mb-3 relative overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl(t.slug, 400, 500)}
                alt={t.nome}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <span className="absolute top-2 right-2 text-[10px] glass-pill px-2 py-0.5 text-neutral-200">
                {t.slides} slides
              </span>
              <span className="absolute bottom-2 left-3 text-[9px] label-caps text-yellow-500/90">
                {t.categoria}
              </span>
            </div>
            <p className="text-sm text-neutral-100 font-medium">{t.nome}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">usar template →</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard floating className="p-6 anim-fade-up">
        <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
          <div className="flex items-center gap-1.5"><Type size={12} /> Tipografia</div>
          <div className="flex items-center gap-1.5"><ImageIcon size={12} /> Capa</div>
          <div className="flex items-center gap-1.5"><Layers size={12} /> Grid</div>
          <div className="flex items-center gap-1.5"><Download size={12} /> Exportar</div>
        </div>
        <p className="text-xs text-neutral-500">
          Editor visual em construção. IA sugere layout e copy com base na sua identidade visual.
        </p>
      </GlassCard>
    </>
  )
}

/* ------------------------------------------------------------ */
/* TAB 2 — CAPAS                                                 */
/* ------------------------------------------------------------ */

const ESTILOS = [
  { slug: 'minimalista',      nome: 'Minimalista',       sub: 'tipografia grande, 1 cor' },
  { slug: 'cinematografico',  nome: 'Cinematográfico',   sub: 'cena + mood atmosférico' },
  { slug: 'abstrato',         nome: 'Abstrato',          sub: 'formas geométricas, gradientes' },
  { slug: 'retrato',          nome: 'Retrato',           sub: 'foto do artista + tratamento' },
]

function CapasPanel() {
  return (
    <>
      <DesignGenerator
        type="capa"
        title="Gerar capa de lançamento"
        description="Descreva a faixa, o mood e as referências. O render local devolve em alta resolução."
        placeholder='Ex: "EP techno melódico, vibe noite chuvosa em Berlim"'
      />

      <p className="label-caps mb-3 mt-8">Estilos de referência</p>
      <div className="grid grid-cols-4 gap-3 stagger">
        {ESTILOS.map((e) => (
          <GlassCard key={e.slug} floating className="p-4">
            <div className="aspect-square rounded-lg border border-white/10 mb-3 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverArt(e.slug, 400)}
                alt={e.nome}
                className="w-full h-full object-cover"
                style={{ filter: 'sepia(0.25) saturate(0.8) contrast(1.05)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-transparent" />
            </div>
            <p className="text-sm text-neutral-100 font-medium">{e.nome}</p>
            <p className="text-[11px] text-neutral-500">{e.sub}</p>
          </GlassCard>
        ))}
      </div>
    </>
  )
}

/* ------------------------------------------------------------ */
/* TAB 3 — ARTES                                                 */
/* ------------------------------------------------------------ */

const FORMATOS = [
  { slug: 'story-ig',       nome: 'Story IG',         tamanho: '1080×1920', desc: 'anúncio de gig, teaser, take-over' },
  { slug: 'post-feed',      nome: 'Post feed',        tamanho: '1080×1350', desc: 'divulgação de release, gig' },
  { slug: 'flyer-gig',      nome: 'Flyer gig',        tamanho: '1080×1920', desc: 'data, line-up, local' },
  { slug: 'thumb-yt',       nome: 'Thumbnail YT',     tamanho: '1280×720',  desc: 'teaser video ou set recording' },
  { slug: 'banner-spotify', nome: 'Banner Spotify',   tamanho: '2660×1140', desc: 'cabeçalho do perfil do artista' },
  { slug: 'press-release',  nome: 'Press release',    tamanho: 'PDF A4',    desc: 'comunicado pra imprensa' },
]

function ArtesPanel() {
  return (
    <>
      <DesignGenerator
        type="arte"
        title="Gerar arte"
        description="Escolha o formato (story, feed, thumbnail) e descreva o que precisa. Render local entrega no aspect correto."
        placeholder='Ex: "anúncio de gig sexta, mood dark, neon roxo"'
      />

      <p className="label-caps mb-3 mt-8">Formatos disponíveis</p>
      <div className="grid grid-cols-3 gap-3 stagger">
        {FORMATOS.map((f) => (
          <GlassCard key={f.slug} floating className="p-0 cursor-pointer overflow-hidden">
            <div className="aspect-[16/9] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(f.slug, 400, 225)}
                alt={f.nome}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="absolute top-2 right-2 text-[10px] glass-pill px-2 py-0.5 text-neutral-200 font-mono">
                {f.tamanho}
              </span>
              <Palette size={18} className="absolute bottom-2 left-2 text-yellow-500" />
            </div>
            <div className="p-4">
              <p className="text-sm text-neutral-100 font-semibold mb-1">{f.nome}</p>
              <p className="text-xs text-neutral-400 leading-relaxed">{f.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <p className="text-xs text-neutral-600 mt-6 leading-relaxed max-w-xl">
        Todas as artes respeitam a paleta, tipografia e logo cadastrados em <span className="text-yellow-500">Minha Marca → Identidade Visual</span>.
        Sem isso, o sistema usa defaults seguros da tua cena.
      </p>
    </>
  )
}

/* ------------------------------------------------------------ */
/* TAB 4 — PRESS KIT                                             */
/* ------------------------------------------------------------ */

const CENARIOS = [
  { slug: 'studio-escuro',    nome: 'Estúdio escuro',     mood: 'dramático, iluminação lateral' },
  { slug: 'rooftop-urbano',   nome: 'Rooftop urbano',     mood: 'noite, neon, skyline' },
  { slug: 'sala-producao',    nome: 'Sala de produção',   mood: 'técnico, equipamentos em foco' },
  { slug: 'backstage',        nome: 'Backstage',          mood: 'cândido, corredor escuro' },
  { slug: 'festival',         nome: 'Festival',           mood: 'multidão, luzes, euforia' },
  { slug: 'retrato-editorial',nome: 'Retrato editorial',  mood: 'fundo neutro, look intencional' },
]

function PressKitPanel() {
  return (
    <>
      <GlassCard variant="accent" className="p-6 mb-6 anim-fade-up">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
            <Camera size={18} className="text-yellow-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-100 mb-1">Fotos profissionais do artista — com IA</p>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Envie 10-15 fotos do seu rosto em ângulos diferentes. O sistema treina um modelo personalizado (~20min)
              e gera fotos em qualquer cenário mantendo <b>sua identidade</b>. Sem ensaio fotográfico, sem fotógrafo.
            </p>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-sm font-semibold press-scale glow-accent flex items-center gap-2">
                <Upload size={14} /> Enviar minhas fotos
              </button>
              <button className="px-5 py-2.5 rounded-lg glass-pill text-sm text-neutral-200 press-scale">
                Como funciona
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      <p className="label-caps mb-3">Cenários disponíveis</p>
      <div className="grid grid-cols-3 gap-3 mb-8 stagger">
        {CENARIOS.map((c) => (
          <GlassCard key={c.slug} floating className="p-0 cursor-pointer overflow-hidden">
            <div className="aspect-[4/5] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pressPhoto(c.slug, 320, 400)}
                alt={c.nome}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm text-neutral-100 font-semibold">{c.nome}</p>
                <p className="text-[10px] text-neutral-300 mt-0.5 truncate">{c.mood}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard floating className="p-6 anim-fade-up">
        <p className="label-caps mb-3">Deliverables do Press Kit</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            'Bio curta (150 palavras)',
            'Bio longa (400 palavras)',
            '10 fotos em alta (3000×3000)',
            'Rider técnico (PDF)',
            'Logo vetorial (SVG + PNG)',
            'Paleta de cores (código + preview)',
          ].map((d) => (
            <div key={d} className="flex items-center gap-2 text-sm text-neutral-300">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              {d}
            </div>
          ))}
        </div>
        <button className="mt-5 px-4 py-2 rounded-lg glass-pill text-xs text-neutral-200 press-scale flex items-center gap-2">
          <Plus size={12} /> Gerar Press Kit completo (ZIP)
        </button>
      </GlassCard>

      <p className="text-xs text-neutral-600 mt-4 leading-relaxed max-w-2xl">
        Tecnologia: <span className="text-neutral-400">Flux LoRA</span> via Replicate — treina um modelo só pra você.
        Resultado mantém teu rosto, cabelo e estilo em qualquer cenário. Custo no plano: incluso (até 2 treinos/mês).
      </p>
    </>
  )
}
