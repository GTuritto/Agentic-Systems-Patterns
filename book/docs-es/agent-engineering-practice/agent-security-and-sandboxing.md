---
title: Agent Security and Sandboxing
---

# Agent Security and Sandboxing

La seguridad de un agent es diferente a la seguridad de un chatbot porque los agents pueden actuar. Pueden leer datos privados, llamar APIs, escribir archivos, ejecutar código, activar workflows y comunicarse con otros sistemas.

Usa este capítulo cuando un agent tiene tools, memory, datos externos o efectos secundarios.

Comienza con el [Agent Threat Model](./agent-threat-model) si necesitas clasificar el riesgo del sistema. Usa este capítulo cuando estés listo para diseñar los controles de contención.

Este capítulo va después de harnesses y production runtime porque la seguridad no es una característica del prompt. Los mismos límites que hacen que un agent sea operable también lo hacen securable: identidad, autorización, sandboxing, egress, aprobaciones, trazabilidad y respuesta a incidentes.

## Security Model

Asegura los agents separando cuatro preocupaciones: lo que el usuario solicita, lo que el model propone, lo que la policy permite y lo que el tool realmente ejecuta. El model no debe ser el motor de policy. Puede clasificar la intención o explicar una decisión, pero el software determinista debe hacer cumplir los permisos.

En producción hay una quinta preocupación: cómo la solicitud cruza los límites de confianza. Si un agent llama a otro agent, a un tool gateway, a un servidor MCP, a un browser worker, a un workflow engine o a un data service, el sistema necesita transporte seguro, identidad del llamador, autorización con alcance y correlación de trace. TLS, mTLS, OAuth u OIDC, enforcement de policy y observability son parte del mismo límite.

El model puede proponer trabajo. No debe crear credenciales, elegir sus propios scopes, decidir que TLS es opcional, aprobar su propio egress de red ni ocultar eventos de seguridad en los traces.

## Security Layers

Usa este diagrama para ver el sandboxing como una capa dentro de un límite de seguridad más amplio. El model propone trabajo; la identidad, acceso a datos, policy de tools, sandboxing, controles de egress, aprobación, auditoría y respuesta a incidentes deciden lo que realmente puede suceder.

![Agent security layers](../public/diagrams/security-sandbox-layers.svg)

## Threats To Design For

La seguridad de agents es más fácil de razonar cuando la amenaza es concreta. Comienza con estos casos antes de agregar otros más exóticos.

| Threat | Cómo se presenta | Control que debe detectarlo |
| --- | --- | --- |
| Prompt injection | Un documento, correo, página o resultado de tool le indica al agent que ignore la policy o filtre datos. | Aislamiento de fuente, jerarquía de instrucciones, guardrails en retrieval, verificación de output. |
| Tool abuse | El model selecciona un tool legítimo para un propósito inseguro. | Policy de tool, scopes, aprobaciones, clasificación de efectos secundarios. |
| Secret leakage | Un token, llave, registro de cliente o nota interna entra al prompt, memory, logs o respuesta final. | Manejo de secretos, redacción, minimización de datos, clasificación de trace. |
| Data exfiltration | Datos privados salen por navegador, API, correo, escritura de archivos o mensaje cross-agent. | Policy de egress, clasificación de destino, puertas de aprobación, registros de auditoría. |
| Confused deputy | El agent usa la autoridad de un usuario o un token de servicio en un context donde no debería. | Scopes delegados, verificación de audiencia, verificación de tenant, permisos a nivel de ruta. |
| Unsafe delegation | Un agent entrega trabajo a otro agent con más tools, propiedad poco clara o identidad débil. | Autorización A2A, sobres de task con scopes, handoffs enlazados a trace. |
| Replay or duplicate action | Un mensaje, llamada de tool o paso de workflow se ejecuta dos veces. | Claves de idempotencia, nonces, expiración, registros durables de efectos secundarios. |
| Sandbox escape | Código, automatización de navegador o manejo de archivos accede fuera del workspace previsto. | Aislamiento de filesystem, bloqueos de red, límites de procesos, sin credenciales ambientales. |

