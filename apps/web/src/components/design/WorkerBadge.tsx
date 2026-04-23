'use client'

import { useEffect, useState } from 'react'
import { Cpu } from 'lucide-react'

type Worker = {
  id: string
  name: string
  status: string
  online: boolean
  vramMb: number | null
  vramFreeMb: number | null
  lastSeenAt: string | null
}

export function WorkerBadge() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const tick = async () => {
      try {
        const res = await fetch('/api/design/workers')
        const data = await res.json()
        if (alive) setWorkers(data.workers ?? [])
      } catch {
        if (alive) setWorkers([])
      } finally {
        if (alive) setLoading(false)
      }
    }
    tick()
    const t = setInterval(tick, 30_000)
    return () => { alive = false; clearInterval(t) }
  }, [])

  const online = workers.find((w) => w.online)
  const label = loading
    ? 'verificando render local…'
    : online
      ? `render local online${online.vramFreeMb ? ` · ${Math.round(online.vramFreeMb / 1024 * 10) / 10}GB livre` : ''}`
      : 'render local offline'
  const dot = loading ? 'bg-neutral-500' : online ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className="inline-flex items-center gap-2 glass-pill px-3 py-1.5 text-[11px] text-neutral-300">
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${online ? 'animate-pulse' : ''}`} />
      <Cpu size={12} className="text-neutral-500" />
      {label}
    </div>
  )
}

export function useWorkerOnline() {
  const [online, setOnline] = useState(false)
  useEffect(() => {
    let alive = true
    const tick = async () => {
      try {
        const res = await fetch('/api/design/workers')
        const data = await res.json()
        if (alive) setOnline(!!(data.workers ?? []).find((w: Worker) => w.online))
      } catch {}
    }
    tick()
    const t = setInterval(tick, 30_000)
    return () => { alive = false; clearInterval(t) }
  }, [])
  return online
}
