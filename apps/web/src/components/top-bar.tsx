'use client'

import { Sparkles, Trophy, Coins } from 'lucide-react'
import { AvatarTile } from '@/components/ui'
import { avatarUrl } from '@/lib/placeholders'
import { useGamification } from '@/lib/gamification/store'

type Props = {
  displayName: string
  handle: string
  avatarSeed: string
}

export function TopBar({ displayName, handle, avatarSeed }: Props) {
  const { stats, hydrated } = useGamification()

  const tierLabel =
    stats.level >= 15 ? 'ARTISTA CONSOLIDADO' :
    stats.level >= 8  ? 'ARTISTA ATIVO' :
    stats.level >= 3  ? 'EM CONSTRUÇÃO' :
                        'PRÉ-LANÇAMENTO'

  const xpPct = hydrated ? (stats.xpInLevel / stats.xpToNext) * 100 : 0

  return (
    <header className="fixed top-4 right-4 h-[var(--topbar-height)] glass-topbar rounded-2xl border border-white/10 z-40 flex items-center justify-between px-6 left-[calc(var(--sidebar-width)+1rem)]">
      <div className="flex items-center gap-8">
        {/* Indicador de Nível */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center glow-amber">
              <span className="text-neutral-950 font-bold text-lg font-mono">
                {hydrated ? stats.level : '—'}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <Sparkles size={10} className="text-yellow-600" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Nível Atual</p>
            <p className="text-xs text-white font-mono">{tierLabel}</p>
          </div>
        </div>

        {/* Barra de Experiência */}
        <div className="flex flex-col gap-1.5 w-64">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Experiência</span>
            <span className="text-[10px] text-yellow-500 font-mono">
              {hydrated ? `${stats.xpInLevel} / ${stats.xpToNext} XP` : '— / — XP'}
            </span>
          </div>
          <div className="progress-premium">
            <div
              className="progress-premium-bar transition-[width] duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Nomad Points */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <Coins size={14} className="text-yellow-500" />
          <span className="text-sm font-mono font-bold text-yellow-500 tabular-nums">
            {hydrated ? stats.np.toLocaleString('pt-BR') : '—'}
          </span>
          <span className="text-[10px] text-neutral-500 uppercase font-bold ml-1">NP</span>
        </div>

        {/* Conquistas */}
        <button type="button" className="p-2 rounded-lg hover:bg-white/5 transition-colors relative group" aria-label="Conquistas">
          <Trophy size={18} className="text-neutral-400 group-hover:text-yellow-500 transition-colors" />
          {stats.badges.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#050507] text-[8px] text-neutral-950 font-bold flex items-center justify-center">
              {stats.badges.length}
            </span>
          )}
        </button>

        {/* Perfil */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right">
            <p className="text-sm font-bold text-white leading-none truncate max-w-32">{displayName}</p>
            {handle && <p className="text-[10px] text-neutral-500 mt-1 truncate max-w-32">@{handle}</p>}
          </div>
          <AvatarTile src={avatarUrl(avatarSeed, 'avataaars')} alt={displayName} ring size="md" />
        </div>
      </div>
    </header>
  )
}
