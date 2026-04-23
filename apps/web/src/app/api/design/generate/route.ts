import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { designJobs, designWorkers, designWorkflows } from '@/lib/db/schema'
import { and, eq, gte, desc } from 'drizzle-orm'
import { dispatchToWorker } from '@/lib/design/dispatch'

const Body = z.object({
  workflow_slug: z.string().min(1),
  params: z.record(z.unknown()),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = Body.parse(await req.json())

    if (PREVIEW_MODE) {
      // Preview: devolve job fake "done" com placeholder pra UI funcionar sem Supabase.
      return NextResponse.json({
        job_id: crypto.randomUUID(),
        status: 'done',
        result_url: `https://picsum.photos/seed/${encodeURIComponent(body.workflow_slug)}/1024`,
        _preview: true,
      })
    }

    const db = getDb()
    const userId = session.user.id

    const [workflow] = await db
      .select()
      .from(designWorkflows)
      .where(and(eq(designWorkflows.slug, body.workflow_slug), eq(designWorkflows.enabled, true)))
      .limit(1)

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow não encontrado ou desabilitado' }, { status: 404 })
    }

    // Pega worker mais recente online (last_seen < 90s).
    const cutoff = new Date(Date.now() - 90_000)
    const [worker] = await db
      .select()
      .from(designWorkers)
      .where(and(eq(designWorkers.status, 'online'), gte(designWorkers.lastSeenAt, cutoff)))
      .orderBy(desc(designWorkers.lastSeenAt))
      .limit(1)

    const jobId = crypto.randomUUID()
    await db.insert(designJobs).values({
      id: jobId,
      userId,
      workflowSlug: body.workflow_slug,
      type: workflow.type,
      status: worker ? 'dispatched' : 'queued',
      params: body.params,
      workerId: worker?.id ?? null,
    })

    if (worker) {
      // Fire-and-forget: se o dispatch falhar, worker perde o job mas status fica 'dispatched'.
      // Heartbeat do worker vai re-pegar jobs órfãos (workerId=self.id + status=dispatched) na próxima batida.
      dispatchToWorker(worker.tailnetUrl, {
        job_id: jobId,
        user_id: userId,
        workflow_slug: body.workflow_slug,
        type: workflow.type as 'capa' | 'arte',
        params: body.params,
      }).catch(async (err) => {
        console.error('[design:dispatch]', err instanceof Error ? err.message : err)
        await db
          .update(designJobs)
          .set({ status: 'queued', workerId: null, updatedAt: new Date() })
          .where(eq(designJobs.id, jobId))
          .catch(() => {})
      })
    }

    return NextResponse.json({
      job_id: jobId,
      status: worker ? 'dispatched' : 'queued',
      worker: worker ? { id: worker.id, name: worker.name } : null,
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error('[design:generate]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
