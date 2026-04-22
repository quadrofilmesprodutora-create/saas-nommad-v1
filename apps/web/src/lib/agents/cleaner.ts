import { z } from 'zod'
import { CleanedInputSchema, runJsonAgent } from './shared'

const INPUT = z.object({ sessionId: z.string(), rawText: z.string() })
type CleanerInput = z.infer<typeof INPUT>

const SYSTEM = `Você é o Cleaner do sistema NOMMAD.

Tarefa: receber uma transcrição livre de um artista e organizá-la em 5 blocos, sem interpretar.

Regras:
- Preserve a voz do artista. Mantenha gírias, tom e expressões específicas.
- Remova repetições, fillers ("tipo", "né"), falsos começos.
- NÃO adicione informação. Se um bloco não foi mencionado, retorne string vazia.
- NÃO interprete sentimento, intenção profunda, ou padrões. Só organize.
- NÃO use jargão de marketing ou psicologia.

Blocos:
1. historia — vida, trajetória, contexto
2. objetivos — o que ele quer (carreira, conquistas concretas)
3. frustracoes — o que trava, o que já tentou e não funcionou
4. referencias — artistas, playlists, cenas, estéticas citadas
5. comportamento — sinais observáveis de hábitos, consistência, relação com público

Retorne APENAS JSON válido:
{"sessionId":"...","historia":"...","objetivos":"...","frustracoes":"...","referencias":"...","comportamento":"..."}`

export async function runCleaner(input: CleanerInput) {
  const { sessionId, rawText } = INPUT.parse(input)
  return runJsonAgent({
    agent: 'cleaner',
    system: SYSTEM,
    user: `sessionId: ${sessionId}\n\nTranscrição:\n${rawText}`,
    schema: CleanedInputSchema,
    temperature: 0.2,
  })
}
