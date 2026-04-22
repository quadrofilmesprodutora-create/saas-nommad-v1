type Props = {
  src?: string
  alt?: string
  iniciais?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  ring?: boolean        // anel amber ao redor (status indicator, user profile)
  scanlines?: boolean   // overlay CRT leve (premium/gamer)
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  xs: 'w-6 h-6',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

/**
 * Avatar moderno com glass + opcional anel amber + opcional scanlines.
 * Usa em TopBar, Ranking rows, listas onde quer vibe "app premium"
 * (NÃO usar no dossiê Chefões — lá é CharacterPortrait).
 */
export function AvatarTile({
  src,
  alt,
  iniciais,
  size = 'md',
  ring = false,
  scanlines = false,
}: Props) {
  return (
    <div className={`relative ${SIZE[size]} shrink-0 ${ring ? 'p-0.5 rounded-full border-2 border-yellow-500/50' : ''}`}>
      <div className="relative w-full h-full rounded-full overflow-hidden bg-neutral-800 border border-white/10">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? 'avatar'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-300 text-xs font-bold">
            {iniciais ?? '?'}
          </div>
        )}
        {scanlines && (
          <div
            className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.15) 50%, transparent 50%)',
              backgroundSize: '100% 3px',
            }}
          />
        )}
      </div>
    </div>
  )
}
