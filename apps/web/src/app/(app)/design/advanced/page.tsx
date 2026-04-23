import { redirect } from 'next/navigation'
import { requireSession, getSession } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/design/admin'
import { PageShell, PageHeader } from '@/components/ui'
import { AdvancedEditor } from './AdvancedEditor'

export default async function DesignAdvancedPage() {
  const session = await requireSession().catch(() => null) ?? (await getSession())
  if (!session) redirect('/login')
  if (!isAdminEmail(session.user?.email)) redirect('/design')

  return (
    <PageShell max="xl">
      <PageHeader
        eyebrow="Admin · Design"
        title="Workflows"
        accent="ComfyUI"
        subtitle="Edite os workflows ComfyUI usados por Capas e Artes. Exporte do ComfyUI via Save (API Format)."
      />
      <AdvancedEditor />
    </PageShell>
  )
}
