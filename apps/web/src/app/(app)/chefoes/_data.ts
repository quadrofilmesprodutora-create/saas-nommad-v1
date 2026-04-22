// Mock data compartilhado entre /chefoes (lista) e /chefoes/[id] (arena).
// Quando o backend entrar (M3), isso vira query Supabase.

import { avatarUrl } from '@/lib/placeholders'

export type BossTipo = 'contratante' | 'label' | 'artista' | 'media'
export type BossStatus = 'aguardando' | 'respondendo' | 'morno' | 'parado'
export type BossDificuldade = 'facil' | 'medio' | 'dificil'

export type Proof = {
  data: string            // relativa "há 5 dias"
  quem: 'boss' | 'voce'
  texto: string
  veredicto?: 'sucesso' | 'parcial' | 'falha'
}

export type Boss = {
  id: string
  caso: string            // "#001"
  nome: string
  iniciais: string
  local?: string
  funcao?: string
  tipo: BossTipo
  objetivo: string
  criterio: string        // critério de vitória
  dificuldade: BossDificuldade
  xp: number
  status: BossStatus
  interesse: number       // 0-100 — quanto o boss se engajou
  urgencia: number        // 0-100 — quão quente a janela
  fase: 'contato' | 'proposta' | 'negociacao' | 'fechamento'
  dias: number            // dias em andamento
  ultimoFeedback: string  // output do boss-feedback agent (voz do chefão)
  proofs: Proof[]
  fotoUrl: string         // placeholder dicebear — trocado por foto real no M3
}

const FASES = ['contato', 'proposta', 'negociacao', 'fechamento'] as const

export const FASE_LABEL: Record<typeof FASES[number], string> = {
  contato:    'Contato',
  proposta:   'Proposta',
  negociacao: 'Negociação',
  fechamento: 'Fechamento',
}

export const FASES_ORDER = FASES

export const BOSSES: Boss[] = [
  {
    id: 'arena-bar',
    caso: '#001',
    nome: 'Gabriel Souza',
    iniciais: 'GS',
    local: 'Arena Bar',
    funcao: 'Dono / Booker — São Paulo',
    tipo: 'contratante',
    objetivo: 'Fechar primeira gig no Arena Bar',
    criterio: 'Mensagem confirmando data + cachê por escrito',
    dificuldade: 'medio',
    xp: 100,
    status: 'respondendo',
    interesse: 58,
    urgencia: 72,
    fase: 'proposta',
    dias: 5,
    ultimoFeedback: 'Ele não disse não. Disse que "vai ver". Em casa de show, isso é não. Reativa em 5 dias com proposta concreta — data sugerida, cachê e o que você entrega.',
    proofs: [
      { data: 'há 5 dias', quem: 'voce', texto: 'Mandei mensagem apresentando o projeto.', veredicto: 'parcial' },
      { data: 'há 4 dias', quem: 'boss',  texto: 'Show, vou olhar aqui e te retorno.', veredicto: 'parcial' },
      { data: 'há 2 dias', quem: 'voce', texto: 'Mandei link do set no Warung + demo do EP.', veredicto: 'parcial' },
    ],
    fotoUrl: avatarUrl('gabriel-arena-bar', 'avataaars'),
  },
  {
    id: 'label-xyz',
    caso: '#002',
    nome: 'Marcela Andrade',
    iniciais: 'MA',
    local: 'Label XYZ',
    funcao: 'A&R — Rio / SP',
    tipo: 'label',
    objetivo: 'Resposta do A&R sobre demo',
    criterio: 'Reply com veredicto (sim, não, revisão) sobre a demo enviada',
    dificuldade: 'dificil',
    xp: 200,
    status: 'aguardando',
    interesse: 34,
    urgencia: 41,
    fase: 'contato',
    dias: 9,
    ultimoFeedback: 'Label boa demora. Nove dias ainda é cedo pra cobrar, mas perto do limite. Em 3 dias: follow-up curto, sem pressão — "só garantindo que chegou, sigo disponível pra qualquer pergunta".',
    proofs: [
      { data: 'há 9 dias', quem: 'voce', texto: 'Enviei demo via email do site. Sem resposta automática.', veredicto: 'parcial' },
    ],
    fotoUrl: avatarUrl('marcela-label-xyz', 'avataaars'),
  },
  {
    id: 'dj-nuno',
    caso: '#003',
    nome: 'DJ Nuno',
    iniciais: 'DN',
    local: 'Cena underground SP',
    funcao: 'Artista / Possível collab',
    tipo: 'artista',
    objetivo: 'Fechar collab de uma faixa',
    criterio: 'Envio mútuo de stems + data marcada de estúdio',
    dificuldade: 'medio',
    xp: 120,
    status: 'respondendo',
    interesse: 81,
    urgencia: 65,
    fase: 'negociacao',
    dias: 12,
    ultimoFeedback: 'Esse cara tá quente. Você mandou ideia, ele respondeu com ideia melhor. Agora é data de estúdio — não deixa esfriar em chat. Lança 3 opções de dia esta semana.',
    proofs: [
      { data: 'há 12 dias', quem: 'voce', texto: 'Ideia de collab + referências.', veredicto: 'sucesso' },
      { data: 'há 10 dias', quem: 'boss', texto: 'Topou e mandou contraproposta de BPM.', veredicto: 'sucesso' },
      { data: 'ontem',     quem: 'voce', texto: 'Mandei stem do groove base.', veredicto: 'sucesso' },
    ],
    fotoUrl: avatarUrl('dj-nuno', 'avataaars'),
  },
]

export function getBoss(id: string): Boss | undefined {
  return BOSSES.find((b) => b.id === id)
}

export const DIFF_COLOR: Record<BossDificuldade, string> = {
  facil:   'text-emerald-400 border-emerald-500/40',
  medio:   'text-yellow-500 border-yellow-500/40',
  dificil: 'text-red-400 border-red-500/40',
}

export const STATUS_LABEL: Record<BossStatus, string> = {
  aguardando:  'AGUARDANDO RESPOSTA',
  respondendo: 'CONVERSA ATIVA',
  morno:       'CONTATO FRIO',
  parado:      'SEM MOVIMENTO',
}
