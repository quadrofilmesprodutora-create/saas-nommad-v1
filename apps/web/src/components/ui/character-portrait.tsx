type Props = {
  iniciais: string
  nome?: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  tipo?: 'contratante' | 'label' | 'artista' | 'media'
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-32 h-40',
}

const TIPO_TINT: Record<NonNullable<Props['tipo']>, string> = {
  contratante: 'from-orange-900/40 to-orange-950/60',
  label:       'from-violet-900/40 to-violet-950/60',
  artista:     'from-sky-900/40 to-sky-950/60',
  media:       'from-emerald-900/40 to-emerald-950/60',
}

/**
 * Foto de ID do "boss" — estética Papers, Please.
 * Frame preto grosso + outline amber, sepia leve, overlay de sombra radial.
 *
 * - src → puxa placeholder (dicebear/picsum) ou foto real
 * - fallback → iniciais em gradiente escuro tingido por tipo
 *
 * Usado APENAS no módulo Chefões (dossiê). Para avatar moderno glass
 * em outras páginas (TopBar, Ranking), usar AvatarTile.
 */
export function CharacterPortrait({ iniciais, nome, src, size = 'md', tipo = 'contratante' }: Props) {
  return (
    <div className={`portrait-frame ${SIZE[size]} shrink-0`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={nome ?? 'boss'} className="portrait-img" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${TIPO_TINT[tipo]}`}>
          <span
            className="font-mono font-bold text-neutral-300 select-none"
            style={{ fontSize: size === 'lg' ? '2.75rem' : size === 'md' ? '1.75rem' : '1.1rem' }}
          >
            {iniciais}
          </span>
        </div>
      )}
    </div>
  )
}
