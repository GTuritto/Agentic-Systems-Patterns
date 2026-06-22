---
title: Agent Loop
---

# Agent Loop

El agent loop convierte una llamada de model en un agent: observa el state, decide la siguiente acción, actúa, evalúa el resultado y se detiene cuando el goal se completa o se alcanza un límite.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-loop-pattern)
> - [Download code bundle](/downloads/agent-loop.zip)

## Propósito

El agent loop es la estructura de runtime más pequeña que hace que un model actúe como un agent. Observa el state, decide el siguiente paso, valida la acción propuesta, actúa a través de una interfaz limitada, registra la observación y se detiene cuando el éxito, el fallo, el presupuesto o una escalada indican que la ejecución terminó.

El loop es poderoso porque el siguiente paso puede depender de lo que acaba de ocurrir. Es peligroso por la misma razón. Sin state explícito, presupuestos, validación y razones de detención, el loop se convierte en un lugar donde se acumulan costos, latencia, uso inseguro de tools y fallos ocultos.

Este pattern es dueño de la iteración: propuesta, validación, acción, observación, presupuesto y razón de detención. No es responsable del business goal, la implementación de tools, el durable workflow ni el control plane de producción. Esas responsabilidades pertenecen al caller, la capa de tools, el workflow engine y el runtime.

## Úsalo cuando

- La task no puede resolverse con una secuencia fija conocida de antemano.
- El siguiente paso depende de observaciones de tools, retrieval, usuarios o salidas intermedias.
- El agent puede necesitar varios intentos, pero esos intentos pueden estar limitados.
- El sistema puede persistir suficiente loop state para reproducir o depurar la ejecución.
- Puedes definir condiciones de éxito, fallo, agotamiento de presupuesto y escalada.

## Evítalo cuando

- Un workflow determinista o prompt chain puede expresar claramente los pasos.
- La task no tiene observaciones intermedias útiles.
- El uso de tools, el costo, el runtime o los efectos secundarios no pueden ser limitados.
- El loop state viviría solo dentro del context del model.
- El equipo no puede explicar por qué el loop se detuvo.

## Arquitectura

Usa este diagrama para leer Agent Loop como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el caller o un pequeño servicio de aplicación es dueño del task state hasta que se introduce un runtime pattern.

![Agent loop architecture](../public/diagrams/agent-loop.svg)

## Forma del sistema

- **Límite del pattern:** un loop controller es dueño del progreso, presupuesto, validación, actualizaciones de state y decisiones de detención.
- **Dueño del state:** el loop runtime es dueño del task-local state durante la ejecución y guarda checkpoints de state durable cuando la ejecución debe sobrevivir una interrupción.
- **Rol del model:** el model propone el siguiente paso, pero el software valida si el paso está permitido.
- **Límite de acción:** tools, handoffs, memory writes y respuestas finales pasan por validación tipada.
- **Promesa operativa:** el loop maneja la incertidumbre sin dar al model tiempo, tools o autoridad ilimitados.

## Protocolo central

1. Recibe una task con un goal, caller, restricciones, presupuesto y trace ID.
2. Carga o inicializa el loop state: observaciones, evidencia, intentos, errores y presupuesto restante.
3. Ensambla el working set para el siguiente paso.
4. Pide al model que proponga una acción, un resultado final, una negativa o una escalada.
5. Valida la propuesta contra schema, tools, policy, state y presupuesto.
6. Ejecuta la acción permitida y registra la observación.
7. Actualiza el state, los contadores de presupuesto, eventos de trace y la razón de detención.
8. Se detiene en éxito, fallo, negativa, cancelación, agotamiento de presupuesto o escalada.

## Notas de implementación

Mantén el controller simple. El loop debe ser fácil de inspeccionar.

```ts
type StopReason =
  | 'completed'
  | 'failed'
  | 'refused'
  | 'needs_human'
  | 'max_steps'
  | 'max_tool_calls'
  | 'timeout';

type LoopState = {
  taskId: string;
  goal: string;
  step: number;
  toolCalls: number;
  startedAtMs: number;
  observations: unknown[];
  errors: string[];
};

type LoopBudget = {
  maxSteps: number;
  maxToolCalls: number;
  timeoutMs: number;
};

function shouldStop(state: LoopState, budget: LoopBudget, nowMs: number): StopReason | null {
  if (state.step >= budget.maxSteps) return 'max_steps';
  if (state.toolCalls >= budget.maxToolCalls) return 'max_tool_calls';
  if (nowMs - state.startedAtMs >= budget.timeoutMs) return 'timeout';
  return null;
}
```

Un loop controller mínimo puede entonces hacer cumplir el límite:

```ts
async function runAgentLoop(task: AgentTask, budget: LoopBudget) {
  const state = initializeLoopState(task);

  while (true) {
    const stopReason = shouldStop(state, budget, Date.now());
    if (stopReason) return finishRun(state, stopReason);

    const proposal = await proposeNextStep(task, state);
    const decision = validateProposal(proposal, state, task.policy);

    if (decision.status === 'deny') {
      return finishRun(state, 'refused');
    }

    if (decision.status === 'escalate') {
      return finishRun(state, 'needs_human');
    }

    if (decision.status === 'final') {
      return finishRunWithResult(state, decision.result, 'completed');
    }

    const observation = await executeAction(decision.action, {
      traceId: task.traceId,
      idempotencyKey: `${task.taskId}:${state.step}`
    });

    recordObservation(state, observation);
    if (decision.action.kind === 'tool') state.toolCalls += 1;
    state.step += 1;
  }
}
```