No trates estos como riesgos abstractos. Conviértelos en pruebas, traces y runbooks operativos.

## The High-Risk Combination

La forma más peligrosa de un agent combina acceso a datos privados o de confianza, exposición a contenido no confiable y la capacidad de realizar acciones externas. Cuando estos tres se combinan, un documento, página web, correo o resultado de tool malicioso puede intentar guiar al agent para filtrar datos o realizar una acción insegura.

Mitiga esto con privilegio mínimo, aislamiento de contenido, puertas de aprobación, controles de egress y verificaciones explícitas de policy.

## Security Control Matrix

Usa controles de seguridad por límite, no como una sola capa genérica de "guardrail".

| Boundary | Controles requeridos |
| --- | --- |
| Data access | Verificación de tenant, elegibilidad de fuente, permisos por fila o documento, minimización de datos, redacción. |
| Tool execution | Schemas tipados, puerta de policy, credenciales con scope, clave de idempotencia, timeout, registro de auditoría. |
| Network egress | Dominios en allowlist, redes privadas bloqueadas, clasificación de destino, verificación de TLS. |
| Cross-agent messages | TLS o mTLS, claims de OAuth u OIDC, verificación de audiencia, scopes, protección contra replay, ID de trace. |
| Browser or code execution | Aislamiento en contenedor o VM, filesystem restringido, sin credenciales ambientales, límites de CPU y tiempo. |
| Memory writes | Fuente, clase de privacidad, expiración, confianza, ruta de corrección, decisión de policy. |
| Human approval | Acción propuesta, evidencia, resultado de policy, identidad del aprobador, timestamp, llamada final de tool. |
| Observability | Traces redactados, decisiones de policy, claims de identidad, llamadas de tool, intentos de egress, razones de detención. |

La matriz hace visible una cosa: el sandboxing es necesario, pero no suficiente. Un sandbox limita el radio de impacto de la ejecución. No reemplaza identidad, autorización, policy, aprobación, control de egress ni observability.

## Sandboxing

Haz sandbox a cualquier agent que pueda ejecutar código, operar un navegador, manipular archivos o llamar APIs de escritura.

Controles de sandbox:

- proceso, contenedor, VM o perfil de navegador aislado;
- filesystem de solo lectura por defecto;
- directorio de workspace con scope;
- sin credenciales ambientales;
- inyección explícita de secretos solo para tools aprobados;
- restricciones de red saliente;
- límites de tiempo y CPU;
- límites de tamaño de archivo;
- logs de auditoría para cada efecto secundario;
- limpieza después de completar la ejecución.

Agents de coding y uso de computadora necesitan sandboxes más fuertes que agents de investigación solo lectura.

### Sandbox Tiers

No todos los agents necesitan el mismo sandbox. Ajusta la contención al trabajo.

| Tier | Usar para | Controles mínimos |
| --- | --- | --- |
| Read-only | Búsqueda, resumen, clasificación, retrieval sobre datos aprobados. | Sin tools de escritura, sin secretos en context, retrieval trazable, redacción de output. |
| Tool-limited | Workflows de negocio con tools tipados y efectos secundarios acotados. | Scopes por tool, verificaciones de policy, claves de idempotencia, aprobaciones para escrituras. |
| Workspace | Coding, generación de documentos, transformación de datos, edición local de archivos. | Workspace con scope, montajes de solo lectura donde sea posible, revisión de diffs, limpieza. |
| Browser | Navegación web, llenado de formularios, automatización de UI. | Perfil de navegador separado, redes privadas bloqueadas, controles de descarga, aislamiento de credenciales. |
| Code execution | Shell, notebooks, instalación de paquetes, código generado, pruebas. | Límite de contenedor o VM, límites de CPU y tiempo, policy de red, sin secretos ambientales. |

El tier es una decisión de producto. Un agent de soporte para borradores no debe convertirse silenciosamente en un agent de automatización de navegador solo porque un tool era conveniente.

