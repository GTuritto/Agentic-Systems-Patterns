---
title: Mastra Runtime
---

# Mastra Runtime

Mastra es un pattern de runtime en TypeScript para aplicaciones que necesitan agents, workflows, tools, memory, evals y observability en un solo framework.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/mastra-runtime-pattern)
> - [Download code bundle](/downloads/mastra-runtime.zip)

## Propósito

El Mastra Runtime Pattern utiliza Mastra como runtime en TypeScript para aplicaciones de agent en producción. Mastra proporciona a los agents, workflows, tools, memory, evals y observability una estructura de aplicación compartida.

## Úsalo cuando

- Estás construyendo un producto de agent basado en TypeScript o Node.
- Necesitas agents y workflows deterministas en el mismo runtime.
- Quieres que memory, tools, evals y tracing sean preocupaciones de primera clase.

## Evítalo cuando

- Solo necesitas un script pequeño o una sola llamada a un model.
- Tu equipo está comprometido con un stack de agent en Python.
- No puedes aceptar convenciones de framework sobre estructura de proyecto y despliegue.

## Arquitectura

Usa este diagrama para leer Mastra Runtime como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el runtime es dueño del state durable, retries, traces, triggers, configuración de despliegue y controles operativos.

![Mastra runtime architecture](../public/diagrams/mastra-runtime.svg)

## Forma del sistema

- **Límite de aplicación:** el servicio del producto es dueño de la identidad de usuario, alcance de tenant, validación de solicitudes y entrega de respuestas.
- **Límite de runtime:** Mastra aloja los agent, workflow, tools, memory, evals y preocupaciones de observability.
- **Límite de workflow:** las transiciones de state deterministas, retries, esperas de aprobación y puntos de rollback pertenecen a los workflows, no a los prompts.
- **Límite de tool:** los tools exponen entradas tipadas, salidas tipadas, etiquetas de side-effect, requisitos de permisos y campos de trace.
- **Límite de policy:** la policy del producto se ejecuta antes de tools, escrituras de memory, mensajes salientes o side effects externos.
- **Límite de portabilidad:** los prompts, manifiestos de tools, fixtures de eval, schema de trace y reglas de policy siguen siendo legibles fuera del código específico de Mastra.

## Protocolo central

1. Acepta una solicitud con actor, tenant, goal, versión de release y clave de idempotencia.
2. Carga la configuración de runtime, policy de memory, registro de tools y state de workflow.
3. Enruta los pasos deterministas a través del workflow y las decisiones abiertas a través del agent.
4. Verifica la policy antes de la recuperación, escrituras de memory, llamadas a tools y respuestas finales que requieran evidencia aprobada.
5. Ejecuta tools mediante wrappers tipados que registran estado, latencia, costo, número de retries e IDs de side-effect.
6. Emite eventos de trace para pasos de workflow, llamadas a model, llamadas a tool, decisiones de policy, acceso a memory y resultados de eval.
7. Ejecuta evals posteriores o de CI sobre el trace antes de promover el cambio.
8. Haz rollback deshabilitando el tool riesgoso, prompt, model, workflow o toda la ruta del agent.

## Notas de implementación

- Usa agents para decisiones abiertas donde el siguiente paso no se conoce de antemano.
- Usa workflows para control de flujo predefinido, transiciones de state, retries y orquestación de producción.
- Mantén los tools tipados y testeables de forma independiente.
- Captura traces y evals desde el inicio en lugar de agregarlos después de fallas.
- Mantén las credenciales de proveedores en variables de entorno y documéntalas en `.env.example`.
- Mantén los valores por defecto generados por el framework fuera de la product policy. La product policy debe ser visible en el código, pruebas, ADRs y fixtures de eval.
- Versiona prompts, tools, policies, contratos de memory, datasets de eval y definiciones de workflow juntos.
- Trata las actualizaciones de framework como cambios de runtime: ejecuta regression evals e inspecciona traces antes de promover.

## Modos de falla

- Tratar el framework como la arquitectura en vez de modelar goals, state y modos de falla.
- Poner lógica determinista de workflow dentro de prompts.
- Crear tools con descripciones vagas y entradas no validadas.
- Publicar sin datasets de eval o revisión de traces.
- Permitir que escrituras de memory omitan reglas de retención, eliminación, corrección o consentimiento.
- Exportar traces sin redacción o sin suficientes campos para reproducir una falla.
- Esconder rollback dentro de despliegues de código en vez de usar feature flags, deshabilitación de tools o endurecimiento de policy.

## Estrategia de evaluación

- Prueba por separado la ruta de agent, ruta de workflow, ruta de denegación de policy, ruta de aprobación y ruta de falla de tool.
- Asegúrate de que el trace contenga eventos de workflow, model, tool, policy, memory y evaluator para ejecuciones representativas.
- Compara cambios en prompt, model, tool y framework contra el mismo set de fixtures antes de liberar.
- Incluye un caso negativo donde el runtime deba redactar o escalar en vez de ejecutar un side effect.

## Lista de verificación para producción

