'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, X } from 'lucide-react'

export function AbrirCasoButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [bossId, setBossId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!bossId.trim()) return
    setSaving(true)
    setErr(null)
    try {
      const res = await fetch('/api/boss-cases', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          bossId: bossId.trim().toLowerCase().replace(/\s+/g, '-'),
          feedback: feedback.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error('Falhou ao abrir caso')
      setBossId('')
      setFeedback('')
      setOpen(false)
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-xs font-bold press-scale glow-accent font-mono uppercase tracking-widest"
      >
        <Plus size={12} /> Abrir Caso
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => !saving && setOpen(false)}>
          <div className="paper p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="case-number mb-1">NOVO DOSSIÊ</p>
                <p className="doc-title">Abrir Caso</p>
              </div>
              <button onClick={() => setOpen(false)} disabled={saving} className="text-neutral-500 hover:text-yellow-500">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="doc-label block mb-1">Identificador do contato</label>
                <input
                  autoFocus
                  value={bossId}
                  onChange={(e) => setBossId(e.target.value)}
                  placeholder="ex: gabriel-arena-bar"
                  className="w-full px-3 py-2 rounded bg-black/40 border border-yellow-500/20 text-sm text-neutral-100 focus:outline-none focus:border-yellow-500/50 font-mono"
                />
              </div>
              <div>
                <label className="doc-label block mb-1">Primeira evidência (opcional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Cole a conversa, email ou DM inicial"
                  className="w-full px-3 py-2 rounded bg-black/40 border border-yellow-500/20 text-sm text-neutral-200 focus:outline-none focus:border-yellow-500/50 min-h-24 resize-none font-mono"
                />
              </div>
              {err && <p className="text-xs text-red-400">{err}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !bossId.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-xs font-bold press-scale font-mono uppercase tracking-widest disabled:opacity-50"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  {saving ? 'Abrindo...' : 'Abrir'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded border border-yellow-500/20 text-neutral-400 text-xs font-mono uppercase tracking-widest hover:text-yellow-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
