---
title: What Is An Agent?
---

# What Is An Agent?

Un agent no es magia. Es un loop con acceso a un model, algo de state, algunas decisiones y, a veces, tools. El loop es lo que importa; todo lo demás es envoltura.

Un framework puede llamarlo graph, crew, swarm, harness, assistant o runtime. Si quitas los nombres, casi siempre encuentras la misma forma debajo: observar, decidir, actuar, volver a observar y, finalmente, detenerse.

Este capítulo define mecánicamente qué es un agent. No define un framework, interfaz de producto, sistema de memory o production runtime. Esas capas rodean el loop, pero no lo reemplazan.

Lee esto antes del catálogo de patterns si quieres primero el modelo básico: un agent es un loop controlado, no una personalidad, una ventana de chat ni una categoría de producto. Después de esto, [Architecture Before Autonomy](../pattern-selection/architecture-before-autonomy) explica cuándo vale la pena usar ese loop.

![Agent loop architecture](../public/diagrams/agent-loop.svg)

## The Minimal Agent

El agent más pequeño y útil necesita un goal o input, instrucciones, context, acceso a un model, un paso de decisión, state, una regla para lo que sucede después y una condición de parada. Las tools son opcionales, pero normalmente son lo que hace que valga la pena construir el agent.

En términos simples, eso es:

```text
input
  -> build context
  -> call model
  -> parse decision
  -> answer, call a tool, ask for help, or stop
  -> update state
  -> repeat if needed
```

La mayor parte de agent engineering consiste en hacer que cada una de esas flechas sea explícita y segura. El diagrama es sencillo. La disciplina está en decidir qué puede hacer el model en cada paso y qué código se reserva para sí mismo.

El loop útil más pequeño se puede esquematizar así:

```ts
type Decision =
  | { kind: 'answer'; text: string }
  | { kind: 'tool'; name: 'lookup_order'; input: { orderId: string } }
  | { kind: 'ask_human'; question: string }
  | { kind: 'stop'; reason: string };

interface AgentState {
  goal: string;
  steps: number;
  observations: unknown[];
  maxSteps: number;
}

function validateDecision(decision: Decision): Decision {
  if (decision.kind !== 'tool') return decision;
  if (!decision.input.orderId.trim()) {
    return { kind: 'stop', reason: 'invalid_tool_input' };
  }
  return decision;
}

async function runAgent(state: AgentState): Promise<Decision> {
  while (state.steps < state.maxSteps) {
    const context = buildWorkingSet(state);
    const proposal = await callModelForDecision(context);
    const decision = validateDecision(proposal);

    if (decision.kind === 'answer' || decision.kind === 'ask_human') {
      return decision;
    }

    if (decision.kind === 'tool') {
      const result = await callApprovedTool(decision.name, decision.input, {
        idempotencyKey: `step:${state.steps}`,
      });
      state.observations.push(result);
      state.steps += 1;
      continue;
    }

    return decision;
  }

  return { kind: 'stop', reason: 'step_budget_exhausted' };
}
```

La parte importante no es la sintaxis. El model propone una decisión, el software la valida antes de ejecutarla, el state registra la observación y el loop se detiene por una razón explícita. La versión completa y ejecutable aparece en [Agent Loop](./agent-loop).

## A Model Call Is Not Yet An Agent

Un model call toma un input y devuelve texto o structured output. Para tareas de resumen, extracción, clasificación o reescritura, eso suele ser suficiente.

Un agent agrega control de flujo alrededor de la llamada. Puede decidir si se necesita más trabajo, si usar una tool, si preguntar a un humano, si reintentar o si detenerse. La diferencia no es inteligencia. Es la forma del runtime.

| System | What It Can Do | Main Risk |
| --- | --- | --- |
| Model call | Produce una respuesta a partir del context proporcionado. | Sin acción ni recuperación. |
| Prompt chain | Avanza por pasos conocidos. | Puertas frágiles y latencia innecesaria. |
| Workflow with LLM steps | El código controla el camino mientras los models manejan el juicio. | Sobreajuste a un proceso fijo. |
| Agent loop | Elige el siguiente paso según las observaciones. | Loops, mal uso de tools y drift oculto del state. |

