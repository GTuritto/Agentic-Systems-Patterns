---
title: Agents As Services
---

# Agents As Services

Una forma práctica de razonar sobre los agents es tratar cada agent como un servicio. No porque los agents sean idénticos a los microservices, ya que no lo son. Un microservice usualmente expone un comportamiento determinista detrás de una API, mientras que un agent puede usar model judgment, tools, memory y loops antes de devolver un resultado. Pero la disciplina de ingeniería se mantiene casi intacta: propiedad clara, contratos explícitos, responsabilidades delimitadas, llamadas observables, interfaces versionadas, reintentos, timeouts y aislamiento de fallas.

Este enfoque es útil porque aleja el diseño de agents de “un gran asistente” y lo orienta hacia un sistema de pequeñas capabilities invocables.

![Agents as services call flow](../public/diagrams/agents-as-services-call-flow.svg)

La restricción importante es que el model permanece detrás del límite del servicio. El servicio es dueño de la identidad, contract, policy, state, budget, tools, observability y la semántica de fallas. El model aporta juicio dentro de ese límite.

El contract de un agent service debe parecerse más a una API que a una transcripción de chat:

```ts
type AgentServiceRequest = {
  traceId: string;
  taskId: string;
  idempotencyKey: string;
  caller: {
    subject: string;
    tenantId: string;
    serviceId: string;
  };
  capability: 'review_pull_request' | 'investigate_refund' | 'summarize_policy';
  input: unknown;
  contextRefs: string[];
  auth: {
    audience: string;
    scopes: string[];
  };
  budget: {
    maxSteps: number;
    maxToolCalls: number;
    maxCostCents: number;
    timeoutMs: number;
  };
};

type AgentServiceResponse = {
  traceId: string;
  taskId: string;
  status: 'succeeded' | 'refused' | 'needs_human' | 'failed';
  output?: unknown;
  evidenceRefs: string[];
  stopReason: string;
  policyDecision?: 'allow' | 'deny' | 'require_approval' | 'escalate';
  costCents?: number;
};
```

El lenguaje natural aún puede aparecer dentro de `input` o `output`, pero el límite del servicio sigue siendo tipado.

## La analogía

En una arquitectura de microservices, un servicio es dueño de una capability de negocio delimitada. En una arquitectura de agents, un agent debe ser dueño de una capability cognitiva u operativa delimitada. El vocabulario se traslada de forma clara.

| Microservice Idea | Agent Equivalent |
| --- | --- |
| Service boundary | Agent capability boundary. |
| API contract | Task schema, tool contract, o A2A message schema. |
| REST o gRPC | MCP, A2A, workflow events, queues o llamadas internas tipadas. |
| Service discovery | Capability discovery y agent registry. |
| Auth and authorization | Caller identity, tool scope, policy checks. |
| Request ID | Run ID, task ID, trace ID, correlation ID. |
| Timeout and retry | Budget, stop condition, idempotency, replay. |
| Circuit breaker | Disable agent, tool, route o model path. |
| Observability | Model spans, tool spans, state transitions, cost, latency. |
| Contract testing | Schema tests, workflow evals, mocked tools, regression cases. |

El protocolo cambia; la disciplina arquitectónica no. La misma lógica se extiende al context. Un servicio no recibe todas las tablas de la base de datos solo porque podría necesitar una fila, y un agent no debe recibir toda la memory, resultados de tools, archivos y mensajes previos solo porque podría necesitar un dato. Cada agent service debe recibir un conjunto de trabajo que coincida con su contract.

## Service Contract

Cada agent service debe publicar un contract que indique qué posee y cómo puede ser invocado.

```ts
type AgentServiceContract = {
  name: string;
  owner: string;
  version: string;
  capabilities: string[];
  protocols: Array<'REST' | 'gRPC' | 'MCP' | 'A2A' | 'queue' | 'workflow'>;
  inputSchema: string;
  outputSchema: string;
  allowedTools: string[];
  requiredScopes: string[];
  policyVersion: string;
  budgetPolicyVersion: string;
  timeoutMs: number;
  lifecycle: Array<'accepted' | 'progress' | 'refused' | 'needs_human' | 'failed' | 'succeeded'>;
  evalSuite: string;
};
```

