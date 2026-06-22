---
title: Planning and Execution
---

# Planning and Execution

La planificación separa la decisión de qué hacer de la ejecución. El planner crea pasos; el executor los ejecuta, reporta el progreso y maneja errores.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/planning-pattern)
> - [Download code bundle](/downloads/planning-and-execution.zip)

## Propósito

La planificación separa la decisión de qué hacer de la ejecución. El planner crea pasos; el executor los ejecuta, reporta el progreso y maneja errores.

## Usar cuando

- El task tiene una secuencia significativa, dependencias o puntos de falla recuperables.
- Quieres inspeccionar o revisar el plan antes de ejecutarlo.
- La ejecución puede ser determinista incluso si la planificación usa un model.

## Evitar cuando

- El plan siempre sería de un solo paso.
- El executor no puede reportar progreso estructurado o fallas.
- Se permite que el model ejecute planes no validados directamente.

## Arquitectura

Usa este diagrama para leer Planning and Execution como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el loop controller es dueño del progreso, presupuestos, condiciones de parada y recovery state.

![Planning and execution control flow](../public/diagrams/planning-execution-control-flow.svg)

Léelo como un handoff controlado: el planner propone pasos, el controller valida el plan, y el executor ejecuta solo los pasos validados con progreso observable.

## Forma del sistema

- **Límite del pattern:** un controller elige repetidamente el siguiente paso, lo ejecuta, observa el resultado y decide si continuar.
- **Dueño del state:** el loop controller es dueño del progreso, presupuestos, condiciones de parada y recovery state.
- **Artifact principal:** `planning-pattern/` contiene la implementación de referencia ejecutable y ejemplos.
- **Promesa operativa:** la planificación separa la decisión de qué hacer de la ejecución. El planner crea pasos; el executor los ejecuta, reporta el progreso y maneja errores.
- **Ruta ejecutable:** comienza con `npm run plan:test` antes de adaptar el pattern a un sistema más grande.

## Protocolo central

1. Inicializa goal state, restricciones, presupuestos y condiciones de parada.
2. Elige la siguiente acción desde el state actual en vez de asumir todo el camino de antemano.
3. Ejecuta la acción a través de un tool, worker o función local validada.
4. Observa el resultado y actualiza el state con evidencia, errores y trabajo restante.
5. Detén, reintenta, re-planifica o escala según la policy explícita.

## Notas de implementación

- Mantén explícito el límite del pattern: inputs, state, efectos secundarios y outputs deben ser visibles.
- Valida las decisiones producidas por el model antes de que afecten tools, usuarios o durable state.
- Emite suficiente trace data para depurar fallas después de la ejecución.

## Modos de falla

- El pattern se aplica donde un workflow determinista más simple sería mejor.
- State, llamadas a tools o decisiones del model no son lo suficientemente observables para depurar.
- El sistema carece de un comportamiento claro de parada, reintento o escalamiento.

## Estrategia de evaluación

- Prueba casos de éxito, fallas parciales, fallas repetidas, agotamiento de presupuesto y malas observaciones intermedias.
- Asegura que el loop se detenga por la razón correcta y no oculte pasos fallidos.
- Mide tasa de finalización, número de iteraciones, calidad de recuperación, costo y latencia.
- Incluye casos que prueben que cada condición de "Usar cuando" es verdadera para este pattern.
- Incluye casos negativos de "Evitar cuando" para que el sistema elija un pattern más simple o seguro cuando corresponda.

## Lista de verificación para producción

- Establece límites estrictos de iteración, costo y tiempo.
- Persiste el state después de pasos significativos si la ejecución puede ser interrumpida.
- Haz que los reintentos sean idempotentes o agrega compensación.
- Expón eventos de trace para cada decisión, acción, observación y razón de parada.
- Define escalamiento humano para trabajo ambiguo, de alto riesgo o bloqueado por policy.
- Mantén el source bundle, capítulo generado, pruebas y deployment artifact en la misma versión.

## Ejecuta el ejemplo

