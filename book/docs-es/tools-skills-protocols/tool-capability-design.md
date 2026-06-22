---
title: Tool Capability Design
---

# Tool Capability Design

Los tools son donde los agentic systems se vuelven reales. Antes de los tools, el model solo puede producir texto. Después de los tools, puede leer sistemas, escribir sistemas, gastar dinero, enviar mensajes, cambiar state y activar workflows. Por eso, el diseño de tools no es un detalle de implementación. Es arquitectura.

Un agent fuerte no necesita una lista grande de tools. Necesita los tools correctos, con contratos claros, autoridad limitada, errores útiles y resultados observables.

Descarga la [lista de verificación para revisión de tool capability design](/capstone-assets/templates/tool-capability-design-review-checklist.txt) cuando revises una nueva tool surface, un MCP server o un set de agent capability.

![Arquitectura de uso de tool con enfoque MCP-first](../public/diagrams/mcp-first-tool-use.svg)

## The Tool Surface Is A Control Plane

La tool surface decide qué puede hacer el agent, así que no trates los tools como funciones auxiliares que simplemente expones a un model. Trata la surface como un control plane con seguridad, confiabilidad y semántica de producto.

Cada tool debe poder responder qué capability expone, quién puede llamarla, qué inputs son válidos, qué state puede leer, qué state puede cambiar, qué efectos secundarios puede producir, qué policy checks aplican, qué forma de resultado retorna y cómo se traza, reproduce o audita. Cuando esas respuestas no son explícitas, el sistema depende de la disciplina del prompt para mantenerse seguro, que es el lugar más débil para poner un límite.

## Narrow Tools Beat Broad Tools

Los broad tools parecen convenientes y usualmente son peligrosos. Los que debes evitar son los primitivos abiertos:

- `run_sql(query)`;
- `execute_shell(command)`;
- `send_http_request(method, url, body)`;
- `update_customer_record(fields)`;
- `manage_ticket(action, payload)`.

Estos obligan al model a inventar el límite de seguridad en runtime, que es exactamente el lugar equivocado. Prefiere tools que codifican el workflow en su lugar:

- `lookup_customer_by_id(customer_id)`;
- `get_refund_eligibility(order_id)`;
- `draft_refund_request(order_id, reason)`;
- `submit_refund_for_approval(request_id)`;
- `create_ticket_reply_draft(ticket_id, body)`;
- `post_approved_ticket_reply(ticket_id, draft_id)`.

Los narrow tools reducen la carga del prompt, mejoran la evaluación y hacen mucho más fácil la aplicación de policy, porque el workflow vive en la tool surface en vez de depender del criterio del model.

## Capability Classes

Clasifica cada tool por capability.

| Capability Class | Example | Risk |
| --- | --- | --- |
| Read public data | search docs, fetch public page. | información desactualizada o no confiable. |
| Read private data | customer lookup, internal database query. | fuga de privacidad, falla en el límite de tenants. |
| Read untrusted content | email, webpage, user document, ticket comment. | prompt injection e instrucciones hostiles. |
| Write internal state | update CRM, create ticket, save memory. | registros corruptos o mal state durable. |
| External communication | send email, post message, submit form, webhook. | exfiltración de datos o comunicación no deseada. |
| Code or shell execution | run tests, execute script, modify files. | efectos secundarios arbitrarios. |
| Money or entitlement change | refund, purchase, credit, permission grant. | impacto financiero o de control de acceso. |

Esta clasificación debe estar en el tool manifest o registro, no solo en el texto.

## Tool Risk Matrix

Las capability classes son útiles, pero los sistemas en producción también necesitan una vista de riesgo operacional. Un tool puede parecer inofensivo en aislamiento y volverse peligroso cuando se combina con datos privados, contenido no confiable, comunicación externa o memory durable.

| Tool Type | Primary Risk | Required Control |
| --- | --- | --- |
| Read public data | contenido desactualizado, de baja calidad o hostil. | metadatos de fuente, señal de frescura y manejo de contenido no confiable. |
| Read private data | fuga de privacidad o falla en el límite de tenants. | autorización limitada, audit log y redacción de outputs. |
| Read untrusted content | prompt injection. | aislamiento de contenido, eliminación de instrucciones y policy checks antes de la acción. |
| Write business state | registros corruptos o avance de workflow no intencionado. | schema estricto, idempotency key, decisión de policy y trace. |
| External communication | exfiltración de datos o entrega de mensajes no deseados. | puerta de aprobación, validación de destinatario y auditoría de mensajes. |
| Browser or code execution | efectos secundarios arbitrarios y acceso de red oculto. | sandbox, egress policy, timeout y límites de filesystem/network. |
| Memory write | contaminación durable o falla en la retención de privacidad. | memory policy, atribución de fuente, retention class y ruta de eliminación. |
| Credential use | confused deputy o escalamiento de privilegios. | credenciales de corta duración, scope binding, audience checks y redacción de secretos. |

