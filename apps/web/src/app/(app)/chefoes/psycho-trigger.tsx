'use client'

import { useState } from 'react'
import { Brain, Loader2 } from 'lucide-react'

type PsychoResult = {
  decisao: string
  autossabotagem: string
  validacao: string
  emocional: string
  perfil_crescimento: string
  frase_diagnostica: string
  leitura_para_artista: string
}

export function PsychoTrigger() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PsychoResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function trigger() {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/psycho/analyze', { method: 'POST' })
      if (!res.ok) throw new Error('Análise falhou')
      const data = await res.json()
      setResult(data.profile)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="folder-tab">DIAGNÓSTICO · PSYCHO AGENT</div>
      <div className="paper p-5">
        {!result ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded border-2 border-yellow-500/40 bg-yellow-500/5 flex items-center justify-center shrink-0">
              <Brain size={16} className="text-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="case-number mb-1">ANÁLISE COMPORTAMENTAL</p>
              <p className="doc-title text-base mb-1">Rodar Psycho nos últimos 90 dias</p>
              <p className="text-xs text-neutral-400 font-mono leading-relaxed mb-3">
                Cruza missões, check-ins e posts para identificar padrões de autossabotagem e arquétipo de crescimento.
              </p>
              <button
                onClick={trigger}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-xs font-bold press-scale font-mono uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
                {loading ? 'Analisando...' : 'Rodar diagnóstico'}
              </button>
              {err && <p className="text-xs text-red-400 mt-2 font-mono">{err}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="case-number mb-1">FRASE DIAGNÓSTICA</p>
              <p className="text-base font-semibold text-yellow-500">{result.frase_diagnostica}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Perfil de crescimento" value={result.perfil_crescimento} />
              <Field label="Autossabotagem" value={result.autossabotagem} />
              <Field label="Padrão de decisão" value={result.decisao} />
              <Field label="Busca por validação" value={result.validacao} />
            </div>
            <div>
              <p className="case-number mb-1">LEITURA</p>
              <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">{result.leitura_para_artista}</p>
            </div>
            <button
              onClick={() => { setResult(null); setErr(null) }}
              className="text-xs text-neutral-500 font-mono uppercase tracking-widest hover:text-yellow-500"
            >
              ↻ rodar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="case-number mb-1">{label}</p>
      <p className="text-sm text-neutral-200">{value}</p>
    </div>
  )
}
