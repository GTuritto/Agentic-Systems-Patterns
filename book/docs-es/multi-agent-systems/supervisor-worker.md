---
title: Supervisor / Worker
---

# Supervisor / Worker

Supervisor/Worker centraliza la propiedad del goal, el state de las tasks, el enrutamiento y los quality gates, mientras que los workers realizan trabajo especializado y acotado.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/hierarchical-agent-pattern)
> - [Download code bundle](/downloads/supervisor-worker.zip)

## Propósito

Supervisor / Worker es un pattern multi-agent donde un coordinador posee el goal, la descomposición, los contratos de los workers, la merge policy, el quality gate y la responsabilidad final. Los workers realizan tasks especializadas y acotadas, y devuelven resultados estructurados con evidencia, errores y nivel de confianza.

El supervisor no es solo un prompt con forma de manager. Es el punto de control que evita que el trabajo multi-agent se convierta en un chat grupal sin dueño. Decide qué trabajo se debe dividir, qué context recibe cada worker, qué tools puede usar cada worker, cómo se fusionan los resultados y cuándo el sistema debe escalar.

## Úsalo Cuando

- La task se beneficia de flujos de trabajo especializados y separados.
- Los workers pueden operar con context acotado, tools acotados y outputs claros.
- El supervisor puede evaluar, fusionar o rechazar los resultados de los workers.
- El paralelismo, la especialización o la revisión independiente aportan más que el costo extra de coordinación.
- Un componente puede ser dueño de la aceptación final y la responsabilidad ante el usuario.

## Evítalo Cuando

- Un solo agent o un workflow determinista puede resolver la task claramente.
- Todos los workers recibirían el mismo context y la misma lista de tools.
- El supervisor no puede juzgar si el output del worker es correcto.
- El paso de merge es vago o meramente estilístico.
- Las acciones de los workers pueden crear efectos secundarios sin policy o aprobación del supervisor.
- Nadie es dueño de la respuesta final cuando los workers no están de acuerdo.

## Arquitectura

Usa este diagrama para leer Supervisor / Worker como un límite de sistema, no solo como una forma de código. La pregunta clave de propiedad es: el coordinador posee el goal compartido, la descomposición, las asignaciones, la merge policy y la aceptación final.

![Supervisor worker architecture](../public/diagrams/supervisor-worker.svg)

## Forma del Sistema

- **Límite del pattern:** el supervisor posee el goal compartido, la descomposición, las asignaciones, la merge policy, los quality checks, la escalación y la aceptación final.
- **Límite del worker:** cada worker recibe una task acotada, context acotado, tools permitidos, output schema esperado, timeout y criterios de aceptación.
- **Dueño del state:** el supervisor o el workflow engine posee el state compartido. Los workers solo poseen el state temporal local de la task, a menos que se les otorgue explícitamente más.
- **Límite de policy:** el uso de tools y efectos secundarios de los workers está restringido por la asignación, no por la habilidad general del worker.
- **Promesa operacional:** el sistema obtiene especialización útil sin perder un dueño responsable del resultado final.

## Protocolo Central

1. Recibe el goal compartido, el caller, restricciones, presupuesto y trace ID.
2. Decide si la task debe dividirse o manejarse con una baseline más simple.
3. Crea asignaciones para los workers con context acotado, tools permitidos, outputs esperados, timeout y criterios de aceptación.
4. Despacha las asignaciones y registra los trace IDs por worker.
5. Recoge resultados de los workers, rechazos, errores, timeouts y evidencia.
6. Evalúa cada resultado de worker antes de fusionar.
7. Fusiona los resultados aceptados usando una merge policy explícita.
8. Devuelve, reintenta, reasigna o escala con un único dueño final.

## Notas de Implementación

El handoff del supervisor al worker debe ser un contrato, no un párrafo de instrucciones.

```ts
type WorkerAssignment = {
  taskId: string;
  parentTraceId: string;
  workerRole: 'policy_reviewer' | 'order_investigator' | 'customer_message_drafter';
  objective: string;
  scopedContextRefs: string[];
  allowedTools: string[];
  forbiddenTools: string[];
  timeoutMs: number;
  expectedOutput: {
    schema: 'policy_findings.v1' | 'order_findings.v1' | 'message_draft.v1';
    requiredFields: string[];
  };
  acceptanceCriteria: string[];
};
```

El resultado del worker debe ser igual de estructurado:

```ts
type WorkerResult = {
  taskId: string;
  workerRole: string;
  status: 'succeeded' | 'refused' | 'needs_human' | 'failed' | 'timed_out';
  output?: unknown;
  evidenceRefs: string[];
  confidence: 'low' | 'medium' | 'high';
  errors: string[];
  traceId: string;
};
```

Un pequeño merge gate mantiene honesto al supervisor:

