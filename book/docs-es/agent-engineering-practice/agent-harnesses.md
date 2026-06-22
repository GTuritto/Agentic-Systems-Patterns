---
title: Agent Harnesses
---

# Agent Harnesses

Un agent harness es la capa que rodea el loop. El loop llama al model, lee el state, decide, actúa y se detiene. El harness le da a ese loop un entorno de trabajo utilizable: tools, archivos, memory, skills, permisos, subagents, aprobaciones, traces y recuperación.

Esta es la parte que muchas personas confunden con el agent en sí. No es el agent. Es la shell operativa que hace que el agent sea útil para trabajo real.

El framework puede proveer un harness. El runtime puede alojar un harness. Pero la responsabilidad no desaparece: algo debe decidir qué puede ver el agent, qué puede hacer, qué state sobrevive, qué necesita aprobación, qué se traza y cómo se recupera la ejecución.

Este capítulo se encarga del entorno de trabajo del agent. No se encarga del proveedor del model, el workflow de negocio, la implementación de tools ni las operaciones de producción a nivel de flota. El framework, los servicios de aplicación y el runtime de producción son responsables de esos temas.

Este capítulo viene después del loop porque el loop solo es demasiado pequeño para trabajo real. Úsalo como el puente entre "¿qué está haciendo el agent?" y "¿qué entorno mantiene ese trabajo acotado?". Los siguientes capítulos de producción llevan las mismas ideas de control a runtime, observability y seguridad.

## Qué Deberías Poder Hacer

Después de este capítulo, deberías poder:

- distinguir el agent loop del harness que lo rodea;
- nombrar los controles que un harness debe poseer antes de que el agent pueda hacer trabajo real;
- decidir qué características del harness se necesitan para una capability dada;
- evaluar el comportamiento del harness por separado de la calidad de respuesta del model;
- identificar los valores predeterminados del framework que requieren policy propia del producto.

## Límite del Harness

Usa este diagrama para separar el model loop del entorno que hace que el loop sea seguro y útil. El harness posee los controles alrededor del loop: context, tools, policy, memory, traces, evals, sandboxing y recuperación.

![Agent harness boundary](../public/diagrams/agent-harness-boundary.svg)

## Por Qué Existen los Harnesses

Un agent loop puro es lo suficientemente pequeño como para caber en unas pocas funciones. Las tareas reales necesitan más que eso: un lugar para guardar trabajo intermedio, una forma de cargar solo el context relevante, una manera de llamar tools de forma segura, una forma de dividir el trabajo entre subagents, una forma de pausar para aprobación, una forma de recordar hechos útiles, una forma de recuperarse tras fallas y una forma de inspeccionar lo que sucedió después. Todo eso junto es el harness.

Los coding agents lo hacen obvio. Un coding agent no solo llama a un model. Lee archivos, edita archivos, ejecuta pruebas, rastrea tasks, invoca tools, solicita aprobación, maneja fallas y mantiene un trace de la sesión. El model importa, pero el harness es lo que decide si el trabajo está controlado.

## Harness vs Framework vs Runtime

Los términos se superponen, pero la distinción vale la pena.

| Capa | Trabajo Principal | Ejemplos de Responsabilidad |
| --- | --- | --- |
| Framework | Da abstracciones para construir agents. | Adaptadores de model, llamada de tools, chains, agents, prompts. |
| Runtime | Ejecuta y opera el trabajo del agent. | State durable, retries, streaming, deployment, persistence. |
| Harness | Da al agent un entorno de trabajo. | Archivos, skills, memory, subagents, permisos, aprobaciones, gestión de context. |

Un producto puede usar los tres. Un framework puede incluir un runtime, y un runtime puede incluir características de harness. Los nombres importan menos que las responsabilidades, y la pregunta que corta la superposición es simple: ¿qué capa posee qué control?

Si la respuesta es "el framework lo maneja", sigue preguntando. ¿Qué componente almacena el state? ¿Qué componente aplica el permiso? ¿Qué componente posee las escrituras de memory? ¿Qué componente puede detener un efecto secundario? ¿Qué componente emite el trace? Esas son responsabilidades del harness, ya sea que el código viva en tu aplicación o en un framework.

## Matriz de Responsabilidad del Harness

Usa esta matriz al revisar un framework, SDK o harness personalizado.

