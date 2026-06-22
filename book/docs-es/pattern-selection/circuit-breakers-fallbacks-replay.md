---
title: Circuit Breakers, Fallbacks, and Replay
---

# Circuit Breakers, Fallbacks, and Replay

Los agentic systems necesitan controles que detengan el desperdicio, contengan daños y hagan que las fallas sean explicables. Los circuit breakers detienen ejecuciones inseguras o improductivas. Los fallbacks le dan al sistema un siguiente paso más seguro. Replay permite a los ingenieros reconstruir lo que sucedió.

Este es un reliability pattern para agent loops, uso de tools, RAG, orquestación de workflow y multi-agent systems.

![Circuit breakers, fallbacks, and replay flow](../public/diagrams/circuit-breakers-fallbacks-replay.svg)

## Intent

Proteger el sistema de fallas repetidas y hacer que cada ejecución sea lo suficientemente recuperable para depurar.

Un agent no debe seguir llamando al mismo tool que falla, buscando en el mismo corpus vacío, revisando el mismo draft defectuoso o transfiriendo el mismo task entre agents sin progreso.

La idea clave es simple: la autonomía necesita frenos en runtime. Un breaker no es un manejador de errores oculto dentro de un tool wrapper. Es un control arquitectónico que decide cuándo el sistema debe detenerse, degradarse, pedir ayuda o preservar suficiente state para replay.

## Use When

- Los agents pueden llamar tools, APIs, browsers, shells o workflows.
- El trabajo puede hacer loop, reintentar, delegar o esperar.
- Los costos pueden crecer con cada llamada a un model o tool.
- El state parcial importa después de una falla.
- Los operadores necesitan explicar por qué se detuvo una ejecución.

Este pattern es obligatorio para sistemas en producción con efectos secundarios.

## Avoid When

- El task es un prototipo desechable sin efecto externo.
- El sistema no tiene loop, retry ni uso de tools.
- Las fallas no necesitan investigación.

Aun así, mantén un simple run log. El prototipo que funciona a menudo se convierte en la semilla de producción.

## Circuit Breakers

Un circuit breaker convierte una falla repetida o de alto riesgo en una detención, fallback o escalamiento.

| Breaker | Trigger | Action |
| --- | --- | --- |
| Tool failure breaker | El mismo tool falla N veces o retorna output malformado. | Deshabilitar tool para la ejecución y elegir fallback. |
| No-progress breaker | El state no cambia entre iteraciones. | Detener el loop y devolver estado bloqueado. |
| Cost breaker | Se alcanza el presupuesto de tokens, model-call o dinero. | Detener, resumir el progreso y pedir aprobación. |
| Latency breaker | Un paso o ejecución excede el presupuesto de tiempo. | Diferir, encolar o devolver resultado parcial. |
| Retrieval breaker | La búsqueda retorna evidencia de baja cobertura o conflictiva. | Pedir aclaración o escalar. |
| Policy breaker | La intención del tool viola permisos o reglas de riesgo. | Bloquear acción y registrar motivo de policy. |
| Handoff breaker | Los agents rebotan un task entre roles. | Asignar propietario o escalar a humano. |
| Output breaker | La respuesta final falla checks de schema, citation o eval. | Reparar una vez, luego fallar de forma segura. |

Los breakers necesitan nombres y umbrales. "El agent se atascó" no es suficientemente operativo. "No-progress breaker se activó después de 4 iteraciones con el mismo evidence set" es depurable.

Coloca breakers en el límite donde el daño puede crecer:

