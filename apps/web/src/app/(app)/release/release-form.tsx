'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Calendar, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui'

export function ReleaseForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<'single' | 'ep' | 'album'>('single')
  const [data, setData] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setSaving(true)
    setErr(null)
    try {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          tipo,
          releaseDate: data ? new Date(data).toISOString() : undefined,
        }),
      })
      if (!res.ok) throw new Error('Falhou ao cadastrar')
      setTitulo('')
      setData('')
      setTipo('single')
      setOpen(false)
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <GlassCard floating className="p-8 flex flex-col items-center text-center anim-fade-up">
      <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mb-4 glow-accent">
        <Music size={22} className="text-yellow-500" />
      </div>
      <p className="text-base font-semibold text-neutral-100 mb-1">Cadastrar novo release</p>
      <p className="text-sm text-neutral-400 max-w-md mb-6">
        Cadastre sua próxima faixa / EP. O sistema cria os cards de conteúdo no Kanban e
        agenda as peças no calendário automaticamente.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-sm font-semibold hover:brightness-110 transition-all press-scale flex items-center gap-2 glow-accent"
        >
          <Music size={14} /> Novo release
        </button>
      ) : (
        <form onSubmit={submit} className="w-full max-w-md space-y-3 text-left">
          <div>
            <label className="label-caps block mb-1">Título</label>
            <input
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Máquina de Ansiedade"
              className="w-full px-3 py-2 rounded-lg bg-neutral-900/80 border border-white/10 text-sm text-neutral-100 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-caps block mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'single' | 'ep' | 'album')}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900/80 border border-white/10 text-sm text-neutral-100 focus:outline-none focus:border-yellow-500/50"
              >
                <option value="single">Single</option>
                <option value="ep">EP</option>
                <option value="album">Álbum</option>
              </select>
            </div>
            <div>
              <label className="label-caps block mb-1">Data de lançamento</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900/80 border border-white/10 text-sm text-neutral-100 focus:outline-none focus:border-yellow-500/50"
              />
            </div>
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !titulo.trim()}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-sm font-semibold hover:brightness-110 transition-all press-scale flex items-center gap-2 glow-accent disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Music size={14} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-lg glass-pill text-sm text-neutral-200 press-scale flex items-center gap-2"
            >
              <Calendar size={14} /> Cancelar
            </button>
          </div>
        </form>
      )}
    </GlassCard>
  )
}