| Responsabilidad | Pregunta del Producto | Evidencia del Harness |
| --- | --- | --- |
| Control de context | ¿Qué vio el model en esta llamada? | Context packet, refs omitidas, trust labels. |
| Divulgación de tools | ¿Qué tools eran visibles en este state? | Tool profile por ruta, rol y estado de aprobación. |
| Aplicación de permisos | ¿Por qué se permitió o negó una acción? | Policy decision con actor, target, modo y razón. |
| Acceso a memory | ¿Por qué se leyó o escribió memory? | Memory policy ref, source ref, retención, ruta de eliminación. |
| Vinculación de aprobación | ¿Qué acción exacta aprobó el humano? | Approval ID ligado a tool, args, actor y expiración. |
| Recuperación | ¿Puede esta ejecución reanudarse o reproducirse de forma segura? | Checkpoints, idempotency keys, modo de replay con tools simulados. |
| Observability | ¿Puede un operador reconstruir la ejecución? | Trace events para propuesta, validación, acción, resultado, razón de detención. |

Si el harness no puede producir evidencia para una fila, esa fila sigue siendo un riesgo de diseño, incluso si el demo funciona.

## Capacidades Básicas del Harness

Un harness capaz normalmente expone estas superficies.

| Capability | Qué Hace | Riesgo Principal |
| --- | --- | --- |
| Workspace | Da al agent archivos, artifacts, notas y state temporal. | Fuga de datos sensibles o artifacts obsoletos. |
| Context manager | Selecciona lo que entra al context del model. | Exceso de tokens, evidencia faltante, drift en resúmenes. |
| Tool registry | Expone tools con schemas y descripciones. | Tools demasiado amplios, acciones inseguras, autorización débil. |
| Skill loader | Carga instrucciones procedurales solo cuando se necesitan. | Activación irrelevante o scripts inseguros ocultos. |
| Memory layer | Lee y escribe información durable. | Memory obsoleta, privada o contaminada. |
| Planner | Rastrea tasks, subtasks y progreso. | Los planes se vuelven teatro en vez de control. |
| Subagent manager | Delegar trabajo a contextos aislados. | Fragmentación de traces y propiedad poco clara. |
| Permission gate | Bloquea o pausa acciones riesgosas. | Aprobación solo por prompt o fatiga de aprobación. |
| Sandbox | Contiene acciones de código, navegador, shell o archivos. | Escape, exposición de secretos o acceso de red sin control. |
| Trace surface | Registra decisiones, llamadas a tools, costos y errores. | Logs solo de respuesta final. |
| Recovery controller | Maneja retry, cancelación, replay, fallback y escalamiento. | Efectos secundarios duplicados o progreso perdido. |

No todo agent necesita todas las capabilities. Un clasificador de soporte limitado puede necesitar casi nada de esto; un coding o research agent probablemente necesita la mayoría.

## Contrato del Harness

Un harness debe tener un run context explícito. Este es el objeto, o conjunto de objetos, que evita que el agent loop se convierta en un montón de variables globales.

```ts
type HarnessRunContext = {
  runId: string;
  actorId: string;
  tenantId: string;
  goalId: string;
  autonomyLevel: "advisory" | "drafts_for_review" | "executes_after_approval" | "bounded_autonomous";
  stateRef: string;
  contextPacketId?: string;
  toolProfile: {
    allowedTools: string[];
    writeToolsRequireApproval: boolean;
    egressPolicyRef?: string;
  };
  memoryPolicyRef: string;
  approvalPolicyRef: string;
  budget: {
    maxIterations: number;
    maxCostCents: number;
    deadlineAt?: string;
  };
  traceId: string;
};
```

La forma exacta puede variar, pero el harness debe conocer el actor, tenant, goal, state, tools, memory policy, approval policy, budget y trace antes de que el model proponga la siguiente acción.

El mismo contrato debe hacer posible la cancelación:

```ts
type HarnessStopReason =
  | "success"
  | "blocked"
  | "approval_required"
  | "budget_exhausted"
  | "cancelled"
  | "policy_denied"
  | "tool_failure";
```

Si un harness no puede representar razones de detención, eventualmente convertirá diferentes fallas en el mismo error vago.

## Workspace y Artifacts

Las tareas largas necesitan un workspace, y este se llena rápidamente con archivos proporcionados por el usuario, documentos recuperados, borradores generados, parches de código, planes, notas de tasks, salidas de tools y resultados de evaluación. Nada de eso debe tratarse como un basurero. Los archivos y artifacts necesitan reglas de propiedad, nombres, retención y visibilidad como cualquier otro state.

Un buen diseño de workspace responde algunas preguntas desde el principio: qué puede leer el agent, qué puede escribir, qué puede inspeccionar el usuario, qué es temporal, qué se convierte en state durable y qué nunca debe entrar al context del model. El workspace es parte del modelo de seguridad, no algo separado.