El punto no es hacer cada tool pesado. El punto es que el runtime sepa cuáles tools son pesados. Un tool de búsqueda en documentación pública y un tool de pagos no deben vivir detrás de las mismas reglas de policy, trace, retry y aprobación.

## Tool Manifest

Un tool manifest útil es más que un nombre y una descripción.

| Field | Purpose |
| --- | --- |
| Name | Identificador estable usado en traces, evals y policy. |
| Description | Qué hace el tool, escrito para una selección correcta. |
| Input schema | Campos requeridos, tipos, límites, enums y reglas de validación. |
| Output schema | Resultado estructurado, rechazo, resultado parcial o error. |
| Capability class | Read, write, communication, code execution, private data, untrusted content. |
| Side effects | Qué puede cambiar si el tool tiene éxito. |
| Idempotency | Si llamadas repetidas son seguras y cómo se manejan los duplicados. |
| Permissions | Qué roles, agents, rutas o tenants pueden llamarlo. |
| Approval rule | Cuándo la llamada debe ser revisada por un humano o workflow. |
| Trace fields | Correlation ID, actor, resource, policy decision y result. |
| Data handling | Redacción, retención, privacy class y restricciones de logging. |

Si a un tool le faltan estos campos, el runtime debe tratarlo como de alto riesgo por defecto.

Un manifest compacto puede hacer esos límites explícitos:

```yaml
name: draft_refund_request
description: Drafts a refund request for human approval. It does not issue money.
capabilities:
  - read_private_data
  - write_internal_state
side_effects:
  - creates_refund_draft
permissions:
  roles:
    - support_agent
approval:
  required_for:
    - submit_refund
input_schema:
  type: object
  required:
    - order_id
    - reason
  properties:
    order_id:
      type: string
    reason:
      type: string
      maxLength: 500
output_schema:
  type: object
  required:
    - draft_id
    - status
  properties:
    draft_id:
      type: string
    status:
      enum:
        - created
        - refused
        - needs_more_context
trace:
  fields:
    - run_id
    - actor_id
    - policy_version
    - approval_id
```

El nombre del tool dice lo que el tool hace y lo que no hace. Un tool separado debe enviar el refund después de la aprobación.

Para sistemas fuertemente tipados, el mismo contrato puede representarse como código y registrarse con el tool runtime:

```ts
type CapabilityClass =
  | "read_public"
  | "read_private"
  | "read_untrusted"
  | "write_side_effect"
  | "external_communication"
  | "browser_or_code"
  | "memory_write"
  | "credential_use";

type ToolCapabilityManifest = {
  name: string;
  owner: string;
  version: string;
  description: string;
  inputSchemaRef: string;
  outputSchemaRef: string;
  risk: "low" | "medium" | "high" | "critical";
  capabilityClasses: CapabilityClass[];
  requiredScopes: string[];
  sideEffects: "none" | "draft" | "external_write" | "money_movement" | "message_send";
  idempotencyRequired: boolean;
  approvalRequired: boolean;
  timeoutMs: number;
  egress: {
    allowedDomains: string[];
    allowPrivateNetwork: boolean;
  };
  observability: {
    requiredTraceFields: string[];
    redactFields: string[];
  };
};

const refundDraftTool: ToolCapabilityManifest = {
  name: "draft_refund_request",
  owner: "support-platform",
  version: "2026-06-17",
  description: "Creates a refund draft for human approval. It does not issue money.",
  inputSchemaRef: "schemas/refund-draft-input.json",
  outputSchemaRef: "schemas/refund-draft-output.json",
  risk: "high",
  capabilityClasses: ["read_private", "write_side_effect"],
  requiredScopes: ["orders:read", "refunds:draft"],
  sideEffects: "draft",
  idempotencyRequired: true,
  approvalRequired: false,
  timeoutMs: 5000,
  egress: {
    allowedDomains: [],
    allowPrivateNetwork: false,
  },
  observability: {
    requiredTraceFields: ["run_id", "actor_id", "order_id", "policy_version"],
    redactFields: ["customer_email", "payment_token"],
  },
};
```

Esto parece burocrático solo hasta el primer incidente. Después de eso, se convierte en el mapa de lo que el agent podía hacer, qué versión de policy estaba activa, qué datos cruzaron el límite y qué equipo es responsable de la solución.

## Interfaces Amigables para Agents