| Boundary | What The Breaker Protects |
| --- | --- |
| Loop boundary | Previene razonamiento sin límites, planeación repetida e iteración sin progreso. |
| Tool boundary | Previene fallas externas repetidas, argumentos malformados, efectos secundarios duplicados y escrituras inseguras. |
| Model boundary | Previene costos descontrolados, picos de latencia, rutas de model defectuosas y comportamiento degradado de structured-output. |
| Retrieval boundary | Previene respuestas basadas en evidencia débil, obsoleta, contradictoria o no autorizada. |
| Memory boundary | Previene que memory privada, obsoleta o de baja confianza dirija futuras ejecuciones. |
| Policy boundary | Previene que el agent convierta intención en acción prohibida. |
| Multi-agent boundary | Previene loops de delegación, propiedad poco clara y desacuerdos sin resolución. |

El breaker debe emitir un trace event con el nombre del breaker, trigger, umbral, valor observado, acción tomada y motivo de detención visible para el usuario. Si el breaker se activa pero el trace no explica por qué, los operadores seguirán depurando un misterio.

## Fallbacks

Un fallback debe ser más seguro que el camino fallido.

Tipos útiles de fallback:

- pedir al usuario información faltante;
- devolver una respuesta parcial con límites explícitos;
- cambiar de uso autónomo de tools a workflow determinista;
- cambiar de un model débil a uno más fuerte;
- cambiar de acción de escritura a análisis solo lectura;
- usar datos en caché o previamente verificados;
- enrutar a revisión humana;
- programar procesamiento en segundo plano;
- fallar cerrado para acciones restringidas.

No uses fallback para ocultar la falla. El usuario u operador debe saber qué cambió.

Un buen fallback tiene un contrato:

- **Alcance:** qué puede hacer el fallback.
- **Límite de calidad:** qué no puede garantizar el fallback.
- **Regla de state:** si la ejecución puede continuar, debe pausar o debe detenerse.
- **Mensaje al usuario:** cómo se explica la limitación sin exponer ruido interno.
- **Operator trace:** qué breaker causó el fallback y qué evidencia se preservó.

Para agentic systems, el fallback más seguro suele reducir la autonomía. Cambia de escritura a draft, de acción autónoma a aprobación, de uso amplio de tools a workflow determinista, o de respuesta final a aclaración.

## Replay

Replay es la capacidad de reconstruir una ejecución a partir de state durable.

Almacena:

- run ID y parent run ID;
- goal e intención normalizada;
- llamadas a model, versiones de model, parámetros y referencias de prompt;
- llamadas a tool, inputs, outputs, errores e identificadores de efectos secundarios;
- consultas de retrieval, source IDs y metadatos de citation;
- transiciones de state;
- decisiones de ruta y handoffs;
- policy checks;
- eventos de breaker y fallback;
- output final y resultados de eval.

Redacta contenido sensible cuando sea necesario, pero conserva suficientes referencias para investigar la ejecución.

Replay debe diseñarse antes del incidente. Después de una falla, es demasiado tarde para descubrir que prompts, argumentos de tools, decisiones de policy y transiciones de state estaban dispersos en logs no relacionados.

Replay también necesita reglas de seguridad. Un replay no debe enviar accidentalmente otro correo a un cliente, emitir otro reembolso o escribir otro registro en memory. Separa replay de trace solo lectura, replay determinista con outputs simulados y replay en sandbox con efectos secundarios falsos.

## Replayable Actions

Cuando un agent realiza trabajo costoso o riesgoso, haz que la acción sea replayable:

- registra el input, tool seleccionado, decisión de policy y resultado;
- adjunta una idempotency key a efectos secundarios externos;
- almacena en caché resultados seguros de solo lectura cuando las reglas de frescura lo permitan;
- preserva suficiente context para reproducir una ejecución fallida;
- haz explícito el rollback para operaciones que cambian el state.

Replay convierte una falla de un misterio en un caso de prueba.

## Replay Packet

Cuando un breaker se activa, almacena un replay packet con el conjunto mínimo útil de registros necesarios para reconstruir la falla.