El workspace también necesita reglas de limpieza. Archivos temporales, borradores generados, salidas de tools, documentos descargados y logs no deben acumularse hasta convertirse en memory accidental. Mantén la retención, redacción y eliminación explícitas.

## Gestión de Context

El harness decide qué ve el model, y esa decisión suele ser más importante que el prompt. Un model potente con mal context aún falla; un model más pequeño con un context limpio suele funcionar.

El context manager controla las instrucciones, el goal activo, el state actual, los archivos relevantes, la evidencia recuperada, los tools disponibles, la memory seleccionada, las observaciones recientes, y las reglas de presupuesto y detención. Todo esto debe cargarse de manera deliberada. Poner todo el workspace, la conversación completa, cada tool, toda la memory y todos los documentos recuperados en cada llamada no es context engineering. Es context flooding. Para las reglas operativas detrás de esto, consulta [Context Budgets And Working Sets](../foundations/context-budgets-and-working-sets); un harness debe poder explicar el working set que ensambló para cada llamada al model.

Un buen harness puede responder, para cada llamada al model: qué context packet se ensambló, qué archivos y memories se incluyeron, qué tools se revelaron, qué fuentes se omitieron y por qué.

## Skills y Divulgación Progresiva

Las skills permiten que un harness mantenga pequeño el base agent. Al iniciar, el agent puede ver solo los nombres y descripciones cortas de las skills disponibles. Cuando una se vuelve relevante, el harness carga las instrucciones, referencias, scripts, plantillas o ejemplos más profundos asociados.

Eso es divulgación progresiva, y rinde frutos en el presupuesto de tokens, especialización de dominio, procedimientos administrados por el equipo, trabajo repetible y uso más seguro de tools. Trata las skills como artifacts versionados y probados, no como fragmentos sueltos de prompt. Una skill es código procedimental y documentación que puede cambiar el comportamiento del agent, así que merece la misma disciplina que cualquier otro código.

## Subagents y Aislamiento de Context

Los subagents valen la pena cuando una task se beneficia de un context aislado: cuando el trabajo puede hacerse en paralelo, cuando un especialista necesita instrucciones o tools diferentes, cuando una task no debe contaminar el context principal, o cuando el main agent debe recibir un resumen en vez de cada detalle. No los uses como decoración. Cada subagent agrega costo, latencia, coordinación y complejidad en el trace.

El harness debe hacer visible el trabajo de los subagents: quién delegó la task, qué context se pasó, qué tools estaban disponibles, qué resultado regresó, qué evidencia lo respalda y cómo lo usó el main agent. Si el trabajo de un subagent no puede ser trazado, no puede ser confiable.

Por defecto, los subagents deben heredar menos autoridad, no más. El harness debe pasar un goal delimitado, un context packet delimitado, un perfil de tool delimitado y una relación de trace hacia la ejecución principal.

## Permisos y Aprobaciones

El harness aplica límites de permisos antes de la ejecución. El model puede proponer leer un archivo, llamar una API, ejecutar un comando, enviar un mensaje, actualizar un registro o escribir en la memory. El harness decide si cada una de esas acciones realmente está permitida.

Los buenos sistemas de permisos hacen distinciones que el model no puede hacer por sí mismo: lectura versus escritura, local versus remoto, seguro versus riesgoso, reversible versus irreversible, visible para el usuario versus oculto, barato versus caro, aprobado versus no aprobado. La aprobación debe ser específica. "Permitir tools" es demasiado amplio para significar algo. "Permitir que este agent actualice el ticket `INC-2048` con este resumen" es algo que una persona realmente puede revisar.

La policy del harness puede expresarse como un simple gate:

```ts
interface ToolRequest {
  tool: string;
  mode: 'read' | 'write';
  target: string;
  userVisible: boolean;
}

function authorizeHarnessAction(request: ToolRequest, permissions: HarnessPermissions) {
  if (!permissions.tools.includes(request.tool)) {
    return { allowed: false, reason: 'tool_not_in_profile' };
  }

  if (request.mode === 'write' && !permissions.canWrite) {
    return { allowed: false, reason: 'write_not_allowed' };
  }

  if (request.userVisible && !permissions.hasApproval) {
    return { allowed: false, reason: 'approval_required' };
  }

  return { allowed: true };
}
```

Eso es el harness haciendo su trabajo: la intención del model se convierte en una solicitud verificada antes de que ocurra cualquier cosa.

