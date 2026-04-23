import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { kanbanCards } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const KanbanColuna = z.enum(['ideias', 'em_desenvolvimento', 'agendado', 'publicado', 'arquivado'])
const CardTipo = z.enum(['conteudo', 'musica', 'branding'])

const CreateBody = z.object({
  titulo: z.string().min(1).max(200),
  tipo: CardTipo.default('conteudo'),
  coluna: KanbanColuna.default('ideias'),
})

const UpdateBody = z.object({
  id: z.string().uuid(),
  coluna: KanbanColuna.optional(),
  titulo: z.string().min(1).max(200).optional(),
  resultado: z.enum(['viralizou', 'normal', 'flopou']).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession()
    if (PREVIEW_MODE) return NextResponse.json({ cards: [] })

    const db = getDb()
    const cards = await db
      .select()
      .from(kanbanCards)
      .where(eq(kanbanCards.userId, session.user.id))
      .orderBy(kanbanCards.createdAt)

    return NextResponse.json({ cards })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = CreateBody.parse(await req.json())

    if (PREVIEW_MODE) {
      return NextResponse.json({ id: crypto.randomUUID(), ...body, _preview: true })
    }

    const db = getDb()
    const [card] = await db
      .insert(kanbanCards)
      .values({ userId: session.user.id, ...body })
      .returning()

    return NextResponse.json(card)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = UpdateBody.parse(await req.json())

    if (PREVIEW_MODE) {
      return NextResponse.json({ ok: true, _preview: true })
    }

    const db = getDb()
    const set: Partial<typeof kanbanCards.$inferInsert> = {}
    if (body.coluna) set.coluna = body.coluna
    if (body.titulo) set.titulo = body.titulo
    if (body.resultado) set.resultado = body.resultado
    set.updatedAt = new Date()

    await db
      .update(kanbanCards)
      .set(set)
      .where(and(eq(kanbanCards.id, body.id), eq(kanbanCards.userId, session.user.id)))

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSession()
    const { id } = z.object({ id: z.string().uuid() }).parse(await req.json())

    if (PREVIEW_MODE) return NextResponse.json({ ok: true, _preview: true })

    const db = getDb()
    await db
      .delete(kanbanCards)
      .where(and(eq(kanbanCards.id, id), eq(kanbanCards.userId, session.user.id)))

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
