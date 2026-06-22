---
title: Parallel Agents
---

# Parallel Agents

Parallel agents ejecutan trabajo independiente de manera concurrente y luego fusionan los resultados a través de un punto de control fan-out/fan-in.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/multi-agent-collaboration-pattern)
> - [Download code bundle](/downloads/parallel-agents.zip)

## Propósito

Parallel agents ejecutan trabajo independiente de manera concurrente y luego fusionan los resultados a través de un punto de control fan-out/fan-in.

## Úsalo Cuando

- El trabajo puede dividirse en búsquedas, revisiones o generaciones de candidatos independientes.
- La latencia importa y el paralelismo es seguro.
- El paso de fusión puede comparar, clasificar o sintetizar resultados.

## Evítalo Cuando

- Los agents necesitan state mutable compartido durante la ejecución.
- La merge policy es vaga.
- El trabajo en paralelo aumenta el costo sin mejorar la calidad.

## Arquitectura

Usa este diagrama para leer Parallel Agents como un límite de sistema, no solo como una forma de código. La pregunta clave de propiedad es: el coordinador es dueño del goal compartido, la descomposición, las asignaciones, la merge policy y la aceptación final.

![Parallel agents fan-out and fan-in](../public/diagrams/parallel-agents-fanout-fanin.svg)

Léelo como un límite fan-out/fan-in: el paralelismo es útil solo cuando los workers son independientes y el coordinador puede comparar, fusionar o rechazar sus salidas.

## Forma del Sistema

- **Límite del pattern:** un coordinador delega trabajo acotado a agents con roles específicos y luego evalúa y fusiona sus salidas.
- **Propietario del state:** el coordinador es dueño del goal compartido, la descomposición, las asignaciones, la merge policy y la aceptación final.
- **Artifact principal:** `multi-agent-collaboration-pattern/` contiene la implementación de referencia ejecutable y ejemplos.
- **Promesa operativa:** Parallel agents ejecutan trabajo independiente de manera concurrente y luego fusionan los resultados a través de un punto de control fan-out/fan-in.
- **Ruta ejecutable:** comienza con `npm run multi-agent-collab` antes de adaptar el pattern a un sistema más grande.

## Protocolo Central

1. Define el goal compartido, los roles de los workers, las salidas esperadas y los criterios de aceptación.
2. Divide el trabajo solo donde la ejecución independiente o especializada agregue valor.
3. Despacha tasks con context y permisos acotados.
4. Recoge salidas, errores, rechazos y evidencia de cada worker.
5. Fusiona resultados mediante un judge, reducer, supervisor o revisión humana explícita.

## Notas de Implementación

- Mantén explícito el límite del pattern: los inputs, state, efectos secundarios y outputs deben ser visibles.
- Valida las decisiones producidas por el model antes de que afecten tools, usuarios o state durable.
- Emite suficiente trace data para depurar fallas después de la ejecución.

## Modos de Falla

- El pattern se aplica donde un workflow determinista más simple sería mejor.
- El state, las llamadas a tools o las decisiones del model no son lo suficientemente observables para depurar.
- El sistema carece de comportamientos claros de detención, reintento o escalamiento.

## Estrategia de Evaluación

- Compara la salida multi-agent contra una línea base de single-agent en las mismas tasks.
- Prueba desacuerdo entre workers, fallas de workers, trabajo duplicado y malas decisiones de fusión.
- Mide mejora de calidad, costo de latencia, costo de tokens, precisión de fusión y responsabilidad.
- Incluye casos que demuestren que cada condición de "Úsalo Cuando" es verdadera para este pattern.
- Incluye casos negativos de "Evítalo Cuando" para que el sistema elija un pattern más simple o seguro cuando corresponda.

## Lista de Verificación para Producción

