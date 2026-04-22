import { ReactNode } from 'react'

type Props = {
  speaker: string
  children: ReactNode
  variant?: 'default' | 'advisor'
  showContinue?: boolean
  className?: string
}

/**
 * Caixa de diálogo estilo Pokemon — borda dupla, speaker em caps,
 * triângulo "continue" pisca se showContinue=true.
 * variant="advisor" = voz do Diogo (conselheiro), tonalidade verde.
 */
export function DialogueBox({ speaker, children, variant = 'default', showContinue = false, className = '' }: Props) {
  return (
    <div
      className={`dialogue ${variant === 'advisor' ? 'dialogue-advisor' : ''} ${showContinue ? 'dialogue-cont' : ''} ${className}`}
    >
      <span className="dialogue-speaker">{speaker}</span>
      <div>{children}</div>
    </div>
  )
}
