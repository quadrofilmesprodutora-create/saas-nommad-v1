'use client'

import { ReactNode, useState } from 'react'
import { LucideIcon } from 'lucide-react'

export type TabItem = {
  value: string
  label: string
  icon?: LucideIcon
  badge?: string | number
}

type Props = {
  tabs: TabItem[]
  defaultValue?: string
  onChange?: (value: string) => void
  children: (activeValue: string) => ReactNode
  variant?: 'underline' | 'pill'
}

/**
 * Tabs reutilizáveis. Render-prop permite que o consumer
 * decida o conteúdo por value ativo.
 */
export function Tabs({ tabs, defaultValue, onChange, children, variant = 'underline' }: Props) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value)

  const handle = (value: string) => {
    setActive(value)
    onChange?.(value)
  }

  if (variant === 'pill') {
    return (
      <div>
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {tabs.map(({ value, label, icon: Icon, badge }) => {
            const isActive = active === value
            return (
              <button
                key={value}
                onClick={() => handle(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm press-scale
                  transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
                  ${isActive
                    ? 'bg-yellow-500 text-neutral-950 font-semibold glow-accent'
                    : 'glass-pill text-neutral-400 hover:text-neutral-100'
                  }`}
              >
                {Icon && <Icon size={14} />}
                {label}
                {badge !== undefined && (
                  <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-neutral-950/20' : 'bg-white/10'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div key={active} className="anim-fade-up">
          {children(active)}
        </div>
      </div>
    )
  }

  // underline variant (default)
  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
        {tabs.map(({ value, label, icon: Icon, badge }) => {
          const isActive = active === value
          return (
            <button
              key={value}
              onClick={() => handle(value)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px press-scale whitespace-nowrap
                transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
                ${isActive
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
            >
              {Icon && <Icon size={14} />}
              {label}
              {badge !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-neutral-400">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div key={active} className="anim-fade-up">
        {children(active)}
      </div>
    </div>
  )
}