Este contract debe revisarse como una API. Si el agent cambia sus tools permitidas, output schema, model route, memory policy, budget, comportamiento de aprobación o semántica de rechazo, eso es un cambio de contract.

## Agent Boundaries

Un agent-as-service debe tener un trabajo específico. Los buenos ejemplos comparten un alcance reducido: un policy-answer agent que responde solo de fuentes de policy aprobadas, un refund-investigation agent que recopila evidencia pero no puede emitir dinero, un code-review agent que comenta en un pull request pero no puede hacer merge, un research agent que devuelve hallazgos citados pero no puede enviar correos, un planner agent que descompone trabajo pero no puede ejecutar tools.

Los ejemplos débiles comparten el rasgo opuesto, que es la dispersión: un general operations agent con acceso a todos los sistemas, un support agent que puede leer datos de clientes y navegar páginas arbitrarias y enviar correos directamente, un coding agent que puede editar, probar, desplegar y rotar credenciales en un solo loop, o un grupo multi-agent donde cada agent ve el mismo context y lista de tools. Un buen boundary define qué posee el agent, qué puede ver, qué puede invocar, qué puede cambiar y qué debe devolver.

## Communication Protocols

Los agents pueden comunicarse usando los mismos patrones arquitectónicos que cualquier sistema distribuido, aunque el transporte varíe. REST funciona cuando un service boundary determinista es suficiente; gRPC cuando importan contratos estrictos y baja latencia; MCP cuando el límite es un tool o capability expuesto mediante manifests y llamadas tipadas; A2A cuando un agent llama a otro como colaborador; queues o event streams cuando el trabajo es asíncrono; y motores de workflow durables cuando el state, los reintentos y las aprobaciones importan. Usar estos patrones no es un anti-pattern. El anti-pattern es pretender que los mensajes en lenguaje natural eliminan la necesidad de contracts.

Cuando un agent llama a otro, la llamada aún necesita caller identity, capability discovery, un input schema y un output schema, un timeout, cancelación, rechazo, progreso, semántica de error, correlación de trace, una decisión de policy y reglas de retry e idempotency. El lenguaje natural puede ser parte del payload. No debe ser todo el protocolo.

| Protocol Shape | Use It When |
| --- | --- |
| REST | El agent service se comporta como una capability de request-response con necesidades de ciclo de vida simples. |
| gRPC | Schemas fuertes, baja latencia y streaming son más importantes que la interoperabilidad amplia. |
| MCP | El límite es un tool o capability expuesto a agents mediante manifests y llamadas tipadas. |
| A2A | Un agent delimitado delega trabajo a otro agent delimitado con eventos de ciclo de vida. |
| Queue o event stream | El trabajo es asíncrono, por ráfagas, o debe sobrevivir desconexiones del caller. |
| Durable workflow | Importan el state, reintentos, esperas de aprobación, compensación y ejecución de larga duración. |

El transporte no decide la seguridad. El runtime contract sí.

## Synchronous And Asynchronous Calls

Algunas llamadas de agents son request-response; otras son jobs. Usa una llamada síncrona cuando el task es corto, el resultado es pequeño, el fallo es fácil de devolver, no se necesita aprobación humana y los reintentos son seguros y acotados. Prefiere una llamada asíncrona cuando el task es de larga duración, cuando el agent puede necesitar tools, reintentos o espera, cuando importan el progreso y la cancelación, cuando la aprobación humana puede pausar la ejecución, cuando los resultados parciales deben ser inspeccionables o cuando el caller no debe mantener una conexión abierta. En la práctica, muchas interacciones entre agents deben parecerse menos a una llamada de función y más a un paso de workflow con un task ID.

## State Ownership

Los microservices fallan cuando la propiedad del state no está clara, y los agents fallan de la misma manera. Para cada agent, define qué state posee, qué puede leer, qué puede escribir, qué pertenece al caller, qué pertenece a un workflow engine, qué es solo context temporal y qué es memory durable. No permitas que cada agent escriba en la memory compartida por defecto. Eso es la versión agent de una base de datos compartida sin modelo de propiedad, y se degrada igual de rápido.

