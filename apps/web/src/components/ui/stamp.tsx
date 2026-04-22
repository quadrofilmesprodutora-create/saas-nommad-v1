type Variant = 'active' | 'won' | 'failed' | 'pending' | 'classified'

type Props = {
  children: React.ReactNode
  variant?: Variant
  size?: 'sm' | 'lg'
  className?: string
}

const LABEL: Record<Variant, string> = {
  active:     'ATIVO',
  won:        'VITÓRIA',
  failed:     'FALHOU',
  pending:    'PENDENTE',
  classified: 'CLASSIFICADO',
}

/**
 * Carimbo estilo Papers, Please.
 * Rotação leve + borda dupla + tracking largo.
 */
export function Stamp({ children, variant = 'active', size = 'sm', className = '' }: Props) {
  return (
    <span className={`stamp stamp-${variant} ${size === 'lg' ? 'stamp-big' : ''} ${className}`}>
      {children ?? LABEL[variant]}
    </span>
  )
}
