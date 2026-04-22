'use client'

import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import {
  ChevronLeft, Send, MessageSquarePlus, Clock, Archive,
  FileCheck2, FileX2, FileClock,
} from 'lucide-react'
import {
  PageShell, Stamp, CharacterPortrait, StatusGauge,
  DialogueBox, ActionMenu, type Action,
} from '@/components/ui'
import { getBoss, DIFF_COLOR, STATUS_LABEL, FASE_LABEL, FASES_ORDER, type Proof } from '../_data'

export default function BossArenaPage() {
  const params = useParams<{ id: string }>()
  const boss = getBoss(params.id)
  if (!boss) notFound()

  const actions: Action[] = [
    { id: 'propose',  label: 'Enviar Proposta', icon: Send,              variant: 'primary' },
    { id: 'followup', label: 'Follow-up Curto', icon: MessageSquarePlus },
    { id: 'wait',     label: 'Aguardar (3d)',   icon: Clock },
    { id: 'retreat',  label: 'Arquivar Caso',   icon: Archive,           variant: 'danger' },
  ]

  return (
    <PageShell max="xl">
      {/* Back link */}
      <Link
        href="/chefoes"
        className="inline-flex items-center gap-2 text-xs text-yellow-500/70 hover:text-yellow-500 font-mono uppercase tracking-widest press-scale mb-6"
      >
        <ChevronLeft size={14} /> Dossiês
      </Link>

      <div className="grid grid-cols-[minmax(320px,380px)_1fr] gap-6 items-start">
        {/* ===================================================
            COLUNA ESQUERDA — DOSSIÊ DO ALVO (Papers, Please)
            =================================================== */}
        <aside className="anim-fade-up">
          <div className="folder-tab">CASO {boss.caso} · {boss.tipo.toUpperCase()}</div>
          <div className="paper p-5">
            {/* stamp grande no topo-direito */}
            <div className="absolute top-4 right-4 z-10">
              <Stamp variant="active" size="lg">ATIVO</Stamp>
            </div>

            <p className="case-number mb-3">DOSSIÊ CONFIDENCIAL</p>

            <div className="flex gap-4 mb-5">
              <CharacterPortrait
                iniciais={boss.iniciais}
                nome={boss.nome}
                src={boss.fotoUrl}
                size="lg"
                tipo={boss.tipo}
              />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <p className="doc-label mb-0.5">ALVO</p>
                  <p className="doc-title text-lg leading-tight">{boss.nome.toUpperCase()}</p>
                </div>
                <div>
                  <p className="doc-label mb-0.5">FUNÇÃO</p>
                  <p className="doc-value text-xs">{boss.funcao}</p>
                </div>
                <div>
                  <p className="doc-label mb-0.5">CATEGORIA</p>
                  <p className="doc-value text-xs uppercase">{boss.tipo}</p>
                </div>
              </div>
            </div>

            <hr className="doc-divider" />

            <div className="dossier-grid">
              <div className="dossier-field">
                <span className="doc-label">Dificuldade</span>
                <span className={`doc-value border px-2 py-0.5 rounded uppercase text-[11px] tracking-widest w-fit ${DIFF_COLOR[boss.dificuldade]}`}>
                  {boss.dificuldade}
                </span>
              </div>
              <div className="dossier-field">
                <span className="doc-label">Recompensa</span>
                <span className="doc-value text-yellow-500">{boss.xp} XP</span>
              </div>
              <div className="dossier-field">
                <span className="doc-label">Em aberto</span>
                <span className="doc-value">{boss.dias} dias</span>
              </div>
              <div className="dossier-field">
                <span className="doc-label">Status</span>
                <span className="doc-value text-[11px]">{STATUS_LABEL[boss.status]}</span>
              </div>

              <div className="dossier-field dossier-grid-full">
                <span className="doc-label">Objetivo do caso</span>
                <span className="doc-value leading-relaxed">{boss.objetivo}</span>
              </div>

              <div className="dossier-field dossier-grid-full">
                <span className="doc-label">Critério de vitória</span>
                <span className="doc-value text-xs leading-relaxed text-neutral-300">
                  {boss.criterio}
                </span>
              </div>
            </div>

            <hr className="doc-divider" />

            {/* HP bars / status gauges */}
            <div className="flex flex-col gap-3 mb-4">
              <StatusGauge label="Interesse do Alvo" value={boss.interesse} />
              <StatusGauge label="Urgência / Janela" value={boss.urgencia} />
            </div>

            <hr className="doc-divider" />

            {/* fase atual */}
            <p className="doc-label mb-2">Fase da Relação</p>
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
        </aside>

        {/* ===================================================
            COLUNA DIREITA — ARENA DE BATALHA (Pokemon)
            =================================================== */}
        <section className="flex flex-col gap-4 anim-fade-up">
          {/* Timeline de provas */}
          <div className="paper p-5">
            <p className="case-number mb-3">HISTÓRICO DE EVIDÊNCIAS · {boss.proofs.length} registros</p>
            <div className="flex flex-col gap-2">
              {boss.proofs.map((p, i) => (
                <ProofRow key={i} proof={p} />
              ))}
            </div>
          </div>

          {/* Dialogue — última fala do boss */}
          <DialogueBox speaker={boss.nome.split(' ')[0].toUpperCase()} showContinue>
            {lastBossLine(boss.proofs) ?? 'Nenhuma resposta ainda.'}
          </DialogueBox>

          {/* Dialogue — conselho do Diogo */}
          <DialogueBox speaker="Diogo · conselho" variant="advisor" showContinue>
            {boss.ultimoFeedback}
          </DialogueBox>

          {/* Action menu */}
          <div>
            <p className="doc-label mb-2">Movimento disponível</p>
            <ActionMenu actions={actions} />
          </div>

          {/* Colar nova prova */}
          <div className="paper p-5">
            <p className="case-number mb-2">ANEXAR NOVA EVIDÊNCIA</p>
            <p className="text-xs text-neutral-400 mb-3 font-mono leading-relaxed">
              Colou uma resposta nova dele? Envia aqui. O sistema reinterpreta e atualiza HP
              + fase do caso + devolve novo conselho do Diogo.
            </p>
            <textarea
              placeholder='Cole a resposta recebida — mantém emojis, horário, tudo.'
              className="w-full bg-black/30 border border-yellow-500/20 rounded px-3 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-colors min-h-20 resize-none font-mono"
              disabled
            />
            <button className="mt-3 flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-xs font-bold font-mono uppercase tracking-wider press-scale glow-accent">
              Reinterpretar Caso
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

/* ------------------------------------------------------------ */

function lastBossLine(proofs: Proof[]) {
  for (let i = proofs.length - 1; i >= 0; i--) {
    if (proofs[i].quem === 'boss') return `"${proofs[i].texto}"`
  }
  return null
}

function ProofRow({ proof }: { proof: Proof }) {
  const VeredictoIcon =
    proof.veredicto === 'sucesso' ? FileCheck2 :
    proof.veredicto === 'falha'   ? FileX2     :
                                     FileClock
  const vColor =
    proof.veredicto === 'sucesso' ? 'text-emerald-400' :
    proof.veredicto === 'falha'   ? 'text-red-400'     :
                                     'text-yellow-500'
  const labelQuem = proof.quem === 'boss' ? 'ALVO' : 'VOCÊ'
  const labelCor = proof.quem === 'boss' ? 'text-yellow-500' : 'text-sky-400'

  return (
    <div className="flex items-start gap-3 p-3 bg-black/30 border border-yellow-500/10 rounded">
      <VeredictoIcon size={14} className={`${vColor} mt-0.5 shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-0.5">
          <span className={`font-mono text-[10px] uppercase tracking-widest ${labelCor} font-bold`}>
            {labelQuem}
          </span>
          <span className="doc-label">{proof.data}</span>
        </div>
        <p className="text-xs text-neutral-300 font-mono leading-relaxed">{proof.texto}</p>
      </div>
    </div>
  )
}
