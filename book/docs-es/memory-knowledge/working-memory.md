---
title: Working Memory
---

# Working Memory

Working memory es un state de task compacto y tipado que el agent puede actualizar y consultar durante una ejecución.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/goals-and-state-pattern)
> - [Download code bundle](/downloads/working-memory.zip)

## Intent

El patrón Goals and State separa lo que el agent intenta lograr del state mutable que acumula mientras trabaja. Los goals definen el éxito. El state registra el progreso, restricciones, evidencia, trabajo pendiente, aprobaciones, presupuesto y razones de detención.

Este es el núcleo práctico de working memory. Working memory no es long-term memory. Es un state operativo con alcance de run. Debe ser compacto, tipado, inspeccionable y desechable, a menos que otra policy promueva explícitamente parte de él a durable memory.

Usa este pattern para state local de task. Durable memory se maneja con [Memory-Augmented Agent](/memory-knowledge/memory-augmented-agent). El ensamblaje de context se maneja con [Context Engineering](/foundations/context-engineering).

El model puede proponer un siguiente paso, una actualización de state o una razón de detención. El runtime es dueño de la transición de state. Ese límite evita que el agent reescriba silenciosamente lo que ha sucedido, lo que queda o por qué se le permite continuar.

## Usar cuando

- Una task abarca múltiples turnos, tools, agents, reintentos, aprobaciones o pasos de workflow.
- Necesitas ejecución reanudable después de fallas, interrupciones, timeouts o aprobación humana.
- El agent debe explicar el progreso respecto a un objetivo explícito.
- Necesitas un conjunto de trabajo compacto en vez de solo el historial de chat.
- La evaluación depende de la trayectoria, no solo de la respuesta final.

## Evitar cuando

- La task es stateless y puede responderse en una sola llamada.
- El goal no puede expresarse como criterios de éxito observables.
- El state contendría datos sensibles que no puedes almacenar de forma segura.
- El sistema usaría el state como un scratchpad no estructurado y sin dueño.
- El runtime no puede reproducir ni inspeccionar las transiciones de state.

## Arquitectura

Usa este diagrama para leer Working Memory como un límite de sistema, no solo como una forma de código. La pregunta clave de propiedad es: la capa de memory o retrieval posee el conocimiento de larga duración, mientras que el agent es dueño del working state local de la task.

![Goals, state, and working memory architecture](../public/diagrams/goals-state-working-memory.svg)

## Forma del sistema

- **Límite del pattern:** el límite de state posee el goal, working state, event log, reglas de transición, razón de detención y registro de replay.
- **Dueño del state:** el runtime, workflow engine o servicio de aplicación es dueño del state; el model solo posee las actualizaciones propuestas.
- **Rol del model:** el model puede resumir el progreso, identificar brechas y proponer actualizaciones, pero no debe ser la fuente de verdad para el state.
- **Límite de policy:** los cambios de state que afectan permisos, aprobaciones, promoción de memory o efectos secundarios pasan por revisiones del runtime.
- **Promesa operativa:** el sistema puede explicar qué está haciendo, qué cambió, qué evidencia causó el cambio y por qué se detuvo o continuó.

## Protocolo central

1. Crear un goal record con criterios de éxito, restricciones, dueño, clase de riesgo y condiciones de detención.
2. Inicializar working memory con el state mínimo necesario para comenzar.
3. Ejecutar un paso acotado mediante un planner, llamada al model, tool, worker, evaluator o puerta de aprobación.
4. Convertir observaciones en eventos de state tipados.
5. Aplicar transiciones de state de forma idempotente.
6. Recalcular preguntas abiertas, trabajo pendiente, state de presupuesto, state de aprobación y razón de detención.
7. Continuar, reintentar, pedir aprobación, escalar o detener según reglas explícitas.
8. Persistir suficiente state e historial de eventos para reproducir o auditar la ejecución.

## Notas de implementación

El state debe ser más pequeño que la transcripción y más estructurado que un resumen. Es el modelo operativo para la run actual.

