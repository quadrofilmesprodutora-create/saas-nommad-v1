# 02 — Agentes (Overview)

Spec detalhada de cada agente vive em `agents/<nome>.md`. Este documento é o índice e as regras que valem para **todos**.

## 1. Os oito agentes

| # | Agente | Responsabilidade | Modelo default | Latência alvo |
|---|---|---|---|---|
| 1 | **Cleaner** | Organizar transcrição bruta | Haiku | < 2s |
| 2 | **Analyst** | Diagnóstico profundo (incoerência, problema central) | Sonnet | < 8s |
| 3 | **Classifier** | Nível + confronto (invisível) | Haiku | < 2s |
| 4 | **Strategist** | Identidade + posicionamento + direção | Sonnet | < 8s |
| 5 | **Response** | Mensagem final ao artista (humana, confrontadora) | Sonnet | < 6s |
| 6 | **Mission** | Missão de 7 dias + tarefas executáveis | Sonnet | < 4s |
| 7 | **Check-in** | Avaliar execução + ajustar rota | Sonnet | < 5s |
| 8 | **Psycho** (premium) | Análise comportamental profunda | Opus | < 20s |

## 2. Regras universais

### 2.1 Um agente = um contrato
Cada agente declara em seu `.md`:
- Propósito (1 frase)
- Input schema (JSON)
- Output schema (JSON)
- Regras (o que pode e o que NÃO pode)
- Prompt

### 2.2 Output SEMPRE em JSON válido
Exceção: `Response` e `Check-in` retornam texto puro (conversam com o artista). Todos os outros: JSON estrito validado por Zod.

### 2.3 Não invadir papel do outro
- Analyst não sugere ação
- Strategist não faz diagnóstico
- Mission não filosofa
- Classifier não aparece para o usuário

Violação = bug.

### 2.4 Temperatura por função
| Tipo | Temperature |
|---|---|
| Cleaner, Classifier | 0.2 (determinístico) |
| Analyst, Strategist, Mission | 0.5 (analítico) |
| Response, Check-in | 0.8 (humano) |
| Psycho | 0.6 (profundo mas coerente) |

### 2.5 Evitar repetição
Incluir no system prompt de todos:
> Nunca repita estruturas idênticas. Varie abertura, ritmo e vocabulário. Evite padrões previsíveis.

### 2.6 Evitar clichês proibidos
Lista banida (instruída no system):
- "Lembre-se de ser autêntico"
- "Acredite em você"
- "O céu é o limite"
- "Sua arte é única"
- "Confie no processo"
- qualquer frase de motivação vazia

### 2.7 Telemetria obrigatória
Cada chamada registra: `agent_name`, `input_hash`, `output`, `latency_ms`, `tokens_in`, `tokens_out`, `model`, `user_id`, `session_id`, `error?`.

## 3. Fluxo padrão

```
  audio
    │
    ▼
[Cleaner]
    │ clean
    ▼
┌───┴────────────────────────────┐
│  Parallel                      │
│   ├─► [Analyst]     → analysis │
│   ├─► [Classifier]  → class    │
│   └─► [Strategist]  → strategy │
└───┬────────────────────────────┘
    ▼
[Brain Central]
    │ consolidado
    ├─► [Response] → chat visible to user
    └─► [Mission]  → Kanban

  (dias depois, nova interação)
    │
    ▼
[Check-in]  ← histórico + update do usuário
```

Detalhe do orquestrador em `brain/pipeline.md`.

## 4. Agentes como módulos TS

Estrutura prevista de cada agente no código:

```
agents/
  cleaner/
    prompt.md       # system + user template (versionado)
    schema.ts       # zod input/output
    agent.ts        # runner: loadPrompt + callModel + validate
    agent.test.ts   # casos de ouro
```

Hoje o repo tem apenas os `.md` — a implementação TS vem quando o app Next.js for inicializado.

## 5. Versionamento de prompts

Cada `prompt.md` começa com frontmatter:

```yaml
---
agent: cleaner
version: 1.0.0
model_default: claude-haiku-4-5-20251001
temperature: 0.2
updated: 2026-04-22
---
```

Bump semver em qualquer alteração. Eval obrigatório antes de subir `major`.