Así que ten cuidado con la palabra. No toda función respaldada por un model es un agent. Reserva el término para sistemas que pueden tomar al menos algunas decisiones en runtime sobre qué hacer después.

## A Quick Classification Test

Cuando un equipo dice "agent", clasifica el sistema antes de debatir el framework.

| Example | Better Name | Why |
| --- | --- | --- |
| Un botón que reescribe un párrafo una vez. | Model call | No hay loop, uso de tools ni decisión en runtime. |
| Un generador de respuestas de soporte en tres pasos: clasificar, recuperar policy, redactar respuesta. | Prompt chain o workflow | El camino se conoce antes de la ejecución. |
| Un flujo de reembolso donde el código revisa la policy, el model resume la evidencia y la aprobación libera el pago. | Workflow with LLM steps | El código controla el camino y los efectos secundarios. |
| Un asistente de investigación que busca, lee resultados, decide si necesita más retrieval y se detiene cuando la evidencia es suficiente. | Agent loop | El siguiente paso depende de las observaciones del run. |
| Un sistema de entregas con planner, dispatcher, worker de comunicación con el conductor y escalation policy. | Multi-agent system o workflow with agents | El trabajo se divide en roles con context y autoridad separados. |

La clasificación no es cuestión de prestigio. Un model call no es peor que un agent. Un workflow no es menos moderno que un loop. El nombre correcto te dice qué debe probarse, trazarse, asegurarse y operarse.

## Running Example: Refund Support

El asistente de reembolsos de soporte usado en este libro comienza como un workflow, no un agent. El camino conocido es claro: clasificar la solicitud, cargar el pedido, recuperar la refund policy actual, resumir la evidencia, validar la recomendación y solicitar aprobación cuando se puede mover dinero. El código debe controlar ese camino.

La parte agentic aparece solo cuando el workflow enfrenta incertidumbre acotada. Tal vez los datos del pedido entran en conflicto con el registro de entrega. Tal vez el cliente reclama una excepción de policy. Tal vez falta evidencia y el sistema debe decidir si buscar otra fuente, hacer una pregunta aclaratoria o detenerse. Esa investigación limitada puede justificar un loop.

| Part of the refund system | Better shape | Owner |
| --- | --- | --- |
| Intake, búsqueda de cuenta y selección de versión de policy | Deterministic workflow | Application code |
| Resumen de evidencia y borrador de recomendación | Model call o paso de structured-output | El model propone, el código valida |
| Investigación de evidencia faltante o conflictiva | Agent loop con máximo de pasos | Loop runtime |
| Umbral de reembolso, exception policy y requisito de aprobación | Policy gate | Software |
| Ejecución de pago | Tool call después de la aprobación | Tool gateway |

Esta es la disciplina detrás de la palabra "agent". No preguntes si el asistente de reembolsos suena autónomo. Pregunta qué decisión en runtime necesita autonomía, qué efectos secundarios requieren autoridad y qué razón de parada registrará el sistema.

## Decision Trees Come Before Autonomy

Muchos agents útiles son en su mayoría decision trees con model calls dentro. Eso no es una debilidad y, a menudo, es el diseño correcto:

```text
if request is out of scope:
  refuse or redirect
else if account data is missing:
  ask a question
else if policy evidence is missing:
  retrieve documents
else if action is high risk:
  request approval
else:
  call the model to draft the recommendation
```

Esto sigue siendo un agentic system mientras el model tome decisiones acotadas dentro del flujo. Lo que lo mantiene seguro es que el código controla la policy, el state y las transiciones de alto riesgo. Agrega autonomía donde el decision tree se vuelve demasiado grande para mantener, o donde el siguiente paso realmente depende de algo que el run descubre en el camino. Agregarla en otro lugar solo te trae riesgos innecesarios.

## Tools Make The Loop Consequential

Sin tools, un agent solo puede producir texto. Con tools, puede buscar, calcular, recuperar, escribir archivos, navegar, llamar APIs, ejecutar código, enviar mensajes, actualizar tickets o cambiar datos de clientes. Ahí es donde el sistema se vuelve útil, y también donde se vuelve peligroso.

