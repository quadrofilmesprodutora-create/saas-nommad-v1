'use client'

import Link from 'next/link'
import {
  Swords, Trophy, Users, BarChart3, ChevronRight, Crown, Upload, Sparkles,
} from 'lucide-react'
import {
  PageShell, PageHeader, Tabs, Stamp, CharacterPortrait, StatusGauge,
} from '@/components/ui'
import { avatarUrl } from '@/lib/placeholders'
import {
  BOSSES, DIFF_COLOR, STATUS_LABEL, FASE_LABEL, FASES_ORDER, type Boss,
} from './_data'
import { AbrirCasoButton } from './abrir-caso-button'
import { PsychoTrigger } from './psycho-trigger'

const TABS = [
  { value: 'ativos',     label: 'Ativos',     icon: Swords,    badge: BOSSES.length },
  { value: 'concluidos', label: 'Concluídos', icon: Trophy },
  { value: 'network',    label: 'Network',    icon: Users },
  { value: 'ranking',    label: 'Ranking',    icon: BarChart3 },
]

export default function ChefoesPage() {
  return (
    <PageShell max="xl">
      <PageHeader
        eyebrow="★ Dossiês da Carreira"
        title="Seus"
        accent="Chefões"
        subtitle="Cada contato real da sua carreira é um caso aberto. Cola a conversa, o sistema carimba o status e o Diogo aconselha o próximo movimento."
        right={<AbrirCasoButton />}
      />

      <Tabs tabs={TABS} variant="pill" defaultValue="ativos">
        {(active) => {
          if (active === 'ativos')     return <AtivosPanel />
          if (active === 'concluidos') return <ConcluidosPanel />
          if (active === 'network')    return <NetworkPanel />
          if (active === 'ranking')    return <RankingPanel />
          return null
        }}
      </Tabs>
    </PageShell>
  )
}

/* ------------------------------------------------------------ */
/* ATIVOS — pilha de dossiês (Papers, Please puro)              */
/* ------------------------------------------------------------ */

