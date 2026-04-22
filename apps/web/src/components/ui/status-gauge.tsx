type Props = {
  label: string
  value: number          // 0-100
  segments?: number      // default 10
  suffix?: string
}

/**
 * HP bar estilo Pokemon — segmentos discretos, cor muda por nível.
 * Valor <=25 = crítico (vermelho), <=50 = baixo (laranja), senão amber.
 */
export function StatusGauge({ label, value, segments = 10, suffix }: Props) {
  const filled = Math.round((value / 100) * segments)
  const level = value <= 25 ? 'crit' : value <= 50 ? 'low' : ''

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="doc-label">{label}</span>
        <span className="doc-value">
          {value}
          {suffix ?? '/100'}
        </span>
      </div>
      <div className="gauge">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`gauge-segment ${i < filled ? `filled ${level}` : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
