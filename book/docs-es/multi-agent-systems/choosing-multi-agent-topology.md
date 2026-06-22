---
title: Choosing Multi-Agent Topology
---

# Choosing Multi-Agent Topology

No comiences un diseño preguntando cuántos agents necesitas.

Comienza preguntando dónde el trabajo requiere context separado, tools separadas, autoridad separada, tiempos separados o accountability separada. Si esos límites son reales, múltiples agents pueden ayudar. Si esos límites no son reales, múltiples agents usualmente agregan costo, latencia y modos de falla.

El diseño multi-agent no se trata de hacer que el sistema parezca más inteligente. Se trata de crear límites útiles.

![Multi-agent topology selection](../public/diagrams/multi-agent-topology-selection.svg)

La opción predeterminada debe seguir siendo conservadora. El diseño multi-agent es una decisión de coordinación, no una mejora de inteligencia. Cada agent adicional agrega superficie de protocolo, selección de context, permisos de tools, traces, latencia, costo, modos de falla y preguntas sobre ownership. Agrega un agent solo cuando el límite que crea vale ese costo.

## Primera regla

Usa la topología más pequeña que te dé el límite que necesitas.

Muchos sistemas no necesitan múltiples agents. Necesitan:

- un workflow determinista;
- un agent loop con mejores tools;
- ruteo entre workflows;
- un paso de revisión;
- mejor gestión de context;
- mejores evals;
- mejor observability.

Múltiples agents se justifican cuando un solo agent tendría que manejar demasiado context, demasiada autoridad, demasiadas tools o demasiadas responsabilidades en conflicto.

## Cuándo dividir agents

Divide agents por razones de ingeniería, no porque el problema suene complejo.

Buenas razones para dividir:

- **Ownership:** diferentes equipos son dueños de diferentes capabilities, policies, releases o incidents.
- **Context:** cada parte necesita un conjunto de trabajo diferente y no debería ver todo.
- **Authority:** una parte puede leer datos, otra puede redactar acciones y otra puede aprobar efectos secundarios.
- **Tools:** los sets de tools son lo suficientemente diferentes como para que compartirlos aumente el riesgo.
- **Timing:** parte del trabajo es interactivo, parte es asíncrono y parte espera aprobación.
- **Scaling:** una capability necesita diferente despliegue, latencia, costo o ruteo de model.
- **Evaluation:** cada capability puede ser probada con sus propios fixtures y criterios de aceptación.

Malas razones para dividir:

- el prompt de un solo agent es desordenado;
- el equipo espera que más agents compensen metas poco claras;
- cada agent recibirá el mismo context y tools;
- nadie puede definir el contrato de handoff;
- la merge policy es "el model lo resolverá";
- no hay trace a través de los handoffs.

Si la división no crea un límite más claro, probablemente está ocultando una arquitectura débil.

## Matriz de decisión de topología

| Situación | Preferir | Evitar |
| --- | --- | --- |
| Secuencia conocida con reglas claras | Workflow determinista | Multi-agent chat. |
| Una task necesita descomposición especializada | Task delegation | Un agent general con un prompt gigante. |
| Un owner central debe controlar calidad y fusionar resultados | Supervisor-worker | Agents pares sin owner final. |
| Trabajo independiente puede ejecutarse en paralelo | Parallel agents | Cadenas de agents secuenciales que desperdician tiempo. |
| El output mejora con crítica o comparación | Debate y consenso | Votación sin evidencia o pruebas. |
| El state del workflow importa más que la charla entre agents | Flow con crews | Crew como sustituto de diseño de state. |
| Agents cruzan límites de equipo, runtime o confianza | Agents como servicios sobre A2A, MCP, eventos o workflows | Handoffs en lenguaje natural no estructurado. |
| Agents necesitan coordinación asíncrona en el tiempo | Board, queue, durable workflow o task ledger | Ventanas de context compartido y copy-paste manual. |

La topología correcta suele ser aburrida. Eso es una ventaja.