Para cada campo de state, decide si es caller-owned, agent-owned, workflow-owned, memory-owned o derivado. Un refund investigation agent puede ser dueño de las notas de investigación de esta ejecución, pero no del payment ledger. Un code review agent puede ser dueño de los comentarios de revisión, pero no de la decisión de merge. Un planner puede ser dueño de un plan propuesto, pero no del execution state de cada worker.

## Seguridad e Identidad

No se debe confiar en un agent service solo porque tiene un nombre amigable. Se debe confiar porque el runtime verifica identidad, autorización, policy y alcance.

Los controles a nivel de servicio incluyen:

- TLS para comunicación remota;
- mTLS donde se requiere identidad de servicio;
- verificaciones de audiencia y alcance con OAuth u OIDC;
- identidad de tenant y caller en el contrato de la solicitud;
- verificaciones de policy antes de llamadas a tools, escrituras en memory y comunicación externa;
- credenciales con alcance inyectadas solo después de la autorización;
- denegación, aprobación, rechazo y escalamiento como resultados válidos del servicio;
- traces redactados para decisiones de identidad, policy y tool.

Si un agent service llama a otro agent service, ambos lados necesitan la misma disciplina. El caller no debe enviar credenciales ambientales. El callee no debe confiar en afirmaciones en lenguaje natural sobre identidad o permisos.

## Versionado y Despliegue

Los agent services necesitan versionado más allá de la forma del endpoint.

Versiona:

- schemas de entrada y salida;
- conjuntos de prompt e instrucciones;
- ruta del model;
- manifiesto de tools;
- versión de policy;
- policy de presupuesto;
- reglas de memory;
- suite de eval;
- comportamiento de rechazo y aprobación.

Despliega cambios como lo harías con cambios de servicios: canary, compara traces, monitorea costo y latencia, observa denegaciones de policy y overrides humanos, y mantén rutas de rollback para prompts, tools, rutas de model y reglas de policy.

## Vertical Slice: Refund Investigation Agent

Un ejemplo útil de agent service no es un chatbot. Es una capability limitada con un contrato, un loop, límites de tools, evals y telemetría.

Imagina un agent `refund_investigation` usado por una plataforma de soporte. Su trabajo es recopilar evidencia y recomendar una decisión. No puede emitir dinero, cambiar una orden ni enviar correos al cliente. Esos son servicios separados con reglas más estrictas de autorización y aprobación.

El límite del servicio podría verse así:

```ts
type RefundInvestigationRequest = {
  taskId: string;
  caller: 'support_case_service';
  customerId: string;
  orderId: string;
  caseId: string;
  reason: 'missing_item' | 'damaged_item' | 'late_delivery' | 'duplicate_charge';
  requestedAmountCents: number;
  contextRefs: string[];
  budget: {
    maxSteps: number;
    maxToolCalls: number;
    timeoutMs: number;
  };
};

type RefundInvestigationResult = {
  taskId: string;
  status: 'succeeded' | 'needs_human' | 'refused' | 'failed';
  recommendation?: 'approve' | 'deny' | 'partial_refund' | 'needs_human';
  recommendedAmountCents?: number;
  rationale: string;
  evidenceRefs: string[];
  policyRefs: string[];
  traceId: string;
  stopReason: 'completed' | 'budget_exhausted' | 'missing_evidence' | 'policy_boundary';
};
```

El límite de tools es deliberadamente más estrecho que el proceso de negocio:

```ts
const refundInvestigationTools = {
  allowed: [
    'orders.read_order',
    'payments.read_charge',
    'shipping.read_delivery_status',
    'support.read_case_notes',
    'policy.search_refund_policy',
    'refunds.draft_refund_request'
  ],
  forbidden: [
    'refunds.issue_refund',
    'support.send_customer_email',
    'orders.cancel_order',
    'payments.modify_charge'
  ]
};
```

Esa lista de tools es la arquitectura. Define qué puede saber el agent y qué puede causar. El agent puede redactar una solicitud de reembolso, pero un humano o un workflow respaldado por policy debe aprobar el efecto secundario real.

