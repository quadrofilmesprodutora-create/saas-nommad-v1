# /brain — Cérebro Central

O Brain é o que **diferencia** o NOMMAD de um pipeline linear de prompts. Ele recebe as saídas dos agentes analíticos, resolve conflitos, decide o que vai pro artista, e emite **deltas de memória**.

## Responsabilidades

1. **Consolidar** — merge de `analysis + classification + strategy + memoria` num payload coerente.
2. **Resolver conflitos** — ex: Analyst vê artista travado, Strategist propõe escalada agressiva → Brain rebaixa.
3. **Decidir confronto final** — Classifier sugere, Brain pode ajustar por contexto (memória, fase).
4. **Emitir deltas de memória** — o que muda em `identity` e `behavior`.
5. **Rotar** para Response (chat) e Mission (kanban).

## Quando usar Opus

Brain roda com **Opus** por padrão. Justifica custo porque:
- Qualidade da consolidação define qualidade do produto.
- Roda uma vez por pipeline (não é hot path em massa).
- Conflitos entre agentes são exatamente o tipo de raciocínio onde Opus brilha.

## Input
```json
{
  "cleaned": "<CleanedInput>",
  "analysis": "<AnalystOutput>",
  "classification": "<ClassifierOutput>",
  "strategy": "<StrategistOutput>",
  "memory": {
    "identity": "<ArtistIdentity | null>",
    "behavior": "<Behavior | null>",
    "recent_summary": "string | null"
  },
  "kind": "onboarding | checkin | regen"
}
```

## Output (`BrainOutput`)
```json
{
  "mensagem_final": null,            // gerada pelo Response agente depois
  "missao": null,                    // gerada pelo Mission depois
  "consolidado": {
    "nivel_final": "iniciante|intermediario|avancado",
    "confronto_final": 1,
    "resumo_diagnostico": "1 parágrafo",
    "prioridade_estrategica": "1 frase — o que o Mission deve atacar",
    "riscos": [ "strings curtas" ]
  },
  "identidade_delta": { /* subset de ArtistIdentity */ },
  "comportamento_delta": { /* subset de Behavior */ },
  "flags": {
    "degraded": false,
    "needs_more_input": false,
    "needs_human_attention": false
  }
}
```

## Regras de resolução de conflitos

| Situação | Regra |
|---|---|
| Analyst e Strategist discordam sobre fase | Prevalece Analyst (diagnóstico > projeção) |
| Classifier alto, Analyst vê fragilidade | Baixa confronto |
| Strategist propõe nicho, Analyst detecta incoerência com história | Reformula nicho pelo Analyst |
| Memória mostra padrão repetido não resolvido | Prioridade_estrategica = quebrar o padrão |

## Prompt do Brain

Vive em `brain/prompt.md` (criar quando for implementar). O system prompt enfatiza:

> "Você não responde rápido. Você responde certo. Quando houver conflito entre agentes, sua função é decidir com base em memória e coerência, não consenso."

## Fluxo em código (pseudocódigo)

Ver `brain/pipeline.md`.