Una tool diseñada para humanos no siempre es una tool diseñada para agents. Las tools amigables para agents tienen schemas explícitos, descripciones cortas y específicas, nombres estables, ejemplos de llamadas válidas e inválidas, errores claros, structured outputs, tamaños de resultados acotados, correlation IDs y valores de estado legibles por máquina, sin state global oculto ni efectos secundarios inesperados.

Los mensajes de error tienen más peso del que la gente espera. Un `failed` vago hace que el model adivine. Un error útil dice qué falló, si es seguro reintentar y qué campo necesita corrección, lo cual marca la diferencia entre una recuperación limpia y un retry loop confuso.

## Checklist de Interfaz Tool Agent-First

Diseña cada llamada de tool para que el agent pueda decidir, ejecutar y recuperarse sin adivinar:

- nombra la capability, no el detalle de implementación;
- declara inputs requeridos, inputs opcionales, límites y side effects;
- retorna status legible por máquina, datos de resultado y códigos de error recuperables;
- registra el request id, actor, policy decision y recurso afectado;
- provee modo dry-run o preview para operaciones destructivas;
- documenta el comportamiento fallback cuando la tool es denegada, no está disponible o tiene rate-limit.

La interfaz debe hacer que el camino seguro sea el camino más corto.

## Los Resultados de Tool Son Datos

Los resultados de una tool no deben convertirse en nuevas instrucciones. Un resultado de búsqueda, página web, correo, ticket, documento o línea de log puede contener texto malicioso o irrelevante. El model puede inspeccionarlo como evidencia, pero el runtime no debe permitir que sobreescriba los goals del sistema, permisos de tool, reglas de aprobación o memory policy.

Los buenos resultados de tool mantienen sus partes separadas: metadata confiable, el contenido no confiable en sí, la fuente, timestamp, nivel de confianza, permisos y estado de redacción. Esa separación hace más segura la construcción de context y facilita la evaluación.

## Credenciales y Límites de Egreso

Un agent no debe tener credenciales amplias. El runtime debe intercambiar la identidad del agent, task, tenant y capability aprobada por una credencial limitada en el momento de invocar la tool. Esa credencial debe tener vida corta, audiencia acotada y solo los permisos necesarios para la llamada específica.

La misma idea aplica al egreso de red. Una tool que lee un servicio de órdenes interno no debería poder enviar solicitudes HTTP arbitrarias a internet. Una browser tool no debe acceder a redes privadas a menos que el run explícitamente requiera ese acceso. Una code execution tool no debe heredar por defecto el environment de la máquina del desarrollador.

Como mínimo, las tools de alto riesgo necesitan:

- claims OAuth u OIDC acotados y verificados por el servidor de la tool;
- TLS para transporte service-to-service;
- allowlists de egreso por tool;
- sin secretos ambientales en prompts, logs o resultados de tool;
- binding de tenant y actor en cada request;
- redacción antes de traces, eval fixtures y memory writes;
- soporte de revocación y kill-switch.

Aquí es donde el diseño de la tool se conecta con la arquitectura de servicio. El model selecciona una acción. El runtime autoriza la acción. La tool ejecuta la acción. Esas responsabilidades no deben colapsar en un solo prompt.

## Requisitos de Observabilidad

Las llamadas de tool necesitan traces que expliquen tanto qué ocurrió como por qué el runtime lo permitió. Un trace útil de tool incluye el run ID, agent ID, actor o service principal, nombre y versión de la tool, input shape, resumen redacted del input, policy decision, approval ID cuando aplica, idempotency key, timeout, retry count, status del resultado, clase de error, latencia, referencia de token context y estado de redacción.

No registres cargas sensibles en bruto solo porque depurar es más fácil así. El trace de producción debe ser suficiente para reconstruir el camino de decisión sin convertir la observabilidad en una fuga de datos secundaria.

Para revisión de incidentes, el trace debe responder:

- ¿Qué tool fue llamada?
- ¿Qué clases de capability estaban activas?
- ¿Qué policy permitió o bloqueó la llamada?
- ¿Había contenido no confiable en el context antes de la llamada?
- ¿Se devolvieron datos privados?
- ¿Datos privados salieron por un canal externo?
- ¿Se requirió aprobación y estaba ligada a la acción exacta?
- ¿La llamada fue replayed, reintentada o deduplicada?

## Divulgación Progresiva de Tools

No muestres cada tool a cada agent en cada paso. Exponlas progresivamente:

1. Comienza con la ruta o tipo de task.
2. Carga el set de tools más pequeño y útil.
3. Agrega tools solo después de que el state lo justifique.
4. Elimina tools cuando cambia la fase.
5. Requiere aprobación o policy checks para cadenas cross-capability.

Un support agent, por ejemplo, podría comenzar con policy de solo lectura y tools de order-lookup. La creación de reembolsos aparece solo después de establecer elegibilidad, el envío de reembolso solo después de que existe un borrador, y la mensajería externa al cliente solo después de aprobación. Divulgar tools de esta forma reduce errores de selección y limita el alcance de prompt injection.

