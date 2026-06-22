---
title: Tool Use
---

# Tool Use

El uso de tools le da a un agent acceso controlado a capacidades externas como calculadoras, búsquedas, bases de datos, archivos, ejecución de código, APIs o sistemas empresariales.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/tool-using-agent-pattern)
> - [Download code bundle](/downloads/tool-use.zip)

## Intento

El uso de tools permite que un agent cruce la frontera entre lenguaje y acción. El model puede proponer un cálculo, consulta, recuperación, operación de archivo, llamada a API, paso de workflow o acción de negocio, pero el software sigue siendo dueño del límite real de ejecución.

La idea importante es simple: el model no "usa el tool" directamente. El model propone una llamada a tool. El runtime valida la llamada, revisa la policy, ejecuta el tool, registra el resultado y decide si la observación puede influir en el siguiente paso.

Este pattern es dueño del límite entre propuesta y ejecución. No es responsable de la autorización de negocio, policy de aprobación humana, orquestación durable ni de la implementación interna de cada capability. Mantén esas responsabilidades en las capas de policy, aprobación, workflow y servicios.

## Usar cuando

- El task necesita hechos, cálculos, recuperación o acceso a sistemas fuera del context del model.
- El tool puede expresarse como una capability limitada con entradas tipadas y salidas estructuradas.
- El software puede validar los argumentos antes de la ejecución.
- Los permisos y revisiones de policy pueden ubicarse entre la intención del model y la ejecución del tool.
- El resultado puede ser trazado, reproducido, simulado o auditado.

## Evitar cuando

- Una función o workflow determinista puede hacer el trabajo sin selección del model.
- El tool propuesto es un primitivo amplio como `run_sql`, `send_http_request` o `execute_shell`.
- El tool puede crear efectos secundarios de alto riesgo sin aprobación.
- Los resultados del tool contienen contenido no confiable pero el sistema no puede separar datos de instrucciones.
- El equipo no puede explicar qué llamadas a tools están permitidas, prohibidas, reintentadas o escaladas.

## Arquitectura

Usa este diagrama para leer Tool Use como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el llamador o un pequeño servicio de aplicación es dueño del task state hasta que se introduce un runtime pattern.

![Tool use policy boundary](../public/diagrams/tool-use-policy-boundary.svg)

## Forma del sistema

- **Límite del pattern:** un agent runtime recibe un task, expone solo los tools necesarios para ese task, valida las llamadas propuestas por el model y retorna un resultado tipado.
- **Dueño del state:** el llamador, el motor de workflow o el agent runtime es dueño del task state. El model no debe ser el almacén durable de state.
- **Dueño del tool:** cada tool tiene un servicio o equipo responsable de schema, permisos, efectos secundarios, errores y campos de trace.
- **Límite de policy:** la ejecución del tool ocurre solo después de la validación de schema, autorización, revisión de presupuesto y reglas de aprobación.
- **Promesa operativa:** el uso de tools expande la capability del agent sin darle al model autoridad irrestricta.

## Protocolo central

1. Recibe un task acotado con identidad del llamador, goal, referencia de state y presupuesto.
2. Selecciona el conjunto de tools más pequeño y útil para el task o fase actual.
3. Solicita al model la siguiente acción o respuesta final.
4. Valida cualquier llamada a tool propuesta contra schema, permisos, presupuesto y policy.
5. Ejecuta el tool con timeout, clave de idempotencia y correlación de trace.
6. Retorna el resultado del tool como datos de observación, no como nuevas instrucciones.
7. Detén, reintenta, escala o continúa según reglas explícitas del runtime.

## Notas de implementación

Trata el registro de tools como una superficie de autoridad. Un registro pequeño es mejor que una lista grande de capabilities vagas.

```ts
type ToolName = 'read_order' | 'search_refund_policy' | 'draft_refund_request';

type ToolRequest = {
  runId: string;
  callerId: string;
  tool: ToolName;
  args: Record<string, unknown>;
  idempotencyKey: string;
};

const allowedToolsByRoute: Record<string, ToolName[]> = {
  refund_investigation: ['read_order', 'search_refund_policy', 'draft_refund_request']
};

function authorizeToolCall(route: string, request: ToolRequest) {
  const allowed = allowedToolsByRoute[route] ?? [];

  if (!allowed.includes(request.tool)) {
    return { status: 'denied', reason: 'tool_not_allowed' };
  }

  if (!request.idempotencyKey) {
    return { status: 'denied', reason: 'missing_idempotency_key' };
  }

  return { status: 'allowed' };
}
```

El model puede elegir entre `read_order`, `search_refund_policy` y `draft_refund_request`, pero no puede inventar `issue_refund` a menos que el runtime exponga ese tool y la policy lo permita.

