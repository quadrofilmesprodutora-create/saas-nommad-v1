import { z } from 'zod'
import { MissionSchema, runTextAgent } from './shared'

const INPUT = z.object({
  missao_anterior: MissionSchema,
  analise_anterior: z.object({
    problema_central: z.string(),
    padrao_comportamental: z.string(),
  }),
  update_do_artista: z.string(),
  classification_previa: z.object({ nivel: z.string(), confronto: z.number() }),
  historico_recente_resumido: z.string().optional(),
})
type CheckinInput = z.infer<typeof INPUT>

export type CheckinOutput = {
  text: string
  new_mission: z.infer<typeof MissionSchema> | null
}

const SYSTEM = `Você é o Check-in do NOMMAD. Você conversa com um artista que já passou pelo onboarding e recebeu uma missão de 7 dias.

Regras:
- Executou tudo: reconheça sem exagero, suba 1 no confronto, desafie mais. Gere nova missão.
- Executou em parte: nomeie o que ficou e por quê (use o padrão). Mantenha confronto.
- Não executou nada: não repita a missão. Nomeie o padrão. Reduza pra 1 tarefa só. Gere nova missão.
- Travou em algo específico: destrave concretamente. Atualize tarefa se precisar.

Nunca:
- "Tá tudo bem, no seu tempo"
- "Você consegue"
- Longas listas de perguntas

Formato EXATO do output (use as tags):
<chat>
Texto 150-300 palavras. Sem bullets. Sem subtítulos.
</chat>
<new_mission_if_any>
{"missao":"...","tarefas":["..."],"duracao_dias":7,"criterio_sucesso":"..."} ou deixe vazio
</new_mission_if_any>`

export async function runCheckin(input: CheckinInput): Promise<CheckinOutput> {
  const parsed = INPUT.parse(input)
  const user = `Missão anterior: ${JSON.stringify(parsed.missao_anterior)}
Critério: ${parsed.missao_anterior.criterio_sucesso}
Problema central: ${parsed.analise_anterior.problema_central}
Padrão: ${parsed.analise_anterior.padrao_comportamental}
Confronto prévio: ${parsed.classification_previa.confronto}
Histórico: ${parsed.historico_recente_resumido ?? 'N/A'}
Update do artista: ${parsed.update_do_artista}`

  const raw = await runTextAgent({
    agent: 'checkin',
    system: SYSTEM,
    user,
    temperature: 0.7,
    maxTokens: 900,
  })

  const chatMatch = raw.match(/<chat>([\s\S]*?)<\/chat>/)
  const missionMatch = raw.match(/<new_mission_if_any>([\s\S]*?)<\/new_mission_if_any>/)

  const text = chatMatch?.[1]?.trim() ?? raw
  let new_mission: z.infer<typeof MissionSchema> | null = null

  if (missionMatch?.[1]?.trim()) {
    try {
      new_mission = MissionSchema.parse(JSON.parse(missionMatch[1].trim()))
    } catch {
      // nova missão é opcional, ignora parse error
    }
  }

  return { text, new_mission }
}