El mismo pattern debe aplicarse a escrituras en memory, escrituras de archivos, comandos de shell, acciones en el navegador, mensajes externos y handoffs. El model propone. El harness valida. El tool o workflow ejecuta.

## Memory en un Harness

La memory del harness es orquestación, no una nueva taxonomía de memory. El harness decide cuándo leer o escribir el state local de la task, la memory durable, la evidencia recuperada o las skills procedimentales, pero las policies viven en las capas canónicas: [Working Memory](../memory-knowledge/working-memory), [Memory-Augmented Agent](../memory-knowledge/memory-augmented-agent), [Semantic Recall And RAG](../memory-knowledge/semantic-recall-rag) y [Context Engineering](../foundations/context-engineering).

La regla práctica es simple: el acceso a la memory es opt-in por task. No cargues la memory global del usuario, la memory del proyecto, la memory episódica o los documentos recuperados solo porque existen. Cárgalos porque son relevantes, permitidos, suficientemente recientes y corregibles. Escribe en la memory solo mediante eventos explícitos con reglas de fuente, alcance, retención y eliminación.

## Sandboxes

Los harnesses se vuelven críticos para la seguridad en el momento en que exponen ejecución de código, comandos de shell, control del navegador o escrituras en el filesystem. Un sandbox debe controlar el acceso al filesystem, acceso a la red, variables de entorno, secretos, paquetes instalados, tiempo de vida de procesos, acceso al portapapeles y perfil del navegador, y rutas de subida y descarga.

El mejor valor por defecto es el menor privilegio: dale al agent el entorno más restringido que aún le permita completar la task, y amplíalo solo cuando una necesidad específica lo requiera.

## Recuperación y Replay

El harness es responsable de lo que sucede tras una interrupción o falla. Un harness serio puede pausar, cancelar, reintentar, reanudar, hacer replay o escalar sin perder el state.

La recuperación requiere disciplina con los efectos secundarios:

- los reintentos necesitan claves de idempotencia;
- las aprobaciones requieren vinculación exacta a la acción;
- las ediciones de archivos necesitan diffs o snapshots;
- los mensajes externos necesitan registros de envío;
- las escrituras en memory necesitan IDs de escritura;
- las llamadas a tools necesitan IDs de correlación;
- el replay no debe repetir efectos secundarios inseguros.

Un modo de replay debe poder ejecutarse con tools simulados, context packets congelados y salidas del model grabadas al depurar. Así es como los equipos comparan cambios de prompt, model, policy o tool sin volver a emitir reembolsos, reenviar correos o reescribir memory.

## Observabilidad del Harness para Background Agents

Los background agents necesitan un harness que pueda ser inspeccionado después de ejecutarse. Como mínimo, captura:

- la task inicial y los criterios de aceptación;
- archivos, tools y models seleccionados;
- llamadas a tools con entradas, salidas, decisiones de policy y errores;
- checkpoints o resúmenes de handoff tras fases importantes;
- comandos de verificación final y sus resultados.

Sin este registro, un background agent se convierte en un trabajador opaco. Con él, el agent se vuelve infraestructura revisable.

## Evaluación del Harness

Evalúa el harness directamente. Congela o simula la respuesta del model cuando sea posible para que la prueba aísle el comportamiento del harness en lugar de la calidad del model.

- Prueba la selección y exclusión de context.
- Prueba la revelación de tools por ruta y rol.
- Prueba la denegación de permisos antes de la ejecución.
- Prueba las esperas de aprobación y la reanudación.
- Prueba la cancelación antes y durante la ejecución de tools.
- Prueba el reintento con idempotencia.
- Prueba la policy de escritura en memory.
- Prueba la trazabilidad del handoff de subagents.
- Prueba los límites del sandbox.
- Prueba la completitud del trace tras una falla.
- Prueba el replay sin efectos secundarios.

Los evals de harness son distintos de los evals de respuesta. Preguntan si el shell operativo mantuvo el control cuando el model propuso algo riesgoso, incompleto, costoso o incorrecto.

Un fixture de harness debe describir la trayectoria propuesta y los controles que deben mantenerse:

```ts
type HarnessEvalCase = {
  caseId: string;
  proposedActions: Array<{
    tool: string;
    mode: "read" | "write";
    target: string;
  }>;
  expected: {
    disclosedTools: string[];
    deniedTools: string[];
    approvalRequiredFor: string[];
    maxIterations: number;
    maxCostCents: number;
    stopReason: HarnessStopReason;
    requiredTraceEvents: string[];
    repeatedSideEffects: 0;
  };
};
```

