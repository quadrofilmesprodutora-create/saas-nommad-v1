import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  max?: 'md' | 'lg' | 'xl' | 'full'
}

const MAX: Record<NonNullable<Props['max']>, string> = {
  md:   'max-w-4xl',
  lg:   'max-w-5xl',
  xl:   'max-w-6xl',
  full: 'max-w-none',
}

/**
 * Wrapper padrão de páginas: aplica page-enter (fade-in),
 * padding e largura máxima. Usar no topo de cada page.tsx.
 */
export function PageShell({ children, max = 'lg' }: Props) {
  return (
    <div className={`page-enter mesh-bg p-8 ${MAX[max]}`}>
      {children}
    </div>
  )
}
