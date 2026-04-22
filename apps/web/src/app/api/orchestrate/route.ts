import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runOnboarding } from '@/lib/brain/orchestrator'
import { requireSession } from '@/lib/supabase/server'

const Body = z.object({
  rawText: z.string().min(50, 'Texto muito curto'),
  artistName: z.string().optional(),
  sessionId: z.string().optional(),
})

const PREVIEW_MODE =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
  process.env.ANTHROPIC_API_KEY === 'placeholder' ||
  !process.env.ANTHROPIC_API_KEY

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
      criterio_sucesso:
        'Pelo menos 1 DM de perguntando "como contratar" ou "onde escutar mais" até o fim dos 7 dias.',
    },
    brain: { nivel: 'intermediario', confronto: 3, degraded: true },
    _preview: true,
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession()
    const body = Body.parse(await req.json())

    if (PREVIEW_MODE) {
      return NextResponse.json(previewPipeline(body.rawText))
    }

    const sessionId = body.sessionId ?? crypto.randomUUID()

    const result = await runOnboarding(
      sessionId,
      body.rawText,
      body.artistName,
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