### Goal Record

```ts
type AgentGoal = {
  goalId: string;
  runId: string;
  owner: string;
  description: string;
  successCriteria: string[];
  constraints: string[];
  riskClass: "low" | "medium" | "high" | "critical";
  status: "active" | "blocked" | "waiting_for_approval" | "completed" | "cancelled" | "failed";
  createdAt: string;
  updatedAt: string;
};
```

### Working Memory State

```ts
type WorkingMemoryState = {
  runId: string;
  goalId: string;
  currentStep?: string;
  completedSteps: string[];
  pendingSteps: string[];
  openQuestions: string[];
  constraints: string[];
  evidenceRefs: string[];
  toolResultRefs: string[];
  approvalRefs: string[];
  budgetState: {
    iterationCount: number;
    tokenEstimate: number;
    costCents: number;
    deadlineAt?: string;
  };
  stopReason?: "success" | "blocked" | "approval_required" | "budget_exhausted" | "cancelled" | "failed";
  version: number;
};
```

### State Events

El state debe cambiar a través de eventos, no por mutación oculta.

```ts
type StateEvent =
  | { type: "goal_created"; goal: AgentGoal }
  | { type: "step_started"; stepId: string; description: string }
  | { type: "tool_result_recorded"; toolCallId: string; evidenceRef: string }
  | { type: "approval_recorded"; approvalId: string; decision: "approved" | "denied" | "expired" }
  | { type: "question_opened"; question: string }
  | { type: "question_answered"; question: string; evidenceRef: string }
  | { type: "blocked"; reason: string }
  | { type: "completed"; resultRef: string }
  | { type: "cancelled"; reason: string };

function applyStateEvent(state: WorkingMemoryState, event: StateEvent): WorkingMemoryState {
  switch (event.type) {
    case "step_started":
      return { ...state, currentStep: event.stepId, version: state.version + 1 };
    case "tool_result_recorded":
      return {
        ...state,
        evidenceRefs: [...state.evidenceRefs, event.evidenceRef],
        toolResultRefs: [...state.toolResultRefs, event.toolCallId],
        version: state.version + 1,
      };
    case "approval_recorded":
      return {
        ...state,
        approvalRefs: [...state.approvalRefs, event.approvalId],
        stopReason: event.decision === "approved" ? undefined : "blocked",
        version: state.version + 1,
      };
    case "completed":
      return { ...state, stopReason: "success", version: state.version + 1 };
    case "cancelled":
      return { ...state, stopReason: "cancelled", version: state.version + 1 };
    default:
      return { ...state, version: state.version + 1 };
  }
}
```

Esto es intencionalmente simple. Lo importante es la regla: las transiciones de state son explícitas, tipadas, reproducibles y ligadas a observaciones.

### Caso en ejecución: Goal y State de reembolso

Un asistente de reembolsos necesita más que una transcripción de chat porque los operadores deben saber qué evidencia usó el sistema antes de mover dinero. El goal record debe nombrar el resultado y el riesgo; el working state debe mostrar la evidencia, preguntas abiertas, state de aprobación y razón de detención.

```yaml
goal:
  description: "Resolve refund eligibility for order O-104."
  success_criteria:
    - "current refund policy is referenced"
    - "order and delivery evidence are attached"
    - "recommendation is validated by policy gate"
    - "high-value refund waits for approval"
  risk_class: "high"
state:
  completed_steps:
    - "order_loaded"
    - "delivery_status_loaded"
  open_questions:
    - "policy exception evidence is missing"
  evidence_refs:
    - "order:O-104"
    - "delivery:D-88"
    - "policy:refunds:v2026-06"
  approval_refs: []
  stop_reason: "approval_required"
```

Este state le dice al runtime lo que sucedió y lo que queda. También le da a los evals algo concreto para inspeccionar: la ausencia de policy debe bloquear la recomendación, una aprobación denegada debe bloquear el pago y una run reanudada debe preservar las mismas referencias de evidencia.

