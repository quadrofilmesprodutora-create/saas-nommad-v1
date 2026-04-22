'use client'

import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Check, Eye, EyeOff, Upload, Link2, CheckCircle2,
  RotateCcw, Trophy, Coins, AlertTriangle, type LucideIcon,
} from 'lucide-react'
import {
  PageShell, PageHeader, GlassCard,
} from '@/components/ui'
import { SECTIONS, type FieldDef, type SectionDef } from '@/lib/gamification/config-schema'
import { useGamification, type FieldValue } from '@/lib/gamification/store'

/* ============================================================
   PÁGINA
   ============================================================ */

export default function ConfigPage() {
  const { stats, config, setField, resetAll, hydrated } = useGamification()
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)
  const [confirmReset, setConfirmReset] = useState(false)

  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0]
  const activeIdx = SECTIONS.findIndex((s) => s.id === active.id)
  const activeStats = stats.sections[activeIdx]

  return (
    <PageShell max="xl">
      <PageHeader
        eyebrow="Setup Central"
        title="Sala de"
        accent="Configurações"
        subtitle="Todas as configurações do sistema numa janela só. Cada campo preenchido rende XP. Cada integração conectada rende NP. Complete 8 seções pra desbloquear a Base Operacional."
      />

      {/* Barra global de progresso */}
      <GlassCard floating className="p-5 mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 gap-6 flex-wrap">
          <div>
            <p className="label-caps mb-1">Sistema Operacional</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-100 tabular-nums">
                {hydrated ? stats.globalPct : 0}%
              </span>
              <span className="text-sm text-neutral-500">configurado</span>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <HeaderStat label="Nível"         value={hydrated ? String(stats.level) : '—'} />
            <HeaderStat label="XP"            value={hydrated ? stats.xp.toLocaleString('pt-BR') : '—'} />
            <HeaderStat label="Nomad Points"  value={hydrated ? stats.np.toLocaleString('pt-BR') : '—'} icon={Coins} accent />
            <HeaderStat label="Seções"        value={`${stats.completedCount}/${SECTIONS.length}`} />
            <HeaderStat label="Badges"        value={String(stats.badges.length)} icon={Trophy} />
          </div>
        </div>
        <div className="progress-premium h-2">
          <div
            className="progress-premium-bar transition-[width] duration-700"
            style={{ width: `${hydrated ? stats.globalPct : 0}%` }}
          />
        </div>
        {stats.allComplete && <AllCompleteBadge />}
      </GlassCard>

      {/* Grid: nav sidebar + content */}
      <div className="grid grid-cols-[240px_1fr] gap-4 items-start">
        {/* NAV */}
        <nav className="glass-card p-3 flex flex-col gap-1 sticky top-[calc(var(--topbar-height)+16px)]">
          <p className="label-caps px-3 pt-2 pb-3">Seções</p>
          {SECTIONS.map((s, i) => {
            const st = stats.sections[i]
            return (
              <SectionNavButton
                key={s.id}
                section={s}
                stat={st}
                active={activeId === s.id}
                index={i + 1}
                onClick={() => setActiveId(s.id)}
              />
            )
          })}
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="mt-4 mx-1 flex items-center justify-center gap-2 text-[11px] text-neutral-600 hover:text-red-400 transition-colors py-2 border border-dashed border-white/10 hover:border-red-500/30 rounded-lg press-scale"
            >
              <RotateCcw size={11} /> Resetar configuração
            </button>
          ) : (
            <div className="mt-4 mx-1 p-3 rounded-lg border border-red-500/30 bg-red-500/5">
              <p className="text-[11px] text-red-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle size={11} /> XP e NP voltam a zero.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { resetAll(); setConfirmReset(false) }}
                  className="flex-1 py-1.5 text-[11px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-colors press-scale"
                >
                  Confirmar reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-1.5 text-[11px] rounded bg-white/5 text-neutral-500 hover:text-neutral-300 transition-colors press-scale"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <GlassCard className="p-8">
          <div key={active.id} className="anim-fade-up">
            <div className="flex items-start justify-between mb-6 gap-6">
              <div>
                <p className="label-caps mb-1">
                  Seção {activeIdx + 1} de {SECTIONS.length}
                </p>
                <h2 className="text-2xl font-bold text-neutral-100 mb-2">{active.label}</h2>
                <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">{active.description}</p>
              </div>
              <SectionMiniProgress stat={activeStats} />
            </div>

            <div className="flex flex-col gap-5">
              {active.fields.map((f) => (
                <FieldRenderer
                  key={f.id}
                  field={f}
                  value={config[f.id]}
                  onChange={(v) => setField(f.id, v)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  if (activeIdx > 0) setActiveId(SECTIONS[activeIdx - 1].id)
                }}
                disabled={activeIdx === 0}
                className="glass-pill px-4 py-2 text-sm text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed press-scale flex items-center gap-2"
              >
                <ChevronLeft size={14} /> Anterior
              </button>

              <span className="text-xs text-neutral-600 font-mono">
                {activeIdx + 1} / {SECTIONS.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (activeIdx < SECTIONS.length - 1) setActiveId(SECTIONS[activeIdx + 1].id)
                }}
                disabled={activeIdx === SECTIONS.length - 1}
                className="bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed press-scale flex items-center gap-2 glow-accent"
              >
                Próxima <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageShell>
  )
}