Usa resultados estructurados de tools:

```ts
type ToolResult =
  | { status: 'ok'; data: unknown; evidenceRef: string }
  | { status: 'refused'; reason: string }
  | { status: 'retryable_error'; reason: string; retryAfterMs?: number }
  | { status: 'fatal_error'; reason: string };
```

No retornes cadenas simples para tools importantes. Las cadenas simples obligan al model a inferir si la llamada tuvo éxito, si es seguro reintentar y si el contenido es confiable.

## Modos de falla

- Se permite al model llamar a un tool amplio que puede realizar muchas acciones ocultas.
- Las descripciones de tools se convierten en el único límite de permisos.
- Los argumentos del tool no se validan antes de la ejecución.
- Un reintento duplica un efecto secundario porque no hay clave de idempotencia.
- Los resultados del tool que contienen correos, páginas web, tickets o documentos se tratan como instrucciones.
- La respuesta final parece correcta, pero la trayectoria del tool usó un camino prohibido o inseguro.
- Los errores del tool son vagos, así que el agent reintenta a ciegas o inventa evidencia faltante.
- Los traces registran la respuesta final pero no la llamada propuesta, la decisión de policy, el resultado del tool y la razón de detención.

## Estrategia de evaluación

Los evals de tool use deben probar tanto la capability como la restricción.

- Usa casos positivos donde el agent debe elegir el tool correcto con argumentos válidos.
- Usa casos negativos donde el comportamiento correcto es no llamar ningún tool, pedir input faltante, rechazar o escalar.
- Incluye casos de tools prohibidos como emisión directa de reembolsos, mensajería externa, ejecución de shell o exportación de datos privados.
- Simula tools para que los evals puedan inspeccionar la trayectoria sin tocar sistemas reales.
- Prueba resultados de tools malformados, timeouts, errores reintentables, errores fatales e instrucciones no confiables dentro de la salida del tool.
- Mide precisión en selección de tools, tasa de argumentos inválidos, tasa de llamadas no autorizadas, precisión en ruteo de aprobación, prevención de cadenas inseguras, costo, latencia y calidad de la razón de detención.

Un eval mínimo con tools simulados puede verse así:

```json
{
  "case_id": "refund_missing_policy",
  "input": "Customer asks for a refund, but no refund policy is available.",
  "expected": {
    "tools_called": ["read_order", "search_refund_policy"],
    "tools_not_called": ["draft_refund_request", "issue_refund"],
    "final_status": "needs_human"
  }
}
```

El eval no solo revisa la respuesta final. Revisa el camino.

## Lista de verificación para producción

- Mantén cada tool limitado y nombrado por su capability de negocio.
- Usa schemas tipados de entrada y salida.
- Declara clase de capability, efectos secundarios, permisos, reglas de aprobación y campos de trace.
- Valida los argumentos antes de la ejecución.
- Aplica permisos fuera del prompt.
- Agrega timeouts, límites de reintentos, claves de idempotencia y comportamiento de cancelación.
- Trata la salida no confiable del tool como datos, no instrucciones.
- Registra la llamada propuesta al tool, decisión de policy, resultado de ejecución, latencia, costo y razón de detención.
- Simula tools en los evals antes de conectar a sistemas de producción.
- Mantén un circuito de corte para tools riesgosos, rutas de model o capabilities del agent.

La regla arquitectónica es simple: expón la capability más pequeña que complete el task y valida cada uso propuesto antes de ejecutar. Continúa con [Tool Capability Design](/tools-skills-protocols/tool-capability-design) para diseño de interfaces y [Human Approval Gates](/tools-skills-protocols/human-approval-gates) para acciones de alto riesgo.

## Ejecuta el ejemplo

```sh
npm run tool-using-agent
npm run tool-runtime:test
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo alrededor explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o flujo de control.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y en el repository source.

### `tool-using-agent-pattern/typescript/src/tool_runtime.ts`

[Abrir fuente completa](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/tool-using-agent-pattern/typescript/src/tool_runtime.ts)

```ts
export type Route = "refund_investigation" | "order_status";
export type ToolName =
  | "read_order"
  | "search_refund_policy"
  | "draft_refund_request";

export type ToolProposal = {
  name: string;
  args: unknown;
  idempotencyKey: string;
};

export type ToolObservation =
  | {
      status: "ok";
      tool: ToolName;
      data: unknown;
      trust: "trusted_system" | "untrusted_content";
      evidenceRef: string;
    }
  | {
      status: "refused" | "retryable_error" | "fatal_error";
      tool?: string;
      reason: string;
    };

export type ToolContext = {
  route: Route;
  actorId: string;
  approvedActionIds: string[];
  timeoutMs: number;
  maxAttempts: number;
};

