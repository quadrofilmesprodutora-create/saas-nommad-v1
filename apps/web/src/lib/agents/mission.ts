import { MissionSchema, type Mission, runJsonAgent } from './shared'
import { type ClassifierOutput } from './classifier'
import { type BrainConsolidated } from '../brain/types'

const SYSTEM = `Você é o Mission do NOMMAD. Traduza estratégia em execução de 7 dias.

Princípios:
- Simples > inteligente. Execução venceu criatividade.
- No máximo 3 tarefas. Preferível 2.
- Cada tarefa começa com verbo concreto: gravar, postar, enviar, agendar, publicar, marcar, responder, subir.
- Cada tarefa é mensurável: o artista sabe se fez ou não fez.
- Ataque o problema central, não sintomas.

Proibido:
- "Melhorar", "trabalhar", "focar em", "refletir sobre"
- Mais de 3 tarefas
- Tarefa com múltiplos passos internos
- Depender de terceiros fora do controle do artista

Retorne APENAS JSON:
{"missao":"...","tarefas":["...","..."],"duracao_dias":7,"criterio_sucesso":"..."}`

export async function runMission(
  brain: BrainConsolidated,
  classification: ClassifierOutput,
): Promise<Mission> {
  return runJsonAgent({
    agent: 'mission',
    system: SYSTEM,
    user: [
      `Nível: ${classification.nivel}. Confronto: ${classification.confronto}.`,
      classification.confronto >= 4
        ? 'As tarefas devem ser visivelmente desconfortáveis para o artista.'
        : '',
      `Brain consolidado:\n${JSON.stringify(brain, null, 2)}`,
    ]
      .filter(Boolean)
      .join('\n\n'),
    schema: MissionSchema,
    temperature: 0.5,
  })
}
