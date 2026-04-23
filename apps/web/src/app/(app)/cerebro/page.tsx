import { Network } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'
import { PREVIEW_MODE } from '@/lib/env'
import { requireSession } from '@/lib/supabase/server'
import { getDb } from '@/lib/db/client'
import { kanbanCards, missions, identity } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { BrainGraph } from './brain-graph'

type Node = { id: string; label: string; weight: number; kind: 'tese' | 'missao' | 'card' }
type Edge = { source: string; target: string; weight: number }

const STOPWORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'para', 'pra', 'com', 'no', 'na', 'nos', 'nas', 'em', 'por', 'que', 'se', 'mais', 'sem',
  'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'it', 'is',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 3 && !STOPWORDS.has(t))
}

async function buildGraph(): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (PREVIEW_MODE) {
    return {
      nodes: [
        { id: 'techno', label: 'techno', weight: 4, kind: 'tese' },
        { id: 'cena', label: 'cena br', weight: 3, kind: 'tese' },
        { id: 'warung', label: 'warung', weight: 2, kind: 'missao' },
        { id: 'reel', label: 'reel', weight: 3, kind: 'card' },
        { id: 'identidade', label: 'identidade', weight: 3, kind: 'tese' },
      ],
      edges: [
        { source: 'techno', target: 'cena', weight: 2 },
        { source: 'techno', target: 'warung', weight: 1 },
        { source: 'cena', target: 'identidade', weight: 2 },
        { source: 'reel', target: 'identidade', weight: 1 },
      ],
    }
  }

  try {
    const session = await requireSession()
    const db = getDb()
    const userId = session.user.id

    const [ident] = await db.select().from(identity).where(eq(identity.userId, userId)).limit(1)
    const cards = await db.select().from(kanbanCards)
      .where(eq(kanbanCards.userId, userId))
      .orderBy(desc(kanbanCards.createdAt))
      .limit(50)
    const missList = await db.select().from(missions)
      .where(eq(missions.userId, userId))
      .orderBy(desc(missions.createdAt))
      .limit(20)

    const nodeMap = new Map<string, Node>()
    const edgeCount = new Map<string, number>()

    function addNode(id: string, label: string, kind: Node['kind']) {
      const existing = nodeMap.get(id)
      if (existing) existing.weight += 1
      else nodeMap.set(id, { id, label, weight: 1, kind })
    }

    function addEdge(a: string, b: string) {
      if (a === b) return
      const key = a < b ? `${a}|${b}` : `${b}|${a}`
      edgeCount.set(key, (edgeCount.get(key) ?? 0) + 1)
    }

    // Teses centrais = nós âncora
    const teses = (ident?.tesesCentrais as string[] | null) ?? []
    for (const t of teses) {
      const id = `tese:${t.slice(0, 30).toLowerCase()}`
      addNode(id, t.slice(0, 40), 'tese')
    }

    // Cards: cada título tokenizado gera nós leves
    for (const c of cards) {
      const tokens = tokenize(c.titulo)
      const cardId = `card:${c.id}`
      if (tokens.length > 0) {
        addNode(cardId, c.titulo.slice(0, 32), 'card')
        for (const tk of tokens) {
          const tokenId = `tk:${tk}`
          addNode(tokenId, tk, 'tese')
          addEdge(cardId, tokenId)
        }
      }
    }

    // Missions: cada título conecta aos tokens dele
    for (const m of missList) {
      const tokens = tokenize(m.titulo)
      const mId = `mis:${m.id}`
      if (tokens.length > 0) {
        addNode(mId, m.titulo.slice(0, 32), 'missao')
        for (const tk of tokens) {
          addNode(`tk:${tk}`, tk, 'tese')
          addEdge(mId, `tk:${tk}`)
        }
      }
    }

    const nodes = Array.from(nodeMap.values()).sort((a, b) => b.weight - a.weight).slice(0, 40)
    const allowed = new Set(nodes.map((n) => n.id))
    const edges: Edge[] = []
    for (const [key, weight] of edgeCount.entries()) {
      const [a, b] = key.split('|')
      if (allowed.has(a) && allowed.has(b)) {
        edges.push({ source: a, target: b, weight })
      }
    }

    return { nodes, edges }
  } catch {
    return { nodes: [], edges: [] }
  }
}

export default async function CerebroPage() {
  const graph = await buildGraph()

  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="Sinapses Criativas"
        title="Seu"
        accent="Cérebro"
        subtitle="Grafo de ideias, temas recorrentes e conexões entre conteúdos."
      />

      <GlassCard floating className="min-h-[60vh] relative overflow-hidden anim-fade-up p-4">
        {graph.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center max-w-sm px-6">
              <div className="w-14 h-14 rounded-full glass border border-yellow-500/30 flex items-center justify-center glow-accent">
                <Network size={22} className="text-yellow-500" />
              </div>
              <p className="text-sm text-neutral-200 font-semibold">Grafo em construção</p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                À medida que você cria conteúdos e completa missões, o Cérebro conecta temas, expõe obsessões
                reais e identifica lacunas no seu discurso.
              </p>
            </div>
          </div>
        ) : (
          <BrainGraph nodes={graph.nodes} edges={graph.edges} />
        )}
      </GlassCard>

      {graph.nodes.length > 0 && (
        <p className="text-xs text-neutral-500 mt-4 font-mono max-w-xl">
          Tamanho dos nós = frequência. Cor amarela = tese central / tema recorrente. Arestas = co-ocorrência entre cards e missões.
        </p>
      )}
    </PageShell>
  )
}
