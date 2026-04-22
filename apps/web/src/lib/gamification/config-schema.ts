import {
  User, Palette, Music2, Instagram, KeyRound, Bell, CreditCard, Settings,
  type LucideIcon,
} from 'lucide-react'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'toggle'
  | 'slider'
  | 'password'
  | 'color'
  | 'file'
  | 'oauth'

export type FieldDef = {
  id: string
  label: string
  type: FieldType
  options?: string[]              // select
  placeholder?: string
  help?: string                   // texto de apoio
  min?: number                    // slider
  max?: number
  minLabel?: string               // slider endpoint label
  maxLabel?: string
  xpReward: number                // XP quando preenchido
  npReward?: number               // NP quando preenchido (integrações)
}

export type SectionDef = {
  id: string
  label: string
  icon: LucideIcon
  description: string
  fields: FieldDef[]
}

export const SECTIONS: SectionDef[] = [
  {
    id: 'perfil',
    label: 'Perfil Artístico',
    icon: User,
    description: 'Como o sistema se refere a você e em qual mercado você está.',
    fields: [
      { id: 'nomeArtistico', label: 'Nome artístico',        type: 'text',     placeholder: 'Vitor Nomad',               xpReward: 10 },
      { id: 'bio',           label: 'Bio curta (1 frase)',   type: 'textarea', placeholder: 'Uma frase que define seu som.', xpReward: 15 },
      { id: 'genero',        label: 'Gênero principal',      type: 'select',
        options: ['Techno', 'Melodic Techno', 'House', 'Deep House', 'Afro House', 'Drum & Bass', 'Trance', 'Progressive', 'Minimal'], xpReward: 10 },
      { id: 'fase',          label: 'Fase da carreira',      type: 'select',
        options: ['pré-lançamento', 'construção de base', 'consolidação', 'expansão'], xpReward: 10 },
      { id: 'cidade',        label: 'Cidade base',           type: 'text',     placeholder: 'São Paulo',                 xpReward: 10 },
    ],
  },
  {
    id: 'identidade',
    label: 'Identidade Visual',
    icon: Palette,
    description: 'Paleta, tipografia e logo — base visual que alimenta o módulo Design.',
    fields: [
      { id: 'corPrimaria',    label: 'Cor primária',          type: 'color',  xpReward: 10 },
      { id: 'corSecundaria',  label: 'Cor secundária',        type: 'color',  xpReward: 10 },
      { id: 'tipografia',     label: 'Tipografia principal',  type: 'select',
        options: ['Geist', 'Inter', 'Space Grotesk', 'IBM Plex Mono', 'Helvetica Neue', 'Druk'], xpReward: 10 },
      { id: 'logoUpload',     label: 'Logo (SVG/PNG)',        type: 'file',   xpReward: 20 },
    ],
  },
  {
    id: 'musical',
    label: 'Conexões Musicais',
    icon: Music2,
    description: 'Plataformas onde tua música vive. O sistema puxa stats reais depois.',
    fields: [
      { id: 'spotify',    label: 'Spotify for Artists',       type: 'oauth', xpReward: 25, npReward: 100 },
      { id: 'apple',      label: 'Apple Music for Artists',   type: 'oauth', xpReward: 25, npReward: 100 },
      { id: 'soundcloud', label: 'SoundCloud',                type: 'oauth', xpReward: 25, npReward: 50  },
      { id: 'bandcamp',   label: 'Bandcamp',                  type: 'oauth', xpReward: 25, npReward: 50  },
    ],
  },
  {
    id: 'social',
    label: 'Redes Sociais',
    icon: Instagram,
    description: 'Onde o conteúdo roda. O Gerador adapta o formato pra cada rede conectada.',
    fields: [
      { id: 'instagram', label: 'Instagram', type: 'oauth', xpReward: 25, npReward: 100 },
      { id: 'tiktok',    label: 'TikTok',    type: 'oauth', xpReward: 25, npReward: 100 },
      { id: 'youtube',   label: 'YouTube',   type: 'oauth', xpReward: 25, npReward: 50  },
      { id: 'x',         label: 'X / Twitter', type: 'oauth', xpReward: 25, npReward: 50 },
    ],
  },
  {
    id: 'apis',
    label: 'APIs do Sistema',
    icon: KeyRound,
    description: 'Chaves internas — IA, banco, transcrição. Guardadas só no seu navegador (localStorage) nesta fase. Não commitar.',
    fields: [
      { id: 'anthropicKey',    label: 'Anthropic API Key',       type: 'password', placeholder: 'sk-ant-...',              help: 'console.anthropic.com → API Keys', xpReward: 30, npReward: 100 },
      { id: 'groqKey',         label: 'Groq API Key',            type: 'password', placeholder: 'gsk_...',                 help: 'console.groq.com · para transcrição Whisper', xpReward: 30, npReward: 50 },
      { id: 'supabaseUrl',     label: 'Supabase URL',            type: 'text',     placeholder: 'https://xxx.supabase.co', help: 'supabase.com → Settings → API',    xpReward: 20, npReward: 50 },
      { id: 'supabaseAnonKey', label: 'Supabase anon key',       type: 'password', placeholder: 'eyJhbGci...',             xpReward: 20, npReward: 50 },
      { id: 'stripeKey',       label: 'Stripe Secret Key',       type: 'password', placeholder: 'sk_live_... (opcional)',  help: 'Só se for cobrar de outros artistas no seu ambiente', xpReward: 20 },
    ],
  },
  {
    id: 'notificacoes',
    label: 'Notificações',
    icon: Bell,
    description: 'Quando e como o sistema te chama de volta.',
    fields: [
      { id: 'emailCheckIn', label: 'Email de check-in semanal',    type: 'toggle',  xpReward: 10 },
      { id: 'emailMissao',  label: 'Email quando missão vencer',   type: 'toggle',  xpReward: 10 },
      { id: 'pushMissao',   label: 'Push quando missão vencer',    type: 'toggle',  xpReward: 10 },
      { id: 'frequencia',   label: 'Frequência do resumo',         type: 'select',  options: ['diário', 'semanal', 'quinzenal'], xpReward: 15 },
    ],
  },
  {
    id: 'billing',
    label: 'Plano e Billing',
    icon: CreditCard,
    description: 'Plano do NOMMAD e dados de cobrança.',
    fields: [
      { id: 'plano',            label: 'Plano atual',            type: 'select',
        options: ['Trial 7 dias', 'Pro — R$ 500/mês', 'Premium — R$ 1500/mês'], xpReward: 20 },
      { id: 'metodoPagamento',  label: 'Método de pagamento',    type: 'text',     placeholder: 'Stripe · cartão', xpReward: 15 },
      { id: 'cpfCnpj',          label: 'CPF / CNPJ (nota fiscal)', type: 'text',   placeholder: '000.000.000-00',  xpReward: 15 },
    ],
  },
  {
    id: 'preferencias',
    label: 'Preferências',
    icon: Settings,
    description: 'Tom do sistema, idioma e tema.',
    fields: [
      { id: 'tom',     label: 'Tom do sistema',
        type: 'slider', min: 0, max: 100, minLabel: 'Suave',  maxLabel: 'Confrontador',
        help: 'Override manual. Por padrão, o Classifier calibra sozinho.',
        xpReward: 15 },
      { id: 'idioma',  label: 'Idioma',  type: 'select', options: ['pt-BR', 'en-US (beta)'],      xpReward: 10 },
      { id: 'tema',    label: 'Tema',    type: 'select', options: ['escuro', 'claro (em breve)'], xpReward: 10 },
    ],
  },
]

export const TOTAL_FIELDS = SECTIONS.reduce((acc, s) => acc + s.fields.length, 0)

/** Bônus por seção completa. */
export const SECTION_COMPLETE_BONUS_XP = 50

/** Bônus por sistema 100% configurado. */
export const ALL_COMPLETE_BONUS_NP = 500
