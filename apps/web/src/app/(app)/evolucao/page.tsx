import { TrendingUp, CheckCircle2, Flame, Activity, ArrowRight } from 'lucide-react'
import { PageShell, PageHeader, GlassCard } from '@/components/ui'
import { getSession } from '@/lib/supabase/server'
import { PREVIEW_MODE } from '@/lib/env'
import { getDb } from '@/lib/db/client'
import { sessions, missions, behavior } from '@/lib/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'

async function getData(userId: string) {
  const db = getDb()

  const [beh] = await db.select().from(behavior).where(eq(behavior.userId, userId)).limit(1)

  const [{ value: publishedCount }] = await db
    .select({ value: count() })
    .from(missions)
    .where(and(eq(missions.userId, userId), eq(missions.status, 'completed')))

  const recentSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.createdAt))
    .limit(20)

  return { beh, publishedCount: Number(publishedCount), recentSessions }
}

export default async function EvolucaoPage() {
  const session = await getSession()
  const userId = session?.user?.id

  const isPreview = PREVIEW_MODE || !userId || userId === '00000000-0000-0000-0000-000000000000'

  let beh: any = null
  let publishedCount = 0
  let recentSessions: any[] = []

  if (!isPreview) {
    try {
      const data = await getData(userId!)
      beh = data.beh
      publishedCount = data.publishedCount
      recentSessions = data.recentSessions
    } catch {
      // DB not configured yet
    }
  }

  const KPIS = [
    { label: 'Publicados',         value: publishedCount > 0 ? String(publishedCount) : '—', icon: CheckCircle2 },
    { label: 'Missões concluídas', value: publishedCount > 0 ? String(publishedCount) : '—', icon: Flame },
    { label: 'Streak',             value: beh?.execStreak != null ? `${beh.execStreak} dias` : '— dias', icon: Activity },
    { label: 'Score de marca',     value: beh?.consistenciaScore != null ? String(beh.consistenciaScore) : '—', icon: TrendingUp },
  ]

  const checkins = recentSessions.filter((s) => s.kind === 'checkin')
  const onboardings = recentSessions.filter((s) => s.kind === 'onboarding')

  return (
    <PageShell max="lg">
      <PageHeader
        eyebrow="Seu Histórico"
        title="Sua"
        accent="Evolução"
        subtitle="Métricas de execução, streak e histórico de check-ins semanais."
      />

      <div className="grid grid-cols-4 gap-3 mb-8 stagger">
        {KPIS.map(({ label, value, icon: Icon }) => (
          <GlassCard key={label} floating float className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="label-caps">{label}</span>
              <Icon size={14} className="text-neutral-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-200">{value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 stagger">
        <GlassCard floating className="p-6">
          <p className="label-caps mb-4">Sessões recentes</p>
          {recentSessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentSessions.slice(0, 8).map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    s.kind === 'onboarding' ? 'bg-yellow-500' :
                    s.kind === 'checkin' ? 'bg-emerald-500' : 'bg-neutral-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-300 capitalize">{s.kind}</p>
                    <p className="text-[10px] text-neutral-600">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-neutral-600 py-8">
              {isPreview ? 'Em modo preview.' : 'Sem sessões ainda.'}
              <br />
              <span className="text-xs text-neutral-700">
                {isPreview
                  ? 'Configure Supabase para ver histórico real.'
                  : 'Complete o onboarding para começar.'}
              </span>
            </div>
          )}
        </GlassCard>

        <GlassCard floating className="p-6">
          <p className="label-caps mb-4">Histórico de check-ins</p>
          {checkins.length > 0 ? (
            <div className="flex flex-col gap-3">
              {checkins.slice(0, 6).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-[10px] text-neutral-600 w-4 font-mono">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-neutral-500">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-neutral-600 py-8">
              Sem check-ins ainda.
              <br />
              <span className="text-xs text-neutral-700">Complete sua primeira missão pra reportar.</span>
              {onboardings.length === 0 && !isPreview && (
                <div className="mt-4">
                  <a href="/onboarding" className="text-xs text-yellow-500 hover:text-yellow-400 flex items-center justify-center gap-1">
                    Fazer onboarding <ArrowRight size={10} />
                  </a>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </PageShell>
  )
}
