'use client'

import { useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { GlassCard } from '@/components/ui'
import { thumbnailUrl } from '@/lib/placeholders'

type ColId = 'ideias' | 'em_desenvolvimento' | 'agendado' | 'publicado' | 'arquivado'
type Card = { id: string; titulo: string; tipo: string; coluna: string; prioridade?: number | null }

const COLUMNS: { id: ColId; titulo: string }[] = [
  { id: 'ideias',            titulo: 'Ideias' },
  { id: 'em_desenvolvimento', titulo: 'Em Desenvolvimento' },
  { id: 'agendado',          titulo: 'Agendado' },
  { id: 'publicado',         titulo: 'Publicado' },
  { id: 'arquivado',         titulo: 'Arquivado' },
]

const TAG_COLOR: Record<string, string> = {
  conteudo: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  musica:   'text-violet-400 bg-violet-500/10 border-violet-500/30',
  branding: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
}

export function KanbanBoard({ initialCards, isPreview }: { initialCards: Card[]; isPreview: boolean }) {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [adding, setAdding] = useState<ColId | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [, startTransition] = useTransition()

  async function handleAdd(coluna: ColId) {
    const titulo = newTitle.trim()
    if (!titulo) return
    setAdding(null)
    setNewTitle('')

    const optimistic: Card = { id: crypto.randomUUID(), titulo, tipo: 'conteudo', coluna }
    setCards((c) => [...c, optimistic])

    if (!isPreview) {
      startTransition(async () => {
        try {
          const res = await fetch('/api/kanban', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, coluna }),
          })
          const data = await res.json()
          if (data.id) {
            setCards((c) => c.map((card) => card.id === optimistic.id ? { ...card, id: data.id } : card))
          }
        } catch {
          setCards((c) => c.filter((card) => card.id !== optimistic.id))
        }
      })
    }
  }

  async function handleMove(id: string, coluna: ColId) {
    setCards((c) => c.map((card) => card.id === id ? { ...card, coluna } : card))
    if (!isPreview) {
      fetch('/api/kanban', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, coluna }),
      }).catch(() => {})
    }
  }

  async function handleDelete(id: string) {
    setCards((c) => c.filter((card) => card.id !== id))
    if (!isPreview) {
      fetch('/api/kanban', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {})
    }
  }

  return (
    <div className="grid grid-cols-5 gap-4 stagger" style={{ minHeight: 'calc(100vh - 220px)' }}>
      {COLUMNS.map((col) => {
        const colCards = cards.filter((c) => c.coluna === col.id)
        return (
          <GlassCard key={col.id} variant="flat" className="p-3 flex flex-col" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            <div className="flex items-center justify-between px-1 mb-3 shrink-0">
              <p className="label-caps font-medium">{col.titulo}</p>
              <span className="text-[10px] text-neutral-600">{colCards.length}</span>
            </div>

            {adding === col.id ? (
              <div className="shrink-0 mb-2 flex flex-col gap-1">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd(col.id)
                    if (e.key === 'Escape') { setAdding(null); setNewTitle('') }
                  }}
                  placeholder="Título do card..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/40"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAdd(col.id)}
                    className="flex-1 text-[11px] bg-yellow-500/10 text-yellow-500 rounded py-1 hover:bg-yellow-500/20 transition-colors"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => { setAdding(null); setNewTitle('') }}
                    className="p-1 text-neutral-600 hover:text-neutral-400"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(col.id)}
                className="shrink-0 mb-2 flex items-center justify-center gap-1 text-[11px] text-neutral-600 hover:text-yellow-500 hover:border-yellow-500/30 border border-dashed border-white/10 rounded-lg py-2 transition-colors press-scale"
              >
                <Plus size={11} /> adicionar
              </button>
            )}

            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5">
              {colCards.map((c) => (
                <div key={c.id} className="glass-card glass-hover p-3 cursor-default overflow-hidden shrink-0 group relative">
                  {(c.tipo === 'conteudo' || c.tipo === 'musica') && (
                    <div className="aspect-[16/7] -m-3 mb-3 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl(c.id, 280, 120)}
                        alt={c.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                  )}
                  <p className="text-xs text-neutral-200 mb-2 leading-snug pr-4">{c.titulo}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${TAG_COLOR[c.tipo] ?? TAG_COLOR.conteudo}`}>
                      {c.tipo}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {COLUMNS.filter((col2) => col2.id !== col.id).slice(0, 2).map((col2) => (
                        <button
                          key={col2.id}
                          onClick={() => handleMove(c.id, col2.id)}
                          className="text-[9px] text-neutral-500 hover:text-yellow-500 transition-colors"
                          title={`Mover para ${col2.titulo}`}
                        >
                          →{col2.titulo.slice(0, 3)}
                        </button>
                      ))}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-neutral-600 hover:text-red-400 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {colCards.length === 0 && (
                <div className="text-[11px] text-neutral-700 text-center py-6 flex-1">vazio</div>
              )}
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
