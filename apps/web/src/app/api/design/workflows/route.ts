import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { designWorkflows } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const Query = z.object({
  type: z.enum(['capa', 'arte']).optional(),
})

const PREVIEW_WORKFLOWS = [
  {
    slug: 'capa-sdxl-turbo',
    type: 'capa',
    name: 'Capa · SDXL Turbo',
    description: 'Capa quadrada 1024×1024 → upscale 4× (3072×3072). Rápido (~20s em 6GB VRAM).',
    paramSchema: {
      prompt: { type: 'string', required: true, label: 'Descrição' },
      style: { type: 'enum', options: ['minimalista', 'cinematografico', 'abstrato', 'retrato'], default: 'cinematografico' },
      seed: { type: 'number', optional: true },
    },
    defaults: { style: 'cinematografico' },
    enabled: true,
  },
  {
    slug: 'arte-sdxl-lightning',
    type: 'arte',
    name: 'Arte · SDXL Lightning',
    description: 'Arte em aspect customizável (story, feed, thumb, banner). 4 steps.',
    paramSchema: {
      prompt: { type: 'string', required: true, label: 'Descrição' },
      aspect: { type: 'enum', options: ['1080x1920', '1080x1350', '1280x720', '2660x1140'], default: '1080x1350' },
      seed: { type: 'number', optional: true },
    },
    defaults: { aspect: '1080x1350' },
    enabled: true,
  },
]

export async function GET(req: NextRequest) {
  try {
    await requireSession()
    const sp = Object.fromEntries(new URL(req.url).searchParams)
    const { type } = Query.parse(sp)

    if (PREVIEW_MODE) {
      const filtered = type ? PREVIEW_WORKFLOWS.filter((w) => w.type === type) : PREVIEW_WORKFLOWS
      return NextResponse.json({ workflows: filtered, _preview: true })
    }

    const db = getDb()
    const rows = await db
      .select({
        slug: designWorkflows.slug,
        type: designWorkflows.type,
        name: designWorkflows.name,
        description: designWorkflows.description,
        paramSchema: designWorkflows.paramSchema,
        defaults: designWorkflows.defaults,
        enabled: designWorkflows.enabled,
      })
      .from(designWorkflows)
      .where(
        type
          ? and(eq(designWorkflows.enabled, true), eq(designWorkflows.type, type))
          : eq(designWorkflows.enabled, true),
      )

    return NextResponse.json({ workflows: rows })
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
