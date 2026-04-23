const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const SUPABASE_URL = url ?? ''
export const SUPABASE_ANON_KEY = key ?? ''
export const SUPABASE_CONFIGURED =
  !!url && !!key &&
  !url.includes('placeholder') && !key.includes('placeholder')
export const PREVIEW_MODE = !SUPABASE_CONFIGURED
