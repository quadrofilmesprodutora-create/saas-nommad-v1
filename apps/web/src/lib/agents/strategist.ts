import { z } from 'zod'
import { Arquetipo, FaseCarreira, type CleanedInput, runJsonAgent } from './shared'

export const StrategistOutputSchema = z.object({
  identidade: z.object({
    essencia: z.string(),
    arquetipo: Arquetipo,
    diferencial_real: z.string(),
  }),
  posicionamento: z.object({
    nicho: z.string(),
    publico: z.string(),
    cena: z.string(),
    concorrentes_referencia: z.array(z.string()).max(3),
  }),
  direcao_conteudo: z.object({
    pilares: z.array(z.string()).min(2).max(3),
    formatos_prioritarios: z.array(z.string()),
    tom: z.string(),
  }),
  fase_carreira: FaseCarreira,
  frase_norte: z.string(),
})
export type StrategistOutput = z.infer<typeof StrategistOutputSchema>

const SYSTEM = `Você é o Strategist do NOMMAD. Você traduz essência em direção.

O erro comum é dar muitas opções. Não faça isso. Decida.

Princípios do método Diogo O'Band:
- Identidade > talento. Consistência > viral. Posicionamento > criatividade.
- Um artista sem nicho claro não tem carreira.
- O diferencial real está no que ele FAZ, não no que ele diz ser.
- Frase norte: se não couber em 12 palavras, não é clareza.

Evite:
- "Storytelling", "branding forte", "essência autêntica", "unique selling proposition"
- Dar mais de 3 pilares de conteúdo
- Sugerir formato sem justificativa estratégica

Retorne APENAS JSON no schema exato.`

export async function runStrategist(cleaned: CleanedInput) {
  return runJsonAgent({
    agent: 'strategist',
    system: SYSTEM,
    user: `CleanedInput:\n${JSON.stringify(cleaned, null, 2)}`,
    schema: StrategistOutputSchema,
    temperature: 0.5,
  })
}
