'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createSupabaseClient()
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/estrategia` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mesh-bg">
      <div className="w-full max-w-sm anim-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center glow-accent shrink-0">
            <span className="text-neutral-950 font-black text-2xl leading-none">N</span>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-white">NOMMAD</span>
            <span className="block text-[9px] text-yellow-500/80 tracking-[0.2em] uppercase font-bold">Artist OS</span>
          </div>
        </div>

        {!sent ? (
          <div className="glass-card p-8">
            <p className="text-neutral-400 text-sm text-center mb-6 leading-relaxed">
              Sistema operacional de carreira para artistas e DJs.
              <br />Entre com seu email para acessar.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 focus:bg-black/50 transition-colors font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-b from-yellow-400 to-yellow-500 text-neutral-950 rounded-lg text-sm font-bold hover:brightness-110 transition-all press-scale disabled:opacity-50 flex items-center justify-center gap-2 glow-accent"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Entrar com magic link'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✉</span>
            </div>
            <p className="text-neutral-100 font-semibold mb-2">Cheque seu email</p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Enviamos um link de acesso para{' '}
              <span className="text-yellow-500 font-mono">{email}</span>
            </p>
          </div>
        )}

        <p className="text-center text-[11px] text-neutral-700 mt-6">
          Método Diogo O&apos;Band · Sistema operacional de carreira
        </p>
      </div>
    </div>
  )
}
