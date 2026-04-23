import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { designJobs } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const Id = z.string().uuid()

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await ctx.params
    Id.parse(id)

    if (PREVIEW_MODE) return NextResponse.json({ job: null, _preview: true })

    const db = getDb()
    const [job] = await db
      .select()
      .from(designJobs)
      .where(and(eq(designJobs.id, id), eq(designJobs.userId, session.user.id)))
      .limit(1)

    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ job })
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
