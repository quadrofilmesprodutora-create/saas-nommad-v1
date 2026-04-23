import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runOnboarding, type OnboardingResult } from '@/lib/brain/orchestrator'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE, ANTHROPIC_CONFIGURED } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { sessions, identity, behavior, missions, missionTasks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const Body = z.object({
  rawText: z.string().min(50, 'Texto muito curto'),
  artistName: z.string().optional(),
  sessionId: z.string().optional(),
})

const ORCHESTRATE_PREVIEW = PREVIEW_MODE || !ANTHROPIC_CONFIGURED

function previewPipeline(rawText: string) {
  return {
    response:
      `Escutei sua fala. Dá pra ver que tem ambição real aqui, mas também muita narrativa de "tô travado" ` +
      `que soa mais como proteção do que diagnóstico. Você sabe o que precisa fazer — não é mais conteúdo ` +
      `genérico. É escolher um ângulo, bater nele por 30 dias, e parar de se diluir. O problema não é falta ` +
      `de plano. É falta de foco.\n\nTrecho analisado: "${rawText.slice(0, 140)}${rawText.length > 140 ? '...' : ''}"`,
    mission: {
      missao: 'Ocupar um único território editorial por 7 dias.',
      tarefas: [
        'Escolher UMA frase-âncora que define seu posicionamento e fixar no perfil.',
        'Publicar 3 reels diferentes batendo no mesmo ângulo, sem repetir formato.',
        'Responder por DM todo comentário que chegar — tratar tração como relação, não métrica.',
      ],
      duracao_dias: 7,
      criterio_sucesso:
        'Pelo menos 1 DM perguntando "como contratar" ou "onde escutar mais" até o fim dos 7 dias.',
    },
    brain: { nivel: 'intermediario', confronto: 3, degraded: true },
    _preview: true,
  }
}

async function persistOnboarding(
  userId: string,
  sessionId: string,
  rawText: string,
  result: OnboardingResult,
) {
  const db = getDb()
  const delta = result.identidade_delta

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    kind: 'onboarding',
    inputText: rawText,
  }).onConflictDoNothing()

  await db.insert(identity).values({
    userId,
    essencia: (delta.essencia as string) ?? null,
    tesesCentrais: (delta.teses_centrais as string[]) ?? [],
    tesesSecundarias: [],
    assuntos: [],
    forcaMarca: (delta.forca_marca as number) ?? 0,
    dna: (delta.dna as Record<string, string>) ?? null,
    posicionamento: (delta.posicionamento as Record<string, string>) ?? null,
  }).onConflictDoUpdate({
    target: identity.userId,
    set: {
      essencia: (delta.essencia as string) ?? undefined,
      tesesCentrais: (delta.teses_centrais as string[]) ?? undefined,
      forcaMarca: (delta.forca_marca as number) ?? undefined,
      dna: (delta.dna as Record<string, string>) ?? undefined,
      posicionamento: (delta.posicionamento as Record<string, string>) ?? undefined,
      updatedAt: new Date(),
    },
  })

  await db.insert(behavior).values({
    userId,
    consistenciaScore: result.brain.confronto * 20,
  }).onConflictDoUpdate({
    target: behavior.userId,
    set: { updatedAt: new Date() },
  })

  await db.update(missions)
    .set({ status: 'abandoned' })
    .where(and(eq(missions.userId, userId), eq(missions.status, 'active')))

  const missionId = crypto.randomUUID()
  await db.insert(missions).values({
    id: missionId,
    userId,
    sessionId,
    titulo: result.mission.missao,
    descricao: result.mission.criterio_sucesso,
    duracaoDias: result.mission.duracao_dias,
    status: 'active',
    confrontoNivel: result.brain.confronto,
  })

  if (result.mission.tarefas.length > 0) {
    await db.insert(missionTasks).values(
      result.mission.tarefas.map((descricao, i) => ({
        missionId,
        descricao,
        orderIndex: i,
      })),
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = Body.parse(await req.json())

    if (ORCHESTRATE_PREVIEW) {
      return NextResponse.json(previewPipeline(body.rawText))
    }

    const sessionId = body.sessionId ?? crypto.randomUUID()
    const userId = session.user.id

    const result = await runOnboarding(sessionId, body.rawText, body.artistName)

    persistOnboarding(userId, sessionId, body.rawText, result).catch((err) =>
      console.error('[orchestrate:persist]', err instanceof Error ? err.message : err),
    )

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[orchestrate]', err)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}
