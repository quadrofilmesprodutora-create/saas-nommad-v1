// Placeholders de imagem — CDN online (dicebear + picsum).
// Zero asset local. Para trocar por assets reais depois, mexe aqui.

type DicebearStyle =
  | 'avataaars'
  | 'bottts'
  | 'initials'
  | 'shapes'
  | 'identicon'
  | 'micah'
  | 'adventurer'

/** Avatar humano/pessoa — reproducible por seed (mesmo seed = mesma imagem). */
export const avatarUrl = (seed: string, style: DicebearStyle = 'avataaars') =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`

type PhotoOpts = { grayscale?: boolean; blur?: number }

/** Foto genérica via picsum.photos — seed estável, dimensões custom. */
export const photoUrl = (seed: string, w: number, h: number, opts?: PhotoOpts) => {
  const q = new URLSearchParams()
  if (opts?.grayscale) q.set('grayscale', '')
  if (opts?.blur) q.set('blur', String(opts.blur))
  const query = q.toString()
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}${query ? '?' + query : ''}`
}

/** Capa quadrada (single/EP) — 1000x1000 padrão. */
export const coverArt = (seed: string, size = 1000) =>
  photoUrl(`cover-${seed}`, size, size)

/** Thumbnail 4/5 (carrossel Instagram, story). */
export const thumbnailUrl = (seed: string, w = 400, h = 500) =>
  photoUrl(`thumb-${seed}`, w, h)

/** Foto de press kit — grayscale (vibe fotos profissionais de estúdio). */
export const pressPhoto = (seed: string, w = 400, h = 500) =>
  photoUrl(`press-${seed}`, w, h, { grayscale: true })