El controller no necesita ser complicado. Debe hacer explícitas las partes ocultas: el goal activo, la propuesta, la decisión de validación, la acción, la observación, los contadores de presupuesto y la razón de detención.

### Caso de uso: Investigación de reembolso limitada

En el sistema de soporte de reembolsos, todo el producto no debe ser un loop abierto. El workflow debe llamar a un loop solo para la parte incierta: investigar si la evidencia disponible respalda la recomendación de reembolso.

```text
goal: "Decide whether refund evidence is sufficient for order O-104."
allowed_actions:
  - read_order
  - read_delivery_status
  - search_refund_policy
  - ask_customer_clarifying_question
  - draft_refund_recommendation
forbidden_actions:
  - issue_refund
  - change_payment_method
  - update_policy
stop_reasons:
  - completed
  - evidence_missing
  - policy_blocked
  - needs_human
  - max_steps
```

Esto mantiene el loop útil y pequeño. Puede decidir el siguiente paso para recolectar evidencia, pero no puede emitir el reembolso. La acción de pago queda detrás de la validación de policy, aprobación, idempotency y auditoría.

## Modos de fallo

- El goal es vago, así que el loop sigue trabajando sin una condición de éxito estable.
- Se permite que el model decida cuándo debe detenerse el loop sin un presupuesto controlado por software.
- El loop repite la misma llamada a tool porque no compara nuevas observaciones con las anteriores.
- Los reintentos ocurren sin idempotency, duplicando efectos secundarios.
- El state existe solo en el prompt, así que la reproducción y recuperación son imposibles.
- El loop resume evidencia que era necesaria para la siguiente decisión.
- Los errores de tools se tratan como observaciones normales, causando acciones de seguimiento confusas.
- El agent declara éxito porque produjo una respuesta, no porque el goal fue satisfecho.
- Los traces capturan la salida final pero no el historial de iteraciones.

## Estrategia de evaluación

Los evals de loop deben probar la trayectoria, no solo la respuesta final.

- Prueba una task que se complete dentro del presupuesto.
- Prueba una task que deba detenerse en `max_steps`.
- Prueba una task que deba detenerse en `max_tool_calls`.
- Prueba una task con un resultado de tool mal formado.
- Prueba una task con fallos repetidos de tool que debería escalar.
- Prueba una task donde el model proponga una acción prohibida.
- Prueba una task donde el model reclame finalización pero falte evidencia requerida.
- Prueba la reproducción desde un loop state guardado.

Un fixture de eval compacto puede hacer explícito el comportamiento de detención esperado:

```json
{
  "case_id": "shipping_lookup_repeated_failure",
  "goal": "Investigate whether an order arrived late.",
  "mocked_tools": {
    "shipping.read_delivery_status": [
      { "status": "retryable_error", "reason": "upstream_timeout" },
      { "status": "retryable_error", "reason": "upstream_timeout" }
    ]
  },
  "expected": {
    "stop_reason": "needs_human",
    "max_tool_calls": 2,
    "forbidden_tools": ["refunds.issue_refund"],
    "requires_trace_events": ["proposal", "validation", "tool_result", "stop"]
  }
}
```

Mide tasa de finalización, razón correcta de detención, tasa de acciones inválidas, tasa de acciones repetidas, precisión de escalada, costo de tokens y tools, latencia y éxito de reproducción.

## Lista de verificación para producción

- Define el goal del loop y los criterios de éxito antes de la primera llamada al model.
- Almacena el state del loop fuera del context del model.
- Establece límites estrictos para pasos, llamadas a tools, tiempo de reloj, reintentos y costo.
- Valida cada acción antes de ejecutarla.
- Haz que las acciones con efectos secundarios sean idempotentes o requieran aprobación.
- Registra la propuesta, decisión de validación, acción, observación, error y motivo de detención en cada iteración.
- Trata la cancelación, rechazo, timeout y escalamiento como resultados normales.
- Agrega circuit breakers para fallas repetidas o propuestas de acciones inseguras.
- Mantén versionados los prompts del loop, manifiestos de tools, policies y rutas de model.
- Reproduce fallas de producción en regression evals.

La regla arquitectónica es simple: el model puede elegir la siguiente propuesta, pero el software decide si el loop continúa. Continúa con [Goals and State](/foundations/goals-and-state) para definir qué lleva el loop, luego con [Tool Use](/foundations/tool-use) para definir cómo actúa.

## Ejecuta el ejemplo

```sh
npm run agent-loop
npm run agent-loop:test
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el paquete de descarga y en el repositorio fuente.

### `agent-loop-pattern/typescript/src/agent_loop.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-loop-pattern/typescript/src/agent_loop.ts)

