import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { bossCases } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

const CreateBody = z.object({
  bossId: z.string().min(1),
  status: z.enum(['aberto', 'em_desafio', 'conquistado', 'fechado']).optional(),
  provas: z.array(z.string()).optional(),
  feedback: z.string().optional(),
})

const PatchBody = z.object({
  id: z.string().uuid(),
  status: z.enum(['aberto', 'em_desafio', 'conquistado', 'fechado']).optional(),
  provas: z.array(z.string()).optional(),
  feedback: z.string().optional(),
})

export async function GET() {
  try {
    const session = await requireSession()
    if (PREVIEW_MODE) return NextResponse.json({ cases: [], _preview: true })
    const db = getDb()
    const rows = await db.select().from(bossCases)
      .where(eq(bossCases.userId, session.user.id))
      .orderBy(desc(bossCases.atualizadoEm))
    return NextResponse.json({ cases: rows })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[boss-cases:get]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = CreateBody.parse(await req.json())
    if (PREVIEW_MODE) {
      return NextResponse.json({ case: { id: crypto.randomUUID(), ...body }, _preview: true })
    }
    const db = getDb()
    const [row] = await db.insert(bossCases).values({
      userId: session.user.id,
      bossId: body.bossId,
      status: body.status ?? 'aberto',
      provas: body.provas ?? [],
      feedback: body.feedback ?? null,
    }).returning()
    return NextResponse.json({ case: row })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[boss-cases:post]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = PatchBody.parse(await req.json())
    if (PREVIEW_MODE) return NextResponse.json({ ok: true, _preview: true })
    const db = getDb()
    await db.update(bossCases).set({
      status: body.status,
      provas: body.provas,
      feedback: body.feedback,
      atualizadoEm: new Date(),
    }).where(and(eq(bossCases.id, body.id), eq(bossCases.userId, session.user.id)))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[boss-cases:patch]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