| Topología | Mejor para | Costo principal | Control requerido |
| --- | --- | --- | --- |
| Single agent | Una task acotada con una superficie de tool/policy. | Especialización limitada. | State fuerte en el loop, presupuesto y policy de tools. |
| Workflow con pasos de agent | Proceso conocido con subpasos inciertos. | Esfuerzo de diseño de workflow. | State durable y transiciones explícitas. |
| Supervisor-worker | Trabajo especializado con un owner final. | Complejidad de coordinación y merge. | Asignaciones tipadas y puerta de merge. |
| Parallel agents | Trabajo independiente que se beneficia de concurrencia. | Mayor gasto y volumen de traces. | Reductor de fan-in y evidencia por worker. |
| Debate o consenso | Juicio ambiguo que mejora con crítica. | Latencia y falsa confianza. | Juez con evidencia y owner responsable. |
| Agents como servicios | Límites de equipo, runtime, seguridad o despliegue. | Contratos de servicio y versionado. | Contrato API/A2A/MCP, auth, ownership, evals. |
| A2A interoperability | Colaboración remota de agents a través de límites. | Complejidad de protocolo y ciclo de vida. | Envelope de mensajes, scopes, idempotencia, traces. |

Un selector de topología debe codificar el mismo sesgo:

```ts
interface WorkloadShape {
  knownSequence: boolean;
  independentSubtasks: boolean;
  needsSpecialists: boolean;
  needsCentralAcceptance: boolean;
  benefitsFromCritique: boolean;
  crossesTrustBoundary: boolean;
}

function chooseTopology(workload: WorkloadShape) {
  if (workload.knownSequence && !workload.needsSpecialists) {
    return 'deterministic_workflow';
  }

  if (workload.crossesTrustBoundary) {
    return 'agents_as_services';
  }

  if (workload.independentSubtasks && workload.needsCentralAcceptance) {
    return 'supervisor_worker';
  }

  if (workload.independentSubtasks) {
    return 'parallel_agents';
  }

  if (workload.benefitsFromCritique) {
    return 'debate_and_consensus';
  }

  return 'single_agent_or_workflow';
}
```

El punto no es automatizar la arquitectura. El punto es hacer que los criterios de selección sean lo suficientemente visibles como para debatirlos.

## Contrato de topología

Antes de implementar, escribe el contrato de topología. Puede ser ligero, pero debe ser explícito:

```ts
type TopologyContract = {
  topology:
    | 'single_agent'
    | 'workflow_with_agent_steps'
    | 'supervisor_worker'
    | 'parallel_agents'
    | 'debate_consensus'
    | 'agents_as_services'
    | 'a2a_interoperability';
  owner: string;
  reasonForSplit: string;
  agents: Array<{
    name: string;
    capability: string;
    ownsState: string[];
    allowedTools: string[];
    forbiddenTools: string[];
    contextRefs: string[];
    requiredScopes: string[];
  }>;
  handoffContract: {
    protocol: 'internal_call' | 'REST' | 'gRPC' | 'MCP' | 'A2A' | 'queue' | 'workflow';
    inputSchema: string;
    outputSchema: string;
    timeoutMs: number;
    idempotencyRequired: boolean;
  };
  evaluation: {
    baseline: 'single_agent' | 'deterministic_workflow';
    successMetrics: string[];
    coordinationMetrics: string[];
  };
};
```

El contrato obliga a la pregunta clave: ¿qué aporta la topología que un diseño más simple no?

## Declara la topología antes de codificarla

Un agentic system multi-agent debe tener una topología visible antes de tener integración con framework. Escribe:

- agents y sus responsabilidades;
- rutas de comunicación permitidas;
- puntos de fan-out y fan-in;
- puertas y límites de aprobación;
- state compartido y state privado;
- comportamiento ante fallas y cancelaciones.

Esto puede ser un diagrama, una tabla o un archivo declarativo pequeño. La propiedad importante es la revisabilidad: un lector debe entender el grafo de agents sin tener que hacer ingeniería inversa de callbacks y prompts.

## Workflow determinista primero

Si el código puede controlar la secuencia, deja que el código controle la secuencia.

Usa un workflow determinista cuando:

- los pasos son conocidos;
- las reglas de ramificación son claras;
- la corrección depende de policy o reglas de negocio;
- las transiciones de state deben ser auditables;
- la latencia y el costo importan;
- la aprobación humana debe pausar el proceso.

El model aún puede ser útil dentro del workflow. Puede clasificar, extraer, resumir, redactar, rankear o criticar. Pero el workflow es dueño del camino.

## Task Delegation

Usa task delegation cuando el trabajo se descompone en subtasks acotadas.

Una buena delegación tiene:

- contratos claros de subtask;
- context acotado para cada worker;
- forma de output esperada;
- criterios de aceptación;
- un owner para el merge final;
- evals que prueban que la descomposición ayuda.