- Da a cada worker un contrato y conjunto de permisos acotados.
- Haz explícita la merge policy antes de que los workers se ejecuten.
- Registra los inputs, outputs y evidencia de decisión por worker.
- Mantén un solo propietario para la aceptación final y el escalamiento.
- Define escalamiento humano para trabajo ambiguo, de alto riesgo o bloqueado por policy.
- Mantén el source bundle, el capítulo generado, las pruebas y el artifact de despliegue en la misma versión.

## Ejecuta el Ejemplo

```sh
npm run multi-agent-collab
```

## Recorrido del Código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o flujo de control.

## Código Fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y en el repository source.

### `multi-agent-collaboration-pattern/autogen_typescript_example/multi_agent_collab.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/multi-agent-collaboration-pattern/autogen_typescript_example/multi_agent_collab.ts)

```ts
// Multi-Agent Collaboration Pattern - Autogen TypeScript Example
// To run: npm install && npm run multi-agent-collab

import axios from 'axios';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function agent(name: string, role: string, input: string): Promise<string> {
  const prompt = `You are ${name}, your role is: ${role}. Here is your input: ${input}`;
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}

async function multiAgentCollab(task: string) {
  // Agent 1: Idea Generator
  const idea = await agent('Alice', 'Idea Generator', task);
  console.log('Alice (Idea Generator):', idea);

  // Agent 2: Critic
  const critique = await agent('Bob', 'Critic', `Here is an idea: ${idea}\nPlease critique or improve it.`);
  console.log('Bob (Critic):', critique);

  // Agent 1: Finalize
  const final = await agent('Alice', 'Idea Generator', `Here is the critique: ${critique}\nPlease finalize the solution.`);
  console.log('Alice (Finalized):', final);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Task: ', async (userInput: string) => {
  try {
    await multiAgentCollab(userInput);
  } catch (err) {
    console.error('Error:', err);
  }
  rl.close();
});
```

### `multi-agent-collaboration-pattern/langgraph_python_example/multi_agent_collab.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/multi-agent-collaboration-pattern/langgraph_python_example/multi_agent_collab.py)

```py
# Multi-Agent Collaboration Pattern - LangGraph Python Example

This example demonstrates the Multi-Agent Collaboration Pattern using LangGraph and Python. Two agents (an Idea Generator and a Critic) collaborate to solve a task, exchanging messages and refining the solution. The LLM is Mistral.

## Requirements

- Python 3.8+
- `langgraph` library
- `python-dotenv` (for .env support)
- Mistral LLM API access

## Install dependencies

``​`bash
pip install langgraph python-dotenv requests
``​`

## Example Code

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

class IdeaGenerator(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, observation):
        prompt = f"You are Alice, an Idea Generator. Here is your task: {observation}"
        return self.llm.complete(prompt)

class Critic(Agent):
    def __init__(self, llm):
        self.llm = llm
    def act(self, idea):
        prompt = f"You are Bob, a Critic. Here is an idea: {idea}\nPlease critique or improve it."
        return self.llm.complete(prompt)

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

env = SimpleEnvironment()
idea_agent = IdeaGenerator(llm)
critic_agent = Critic(llm)

task = env.get_observation()
idea = idea_agent.act(task)
print("Alice (Idea Generator):", idea)
critique = critic_agent.act(idea)
print("Bob (Critic):", critique)
final = idea_agent.act(f"Here is the critique: {critique}\nPlease finalize the solution.")
print("Alice (Finalized):", final)
``​`

---

- Try a creative or open-ended task to see agent collaboration.
- Make sure your `.env` file contains your Mistral API key.
```

## Descarga

- [Download source bundle](/downloads/parallel-agents.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/multi-agent-collaboration-pattern)

El bundle de descarga contiene la carpeta `multi-agent-collaboration-pattern/` actual de este repositorio.

## Patrones Relacionados

- [Task Delegation](/multi-agent-systems/task-delegation)
- [Supervisor / Worker](/multi-agent-systems/supervisor-worker)
- [Debate and Consensus](/multi-agent-systems/debate-and-consensus)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
