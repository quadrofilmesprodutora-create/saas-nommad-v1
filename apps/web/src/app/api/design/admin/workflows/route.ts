import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { isAdminEmail } from '@/lib/design/admin'
import { getDb } from '@/lib/db/client'
import { designWorkflows } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const Upsert = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug: lowercase kebab-case'),
  type: z.enum(['capa', 'arte']),
  name: z.string().min(1).max(120),
  description: z.string().max(400).optional(),
  comfyJson: z.record(z.unknown()),
  paramSchema: z.record(z.unknown()),
  defaults: z.record(z.unknown()).optional(),
  enabled: z.boolean().default(true),
})

async function requireAdmin() {
  const session = await requireSession()
  if (!isAdminEmail(session.user?.email)) throw new Error('Forbidden')
  return session
}

export async function GET() {
  try {
    await requireAdmin()
    if (PREVIEW_MODE) return NextResponse.json({ workflows: [] })
    const db = getDb()
    const rows = await db.select().from(designWorkflows)
    return NextResponse.json({ workflows: rows })
  } catch (err) {
    return errResponse(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = Upsert.parse(await req.json())
    if (PREVIEW_MODE) return NextResponse.json({ ok: true, _preview: true })

    const db = getDb()
    await db
      .insert(designWorkflows)
      .values({
        slug: body.slug,
        type: body.type,
        name: body.name,
        description: body.description ?? null,
        comfyJson: body.comfyJson,
        paramSchema: body.paramSchema,
        defaults: body.defaults ?? {},
        enabled: body.enabled,
      })
      .onConflictDoUpdate({
        target: designWorkflows.slug,
        set: {
          type: body.type,
          name: body.name,
          description: body.description ?? null,
          comfyJson: body.comfyJson,
          paramSchema: body.paramSchema,
          defaults: body.defaults ?? {},
          enabled: body.enabled,
          updatedAt: new Date(),
        },
      })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errResponse(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { slug } = z.object({ slug: z.string().min(1) }).parse(await req.json())
    if (PREVIEW_MODE) return NextResponse.json({ ok: true, _preview: true })
    const db = getDb()
    await db.delete(designWorkflows).where(eq(designWorkflows.slug, slug))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return errResponse(err)
  }
}

function errResponse(err: unknown) {
  if (err instanceof Error && err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (err instanceof Error && err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
  console.error('[design:admin:workflows]', err)
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
