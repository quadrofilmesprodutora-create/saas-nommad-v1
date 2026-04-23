import { Flame, Target, Clock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PageShell, PageHeader, GlassCard, StatCard } from '@/components/ui'
import { getSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { missions, missionTasks, behavior } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

async function getData(userId: string) {
  const db = getDb()
  const [mission] = await db
    .select()
    .from(missions)
    .where(and(eq(missions.userId, userId), eq(missions.status, 'active')))
    .orderBy(desc(missions.createdAt))
    .limit(1)

  const tasks = mission
    ? await db.select().from(missionTasks).where(eq(missionTasks.missionId, mission.id))
    : []

  const [beh] = await db.select().from(behavior).where(eq(behavior.userId, userId)).limit(1)

  return { mission, tasks, beh }
}

function daysLeft(createdAt: Date | null, duracao = 7) {
  if (!createdAt) return '—'
  const diff = Math.ceil((createdAt.getTime() + duracao * 86400000 - Date.now()) / 86400000)
  if (diff <= 0) return 'encerrada'
  return `${diff} dia${diff !== 1 ? 's' : ''} restante${diff !== 1 ? 's' : ''}`
}

export default async function EstrategiaPage() {
  const session = await getSession()
  const userId = session?.user?.id

  const isPreview = PREVIEW_MODE || !userId || userId === '00000000-0000-0000-0000-000000000000'

  let mission: Awaited<ReturnType<typeof getData>>['mission'] = undefined as any
  let tasks: Awaited<ReturnType<typeof getData>>['tasks'] = []
  let beh: Awaited<ReturnType<typeof getData>>['beh'] = undefined as any

  if (!isPreview) {
    try {
      const data = await getData(userId!)
      mission = data.mission
      tasks = data.tasks
      beh = data.beh
    } catch {
      // DB not configured yet — fall through to CTA
    }
  }

  const doneTasks = tasks.filter((t) => t.done).length
  const score = beh?.consistenciaScore ?? null
  const confrontoLabel = score == null ? '—' : score >= 80 ? 'alto' : score >= 40 ? 'médio' : 'baixo'

  const FOCO = [
    { label: 'Streak',         value: beh?.execStreak != null ? `${beh.execStreak}` : '—', sub: 'dias consecutivos' },
    { label: 'Missão',         value: mission ? `${doneTasks} / ${tasks.length}` : '—',    sub: 'tarefas concluídas' },
    { label: 'Próx. check-in', value: 'dom',                                               sub: 'reporte na aba Evolução' },
    { label: 'Confronto',      value: confrontoLabel,                                       sub: 'modo direto' },
  ]

  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="Método Diogo O'Band"
        title="Sua"
        accent="Estratégia"
        subtitle="Seu plano para hoje — missão ativa, tarefas e próximo check-in."
        right={
          <div className="glass-pill flex items-center gap-2 text-xs text-yellow-500 px-3 py-1.5">
            <Flame size={12} /> Foco do dia
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-10 stagger">
        {FOCO.map((f) => (
          <StatCard key={f.label} label={f.label} value={f.value} sub={f.sub} />
        ))}
      </div>

      {mission ? (
        <>
          <p className="label-caps mb-3">Missão ativa</p>
          <GlassCard variant="accent" hover className="flex items-start gap-4 p-5 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-yellow-500/10 text-yellow-500 glow-accent mt-0.5">
              <Target size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-100 mb-1">{mission.titulo}</p>
              {mission.descricao && (
                <p className="text-xs text-neutral-400 leading-relaxed mb-2">{mission.descricao}</p>
              )}
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Clock size={10} /> {daysLeft(mission.createdAt, mission.duracaoDias ?? 7)}
              </span>
            </div>
            <ArrowRight size={14} className="text-neutral-600 shrink-0 mt-1" />
          </GlassCard>

          {tasks.length > 0 && (
            <>
              <p className="label-caps mb-3">Tarefas</p>
              <div className="flex flex-col gap-2 mb-10 stagger">
                {tasks
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                  .map((t) => (
                    <GlassCard
                      key={t.id}
                      hover
                      className={`flex items-center gap-4 p-4 ${t.done ? 'opacity-50' : ''}`}
                    >
                      <CheckCircle2
                        size={16}
                        className={t.done ? 'text-yellow-500 shrink-0' : 'text-neutral-600 shrink-0'}
                      />
                      <p className={`text-sm flex-1 ${t.done ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                        {t.descricao}
                      </p>
                    </GlassCard>
                  ))}
              </div>
            </>
          )}
        </>
      ) : (
        <GlassCard floating className="p-6 anim-fade-up">
          <p className="label-caps mb-2">Leitura do sistema</p>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {isPreview
              ? 'Em modo preview. Configure as env vars do Supabase e Anthropic para ativar o sistema completo.'
              : 'Complete o onboarding por áudio para gerar sua missão real. O sistema vai puxar missão ativa, tarefas e confronto calibrado.'}
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 mt-4 text-xs text-yellow-500 hover:text-yellow-400 press-scale"
          >
            Fazer onboarding agora <ArrowRight size={12} />
          </a>
        </GlassCard>
      )}
    </PageShell>
  )
}
