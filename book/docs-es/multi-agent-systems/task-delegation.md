---
title: Task Delegation
---

# Task Delegation

La delegación de tasks asigna subtasks delimitados a workers especializados y combina sus outputs.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/task-delegation-pattern)
> - [Download code bundle](/downloads/task-delegation.zip)

## Intento

La delegación de tasks asigna subtasks delimitados a workers especializados y combina sus outputs.

## Usar cuando

- Los workers especializados pueden completar subtasks independientes mejor que un solo agent generalista.
- El manager puede definir los outputs esperados, restricciones y criterios de aceptación.
- Los resultados de los subtasks pueden fusionarse y verificarse.

## Evitar cuando

- El task no tiene una descomposición útil.
- Los workers comparten state mutable oculto.
- El manager no puede evaluar el trabajo devuelto.

## Arquitectura

Usa este diagrama para leer Task Delegation como un límite de sistema, no solo como una forma de código. La pregunta clave de propiedad es: el coordinator posee el goal compartido, la descomposición, las asignaciones, la merge policy y la aceptación final.

![Task delegation contract flow](../public/diagrams/task-delegation-contract-flow.svg)

Léelo como un contrato de propiedad: el coordinator posee la descomposición, el alcance de los workers, la merge policy, la aceptación final y la escalación.

## Forma del sistema

- **Límite del pattern:** un coordinator delega trabajo delimitado a agents con roles estrechos, luego evalúa y fusiona sus outputs.
- **Propietario del state:** el coordinator posee el goal compartido, la descomposición, las asignaciones, la merge policy y la aceptación final.
- **Artifact principal:** `task-delegation-pattern/` contiene la implementación de referencia ejecutable y ejemplos.
- **Promesa operacional:** la delegación de tasks asigna subtasks delimitados a workers especializados y combina sus outputs.
- **Ruta ejecutable:** comienza con `npm run task-delegation` antes de adaptar el pattern a un sistema más grande.

## Protocolo central

1. Define el goal compartido, los roles de los workers, los outputs esperados y los criterios de aceptación.
2. Divide el trabajo solo donde la ejecución independiente o especializada agregue valor.
3. Despacha tasks con context y permisos delimitados.
4. Recoge outputs, errores, rechazos y evidencia de cada worker.
5. Fusiona los resultados a través de un judge explícito, reducer, supervisor o una revisión humana.

## Notas de implementación

- Mantén explícito el límite del pattern: los inputs, el state, los efectos secundarios y los outputs deben ser visibles.
- Valida las decisiones producidas por el model antes de que afecten tools, usuarios o state durable.
- Emite suficiente trace data para depurar fallas después de la ejecución.

## Modos de falla

- El pattern se aplica donde un workflow determinista más simple sería mejor.
- El state, las llamadas a tools o las decisiones del model no son lo suficientemente observables para depurar.
- El sistema carece de un comportamiento claro de detención, reintento o escalación.

## Estrategia de evaluación

- Compara el output multi-agent contra una línea base de single-agent en los mismos tasks.
- Prueba desacuerdo entre workers, fallas de workers, trabajo duplicado y malas decisiones de merge.
- Mide mejora de calidad, costo de latencia, costo de tokens, precisión de merge y accountability.
- Incluye casos que demuestren que cada condición de "Usar cuando" es verdadera para este pattern.
- Incluye casos negativos de "Evitar cuando" para que el sistema elija un pattern más simple o seguro cuando corresponda.

## Lista de verificación para producción

- Da a cada worker un contrato y conjunto de permisos estrecho.
- Haz explícita la merge policy antes de que los workers ejecuten.
- Registra los inputs, outputs y evidencia de decisión por worker.
- Mantén un solo propietario para la aceptación final y la escalación.
- Define escalación humana para trabajo ambiguo, de alto riesgo o bloqueado por policy.
- Mantén el source bundle, el capítulo generado, las pruebas y el artifact de despliegue en la misma release.

## Ejecuta el ejemplo

```sh
npm run task-delegation
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y el repository source.

### `task-delegation-pattern/autogen_typescript_example/task_delegation.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/task-delegation-pattern/autogen_typescript_example/task_delegation.ts)

