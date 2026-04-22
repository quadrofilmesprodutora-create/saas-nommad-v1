'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'

type State = 'idle' | 'recording' | 'transcribing' | 'done' | 'error'

type Props = {
  onTranscript: (text: string) => void
  maxMinutes?: number
}

export function AudioRecorder({ onTranscript, maxMinutes = 5 }: Props) {
  const [state, setState] = useState<State>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setState('transcribing')
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const form = new FormData()
        form.append('audio', blob)
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: form })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          setState('done')
          onTranscript(data.text)
        } catch (e) {
          setError('Falha na transcrição. Tente novamente.')
          setState('error')
        }
      }

      mr.start(1000)
      setState('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= maxMinutes * 60) {
            stop()
            return s + 1
          }
          return s + 1
        })
      }, 1000)
    } catch {
      setError('Microfone não encontrado ou permissão negada.')
      setState('error')
    }
  }, [maxMinutes, onTranscript])

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRef.current?.stop()
  }, [])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4">
      {state === 'idle' && (
        <button
          onClick={start}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 group-hover:border-yellow-500 group-hover:bg-neutral-700 transition-all flex items-center justify-center">
            <Mic size={36} className="text-neutral-400 group-hover:text-yellow-500 transition-colors" />
          </div>
          <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">
            Toque para gravar
          </span>
        </button>
      )}

      {state === 'recording' && (
        <button onClick={stop} className="flex flex-col items-center gap-3 group">
          <div className="w-24 h-24 rounded-full bg-red-950 border-2 border-red-500 animate-pulse flex items-center justify-center">
            <Square size={28} className="text-red-400" />
          </div>
          <span className="text-sm text-red-400 font-mono">{fmt(elapsed)} / {maxMinutes}:00</span>
          <span className="text-xs text-neutral-500">Toque para parar</span>
        </button>
      )}

      {state === 'transcribing' && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-yellow-500/40 flex items-center justify-center">
            <Loader2 size={32} className="text-yellow-500 animate-spin" />
          </div>
          <span className="text-sm text-neutral-400">Transcrevendo...</span>
        </div>
      )}

      {state === 'done' && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-green-950 border-2 border-green-500 flex items-center justify-center">
            <Mic size={32} className="text-green-400" />
          </div>
          <span className="text-sm text-green-400">Áudio capturado</span>
          <button onClick={() => setState('idle')} className="text-xs text-neutral-500 underline">
            Gravar novamente
          </button>
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => { setState('idle'); setError(null) }}
            className="text-xs text-neutral-500 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