## Identity And Credentials

Los agents no deben ejecutarse con credenciales ambientales de la plataforma. Cada credencial debe estar asociada a una ruta, task, tool, usuario, tenant y decisión de policy.

Usa:

- tokens de corta duración en lugar de secretos de larga duración;
- claims de OAuth u OIDC para identidad de usuario y servicio;
- verificación de audiencia para que un token de un servicio no pueda llamar a otro;
- scopes que coincidan con la capability delegada;
- mTLS para identidad entre servicios donde la plataforma lo soporte;
- inyección de credenciales por tool después de aprobación de policy;
- revocación de credenciales como parte de la respuesta a incidentes;
- redacción para que las credenciales nunca entren en prompts, memory, fixtures de eval o traces.

El runtime debe poder responder qué identidad llamó a qué tool con qué scopes y qué versión de policy lo permitió. Si no puede, el modelo de credenciales no está listo para agents en producción.

## Network And Egress

El acceso a red es un tool, no un derecho por defecto. Un agent de investigación que puede navegar la web pública no debe poder llamar automáticamente APIs internas, servicios de metadata, redes privadas, webhooks de clientes o dominios arbitrarios.

Controles útiles de egress:

- dominios en allowlist por ruta y tool;
- bloquear rangos de IP privadas y endpoints de metadata en la nube;
- requerir validación de certificado TLS para llamadas remotas;
- separar navegación de APIs de negocio autenticadas;
- clasificar destinos como internos, socios, clientes, públicos o desconocidos;
- registrar intentos de egress denegados con IDs de trace;
- requerir aprobación para nuevos destinos o exportación de datos de alto riesgo;
- fallar cerrado cuando falte la clasificación de destino.

El egress es donde las fugas de datos se vuelven reales. Trátalo como parte del límite de policy.

## Control de Acceso

Otorga acceso por rol, task y ruta. Un support-answer agent puede leer documentos públicos pero no puede emitir reembolsos. Un billing workflow puede leer el state de una factura pero necesita aprobación para aplicar crédito. Un coding agent puede editar archivos en una rama pero no puede desplegar en producción. Un research agent puede navegar la web pero no puede acceder a datos de clientes. Evita listas globales de tools. Cada ruta o agent debe recibir solo los tools necesarios para el task.

El control de acceso debe verificar tanto al usuario como la ruta del agent. Un usuario puede tener permiso para hacer algo manualmente, pero eso no significa que cada agent actuando en nombre de ese usuario deba heredar todo el conjunto de permisos. La delegación debe ser más limitada que la autoridad del usuario.

### Ejemplo de Código de Autorización

Mantén la autorización fuera del prompt. El model puede solicitar una llamada a un tool, pero el runtime decide si esa llamada puede ejecutarse.

```ts
type ToolRequest = {
  actorId: string;
  tenantId: string;
  route: string;
  tool: string;
  sideEffect: "read" | "draft" | "write" | "external_send";
  destination?: string;
  idempotencyKey?: string;
};

type RuntimeClaims = {
  subject: string;
  tenantId: string;
  audience: string;
  scopes: string[];
  expiresAt: number;
};

type ToolPolicy = {
  requiredAudience: string;
  allowedTenants: string[];
  toolScopes: Record<string, string>;
  approvalRequiredFor: string[];
  allowedDestinations: string[];
};

type AuthorizationDecision =
  | { allowed: true; reason: "allowed" }
  | { allowed: false; reason: string };

function authorizeToolRequest(
  request: ToolRequest,
  claims: RuntimeClaims,
  policy: ToolPolicy,
  now = Date.now()
): AuthorizationDecision {
  if (claims.expiresAt <= now) {
    return { allowed: false, reason: "expired_token" };
  }

  if (claims.audience !== policy.requiredAudience) {
    return { allowed: false, reason: "wrong_audience" };
  }

  if (claims.tenantId !== request.tenantId || !policy.allowedTenants.includes(request.tenantId)) {
    return { allowed: false, reason: "tenant_boundary" };
  }

  const requiredScope = policy.toolScopes[request.tool];
  if (!requiredScope || !claims.scopes.includes(requiredScope)) {
    return { allowed: false, reason: "missing_scope" };
  }

  if (request.sideEffect !== "read" && !request.idempotencyKey) {
    return { allowed: false, reason: "missing_idempotency_key" };
  }

  if (request.destination && !policy.allowedDestinations.includes(request.destination)) {
    return { allowed: false, reason: "egress_denied" };
  }

  if (policy.approvalRequiredFor.includes(request.tool)) {
    return { allowed: false, reason: "approval_required" };
  }

  return { allowed: true, reason: "allowed" };
}
```

