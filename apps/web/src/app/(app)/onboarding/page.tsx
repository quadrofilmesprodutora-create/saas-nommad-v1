'use client'

import { useState } from 'react'
import { AudioRecorder } from '@/components/audio-recorder'
import { GlassCard } from '@/components/ui'
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react'

type Phase = 'record' | 'processing' | 'done'

type Result = {
  response: string
  mission: { missao: string; tarefas: string[]; criterio_sucesso: string }
  brain: { nivel: string; confronto: number; degraded: boolean }
}

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>('record')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [loadingMsg, setLoadingMsg] = useState('Analisando...')

  async function handleTranscript(text: string) {
    setTranscript(text)
    setPhase('processing')

    const msgs = [
      'Limpando e organizando o que você disse...',
      'Analisando sua carreira em profundidade...',
      'Construindo seu perfil artístico...',
      'O cérebro do sistema está consolidando...',
      'Preparando sua primeira missão...',
    ]
    let i = 0
    const id = setInterval(() => { setLoadingMsg(msgs[Math.min(++i, msgs.length - 1)]) }, 3500)

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text }),
      })
      clearInterval(id)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro no pipeline')
      setResult(data)
      setPhase('done')
    } catch (e) {
      clearInterval(id)
      setError((e as Error).message)
      setPhase('record')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {phase === 'record' && (
        <div className="max-w-md w-full flex flex-col items-center gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Fala sobre você
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              Conta tudo: sua história, onde você tá hoje, o que quer conquistar
              e o que tá te travando. De 2 a 5 minutos. Sem roteiro.
            </p>
          </div>

          <AudioRecorder onTranscript={handleTranscript} maxMinutes={5} />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="text-xs text-neutral-600 text-center max-w-xs">
            Não tem 5 minutos agora?{' '}
            <button
              className="underline text-neutral-500 hover:text-neutral-300"
              onClick={() => {
                const txt = prompt('Cole o texto aqui:')
                if (txt && txt.length > 50) handleTranscript(txt)
              }}
            >
              Cole um texto
            </button>{' '}
            em vez disso.
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-800 border border-yellow-500/30 flex items-center justify-center">
            <Loader2 size={32} className="text-yellow-500 animate-spin" />
          </div>
          <div>
            <p className="text-neutral-200 font-medium">{loadingMsg}</p>
            <p className="text-xs text-neutral-500 mt-1">Isso leva ~30 segundos</p>
          </div>
        </div>
      )}

      {phase === 'done' && result && (
        <div className="max-w-2xl w-full flex flex-col gap-6 anim-fade-up">
          {/* header */}
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Seu perfil foi construído</span>
            {result.brain.degraded && (
              <span className="text-xs text-yellow-500 ml-2">(análise parcial)</span>
            )}
          </div>

          {/* response do sistema */}
          <GlassCard className="p-6">
            <p className="label-caps mb-4">Leitura inicial</p>
            <div className="text-neutral-200 leading-relaxed whitespace-pre-wrap text-sm">
              {result.response}
            </div>
          </GlassCard>

          {/* missão */}
          <GlassCard variant="accent" className="p-6">
            <p className="label-caps text-yellow-500/80 mb-1">Missão — 7 dias</p>
            <p className="font-semibold text-neutral-100 mb-4 text-base">{result.mission.missao}</p>
            <ul className="flex flex-col gap-2 mb-4">
              {result.mission.tarefas.map((t, i) => (
                <li key={i} className="flex gap-3 text-sm text-neutral-300">
                  <span className="text-yellow-500 font-mono shrink-0 w-4">{i + 1}.</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-xs text-neutral-500 font-mono">
              Critério: {result.mission.criterio_sucesso}
            </p>
          </GlassCard>

          {/* cta */}
          <div className="flex gap-3">
            <a
              href="/estrategia"
              className="flex-1 py-3 rounded-lg bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 text-sm font-bold text-center hover:brightness-110 transition-all press-scale glow-accent flex items-center justify-center gap-2"
            >
              Ver sistema completo <ArrowRight size={14} />
            </a>
            <a
              href="/kanban"
              className="flex-1 py-3 rounded-lg glass-pill text-neutral-200 text-sm font-medium text-center press-scale flex items-center justify-center"
            >
              Abrir Kanban
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
