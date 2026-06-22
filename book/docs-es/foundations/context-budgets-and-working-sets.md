---
title: Context Budgets And Working Sets
---

# Context Budgets And Working Sets

El context no es un sistema de almacenamiento. Es el working set del model para la siguiente decisión, y esa distinción es donde muchos agents fallan silenciosamente. Si tratas el context como una caja donde cualquier cosa potencialmente útil se puede tirar, terminas con prompts largos, state duplicado, memory obsoleta, output de tools irrelevante, contradicciones ocultas y luego falta de evidencia justo cuando el model la necesita. El context engineering es la disciplina de decidir qué debe ver el model en este momento, y nada más.

![Context assembly pipeline](../public/diagrams/context-assembly-pipeline.svg)

## Qué Deberías Ser Capaz De Hacer

Después de este capítulo, deberías poder:

- definir el working set para una llamada de model;
- separar context requerido, relevante, disponible y excluido;
- escribir un context manifest que los revisores puedan inspeccionar;
- explicar por qué cada elemento de context fue incluido u omitido;
- probar la selección de context directamente en vez de adivinar a partir de la respuesta final.

## The Working Set

Toma la idea de los sistemas operativos: el working set es el pequeño conjunto de información necesario para el paso actual. Para un agent, eso normalmente significa el goal activo, el paso actual, las restricciones relevantes, el state compacto, la evidencia seleccionada, las tools disponibles para este paso, observaciones recientes, cualquier pregunta sin resolver, y el budget y reglas de detención.

Lo que no debería incluir automáticamente es todo lo demás: el historial completo del chat, cada documento recuperado, cada resultado de tool, todos los recuerdos sobre el usuario, todas las tools disponibles, cada archivo en el workspace y planes antiguos que ya no coinciden con el state actual. El model no necesita todo. Necesita lo correcto, y elegirlo es el trabajo.

## Per-Agent Working Sets

En un sistema multi-agent, cada agent debe tener su propio working set. Darle a cada agent el mismo prompt, los mismos archivos, la misma memory, las mismas tools y el mismo historial de conversación anula el propósito de descomponer el sistema desde el principio.

| Agent Type | Working Set Should Include | Should Usually Exclude |
| --- | --- | --- |
| Router | task summary, route options, policy constraints. | full evidence bundle, long history, write tools. |
| Research agent | query, source rules, retrieval tools, citation requirements. | private memory unrelated to the task, write tools. |
| Tool agent | exact operation, validated inputs, tool contract, policy result. | broad conversation history, unrelated tools. |
| Reviewer | artifact to review, rubric, evidence, acceptance criteria. | implementation scratchpad, irrelevant prior drafts. |
| Supervisor | goal, worker contracts, progress, merge criteria. | every worker's raw context unless needed. |
| Human approver | proposed action, evidence, risk, policy result, diff. | hidden intermediate model chatter. |

Esta es una de las razones más fuertes para tratar los agents como servicios. Cada agent recibe el context que su contrato requiere, no el context que todo el sistema lleva consigo.

## Context Budget

Cada llamada de model tiene un budget, incluso cuando la ventana de context es grande. Los tokens que usas se distribuyen entre instrucciones, state, evidencia, descripciones de tools, memory, historial de conversación, el espacio reservado para el output y el costo de cualquier compresión que ejecutes. Una ventana grande no elimina la necesidad de selección. Solo hace que una mala selección sea más costosa y difícil de notar.

Ajusta el budget a la decisión. Una llamada de routing no debería llevar todo el evidence bundle. Una llamada de selección de tool no debería llevar historial de usuario no relacionado. Una llamada de síntesis final debe incluir evidencia y restricciones, no cada pensamiento intermedio fallido que el agent tuvo en el camino.

## Context Budget Ledger

Lleva el control del budget para cada llamada antes de ensamblar el prompt.

```yaml
context_budget:
  call_type: refund_policy_synthesis
  model_window_tokens: 128000
  reserved_output_tokens: 2000
  max_input_tokens: 18000
  allocation:
    instructions: 1200
    goal_and_state: 900
    policy: 3500
    evidence: 9000
    tool_results: 1800
    memory: 400
    conversation_history: 800
    safety_margin: 400
  omitted:
    - id: old_chat_turns
      reason: "not relevant to current policy decision"
    - id: full_order_history
      reason: "replaced by validated order summary"
```

El ledger debe dejar algo claro: el context se asigna, no se acumula. Si una fuente no tiene línea de budget o regla de inclusión, no debe entrar a la llamada del model por accidente.

## Context Manifests

Para agents importantes, define un context manifest: una declaración explícita de lo que se permite ingresar a la llamada del model.

