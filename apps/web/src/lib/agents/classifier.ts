import { z } from 'zod'
import { Nivel, Confronto, type CleanedInput, runJsonAgent } from './shared'

export const ClassifierOutputSchema = z.object({
  nivel: Nivel,
  confronto: Confronto,
  justificativa_curta: z.string(),
})
export type ClassifierOutput = z.infer<typeof ClassifierOutputSchema>

const SYSTEM = `Você é o Classifier (invisível) do NOMMAD. Você nunca é visto pelo usuário.

Tarefa: ler o CleanedInput e devolver dois valores calibrados para o pipeline.

Mapeamento:
- iniciante → confronto 1-2 (acolhedor)
- intermediario → confronto 3 (direto)
- avancado → confronto 4-5 (confronto alto)

Regras duras:
- Sinais emocionais frágeis (luto, crise, esgotamento): confronto <= 2 independente de nível.
- Identidade clara + execução consistente + resultado → avancado, confronto 4-5.
- Contradições claras entre autoimagem e realidade → +1 no confronto.
- Não tente ser gentil. Calibre.

Retorne APENAS JSON:
{"nivel":"iniciante|intermediario|avancado","confronto":1,"justificativa_curta":"..."}`

export async function runClassifier(cleaned: CleanedInput) {
  return runJsonAgent({
    agent: 'classifier',
    system: SYSTEM,
    user: `CleanedInput:\n${JSON.stringify(cleaned, null, 2)}`,
    schema: ClassifierOutputSchema,
    temperature: 0.2,
  })
}
