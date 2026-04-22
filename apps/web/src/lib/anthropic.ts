import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  // lazy — don't crash at import time in dev/build
  console.warn('[nommad] ANTHROPIC_API_KEY not set')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODELS = {
  cleaner: process.env.ANTHROPIC_MODEL_CLEANER ?? 'claude-haiku-4-5-20251001',
  classifier: process.env.ANTHROPIC_MODEL_CLASSIFIER ?? 'claude-haiku-4-5-20251001',
  analyst: process.env.ANTHROPIC_MODEL_ANALYST ?? 'claude-sonnet-4-6',
  strategist: process.env.ANTHROPIC_MODEL_STRATEGIST ?? 'claude-sonnet-4-6',
  response: process.env.ANTHROPIC_MODEL_RESPONSE ?? 'claude-sonnet-4-6',
  mission: process.env.ANTHROPIC_MODEL_MISSION ?? 'claude-sonnet-4-6',
  checkin: process.env.ANTHROPIC_MODEL_CHECKIN ?? 'claude-sonnet-4-6',
  psycho: process.env.ANTHROPIC_MODEL_PSYCHO ?? 'claude-opus-4-7',
  brain: process.env.ANTHROPIC_MODEL_BRAIN ?? 'claude-opus-4-7',
} as const

export type AgentName = keyof typeof MODELS
