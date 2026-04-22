'use client'

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react'
import {
  SECTIONS, SECTION_COMPLETE_BONUS_XP, ALL_COMPLETE_BONUS_NP,
  type FieldDef,
} from './config-schema'

/* ============================================================
   TIPOS
   ============================================================ */

export type FieldValue = string | boolean | number

export type ConfigMap = Record<string, FieldValue | undefined>

export type SectionStat = {
  id: string
  filled: number
  total: number
  pct: number
  complete: boolean
}

export type Stats = {
  xp: number
  np: number
  level: number
  xpInLevel: number
  xpToNext: number
  sections: SectionStat[]
  completedCount: number
  globalPct: number
  badges: string[]
  allComplete: boolean
}

export type Reward = {
  xp?: number
  np?: number
  badge?: string
  label?: string
} | null

type ContextType = {
  config: ConfigMap
  setField: (id: string, value: FieldValue) => void
  stats: Stats
  reward: Reward
  hydrated: boolean
  resetAll: () => void
  sectionById: (id: string) => SectionStat | undefined
}

/* ============================================================
   HELPERS
   ============================================================ */

const STORAGE_KEY = 'nmd-gamification-v1'

function isFilled(field: FieldDef, value: FieldValue | undefined): boolean {
  if (value === undefined || value === null) return false
  if (field.type === 'toggle' || field.type === 'oauth') return value === true
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return true
  return false
}

export function computeStats(config: ConfigMap): Stats {
  let xp = 0
  let np = 0
  const badges: string[] = []
  const sections: SectionStat[] = []

  for (const section of SECTIONS) {
    let filled = 0
    for (const f of section.fields) {
      if (isFilled(f, config[f.id])) {
        xp += f.xpReward
        np += f.npReward ?? 0
        filled++
      }
    }
    const total = section.fields.length
    const complete = filled === total
    if (complete) {
      xp += SECTION_COMPLETE_BONUS_XP
      badges.push(`section-${section.id}`)
    }
    sections.push({
      id: section.id,
      filled,
      total,
      pct: total > 0 ? Math.round((filled / total) * 100) : 0,
      complete,
    })
  }

  const completedCount = sections.filter((s) => s.complete).length
  const allComplete = completedCount === SECTIONS.length
  if (allComplete) {
    np += ALL_COMPLETE_BONUS_NP
    badges.push('base-operacional')
  }

  const totalFields = sections.reduce((a, s) => a + s.total, 0)
  const totalFilled = sections.reduce((a, s) => a + s.filled, 0)
  const globalPct = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0

  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100
  const xpToNext = 100

  return {
    xp,
    np,
    level,
    xpInLevel,
    xpToNext,
    sections,
    completedCount,
    globalPct,
    badges,
    allComplete,
  }
}

function diffReward(prev: Stats, next: Stats): Reward {
  const dxp = next.xp - prev.xp
  const dnp = next.np - prev.np
  const newBadge = next.badges.find((b) => !prev.badges.includes(b))
  if (dxp <= 0 && dnp <= 0 && !newBadge) return null
  return {
    xp: dxp > 0 ? dxp : undefined,
    np: dnp > 0 ? dnp : undefined,
    badge: newBadge,
  }
}

function loadConfig(): ConfigMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function saveConfig(config: ConfigMap) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // silently ignore storage errors (quota, private mode)
  }
}

/* ============================================================
   CONTEXT + PROVIDER
   ============================================================ */

const GamificationContext = createContext<ContextType | null>(null)

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigMap>({})
  const [hydrated, setHydrated] = useState(false)
  const [reward, setReward] = useState<Reward>(null)
  const rewardTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // hidratação uma vez, no mount
  useEffect(() => {
    setConfig(loadConfig())
    setHydrated(true)
  }, [])

  // auto-dismiss do toast
  useEffect(() => {
    if (!reward) return
    if (rewardTimer.current) clearTimeout(rewardTimer.current)
    rewardTimer.current = setTimeout(() => setReward(null), 2800)
    return () => {
      if (rewardTimer.current) clearTimeout(rewardTimer.current)
    }
  }, [reward])

  const setField = useCallback((id: string, value: FieldValue) => {
    setConfig((prev) => {
      const next: ConfigMap = { ...prev, [id]: value }
      saveConfig(next)
      const r = diffReward(computeStats(prev), computeStats(next))
      if (r) setReward(r)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    setConfig({})
    setReward(null)
  }, [])

  const stats = useMemo(() => computeStats(config), [config])

  const sectionById = useCallback(
    (id: string) => stats.sections.find((s) => s.id === id),
    [stats]
  )

  const value: ContextType = useMemo(
    () => ({ config, setField, stats, reward, hydrated, resetAll, sectionById }),
    [config, setField, stats, reward, hydrated, resetAll, sectionById]
  )

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification(): ContextType {
  const ctx = useContext(GamificationContext)
  if (!ctx) {
    throw new Error('useGamification must be used inside <GamificationProvider>')
  }
  return ctx
}

export { isFilled }
