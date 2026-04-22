import { GlassCard } from './glass-card'

type Props = {
  label: string
  value: string
  sub?: string
  accent?: boolean
  floating?: boolean   // categoria flutuante + passive float
}

/**
 * KPI compacto. Usado em grids de estatística (Estratégia, Evolução, Marca).
 * Quando `floating`, vira categoria destacada — lift + glow + oscilação passiva.
 */
export function StatCard({ label, value, sub, accent = false, floating = true }: Props) {
  return (
    <GlassCard
      variant={accent ? 'accent' : 'default'}
      floating={floating}
      float={floating}
      className="p-4"
    >
      <p className="label-caps mb-2">{label}</p>
      <p className={`text-xl font-bold ${accent ? 'display-title-accent' : 'text-neutral-100'}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-neutral-500 mt-1">{sub}</p>}
    </GlassCard>
  )
}
