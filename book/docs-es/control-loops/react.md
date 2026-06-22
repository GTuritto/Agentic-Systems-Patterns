---
title: ReAct
---

# ReAct

ReAct alterna entre razonamiento y acción. El agent razona sobre el state actual, toma una acción, observa el resultado y repite.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/react-pattern-reason-act)
> - [Download code bundle](/downloads/react.zip)

## Propósito

ReAct alterna entre razonamiento y acción. El agent razona sobre el state actual, toma una acción, observa el resultado y repite.

## Úsalo cuando

- El task requiere uso de tools y el agent no puede conocer toda la información necesaria de antemano.
- Las observaciones deben cambiar el siguiente paso.
- Un loop acotado puede detenerse por éxito, fallo o presupuesto.

## Evita cuando

- El task es un workflow determinista con pasos conocidos.
- No puedes validar las acciones antes de que se ejecuten.
- El reasoning trace podría exponer información sensible a los usuarios.

## Arquitectura

Usa este diagrama para leer ReAct como un límite de sistema, no solo como una forma de código. La pregunta clave de propiedad es: el loop controller es dueño del progreso, presupuestos, condiciones de parada y recovery state.

![ReAct control loop](../public/diagrams/react-control-loop.svg)

Léelo como un loop acotado: cada paso de razonamiento debe pasar por una puerta de acción, cada acción debe producir una observación y cada observación debe actualizar el state o detener el proceso.

## Forma del sistema

- **Límite del pattern:** un controller elige repetidamente el siguiente paso, lo ejecuta, observa el resultado y decide si continuar.
- **Dueño del state:** el loop controller es dueño del progreso, presupuestos, condiciones de parada y recovery state.
- **Artifact principal:** `react-pattern-reason-act/` contiene la implementación de referencia ejecutable y ejemplos.
- **Promesa operativa:** ReAct alterna entre razonamiento y acción. El agent razona sobre el state actual, toma una acción, observa el resultado y repite.
- **Ruta ejecutable:** comienza con `npm run react-agent` antes de adaptar el pattern a un sistema más grande.

## Protocolo central

1. Inicializa el goal state, restricciones, presupuestos y condiciones de parada.
2. Elige la siguiente acción a partir del state actual en vez de asumir todo el camino de antemano.
3. Ejecuta la acción a través de un tool validado, worker o función local.
4. Observa el resultado y actualiza el state con evidencia, errores y trabajo pendiente.
5. Detén, reintenta, replanifica o escala según la policy explícita.

## Notas de implementación

- Mantén explícito el límite del pattern: los inputs, state, efectos secundarios y outputs deben ser visibles.
- Valida las decisiones producidas por el model antes de que afecten tools, usuarios o durable state.
- Emite suficiente trace data para depurar fallos después de la ejecución.

## Modos de fallo

- El pattern se aplica donde un workflow determinista más simple sería mejor.
- El state, llamadas a tools o decisiones del model no son lo suficientemente observables para depurar.
- El sistema carece de comportamiento claro de parada, reintento o escalamiento.

## Estrategia de evaluación

- Prueba casos de éxito, fallos parciales, fallos repetidos, agotamiento de presupuesto y observaciones intermedias incorrectas.
- Asegúrate de que el loop se detenga por la razón correcta y no oculte pasos fallidos.
- Mide tasa de finalización, número de iteraciones, calidad de recuperación, costo y latencia.
- Incluye casos que demuestren que cada condición de "Úsalo cuando" es verdadera para este pattern.
- Incluye casos negativos de "Evita cuando" para que el sistema elija un pattern más simple o seguro cuando corresponda.

## Lista de verificación para producción

- Establece límites estrictos de iteraciones, costo y tiempo.
- Persiste el state después de pasos significativos si la ejecución puede ser interrumpida.
- Haz que los reintentos sean idempotentes o agrega compensación.
- Expón trace events para cada decisión, acción, observación y motivo de parada.
- Define escalamiento humano para trabajo ambiguo, de alto riesgo o bloqueado por policy.
- Mantén el source bundle, capítulo generado, pruebas y deployment artifact en la misma release.

## Ejecuta el ejemplo

```sh
npm run react-agent
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el download bundle y repository source.

### `react-pattern-reason-act/autogen_typescript_example/react_agent.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/react-pattern-reason-act/autogen_typescript_example/react_agent.ts)