type ValidatedCall =
  | {
      name: "read_order";
      args: { orderId: string };
      idempotencyKey: string;
    }
  | {
      name: "search_refund_policy";
      args: { query: string };
      idempotencyKey: string;
    }
  | {
      name: "draft_refund_request";
      args: { orderId: string; amountCents: number; approvalId: string };
      idempotencyKey: string;
    };

export type ToolHandlers = {
  readOrder(args: { orderId: string }): Promise<unknown>;
  searchRefundPolicy(args: { query: string }): Promise<unknown>;
  draftRefundRequest(args: {
    orderId: string;
    amountCents: number;
    approvalId: string;
  }): Promise<unknown>;
};

const toolsByRoute: Record<Route, ToolName[]> = {
  refund_investigation: [
    "read_order",
    "search_refund_policy",
    "draft_refund_request",
  ],
  order_status: ["read_order"],
};

export function disclosedTools(route: Route): ToolName[] {
  return [...toolsByRoute[route]];
}

function objectArgs(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function validateProposal(
  proposal: ToolProposal,
  context: ToolContext,
): ValidatedCall | ToolObservation {
  if (!toolsByRoute[context.route].includes(proposal.name as ToolName)) {
    return {
      status: "refused",
      tool: proposal.name,
      reason: "tool_not_disclosed_for_route",
    };
```

_Fragmento truncado para facilitar la lectura. Descarga el bundle o abre el archivo fuente para ver la implementación completa._

### `tool-using-agent-pattern/typescript/test/tool_runtime.spec.ts`

[Abrir fuente completa](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/tool-using-agent-pattern/typescript/test/tool_runtime.spec.ts)

```ts
import {
  disclosedTools,
  ToolRuntime,
  type ToolContext,
  type ToolHandlers,
} from "../src/tool_runtime.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const baseContext: ToolContext = {
  route: "refund_investigation",
  actorId: "support-agent",
  approvedActionIds: [],
  timeoutMs: 20,
  maxAttempts: 2,
};

function handlers(overrides: Partial<ToolHandlers> = {}): ToolHandlers {
  return {
    readOrder: async ({ orderId }) => ({ orderId, status: "delivered" }),
    searchRefundPolicy: async ({ query }) => ({ text: query }),
    draftRefundRequest: async args => args,
    ...overrides,
  };
}

assert(
  disclosedTools("order_status").join(",") === "read_order",
  "Route must disclose only required tools",
);

const runtime = new ToolRuntime(handlers());
const valid = await runtime.execute(
  {
    name: "read_order",
    args: { orderId: "ORD-104" },
    idempotencyKey: "read:104",
  },
  baseContext,
);
assert(valid.status === "ok", "Valid read must execute");

const forbidden = await runtime.execute(
  {
    name: "issue_refund",
    args: { orderId: "ORD-104" },
    idempotencyKey: "refund:104",
  },
  baseContext,
);
assert(
  forbidden.status === "refused" &&
    forbidden.reason === "tool_not_disclosed_for_route",
  "Undisclosed tool must be refused",
);

const invalid = await runtime.execute(
  {
    name: "read_order",
    args: { orderId: 104 },
    idempotencyKey: "read:invalid",
  },
  baseContext,
);
assert(
  invalid.status === "refused" && invalid.reason === "invalid_arguments",
  "Invalid arguments must be refused",
);

const missingApproval = await runtime.execute(
  {
    name: "draft_refund_request",
    args: {
      orderId: "ORD-104",
      amountCents: 12500,
      approvalId: "APR-104",
    },
    idempotencyKey: "draft:104",
  },
  baseContext,
);
assert(
  missingApproval.status === "refused" &&
    missingApproval.reason === "approval_required",
  "Write-like tool must require approval",
);

let draftedRefunds = 0;
```

_Fragmento truncado para facilitar la lectura. Descarga el bundle o abre el archivo fuente para ver la implementación completa._

## Descargar

- [Descargar bundle de fuentes](/downloads/tool-use.zip)
- [Abrir carpeta de fuentes](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/tool-using-agent-pattern)

El bundle de descarga contiene la carpeta `tool-using-agent-pattern/` actual de este repositorio.

## Patrones relacionados

- [Single Agent](/foundations/single-agent)
- [Agent Loop](/foundations/agent-loop)
- [Structured Output](/foundations/structured-output)
- [MCP-first Tool Use](/tools-skills-protocols/mcp-first-tool-use)
- [Tool Capability Design](/tools-skills-protocols/tool-capability-design)
- [Human Approval Gates](/tools-skills-protocols/human-approval-gates)
- [Pattern Evaluation Checklist](/pattern-selection/pattern-evaluation-checklist)
- [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
