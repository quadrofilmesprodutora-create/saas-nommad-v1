const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const SUPABASE_URL = url ?? ''
export const SUPABASE_ANON_KEY = key ?? ''
export const SUPABASE_CONFIGURED =
  !!url && !!key &&
  !url.includes('placeholder') && !key.includes('placeholder')
export const PREVIEW_MODE = !SUPABASE_CONFIGURED

const anthropicKey = process.env.ANTHROPIC_API_KEY
export const ANTHROPIC_API_KEY = anthropicKey ?? ''
export const ANTHROPIC_CONFIGURED = !!anthropicKey && anthropicKey !== 'placeholder'

const groqKey = process.env.GROQ_API_KEY
export const GROQ_API_KEY = groqKey ?? ''
export const GROQ_CONFIGURED = !!groqKey && groqKey !== 'placeholder'