Una mala delegación es simplemente pedirle a varios agents que "trabajen en esto" y esperar que la respuesta combinada sea mejor.

## Supervisor-Worker

Usa supervisor-worker cuando un agent central o workflow debe ser dueño del goal, state, ruteo y aceptación final.

Esta topología es útil cuando:

- los workers tienen diferentes tools o context;
- el supervisor puede evaluar los outputs de los workers;
- hay una sola respuesta final responsable;
- algunas fallas de workers no deberían fallar toda la task;
- los workers no deben ver el context completo de los demás.

El supervisor no debe convertirse en un god agent oculto. Debe ser dueño de la coordinación, no de cada detalle de la ejecución.

## Parallel Agents

Usa parallel agents cuando el trabajo es independiente y la merge policy es clara.

Buenos casos:

- buscar en múltiples fuentes;
- generar varios candidate plans;
- revisar el mismo artifact desde diferentes perspectivas;
- ejecutar chequeos separados como seguridad, corrección y estilo;
- comparar outputs de diferentes models o prompts.

El paralelismo no es gratis. Aumenta el costo, el volumen de traces y la complejidad de merge. Úsalo cuando reduzca la latencia, mejore la calidad o cubra aspectos independientes.

## Debate y Consenso

Usa debate o consenso cuando la crítica independiente mejora el juicio.

Es útil para:

- decisiones ambiguas;
- revisiones de diseño;
- análisis de riesgos;
- comparar candidate answers;
- exponer supuestos débiles.

Es débil para:

- preguntas fácticas que requieren retrieval;
- decisiones de tools que requieren policy;
- tasks donde cada agent comparte el mismo punto ciego;
- acciones de alto riesgo donde la votación reemplaza la autoridad.

El consenso no es prueba. Es una señal que aún necesita evidencia, pruebas o un responsable.

## Crews y Flows

Usa crews dentro de flows cuando el workflow necesita state explícito y un grupo de agents especializados realiza un paso delimitado.

El flow debe ser dueño de:

- state;
- orden de eventos;
- reintentos;
- aprobaciones;
- persistencia;
- condiciones de detención.

El crew debe ser dueño de:

- colaboración local;
- roles especialistas;
- output delimitado para un paso del workflow.

Si el chat local del crew se convierte en la state machine, la arquitectura es débil.

## Agents Como Servicios

Cuando los agents cruzan procesos, equipos, runtimes, proveedores o límites de confianza, trátalos como servicios.

Eso significa:

- contrato de capability explícito;
- request y response tipados;
- autenticación;
- autorización;
- timeouts;
- idempotency;
- semántica de rechazo;
- cancelación;
- correlación de traces;
- versionado;
- contract tests.

El protocolo puede ser A2A, MCP, REST, gRPC, event streams o un motor de durable workflow. Lo importante no es la marca del protocolo. Lo importante es que el límite sea explícito y testeable.

Aquí es donde la analogía de microservices es útil. Separar agents es razonable cuando crea ownership, contratos, despliegue, seguridad, escalabilidad y observability más claros. No es razonable cuando solo convierte un agent vago en varios agents vagos.

Usa comunicación A2A o estilo servicio cuando el agent remoto tiene su propio ciclo de vida: capability discovery, autorización, progreso, rechazo, cancelación, versionado y ownership de traces. Usa MCP cuando el límite es principalmente un tool o capability. Usa workflows cuando el state y las aprobaciones importan más que la mensajería directa agent-to-agent.

## Coordinación con Board, Queue o Ledger

Algunos trabajos multi-agent no deben coordinarse por chat directo.

Usa un board, queue, task ledger o durable workflow cuando:

- el trabajo ocurre de forma asíncrona;
- humanos y agents participan;
- las decisiones deben quedar ligadas a los work items;
- los agents corren en sesiones separadas;
- el progreso debe sobrevivir reinicios;
- los handoffs necesitan historial de auditoría.

Esto es especialmente útil para coding agents, operations agents, pipelines de investigación y workflows de revisión de larga duración.

## Shared State

Shared state es donde los sistemas multi-agent suelen fallar.

Evita:

- que cada agent escriba en la misma memory;
- scratchpads compartidos ocultos;
- resúmenes sin versionar;
- agents sobrescribiendo conclusiones de otros;
- state almacenado solo en el historial de conversación.

Prefiere:

- un dueño para cada objeto de state;
- task logs solo de append;
- pasos de merge explícitos;
- workflow state durable;
- artifacts tipados;
- registros de handoff legibles por humanos;
- trace IDs entre agents.

