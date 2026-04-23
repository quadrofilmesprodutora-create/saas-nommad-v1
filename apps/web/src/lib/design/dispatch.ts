import { createHmac, timingSafeEqual } from 'node:crypto'
import { WORKER_SHARED_SECRET } from '@/lib/env'

export type DispatchPayload = {
  job_id: string
  user_id: string
  workflow_slug: string
  type: 'capa' | 'arte'
  params: Record<string, unknown>
}

export function signBody(body: string): string {
  return createHmac('sha256', WORKER_SHARED_SECRET).update(body).digest('hex')
}

export function verifySignature(body: string, sig: string | null | undefined): boolean {
  if (!sig || !WORKER_SHARED_SECRET) return false
  const expected = signBody(body)
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(sig, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function dispatchToWorker(workerUrl: string, payload: DispatchPayload): Promise<void> {
  const body = JSON.stringify(payload)
  const sig = signBody(body)
  const url = workerUrl.replace(/\/$/, '') + '/jobs'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-nommad-sig': sig,
    },
    body,
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`[dispatch] worker returned ${res.status}: ${text.slice(0, 200)}`)
  }
}
