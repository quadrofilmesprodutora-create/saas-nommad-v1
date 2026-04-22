# _shared — tipos e enums comuns aos agentes

Quando virar TS, estes tipos vivem em `agents/_shared/types.ts`.

## Enums

```ts
export type Nivel = 'iniciante' | 'intermediario' | 'avancado'
export type Confronto = 1 | 2 | 3 | 4 | 5

export type KanbanColuna =
  | 'ideias'
  | 'em_desenvolvimento'
  | 'agendado'
  | 'publicado'
  | 'arquivado'

export type ResultadoPost = 'viralizou' | 'normal' | 'flopou'

export type TipoCard = 'conteudo' | 'musica' | 'branding'

export type FaseCarreira =
  | 'pre_lancamento'
  | 'construcao_base'
  | 'escalada'
  | 'consolidacao'
  | 'reinvencao'

export type Arquetipo =
  | 'rebelde' | 'criador' | 'sabio' | 'explorador'
  | 'mago' | 'herói' | 'amante' | 'cuidador'
  | 'cara_comum' | 'bobo' | 'governante' | 'inocente'
```

## Estruturas recorrentes

### `CleanedInput`
Output do Cleaner, input dos 3 paralelos.
```ts
{
  sessionId: string
  historia: string
  objetivos: string
  frustracoes: string
  referencias: string
  comportamento: string
}
```

### `ArtistIdentity`
Identidade consolidada (persistida em `identity`).
```ts
{
  essencia: string
  teses_centrais: string[]
  teses_secundarias: string[]
  assuntos: string[]
  forca_marca: number   // 0..100
  dna: { personalidade: string, arquetipo: Arquetipo, diferencial: string }
  posicionamento: { nicho: string, publico: string, cena: string }
}
```

### `MissionPayload`
```ts
{
  missao: string              // uma frase acionável
  tarefas: string[]           // 2..3, cada uma executável
  duracao_dias: number        // default 7
}
```

### `BrainOutput`
```ts
{
  mensagem_final: string | null
  missao: MissionPayload | null
  identidade_delta: Partial<ArtistIdentity>
  comportamento_delta: Record<string, unknown>
  nivel: Nivel
  confronto: Confronto
  flags: { degraded?: boolean, needs_more_input?: boolean }
}
```

## Frases proibidas (system-wide)

Nenhum agente deve usar. Cheque com regex simples no pós-processo e regere se bater.

```
"acredite em você"
"confie no processo"
"céu é o limite"
"lembre-se de ser autêntico"
"sua arte é única"
"você é capaz"
"seja você mesmo"
"abrace sua jornada"
"o universo conspira"
```

## Tom

Calibrado pelo `confronto`:

- **1-2** — acolhedor, mostra caminho, pergunta muito
- **3** — direto, afirma, pergunta pouco
- **4-5** — confronto alto, frases curtas, verdades desconfortáveis, sem floreio

Sempre: **humano, estratégico, confiante**. Nunca: robótico, motivacional, genérico.