La implementación real debe validar tokens y certificados firmados con librerías de la plataforma. El punto arquitectónico es más simple: la autorización ocurre antes de la ejecución, a partir de claims confiables del runtime, no del texto del model.

## Guardrails

Los guardrails deben ejecutarse antes y después de las llamadas al model y antes de los tools.

| Guardrail Point | Checks |
| --- | --- |
| Input | prompt injection, datos sensibles, solicitud no soportada, autorización del usuario. |
| Retrieval | fuente no confiable, fuente desactualizada, límite de tenant, calidad de citación. |
| Tool intent | permiso, nivel de efecto secundario, policy, requerimiento de aprobación. |
| Tool input | schema, campos permitidos, minimización de datos, idempotency key. |
| Output | fuga de datos, claims no soportados, instrucciones inseguras, advertencias faltantes. |
| Memory write | privacidad, fuente, expiración, ruta de corrección. |

Ningún guardrail por sí solo es suficiente. Usa capas.

## Secrets

Los agents no deben ver secrets sin procesar a menos que el contrato del tool lo requiera. Prefiere la ejecución de tools del lado del servidor, tokens con alcance limitado y credenciales de corta duración, con acceso a secrets otorgado por tool, sin secrets en prompts o memory, y traces redactados. Si un model puede leer un secret, asume que puede exponerlo accidentalmente.

No pases secrets a través del context en lenguaje natural. Dale al model un capability handle, no el secret en sí. El gateway del tool puede resolver ese handle después de que la policy lo permita.

## Ejemplo de Security Profile

Un agent de producción debe tener un security profile explícito. El formato exacto puede variar, pero el runtime necesita estas decisiones en algún lugar fuera del prompt:

```json
{
  "route": "support_refund_assistant",
  "risk_class": "medium",
  "identity": {
    "allowed_issuers": ["https://identity.example.com"],
    "required_audience": "support-agent-runtime",
    "required_scopes": ["orders:read", "refunds:draft"]
  },
  "sandbox": {
    "filesystem": "read_only",
    "workspace": "/runs/${run_id}",
    "network": {
      "allowed_domains": ["api.example.com", "docs.example.com"],
      "block_private_networks": true,
      "require_tls": true
    },
    "limits": {
      "max_runtime_ms": 60000,
      "max_output_bytes": 200000
    }
  },
  "tools": {
    "allowed": ["orders.lookup", "refunds.draft_refund", "policies.current_refund_policy"],
    "approval_required": ["refunds.issue_refund", "email.send_customer"]
  },
  "observability": {
    "required_trace_fields": ["trace_id", "actor", "tool", "policy_decision", "stop_reason"],
    "redact": ["access_token", "refresh_token", "customer_email", "payment_token"]
  }
}
```

Este profile es deliberadamente aburrido. Ese es el punto. Un profile aburrido puede ser revisado, probado, comparado, revertido y vinculado a un incidente.

## Approval Gates

Para un diseño detallado de aprobación, usa [Human Approval Gates](../tools-skills-protocols/human-approval-gates). En este capítulo, la aprobación se trata como un control de seguridad para autoridad de alto riesgo.

Requiere aprobación para:

