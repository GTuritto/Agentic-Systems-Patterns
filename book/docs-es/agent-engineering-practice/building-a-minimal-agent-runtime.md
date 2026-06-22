---
title: Construyendo un Agent Runtime Mínimo
---

# Construyendo un Agent Runtime Mínimo

Este capítulo explica el pequeño runtime detrás de los laboratorios de mini-framework desde cero. No lo construyes porque los equipos de producción deban evitar frameworks maduros. Lo construyes porque un runtime pequeño hace visible la arquitectura real.

Los frameworks cambian APIs y vocabulario. Las mismas responsabilidades siguen regresando: state, decisiones, tools, policy, context, traces, evals y condiciones de parada. Una vez que puedes construir esos primitivos en un runtime pequeño, sistemas al estilo de LangGraph, Mastra AI, AutoGen, CrewAI, MCP, A2A y harnesses personalizados son más fáciles de evaluar.

## Lo Que Deberías Poder Hacer

Después de este capítulo, deberías poder:

- identificar los primitivos del runtime ocultos dentro de los agent frameworks;
- explicar por qué el model propone decisiones pero el runtime las ejecuta;
- construir un loop pequeño con state, policy, tools, context, traces y razones de parada;
- comparar características de frameworks por responsabilidad en vez de vocabulario;
- saber cuándo el runtime de aprendizaje debe dar paso a la infraestructura de producción.

## Por Qué Construir Uno

La mayoría de las fallas de agent no son fallas misteriosas del model. Son fallas del runtime.

El sistema no sabía quién era dueño del state. La lista de tools era demasiado amplia. Policy vivía en un prompt. El loop no tenía razón de parada. El context se armaba volcando todo en el model. Una respuesta final parecía aceptable, pero el camino usó un tool prohibido. Ninguna de esas cosas se arregla cambiando nombres de frameworks.

Un runtime mínimo enseña el límite de control:

```text
goal
  -> build context
  -> ask for a decision
  -> validate the decision
  -> check policy
  -> execute allowed work
  -> record observation
  -> evaluate stop condition
```

Esa es la forma oculta bajo muchas abstracciones de frameworks.

Usa este diagrama para mantener separadas las responsabilidades del runtime. El model propone una decisión, pero el runtime es dueño de la validación, policy, ejecución, observación y condiciones de parada.

![Minimal agent runtime architecture](/diagrams/minimal-agent-runtime.svg)

## Lo Que Este Runtime No Es

Esto no es un framework de producción. No intenta resolver despliegue, streaming, ejecución distribuida, persistencia, autenticación, colas de workflow, adaptadores de model, integración de UI, backends de tracing o almacenes de memory.

Úsalo como andamio de aprendizaje. Usa frameworks maduros cuando necesites durabilidad de producción, integraciones operativas, concurrencia, checkpoints, reintentos, observabilidad alojada y soporte de ecosistema.

## Registro de Preparación del Runtime

Antes de adaptar el mini-runtime a un sistema real, anota qué primitivos son solo para aprendizaje y cuáles son propiedad de producción.

```yaml
runtime_readiness:
  purpose: "learning scaffold"
  state:
    owner: "mini-runtime"
    production_gap: "no durable checkpoints"
  tools:
    owner: "tool registry"
    production_gap: "no tenant-scoped authorization service"
  policy:
    owner: "local policy gate"
    production_gap: "no central audit trail"
  context:
    owner: "context builder"
    production_gap: "no retrieval freshness or redaction pipeline"
  trace:
    owner: "local trace events"
    production_gap: "no hosted observability backend"
  decision: "use for labs only; migrate to mature runtime before real side effects"
```

El registro previene el error común: tratar un runtime educativo útil como si ya tuviera durabilidad, seguridad y operaciones de producción.

## Primitivo 1: State

El state es la fuente de verdad para la ejecución. El transcript no es suficiente. Un transcript dice lo que se dijo; el state dice lo que el sistema intenta hacer, lo que pasó, lo que se observó, lo que falta y por qué se detuvo la ejecución.