## Composición de Tools

El peligro suele estar en la cadena, no en una sola tool. Una tool de solo lectura de datos privados está bien por sí sola. Una tool de mensajería externa está bien por sí sola. Una browser tool está bien por sí sola. La cadena se vuelve insegura cuando un run combina datos privados, contenido no confiable y comunicación externa, así que evalúa cadenas de tools, no solo llamadas individuales.

Para cada run, pregunta qué capabilities están presentes, si contenido no confiable entró al context, si datos privados pueden salir por algún canal de salida, si la acción de escritura está justificada por evidencia confiable, si el registro de aprobación está ligado a la acción exacta y si un workflow determinista más seguro podría hacer lo mismo. Aquí es donde el diseño de la tool se conecta directamente con el threat modeling.

## Guía de Evaluación

Los tool evals deben probar tanto la selección como la contención. Construye casos donde el comportamiento correcto sea llamar a la tool adecuada, pero también casos donde lo correcto sea no llamar ninguna tool, pedir input faltante, rechazar una acción no soportada, enrutar a aprobación, usar una tool de solo lectura en vez de una de escritura, evitar comunicación externa, detenerse después de que una tool retorna instrucciones no confiables, recuperarse de una respuesta malformada o reintentar solo cuando sea seguro.

Luego mide la precisión de selección de tool, tasa de argumentos inválidos, tasa de llamadas no autorizadas, precisión de enrutamiento de aprobación, prevención de cadenas inseguras, grounding de resultados de tool, latencia y costo por camino de tool, y recuperación de errores de tool. Una respuesta final puede parecer correcta aunque la trayectoria de tool haya sido insegura, así que evalúa la trayectoria.

Los buenos tool evals son vertical slices. No pruebes solo `call_tool(input)`. Prueba el camino completo desde la solicitud del usuario hasta la construcción de context, divulgación de tool, policy decision, invocación de tool, manejo de resultados, comportamiento de memory, respuesta final, trace y replay. Ahí es donde se esconden los bugs reales.

Escenarios útiles de eval incluyen:

- un camino normal y exitoso;
- input requerido faltante;
- input malformado pero recuperable;
- contenido no confiable que intenta sobreescribir instrucciones;
- datos privados seguidos de una solicitud de comunicación externa;
- envío duplicado o retry después de timeout;
- aprobación requerida pero faltante;
- resultado de tool obsoleto;
- tool retorna datos parciales;
- tool deshabilitada por policy;
- memory write solicitado a partir de evidencia no confiable.

El objetivo de la evaluación no es solo si la respuesta final se lee bien. Es si el sistema usó la autoridad mínima necesaria, respetó la policy, preservó la evidencia, evitó cadenas inseguras y dejó un rastro de auditoría útil.

## Checklist de Diseño

Antes de exponer una tool a un agent, verifica:

- ¿La tool es lo suficientemente acotada?
- ¿El input schema es estricto?
- ¿El output es estructurado?
- ¿Los side effects son explícitos?
- ¿La clase de capability está declarada?
- ¿La clase de riesgo está declarada?
- ¿Los permisos se aplican fuera del prompt?
- ¿Las credenciales son de vida corta y acotadas?
- ¿El egreso está restringido a lo que la tool necesita?
- ¿La tool soporta idempotency donde es necesario?
- ¿Los retries son seguros y acotados?
- ¿Las aprobaciones están ligadas a la acción exacta?
- ¿Los errores son accionables?
- ¿Los traces son completos y redactados?
- ¿Datos privados y contenido no confiable están marcados por separado?
- ¿La tool puede ser mockeada en evals?
- ¿La tool puede ser replayed sin repetir side effects inseguros?
- ¿La tool puede ser deshabilitada rápidamente?
- ¿La tool retorna contenido no confiable como datos, no como instrucciones?

La prueba es simple: si el model llama incorrectamente a esta tool, ¿puede la arquitectura detectarlo antes de que ocurra un daño?

## Capítulos Relacionados

- [Tool Use](../foundations/tool-use)
- [MCP-first Tool Use](./mcp-first-tool-use)
- [Skills](./skills)
- [Human Approval Gates](./human-approval-gates)
- [Agent Threat Model](../agent-engineering-practice/agent-threat-model)
- [Agent Security and Sandboxing](../agent-engineering-practice/agent-security-and-sandboxing)
- [Secure Agent Communication](./secure-agent-communication)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Production Runtime Overview](../production-runtime/overview)
- [Evaluation-Driven Agent Development](../agent-engineering-practice/evaluation-driven-agent-development)
