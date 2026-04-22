import { z } from 'zod'
import { runJsonAgent } from './shared'

const INPUT = z.object({
  identidade: z.record(z.unknown()),
  behavior_snapshot: z.object({
    consistencia_score: z.number().optional(),
    padroes: z.array(z.string()).optional(),
    autossabotagens: z.array(z.string()).optional(),
  }),
  missoes_ultimos_90d: z.array(z.string()),
  checkins_resumidos: z.array(z.string()),
  posts_publicados: z.array(
    z.object({ titulo: z.string(), tipo: z.string(), resultado: z.string() }),
  ),
})
type PsychoInput = z.infer<typeof INPUT>

export const PsychoOutputSchema = z.object({
  decisao: z.string(),
  autossabotagem: z.string(),
  validacao: z.string(),
  emocional: z.string(),
  perfil_crescimento: z.enum(['executor', 'travado', 'inflado', 'sistematico', 'outro']),
  frase_diagnostica: z.string(),
  leitura_para_artista: z.string(),
  needs_human_attention: z.boolean().optional(),
})
export type PsychoOutput = z.infer<typeof PsychoOutputSchema>

const CRISIS_SIGNALS = ['suicid', 'me matar', 'não quero mais viver', 'não aguento mais', 'desistir de tudo', 'depressão']

const SYSTEM = `Você é o Psycho do NOMMAD. Você só roda para usuários Premium.

Você lê o histórico completo de um artista e entrega uma leitura comportamental profunda.

Você não é terapeuta. Você é um estrategista que entende gente melhor do que gente entende a si mesma.

Proibido:
- Linguagem clínica (transtorno, sintomas, patologia)
- Jargão de coaching (mindset, propósito, jornada, limitador)
- Repetir análises anteriores verbatim
- Sugerir ações específicas

Obrigatório:
- Cruzar padrões com RESULTADOS (posts que funcionaram vs não foram feitos; missões completadas vs abandonadas)
- Nomear a autossabotagem de forma específica, não genérica
- Uma frase diagnóstica que o artista lembra meses depois

"leitura_para_artista" deve ser ~500 palavras, humano, direto, em parágrafos.

Se detectar sinais de crise (suicídio, ideação, esgotamento severo): retorne leitura simplificada + needs_human_attention: true.

Retorne APENAS JSON no schema definido.`

export async function runPsycho(input: PsychoInput): Promise<PsychoOutput> {
  const parsed = INPUT.parse(input)

  // Guard: detectar sinais de crise no histórico
  const allText = JSON.stringify(parsed).toLowerCase()
  const hasCrisis = CRISIS_SIGNALS.some((s) => allText.includes(s))

  if (hasCrisis) {
    return {
      decisao: 'Análise pausada por sinal de crise.',
      autossabotagem: 'Análise pausada.',
      validacao: 'Análise pausada.',
      emocional: 'Análise pausada.',
      perfil_crescimento: 'outro',
      frase_diagnostica: 'Primeiro, cuide de você.',
      leitura_para_artista:
        'Percebemos que você pode estar passando por um momento muito difícil. Antes de qualquer estratégia de carreira, o mais importante é o seu bem-estar. Por favor, procure um profissional de saúde mental.',
      needs_human_attention: true,
    }
  }

  return runJsonAgent({
    agent: 'psycho',
    system: SYSTEM,
    user: `Histórico completo:\n${JSON.stringify(parsed, null, 2)}`,
    schema: PsychoOutputSchema,
    temperature: 0.6,
    maxTokens: 3000,
  })
}