```sh
npm run plan:test
npm run plan:run -- "Compute average of [1,2,3,4]"
npm run plan:py
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control flow.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y en el repository source.

### `planning-pattern/typescript/src/planner.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/planning-pattern/typescript/src/planner.ts)

```ts
import axios from 'axios';

const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions';

export interface PlanStep { id: string; description: string }
export interface Plan { steps: PlanStep[]; rationale: string }

function extractNumbers(goal: string): number[] {
  const bracketed = goal.match(/\[([^\]]+)\]/)?.[1];
  if (!bracketed) return [1, 2, 3, 4];

  const numbers = bracketed
    .split(',')
    .map(value => Number(value.trim()))
    .filter(Number.isFinite);

  return numbers.length > 0 ? numbers : [1, 2, 3, 4];
}

export async function planTask(goal: string, apiKey?: string): Promise<Plan> {
  if (!apiKey) {
    const numbers = extractNumbers(goal);
    // deterministic fallback plan (no network) for tests
    return { steps: [
      { id: 's1', description: `Load numbers [${numbers.join(',')}]` },
      { id: 's2', description: 'Compute average' }
    ], rationale: 'synthetic' };
  }
  const resp = await axios.post(MISTRAL_API, {
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: 'Return JSON {steps: [{id, description}], rationale} for the goal.' },
      { role: 'user', content: goal }
    ],
    temperature: 0
  }, { headers: { Authorization: `Bearer ${apiKey}` } });
  const content = resp.data?.choices?.[0]?.message?.content || '';
  try { return JSON.parse(content); } catch { return { steps: [], rationale: content }; }
}
```

### `planning-pattern/typescript/src/executor.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/planning-pattern/typescript/src/executor.ts)

```ts
export type ExecutionFailure = {
  status: "failed";
  error_type: "unsupported_step" | "missing_numbers";
  step_id: string;
  description: string;
};

export type ExecutionValue = number[] | number | ExecutionFailure;
export type ExecutionResults = Record<string, ExecutionValue>;

export async function executePlan(steps: { id: string; description: string }[], onProgress?: (pct: number, stage: string) => void): Promise<ExecutionResults> {
  const results: ExecutionResults = {};
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    onProgress?.(Math.round((i / steps.length) * 100), s.id);
    // trivial synthetic execution
    if (s.description.includes('Load numbers')) {
      const raw = s.description.match(/\[([^\]]+)\]/)?.[1] ?? '';
      results[s.id] = raw
        .split(',')
        .map(value => Number(value.trim()))
        .filter(Number.isFinite);
    }
    else if (s.description.includes('Compute average')) {
      const arr = Array.isArray(results['s1']) ? results['s1'] : [];
      results[s.id] = arr.length > 0
        ? arr.reduce((a:number,b:number)=>a+b,0)/arr.length
        : {
          status: "failed",
          error_type: "missing_numbers",
          step_id: s.id,
          description: s.description
        };
    } else results[s.id] = {
      status: "failed",
      error_type: "unsupported_step",
      step_id: s.id,
      description: s.description
    };
  }
  onProgress?.(100, 'done');
  return results;
}
```

### `planning-pattern/typescript/src/run.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/planning-pattern/typescript/src/run.ts)

```ts
import { planTask } from './planner.ts';
import { executePlan } from './executor.ts';

async function main() {
  const goal = process.argv.slice(2).join(' ') || 'Compute average of [1,2,3,4]';
  const plan = await planTask(goal, process.env.MISTRAL_API_KEY);
  console.log('Plan:', plan);
  const results = await executePlan(plan.steps, (pct, stage) => console.log('Progress', pct, stage));
  console.log('Results:', results);
}

main();
```

## Descarga

- [Download source bundle](/downloads/planning-and-execution.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/planning-pattern)

El bundle de descarga contiene la carpeta actual `planning-pattern/` de este repositorio.

## Patrones relacionados

- [ReAct](/control-loops/react)
- [Reflection](/control-loops/reflection)
- [Evaluator-Optimizer](/control-loops/evaluator-optimizer)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