Un loop mínimo puede mantenerse simple:

```ts
async function runRefundInvestigation(req: RefundInvestigationRequest) {
  const run = startTrace(req.taskId, 'refund_investigation');
  const state = {
    evidence: [],
    policyRefs: [],
    stepsRemaining: req.budget.maxSteps,
    toolCallsRemaining: req.budget.maxToolCalls
  };

  while (state.stepsRemaining > 0 && state.toolCallsRemaining > 0) {
    const next = await decideNextStep(req, state);

    if (next.type === 'final') {
      return validateResult(next.result);
    }

    if (!isAllowedTool(next.toolName, refundInvestigationTools.allowed)) {
      recordPolicyDenial(run.traceId, next.toolName);
      return needsHuman(req.taskId, run.traceId, 'policy_boundary');
    }

    const observation = await callTool(next.toolName, next.args, {
      traceId: run.traceId,
      idempotencyKey: `${req.taskId}:${next.toolName}:${state.stepsRemaining}`
    });

    state.evidence.push(observation);
    state.stepsRemaining -= 1;
    state.toolCallsRemaining -= 1;
  }

  return needsHuman(req.taskId, run.traceId, 'budget_exhausted');
}
```

El punto no es esta implementación exacta. El punto es la forma: loop limitado, entradas tipadas, salidas tipadas, policy explícita de tools, idempotencia, correlación de traces y una detención segura cuando el agent no puede terminar.

Los evals deben probar el límite del servicio, no solo la redacción final:

| Eval Case | Qué Prueba |
| --- | --- |
| Artículo dañado con policy y evidencia de entrega coincidente. | El agent recomienda un monto de reembolso válido con evidencia citada. |
| Cargo duplicado donde falta información de pago. | El agent devuelve `needs_human` en vez de adivinar. |
| El cliente pide al agent emitir el reembolso directamente. | El agent no llama a `refunds.issue_refund`. |
| Búsqueda de policy devuelve texto irrelevante. | El agent rechaza o pide revisión humana en vez de citar evidencia débil. |
| Timeout de tool durante la consulta de envío. | El agent se detiene dentro del presupuesto y reporta la evidencia faltante. |

La telemetría debe hacer que cada ejecución sea depurable:

```json
{
  "trace_id": "tr_7429",
  "task_id": "refund_case_1882",
  "agent": "refund_investigation",
  "contract_version": "refund-investigation.v1",
  "model": "review-route-a",
  "status": "needs_human",
  "stop_reason": "missing_evidence",
  "tool_calls": 4,
  "policy_denials": 0,
  "latency_ms": 12840,
  "cost_cents": 6,
  "eval_tags": ["refunds", "missing_evidence", "tool_using_agent"]
}
```

Este es el valor práctico de tratar a los agents como servicios. El agent no es solo "un LLM con tools". Es un servicio con una superficie de autoridad restringida, un runtime observable y pruebas que protegen el límite.

## Contratos y Evals

Los contratos de agents necesitan pruebas en varios niveles: validación de schema para entradas y salidas, pruebas de tools simulados para trayectorias seguras, pruebas de rechazo para tasks no soportadas, pruebas de autorización para llamadas prohibidas, evals de regresión para modos de falla conocidos, pruebas de replay desde traces de producción y pruebas de contrato entre el caller y un agent remoto. Para un agent service, los evals cumplen el rol que las pruebas de contrato y de comportamiento cumplen para un microservicio. Prueban no solo que el endpoint responde, sino que el agent se mantiene dentro de su límite.

Los evals de servicio deben incluir:

| Eval Case | Qué Protege |
| --- | --- |
| Solicitud válida con evidencia esperada. | El agent completa dentro del contrato. |
| Capability no soportada. | El agent rechaza en vez de improvisar. |
| Falta de alcance o audiencia incorrecta. | El servicio niega antes de ejecutar. |
| Propuesta de tool prohibida. | El límite de policy bloquea efectos secundarios. |
| Presupuesto agotado. | El servicio se detiene o pide aprobación con una razón clara. |
| Evolución de schema. | Los callers existentes siguen funcionando o fallan explícitamente. |
| Replay de incidente en producción. | Las fallas conocidas permanecen corregidas. |

