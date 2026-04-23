import { PageShell, PageHeader } from '@/components/ui'
import { getSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { kanbanCards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { KanbanBoard } from './kanban-board'

const MOCK_CARDS = [
  { id: 'hook-erros-dj',  titulo: 'Hook: 3 erros de DJ brasileiro', tipo: 'conteudo', coluna: 'ideias',           prioridade: 0 },
  { id: 'reel-warung',    titulo: 'Reel: lado B do set no Warung',   tipo: 'conteudo', coluna: 'ideias',           prioridade: 0 },
  { id: 'carr-5-plugins', titulo: 'Carrossel: 5 plugins que mudei',  tipo: 'conteudo', coluna: 'ideias',           prioridade: 0 },
  { id: 'roteiro-contra', titulo: 'Roteiro — hook contra-narrativa',  tipo: 'conteudo', coluna: 'em_desenvolvimento', prioridade: 0 },
  { id: 'reel-hook-central', titulo: 'Reel · hook central — seg 15h', tipo: 'conteudo', coluna: 'agendado',       prioridade: 0 },
]

export default async function KanbanPage() {
  const session = await getSession()
  const userId = session?.user?.id

  const isPreview = PREVIEW_MODE || !userId || userId === '00000000-0000-0000-0000-000000000000'

  let cards: any[] = isPreview ? MOCK_CARDS : []

  if (!isPreview) {
    try {
      const db = getDb()
      cards = await db.select().from(kanbanCards).where(eq(kanbanCards.userId, userId!))
    } catch {
      cards = []
    }
  }

  return (
    <PageShell max="full">
      <PageHeader
        eyebrow="Fluxo Editorial"
        title="Kanban"
        accent="Editorial"
        subtitle="Ideias → Em Desenvolvimento → Agendado → Publicado → Arquivado."
      />
      <KanbanBoard initialCards={cards} isPreview={isPreview} />
    </PageShell>
  )
}