```ts
type StopReason =
  | "success"
  | "blocked"
  | "approval_required"
  | "budget_exhausted"
  | "invalid_decision"
  | "policy_denied"
  | "tool_failure";

type Observation = {
  id: string;
  kind: "model" | "tool" | "policy" | "human" | "system";
  summary: string;
  data?: unknown;
};

type AgentState = {
  runId: string;
  goal: string;
  steps: number;
  maxSteps: number;
  observations: Observation[];
  stopReason?: StopReason;
};
```

Un buen state te permite reanudar, reproducir, depurar, evaluar y explicar una ejecución. Un mal state obliga a los operadores a inferir el comportamiento a partir del texto final.

## Primitivo 2: Decision

La respuesta de un model es una propuesta. El runtime convierte esa propuesta en una decisión tipada antes de que pueda afectar tools, usuarios, state durable o sistemas externos.

```ts
type Decision =
  | { kind: "answer"; text: string }
  | { kind: "tool"; name: string; input: unknown }
  | { kind: "ask_human"; question: string }
  | { kind: "stop"; reason: StopReason };
```

Esta es la división más importante en el runtime: el model puede sugerir, pero el software valida y ejecuta.

## Primitivo 3: Loop

El loop es dueño del progreso. Repetidamente construye el context, pide una decisión, valida esa decisión, ejecuta el trabajo permitido, registra observaciones y se detiene.

```ts
async function runAgent(
  state: AgentState,
  decide: (context: ContextPacket) => Promise<Decision>,
): Promise<AgentState> {
  while (state.steps < state.maxSteps) {
    const context = buildContext(state);
    const decision = await decide(context);
    const result = await handleDecision(state, decision);

    state.observations.push(result.observation);
    state.steps += 1;

    if (result.stopReason) {
      state.stopReason = result.stopReason;
      return state;
    }
  }

  state.stopReason = "budget_exhausted";
  return state;
}
```

El loop nunca debe ejecutarse solo porque el model sigue preguntando. Se ejecuta porque el runtime aún tiene presupuesto, la policy permite el siguiente paso y no se han cumplido las condiciones de parada.

## Primitivo 4: Tool Registry

Los tools son capabilities. Un registry define las capabilities que el runtime puede exponer.

```ts
type ToolResult =
  | { status: "ok"; data: unknown }
  | { status: "refused"; reason: string }
  | { status: "error"; reason: string };

type ToolDefinition = {
  name: string;
  description: string;
  sideEffect: "read" | "draft" | "write";
  execute(input: unknown): Promise<ToolResult>;
};
```

Mantén los tools acotados. Prefiere `lookup_order_summary` sobre `run_sql`, `draft_refund_request` sobre `post_http` y `search_policy_docs` sobre acceso irrestricto al navegador o shell.

## Primitivo 5: Policy Gate

El registry dice qué existe. La policy decide qué está permitido ahora.

```ts
type PolicyDecision =
  | { status: "allow" }
  | { status: "deny"; reason: string }
  | { status: "approval_required"; reason: string };

type PolicyContext = {
  actorId: string;
  route: string;
  approvedActionIds: string[];
  remainingSteps: number;
};
```

Un policy gate útil considera actor, ruta, tenant, tool, efecto secundario, estado de aprobación, sensibilidad de datos y presupuesto. Un prompt que dice "no hagas cosas peligrosas" no es un policy gate.

## Primitivo 6: Context Packet

El context no es todo lo que el sistema sabe. Es el conjunto de trabajo para una decisión.

```ts
type ContextPacket = {
  runId: string;
  goal: string;
  stateSummary: string;
  observations: Array<{ id: string; summary: string }>;
  toolsDisclosed: string[];
  evidenceRefs: string[];
  memoryRefs: string[];
  omittedRefs: Array<{ ref: string; reason: string }>;
};
```

El runtime debe poder explicar por qué cada elemento entró al context y por qué otro material disponible quedó fuera.

## Primitivo 7: Trace

Los traces hacen que el comportamiento sea revisable. Sin ellos, el debugging se reduce a leer respuestas finales y adivinar.

```ts
type TraceEvent = {
  runId: string;
  step: number;
  type:
    | "context_built"
    | "decision"
    | "policy_decision"
    | "tool_result"
    | "stop";
  data: unknown;
};
```

