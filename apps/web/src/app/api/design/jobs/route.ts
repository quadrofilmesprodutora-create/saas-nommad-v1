import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { designJobs } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'

const Query = z.object({
  type: z.enum(['capa', 'arte']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
})

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession()
    const sp = Object.fromEntries(new URL(req.url).searchParams)
    const { type, limit } = Query.parse(sp)

    if (PREVIEW_MODE) return NextResponse.json({ jobs: [] })

    const db = getDb()
    const rows = await db
      .select()
      .from(designJobs)
      .where(
        type
          ? and(eq(designJobs.userId, session.user.id), eq(designJobs.type, type))
          : eq(designJobs.userId, session.user.id),
      )
      .orderBy(desc(designJobs.createdAt))
      .limit(limit)

    return NextResponse.json({ jobs: rows })
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
