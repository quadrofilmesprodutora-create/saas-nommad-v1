import { ReactNode } from 'react'

type Props = {
  eyebrow?: string
  title: string
  accent?: string       // palavra/frase destacada em amber
  accentPosition?: 'end' | 'start'
  subtitle?: string
  right?: ReactNode     // ação ou badge no canto direito
}

/**
 * Cabeçalho padrão de página.
 * Ex: <PageHeader title="Gerador de" accent="Conteúdo" />
 *     <PageHeader title="Kanban" accent="Editorial" />
 */
export function PageHeader({ eyebrow, title, accent, accentPosition = 'end', subtitle, right }: Props) {
  return (
    <header className="flex items-start justify-between gap-6 mb-10 stagger-slow">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="display-title">
          {accent && accentPosition === 'start' && (
            <>
              <span className="display-title-accent">{accent}</span>{' '}
            </>
          )}
          {title}
          {accent && accentPosition === 'end' && (
            <>
              {' '}
              <span className="display-title-accent">{accent}</span>
            </>
          )}
        </h1>
        {subtitle && <p className="hero-subtitle mt-3">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  )
}
