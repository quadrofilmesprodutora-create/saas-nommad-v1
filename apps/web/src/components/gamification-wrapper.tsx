'use client'

import type { ReactNode } from 'react'
import { GamificationProvider } from '@/lib/gamification/store'
import { RewardToast } from './reward-toast'

/**
 * Wrapper client que envolve o layout (server component) com o provider
 * de gamificação + toast de recompensa.
 */
export function GamificationWrapper({ children }: { children: ReactNode }) {
  return (
    <GamificationProvider>
      {children}
      <RewardToast />
    </GamificationProvider>
  )
}