## Patrones de Confiabilidad

El toolkit de confiabilidad de microservicios sigue aplicando: timeouts, reintentos con claves de idempotencia, circuit breakers, bulkheads, límites de tasa, rutas de fallback, colas dead-letter, health checks, contratos versionados, canary rollout, rollback y correlación de traces. Adapta el significado a agents. Un health check puede verificar disponibilidad del model, disponibilidad de tools, configuración de policy, frescura del índice de memory y estado de eval. Un circuit breaker puede deshabilitar un tool específico, versión de prompt, ruta de model o capability del agent.

La observabilidad debe hacer visible el límite del servicio:

- request ID, task ID, trace ID y clave de idempotencia;
- caller, tenant, subject, identidad de servicio, audiencia y scopes después de la redacción;
- versión de contrato, versión de prompt, ruta de model, versión de policy y versión de policy de presupuesto;
- llamadas a tools, lecturas y escrituras en memory, evidencia de retrieval, aprobaciones y decisiones de policy;
- eventos de progreso, rechazo, timeout, cancelación, fallback, escalamiento y razón de detención;
- costo, latencia, reintentos y etiquetas de eval.

Si el caller solo ve una respuesta final, el agent service está subinstrumentado.

## Dónde Se Rompe La Analogía

Los agents no son servicios normales, y la analogía se rompe en aspectos importantes. Las salidas son probabilísticas. El model puede ser influenciado por context no confiable. La selección de tools puede ser dinámica. Una sola ejecución puede ocultar muchas decisiones intermedias. El comportamiento puede cambiar cuando cambian el model, prompt, lista de tools, memory o context. Y los contratos en lenguaje natural siguen siendo ambiguos a menos que los respalden schemas y evals. Así que no copies la arquitectura de microservicios ciegamente. Úsala como disciplina de ingeniería y luego agrega los controles específicos de agents: límites de context, policy de tools, gobernanza de memory, evals de trayectoria y puertas de aprobación.

## Lista de verificación de diseño

Antes de tratar un agent como un servicio, responde:

- ¿Qué capability posee este agent?
- ¿Quién es dueño de su contrato?
- ¿Qué protocolo se usa para llamarlo?
- ¿La llamada es síncrona, asíncrona o respaldada por un workflow?
- ¿Qué input schema acepta?
- ¿Qué output schema retorna?
- ¿Cuáles son los refusal y error states válidos?
- ¿Qué tools puede invocar?
- ¿Qué state puede leer o escribir?
- ¿Qué scopes y credenciales requiere?
- ¿Qué versiones de policy y presupuesto aplican?
- ¿Qué policy checks ocurren antes de usar un tool?
- ¿Qué reglas de timeout, retry y cancelación aplican?
- ¿Cómo se correlacionan los traces entre agents?
- ¿Cómo se versionan los cambios de contrato?
- ¿Qué evals prueban que el boundary sigue vigente?
- ¿Cómo se puede deshabilitar, hacer rollback o redirigir el servicio?

Si faltan estas respuestas, no tienes un agent service. Tienes una dependencia con forma de agent.

## Capítulos relacionados

- [Agentic System Architecture](./agentic-system-architecture)
- [Pattern Evaluation Checklist](../pattern-selection/pattern-evaluation-checklist)
- [Pattern Composition Playbook](../pattern-selection/pattern-composition-playbook)
- [Choosing Multi-Agent Topology](../multi-agent-systems/choosing-multi-agent-topology)
- [A2A Agent Interoperability](../tools-skills-protocols/a2a-agent-interoperability)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Production Runtime Overview](../production-runtime/overview)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Cost Controls and Runtime Budgets](../production-runtime/cost-controls-runtime-budgets)
- [Coding Agents](./coding-agents)
- [Secure Agent Communication](../tools-skills-protocols/secure-agent-communication)
- [Durable Workflows](../production-runtime/durable-workflows)
- [Observability and Evals](../production-runtime/observability-and-evals)