/* ============================================================
   HELPERS DE HEADER
   ============================================================ */

function HeaderStat({
  label, value, icon: Icon, accent = false,
}: { label: string; value: string; icon?: LucideIcon; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="label-caps mb-0.5">{label}</span>
      <div className={`flex items-center gap-1.5 font-mono font-bold tabular-nums ${accent ? 'text-yellow-500' : 'text-neutral-100'}`}>
        {Icon && <Icon size={13} />}
        <span>{value}</span>
      </div>
    </div>
  )
}

function AllCompleteBadge() {
  return (
    <div className="absolute -top-2 -right-2 rotate-6 bg-emerald-500 text-neutral-950 font-mono font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border-2 border-emerald-700 shadow-lg">
      <CheckCircle2 size={10} className="inline mr-1" />
      Base Operacional
    </div>
  )
}

/* ============================================================
   NAV SIDEBAR
   ============================================================ */

function SectionNavButton({
  section, stat, active, index, onClick,
}: {
  section: SectionDef
  stat: { filled: number; total: number; pct: number; complete: boolean }
  active: boolean
  index: number
  onClick: () => void
}) {
  const Icon = section.icon
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 press-scale ${
        active
          ? 'bg-yellow-500/10 text-yellow-500'
          : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.03]'
      }`}
    >
      {active && (
        <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full bg-yellow-500" />
      )}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
        stat.complete ? 'bg-emerald-500/15 text-emerald-400'
        : active ? 'bg-yellow-500/20 text-yellow-500'
        : 'bg-white/5 text-neutral-500'
      }`}>
        {stat.complete ? <Check size={13} /> : <Icon size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{section.label}</div>
        <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-mono mt-0.5">
          <span>{String(index).padStart(2, '0')}</span>
          <span>·</span>
          <span className={stat.complete ? 'text-emerald-400' : ''}>
            {stat.filled}/{stat.total}
          </span>
        </div>
      </div>
      {stat.pct > 0 && !stat.complete && (
        <div className="absolute bottom-0 left-1 right-1 h-[2px] bg-yellow-500/60 rounded-full"
             style={{ width: `calc((100% - 8px) * ${stat.pct / 100})` }} />
      )}
    </button>
  )
}