Nunca trates una tool call como "el model lo hizo". El model propuso la llamada; el software la ejecutó. Ese límite es donde vive la mayor parte de tu seguridad, así que debe ser real: los nombres de tools se conocen de antemano, los argumentos tienen tipo, los permisos se revisan antes de ejecutar, existen timeouts, los resultados se registran, los efectos secundarios son auditables y las acciones riesgosas esperan aprobación. Cuanto más poderosa la tool, menos confianza debes dejar en el prompt.

## El State Hace Coherente el Loop

Un agent necesita state porque el loop requiere una memory de su propia ejecución. Como mínimo, el state debe poder responder cuál es el goal activo, qué context se usó, qué ha sucedido, qué tools se invocaron, qué evidence se encontró, qué errores ocurrieron, cuánto budget queda y por qué se detuvo la ejecución.

El historial de conversación no cubre esto. El historial es evidencia de lo que se dijo; no es un modelo de lo que el sistema sabe y ha hecho. El state real es lo que permite que el sistema se reanude después de una interrupción, evite repetir trabajo, explique una decisión después del hecho y convierta un incidente de producción en un caso de eval.

## Las Condiciones de Parada Son Parte del Agent

Un loop sin una condición de parada no es un agent. Es un generador de costos. Las condiciones de parada comunes incluyen que se cumplan los criterios de éxito, que falte un campo requerido, una falla de tool no recuperable, un bloqueo de policy, una aprobación humana pendiente, un límite máximo de iteraciones, un budget de costo o latencia agotado, o que un usuario cancele la ejecución.

Sea cual sea la razón por la que termina la ejecución, el motivo de parada debe ser explícito. "Listo" no es suficiente. Un sistema que vale la pena operar registra si el agent completó, rechazó, escaló, falló, expiró por tiempo o se detuvo porque se agotó el budget, ya que cada uno de esos casos requiere una respuesta diferente de las personas que lo supervisan.

## Qué Aportan los Frameworks

Los frameworks no eliminan el loop. Lo empaquetan y ahorran trabajo real: ejecución de grafos, enrutamiento, registros de tools, adaptadores de model, almacenes de memory, skills, subagents, checkpoints durables, streaming, interrupciones human-in-the-loop, tracing y hooks de despliegue. Nada de eso es esfuerzo desperdiciado, y reconstruir estos elementos básicos a mano rara vez es un buen uso del tiempo del equipo.

Pero el framework no cambia la pregunta que debes responder: ¿qué observa el loop, qué puede decidir, qué puede hacer y cuándo se detiene? Si tu equipo no puede responder eso sin antes nombrar un framework, aún no entiende su propio agent.

## Qué Hace Bueno a un Agent

Un buen agent no es el que tiene más autonomía. Es aquel cuya autonomía es útil y está delimitada. En la práctica, eso significa goals claros, tools limitadas, state explícito, outputs tipados, decisiones visibles, loops acotados, evals que realmente detectan regresiones, modos de falla seguros y escalamiento humano para los casos riesgosos. Los malos agents esconden todo esto dentro de un prompt y esperan que el model se comporte.

La regla de diseño se desprende de todo lo anterior: si no puedes dibujar el loop, los tools, el state y la condición de parada, aún no entiendes el agent y no estás listo para darle autonomía.

Antes de llamar agent a algo, escribe cuatro cosas:

1. La decisión en runtime que se le permite tomar.
2. El state que lee y escribe fuera del context del model.
3. Los tools o efectos secundarios que puede solicitar.
4. Las razones exactas de parada que el sistema registra.

Si falta alguna de esas, probablemente tienes una feature, chain o workflow respaldado por un model que necesita límites más claros antes de necesitar más autonomía.

La siguiente pregunta no es cómo agregar más autonomía. Es si la task necesita un loop en absoluto. Continúa con [Architecture Before Autonomy](../pattern-selection/architecture-before-autonomy), luego regresa a [Agent Loop](./agent-loop) cuando las decisiones en runtime estén justificadas.

## Capítulos Relacionados

- [Architecture Before Autonomy](../pattern-selection/architecture-before-autonomy)
- [Single Agent](./single-agent)
- [Agent Loop](./agent-loop)
- [Goals and State](./goals-and-state)
- [Tool Use](./tool-use)
- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
