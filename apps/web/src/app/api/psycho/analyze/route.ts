import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { GROQ_CONFIGURED } from '@/lib/groq'
import { getDb } from '@/lib/db/client'
import { identity, behavior, missions, sessions, kanbanCards, psychoProfiles } from '@/lib/db/schema'
import { eq, desc, and, gte } from 'drizzle-orm'
import { runPsycho } from '@/lib/agents/psycho'

const PSYCHO_PREVIEW = PREVIEW_MODE || !GROQ_CONFIGURED

export async function POST() {
  try {
    const session = await requireSession()

    if (PSYCHO_PREVIEW) {
      return NextResponse.json({
        profile: {
          decisao: 'Preview mode.',
          autossabotagem: 'Configure GROQ_API_KEY para análise real.',
          validacao: '',
          emocional: '',
          perfil_crescimento: 'outro',
          frase_diagnostica: 'Análise Psycho desativada em preview.',
          leitura_para_artista:
            'A análise comportamental do Psycho só roda com todas as API keys configuradas.',
        },
        _preview: true,
      })
    }

    const db = getDb()
    const userId = session.user.id

    // Window: últimos 90 dias
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const [idRow] = await db.select().from(identity).where(eq(identity.userId, userId)).limit(1)
    const [behRow] = await db.select().from(behavior).where(eq(behavior.userId, userId)).limit(1)

    const recentMissions = await db.select().from(missions)
      .where(and(eq(missions.userId, userId), gte(missions.createdAt, ninetyDaysAgo)))
      .orderBy(desc(missions.createdAt))
      .limit(20)

    const recentSessions = await db.select().from(sessions)
      .where(and(eq(sessions.userId, userId), gte(sessions.createdAt, ninetyDaysAgo)))
      .orderBy(desc(sessions.createdAt))
      .limit(20)

    const recentCards = await db.select().from(kanbanCards)
      .where(and(eq(kanbanCards.userId, userId), gte(kanbanCards.createdAt, ninetyDaysAgo)))
      .orderBy(desc(kanbanCards.createdAt))
      .limit(30)

    const psychoSessionId = crypto.randomUUID()

    await db.insert(sessions).values({
      id: psychoSessionId,
      userId,
      kind: 'psycho',
    })

    const result = await runPsycho({
      identidade: {
        essencia: idRow?.essencia ?? null,
        teses_centrais: idRow?.tesesCentrais ?? [],
        forca_marca: idRow?.forcaMarca ?? 0,
        dna: idRow?.dna ?? null,
        posicionamento: idRow?.posicionamento ?? null,
      },
      behavior_snapshot: {
        consistencia_score: behRow?.consistenciaScore ?? 0,
        padroes: (behRow?.padroes as string[] | null) ?? [],
        autossabotagens: (behRow?.autossabotagens as string[] | null) ?? [],
      },
      missoes_ultimos_90d: recentMissions.map((m) => `${m.status}: ${m.titulo}`),
      checkins_resumidos: recentSessions
        .filter((s) => s.kind === 'checkin')
        .map((s) => s.inputText ?? 'sem texto'),
      posts_publicados: recentCards
        .filter((c) => c.coluna === 'publicado')
        .map((c) => ({
          titulo: c.titulo,
          tipo: c.tipo,
          resultado: c.resultado ?? 'normal',
        })),
    })

    await db.insert(psychoProfiles).values({
      userId,
      sessionId: psychoSessionId,
      arquetipoCrescimento: result.perfil_crescimento,
      padroesDominantes: [result.decisao, result.validacao].filter(Boolean),
      autossabotagens: [result.autossabotagem],
      alavancas: [],
      riscoAtual: result.emocional,
      proximoPasso: result.leitura_para_artista.slice(0, 300),
      observacaoCritica: result.frase_diagnostica,
    })

    return NextResponse.json({ profile: result })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[psycho:analyze]', err)
    return NextResponse.json({ error: 'Psycho analysis failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await requireSession()
    if (PREVIEW_MODE) {
      return NextResponse.json({ profiles: [], _preview: true })
    }
    const db = getDb()
    const rows = await db.select().from(psychoProfiles)
      .where(eq(psychoProfiles.userId, session.user.id))
      .orderBy(desc(psychoProfiles.createdAt))
      .limit(5)
    return NextResponse.json({ profiles: rows })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[psycho:get]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
