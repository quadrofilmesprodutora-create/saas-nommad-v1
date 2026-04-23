'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui'
import { Save, Plus, Trash2 } from 'lucide-react'

type Workflow = {
  slug: string
  type: 'capa' | 'arte'
  name: string
  description: string | null
  comfyJson: Record<string, unknown>
  paramSchema: Record<string, unknown>
  defaults: Record<string, unknown> | null
  enabled: boolean
}

const EMPTY: Workflow = {
  slug: '',
  type: 'capa',
  name: '',
  description: '',
  comfyJson: {},
  paramSchema: { prompt: { type: 'string', required: true } },
  defaults: {},
  enabled: true,
}

export function AdvancedEditor() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selected, setSelected] = useState<Workflow>(EMPTY)
  const [comfyText, setComfyText] = useState('{}')
  const [paramText, setParamText] = useState('{}')
  const [defaultsText, setDefaultsText] = useState('{}')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch('/api/design/admin/workflows')
    const data = await res.json()
    setWorkflows(data.workflows ?? [])
  }

  useEffect(() => { load() }, [])

  const pick = (w: Workflow) => {
    setSelected(w)
    setComfyText(JSON.stringify(w.comfyJson, null, 2))
    setParamText(JSON.stringify(w.paramSchema, null, 2))
    setDefaultsText(JSON.stringify(w.defaults ?? {}, null, 2))
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const comfyJson = JSON.parse(comfyText)
      const paramSchema = JSON.parse(paramText)
      const defaults = JSON.parse(defaultsText)
      const res = await fetch('/api/design/admin/workflows', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug: selected.slug,
          type: selected.type,
          name: selected.name,
          description: selected.description ?? undefined,
          comfyJson,
          paramSchema,
          defaults,
          enabled: selected.enabled,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data.error ?? data))
      setMessage('Salvo.')
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Falha')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!selected.slug || !confirm(`Apagar workflow "${selected.slug}"?`)) return
    const res = await fetch('/api/design/admin/workflows', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug: selected.slug }),
    })
    if (res.ok) {
      setSelected(EMPTY)
      await load()
    }
  }

  return (
    <div className="grid grid-cols-[260px_1fr] gap-4 mt-4">
      <aside className="space-y-2">
        <button
          onClick={() => { setSelected(EMPTY); setComfyText('{}'); setParamText('{"prompt":{"type":"string","required":true}}'); setDefaultsText('{}') }}
          className="w-full text-left glass-pill px-3 py-2 text-xs text-yellow-500 hover:text-yellow-400 flex items-center gap-2"
        >
          <Plus size={12} /> novo workflow
        </button>
        {workflows.map((w) => (
          <button
            key={w.slug}
            onClick={() => pick(w)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
              selected.slug === w.slug ? 'bg-yellow-500/10 border border-yellow-500/30 text-neutral-100' : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className="font-medium">{w.name}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{w.slug} · {w.type} {w.enabled ? '' : '· off'}</div>
          </button>
        ))}
      </aside>

      <GlassCard className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="slug" value={selected.slug} onChange={(v) => setSelected({ ...selected, slug: v })} placeholder="capa-sdxl-turbo" />
          <div>
            <label className="text-[10px] label-caps text-neutral-500 block mb-1">type</label>
            <select
              value={selected.type}
              onChange={(e) => setSelected({ ...selected, type: e.target.value as 'capa' | 'arte' })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-200"
            >
              <option value="capa">capa</option>
              <option value="arte">arte</option>
            </select>
          </div>
        </div>
        <Field label="name" value={selected.name} onChange={(v) => setSelected({ ...selected, name: v })} placeholder="Capa · SDXL Turbo" />
        <Field label="description" value={selected.description ?? ''} onChange={(v) => setSelected({ ...selected, description: v })} placeholder="opcional" />

        <JsonField label="comfyJson (ComfyUI API format)" value={comfyText} onChange={setComfyText} rows={14} />
        <JsonField label="paramSchema" value={paramText} onChange={setParamText} rows={8} />
        <JsonField label="defaults" value={defaultsText} onChange={setDefaultsText} rows={4} />

        <label className="flex items-center gap-2 text-xs text-neutral-400">
          <input type="checkbox" checked={selected.enabled} onChange={(e) => setSelected({ ...selected, enabled: e.target.checked })} />
          enabled
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving || !selected.slug || !selected.name}
            className="px-4 py-2 rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-sm font-semibold press-scale glow-accent disabled:opacity-40 flex items-center gap-2"
          >
            <Save size={14} /> {saving ? 'Salvando…' : 'Salvar'}
          </button>
          {selected.slug && (
            <button onClick={remove} className="px-3 py-2 rounded-lg glass-pill text-xs text-red-400 flex items-center gap-2">
              <Trash2 size={12} /> apagar
            </button>
          )}
          {message && <p className="text-[11px] text-neutral-400">{message}</p>}
        </div>
      </GlassCard>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] label-caps text-neutral-500 block mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600"
      />
    </div>
  )
}

function JsonField({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows: number }) {
  const [err, setErr] = useState<string | null>(null)
  const validate = (v: string) => {
    onChange(v)
    try { JSON.parse(v); setErr(null) } catch (e) { setErr(e instanceof Error ? e.message : 'invalid JSON') }
  }
  return (
    <div>
      <label className="text-[10px] label-caps text-neutral-500 block mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => validate(e.target.value)}
        rows={rows}
        spellCheck={false}
        className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 ${err ? 'border-red-500/40' : 'border-white/10'}`}
      />
      {err && <p className="text-[10px] text-red-400 mt-1">{err}</p>}
    </div>
  )
}
