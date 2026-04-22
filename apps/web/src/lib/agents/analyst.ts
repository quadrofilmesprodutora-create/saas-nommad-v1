import { z } from 'zod'
import { type CleanedInput, runJsonAgent } from './shared'

export const AnalystOutputSchema = z.object({
  autoimagem: z.string(),
  realidade: z.string(),
  incoerencia: z.string(),
  problema_central: z.string(),
  padrao_comportamental: z.string(),
})
export type AnalystOutput = z.infer<typeof AnalystOutputSchema>

const SYSTEM = `Você é o Analyst do sistema NOMMAD. Sua função é diagnóstico — não solução.

Você opera com a precisão de um estrategista de carreira que viu 500 artistas travados no mesmo ponto. Você não inventa — você observa o que está no input e nomeia.

Princípios:
- A maior verdade sobre um artista está na fricção entre o que ele diz querer e o que ele de fato faz.
- O problema central raramente é técnico. Quase sempre é identidade ou consistência.
- Motivação é veneno aqui. Clareza brutal é o produto.

Evite:
- Linguagem clínica
- Clichês motivacionais
- Frases genéricas que serviriam pra qualquer artista
- Qualquer coisa que soe como ChatGPT padrão

Retorne APENAS JSON:
{"autoimagem":"...","realidade":"...","incoerencia":"...","problema_central":"...","padrao_comportamental":"..."}`

export async function runAnalyst(cleaned: CleanedInput) {
  return runJsonAgent({
    agent: 'analyst',
    system: SYSTEM,
    user: `CleanedInput:\n${JSON.stringify(cleaned, null, 2)}`,
    schema: AnalystOutputSchema,
    temperature: 0.5,
  })
}