function AtivosPanel() {
  return (
    <div className="flex flex-col gap-6 stagger">
      <PsychoTrigger />
      {BOSSES.map((b) => (
        <CaseFile key={b.id} boss={b} />
      ))}

      <div>
        <div className="folder-tab">ANEXO · NOVA EVIDÊNCIA</div>
        <div className="paper p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded border-2 border-yellow-500/40 bg-yellow-500/5 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="case-number mb-1">COLAR CONVERSA</p>
              <p className="doc-title text-base mb-2">Anexar evidência</p>
              <p className="text-xs text-neutral-400 mb-3 font-mono leading-relaxed">
                WhatsApp, DM ou email. O Proof Interpreter identifica o contato,
                classifica o tom e atualiza o status do caso. Se for contato novo,
                abre dossiê automático.
              </p>
              <div className="relative">
                <textarea
                  placeholder='"E aí, tava vendo teu set no Warung, nossa casa tem interesse..."'
                  className="w-full bg-black/30 border border-yellow-500/20 rounded px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-colors min-h-24 resize-none font-mono opacity-50 cursor-not-allowed"
                  disabled
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-500/60 bg-black/60 px-3 py-1.5 rounded border border-yellow-500/20">
                    Complete o onboarding para ativar
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button type="button" disabled className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-b from-yellow-400/50 to-yellow-500/50 text-neutral-950/70 text-xs font-bold font-mono uppercase tracking-widest cursor-not-allowed">
                  <Upload size={12} /> Analisar Evidência
                </button>
                <div className="flex items-center gap-2 text-neutral-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Diogo IA · online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CaseFile({ boss }: { boss: Boss }) {
  return (
    <Link href={`/chefoes/${boss.id}`} className="block group">
      <div className="folder-tab">CASO {boss.caso} · {boss.tipo.toUpperCase()}</div>
      <div className="paper p-5 group-hover:border-yellow-500/35 transition-all duration-300 relative">
        <div className="absolute top-4 right-4 z-10">
          <Stamp variant="active">{STATUS_LABEL[boss.status]}</Stamp>
        </div>

        <div className="flex items-start gap-5">
          <CharacterPortrait
            iniciais={boss.iniciais}
            nome={boss.nome}
            src={boss.fotoUrl}
            size="md"
            tipo={boss.tipo}
          />

          <div className="flex-1 min-w-0">
            <p className="case-number mb-1">DOSSIÊ CONFIDENCIAL</p>
            <p className="doc-title">{boss.nome.toUpperCase()}</p>
            <p className="doc-label mt-1 mb-4">{boss.funcao}</p>

            <hr className="doc-divider" />

            <div className="grid grid-cols-[1fr_auto] gap-6 items-center">
              <div className="flex flex-col gap-3">
                <StatusGauge label="Interesse" value={boss.interesse} />
                <StatusGauge label="Urgência"  value={boss.urgencia} />
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <div className="flex items-center gap-2">
                  <span className={`doc-value border px-2 py-0.5 rounded uppercase text-[10px] tracking-widest ${DIFF_COLOR[boss.dificuldade]}`}>
                    {boss.dificuldade}
                  </span>
                  <span className="doc-value text-yellow-500">{boss.xp} XP</span>
                </div>
                <span className="doc-label">{boss.dias} dias em aberto</span>
                <ChevronRight size={14} className="text-yellow-500/60 group-hover:translate-x-1 transition-transform mt-1" />
              </div>
            </div>

            <hr className="doc-divider" />

            <div className="phase-steps">
              {FASES_ORDER.map((f) => {
                const currentIdx = FASES_ORDER.indexOf(boss.fase)
                const thisIdx = FASES_ORDER.indexOf(f)
                const cls = thisIdx < currentIdx ? 'done' : thisIdx === currentIdx ? 'active' : ''
                return (
                  <div key={f} className={`phase-step ${cls}`}>
                    {FASE_LABEL[f]}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------ */
/* CONCLUÍDOS                                                    */
/* ------------------------------------------------------------ */

function ConcluidosPanel() {
  return (
    <div className="paper p-12 flex flex-col items-center text-center">
      <Trophy size={36} className="text-yellow-500/40 mb-4" />
      <p className="doc-title text-base mb-2">Arquivo de Vitórias — Vazio</p>
      <p className="text-sm text-neutral-400 max-w-sm font-mono leading-relaxed">
        Quando um caso fecha com vitória (gig confirmada, A&R respondendo, collab marcada),
        o dossiê migra pra cá com carimbo <span className="stamp stamp-won inline-block ml-1">VITÓRIA</span>
      </p>
    </div>
  )
}

/* ------------------------------------------------------------ */
/* NETWORK                                                       */
/* ------------------------------------------------------------ */

const CONTATOS = [
  { id: 'gabriel-arena-bar',  nome: 'Gabriel (Arena Bar)', tipo: 'contratante' as const, relacao: 'morno',      ultimaInt: '2 dias',  potencial: 72, iniciais: 'GS' },
  { id: 'marcela-label-xyz',  nome: 'Marcela (Label XYZ)', tipo: 'label'       as const, relacao: 'frio',       ultimaInt: '9 dias',  potencial: 58, iniciais: 'MA' },
  { id: 'dj-nuno',            nome: 'DJ Nuno',             tipo: 'artista'     as const, relacao: 'quente',     ultimaInt: 'ontem',   potencial: 81, iniciais: 'DN' },
  { id: 'carla-playlist-br',  nome: 'Carla (Playlist BR)', tipo: 'media'       as const, relacao: 'recorrente', ultimaInt: '3 dias',  potencial: 90, iniciais: 'CA' },
]

const RELACAO_STAMP: Record<string, 'classified' | 'pending' | 'active' | 'won'> = {
  frio:       'classified',
  morno:      'pending',
  quente:     'active',
  recorrente: 'won',
}

function NetworkPanel() {
  return (
    <>
      <div className="flex flex-col gap-3 stagger">
        {CONTATOS.map((c) => (
          <div key={c.id} className="paper p-4 flex items-center gap-4 cursor-pointer hover:border-yellow-500/35 transition-colors">
            <CharacterPortrait
              iniciais={c.iniciais}
              src={avatarUrl(c.id, 'avataaars')}
              size="sm"
              tipo={c.tipo}
            />
            <div className="flex-1 min-w-0">
              <p className="doc-value mb-0.5">{c.nome}</p>
              <p className="doc-label">{c.tipo} · última interação {c.ultimaInt}</p>
            </div>
            <Stamp variant={RELACAO_STAMP[c.relacao]}>{c.relacao.toUpperCase()}</Stamp>
            <div className="flex items-center gap-2 w-24">
              <div className="h-1.5 flex-1 bg-black/40 rounded-full overflow-hidden border border-yellow-500/15">
                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" style={{ width: `${c.potencial}%` }} />
              </div>
              <span className="font-mono text-[10px] text-yellow-500 w-6 text-right">{c.potencial}</span>
            </div>
            <ChevronRight size={14} className="text-yellow-500/50" />
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-500 mt-6 leading-relaxed max-w-xl font-mono">
        Todo contato de uma evidência entra no Network. Potencial (0–100) calculado pelo
        Proof Interpreter. Quem chega em 80+ vira boss recorrente e ganha prioridade nas missões.
      </p>
    </>
  )
}

/* ------------------------------------------------------------ */
/* RANKING                                                       */
/* ------------------------------------------------------------ */

const RANKING = [
  { pos: 1, nome: 'JULIETA KAOS',   fase: 'consolidacao', score: 2840, delta: 2,  seed: 'julieta-kaos'  },
  { pos: 2, nome: 'BRUNO THE REAL', fase: 'consolidacao', score: 2610, delta: -1, seed: 'bruno-real'    },
  { pos: 3, nome: 'LIV TRANSIENT',  fase: 'consolidacao', score: 2480, delta: 4,  seed: 'liv-transient' },
  { pos: 4, nome: 'VOCÊ',           fase: 'construcao',   score: 1820, delta: 7,  seed: 'vitor-nomad', isYou: true },
  { pos: 5, nome: 'KAIO PX',        fase: 'construcao',   score: 1795, delta: 0,  seed: 'kaio-px'       },
  { pos: 6, nome: 'NINA 99',        fase: 'construcao',   score: 1710, delta: -2, seed: 'nina-99'       },
]

const SCOPES = ['SEMANAL', 'MINHA FASE', 'MINHA CIDADE', 'GLOBAL']

function RankingPanel() {
  return (
    <>
      <div className="flex gap-2 mb-6 flex-wrap">
        {SCOPES.map((s, i) => (
          <button
            key={s}
            className={`px-4 py-1.5 rounded font-mono uppercase text-[11px] tracking-widest press-scale transition-all ${
              i === 0
                ? 'bg-yellow-500 text-neutral-950 font-bold'
                : 'border border-yellow-500/20 text-neutral-400 hover:text-yellow-500 hover:border-yellow-500/50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="paper overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_140px_100px_60px] gap-3 px-5 py-3 border-b border-yellow-500/20 doc-label">
          <span>POS</span>
          <span>ARTISTA</span>
          <span>FASE</span>
          <span className="text-right">SCORE</span>
          <span className="text-right">Δ 7D</span>
        </div>
        {RANKING.map((r) => (
          <div
            key={r.pos}
            className={`grid grid-cols-[60px_1fr_140px_100px_60px] gap-3 px-5 py-3 items-center border-b border-yellow-500/10 last:border-b-0 transition-colors ${
              r.isYou ? 'bg-yellow-500/[0.06]' : 'hover:bg-yellow-500/[0.02]'
            }`}
          >
            <span className="flex items-center gap-2">
              {r.pos <= 3 && <Crown size={12} className="text-yellow-500" />}
              <span className={`font-mono text-sm ${r.isYou ? 'text-yellow-500 font-bold' : 'text-neutral-400'}`}>
                {String(r.pos).padStart(2, '0')}
              </span>
            </span>
            <span className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl(r.seed, 'avataaars')}
                alt={r.nome}
                className="w-6 h-6 rounded-full border border-yellow-500/20"
              />
              <span className={`doc-value ${r.isYou ? 'text-yellow-500' : ''}`}>{r.nome}</span>
            </span>
            <span className="doc-label">{r.fase}</span>
            <span className="doc-value text-right">{r.score}</span>
            <span className={`font-mono text-xs text-right ${
              r.delta > 0 ? 'text-emerald-400' : r.delta < 0 ? 'text-red-400' : 'text-neutral-500'
            }`}>
              {r.delta > 0 ? `+${r.delta}` : r.delta}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 mt-6 stagger">
        {[
          { label: 'EXEC',   valor: '78', desc: 'missões · 25%' },
          { label: 'BOSS',   valor: '42', desc: 'XP · 35%' },
          { label: 'IMPACT', valor: '31', desc: 'gigs + receita · 25%' },
          { label: 'EVOL',   valor: '24', desc: 'consistência · 15%' },
        ].map((k) => (
          <div key={k.label} className="paper p-4">
            <p className="doc-label mb-2">{k.label}</p>
            <p className="doc-title text-xl">{k.valor}</p>
            <p className="text-[10px] text-neutral-500 mt-1 font-mono">{k.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-500 mt-6 leading-relaxed max-w-xl font-mono">
        Recalcula toda segunda às 00h. Sem farmar: bosses repetidos valem 50% menos, provas
        suspeitas (timeline impossível, conversa fake) não contam. Ranking semanal decai
        se você parar de interagir.
      </p>
    </>
  )
}
