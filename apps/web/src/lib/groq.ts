import Groq from 'groq-sdk'

// Um cliente por agente = rate limits completamente independentes
function client(keyEnv: string | undefined) {
  return new Groq({ apiKey: keyEnv ?? '' })
}

export const groqClients = {
  cleaner:    client(process.env.GROQ_KEY_CLEANER),
  analyst:    client(process.env.GROQ_KEY_ANALYST),
  classifier: client(process.env.GROQ_KEY_CLASSIFIER),
  strategist: client(process.env.GROQ_KEY_STRATEGIST),
  brain:      client(process.env.GROQ_KEY_BRAIN),
  response:   client(process.env.GROQ_KEY_RESPONSE),
  mission:    client(process.env.GROQ_KEY_MISSION),
  checkin:    client(process.env.GROQ_KEY_CHECKIN),
  psycho:     client(process.env.GROQ_KEY_CHECKIN), // compartilha key 8 (nunca rodam juntos)
} as const

export const MODELS = {
  cleaner:    'llama-3.1-8b-instant',
  classifier: 'llama-3.1-8b-instant',
  mission:    'llama-3.3-70b-versatile',
  analyst:    'llama-3.3-70b-versatile',
  strategist: 'llama-3.3-70b-versatile',
  response:   'llama-3.3-70b-versatile',
  checkin:    'llama-3.3-70b-versatile',
  psycho:     'llama-3.3-70b-versatile',
  brain:      'llama-3.3-70b-versatile',
} as const

export type AgentName = keyof typeof MODELS

export const GROQ_CONFIGURED = Object.values({
  GROQ_KEY_CLEANER:    process.env.GROQ_KEY_CLEANER,
  GROQ_KEY_ANALYST:    process.env.GROQ_KEY_ANALYST,
  GROQ_KEY_CLASSIFIER: process.env.GROQ_KEY_CLASSIFIER,
  GROQ_KEY_STRATEGIST: process.env.GROQ_KEY_STRATEGIST,
  GROQ_KEY_BRAIN:      process.env.GROQ_KEY_BRAIN,
  GROQ_KEY_RESPONSE:   process.env.GROQ_KEY_RESPONSE,
  GROQ_KEY_MISSION:    process.env.GROQ_KEY_MISSION,
  GROQ_KEY_CHECKIN:    process.env.GROQ_KEY_CHECKIN,
}).every((v) => !!v && v !== 'placeholder')
