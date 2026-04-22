# Pipeline — orquestração em código

## Estrutura prevista (quando implementado)

```
brain/
  orchestrator.ts   # entrypoint: runOnboarding, runCheckin, runPsycho
  consolidator.ts   # lógica do Brain (chama modelo + resolve conflitos)
  prompt.md         # system prompt do Brain
  schema.ts         # Zod para BrainOutput
  summarizer.ts     # compressão de histórico
  memory.ts         # wrapper: loadMemory(userId), saveDelta(userId, delta)
  errors.ts         # tipos de erro + retry policy
  telemetry.ts      # trace + spans
  pipeline.md       # este doc
```

## Entrypoints

### `runOnboarding(userId, audioUrl)` → `{ response, mission, brain }`

```ts
export async function runOnboarding(userId: string, audioUrl: string) {
  const trace = startTrace({ userId, kind: 'onboarding' })
  try {
    const rawText = await span(trace, 'transcribe', () =>
      transcribe(audioUrl)
    )

    const cleaned = await span(trace, 'cleaner', () =>
      cleanerAgent({ rawText, sessionId: trace.id })
    )

    const [analysis, classification, strategy] = await Promise.all([
      span(trace, 'analyst',     () => analystAgent({ cleaned })),
      span(trace, 'classifier',  () => classifierAgent({ cleaned })),
      span(trace, 'strategist',  () => strategistAgent({ cleaned })),
    ])

    const memory = await loadMemory(userId)

    const brain = await span(trace, 'brain', () =>
      brainCentral({ cleaned, analysis, classification, strategy, memory, kind: 'onboarding' })
    )

    const [response, mission] = await Promise.all([
      span(trace, 'response', () => responseAgent({ brain, classification })),
      span(trace, 'mission',  () => missionAgent({ brain, classification })),
    ])

    await Promise.all([
      saveMemory(userId, brain),                    // identity + behavior deltas
      createKanbanCards(userId, mission),
      finalizeTrace(trace, { brain, response, mission }),
    ])

    return { response, mission, brain }
  } catch (err) {
    failTrace(trace, err)
    throw err
  }
}
```

### `runCheckin(userId, update)` → `{ text, newMission? }`

```ts
export async function runCheckin(userId: string, update: string) {
  const [identity, behavior, lastMission, recentSummary, classification] =
    await Promise.all([
      getIdentity(userId),
      getBehavior(userId),
      getLatestActiveMission(userId),
      getRecentSummary(userId),
      getCurrentClassification(userId),
    ])

  const out = await checkinAgent({
    update,
    missao_anterior: lastMission,
    analise_anterior: { problema_central: identity.dna?.diferencial, padrao_comportamental: behavior?.padroes },
    historico_recente_resumido: recentSummary,
    classification_previa: classification,
  })

  await saveBehaviorDelta(userId, inferDeltaFromCheckin(out, update))
  if (out.newMission) await createKanbanCards(userId, out.newMission)

  return out
}
```

### `runPsycho(userId)` → `{ report }`

```ts
export async function runPsycho(userId: string) {
  const history = await buildPsychoInput(userId) // identity, behavior, 90d de missões, check-ins, posts
  const report = await psychoAgent(history)
  await savePsychoReport(userId, report)
  return report
}
```

## Memória: compressão

```ts
// a cada 20 interações ou 10k tokens:
export async function maybeSummarize(userId: string) {
  const chunks = await loadRecentMemoryChunks(userId)
  if (!shouldSummarize(chunks)) return

  const summary = await summarizerAgent({ chunks })
  await archiveChunks(userId, chunks)      // move pra cold storage
  await upsertRecentSummary(userId, summary)
}
```

## Retry + degradação graceful

```ts
async function withRetry<T>(fn: () => Promise<T>, opts = { max: 2 }): Promise<T> {
  let last: unknown
  for (let i = 0; i <= opts.max; i++) {
    try { return await fn() }
    catch (e) { last = e; await sleep(1000 * Math.pow(3, i)) }
  }
  throw last
}
```

Regra: se algum agente paralelo falhar após retries, o Brain roda em **modo degraded** com flag `degraded: true` e os outputs disponíveis.

## Paralelismo: ordem de falhas

Se Analyst falha mas Strategist sucede → Brain opera só com Strategy + histórico (aceitável).
Se Cleaner falha → aborta tudo (não há input pra rodar nada).
Se Classifier falha → default para `intermediario / 3`.
Se Strategist falha → rerun com fallback prompt mais simples.
