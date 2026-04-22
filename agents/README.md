# /agents

Cada agente é um **módulo puro**: recebe input, valida, chama modelo, valida output, devolve.

## Formato padrão por agente (um `.md`)

```
---
agent: <nome>
version: 1.0.0
model_default: <id claude>
temperature: <0..1>
updated: YYYY-MM-DD
---

# <Agente>

## Propósito
Uma frase.

## Identidade (voz/postura)
Como o agente se comporta.

## Input schema
JSON.

## Output schema
JSON ou texto.

## Regras (pode / não pode)
Lista.

## System prompt
O texto exato que vai pro modelo.

## Exemplos
- Input válido → output esperado (≥ 2).
```

## Quando TS: `agents/<nome>/`
Cada agente vira uma pasta com:

```
agents/<nome>/
  prompt.md      # este doc
  schema.ts      # zod input/output
  agent.ts       # runner
  agent.test.ts  # golden tests
```

## Lista dos agentes

- [cleaner.md](./cleaner.md) — organizador (Haiku)
- [analyst.md](./analyst.md) — diagnóstico (Sonnet)
- [classifier.md](./classifier.md) — nível + confronto (Haiku, invisível)
- [strategist.md](./strategist.md) — direção (Sonnet)
- [response.md](./response.md) — voz humana ao artista (Sonnet)
- [mission.md](./mission.md) — ações de 7 dias (Sonnet)
- [checkin.md](./checkin.md) — reavaliação (Sonnet)
- [psycho.md](./psycho.md) — análise comportamental profunda (Opus, premium)

Índice de tipos e enums compartilhados: [_shared.md](./_shared.md).