Mantén un conjunto pequeño de casos bloqueantes para el harness: revelación prohibida de tools, evasión de permisos, evasión de aprobaciones, context cruzado entre tenants, sobrepaso de presupuesto, cancelación seguida de un efecto secundario, ejecución duplicada tras reintento y replay que llega a un tool de escritura en vivo.

Mide la precisión en la revelación de tools, la corrección en la denegación de permisos, la tasa de evasión de aprobaciones, la tasa de enforcement de presupuesto, la latencia de cancelación, los efectos secundarios duplicados, las violaciones de policy de context, la completitud del trace, el aislamiento en replay y el éxito en la recuperación. Segmenta los resultados por perfil de tool, nivel de autonomía y versión del harness.

Para el contrato de casos de eval compartidos y el método de release-gate, consulta [Evaluation-Driven Agent Development](./evaluation-driven-agent-development).

## Harness Failure Modes

Los harnesses fallan de maneras predecibles. Cada tool está disponible todo el tiempo. Cada archivo entra al context. Las escrituras en memory son invisibles. Los subagents crean trabajo que nadie posee. Las approvals son demasiado amplias. Los límites del sandbox no son claros. Los traces omiten los inputs y outputs de las tools. Las skills se vuelven obsoletas pero siguen cargándose. La compresión del context elimina justo la evidencia que necesitas para depurar el run. Cada uno de estos es una falla de arquitectura, no una falla del model, y por eso un mejor model no te salvará de ellas.

Agrega algunos más a la lista: la cancelación no detiene los side effects en cola, los retries duplican trabajo, los subagents heredan permisos amplios, los defaults del framework habilitan memory silenciosamente, los workspace artifacts se vuelven context oculto, y el replay es imposible porque el harness no guardó context packets ni resultados de tools.

## Design Checklist

Antes de adoptar o construir un harness, pregunta:

1. ¿Qué posee el harness?
2. ¿Qué state persiste?
3. ¿Qué puede ver el model?
4. ¿Qué puede proponer el model?
5. ¿Qué puede ejecutar el harness sin aprobación?
6. ¿Qué tools están delimitadas por rol o task?
7. ¿Qué archivos se pueden leer o escribir?
8. ¿Qué memory se puede escribir?
9. ¿Qué trabajo de subagent es trazable?
10. ¿Qué sucede cuando el run se interrumpe?
11. ¿Qué ve el operador después de una falla?
12. ¿Cómo se puede evaluar un cambio en el harness antes de lanzarlo?
13. ¿Cómo se enlazan en los traces los context packets, tool calls, approvals, memory writes y subagent runs?
14. ¿Cómo hace el harness replay de un run sin repetir side effects?
15. ¿Qué defaults del framework han sido reemplazados por policy propiedad del producto?

Si el harness no puede responder estas preguntas, no está listo para sostener un agent serio.

## Production Checklist

- Define el context de ejecución del harness.
- Mantén goal, state, context, tools, memory, approvals, budget y trace enlazados.
- Divulga las tools progresivamente por ruta y state.
- Haz cumplir los permisos fuera del prompt.
- Ata las approvals a acciones exactas.
- Haz que la cancelación y la pausa sean estados reales del runtime.
- Mantén las escrituras en memory explícitas, delimitadas, revisables y eliminables.
- Delimita los subagents por context, tools y permisos.
- Aísla acciones de alto riesgo con límites en filesystem, network, secrets y procesos.
- Soporta replay con tools simuladas y sin side effects repetidos.
- Evalúa el comportamiento del harness por separado de la calidad de la respuesta final.

## Design Rule

El model aporta el juicio. El harness aporta el control.

Una vez que el contrato del harness es explícito, continúa con [Production Runtime Overview](../production-runtime/overview). Ese capítulo pasa del entorno de trabajo de un agent a colas, despliegues, presupuestos, recuperación y operadores.

## Related Chapters

- [What Is An Agent?](../foundations/what-is-an-agent)
- [Agent Engineer Toolkit](./agent-engineer-toolkit)
- [Framework Selection](./framework-selection)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Context Engineering](../foundations/context-engineering)
- [Context Budgets And Working Sets](../foundations/context-budgets-and-working-sets)
- [Skills](../tools-skills-protocols/skills)
- [Working Memory](../memory-knowledge/working-memory)
- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Evaluation-Driven Agent Development](./evaluation-driven-agent-development)
- [Agent Security and Sandboxing](./agent-security-and-sandboxing)
- [Coding Agents](../systems-architecture/coding-agents)