function SectionMiniProgress({
  stat,
}: { stat: { filled: number; total: number; pct: number; complete: boolean } }) {
  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-yellow-500 text-lg">
          {stat.filled}
        </span>
        <span className="text-neutral-600 font-mono">/</span>
        <span className="font-mono text-neutral-500">{stat.total}</span>
      </div>
      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-[width] duration-500 ${stat.complete ? 'bg-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-yellow-400'}`}
          style={{ width: `${stat.pct}%` }}
        />
      </div>
      {stat.complete && (
        <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">Completa</span>
      )}
    </div>
  )
}

/* ============================================================
   FIELD RENDERER
   ============================================================ */

function FieldRenderer({
  field, value, onChange,
}: {
  field: FieldDef
  value: FieldValue | undefined
  onChange: (v: FieldValue) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-neutral-200">{field.label}</label>
        <span className="text-[10px] font-mono text-yellow-500/70 shrink-0">
          +{field.xpReward} XP{field.npReward ? ` · +${field.npReward} NP` : ''}
        </span>
      </div>
      <FieldInput field={field} value={value} onChange={onChange} />
      {field.help && (
        <p className="text-[11px] text-neutral-500 leading-relaxed">{field.help}</p>
      )}
    </div>
  )
}

function FieldInput({
  field, value, onChange,
}: {
  field: FieldDef
  value: FieldValue | undefined
  onChange: (v: FieldValue) => void
}) {
  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputBaseClass}
        />
      )

    case 'textarea':
      return (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${inputBaseClass} resize-none`}
        />
      )

    case 'password':
      return <PasswordInput field={field} value={value} onChange={onChange} />

    case 'select':
      return (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBaseClass} appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23eab308%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_12px_center]`}
        >
          <option value="" disabled>Selecione...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt} className="bg-neutral-900 text-neutral-200">
              {opt}
            </option>
          ))}
        </select>
      )

    case 'toggle':
      return <Toggle value={value === true} onChange={onChange} label={field.label} />

    case 'oauth':
      return <OAuthButton connected={value === true} field={field} onToggle={onChange} />

    case 'color':
      return <ColorInput value={typeof value === 'string' ? value : ''} onChange={onChange} />

    case 'slider':
      return <Slider field={field} value={typeof value === 'number' ? value : field.min ?? 50} onChange={onChange} />

    case 'file':
      return <FileInput value={typeof value === 'string' ? value : ''} onChange={onChange} />

    default:
      return null
  }
}

const inputBaseClass =
  'w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 focus:bg-black/50 transition-colors font-mono'

/* ------------------ Subcomponents ------------------ */

function PasswordInput({
  field, value, onChange,
}: {
  field: FieldDef
  value: FieldValue | undefined
  onChange: (v: string) => void
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={`${inputBaseClass} pr-11`}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-yellow-500 transition-colors"
        aria-label={visible ? 'Esconder' : 'Mostrar'}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

function Toggle({
  value, onChange, label,
}: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors border ${
        value
          ? 'bg-yellow-500 border-yellow-400 glow-accent'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <span
        aria-hidden
        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
          value ? 'translate-x-6 bg-neutral-950' : 'translate-x-1 bg-neutral-400'
        }`}
      />
    </button>
  )
}

function OAuthButton({
  connected, field, onToggle,
}: {
  connected: boolean
  field: FieldDef
  onToggle: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!connected)}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all press-scale ${
        connected
          ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-300'
          : 'glass-pill text-neutral-200 hover:border-yellow-500/40'
      }`}
    >
      <span className="flex items-center gap-2">
        {connected ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
        {connected ? `${field.label} · conectado` : `Conectar ${field.label}`}
      </span>
      {!connected && (
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">OAuth mock</span>
      )}
      {connected && (
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Desconectar</span>
      )}
    </button>
  )
}

function ColorInput({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const hex = value || '#EAB308'
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-lg border-2 border-white/10 shrink-0"
        style={{ background: hex }}
      />
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-lg"
        aria-label="Escolher cor"
      />
      <input
        type="text"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#EAB308"
        className={`${inputBaseClass} font-mono flex-1`}
      />
    </div>
  )
}

function Slider({
  field, value, onChange,
}: {
  field: FieldDef
  value: number
  onChange: (v: number) => void
}) {
  const min = field.min ?? 0
  const max = field.max ?? 100
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
        <span className="text-neutral-500">{field.minLabel ?? String(min)}</span>
        <span className="text-yellow-500 font-bold">{value}</span>
        <span className="text-neutral-500">{field.maxLabel ?? String(max)}</span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10" />
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={field.label}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-yellow-500 border-2 border-neutral-950 shadow-lg pointer-events-none glow-accent"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function FileInput({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  return (
    <label className={`${inputBaseClass} flex items-center justify-between gap-3 cursor-pointer hover:border-yellow-500/40`}>
      <span className="flex items-center gap-2 truncate">
        {value ? (
          <>
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span className="text-emerald-300 truncate">{value}</span>
          </>
        ) : (
          <>
            <Upload size={14} className="text-yellow-500/70 shrink-0" />
            <span className="text-neutral-500">Escolher arquivo (SVG, PNG, JPG)</span>
          </>
        )}
      </span>
      {value && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onChange('') }}
          className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-red-400 shrink-0"
        >
          Remover
        </button>
      )}
      <input
        type="file"
        accept=".svg,.png,.jpg,.jpeg"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file.name)
        }}
        className="hidden"
      />
    </label>
  )
}