```json
{
  "replay_id": "replay_support_refund_2026_06_21_001",
  "run_id": "run_9f32",
  "trigger": {
    "breaker": "tool:shipping.read_delivery_status",
    "reason": "tool_failure_breaker_open",
    "observed": 3,
    "threshold": 3
  },
  "goal": "Investigate whether order ord_123 qualifies for refund.",
  "state_snapshot_ref": "state/run_9f32/step_4",
  "context_packet_ref": "context/run_9f32/step_4",
  "model_events": ["model_call_1", "model_call_2"],
  "tool_events": ["tool_call_1", "tool_call_2", "tool_call_3"],
  "policy_events": ["policy_check_1"],
  "side_effects": [],
  "fallback_taken": "needs_human",
  "safe_replay_mode": "mocked_tools"
}
```

El packet debe responder cuatro preguntas: qué se activó, qué creía el sistema, qué pasó antes del breaker y cómo hacer replay de forma segura sin repetir efectos secundarios.

## Replay Levels

| Level | Capability | Use |
| --- | --- | --- |
| Trace replay | Reconstruir lo que sucedió a partir de logs. | Revisión de incidentes y depuración. |
| Deterministic replay | Re-ejecutar código determinista con outputs de model/tool grabados. | Pruebas de regresión y validación de workflow. |
| Full replay | Re-ejecutar llamadas a model y tool en un sandbox. | Reproducción cuando sistemas externos son estables. |
| Counterfactual replay | Re-ejecutar con prompt, policy, model o tool cambiado. | Evaluar correcciones antes de desplegar. |

La mayoría de los equipos debe comenzar con trace replay. Full replay es útil pero más difícil porque models, tools y datos externos cambian.

Counterfactual replay es especialmente útil para agentic systems. Permite al equipo preguntar: ¿el nuevo prompt, ruta de model, regla de policy, retrieval index o tool schema habría evitado la falla sin romper casos conocidos buenos?

## Notas de implementación

- Agrega breakers en los niveles de loop, tool, retrieval, route y workflow.
- Registra los eventos de breaker como eventos de trace de primer nivel.
- Vincula las decisiones de fallback a razones explícitas de falla.
- Separa los retries seguros de los intentos repetidos sin fundamento.
- Haz que cada efecto secundario sea idempotente o trazable.
- Almacena suficiente state para reanudar o fallar limpiamente.
- Convierte los incidentes en casos de eval.
- Prefiere eventos de breaker tipados sobre mensajes de log libres.
- Mantén los umbrales de breaker configurables por ambiente, clase de riesgo y capability de tool.
- Trata el disparo de un breaker como una señal de evaluación, no solo como un evento operativo.

## Ejemplo de lógica de breaker

```ts
type BreakerAction = 'continue' | 'fallback' | 'escalate' | 'stop';

type ToolFailure = {
  toolName: string;
  count: number;
  lastError: string;
};

type RunBudget = {
  maxIterations: number;
  maxToolFailuresPerTool: number;
  maxCostUsd: number;
};

type BreakerDecision = {
  action: BreakerAction;
  reason: string;
  traceEvent: {
    type: 'breaker';
    name: string;
    observed: number;
    threshold: number;
  };
};

function evaluateToolBreaker(
  failure: ToolFailure,
  budget: RunBudget
): BreakerDecision {
  if (failure.count < budget.maxToolFailuresPerTool) {
    return {
      action: 'continue',
      reason: 'tool_failure_budget_remaining',
      traceEvent: {
        type: 'breaker',
        name: `tool:${failure.toolName}`,
        observed: failure.count,
        threshold: budget.maxToolFailuresPerTool
      }
    };
  }

  return {
    action: 'fallback',
    reason: 'tool_failure_breaker_open',
    traceEvent: {
      type: 'breaker',
      name: `tool:${failure.toolName}`,
      observed: failure.count,
      threshold: budget.maxToolFailuresPerTool
    }
  };
}

function evaluateLoopBreaker(
  iteration: number,
  costUsd: number,
  budget: RunBudget
): BreakerDecision | null {
  if (iteration >= budget.maxIterations) {
    return {
      action: 'stop',
      reason: 'max_iterations_reached',
      traceEvent: {
        type: 'breaker',
        name: 'loop:max_iterations',
        observed: iteration,
        threshold: budget.maxIterations
      }
    };
  }

  if (costUsd >= budget.maxCostUsd) {
    return {
      action: 'escalate',
      reason: 'max_cost_reached',
      traceEvent: {
        type: 'breaker',
        name: 'run:max_cost_usd',
        observed: costUsd,
        threshold: budget.maxCostUsd
      }
    };
  }

  return null;
}
```