| Manifest Field | Example |
| --- | --- |
| Required state | `goal`, `current_step`, `tenant_id`, `policy_version`. |
| Allowed evidence | policy docs, order records, approved knowledge base snippets. |
| Allowed memory | explicit user preferences for this product area. |
| Allowed tool results | read-only lookup results for the current task. |
| Excluded data | secrets, unrelated private data, stale summaries, raw untrusted instructions. |
| Maximum size | token budget by source type. |
| Freshness rule | documents must be current or marked stale. |
| Trust labels | system, user, retrieved, tool, memory, untrusted. |

Un manifest convierte la selección de context de un prompt craft a diseño de sistema. Una vez que existe, puede ser revisado, versionado, probado y auditado como cualquier otra parte del sistema.

En código, un working-set builder debe hacer visibles las reglas de inclusión:

```ts
interface ContextItem {
  id: string;
  kind: 'state' | 'evidence' | 'tool_result' | 'memory' | 'instruction';
  trust: 'system' | 'internal' | 'user' | 'untrusted';
  sourceId?: string;
  relevance: number;
  freshness: 'current' | 'stale' | 'unknown';
  tokens: number;
  text: string;
}

type ContextSelection = {
  included: ContextItem[];
  omitted: { id: string; reason: string }[];
};

function buildWorkingSet(items: ContextItem[], maxTokens: number): ContextSelection {
  const required = items.filter(item => item.kind === 'state' || item.kind === 'instruction');
  const optional = items
    .filter(item => item.kind !== 'state' && item.kind !== 'instruction')
    .filter(item => item.trust !== 'untrusted' || item.kind === 'evidence')
    .filter(item => item.freshness !== 'stale')
    .sort((a, b) => b.relevance - a.relevance);

  const selected: ContextItem[] = [];
  const omitted: ContextSelection['omitted'] = [];
  let used = 0;

  for (const item of [...required, ...optional]) {
    if (used + item.tokens > maxTokens) {
      omitted.push({ id: item.id, reason: 'token_budget' });
      continue;
    }

    selected.push(item);
    used += item.tokens;
  }

  for (const item of items) {
    if (selected.includes(item) || omitted.some(omittedItem => omittedItem.id === item.id)) continue;
    if (item.freshness === 'stale') omitted.push({ id: item.id, reason: 'stale' });
    else if (item.trust === 'untrusted' && item.kind !== 'evidence') {
      omitted.push({ id: item.id, reason: 'untrusted_non_evidence' });
    }
  }

  return { included: selected, omitted };
}
```

El punto no es esta función de puntuación exacta. El punto es que la selección de context se vuelve un comportamiento inspeccionable, no un ensamblado de prompt oculto. La lista omitida importa tanto como la incluida, porque le dice a los operadores si el model omitió evidencia, excluyó memory obsoleta o se quedó sin budget.

## Sources Of Context

El context proviene de diferentes fuentes, y cada fuente tiene un nivel distinto de confianza.

| Source | Use | Risk |
| --- | --- | --- |
| Instructions | Defines behavior and constraints. | Too broad or contradictory. |
| Goal state | Keeps the task coherent. | Vague success criteria. |
| Working memory | Tracks progress and pending work. | Transcript dump instead of structured state. |
| Retrieved evidence | Grounds answers in sources. | Stale, irrelevant, or injected content. |
| Tool output | Reports external facts or action results. | Untrusted output treated as instruction. |
| Long-term memory | Carries prior knowledge or preferences. | Stale, private, or over-applied memory. |
| Skills | Loads procedural knowledge. | Irrelevant activation or outdated procedure. |
| Conversation history | Preserves user interaction. | Old turns override current task. |

No mezcles todo en un solo bloque. Etiquétalos y mantén los límites claros: instructions no son evidence, afirmaciones de usuario no son hechos verificados y los resultados de tools no son policy.

## Niveles de Context

Los niveles son una forma sencilla de decidir qué entra realmente al model.

| Nivel | Contenido | Tratamiento Predeterminado |
| --- | --- | --- |
| Required | Goal, policy, current state, stop rules. | Siempre incluir en forma compacta. |
| Relevant | Evidence, tool results, archivos, memories para el paso actual. | Incluir selectivamente con etiquetas de fuente. |
| Available | Archivos del workspace, mensajes antiguos, documentos completos, herramientas extra. | Referenciar por ID y recuperar solo cuando se necesiten. |
| Excluded | Secrets, datos privados no relacionados, memory obsoleta, instrucciones no confiables. | Mantener fuera del context. |

Esta división previene la saturación del context y facilita las revisiones, ya que el equipo siempre puede preguntar por qué se incluyó un elemento determinado.

## Context Curado

Context curado significa que el sistema selecciona deliberadamente el conjunto más pequeño y útil de información antes de la llamada al model. Para un coding agent, esto normalmente ocurre como una secuencia:

