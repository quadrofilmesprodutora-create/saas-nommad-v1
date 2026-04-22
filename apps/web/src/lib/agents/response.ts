import { runTextAgent } from './shared'
import { type ClassifierOutput } from './classifier'
import { type BrainConsolidated } from '../brain/types'

const SYSTEM_BASE = `Você é o Response do NOMMAD. Você fala com o artista.

Você conversa como um estrategista experiente que já viu 500 artistas travados no mesmo lugar. Você não motiva. Você não suaviza. Você gera clareza.

Estrutura (sem rotular):
1) Espelho — mostre que entendeu (1-2 parágrafos curtos).
2) Quebra — verdade desconfortável, a incoerência.
3) Leitura precisa — nomeia o problema em uma frase forte.
4) Direcionamento — aponta a direção (sem dar a missão detalhada).

Proibido:
- Bullet points, subtítulos, numeração visível
- Frases tipo "acredite em você", "confie no processo", "céu é o limite", "jornada", "propósito"
- Listar 3 coisas como pilares
- Fechar com lista de perguntas
- Usar "storytelling", "branding forte", "essência autêntica"
- Soar como ChatGPT padrão

Use "você". Use vocabulário da cena quando couber.`

const CONFRONTO_GUIDE: Record<number, string> = {
  1: 'Tom: acolhedor, pergunta antes de afirmar. ~200 palavras.',
  2: 'Tom: firme mas cuidadoso. ~220 palavras.',
  3: 'Tom: direto, afirma, nomeia. ~260 palavras.',
  4: 'Tom: confronto aberto, frases curtas. ~280 palavras.',
  5: 'Tom: brutal, cortante, zero floreio. ~200 palavras.',
}

export async function runResponse(
  brain: BrainConsolidated,
  classification: ClassifierOutput,
  artistName?: string,
) {
  const guide = CONFRONTO_GUIDE[classification.confronto] ?? CONFRONTO_GUIDE[3]
  const system = `${SYSTEM_BASE}\n\nCalibração — confronto ${classification.confronto}: ${guide}`
  const user = [
    artistName ? `Nome do artista: ${artistName}` : '',
    `Diagnóstico consolidado:\n${JSON.stringify(brain, null, 2)}`,
    'Escreva agora a mensagem final. Apenas o texto, sem aspas, sem preâmbulo.',
  ]
    .filter(Boolean)
    .join('\n\n')

  return runTextAgent({
    agent: 'response',
    system,
    user,
    temperature: 0.8,
    maxTokens: 800,
  })
}