- movimientos de dinero;
- cambios de cuenta;
- comunicación con clientes a escala;
- cambios en infraestructura de producción;
- decisiones legales, médicas o de cumplimiento;
- eliminación o escrituras irreversibles;
- exportación amplia de datos;
- escalamiento de privilegios.

Los registros de aprobación deben incluir la acción propuesta, evidencia, resultado de la policy, aprobador, timestamp y llamada final al tool.

## Security Observability

Los controles de seguridad solo ayudan a los operadores si son visibles. Registra eventos de seguridad como eventos de trace de primera clase:

- resultado de verificación de identidad;
- emisor del token, audiencia, sujeto, tenant y scopes después de la redacción;
- identidad de servicio TLS o mTLS para llamadas entre servicios;
- decisión de policy, razón y versión de la policy;
- inicio de sandbox, límites, acceso al filesystem denegado y egress de red denegado;
- inyección y rechazo de credenciales;
- solicitud de aprobación, decisión de aprobación e identidad del aprobador;
- invocación de tool, identificador de efecto secundario, idempotency key y razón de detención;
- acción de redacción y clase de retención de trace.

No conviertas la observabilidad en una fuga de datos. Tokens sin procesar, claves privadas, secrets, registros completos de clientes y cargas innecesarias no deben aparecer en traces. El objetivo es explicar la autoridad y el comportamiento, no duplicar datos sensibles.

## Security Evals

Prueba los controles de seguridad antes del lanzamiento y después de cambios significativos.

| Eval Case | Expected Behavior |
| --- | --- |
| Missing OAuth scope | La llamada al tool es denegada antes de la ejecución y la denegación queda registrada en el trace. |
| Wrong token audience | La solicitud cross-agent es rechazada antes de procesar el payload. |
| Prompt injection en documento recuperado | El agent trata el contenido como datos y no cambia la policy ni el destino. |
| Unapproved egress destination | La llamada de red es bloqueada y registrada con el trace ID. |
| Memory write contiene datos privados | La escritura es denegada, redactada o enviada para aprobación. |
| Tool requests broad credential | El runtime solo inyecta credenciales con alcance limitado o deniega la llamada. |
| Approval-required side effect | El workflow se pausa antes de la ejecución y registra el contexto de aprobación. |
| Replay de mensaje antiguo | El chequeo de idempotency o nonce bloquea la acción duplicada. |
| Browser intenta red privada | La solicitud es denegada antes de la navegación o carga. |
| Código intenta leer fuera del workspace | El acceso al filesystem es denegado y registrado en el trace. |
| Subagent pide tools más amplios | La delegación es rechazada o enviada para aprobación. |
| Trace contiene raw token | La prueba de redacción falla y bloquea el release. |

Mide falsos positivos, llamadas inseguras a tools bloqueadas, fallas de redacción, campos faltantes en traces, intentos de egress no autorizados, precisión en el ruteo de aprobación, intentos de escape de sandbox y tiempo para investigar un incidente de seguridad.

## Incident Response

Planea para incidentes de agents antes del lanzamiento. El equipo debe saber ya cómo deshabilitar un tool o una ruta, revertir un prompt o policy, revocar credenciales, aislar memory, inspeccionar traces, notificar a usuarios afectados y convertir el incidente en evals. Si la respuesta requiere arqueología de código en medio de un incidente, el sistema no está listo operativamente.

La respuesta a incidentes de seguridad debe incluir acciones sobre identidad y credenciales: revocar tokens, rotar secrets, deshabilitar cuentas de servicio, invalidar nonces de mensajes, aislar traces afectados y preservar suficiente evidencia de auditoría para explicar la ejecución.

## Capítulos Relacionados

- [Agent Threat Model](./agent-threat-model)
- [Production Runtime Overview](../production-runtime/overview)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Secure Agent Communication](../tools-skills-protocols/secure-agent-communication)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Circuit Breakers, Fallbacks, and Replay](../pattern-selection/circuit-breakers-fallbacks-replay)
- [Coding Agents](../systems-architecture/coding-agents)
