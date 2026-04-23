import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const Body = z.object({
  configJson: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  xp: z.number().int().min(0).optional(),
  np: z.number().int().min(0).optional(),
  badges: z.array(z.string()).optional(),
  name: z.string().optional(),
  artistName: z.string().optional(),
})

export async function GET() {
  try {
    const session = await requireSession()
    if (PREVIEW_MODE) {
      return NextResponse.json({
        configJson: {},
        xp: 0,
        np: 0,
        badges: [],
        _preview: true,
      })
    }
    const db = getDb()
    const [row] = await db.select().from(profiles).where(eq(profiles.id, session.user.id)).limit(1)
    if (!row) {
      return NextResponse.json({ configJson: {}, xp: 0, np: 0, badges: [] })
    }
    return NextResponse.json({
      configJson: row.configJson ?? {},
      xp: row.xp ?? 0,
      np: row.np ?? 0,
      badges: row.badges ?? [],
      name: row.name,
      artistName: row.artistName,
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[profile:get]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = Body.parse(await req.json())

    if (PREVIEW_MODE) {
      return NextResponse.json({ ok: true, _preview: true })
    }

    const db = getDb()
    const userId = session.user.id
    const now = new Date()

    await db.insert(profiles).values({
      id: userId,
      name: body.name ?? session.user.user_metadata?.name ?? '',
      artistName: body.artistName,
      configJson: body.configJson,
      xp: body.xp ?? 0,
      np: body.np ?? 0,
      badges: body.badges ?? [],
      updatedAt: now,
    }).onConflictDoUpdate({
      target: profiles.id,
      set: {
        configJson: body.configJson ?? undefined,
        xp: body.xp ?? undefined,
        np: body.np ?? undefined,
        badges: body.badges ?? undefined,
        name: body.name ?? undefined,
        artistName: body.artistName ?? undefined,
        updatedAt: now,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[profile:patch]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