1. identificar los archivos principales;
2. buscar símbolos, imports, tests y call sites;
3. clasificar archivos secundarios;
4. cargar directamente archivos pequeños relevantes;
5. cargar fragmentos o resúmenes para archivos grandes;
6. excluir archivos no relacionados incluso si están junto a los relevantes.

El mismo pattern aplica fuera del código. Un support agent no necesita todos los registros de clientes. Necesita la solicitud actual, los datos relevantes de la cuenta, la policy aplicable, los eventos recientes relacionados y las tools permitidas para este paso. La curaduría no es solo una optimización de costos. Es un control de confiabilidad, porque mientras más pequeño sea el working set, menos formas tiene el model de equivocarse.

## Divulgación Progresiva

Carga el context en etapas en lugar de todo de una vez. No hay razón para cargar cada documento, memory, archivo, descripción de tool y artifact de ejecuciones previas al inicio de una task. Comienza con lo mínimo necesario para elegir el siguiente camino y recupera más solo cuando el state lo justifique:

1. enrutar la task desde una solicitud de usuario compacta;
2. cargar la policy y el state necesarios para esa ruta;
3. exponer tools de solo lectura para investigación;
4. cargar evidencia detallada solo después de conocer los hechos faltantes;
5. exponer tools de escritura solo después de pasar verificaciones de elegibilidad y aprobación;
6. incluir evidencia final para síntesis y la explicación orientada al usuario.

Divulgar el context progresivamente reduce el costo de tokens, disminuye la exposición a prompt-injection y deja traces mucho más fáciles de inspeccionar después.

## Compresión

La compresión ayuda cuando el context es grande, pero no es gratis. Prefiere state estructurado sobre resúmenes de chat, IDs de fuente sobre documentos pegados, fragmentos cortos citados sobre texto completo, memory específica de la task sobre memory global y referencias de archivos sobre el contenido completo de archivos. Cuando resumas, mantén intactas las decisiones, restricciones y preguntas sin resolver.

Algunas cosas nunca deben comprimirse: approval state, errores de tools, restricciones de policy, procedencia de la fuente, contradicciones, correcciones de usuario, preguntas abiertas y razones de detención. Los resúmenes son inherentemente con pérdida, así que trátalos como artifacts derivados y no como la verdad de la ejecución.

## Compactación

La compactación no es lo mismo que un resumen ordinario. Un resumen produce un texto más corto; la compactación preserva el state operativo necesario para continuar una ejecución. Una compactación útil mantiene el goal activo, el current state, los pasos completados y pendientes, las decisiones tomadas, la evidence utilizada y sus source IDs, las llamadas a tools y sus resultados, la policy y el approval state, las preguntas abiertas, los errores conocidos y las razones de detención.

No debe ser tu estrategia principal de context. Si cada ejecución depende de la compactación de emergencia, el sistema está cargando demasiado context demasiado pronto. Usa la compactación como mecanismo de recuperación y continuación, no como permiso para seguir saturando el model.

## Límites de Compactación

La compactación del context debe ocurrir en límites estables, no en medio de un paso de razonamiento frágil. Buenos límites incluyen:

- después de que se reformulan los requerimientos;
- después de que el descubrimiento produce una lista de fuentes;
- después de que se acepta un plan;
- después de un commit o checkpoint;
- antes de entregar el trabajo a otro agent.

Cada compactación debe preservar decisiones, riesgos abiertos, rutas de archivos, evidencia de verificación y restricciones de usuario. Debe eliminar ruido de la transcripción, no borrar la responsabilidad.

## Minimización de Context

Elimina el context una vez que ha cumplido su propósito. Esto es especialmente importante para contenido no confiable. Después de que un mensaje de usuario, página web, correo, ticket o documento se convierte en un artifact intermedio validado, los pasos posteriores a menudo ya no necesitan el texto fuente original:

1. un mensaje de usuario entra como texto no confiable;
2. el sistema extrae la intención en una solicitud tipada;
3. la policy valida la solicitud;
4. las llamadas posteriores a tools usan la solicitud tipada, no el texto original.

Eso reduce la carga de tokens y, más importante aún, disminuye la probabilidad de que una instrucción antigua y no confiable siga influyendo en decisiones posteriores. Sin embargo, no minimices a ciegas. Conserva suficiente context para preservar la intención del usuario, la auditabilidad y las rutas de corrección. El objetivo no es olvidar, sino dejar de tratar cada token antiguo como una instrucción activa.

## Resultados de Tools

Los resultados de tools son context, pero no son instrucciones. Un resultado de búsqueda, página web, documento recuperado, fila de base de datos, observación de navegador o salida de comando puede contener texto hostil o engañoso, y el model debe ver todo eso como datos de una fuente, no como un nuevo mensaje del sistema.

