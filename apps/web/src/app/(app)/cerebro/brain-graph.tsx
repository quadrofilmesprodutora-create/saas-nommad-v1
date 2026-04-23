'use client'

import { useMemo } from 'react'

type Node = { id: string; label: string; weight: number; kind: 'tese' | 'missao' | 'card' }
type Edge = { source: string; target: string; weight: number }

type Positioned = Node & { x: number; y: number; r: number }

export function BrainGraph({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const width = 800
  const height = 500

  const positioned = useMemo<Positioned[]>(() => {
    // Layout determinístico em círculos concêntricos por peso
    const sorted = [...nodes].sort((a, b) => b.weight - a.weight)
    const cx = width / 2
    const cy = height / 2
    const maxWeight = Math.max(...sorted.map((n) => n.weight), 1)

    return sorted.map((n, i) => {
      const ring = Math.floor(i / 8)
      const inRing = i % 8
      const angleBase = (inRing / 8) * Math.PI * 2 + ring * 0.4
      const radius = 60 + ring * 85
      const x = cx + Math.cos(angleBase) * radius
      const y = cy + Math.sin(angleBase) * radius
      const r = 5 + (n.weight / maxWeight) * 14
      return { ...n, x, y, r }
    })
  }, [nodes])

  const byId = useMemo(() => new Map(positioned.map((n) => [n.id, n])), [positioned])

  const COLOR: Record<Node['kind'], string> = {
    tese: '#EAB308',
    missao: '#22C55E',
    card: '#A3A3A3',
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      style={{ minHeight: 500 }}
    >
      <defs>
        <radialGradient id="nodeGlowReal">
          <stop offset="0%" stopColor="#EAB308" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
        </radialGradient>
      </defs>

      {edges.map((e, i) => {
        const a = byId.get(e.source)
        const b = byId.get(e.target)
        if (!a || !b) return null
        const opacity = Math.min(0.1 + e.weight * 0.12, 0.6)
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#525252"
            strokeOpacity={opacity}
            strokeWidth={Math.min(0.8 + e.weight * 0.3, 2.2)}
          />
        )
      })}

      {positioned.map((n) => (
        <g key={n.id}>
          {n.kind === 'tese' && n.weight > 1 && (
            <circle cx={n.x} cy={n.y} r={n.r * 2.4} fill="url(#nodeGlowReal)" />
          )}
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={COLOR[n.kind]}
            fillOpacity={n.kind === 'tese' ? 0.9 : 0.55}
            stroke={n.kind === 'tese' ? '#FBBF24' : '#262626'}
            strokeWidth={1}
          />
          <text
            x={n.x}
            y={n.y + n.r + 12}
            textAnchor="middle"
            fill="#E5E5E5"
            fontSize={10}
            fontFamily="monospace"
            opacity={n.weight >= 2 ? 0.9 : 0.55}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
