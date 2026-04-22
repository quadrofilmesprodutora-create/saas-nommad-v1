import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { GamificationWrapper } from '@/components/gamification-wrapper'
import { requireSession } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession().catch(() => null)
  if (!session) redirect('/login')

  const user = session.user
  const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Artista'
  const handle = user.user_metadata?.user_name ?? user.email?.split('@')[0] ?? ''

  return (
    <GamificationWrapper>
      <div className="flex min-h-screen bg-[#050507] mesh-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen ml-[calc(var(--sidebar-width)+1rem)] p-4">
          <TopBar displayName={displayName} handle={handle} avatarSeed={user.id} />
          <main className="flex-1 pt-[calc(var(--topbar-height)+1rem)] overflow-y-auto">
            <div className="anim-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </GamificationWrapper>
  )
}
