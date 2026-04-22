import { type AnalystOutput } from '../agents/analyst'
import { type ClassifierOutput } from '../agents/classifier'
import { type StrategistOutput } from '../agents/strategist'
import { type Nivel, type Confronto } from '../agents/shared'

export type BrainInput = {
  sessionId: string
  cleaned: { historia: string; objetivos: string; frustracoes: string; referencias: string; comportamento: string }
  analysis: AnalystOutput
  classification: ClassifierOutput
  strategy: StrategistOutput
  memory?: {
    identity?: Record<string, unknown> | null
    behavior?: Record<string, unknown> | null
    recent_summary?: string | null
  }
  kind: 'onboarding' | 'checkin' | 'regen'
}

export type BrainConsolidated = {
  nivel_final: Nivel
  confronto_final: Confronto
  resumo_diagnostico: string
  prioridade_estrategica: string
  identidade_delta: {
    essencia?: string
    teses_centrais?: string[]
    forca_marca?: number
    dna?: Record<string, string>
    posicionamento?: Record<string, string>
  }
  comportamento_delta: Record<string, unknown>
  flags: {
    degraded: boolean
    needs_more_input: boolean
    needs_human_attention: boolean
  }
}
