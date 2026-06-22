---
title: Reflection
---

# Reflection

Reflection le pide a un agent o evaluator que inspeccione la salida previa e identifique mejoras concretas.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/reflection-and-self-improvement-pattern)
> - [Download code bundle](/downloads/reflection.zip)

## Propósito

Reflection le pide a un agent o evaluator que inspeccione la salida previa e identifique mejoras concretas.

## Úsalo Cuando

- El sistema tiene criterios de calidad explícitos.
- Una crítica puede cambiar decisiones, pruebas, state o artifacts finales.
- Necesitas una pasada de mejora ligera sin un ciclo completo evaluator-optimizer.

## Evítalo Cuando

- La crítica solo produce una salida más larga.
- No hay un criterio de aceptación para el resultado revisado.
- Se le pide al model que apruebe sus propias acciones inseguras.

## Arquitectura

Usa este diagrama para leer Reflection como un límite de sistema, no solo como una forma de código. La pregunta clave de propiedad es: el loop controller es dueño del progreso, presupuestos, condiciones de parada y recovery state.

![Reflection improvement loop](../public/diagrams/reflection-improvement-loop.svg)

Léelo como una pasada de mejora acotada: la crítica debe identificar defectos concretos, la revisión debe ser validada, y el presupuesto o el riesgo deben detener el loop.

## Forma del Sistema

- **Límite del pattern:** un controller elige repetidamente el siguiente paso, lo ejecuta, observa el resultado y decide si continuar.
- **Dueño del state:** el loop controller es dueño del progreso, presupuestos, condiciones de parada y recovery state.
- **Artifact principal:** `reflection-and-self-improvement-pattern/` contiene la implementación de referencia ejecutable y ejemplos.
- **Promesa operativa:** Reflection le pide a un agent o evaluator que inspeccione la salida previa e identifique mejoras concretas.
- **Ruta ejecutable:** comienza con `npm run reflection-self-improvement-agent` antes de adaptar el pattern a un sistema más grande.

## Protocolo Central

1. Inicializa el goal state, restricciones, presupuestos y condiciones de parada.
2. Elige la siguiente acción desde el state actual en vez de asumir todo el camino por adelantado.
3. Ejecuta la acción mediante un tool validado, worker o función local.
4. Observa el resultado y actualiza el state con evidencia, errores y trabajo restante.
5. Detén, reintenta, replanifica o escala según la policy explícita.

## Notas de Implementación

- Mantén explícito el límite del pattern: los inputs, state, efectos secundarios y outputs deben ser visibles.
- Valida las decisiones producidas por el model antes de que afecten tools, usuarios o durable state.
- Emite suficiente trace data para depurar fallas después de la ejecución.

## Modos de Falla

- El pattern se aplica donde un workflow determinista más simple sería mejor.
- El state, llamadas a tools o decisiones del model no son lo suficientemente observables para depurar.
- El sistema carece de comportamientos claros de parada, reintento o escalamiento.

## Estrategia de Evaluación

- Prueba casos de éxito, fallas parciales, fallas repetidas, agotamiento de presupuesto y observaciones intermedias incorrectas.
- Asegúrate de que el loop se detenga por la razón correcta y no oculte pasos fallidos.
- Mide tasa de finalización, número de iteraciones, calidad de recuperación, costo y latencia.
- Incluye casos que prueben que cada condición de "Úsalo Cuando" es verdadera para este pattern.
- Incluye casos negativos de "Evítalo Cuando" para que el sistema elija un pattern más simple o seguro cuando corresponda.

## Lista de Verificación para Producción

- Establece límites estrictos de iteración, costo y tiempo.
- Persiste el state después de pasos significativos si la ejecución puede ser interrumpida.
- Haz que los reintentos sean idempotentes o agrega compensación.
- Expón trace events para cada decisión, acción, observación y razón de parada.
- Define escalamiento humano para trabajo ambiguo, de alto riesgo o bloqueado por policy.
- Mantén el source bundle, capítulo generado, pruebas y deployment artifact en la misma release.

## Ejecuta el Ejemplo

```sh
npm run reflection-self-improvement-agent
```

## Recorrido del Código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código Fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y el repository source.

### `reflection-and-self-improvement-pattern/autogen_typescript_example/reflection_agent.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/reflection-and-self-improvement-pattern/autogen_typescript_example/reflection_agent.ts)

```ts
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import readline from 'readline';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

if (!MISTRAL_API_KEY) {
  console.error('Please set MISTRAL_API_KEY in your .env file');
  process.exit(1);
}

async function askMistral(messages: any[]) {
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

  rl.question('Ask the agent a question: ', async (userInput) => {
    let messages = [
      { role: 'system', content: 'You are a helpful assistant that reflects on your answers and tries to improve them if possible.' },
      { role: 'user', content: userInput },
    ];

    // First response
    let answer = await askMistral(messages);
    console.log('\nInitial Answer:\n', answer);

    // Reflection step
    messages.push({ role: 'assistant', content: answer });
    messages.push({ role: 'system', content: 'Reflect on your previous answer. Was it correct, clear, and complete? If not, revise and improve it.' });
    let reflection = await askMistral(messages);
    console.log('\nReflected/Improved Answer:\n', reflection);

    rl.close();
  });
}

main();
```

### `reflection-and-self-improvement-pattern/langgraph_python_example/reflection_agent.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/reflection-and-self-improvement-pattern/langgraph_python_example/reflection_agent.py)

```py
import os
import requests

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
    user_input = input('Ask the agent a question: ')
    messages = [
        {'role': 'system', 'content': 'You are a helpful assistant that reflects on your answers and tries to improve them if possible.'},
        {'role': 'user', 'content': user_input},
    ]
    # First response
    answer = ask_mistral(messages)
    print('\nInitial Answer:\n', answer)
    # Reflection step
    messages.append({'role': 'assistant', 'content': answer})
    messages.append({'role': 'system', 'content': 'Reflect on your previous answer. Was it correct, clear, and complete? If not, revise and improve it.'})
    reflection = ask_mistral(messages)
    print('\nReflected/Improved Answer:\n', reflection)

if __name__ == '__main__':
    main()
```

## Descarga

- [Download source bundle](/downloads/reflection.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/reflection-and-self-improvement-pattern)

El bundle de descarga contiene la carpeta actual `reflection-and-self-improvement-pattern/` de este repositorio.

## Patrones Relacionados

- [Planning and Execution](/control-loops/planning-and-execution)
- [ReAct](/control-loops/react)
- [Evaluator-Optimizer](/control-loops/evaluator-optimizer)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
