'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'
import { thumbnailUrl } from '@/lib/placeholders'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// Converte getDay() (0=Dom) para índice Mon-based (0=Seg)
function mondayOffset(date: Date) {
  const d = date.getDay()
  return d === 0 ? 6 : d - 1
}

type CalEvent = { day: number; label: string; variant: 'yellow' | 'neutral' | 'red' }

const EVENTS_MOCK: CalEvent[] = [
  { day: 15, label: 'Reel — hook 1',    variant: 'yellow' },
  { day: 22, label: 'Gig · D-Edge',     variant: 'neutral' },
  { day: 28, label: 'Release EP',       variant: 'red' },
]

const EVENT_THUMBNAIL: Record<string, string> = {
  'Reel — hook 1': 'reel-hook-1',
  'Gig · D-Edge':  'gig-d-edge',
  'Release EP':    'release-ep',
}

export default function CalendarioPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = mondayOffset(firstDay)
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <PageShell max="xl">
      <PageHeader
        eyebrow="Agenda Editorial"
        title="Seu"
        accent="Calendário"
        subtitle="Gigs, lançamentos e publicações — tudo na mesma visão mensal."
        right={
          <div className="flex items-center gap-2">
            <button type="button" onClick={prev} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-neutral-100 press-scale">
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm text-neutral-200 min-w-36 text-center font-mono">
              {MONTH_NAMES[month]} {year}
            </span>
            <button type="button" onClick={next} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-neutral-100 press-scale">
              <ChevronRight size={14} />
            </button>
          </div>
        }
      />

      <GlassCard className="overflow-hidden anim-fade-up">
        <div className="grid grid-cols-7 border-b border-white/5">
          {DAYS.map((d) => (
            <div key={d} className="p-3 label-caps text-center">
              {d}
            </div>
          ))}
        </div>
        <div className={`grid grid-cols-7`} style={{ gridTemplateRows: `repeat(${totalCells / 7}, minmax(5.5rem, 1fr))` }}>
          {Array.from({ length: totalCells }).map((_, i) => {
            const day = i - startOffset + 1
            const valid = day >= 1 && day <= daysInMonth
            const isToday = isCurrentMonth && day === today.getDate()
            const events = valid ? EVENTS_MOCK.filter(e => e.day === day) : []

            return (
              <div
                key={i}
                className={`min-h-[5.5rem] p-2 border-b border-r border-white/5 last:border-r-0 transition-colors
                  ${valid ? 'hover:bg-white/[0.02]' : 'opacity-0 pointer-events-none'}
                  ${isToday ? 'bg-yellow-500/[0.04]' : ''}`}
              >
                {valid && (
                  <>
                    <span className={`text-xs font-mono ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-yellow-500 text-neutral-950 font-bold flex items-center justify-center text-[10px]'
                        : 'text-neutral-500'
                    }`}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-1 mt-1">
                      {events.map((ev) => (
                        <div
                          key={ev.label}
                          className={`text-[10px] rounded px-1.5 py-0.5 flex items-center gap-1.5 truncate ${
                            ev.variant === 'yellow' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                            ev.variant === 'red'    ? 'bg-red-950/40 text-red-400 border border-red-500/30' :
                            'bg-white/5 text-neutral-300 border border-white/5'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbnailUrl(EVENT_THUMBNAIL[ev.label] ?? ev.label, 40, 40)}
                            alt=""
                            className="w-3.5 h-3.5 rounded object-cover shrink-0"
                          />
                          <span className="truncate">{ev.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </GlassCard>

      <p className="text-xs text-neutral-600 mt-4">
        Drag-and-drop do Kanban Editorial cai aqui automaticamente quando uma peça é agendada.
      </p>
    </PageShell>
  )
}
