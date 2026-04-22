import { z } from 'zod'
import { anthropic, MODELS, type AgentName } from '../anthropic'

// ============================================================
// Enums e tipos compartilhados
// ============================================================

export const Nivel = z.enum(['iniciante', 'intermediario', 'avancado'])
export type Nivel = z.infer<typeof Nivel>

export const Confronto = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
])
export type Confronto = z.infer<typeof Confronto>

export const FaseCarreira = z.enum([
  'pre_lancamento',
  'construcao_base',
  'escalada',
  'consolidacao',
  'reinvencao',
])

export const Arquetipo = z.enum([
  'rebelde', 'criador', 'sabio', 'explorador', 'mago', 'heroi',
  'amante', 'cuidador', 'cara_comum', 'bobo', 'governante', 'inocente',
])

export const KanbanColuna = z.enum([
  'ideias', 'em_desenvolvimento', 'agendado', 'publicado', 'arquivado',
])

// CleanedInput — saída do Cleaner, entrada dos 3 paralelos
export const CleanedInputSchema = z.object({
  sessionId: z.string(),
  historia: z.string(),
  objetivos: z.string(),
  frustracoes: z.string(),
  referencias: z.string(),
  comportamento: z.string(),
})
export type CleanedInput = z.infer<typeof CleanedInputSchema>

export const ArtistIdentitySchema = z.object({
  essencia: z.string(),
  teses_centrais: z.array(z.string()),
  teses_secundarias: z.array(z.string()),
  assuntos: z.array(z.string()),
  forca_marca: z.number().int().min(0).max(100),
  dna: z.object({
    personalidade: z.string(),
    arquetipo: Arquetipo,
    diferencial: z.string(),
  }),
  posicionamento: z.object({
    nicho: z.string(),
    publico: z.string(),
    cena: z.string(),
  }),
})
export type ArtistIdentity = z.infer<typeof ArtistIdentitySchema>

export const MissionSchema = z.object({
  missao: z.string(),
  tarefas: z.array(z.string()),
  duracao_dias: z.number().int(),
  criterio_sucesso: z.string(),
})
export type Mission = z.infer<typeof MissionSchema>

// ============================================================
// Frases proibidas (post-processing guard)
// ============================================================

const BANNED_PHRASES = [
  'acredite em você',
  'acredite em voce',
  'confie no processo',
  'céu é o limite',
  'ceu e o limite',
  'lembre-se de ser autêntico',
  'sua arte é única',
  'você é capaz',
  'seja você mesmo',
  'abrace sua jornada',
  'o universo conspira',
  'unique selling proposition',
  'storytelling autêntico',
  'storytelling autentico',
  'branding forte',
  'essência autêntica',
  'essencia autentica',
  'mindset de vencedor',
  'desbloquear potencial',
  'sair da zona de conforto',
]

export function hasBannedPhrase(text: string): boolean {
  const normalized = text.toLowerCase()
  return BANNED_PHRASES.some((p) => normalized.includes(p))
}

// ============================================================
// Runner genérico — JSON agents
// ============================================================

export type RunJsonOptions<T> = {
  agent: AgentName
  system: string
  user: string
  schema: z.ZodType<T>
  temperature?: number
  maxTokens?: number
  retries?: number
}

export class AgentError extends Error {
  constructor(
    public readonly agent: AgentName,
    public readonly reason: 'api' | 'parse' | 'validate' | 'banned',
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AgentError'
  }
}

function extractJson(text: string): string {
  // remove blocos ```json ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  // remove qualquer prefácio antes da primeira { ou [
  const firstBrace = text.search(/[\[{]/)
  if (firstBrace > 0) return text.slice(firstBrace).trim()
  return text.trim()
}

export async function runJsonAgent<T>({
  agent,
  system,
  user,
  schema,
  temperature = 0.5,
  maxTokens = 2048,
  retries = 1,
}: RunJsonOptions<T>): Promise<T> {
  const model = MODELS[agent]
  let lastError: unknown
  let lastRaw: string | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [
          {
            role: 'user',
            content:
              attempt === 0
                ? user
                : `${user}\n\n[retry] Sua resposta anterior não foi JSON válido: ${truncate(lastRaw)}. Responda APENAS com JSON válido no schema.`,
          },
        ],
      })

      const raw = res.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { text: string }).text)
        .join('\n')
      lastRaw = raw

      const jsonText = extractJson(raw)
      const parsed = JSON.parse(jsonText)
      return schema.parse(parsed)
    } catch (e) {
      lastError = e
      if (attempt === retries) break
    }
  }

  const reason =
    lastError instanceof SyntaxError
      ? 'parse'
      : (lastError as { name?: string })?.name === 'ZodError'
      ? 'validate'
      : 'api'
  throw new AgentError(agent, reason, `Agent ${agent} failed after ${retries + 1} attempts`, lastError)
}

// ============================================================
// Runner genérico — text agents (Response, Check-in)
// ============================================================

export type RunTextOptions = {
  agent: AgentName
  system: string
  user: string
  temperature?: number
  maxTokens?: number
  guardBanned?: boolean
  retries?: number
}

export async function runTextAgent({
  agent,
  system,
  user,
  temperature = 0.8,
  maxTokens = 1024,
  guardBanned = true,
  retries = 1,
}: RunTextOptions): Promise<string> {
  const model = MODELS[agent]
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [
          {
            role: 'user',
            content:
              attempt === 0
                ? user
                : `${user}\n\n[retry] Sua resposta anterior usou linguagem proibida (motivação genérica/coaching). Reescreva sem frases como "acredite em você", "confie no processo", "jornada", etc.`,
          },
        ],
      })

      const text = res.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { text: string }).text)
        .join('\n')
        .trim()

      if (guardBanned && hasBannedPhrase(text)) {
        lastError = new Error('banned phrase')
        if (attempt < retries) continue
        throw new AgentError(agent, 'banned', `Agent ${agent} produced banned phrase`)
      }

      return text
    } catch (e) {
      lastError = e
      if (attempt === retries) break
    }
  }

  throw new AgentError(agent, 'api', `Agent ${agent} text run failed`, lastError)
}

// ============================================================
// Util
// ============================================================

function truncate(s: string | undefined, max = 400): string {
  if (!s) return '<empty>'
  return s.length > max ? s.slice(0, max) + '…' : s
}
