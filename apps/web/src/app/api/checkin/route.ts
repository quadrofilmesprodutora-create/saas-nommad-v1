import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runCheckin } from '@/lib/agents/checkin'
import { requireSession } from '@/lib/supabase/server'
import { MissionSchema } from '@/lib/agents/shared'
import { PREVIEW_MODE } from '@/lib/env'
import { GROQ_CONFIGURED } from '@/lib/groq'
import { getDb } from '@/lib/db/client'
import { sessions, missions, missionTasks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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

const CHECKIN_PREVIEW = PREVIEW_MODE || !GROQ_CONFIGURED

async function persistCheckin(
  userId: string,
  sessionId: string,
  result: Awaited<ReturnType<typeof runCheckin>>,
) {
  const db = getDb()

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    kind: 'checkin',
  }).onConflictDoNothing()

  if (result.new_mission) {
    await db.update(missions)
      .set({ status: 'abandoned' })
      .where(and(eq(missions.userId, userId), eq(missions.status, 'active')))

    const missionId = crypto.randomUUID()
    await db.insert(missions).values({
      id: missionId,
      userId,
      sessionId,
      titulo: result.new_mission.missao,
      descricao: result.new_mission.criterio_sucesso,
      duracaoDias: result.new_mission.duracao_dias,
      status: 'active',
    })

    if (result.new_mission.tarefas.length > 0) {
      await db.insert(missionTasks).values(
        result.new_mission.tarefas.map((descricao, i) => ({
          missionId,
          descricao,
          orderIndex: i,
        })),
      )
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = Body.parse(await req.json())

    if (CHECKIN_PREVIEW) {
      return NextResponse.json({
        text: 'Preview mode — configure ANTHROPIC_API_KEY para check-ins reais.',
        new_mission: null,
        _preview: true,
      })
    }

    const result = await runCheckin({
      update_do_artista: body.update,
      missao_anterior: body.missao_anterior,
      analise_anterior: body.analise_anterior,
      classification_previa: body.classification_previa,
      historico_recente_resumido: body.historico_recente_resumido,
    })

    const sessionId = crypto.randomUUID()
    persistCheckin(session.user.id, sessionId, result).catch((err) =>
      console.error('[checkin:persist]', err instanceof Error ? err.message : err),
    )

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