```ts
// Task Delegation Pattern - Autogen TypeScript Example
// To run: npm install && npm run task-delegation

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function managerAgent(task: string): Promise<string> {
  // Step 1: Decompose the task
  const decomposePrompt = `You are a manager agent. Decompose the following task into two subtasks and describe each one. Task: ${task}`;
  const decomposeResp = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: decomposePrompt }],
    },
    {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const subtasks = decomposeResp.data.choices[0].message.content.split(/\n|\r/).filter(Boolean);
  const subtask1 = subtasks[0] || 'Subtask 1';
  const subtask2 = subtasks[1] || 'Subtask 2';

  // Step 2: Delegate to workers
  const worker1Prompt = `You are Worker Agent 1. Complete this subtask: ${subtask1}`;
  const worker2Prompt = `You are Worker Agent 2. Complete this subtask: ${subtask2}`;
  const [worker1Resp, worker2Resp] = await Promise.all([
    axios.post(MISTRAL_API_URL, {
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: worker1Prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }),
    axios.post(MISTRAL_API_URL, {
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: worker2Prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
  ]);

  // Step 3: Aggregate results
  return `Results:\n- ${worker1Resp.data.choices[0].message.content}\n- ${worker2Resp.data.choices[0].message.content}`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Task: ', async (userInput: string) => {
  try {
    const result = await managerAgent(userInput);
    console.log(result);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
```

### `task-delegation-pattern/langgraph_python_example/task_delegation.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/task-delegation-pattern/langgraph_python_example/task_delegation.py)

```py
# Task Delegation Pattern - LangGraph Python Example

Este ejemplo demuestra el Task Delegation Pattern usando LangGraph y Python. Un manager agent descompone un task y delega subtasks a dos worker agents, luego agrega los resultados. El LLM es Mistral.

## Requisitos

- Python 3.8+
- Biblioteca `langgraph`
- `python-dotenv` (para soporte de .env)
- Acceso a la API de Mistral LLM

## Instalar dependencias

``​`bash
pip install langgraph python-dotenv requests
``​`

## Código de ejemplo

``​`python
import os
from langgraph import Agent, Environment, LLM
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

class SimpleEnvironment(Environment):
    def get_observation(self):
        return input("Task: ")
    def send_action(self, action):
        print(action)

class ManagerAgent(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, task):
        prompt = f"You are a manager agent. Decompose the following task into two subtasks and describe each one. Task: {task}"
        return self.llm.complete(prompt)

class WorkerAgent(Agent):
    def __init__(self, llm, name):
        self.llm = llm
        self.name = name
    def act(self, subtask):
        prompt = f"You are {self.name}. Complete this subtask: {subtask}"
        return self.llm.complete(prompt)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

env = SimpleEnvironment()
manager = ManagerAgent(llm)
worker1 = WorkerAgent(llm, "Worker Agent 1")
worker2 = WorkerAgent(llm, "Worker Agent 2")

task = env.get_observation()
subtasks = manager.act(task).split("\n")
subtask1 = subtasks[0] if len(subtasks) > 0 else "Subtask 1"
subtask2 = subtasks[1] if len(subtasks) > 1 else "Subtask 2"
result1 = worker1.act(subtask1)
result2 = worker2.act(subtask2)
final = f"Results:\n- {result1}\n- {result2}"
env.send_action(final)
``​`

---

- Prueba una task compleja o de varios pasos para ver la delegación en acción.
- Asegúrate de que tu archivo `.env` contenga tu clave de API de Mistral.
```

## Descargar

- [Descargar paquete fuente](/downloads/task-delegation.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/task-delegation-pattern)

El paquete descargable contiene la carpeta `task-delegation-pattern/` actual de este repositorio.

## Patrones relacionados

- [Supervisor / Worker](/multi-agent-systems/supervisor-worker)
- [Debate and Consensus](/multi-agent-systems/debate-and-consensus)
- [Parallel Agents](/multi-agent-systems/parallel-agents)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