Un buen context de resultado de tool llega envuelto en sus metadatos: fuente, timestamp, nivel de confianza, alcance, resultado bruto o extracto, campos parseados, cualquier estado de error y un correlation ID. Un mal context de resultado de tool solo pega el texto en el prompt y espera que el model sepa en qué confiar.

## Selección de Memory

La memory no debe cargarse por defecto. Antes de incorporar una memory al context, pregunta si es relevante para el goal actual, si es lo suficientemente reciente, si fue proporcionada por el usuario, inferida o importada, si está permitida para este usuario y task, si podría sesgar la respuesta incorrectamente y si puede corregirse o eliminarse. La memory es poderosa porque persiste, y eso es precisamente lo que la hace peligrosa: una memory equivocada puede seguir fallando en el sistema mucho después de que la ejecución que la creó haya terminado.

## Deriva del Working Set

La deriva del working set ocurre cuando el context ya no coincide con la task real. Se infiltra por caminos conocidos: un plan antiguo que sobrevive después de que el usuario cambia el goal, un resultado de recuperación obsoleto que nunca sale del context, un resumen comprimido que omite una restricción, un error de tool oculto por un éxito posterior, un resumen de subagent que omite su propia incertidumbre, memory reutilizada de otro dominio o un historial de chat que ahoga lentamente las instrucciones actuales.

La deriva es difícil de detectar solo a partir de la respuesta final, por eso se traza el paquete de context para cada llamada al model y no solo la salida.

## Confianza en la Fuente

Cada elemento de context debe llevar una etiqueta de confianza. Algunas útiles incluyen: system instruction, developer instruction, user request, verified internal data, retrieved internal document, external web content, tool result, long-term memory, generated summary, human approval y untrusted content. Las etiquetas ayudan al model y al runtime a interpretar correctamente el context, y ayudan a los operadores a reconstruir por qué ocurrió una mala decisión.

La regla más importante: el context de menor confianza nunca debe anular la gobernanza de mayor confianza. Un documento recuperado puede aportar evidence, pero no puede cambiar los permisos de tools. Un resultado de tool puede reportar state, pero no puede reescribir la approval policy. Una memory puede informar la personalización, pero no puede anular la user request actual.

## Evaluación

Evalúa la selección de context directamente, no solo las respuestas finales. Casos útiles incluyen verificar que la evidence requerida esté presente, que la evidence irrelevante esté excluida, que la evidence obsoleta sea rechazada, que el prompt injection en texto recuperado sea ignorado, que las correcciones de usuario y errores de tools se conserven, que la memory se omita cuando no es relevante, que los resúmenes preserven restricciones y que la respuesta final cite las fuentes correctas. A nivel de sistema, también confirma que el working set de cada agent contenga solo lo que requiere su contrato, que la minimización elimine texto bruto no confiable después de la extracción, que la compactación preserve el approval state y las preguntas abiertas, y que el manifest realmente rechace los datos excluidos.

Métricas valiosas incluyen precisión y recall del context, frescura de la fuente, fidelidad de citación, costo de tokens, tasa de rechazo cuando falta evidence, tasa de preservación de errores, tasa de deriva, tasa de sobre-inclusión, tasa de context crítico faltante y tasa de pérdida por compactación. Cuando una respuesta sale mal, inspecciona el context que la produjo antes de culpar al model.

## Lista de verificación de diseño

Antes de lanzar un agent con mucho context, revisa estas preguntas: ¿Qué siempre se incluye? ¿Qué se recupera solo cuando es necesario? ¿Qué nunca se permite en el context? ¿Cómo se etiquetan las fuentes y cómo se mantienen separados los resultados de tools de las instrucciones? ¿Cómo se detecta memory obsoleta? ¿Cómo se generan y validan los resúmenes? ¿Qué context bundle se usó para cada llamada al model y puede un operador reproducir la ejecución con el mismo context? ¿Qué evals prueban la selección de context en lugar de solo las respuestas finales? ¿Cada agent tiene su propio working set? ¿Qué entradas sin procesar y no confiables se eliminan después de la extracción, qué conserva la compactación y qué trust labels aparecen en tus traces?

## Regla de diseño

No maximices el context. Cura el working set.

## Capítulos relacionados

- [Context Engineering](./context-engineering)
- [What Is An Agent?](./what-is-an-agent)
- [Agent Harnesses](../agent-engineering-practice/agent-harnesses)
- [Agents As Services](../systems-architecture/agents-as-services)
- [Agent Threat Model](../agent-engineering-practice/agent-threat-model)
- [Working Memory](../memory-knowledge/working-memory)
- [Resource-Aware Agent Design](../pattern-selection/resource-aware-agent-design)
- [Semantic Recall and RAG](../memory-knowledge/semantic-recall-rag)
