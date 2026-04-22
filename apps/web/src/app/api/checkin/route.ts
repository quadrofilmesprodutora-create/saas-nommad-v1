import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runCheckin } from '@/lib/agents/checkin'
import { requireSession } from '@/lib/supabase/server'
import { MissionSchema } from '@/lib/agents/shared'

const Body = z.object({
  update: z.string().min(10),
  missao_anterior: MissionSchema,
  analise_anterior: z.object({
    problema_central: z.string(),
    padrao_comportamental: z.string(),
  }),
  classification_previa: z.object({ nivel: z.string(), confronto: z.number() }),
  historico_recente_resumido: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    await requireSession()
    const body = Body.parse(await req.json())

    const result = await runCheckin({
      update_do_artista: body.update,
      missao_anterior: body.missao_anterior,
      analise_anterior: body.analise_anterior,
      classification_previa: body.classification_previa,
      historico_recente_resumido: body.historico_recente_resumido,
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[checkin]', err)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}
