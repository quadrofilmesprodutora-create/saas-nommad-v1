'use client'

import { Sparkles, Coins, Award } from 'lucide-react'
import { useGamification } from '@/lib/gamification/store'
import { SECTIONS } from '@/lib/gamification/config-schema'

function badgeLabel(slug: string): string {
  if (slug === 'base-operacional') return 'Base Operacional'
  const sectionId = slug.replace(/^section-/, '')
  const section = SECTIONS.find((s) => s.id === sectionId)
  return section ? `Seção completa: ${section.label}` : slug
}

/**
 * Toast de recompensa — fixed bottom-right.
 * Renderizado DENTRO do GamificationProvider pra ler o mesmo state.
 * Auto-dismiss via efeito do provider (2.8s).
 */
export function RewardToast() {
  const { reward } = useGamification()
  if (!reward) return null

  return (
    <div
      key={`${reward.xp ?? 0}-${reward.np ?? 0}-${reward.badge ?? ''}`}
      className="fixed bottom-6 right-6 z-[100] anim-scale-in pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="glass-card px-5 py-3 flex items-center gap-4 border border-yellow-500/40 glow-accent font-mono">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-yellow-500" />
        </div>

        <div className="flex items-center gap-3">
          {reward.xp ? (
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-500 font-bold">+{reward.xp}</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">XP</span>
            </div>
          ) : null}

          {reward.np ? (
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <Coins size={12} className="text-yellow-500" />
              <span className="text-yellow-500 font-bold">+{reward.np}</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest">NP</span>
            </div>
          ) : null}

          {reward.badge ? (
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <Award size={13} className="text-yellow-500" />
              <span className="text-xs text-yellow-500 font-semibold normal-case">
                {badgeLabel(reward.badge)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