- Documenta los comandos de instalación, ejecución local, prueba, eval y limpieza.
- Haz commit de `.env.example` y mantén los valores secretos fuera del código fuente.
- Define el state del workflow, retención de memory, side effects de tools y puntos de enforcement de policy.
- Exporta traces redactados al sistema de observability del equipo.
- Agrega gates de eval en CI para cambios en prompt, model, tool, policy, memory y workflow.
- Define rollback para model, prompt, tool, workflow, policy y deshabilitación total del agent.

## Ejecuta el ejemplo

```sh
npm run mastra-runtime:demo
npm run mastra-runtime:test
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo alrededor explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y en el repository source.

### `mastra-runtime-pattern/typescript/src/runtime_packaging.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/mastra-runtime-pattern/typescript/src/runtime_packaging.ts)

```ts
export type ToolCall = {
  name: string;
  input: Record<string, unknown>;
};

export type RuntimeTrace = {
  step: string;
  detail: Record<string, unknown>;
};

export type RuntimeState = {
  runId: string;
  goal: string;
  memory: Record<string, string>;
  traces: RuntimeTrace[];
  toolCalls: ToolCall[];
  result?: string;
};

export type Tool = {
  name: string;
  description: string;
  execute(input: Record<string, unknown>, state: RuntimeState): Promise<string>;
};

export type Agent = {
  name: string;
  instructions: string;
  decide(state: RuntimeState): Promise<ToolCall | { answer: string }>;
};

export type WorkflowStep = {
  name: string;
  run(state: RuntimeState): Promise<RuntimeState>;
};

export type PackagedRuntime = {
  agent: Agent;
  tools: Record<string, Tool>;
  workflow: WorkflowStep[];
  run(goal: string): Promise<RuntimeState>;
};

function trace(state: RuntimeState, step: string, detail: Record<string, unknown>) {
  state.traces.push({ step, detail });
}

export function createSupportRuntime(): PackagedRuntime {
  const tools: Record<string, Tool> = {
    read_policy: {
      name: "read_policy",
      description: "Read the support policy for a refund request.",
      execute: async input => `Policy ${input.policyId}: refunds under 30 days can be drafted for review.`,
    },
    draft_response: {
      name: "draft_response",
      description: "Draft a customer-safe response without sending it.",
      execute: async input => `Draft response for ${input.customerId}: refund request is ready for review.`,
    },
  };

  const agent: Agent = {
    name: "support-runtime-agent",
    instructions: "Check policy before drafting. Do not send messages directly.",
    decide: async state => {
      if (!state.memory.policy) {
        return { name: "read_policy", input: { policyId: "refund-v1" } };
      }
      if (!state.memory.draft) {
        return { name: "draft_response", input: { customerId: "cust_123" } };
      }
      return { answer: "Policy checked and draft created for human review." };
    },
  };

  const workflow: WorkflowStep[] = [
    {
      name: "agent_decision",
      run: async state => {
        const decision = await agent.decide(state);
        trace(state, "agent_decision", { decision });

        if ("answer" in decision) {
          state.result = decision.answer;
          return state;
        }

        const tool = tools[decision.name];
        if (!tool) throw new Error(`Unknown tool: ${decision.name}`);
```

_Extracto truncado por legibilidad. Descarga el bundle o abre el archivo fuente para la implementación completa._

### `mastra-runtime-pattern/typescript/test/runtime_packaging.spec.ts`

[Abrir el código fuente completo](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/mastra-runtime-pattern/typescript/test/runtime_packaging.spec.ts)

```ts
import { createSupportRuntime, evaluateRuntime } from "../src/runtime_packaging.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const runtime = createSupportRuntime();
const state = await runtime.run("Prepare a policy-safe refund response");
const evaluation = evaluateRuntime(state);

assert(state.result === "Policy checked and draft created for human review.", "Expected final runtime result");
assert(state.toolCalls.map(call => call.name).join(",") === "read_policy,draft_response", "Expected ordered tool calls");
assert(state.memory.policy.includes("refunds under 30 days"), "Expected policy memory");
assert(state.memory.draft.includes("ready for review"), "Expected draft memory");
assert(state.traces.some(event => event.step === "workflow_step"), "Expected workflow trace");
assert(state.traces.some(event => event.step === "agent_decision"), "Expected agent decision trace");
assert(evaluation.status === "pass", "Expected runtime evaluation to pass");

const unsafeEvaluation = evaluateRuntime({
  ...state,
  toolCalls: [...state.toolCalls, { name: "refunds.issue_refund", input: { amount: 42 } }],
});

assert(unsafeEvaluation.status === "fail", "Expected forbidden refund tool to fail evaluation");
assert(
  unsafeEvaluation.reasons.includes("forbidden tool was called: refunds.issue_refund"),
  "Expected forbidden tool reason"
);

console.log("Mastra-style runtime packaging tests OK");
```

## Descargar

- [Descargar paquete fuente](/downloads/mastra-runtime.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/mastra-runtime-pattern)

El paquete de descarga contiene la carpeta `mastra-runtime-pattern/` actual de este repositorio.

## Patrones Relacionados

- [Durable Workflow](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
- [Observability and Evals](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/observability-and-evals-pattern/README.md)
- [Agent Loop](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-loop-pattern/README.md)
