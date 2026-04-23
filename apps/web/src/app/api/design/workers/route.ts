import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { designWorkers } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET(_req: NextRequest) {
  try {
    await requireSession()

    if (PREVIEW_MODE) {
      return NextResponse.json({
        workers: [{ id: 'preview', name: 'preview', status: 'online', lastSeenAt: new Date().toISOString(), online: true }],
      })
    }

    const db = getDb()
    const rows = await db
      .select({
        id: designWorkers.id,
        name: designWorkers.name,
        status: designWorkers.status,
        vramMb: designWorkers.vramMb,
        vramFreeMb: designWorkers.vramFreeMb,
        lastSeenAt: designWorkers.lastSeenAt,
      })
      .from(designWorkers)
      .orderBy(desc(designWorkers.lastSeenAt))

    const cutoff = Date.now() - 90_000
    const workers = rows.map((w) => ({
      ...w,
      online: !!w.lastSeenAt && w.lastSeenAt.getTime() > cutoff,
    }))

    return NextResponse.json({ workers })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
