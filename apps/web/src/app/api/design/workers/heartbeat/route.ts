import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { WORKER_CONFIGURED } from '@/lib/env'
import { verifySignature } from '@/lib/design/dispatch'
import { getDb } from '@/lib/db/client'
import { designWorkers } from '@/lib/db/schema'

const Body = z.object({
  worker_id: z.string().min(1),
  name: z.string().min(1).max(80).default('worker'),
  tailnet_url: z.string().url(),
  vram_mb: z.number().int().nonnegative().optional(),
  vram_free_mb: z.number().int().nonnegative().optional(),
  status: z.enum(['online', 'busy']).default('online'),
})

export async function POST(req: NextRequest) {
  try {
    if (!WORKER_CONFIGURED) {
      return NextResponse.json({ error: 'Worker not configured' }, { status: 503 })
    }

    const raw = await req.text()
    const sig = req.headers.get('x-nommad-sig')
    if (!verifySignature(raw, sig)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = Body.parse(JSON.parse(raw))
    const db = getDb()

    await db
      .insert(designWorkers)
      .values({
        id: body.worker_id,
        name: body.name,
        tailnetUrl: body.tailnet_url,
        vramMb: body.vram_mb ?? null,
        vramFreeMb: body.vram_free_mb ?? null,
        status: body.status,
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: designWorkers.id,
        set: {
          name: body.name,
          tailnetUrl: body.tailnet_url,
          vramMb: body.vram_mb ?? null,
          vramFreeMb: body.vram_free_mb ?? null,
          status: body.status,
          lastSeenAt: new Date(),
        },
      })

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[design:heartbeat]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