```ts
function acceptWorkerResult(result: WorkerResult) {
  if (result.status !== 'succeeded') return false;
  if (result.evidenceRefs.length === 0) return false;
  if (result.confidence === 'low') return false;
  return true;
}
```

El supervisor no debe aprobar automáticamente el output del worker. Debe revisar evidencia, schema, confianza, desacuerdo y policy antes de la síntesis final.

## Modos de Falla

- El supervisor descompone trabajo que no necesitaba dividirse.
- Todos los workers reciben el context completo, eliminando el beneficio del aislamiento.
- Los workers comparten acceso amplio a tools, multiplicando el radio de impacto.
- Las asignaciones no especifican el output esperado, así que el merge se vuelve una adivinanza.
- Los workers duplican trabajo porque los límites no están claros.
- El desacuerdo entre workers queda oculto dentro de una respuesta final suave.
- El supervisor acepta el output sin revisar evidencia o policy.
- Un worker que falla o se queda sin tiempo desaparece silenciosamente de la respuesta final.
- Ningún trace conecta el resultado final con los inputs, outputs y decisiones de los workers.
- Nadie es dueño de la responsabilidad final después de que el supervisor ha fusionado los resultados.

## Estrategia de Evaluación

Los evals de Supervisor / Worker deben demostrar que la topología es mejor que la baseline simple y que el límite de coordinación funciona.

- Compara contra una baseline de single-agent en las mismas tasks.
- Prueba un caso donde el sistema debería elegir no dividir la task.
- Prueba timeout de worker, rechazo de worker, falla de worker y output mal formado de worker.
- Prueba desacuerdo entre workers y exige resolución visible.
- Prueba aislamiento de context: cada worker debe recibir solo lo que necesita.
- Prueba aislamiento de permisos: los workers no deben llamar tools fuera de su asignación.
- Prueba precisión de merge: el resultado final debe preservar la evidencia y no inventar consenso.
- Prueba responsabilidad final: el supervisor debe devolver un status, un owner y una razón de detención.

Un eval fixture compacto puede hacer explícitas esas expectativas:

```json
{
  "case_id": "refund_policy_and_order_disagree",
  "goal": "Recommend whether a refund request should be approved.",
  "workers": {
    "policy_reviewer": { "status": "succeeded", "confidence": "high" },
    "order_investigator": { "status": "succeeded", "confidence": "medium" },
    "customer_message_drafter": { "status": "blocked_until_decision" }
  },
  "expected": {
    "final_status": "needs_human",
    "must_explain_disagreement": true,
    "forbidden_worker_tools": ["refunds.issue_refund", "support.send_customer_email"],
    "required_trace_events": ["assignment", "worker_result", "merge_decision", "stop"]
  }
}
```

Mide mejora de calidad sobre la baseline, costo de latencia, costo de tokens, manejo de fallas de workers, precisión de merge, manejo de desacuerdos, aislamiento de permisos, aislamiento de context y completitud de trace.

## Lista de Verificación para Producción

- Mantén un solo owner para la respuesta final.
- Exige una asignación tipada de worker para cada llamada de worker.
- Limita context y tools por worker.
- Da a cada worker un timeout, regla de cancelación y ruta de rechazo.
- Registra asignación, input de worker, output de worker, decisión de merge y razón de detención.
- Haz visible el desacuerdo en vez de suavizarlo.
- Define cuándo el supervisor reintenta, reasigna, escala o detiene.
- Compara calidad y costo contra una baseline simple de single-agent.
- Mantén versionados los prompts de worker, manifests de tools y output schemas.
- Agrega circuit breakers para workers que fallen o propuestas de tools inseguras.

## Ejecuta el Ejemplo

```sh
npm run hierarchical-agent
```

## Recorrido del Código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código Fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y el repository source.

### `hierarchical-agent-pattern/autogen_typescript_example/hierarchical_agent.ts`

[Abrir fuente completa](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/hierarchical-agent-pattern/autogen_typescript_example/hierarchical_agent.ts)

