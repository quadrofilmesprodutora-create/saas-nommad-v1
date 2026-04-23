import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { releases } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

const CreateBody = z.object({
  titulo: z.string().min(1),
  tipo: z.enum(['single', 'ep', 'album']).optional(),
  releaseDate: z.string().datetime().optional(),
  status: z.enum(['planning', 'in_progress', 'released', 'post']).optional(),
  timeline: z.record(z.unknown()).optional(),
})

const PatchBody = z.object({
  id: z.string().uuid(),
  titulo: z.string().optional(),
  tipo: z.enum(['single', 'ep', 'album']).optional(),
  releaseDate: z.string().datetime().nullable().optional(),
  status: z.enum(['planning', 'in_progress', 'released', 'post']).optional(),
  timeline: z.record(z.unknown()).optional(),
})

export async function GET() {
  try {
    const session = await requireSession()
    if (PREVIEW_MODE) {
      return NextResponse.json({
        releases: [
          { id: '1', titulo: 'Máquina de Ansiedade', tipo: 'single', status: 'in_progress' },
          { id: '2', titulo: 'Liminar', tipo: 'ep', status: 'planning' },
        ],
        _preview: true,
      })
    }
    const db = getDb()
    const rows = await db.select().from(releases)
      .where(eq(releases.userId, session.user.id))
      .orderBy(desc(releases.createdAt))
    return NextResponse.json({ releases: rows })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[releases:get]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = CreateBody.parse(await req.json())
    if (PREVIEW_MODE) {
      return NextResponse.json({ release: { id: crypto.randomUUID(), ...body }, _preview: true })
    }
    const db = getDb()
    const [row] = await db.insert(releases).values({
      userId: session.user.id,
      titulo: body.titulo,
      tipo: body.tipo ?? 'single',
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
      status: body.status ?? 'planning',
      timeline: body.timeline ?? null,
    }).returning()
    return NextResponse.json({ release: row })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[releases:post]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = PatchBody.parse(await req.json())
    if (PREVIEW_MODE) return NextResponse.json({ ok: true, _preview: true })
    const db = getDb()
    await db.update(releases).set({
      titulo: body.titulo,
      tipo: body.tipo,
      releaseDate: body.releaseDate === null ? null : body.releaseDate ? new Date(body.releaseDate) : undefined,
      status: body.status,
      timeline: body.timeline,
    }).where(and(eq(releases.id, body.id), eq(releases.userId, session.user.id)))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[releases:patch]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSession()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (PREVIEW_MODE) return NextResponse.json({ ok: true, _preview: true })
    const db = getDb()
    await db.delete(releases).where(and(eq(releases.id, id), eq(releases.userId, session.user.id)))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[releases:delete]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
