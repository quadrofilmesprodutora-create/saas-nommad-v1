# 04 — Módulos de UI (mapeados do Influencia IA + extensões NOMMAD)

Sidebar escura, estrutura direta. Itens com ★ são exclusivos NOMMAD.

## Sidebar

```
┌──────────────────────────┐
│ NOMMAD                   │
├──────────────────────────┤
│ 🏠 Estratégia            │  home diária (sugestão do dia)
│ 🧠 Minha Marca           │  DNA artístico + força da marca
│ 💼 Meu Negócio           │  ofertas, monetização
│ ⚡ Gerador               │  hooks / reels / carrosséis
│ 📅 Calendário            │  agenda de conteúdo
│ 🎨 Editor de Carrossel   │  templates visuais
│ 🗂️  Kanban Editorial     │  Ideias → Publicado
│ 🧩 Cérebro               │  grafo de ideias e conexões
│ 🎧 Sound Design    ★     │  assinatura sonora, referências
│ 🚀 Release System  ★     │  plano de lançamento, timeline
│ 🤝 Network         ★     │  parcerias, gravadoras, oportunidades
│ 📊 Evolução              │  métricas, relatórios
│ 📖 Guia de Uso           │
│ ⚙️  Configurações        │
└──────────────────────────┘
```

## Módulos em detalhe

### 🏠 Estratégia (home)
Replicar tom do ref: saudação personalizada + "Ainda dá tempo" + 1-3 blocos de sugestão (já concreta, não abstrata).

Seções:
- Boa noite/dia/tarde + nome + frase-diagnóstico
- "Missão ativa" (card com tarefas da semana)
- "Sugestão do dia" (conteúdo 1 → click gera roteiro)
- "Acompanhamento" (últimos posts + métrica)

### 🧠 Minha Marca
Replicar card grande do ref com **Força da Marca (0-100)** + essência em texto corrido editável.

Subseções:
- **Essência** (texto, editável com IA)
- **Teses centrais** (1-3)
- **Teses secundárias** (3-5)
- **Assuntos de interesse** (tags)
- **Ação:** [Copiar] [Editar] [Refazer com IA] [Histórico]

### 💼 Meu Negócio
- Ofertas (serviços, merch, shows)
- Funil e ticket médio
- Simulador de receita

### ⚡ Gerador
Tabs: **Hooks · Reels · Carrosséis · Comunidade**

Hook card (replicar ref):
```
[tag: categoria]
<hook text>
[ Salvar ] [ Roteiro ] [ Aprofundar ]
```

### 📅 Calendário
Mensal + semanal. Drag do Kanban.

### 🎨 Editor de Carrossel
Templates prontos, edição inline. Export PNG/PDF.

### 🗂️ Kanban Editorial
Colunas: **Ideias · Em Desenvolvimento · Agendado · Publicado · Arquivado**

Card:
```
{
  titulo, tipo (conteudo|musica|branding),
  status, prioridade,
  relacao_missao: boolean,
  metricas_pos_publicacao?,
  resultado: "viralizou" | "normal" | "flopou"
}
```

Após Publicado → move para Análise → feedback para Cérebro.

### 🧩 Cérebro
View em grafo (nodes = ideias/insights, edges = relações). Zoom + filtro por tipo. Motor: cruza hooks, missões, resultados.

### 🎧 Sound Design ★
- assinatura sonora (texto + referências de música)
- evolução (timeline)
- referências externas (playlists, artistas)

### 🚀 Release System ★
Timeline de lançamento:
- T-60 definição do projeto
- T-30 arte + pré-save
- T-14 teaser + press kit
- T-7 campanha
- T-0 release day
- T+7, T+30 pós-release

Cards gerados automaticamente no Kanban pelo Mission Agent.

### 🤝 Network ★
- Contatos (produtores, gravadoras, agentes)
- Oportunidades ativas
- Follow-ups

### 📊 Evolução
Replicar cards numéricos do ref: conteúdos publicados, dias em sequência, cards em análise, total. + gráficos. + "Como estão os conteúdos?" com feedback.

### ⚙️ Configurações
- Conta, billing Stripe
- Integrações (Spotify, Instagram, TikTok — fase 2)
- Tom do sistema (slider "suave ↔ confrontador" — na verdade auto via Classifier, mas dá override)
- Export de dados

## Padrões visuais

- **Tema:** dark primário (como ref), paleta slate/neutral-900
- **Acento:** amarelo/âmbar (consistente com o ref) para CTAs
- **Tipografia:** uma sans display (ex: Geist ou Inter) + mono pra dados
- **Densidade:** alta (o ref é denso — artista não quer app fofo)
- **Componentes:** shadcn/ui estendido

## Onboarding (fluxo crítico)

```
1. Cadastro (email + nome)
2. "Conte sobre você" — tela com botão grande de GRAVAR (2-5min)
   OU upload de áudio existente
3. Loading inteligente ("Seu sistema está sendo construído...")
   com microtarefas visíveis: transcrevendo → analisando → estruturando
4. Reveal: "Minha Marca" já preenchida + primeira missão
5. Tour rápido (4 telas max)
```

**Objetivo:** <10 min do cadastro ao primeiro "isso me descreveu".