```ts
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import readline from 'readline';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

function askLocalModel(messages: ChatMessage[]) {
  const systemPrompt = messages[0]?.content ?? '';
  const userPrompt = messages[messages.length - 1]?.content ?? '';

  if (systemPrompt.includes('Decompose the user goal')) {
    return [
      'Sub-task 1: Define evaluation criteria for answer quality, retrieval grounding, latency, and failure handling.',
      'Sub-task 2: Create a small test set with expected evidence, negative cases, and acceptance thresholds.',
    ].join('\n');
  }

  if (systemPrompt.includes('Worker Agent 1')) {
    return `Worker 1 result: ${userPrompt} Criteria should include citation accuracy, unsupported-claim rate, p95 latency, and visible refusal behavior.`;
  }

  if (systemPrompt.includes('Worker Agent 2')) {
    return `Worker 2 result: ${userPrompt} The test set should include grounded answers, missing-evidence questions, stale-document checks, and threshold failures.`;
  }

  return [
    'Final answer: evaluate the RAG prototype with quality, grounding, latency, and failure-handling criteria.',
    'Use a small test set with positive cases, missing-evidence cases, stale-document cases, and blocking thresholds.',
    'Accept the prototype only when worker evidence meets the supervisor policy.',
  ].join('\n');
}

async function askMistral(messages: ChatMessage[]) {
  if (!MISTRAL_API_KEY) {
    return askLocalModel(messages);
  }

  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny',
      messages,
    },
    {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('State the overall goal for the manager agent: ', async (goalInput) => {
    // Manager agent decomposes the goal into two sub-tasks
    const managerMessages: ChatMessage[] = [
      { role: 'system', content: 'You are a manager agent. Decompose the user goal into two sub-tasks and assign each to a worker agent.' },
      { role: 'user', content: `Goal: ${goalInput}` },
    ];
    const managerPlan = await askMistral(managerMessages);
    console.log('\nManager Agent Plan:\n', managerPlan);

    // Simulate two worker agents (for demo, just ask Mistral for each sub-task)
    const subTasks = managerPlan.match(/Sub-task [12]: (.*)/g) || [];
    const workerResults: string[] = [];
    for (let i = 0; i < subTasks.length; i++) {
      const workerMessages: ChatMessage[] = [
        { role: 'system', content: `You are Worker Agent ${i+1}. Complete the following sub-task as best as you can.` },
        { role: 'user', content: subTasks[i] },
      ];
      const workerResult = await askMistral(workerMessages);
      console.log(`\nWorker Agent ${i+1} Result:\n`, workerResult);
      workerResults.push(workerResult);
    }

    // Manager aggregates results
    const aggregationMessages: ChatMessage[] = [
```

_Fragmento truncado para facilitar la lectura. Descarga el paquete o abre el archivo fuente para ver la implementación completa._

### `hierarchical-agent-pattern/langgraph_python_example/hierarchical_agent.py`

[Abrir fuente completa](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/hierarchical-agent-pattern/langgraph_python_example/hierarchical_agent.py)

```py
import os
import requests
import re

def ask_mistral(messages):
    api_key = os.getenv('MISTRAL_API_KEY')
    if not api_key:
        raise ValueError('Please set MISTRAL_API_KEY in your .env file')
    url = 'https://api.mistral.ai/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    data = {
        'model': 'mistral-tiny',
        'messages': messages,
    }
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()['choices'][0]['message']['content'].strip()

def main():
    goal_input = input('State the overall goal for the manager agent: ')
    # Manager agent decomposes the goal into two sub-tasks
    manager_messages = [
        {'role': 'system', 'content': 'You are a manager agent. Decompose the user goal into two sub-tasks and assign each to a worker agent.'},
        {'role': 'user', 'content': f'Goal: {goal_input}'},
    ]
    manager_plan = ask_mistral(manager_messages)
    print('\nManager Agent Plan:\n', manager_plan)

    # Simulate two worker agents (for demo, just ask Mistral for each sub-task)
    sub_tasks = re.findall(r'Sub-task [12]: (.*)', manager_plan)
    worker_results = []
    for i, sub_task in enumerate(sub_tasks):
        worker_messages = [
            {'role': 'system', 'content': f'You are Worker Agent {i+1}. Complete the following sub-task as best as you can.'},
            {'role': 'user', 'content': sub_task},
        ]
        worker_result = ask_mistral(worker_messages)
        print(f'\nWorker Agent {i+1} Result:\n', worker_result)
        worker_results.append(worker_result)

    # Manager aggregates results
    aggregation_messages = [
        {'role': 'system', 'content': 'You are a manager agent. Aggregate the following worker results into a final answer for the user.'},
        {'role': 'user', 'content': '\n'.join([f'Worker {i+1}: {r}' for i, r in enumerate(worker_results)])},
    ]
    final_result = ask_mistral(aggregation_messages)
    print('\nFinal Aggregated Result for User:\n', final_result)

if __name__ == '__main__':
    main()
```

## Descarga

- [Descargar paquete fuente](/downloads/supervisor-worker.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/hierarchical-agent-pattern)

El paquete de descarga contiene la carpeta actual `hierarchical-agent-pattern/` de este repositorio.

## Patrones relacionados

- [Task Delegation](/multi-agent-systems/task-delegation)
- [Parallel Agents](/multi-agent-systems/parallel-agents)
- [Debate and Consensus](/multi-agent-systems/debate-and-consensus)
- [Agent Loop](/foundations/agent-loop)
- [Tool Use](/foundations/tool-use)
- [Pattern Evaluation Checklist](/pattern-selection/pattern-evaluation-checklist)
- [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