Los eventos de trace deben conectar la decisión del model, el resultado de policy, la llamada a tool, la observación, el costo, la latencia y la razón de parada.

## Primitivo 8: Eval Harness

Los agent evals deben inspeccionar trayectorias, no solo respuestas.

```ts
type EvalCase = {
  caseId: string;
  input: string;
  expected: {
    toolsCalled?: string[];
    toolsNotCalled?: string[];
    stopReason: StopReason;
  };
};
```

Evals útiles detectan tools prohibidos, evidencia faltante, saltos de aprobación, decisiones inválidas, efectos secundarios repetidos y agotamiento de presupuesto. Una respuesta final plausible no es suficiente si la trayectoria fue insegura.

## Cómo se Mapea Esto a los Frameworks

| Runtime Primitive | LangGraph | Mastra AI | Sistemas estilo AutoGen | CrewAI |
| --- | --- | --- | --- | --- |
| State | graph state y checkpoints | workflow y memory state | conversation/session state | flow state |
| Decision | node output o router result | agent response o workflow step | agent message | task output |
| Loop | graph traversal | workflow/agent runtime | conversation turn loop | flow execution |
| Tool registry | tools ligados a nodes o agents | tools | callable functions/tools | role tools |
| Policy gate | guard node o middleware | workflow/tool policy | manager o wrapper | flow guard o task constraint |
| Context packet | node input state | agent context y memory | message set | task context |
| Trace | callbacks y checkpoints | observability/evals | logs y messages | task y flow logs |
| Eval harness | graph-level tests | eval suites | transcript/trajectory tests | task/flow quality checks |

Los frameworks pueden empaquetar estos primitives, pero no eliminan la necesidad de diseñarlos.

La comparación importante es la responsabilidad, no la forma del API:

| Pregunta | Si lo construyes tú mismo | Si usas un framework |
| --- | --- | --- |
| ¿Quién es dueño del state? | Tu runtime data model y plan de persistencia. | El framework puede proveer state containers o checkpoints, pero tu aplicación aún define el business state. |
| ¿Quién autoriza los tools? | Tu policy function, approval records y audit trail. | El framework puede exponer hooks o middleware, pero la product policy sigue estando fuera del prompt. |
| ¿Quién arma el context? | Tu context builder elige memory, evidence, tools y omisiones. | El framework puede proveer memory abstractions, pero aún necesitas reglas de fuente, frescura y privacidad. |
| ¿Quién evalúa el comportamiento? | Tus tests inspeccionan decisions, tools, traces y stop reasons. | El framework puede correr evals, pero tú decides qué significa un comportamiento inseguro o de baja calidad. |
| ¿Quién maneja fallas en producción? | Debes agregar retries, idempotency, durability, alerts y incident workflow. | Runtimes maduros pueden proveer partes de esto, pero deben configurarse según tu risk model. |

## Qué Hacen los Labs

Los labs de mini-framework implementan los primitives en tres pasos:

1. [Lab 09 - Minimal Agent Loop](../hands-on-labs/lab-09-minimal-agent-loop) construye state, decisions, control del loop y stop reasons.
2. [Lab 10 - Tool Registry and Policy Gate](../hands-on-labs/lab-10-tool-registry-and-policy-gate) agrega tools, policy decisions, resultados que requieren aprobación y rutas de rechazo.
3. [Lab 11 - Context, Memory, Trace, and Evals](../hands-on-labs/lab-11-context-memory-trace-evals) agrega context packets, memory con alcance, trace events y trajectory evals.

Haz los labs si quieres intuición sobre la implementación. Lee solo este capítulo si solo necesitas el modelo mental.

## Regla de Diseño

Construye el runtime pequeño para aprender. Lanza con runtime capabilities maduras cuando el sistema deba sobrevivir usuarios reales, datos reales, efectos secundarios reales e incidentes reales.

## Capítulos Relacionados

- [What Is An Agent?](../foundations/what-is-an-agent)
- [Agent Loop](../foundations/agent-loop)
- [Agent Harnesses](./agent-harnesses)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Context Engineering](../foundations/context-engineering)
- [Observability and Evals](../production-runtime/observability-and-evals)
