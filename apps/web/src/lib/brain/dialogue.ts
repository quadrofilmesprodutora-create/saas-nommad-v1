import { z } from 'zod'
import { groqClients, MODELS } from '../groq'
import { StrategistOutputSchema, type StrategistOutput } from '../agents/strategist'
import { type AnalystOutput } from '../agents/analyst'
import { type ClassifierOutput } from '../agents/classifier'
import { getDb } from '../db/client'
import { agentMessages } from '../db/schema'

export type DialogueTurn = {
  turn: number
  fromAgent: string
  toAgent?: string
  kind: 'draft' | 'critique' | 'revise' | 'final'
  content: unknown
}

const CritiqueSchema = z.object({
  contradicoes: z.array(z.string()).max(3),
  aderencia_diagnostico: z.number().min(0).max(10),
  ajustes_sugeridos: z.array(z.string()).max(3),
})
type Critique = z.infer<typeof CritiqueSchema>

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const firstBrace = text.search(/[\[{]/)
  if (firstBrace > 0) return text.slice(firstBrace).trim()
  return text.trim()
}

// ============================================================
// Critique: Analyst reads Strategist output + own diagnosis
// ============================================================

const CRITIQUE_SYSTEM = `Você é o Analyst do NOMMAD fazendo revisão crítica do output do Strategist.

Sua única tarefa é apontar contradições factuais entre o diagnóstico (seu) e a estratégia (dele). Não reescreva o plano, só sinalize onde o Strategist ignorou ou contradisse o diagnóstico.

Regras:
- Máximo 3 contradições, só as concretas (cite frase do Strategist que contradiz a realidade/incoerência que você diagnosticou).
- Se o plano está coerente, retorne contradicoes: [] e aderencia_diagnostico ≥ 8.
- ajustes_sugeridos: o que o Strategist deveria ajustar (frases curtas, imperativas).

Retorne APENAS JSON:
{"contradicoes":["..."],"aderencia_diagnostico":0-10,"ajustes_sugeridos":["..."]}`

async function runCritique(
  analysis: AnalystOutput,
  classification: ClassifierOutput,
  strategy: StrategistOutput,
): Promise<Critique> {
  const user = `Diagnóstico (Analyst):\n${JSON.stringify(analysis, null, 2)}

Classificação:\n${JSON.stringify(classification, null, 2)}

Proposta estratégica (Strategist):\n${JSON.stringify(strategy, null, 2)}

Aponte contradições factuais. Retorne JSON.`

  const res = await groqClients.analyst.chat.completions.create({
    model: MODELS.analyst,
    max_tokens: 1024,
    temperature: 0.3,
    messages: [
      { role: 'system', content: CRITIQUE_SYSTEM },
      { role: 'user', content: user },
    ],
  })
  const raw = res.choices[0]?.message?.content ?? ''
  return CritiqueSchema.parse(JSON.parse(extractJson(raw)))
}

// ============================================================
// Revise: Strategist produces revised output given critique
// ============================================================

const REVISE_SYSTEM = `Você é o Strategist do NOMMAD revisando sua própria proposta após crítica do Analyst.

Mantenha o esqueleto do seu output (identidade, posicionamento, direcao_conteudo, fase_carreira, frase_norte), mas corrija especificamente os pontos que o Analyst apontou como contradição.

Regras:
- Não ignore a crítica — incorpore cada ajuste sugerido.
- Mantenha o schema JSON idêntico ao original.
- Seja mais preciso, não mais genérico.

Retorne APENAS o JSON revisado no schema original.`

async function runRevise(
  original: StrategistOutput,
  critique: Critique,
): Promise<StrategistOutput> {
  const user = `Sua proposta original:\n${JSON.stringify(original, null, 2)}

Crítica do Analyst:\n${JSON.stringify(critique, null, 2)}

Reescreva corrigindo cada ponto apontado. Retorne JSON revisado.`

  const res = await groqClients.strategist.chat.completions.create({
    model: MODELS.strategist,
    max_tokens: 2048,
    temperature: 0.4,
    messages: [
      { role: 'system', content: REVISE_SYSTEM },
      { role: 'user', content: user },
    ],
  })
  const raw = res.choices[0]?.message?.content ?? ''
  return StrategistOutputSchema.parse(JSON.parse(extractJson(raw)))
}

// ============================================================
// Main: orchestrate 1 round of critique + revise
// ============================================================

export type DialogueResult = {
  strategy: StrategistOutput
  turns: DialogueTurn[]
  skipped: boolean
}

async function persistTurns(sessionId: string, turns: DialogueTurn[]) {
  try {
    const db = getDb()
    if (turns.length === 0) return
    await db.insert(agentMessages).values(
      turns.map((t) => ({
        sessionId,
        fromAgent: t.fromAgent,
        toAgent: t.toAgent ?? null,
        turn: t.turn,
        kind: t.kind,
        content: t.content as Record<string, unknown>,
      })),
    )
  } catch (err) {
    console.error('[dialogue:persist]', err instanceof Error ? err.message : err)
  }
}

export async function runDialogue(
  sessionId: string,
  analysis: AnalystOutput,
  classification: ClassifierOutput,
  strategy: StrategistOutput,
): Promise<DialogueResult> {
  const turns: DialogueTurn[] = [
    { turn: 0, fromAgent: 'analyst', kind: 'draft', content: analysis },
    { turn: 0, fromAgent: 'classifier', kind: 'draft', content: classification },
    { turn: 0, fromAgent: 'strategist', kind: 'draft', content: strategy },
  ]

  try {
    const critique = await runCritique(analysis, classification, strategy)
    turns.push({
      turn: 1,
      fromAgent: 'analyst',
      toAgent: 'strategist',
      kind: 'critique',
      content: critique,
    })

    // Se o plano está coerente (nota alta, sem contradições), pula o revise
    if (critique.contradicoes.length === 0 && critique.aderencia_diagnostico >= 8) {
      turns.push({ turn: 2, fromAgent: 'strategist', kind: 'final', content: strategy })
      await persistTurns(sessionId, turns)
      return { strategy, turns, skipped: true }
    }

    const revised = await runRevise(strategy, critique)
    turns.push({ turn: 2, fromAgent: 'strategist', kind: 'revise', content: revised })
    turns.push({ turn: 3, fromAgent: 'strategist', kind: 'final', content: revised })
    await persistTurns(sessionId, turns)
    return { strategy: revised, turns, skipped: false }
  } catch (err) {
    console.error('[dialogue]', err instanceof Error ? err.message : err)
    turns.push({ turn: 99, fromAgent: 'system', kind: 'final', content: { error: 'dialogue_failed', fallback: 'original' } })
    await persistTurns(sessionId, turns)
    return { strategy, turns, skipped: true }
  }
}
