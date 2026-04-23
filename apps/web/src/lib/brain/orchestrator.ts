import { runCleaner } from '../agents/cleaner'
import { runAnalyst } from '../agents/analyst'
import { runClassifier } from '../agents/classifier'
import { runStrategist } from '../agents/strategist'
import { runResponse } from '../agents/response'
import { runMission } from '../agents/mission'
import { consolidateBrain } from './consolidator'
import { runDialogue } from './dialogue'
import { type Mission } from '../agents/shared'
import { FF_AGENT_DIALOGUE } from '../env'

export type OnboardingResult = {
  response: string
  mission: Mission
  brain: {
    nivel: string
    confronto: number
    resumo: string
    prioridade: string
    degraded: boolean
  }
  identidade_delta: Record<string, unknown>
  sessionId: string
}

export async function runOnboarding(
  sessionId: string,
  rawText: string,
  artistName?: string,
  existingMemory?: {
    identity?: Record<string, unknown> | null
    behavior?: Record<string, unknown> | null
    recent_summary?: string | null
  },
): Promise<OnboardingResult> {
  // Step 1: clean
  const cleaned = await runCleaner({ sessionId, rawText })

  // Step 2: parallel analysis
  const [analysis, classification, strategy] = await Promise.all([
    runAnalyst(cleaned).catch(() => null),
    runClassifier(cleaned).catch(() => ({
      nivel: 'intermediario' as const,
      confronto: 3 as const,
      justificativa_curta: 'fallback',
    })),
    runStrategist(cleaned).catch(() => null),
  ])

  // Degrade gracefully if some fail
  const degraded = !analysis || !strategy

  const effectiveAnalysis = analysis ?? {
    autoimagem: 'Não identificado',
    realidade: 'Não identificado',
    incoerencia: cleaned.frustracoes || 'Não identificado',
    problema_central: cleaned.frustracoes || 'Não identificado',
    padrao_comportamental: cleaned.comportamento || 'Não identificado',
  }

  const effectiveStrategy = strategy ?? {
    identidade: { essencia: cleaned.objetivos, arquetipo: 'criador' as const, diferencial_real: cleaned.historia },
    posicionamento: { nicho: cleaned.referencias, publico: 'A definir', cena: cleaned.referencias, concorrentes_referencia: [] },
    direcao_conteudo: { pilares: [cleaned.objetivos], formatos_prioritarios: ['reels'], tom: 'direto' },
    fase_carreira: 'construcao_base' as const,
    frase_norte: 'Direção a definir.',
  }

  // Step 2.5: agentes dialogam (critique + revise) antes da consolida\u00e7\u00e3o
  let strategyForBrain = effectiveStrategy
  if (FF_AGENT_DIALOGUE && analysis && strategy) {
    try {
      const dialogue = await runDialogue(sessionId, effectiveAnalysis, classification, effectiveStrategy)
      strategyForBrain = dialogue.strategy
    } catch (err) {
      console.error('[orchestrator:dialogue]', err instanceof Error ? err.message : err)
    }
  }

  // Step 3: brain central
  const brain = await consolidateBrain({
    sessionId,
    cleaned,
    analysis: effectiveAnalysis,
    classification,
    strategy: strategyForBrain,
    memory: existingMemory,
    kind: 'onboarding',
  })

  // Step 4: response + mission in parallel
  const [response, mission] = await Promise.all([
    runResponse(brain, classification, artistName),
    runMission(brain, classification),
  ])

  return {
    response,
    mission,
    brain: {
      nivel: brain.nivel_final,
      confronto: brain.confronto_final,
      resumo: brain.resumo_diagnostico,
      prioridade: brain.prioridade_estrategica,
      degraded: brain.flags.degraded || degraded,
    },
    identidade_delta: brain.identidade_delta as Record<string, unknown>,
    sessionId,
  }
}
