import { ReactNode, HTMLAttributes } from 'react'

type Variant = 'default' | 'accent' | 'flat'

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant
  hover?: boolean
  floating?: boolean      // categoria flutuante — lift agressivo + glow amber + border gradient
  float?: boolean         // oscilação passiva sutil (anim-float loop)
  children: ReactNode
}

const BASE: Record<Variant, string> = {
  default: 'glass-card',
  accent:  'glass-accent',
  flat:    'glass',
}

/**
 * Superfície padrão (card) com glassmorphism.
 *
 * - variant="default"  — card comum (glass-card)
 * - variant="accent"   — card com borda/glow amber
 * - variant="flat"     — painel translúcido leve
 *
 * - hover              — lift sutil (Apple-like) no hover
 * - floating           — lift mais agressivo + glow amber + border gradient (categoria destacada)
 * - float              — oscilação passiva vertical infinita (2px, 4s)
 *
 * Regra: `floating` substitui a classe base (não herda glass-card), pois já é
 * definida de forma autossuficiente em glass.css.
 */
export function GlassCard({
  variant = 'default',
  hover = false,
  floating = false,
  float = false,
  className = '',
  children,
  ...rest
}: Props) {
  const base = floating ? 'glass-floating' : BASE[variant]
  const hoverClass = hover && !floating ? 'glass-hover' : ''
  const floatClass = float ? 'anim-float' : ''
  return (
    <div
      className={`${base} ${hoverClass} ${floatClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
}
