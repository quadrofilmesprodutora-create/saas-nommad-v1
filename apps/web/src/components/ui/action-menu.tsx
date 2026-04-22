import { LucideIcon } from 'lucide-react'

export type Action = {
  id: string
  label: string
  icon?: LucideIcon
  variant?: 'primary' | 'default' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

type Props = {
  actions: Action[]
}

/**
 * Menu de ações estilo tela de batalha Pokemon — grid 2x2, monospace.
 * Máximo 4 ações recomendado (match visual com "Attack/Item/Switch/Run").
 */
export function ActionMenu({ actions }: Props) {
  return (
    <div className="action-grid">
      {actions.map((a) => {
        const Icon = a.icon
        const variantClass =
          a.variant === 'primary' ? 'action-btn-primary' :
          a.variant === 'danger'  ? 'action-btn-danger'  : ''
        return (
          <button
            key={a.id}
            className={`action-btn ${variantClass}`}
            disabled={a.disabled}
            onClick={a.onClick}
          >
            {Icon && <Icon size={13} />}
            {a.label}
          </button>
        )
      })}
    </div>
  )
}