Si el shared state no es claro, la topología no está lista.

## Handoffs y Ownership

Cada handoff debe responder tres preguntas:

1. ¿Quién es dueño del task ahora?
2. ¿Qué exactamente se transfirió?
3. ¿Qué condición devuelve el ownership, escala o detiene la ejecución?

Sin ownership, los sistemas multi-agent se vuelven ambigüedad distribuida. Un worker solo es útil si el caller sabe qué aceptó, rechazó, completó o no pudo decidir el worker. Eso significa que los handoffs necesitan schemas, valores de status, razones de detención y traces.

## Guía de Evaluación

Un sistema multi-agent debe superar una baseline más simple.

Evalúa:

- baseline de single-agent versus topología multi-agent;
- mejora de calidad;
- costo de latencia;
- costo de tokens y tools;
- precisión de merge;
- manejo de fallas de workers;
- manejo de desacuerdos;
- completitud de traces;
- aislamiento de permisos;
- aislamiento de context;
- responsabilidad final.

Mide la coordinación como un costo de primera clase:

| Métrica | Por qué importa |
| --- | --- |
| Corrección de handoff | Prueba que el trabajo se enruta al agent correcto con el contrato correcto. |
| Overhead de coordinación | Muestra si los agents extra gastan más esfuerzo del que ahorran. |
| Calidad de merge | Prueba que la respuesta final preserva evidencia y desacuerdo. |
| Claridad de ownership | Muestra si las fallas tienen un componente responsable. |
| Completitud de traces | Hace que las fallas distribuidas sean depurables. |
| Aislamiento de tools | Prueba que los agents no pueden usar tools fuera de su rol. |
| Aislamiento de context | Prueba que los agents no reciben context irrelevante o inseguro. |
| Costo y latencia por topología | Muestra si la topología vale la pena operativamente. |

Incluye evals negativas donde el sistema debería elegir una topología más simple. Un buen selector de topología debe saber cuándo no usar múltiples agents.

## Failure Modes

- El diseño multi-agent se usa para ocultar goals poco claros o state débil.
- Cada agent recibe el mismo context, tools, memory y permisos.
- Los workers pueden crear efectos secundarios sin supervisor, policy o chequeos de aprobación.
- Los handoffs son blobs en lenguaje natural sin schema ni owner.
- Los agents delegan tasks de ida y vuelta sin límite de delegación.
- El debate produce acuerdo pero sin evidencia.
- Parallel agents duplican trabajo porque los límites no son claros.
- Agents como servicios no tienen contrato versionado, auth ni regla de idempotency.
- La respuesta final oculta fallas de workers, desacuerdos o evidencia faltante.
- No hay trace que conecte asignaciones, handoffs, outputs de workers, decisiones de merge y razón de detención.

## Lista de Verificación de Diseño

Antes de agregar otro agent, responde:

- ¿Qué límite crea este nuevo agent?
- ¿Necesita context separado?
- ¿Necesita tools separados?
- ¿Necesita permisos separados?
- ¿Necesita temporización independiente?
- ¿Quién es dueño de la aceptación final?
- ¿Cómo se hace el merge de outputs?
- ¿Qué pasa si este agent falla, rechaza o expira?
- ¿Qué state posee?
- ¿Qué context nunca debe ver?
- ¿Qué protocolo o contrato rige el handoff?
- ¿Qué previene loops de delegación?
- ¿Cuál es la baseline más simple?
- ¿Cómo se conectan los traces entre agents?
- ¿Qué eval prueba que esta topología es mejor que la baseline más simple?

Si la única razón para otro agent es "se siente más agentic", no lo agregues.

## Capítulos Relacionados

- [Task Delegation](./task-delegation)
- [Supervisor / Worker](./supervisor-worker)
- [Parallel Agents](./parallel-agents)
- [Debate and Consensus](./debate-and-consensus)
- [CrewAI Flows and Crews](./crewai-flows-and-crews)
- [Agents As Services](../systems-architecture/agents-as-services)
- [Pattern Evaluation Checklist](../pattern-selection/pattern-evaluation-checklist)
- [A2A Agent Interoperability](../tools-skills-protocols/a2a-agent-interoperability)
- [Context Budgets and Working Sets](../foundations/context-budgets-and-working-sets)
- [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development)
- [Production Runtime Overview](../production-runtime/overview)
- [Observability and Evals](../production-runtime/observability-and-evals)