```ts
export type StopReason =
  | "completed"
  | "refused"
  | "needs_human"
  | "max_steps"
  | "tool_failure";

export type ToolProposal = {
  kind: "tool";
  name: "lookup_order";
  input: { orderId: string };
};

export type Proposal =
  | { kind: "answer"; text: string }
  | ToolProposal
  | { kind: "tool"; name: string; input: unknown }
  | { kind: "escalate"; reason: string };

export type Observation = {
  tool: string;
  status: "ok" | "error";
  output: unknown;
};

export type LoopState = {
  goal: string;
  step: number;
  observations: Observation[];
};

export type LoopResult = {
  stopReason: StopReason;
  answer?: string;
  state: LoopState;
  trace: string[];
};

export type LoopDependencies = {
  propose(state: LoopState): Promise<Proposal>;
  execute(
    proposal: ToolProposal,
    idempotencyKey: string,
  ): Promise<Observation>;
};

type ValidatedDecision =
  | { status: "final"; answer: string }
  | { status: "execute"; proposal: ToolProposal }
  | { status: "escalate"; reason: string }
  | { status: "deny"; reason: string };

export function validateProposal(proposal: Proposal): ValidatedDecision {
  if (proposal.kind === "answer") {
    return proposal.text.trim()
      ? { status: "final", answer: proposal.text }
      : { status: "deny", reason: "empty_answer" };
  }

  if (proposal.kind === "escalate") {
    return { status: "escalate", reason: proposal.reason };
  }

  if (proposal.name !== "lookup_order") {
    return { status: "deny", reason: "tool_not_allowed" };
  }

  const input = proposal.input as { orderId?: unknown };
  if (typeof input.orderId !== "string" || !input.orderId.trim()) {
    return { status: "deny", reason: "invalid_tool_input" };
  }

  return {
    status: "execute",
    proposal: {
      kind: "tool",
      name: "lookup_order",
      input: { orderId: input.orderId },
    },
  };
}

export async function runAgentLoop(
  goal: string,
  maxSteps: number,
  dependencies: LoopDependencies,
): Promise<LoopResult> {
  const state: LoopState = { goal, step: 0, observations: [] };
  const trace: string[] = [];
```

_Extracto truncado para mayor legibilidad. Descarga el paquete o abre el archivo fuente para la implementación completa._

### `agent-loop-pattern/typescript/test/agent_loop.spec.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-loop-pattern/typescript/test/agent_loop.spec.ts)

```ts
import {
  runAgentLoop,
  type LoopDependencies,
  type LoopState,
  type Proposal,
} from "../src/agent_loop.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function scriptedDependencies(
  proposals: Proposal[],
  toolStatus: "ok" | "error" = "ok",
): LoopDependencies {
  return {
    propose: async (_state: LoopState) =>
      proposals.shift() ?? { kind: "escalate", reason: "script_exhausted" },
    execute: async (proposal, idempotencyKey) => ({
      tool: proposal.name,
      status: toolStatus,
      output: { idempotencyKey },
    }),
  };
}

const completed = await runAgentLoop(
  "Read an order",
  3,
  scriptedDependencies([
    { kind: "tool", name: "lookup_order", input: { orderId: "A-104" } },
    { kind: "answer", text: "The order shipped." },
  ]),
);
assert(completed.stopReason === "completed", "Expected completed run");
assert(completed.state.observations.length === 1, "Expected one observation");
assert(
  completed.trace.includes("step:0:validation:execute"),
  "Expected validation trace",
);

const denied = await runAgentLoop(
  "Delete an order",
  3,
  scriptedDependencies([
    { kind: "tool", name: "delete_order", input: { orderId: "A-104" } },
  ]),
);
assert(denied.stopReason === "refused", "Expected forbidden tool refusal");
assert(denied.state.observations.length === 0, "Denied tool must not execute");

const failed = await runAgentLoop(
  "Read an order",
  3,
  scriptedDependencies(
    [{ kind: "tool", name: "lookup_order", input: { orderId: "A-104" } }],
    "error",
  ),
);
assert(failed.stopReason === "tool_failure", "Expected tool failure stop");

const exhausted = await runAgentLoop(
  "Keep checking",
  1,
  scriptedDependencies([
    { kind: "tool", name: "lookup_order", input: { orderId: "A-104" } },
    { kind: "answer", text: "This proposal must not run." },
  ]),
);
assert(exhausted.stopReason === "max_steps", "Expected max_steps stop");

console.log("Agent loop tests OK");
```

## Descarga

- [Download source bundle](/downloads/agent-loop.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-loop-pattern)

El paquete de descarga contiene la carpeta actual `agent-loop-pattern/` de este repositorio.

## Patrones relacionados

- [Goals and State](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/goals-and-state-pattern/README.md)
- [Tool-Using Agent](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/tool-using-agent-pattern/README.md)
- [Structured Output](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/structured-output-pattern/README.md)
- [Evaluator-Optimizer](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/evaluator-optimizer-pattern/README.md)
- [Durable Workflows](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
- [Pattern Evaluation Checklist](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/book/docs/pattern-selection/pattern-evaluation-checklist.md)
- [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
