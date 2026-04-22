# 03 — Pipeline de Orquestração

## 1. Fluxo completo (onboarding)

```
[USER]  grava áudio (2–5 min)
  │
  ▼
/api/transcribe
  │  Groq Whisper → texto cru
  ▼
[CLEANER]
  │  texto cru → JSON { historia, objetivos, frustracoes, referencias, comportamento }
  ▼
╔════════════════════════════════════ PARALELO ═══════════════════════════════╗
║  [ANALYST]                    [CLASSIFIER]               [STRATEGIST]        ║
║   autoimagem vs realidade      nivel + confronto          identidade          ║
║   incoerencia                                             posicionamento      ║
║   problema_central                                        direcao_conteudo    ║
║   padrao_comportamental                                   fase_carreira       ║
╚══════════════════════════════════════════════════════════════════════════════╝
  │                 │                    │
  └────────┬────────┴────────────────────┘
           ▼
      [BRAIN CENTRAL]
        • recebe os 3 outputs + memória do artista
        • resolve conflitos (ex: Analyst diz "travado" e Strategist diz "pronto pra escalar")
        • decide nivel_confronto final
        • gera "mensagem_final" (texto pro user) ou aciona Response
        • gera "ajustes_memoria" (deltas a persistir)
           │
           ├─► [RESPONSE] → texto fluido, tom confrontador calibrado → CHAT
           │
           └─► [MISSION]  → { missao, tarefas[] } → KANBAN ("Em Definição")

  paralelo:
      [MEMORY WRITE] ← persiste identidade + deltas
      [TELEMETRY]     ← log estruturado
```

## 2. Fluxo de check-in (recorrente)

```
[USER] volta (manual ou reminder): "fiz isso, travei naquilo"
  │
  ▼
[CHECK-IN AGENT]
  • lê memória: última missão + análise anterior
  • avalia: executou? falhou onde? evoluiu?
  • ajusta confronto
  • decide: nova missão? manter? reafirmar?
  │
  ├─► texto (chat)
  ├─► (opcional) nova [MISSION]
  └─► [MEMORY WRITE] delta de comportamento
```

## 3. Fluxo premium (Psycho)

```
Trigger: mensal, ou on-demand no plano Premium
  │
  ▼
[PSYCHO AGENT]
  • input: HISTORICO_COMPLETO compactado
  • identifica: decisão, autossabotagem, validação, emocional, perfil_crescimento
  • output: relatório estruturado
  │
  ▼
UI: card "Leitura Profunda" na Evolução
```

## 4. Pseudocódigo do orquestrador

```ts
// brain/orchestrator.ts
export async function runOnboarding(userId: string, audioUrl: string) {
  const rawText = await transcribe(audioUrl)

  const cleaned = await cleanerAgent({ rawText })

  const [analysis, classification, strategy] = await Promise.all([
    analystAgent({ cleaned }),
    classifierAgent({ cleaned }),
    strategistAgent({ cleaned }),
  ])

  const memory = await loadMemory(userId)

  const brain = await brainCentral({
    cleaned, analysis, classification, strategy, memory,
  })

  const [response, mission] = await Promise.all([
    responseAgent({ brain, classification }),
    missionAgent({ brain, classification }),
  ])

  await Promise.all([
    saveMemory(userId, brain.ajustes_memoria),
    createKanbanCards(userId, mission),
    logTelemetry({ userId, sessionId: cleaned.sessionId, outputs: { ... } }),
  ])

  return { response, mission }
}
```

## 5. Tratamento de erro

| Cenário | Ação |
|---|---|
| Agente devolve JSON inválido | retry 1× com "reply with valid JSON only"; se falhar, usar output parcial + flag degraded |
| Timeout (>30s no total) | abortar agente lento, seguir com parciais; registrar alerta |
| Anthropic 429/5xx | exponential backoff (1s, 3s, 9s); após 3, erro ao user |
| Memória corrompida | reset da sessão, não da identidade |
| Transcrição falha | pedir reenvio do áudio |

## 6. Observabilidade mínima

Cada execução do pipeline gera um **trace** com:
- `trace_id` (uuid)
- `user_id`
- Spans por agente: `name`, `start`, `end`, `status`, `model`, `tokens`, `cost`
- `brain_decision` (resumo)
- `output_quality_score` (se houver eval)

Dashboard: média de latência por agente, taxa de retry, custo por sessão, taxa de "degraded".
