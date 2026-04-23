import { z } from 'zod'
import { groqClients, MODELS } from '../groq'
import { Nivel, Confronto } from '../agents/shared'
import { type BrainInput, type BrainConsolidated } from './types'

const BrainOutputSchema = z.object({
  nivel_final: Nivel,
  confronto_final: Confronto,
  resumo_diagnostico: z.string(),
  prioridade_estrategica: z.string(),
  identidade_delta: z.object({
    essencia: z.string().optional(),
    teses_centrais: z.array(z.string()).optional(),
    forca_marca: z.number().optional(),
    dna: z.record(z.string()).optional(),
    posicionamento: z.record(z.string()).optional(),
  }),
  comportamento_delta: z.record(z.unknown()),
  flags: z.object({
    degraded: z.boolean(),
    needs_more_input: z.boolean(),
    needs_human_attention: z.boolean(),
  }),
})

const SYSTEM = `Você é o Brain Central do NOMMAD. Você não responde rápido. Você responde certo.

Você recebe os outputs de 3 agentes analíticos (Analyst, Classifier, Strategist) e os consolida num único plano coerente.

Regras de conflito:
- Se Analyst e Strategist discordam sobre fase → prevalece Analyst (diagnóstico > projeção)
- Se Classifier sugere confronto alto mas Analyst detecta fragilidade → baixa o confronto
- Se memória mostra padrão repetido não resolvido → prioridade_estrategica = quebrar o padrão
- Quando há inconsistência entre análise e estratégia → ajuste a estratégia, não o diagnóstico

Seu output calibra Response e Mission. Seja preciso.

Retorne APENAS JSON no schema exato.`

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const firstBrace = text.search(/[\[{]/)
  if (firstBrace > 0) return text.slice(firstBrace).trim()
  return text.trim()
}

export async function consolidateBrain(input: BrainInput): Promise<BrainConsolidated> {
  const user = `
Analyst:\n${JSON.stringify(input.analysis, null, 2)}

Classifier:\n${JSON.stringify(input.classification, null, 2)}

Strategist:\n${JSON.stringify(input.strategy, null, 2)}

Memória existente:\n${JSON.stringify(input.memory ?? {}, null, 2)}

Kind: ${input.kind}

Consolide e retorne JSON.`

  try {
    const res = await groqClients.brain.chat.completions.create({
      model: MODELS.brain,
      max_tokens: 2048,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: user },
      ],
    })
    const raw = res.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(extractJson(raw))
    return BrainOutputSchema.parse(parsed)
  } catch {
    return {
      nivel_final: input.classification.nivel,
      confronto_final: input.classification.confronto as 1 | 2 | 3 | 4 | 5,
      resumo_diagnostico: input.analysis.problema_central,
      prioridade_estrategica: input.analysis.incoerencia,
      identidade_delta: {
        essencia: input.strategy.identidade.essencia,
        teses_centrais: input.strategy.direcao_conteudo.pilares,
        dna: {
          personalidade: input.strategy.identidade.essencia,
          arquetipo: input.strategy.identidade.arquetipo,
          diferencial: input.strategy.identidade.diferencial_real,
        },
        posicionamento: {
          nicho: input.strategy.posicionamento.nicho,
          publico: input.strategy.posicionamento.publico,
          cena: input.strategy.posicionamento.cena,
        },
      },
      comportamento_delta: {
        padrao_observado: input.analysis.padrao_comportamental,
      },
      flags: { degraded: true, needs_more_input: false, needs_human_attention: false },
    }
  }
}