### Reglas de promoción

Working memory no debe convertirse automáticamente en durable memory. Un paso completado, resultado de tool o corrección de usuario puede ser candidato para long-term memory, pero la promoción requiere una decisión de policy aparte.

Antes de promover working memory, pregunta:

- ¿Esto es útil más allá de la run actual?
- ¿La fuente es confiable y está referenciada?
- ¿El usuario o tenant permite que se almacene?
- ¿Hay datos sensibles que requieren redacción o expiración?
- ¿Es esto un evento, un hecho, una preferencia o una referencia de policy?
- ¿Existe un camino de corrección y eliminación?

Si la respuesta no es clara, mantenlo en el run trace y no lo promociones.

## Modos de falla

- El state se convierte en un volcado de transcripción.
- El model reescribe silenciosamente el state sin un evento.
- El goal describe actividad, no éxito.
- Los subgoals se alejan del goal principal.
- Los resultados de tool se resumen sin referencias de evidencia.
- El state de aprobación, cancelación o presupuesto se pierde tras un reintento.
- El sistema no puede reanudar porque el state solo vivía en el context del model.
- Un state obsoleto sobrescribe resultados frescos de tool.
- El state sensible se persiste sin reglas de retención o redacción.
- Working memory se promueve automáticamente a long-term memory.

## Estrategia de Evaluación

Los evals de working-memory deben inspeccionar la trayectoria, no solo la respuesta final.

- Prueba que una task de múltiples pasos crea un goal con criterios de éxito observables.
- Prueba que cada resultado de tool se convierte en un evento de state con una referencia de evidence.
- Prueba reintentos y verifica transiciones de state idempotentes.
- Prueba reanudar después de una interrupción.
- Prueba cancelación y verifica que la run no continúe.
- Prueba esperas de aprobación y verifica que el approval state sobreviva al reanudar.
- Prueba agotamiento de presupuesto y verifica que la stop reason quede registrada.
- Prueba resultados de tool obsoletos y verifica que la evidence más reciente prevalezca.
- Prueba runs bloqueadas y verifica que las preguntas abiertas se conserven.
- Prueba que la working memory no se promueva a durable memory sin policy.

Mide integridad del state, validez de transiciones, éxito de replay, éxito de resume, tasa de stale-state, tasa de lost-approval, precisión de stop-reason y precisión de promotion-policy.

## Lista de Verificación para Producción

- Define goal schema, state schema, event schema y stop reasons.
- Mantén la working memory compacta y tipada.
- Almacena el state separado del historial de chat.
- Haz que las actualizaciones de state sean basadas en eventos, idempotentes y reproducibles.
- Adjunta referencias de evidence a resultados de tool, decisiones, aprobaciones y respuestas finales.
- Persiste approval, cancelación, presupuesto, retry y blocked state.
- Trata la promoción de state a durable memory como una decisión de policy separada.
- Redacta o evita datos sensibles en la working memory cuando sea posible.
- Traza lecturas, escrituras, transiciones, reintentos, reanudaciones y stop reasons del state.
- Convierte incidentes de lost-state y wrong-stop en regression evals.

## Recorrido de Código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo circundante explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o flujo de control.

## Código Fuente

Este pattern actualmente no tiene un extracto de código dedicado. Usa los enlaces de source y descarga a continuación para obtener la carpeta completa del pattern.

## Descarga

- [Descargar paquete fuente](/downloads/working-memory.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/goals-and-state-pattern)

El paquete de descarga contiene la carpeta `goals-and-state-pattern/` actual de este repositorio.

## Patrones Relacionados

- [Agent Loop](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-loop-pattern/README.md)
- [Planning Pattern](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/planning-pattern/README.md)
- [Durable Workflow](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
- [Memory-Augmented Agent](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/memory-augmented-agent-pattern/README.md)
- [Long-Term Episodic Memory](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/long-term-episodic-memory-agent-pattern/README.md)
- [Human Approval Gates](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/human-in-the-loop-approval-agent/README.md)
