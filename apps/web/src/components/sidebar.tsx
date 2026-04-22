'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  Home, Brain, Briefcase, Zap, Calendar, Palette, Kanban,
  Network, Headphones, Rocket, BarChart2, BookOpen, Settings, Swords,
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: string }

const NAV_CORE: NavItem[] = [
  { label: 'Estratégia',    href: '/estrategia',  icon: Home },
  { label: 'Minha Marca',   href: '/marca',       icon: Brain },
  { label: 'Meu Negócio',   href: '/negocio',     icon: Briefcase },
  { label: 'Gerador',       href: '/gerador',     icon: Zap },
  { label: 'Calendário',    href: '/calendario',  icon: Calendar },
  { label: 'Design',        href: '/design',      icon: Palette },
  { label: 'Kanban',        href: '/kanban',      icon: Kanban },
  { label: 'Cérebro',       href: '/cerebro',     icon: Network },
]

const NAV_PREMIUM: NavItem[] = [
  { label: 'Chefões',       href: '/chefoes',     icon: Swords,     badge: '★' },
  { label: 'Sound Design',  href: '/sound',       icon: Headphones, badge: '★' },
  { label: 'Release System',href: '/release',     icon: Rocket,     badge: '★' },
]

const NAV_SYSTEM: NavItem[] = [
  { label: 'Evolução',      href: '/evolucao',    icon: BarChart2 },
  { label: 'Guia de Uso',   href: '/guia',        icon: BookOpen },
  { label: 'Configurações', href: '/config',      icon: Settings },
]

function NavBox({ items, path, label }: { items: NavItem[]; path: string; label?: string }) {
  return (
    <div className="glass-card rounded-2xl p-2 flex flex-col gap-0.5">
      {label && (
        <p className="text-[9px] text-yellow-500/60 uppercase tracking-[0.2em] font-bold px-3 pt-2 pb-1">
          {label}
        </p>
      )}
      {items.map(({ label: itemLabel, href, icon: Icon, badge }) => {
        const active = path === href || (href !== '/' && path.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300
              ${active
                ? 'text-yellow-500 bg-yellow-500/10 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.03]'
              }`}
          >
            <Icon size={18} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-yellow-500' : ''}`} />
            <span className={`truncate font-medium ${active ? 'font-bold' : ''}`}>{itemLabel}</span>
            {badge && (
              <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/20 text-[10px] text-yellow-500 font-bold border border-yellow-500/30">
                {badge}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed top-4 left-4 bottom-4 w-[var(--sidebar-width)] flex flex-col gap-3 z-50 overflow-y-auto">
      {/* Brand */}
      <div className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center glow-amber shrink-0">
          <span className="text-neutral-950 font-black text-xl">N</span>
        </div>
        <div>
          <span className="text-lg font-black tracking-tighter text-white">NOMMAD</span>
          <span className="block text-[9px] text-yellow-500/80 tracking-[0.2em] uppercase font-bold">Artist OS</span>
        </div>
      </div>

      {/* Nav boxes */}
      <NavBox items={NAV_CORE} path={path} />
      <NavBox items={NAV_PREMIUM} path={path} label="Premium" />
      <NavBox items={NAV_SYSTEM} path={path} />

      {/* Config footer */}
      <Link
        href="/config"
        className="glass-card rounded-2xl p-3 mt-auto flex items-center gap-3 hover:bg-white/[0.06] transition-all duration-200 press-scale group"
      >
        <div className="w-7 h-7 rounded-lg bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center transition-colors shrink-0">
          <Settings size={13} className="text-neutral-400 group-hover:text-yellow-500 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white font-bold truncate">Configurações</p>
          <p className="text-[9px] text-neutral-600 truncate">v2.4.0-stable</p>
        </div>
      </Link>
    </aside>
  )
}
