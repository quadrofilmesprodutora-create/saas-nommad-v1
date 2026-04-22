type Props = {
  value: number               // 0-100
  size?: number               // diâmetro em px
  thickness?: number          // espessura do arco
  label?: string              // texto embaixo do número central
  placeholder?: string        // texto do centro quando value<=0 (default "—")
  ticks?: boolean             // mostra marcações 0-100 ao redor
}

/**
 * Gauge radial SVG — anel com progresso amber + trilha neutra.
 * Mostra estrutura (anel, marcações) mesmo com value=0 — evita "círculo oco".
 * Score central com fallback '—' quando value<=0.
 */
export function RadialGauge({
  value,
  size = 152,
  thickness = 8,
  label,
  placeholder = '—',
  ticks = true,
}: Props) {
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value)) / 100
  const dash = circumference * pct
  const gap = circumference - dash

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="radial-gauge-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD04A" />
            <stop offset="60%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#B68806" />
          </linearGradient>
        </defs>

        {/* trilha */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={thickness}
          fill="none"
        />

        {/* marcações (tick marks) — curtas a cada 10% */}
        {ticks && Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 2 * Math.PI
          const inner = r - thickness
          const outer = r - thickness + 4
          const x1 = cx + Math.cos(angle) * inner
          const y1 = cy + Math.sin(angle) * inner
          const x2 = cx + Math.cos(angle) * outer
          const y2 = cy + Math.sin(angle) * outer
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          )
        })}

        {/* progresso */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#radial-gauge-stroke)"
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          style={{
            transition: 'stroke-dasharray 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.4))',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`num-display font-mono ${value > 0 ? 'text-neutral-100' : 'text-neutral-600'}`}
          style={{ fontSize: size * 0.28 }}
        >
          {value > 0 ? Math.round(value) : placeholder}
        </span>
        {label && (
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