```ts
// ReAct Pattern (Reason + Act) - Autogen TypeScript Example
// To run: npm install && npm run react-agent

import axios from 'axios';
import * as readline from 'readline';
import { evaluate } from 'mathjs';
import * as dotenv from 'dotenv';
dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

function calculatorTool(input: string): string {
  try {
    const val = evaluate(input);
    return val.toString();
  } catch (e) {
    return `Error: ${e}`;
  }
}

async function reactAgent(userInput: string): Promise<string> {
  let context = userInput;
  let done = false;
  let result = '';
  while (!done) {
    // Step 1: Reason
    const reasoningPrompt = `You are an agent. Think step by step about what to do next. If you need to use a tool, say TOOL: <expression>. If you are done, say FINAL: <answer>.\nContext: ${context}`;
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: reasoningPrompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const agentOutput = response.data.choices[0].message.content.trim();
    console.log('Agent:', agentOutput);
    if (agentOutput.startsWith('TOOL:')) {
      const expr = agentOutput.replace('TOOL:', '').trim();
      const toolResult = calculatorTool(expr);
      context += `\nTool result: ${toolResult}`;
    } else if (agentOutput.startsWith('FINAL:')) {
      result = agentOutput.replace('FINAL:', '').trim();
      done = true;
    } else {
      // If the agent doesn't follow the protocol, end loop
      result = agentOutput;
      done = true;
    }
  }
  return result;
}

async function main() {
  const idx = process.argv.indexOf('--input');
  const cliInput = idx !== -1 ? process.argv[idx + 1] : undefined;
  const nonInteractive = cliInput || process.env.NON_INTERACTIVE_INPUT;
  if (nonInteractive) {
    try {
      const agentResponse = await reactAgent(String(nonInteractive));
      console.log('Final Answer:', agentResponse);
    } catch (err) {
      console.error('Error:', err);
      process.exitCode = 1;
    }
    return;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Task: ', async (userInput: string) => {
    try {
      const agentResponse = await reactAgent(userInput);
      console.log('Final Answer:', agentResponse);
    } catch (err) {
      console.error('Error:', err);
    }
    rl.close();
  });
}

main();
```

### `react-pattern-reason-act/langgraph_python_example/react_agent.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/react-pattern-reason-act/langgraph_python_example/react_agent.py)

```py
# ReAct Pattern (Reason + Act) - LangGraph Python Example

Este ejemplo demuestra el ReAct Pattern usando LangGraph y Python. El agent alterna entre razonamiento y acción (usando un calculator tool), y resuelve el task de forma iterativa. El LLM es Mistral.

## Requisitos

- Python 3.8+
- Biblioteca `langgraph`
- `python-dotenv` (para soporte .env)
- Acceso a la API de Mistral LLM

## Instalar dependencias

``​`bash
pip install langgraph python-dotenv requests
``​`

## Código de ejemplo

``​`python
import os
from langgraph import Agent, Environment, LLM, Tool
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

import sympy as _sp

def safe_calc(expr: str) -> str:
    try:
        return str(_sp.sympify(expr, evaluate=True))
    except Exception as e:
        return f"Error: {e}"

class CalculatorTool(Tool):
    def call(self, input_str):
        return safe_calc(input_str)

class SimpleEnvironment(Environment):
    def get_observation(self):
        return input("Task: ")
    def send_action(self, action):
        print(f"Agent: {action}")

class ReActAgent(Agent):
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = {tool.name: tool for tool in tools}
    def act(self, observation):
        context = observation
        while True:
            prompt = (
                "You are an agent. Think step by step about what to do next. "
                "If you need to use a tool, say TOOL: <expression>. "
                "If you are done, say FINAL: <answer>.\nContext: " + context
            )
            response = self.llm.complete(prompt)
            print(f"Agent: {response}")
            if response.startswith("TOOL:"):
                expr = response.replace("TOOL:", "").strip()
                tool_result = self.tools["calculator"].call(expr)
                context += f"\nTool result: {tool_result}"
            elif response.startswith("FINAL:"):
                return response.replace("FINAL:", "").strip()
            else:
                return response

llm = LLM(
    provider="mistral",
    api_key=MISTRAL_API_KEY,
    api_url=MISTRAL_API_URL,
)

calc_tool = CalculatorTool(name="calculator")
env = SimpleEnvironment()
agent = ReActAgent(llm, [calc_tool])

observation = env.get_observation()
action = agent.act(observation)
env.send_action(action)
``​`

---

- Prueba una tarea matemática o lógica de varios pasos para ver el razonamiento y el uso de tools.
- Asegúrate de que tu archivo `.env` contenga tu clave de API de Mistral.
```

## Descarga

- [Descargar paquete fuente](/downloads/react.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/react-pattern-reason-act)

El paquete de descarga contiene la carpeta `react-pattern-reason-act/` actual de este repositorio.

## Patrones relacionados

- [Planning and Execution](/control-loops/planning-and-execution)
- [Reflection](/control-loops/reflection)
- [Evaluator-Optimizer](/control-loops/evaluator-optimizer)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