Lo importante no es el tamaño del código. Lo importante es que la razón de detención se convierte en parte del run state y del trace.

La acción debe guiar el comportamiento. `continue` sigue el camino principal. `fallback` pasa a un camino más seguro. `escalate` solicita que un humano o una cola tomen el control. `stop` termina el run con un state claro y un registro de replay.

## Modos de falla

- Los breakers existen en logs pero no afectan la ejecución.
- Los fallbacks bajan la calidad en silencio sin informar al usuario.
- Los retries repiten los mismos inputs y esperan resultados diferentes.
- Los traces omiten los inputs de tool, haciendo imposible el replay.
- Los efectos secundarios no pueden asociarse al agent run que los creó.
- Los sistemas multi-agent no tienen un único owner cuando se dispara un breaker.
- Los umbrales de breaker están codificados y no pueden cambiar según la clase de riesgo.
- El replay solo puede reproducir la falla tocando sistemas en vivo nuevamente.
- El sistema recurre a un modelo más potente cuando el problema real es la falta de policy o state.

## Guía de evaluación

Prueba breakers y fallbacks directamente. No esperes a incidentes en producción para demostrar que el runtime puede detenerse de forma segura.

| Caso de Eval | Comportamiento esperado |
| --- | --- |
| Tool falla repetidamente | El breaker de tool se activa, se ejecuta el camino de fallback, el trace registra el umbral. |
| Loop no avanza en el state | El loop se detiene con una razón de no-progreso y sin llamadas extra a tools. |
| Se agota el presupuesto de costo | El run se pausa, resume el progreso y pide aprobación o presupuesto de continuación. |
| La evidencia de retrieval es débil | El agent pide aclaración o rechaza afirmaciones no soportadas. |
| Policy bloquea una acción de escritura | La acción es denegada o escalada antes de los efectos secundarios. |
| Delegación multi-agent se repite | El supervisor asigna un único owner o escala el caso. |
| Replay usa el trace grabado | El replay no dispara efectos secundarios en vivo. |

## Lista de verificación para producción

- ¿Cada loop tiene máximo de iteraciones, costo máximo y tiempo máximo de ejecución?
- ¿Cada tool tiene timeout, retry y umbrales de falla?
- ¿Cada fallback informa al operador qué cambió?
- ¿El sistema puede detenerse de forma segura después de un progreso parcial?
- ¿Un run fallido puede convertirse en un fixture de eval?
- ¿Los efectos secundarios pueden auditarse y revertirse cuando sea posible?
- ¿Los operadores pueden reproducir un run sin leer prompts crudos de logs dispersos?
- ¿Los eventos de breaker están vinculados a IDs de trace, casos de eval y revisiones de incidentes?
- ¿Los caminos de fallback se prueban antes del lanzamiento?
- ¿Se pueden deshabilitar tools riesgosos sin redeplegar todo el agent?

## Capítulos relacionados

- [Agent Loop](../foundations/agent-loop)
- [Goals and State](../foundations/goals-and-state)
- [Self-Healing Workflows](../control-loops/self-healing-workflows)
- [Durable Workflows](../production-runtime/durable-workflows)
- [Cost Controls and Runtime Budgets](../production-runtime/cost-controls-runtime-budgets)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Policy Enforcement](../production-runtime/policy-enforcement)
