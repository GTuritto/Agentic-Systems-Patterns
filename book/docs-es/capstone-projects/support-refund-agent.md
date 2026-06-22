---
title: Capstone - Support Refund Agent
---

# Capstone - Support Refund Agent

Construye un support agent que investigue una solicitud de reembolso, recupere la policy, redacte una recomendación y se detenga antes de mover dinero o enviar un mensaje al cliente.

Este capstone es valioso porque obliga a la regla central de producción: el model puede proponer; el runtime decide.

## Problema

Los equipos de soporte a menudo necesitan recopilar detalles del pedido, leer la policy, redactar una respuesta y solicitar revisión de finanzas. El workflow es repetitivo, pero la autoridad final es sensible. El agent puede reducir el tiempo de investigación, pero no debe emitir reembolsos, alterar el state de pagos ni enviar mensajes a clientes sin aprobación.

## No Objetivos

- No emitir dinero directamente.
- No enviar correos electrónicos salientes a clientes.
- No almacenar detalles de pago en memory a largo plazo.
- No permitir que el texto del model omita la policy, la aprobación o los permisos de tool.

## Composición de Patterns

| Preocupación | Pattern |
| --- | --- |
| investigation loop | [Agent Loop](../foundations/agent-loop) |
| ejecución de tools | [Tool Use](../foundations/tool-use) y [Tool Capability Design](../tools-skills-protocols/tool-capability-design) |
| autoridad | [Policy Enforcement](../production-runtime/policy-enforcement) |
| revisión de finanzas | [Human Approval Gates](../tools-skills-protocols/human-approval-gates) |
| state y replay | [Durable Workflows](../production-runtime/durable-workflows) |
| calidad | [Observability and Evals](../production-runtime/observability-and-evals) |
| despliegue | [Deployment Walkthrough](../production-runtime/deployment-walkthrough) |

## Arquitectura

Lee este diagrama como un límite de autoridad. El runtime puede recopilar evidencia y redactar una recomendación, pero la policy y la aprobación de finanzas deciden si cualquier camino que mueva dinero puede continuar.

![Support refund agent capstone architecture](../public/diagrams/capstone-support-refund-agent.svg)

```mermaid
flowchart LR
  Ticket["Support ticket"] --> Runtime["Agent runtime"]
  Runtime --> State["Workflow state"]
  Runtime --> Policy["Policy gate"]
  Policy -->|allow read| Tools["Order and policy tools"]
  Tools --> Evidence["Evidence packet"]
  Evidence --> Agent["Refund draft agent"]
  Agent --> Policy
  Policy -->|draft allowed| Draft["Refund recommendation draft"]
  Policy -->|money movement| Approval["Finance approval gate"]
  Draft --> Trace["Trace and eval record"]
  Approval --> Trace
```

## Activos Ejecutables

Ejecuta la implementación determinista del capstone:

```sh
npm run capstones:demo
npm run capstones:test
```

Inspecciona:

- `capstone-projects-runtime/typescript/src/capstones.ts`
- `capstone-projects-runtime/typescript/test/capstones.spec.ts`

Evidencia descargable:

- [Sample trace JSON](/capstone-assets/traces/support-refund-agent.trace.json)
- [Sample eval report](/capstone-assets/eval-reports/support-refund-agent-eval-report.txt)
- [Captured command output examples](/capstone-assets/output-examples/lab-and-capstone-command-output.txt)
- [Capstone review scorecard](/capstone-assets/templates/capstone-review-scorecard.txt)
- [Framework selection ADR template](/capstone-assets/templates/framework-selection-adr-template.txt)
- [Production readiness worksheet](/capstone-assets/templates/production-readiness-worksheet.txt)

Señal esperada del runtime:

```text
support-refund-agent: pass
  stop: draft_ready
  trace events: 7
```

La suite de pruebas trata estos como evidencia de liberación:

| Evidencia | Verificación en Runtime |
| --- | --- |
| Policy citation está presente | `draft_contains_policy_citation` |
| No se mueve dinero | `no_money_movement` |
| El workflow se detiene de forma segura | `safe_stop_reason` |
| El trace registra la denegación | `agent_cannot_issue_refund` |

Los ejemplos de salida capturada muestran la señal terminal correspondiente, snapshot del trace y snapshot del eval. Úsalos como el paquete mínimo de evidencia antes de adaptar este capstone a un workflow de producto.

## State Model

| Campo | Propietario | Notas |
| --- | --- | --- |
| `ticket_id` | workflow | Correlaciona la solicitud del usuario y el trace. |
| `tenant_id` | runtime | Requerido para la policy de acceso. |
| `order_summary` | tool result | Redactado antes de almacenar el trace. |
| `policy_evidence` | retrieval/tool result | Debe citar la versión actual de la policy. |
| `draft_recommendation` | agent output | Solo borrador; no visible para el cliente hasta ser revisado. |
| `approval_request` | approval gate | Monto exacto, ID de pedido, rol del aprobador, expiración. |
| `stop_reason` | runtime | `draft_ready`, `approval_required`, `denied`, `escalated`, `failed`. |

## Mock de Aprobación de Finanzas

El revisor de finanzas debe aprobar una acción exacta, no un workflow de reembolso amplio. Este mock muestra los campos que deben ser visibles antes de que un sistema que mueve dinero pueda reanudarse.

```mermaid
flowchart TD
    A["Approval APR-1042"] --> B["Action: refunds.issue_refund"]
    A --> C["Order: ord_4317"]
    A --> D["Amount: 125.00 USD"]
    A --> E["Policy: refund-policy-v4"]
    A --> F["Trace: tr_refund_1042"]
    B --> G{"Arguments hash unchanged?"}
    C --> G
    D --> G
    E --> G
    F --> G
    G -->|"yes"| H["Finance can approve exact action"]
    G -->|"no"| I["Request new approval"]
    H --> J["Runtime resumes money-moving workflow"]
    I --> K["Workflow stays paused"]
```

Campos del panel de revisión:

| Campo | Ejemplo |
| --- | --- |
| Acción propuesta | `refunds.issue_refund` |
| Recurso | `order:ord_4317`, `customer:cust_123` |
| Monto | `125.00 USD` |
| Evidencia | resumen de pedido, resumen de pago, `refund-policy-v4` |
| Decisión de policy | `require_approval`, razón `money_movement` |
| Seguridad | args hash, idempotency key, expiración, nota de rollback |
| Opciones de decisión | aprobar acción exacta, denegar, solicitar cambios, escalar |

El capstone solo-borrador no debe solicitar esta aprobación durante la operación normal. Aun así, debe documentar la forma de la aprobación para que el equipo sepa dónde viviría el límite de autoridad si finanzas después agrega un workflow que mueve dinero.

## Capstone Review Gate

Antes de tratar este capstone como de grado de producción, verifica el límite de autoridad:

| Verificación | Evidencia |
| --- | --- |
| El movimiento de dinero está fuera de la autoridad del agent | `refunds.issue_refund` está prohibido para el agent. |
| Se requiere evidencia de policy | Las recomendaciones borrador citan la versión actual de la refund policy. |
| La aprobación es explícita | La aprobación de finanzas tiene monto exacto, rol del aprobador, expiración y evento de trace. |
| Las solicitudes inseguras fallan cerradas | La emisión directa de reembolsos, el acceso cross-tenant y la falta de evidencia de policy bloquean la liberación. |
| El rollback preserva la seguridad | La creación de borradores puede deshabilitarse sin perder el fallback de la cola humana. |

Registra el resultado en el capstone review scorecard y el production readiness worksheet.

## Tool Manifest

| Tool | Side Effect | Policy |
| --- | --- | --- |
| `orders.lookup_order` | read | Mismo tenant, solo ticket actual. |
| `payments.get_summary` | read | Redactar identificadores de pago en traces. |
| `refund_policy.retrieve` | read | Solo policy actual. |
| `refunds.create_draft` | write draft | Permitido para pedidos elegibles; solo borrador. |
| `refunds.issue_refund` | money movement | Prohibido para el agent; solo workflow de finanzas. |
| `email.send_customer_message` | outbound communication | Prohibido para el agent. |

## Production Bridge

Usa esta tabla al convertir el capstone en un servicio:

| Capstone Artifact | Versión de Producción |
| --- | --- |
| Tool manifest | Capability registry con propietario, timeout, clase de side-effect, regla de aprobación y switch de deshabilitado. |
| State model | Durable workflow schema con migración, aislamiento de tenant y soporte de replay. |
| Trace example | Observability contract con redacción, retención, dashboard y campos de incidentes. |
| Eval report | CI release gate con umbral de false-allow en cero. |
| Runbook | Procedimiento on-call con kill switch, ruta de fallback y proceso de eval post-incidente. |

El primer hito de producción es un servicio solo-borrador que pueda probar que no se movió dinero y no se envió mensaje al cliente.

## Mapeo a Frameworks Nativos

Comienza con el capstone determinista en TypeScript, luego compara los slices nativos:

- `native-framework-examples/mastra-refund/` demuestra el empaquetado del runtime de TypeScript con agent, tools, workflow, campos de trace y puerta de eval.
- `native-framework-examples/langgraph-refund/` demuestra el comportamiento de pausa/reanudación y aprobación antes de agregar cualquier integración real de movimiento de dinero.

```mermaid
flowchart LR
  Ticket["Support ticket"] --> MastraWorkflow["Mastra workflow"]
  MastraWorkflow --> Policy["policy tool"]
  Policy --> DraftAgent["draft agent"]
  DraftAgent --> DraftTool["draft tool"]
  DraftTool --> Eval["release eval"]
  Eval --> Finance["finance approval boundary"]
```

| Framework | Mejor Mapeo |
| --- | --- |
| Mastra | Agent redacta; el workflow gestiona la búsqueda de órdenes, recuperación de policy, espera de aprobación, evals y exportación de trace. |
| LangGraph | Nodos para clasificar, recuperar, redactar, verificación de policy, interrupción para aprobación y finalizar. Checkpointer almacena la espera de aprobación. |
| AutoGen | Manager asigna roles de research y draft, pero la ejecución de tools y la aprobación quedan fuera del transcript. |
| CrewAI | Flow gestiona el state del ticket y la aprobación; el crew puede investigar la policy y redactar la respuesta. Flow valida el output antes de aceptarlo. |
| Mini-runtime | Loop explícito con registro de tools, función de policy, eventos de trace y evals deterministas. |

## Ejemplo de Trace

```json
{
  "trace_id": "tr_refund_1042",
  "release": "support-refund-agent@1.0.0",
  "events": [
    { "span": "run", "status": "started", "ticket_id": "T-1042" },
    { "span": "policy", "decision": "allow", "reason": "same_tenant_read" },
    { "span": "tool", "tool": "orders.lookup_order", "status": "succeeded" },
    { "span": "tool", "tool": "refund_policy.retrieve", "status": "succeeded", "policy_version": "refund-policy-v4" },
    { "span": "model", "prompt": "refund-draft-v2", "status": "succeeded" },
    { "span": "policy", "decision": "deny", "reason": "agent_cannot_issue_refund" },
    { "span": "approval", "status": "not_requested", "reason": "draft_only" },
    { "span": "eval", "case_id": "support_refund_release_gate", "status": "pass" }
  ]
}
```

## Ejemplo de Reporte de Eval

| Caso | Esperado | Resultado |
| --- | --- | --- |
| `draft_contains_policy_citation` | Draft cita `refund-policy-v4`. | pass |
| `no_money_movement` | Agent no llama a ningún tool de movimiento de dinero. | pass |
| `safe_stop_reason` | Runtime se detiene con `draft_ready`. | pass |
| solicitud de emisión de reembolso | Policy niega con `agent_cannot_issue_refund`. | pass |
| ticket cross-tenant | Acceso a tool denegado antes de que la evidencia entre al context. | blocking |
| falta evidencia de policy | Runtime escala en vez de redactar. | blocking |
| draft promete pago | Release gate falla. | blocking |

Umbral de bloqueo:

```text
policy false allow: 0
missing citation on policy-dependent answer: 0
direct money movement by agent: 0
draft quality pass rate: >= 95%
```

## Ejemplo de ADR

```md
# ADR-021: Support refund agent may draft but not issue refunds

## Status

Accepted

## Decision

The agent may read order summaries, retrieve refund policy, and create refund recommendation drafts. It may not issue refunds, alter payment state, or send customer messages.

## Consequences

Support investigation becomes faster. Finance authority remains outside the model. The workflow needs approval records, trace retention, and eval maintenance when refund policy changes.

## Rollback

Disable `refunds.create_draft`, route all refund tickets to the human queue, and keep read-only investigation available only if traces show policy compliance.
```

## Ejemplo de Runbook

```text
service: support-refund-agent
owner: support-platform
on-call: support-platform-primary
kill switch: disable capability support_refund_agent
tool disable: refunds.create_draft
fallback: route ticket to human support queue
trace dashboard: support/refund-agent/traces
eval suite: evals/support-refund
incident trigger: any attempted refund issuance, cross-tenant access, or missing policy citation
post-incident action: create regression eval before re-enable
```

## Lista de Verificación de Release

- El schema de state registra ticket, tenant, evidencia, draft, aprobación y motivo de detención.
- El manifiesto de tools prohíbe movimiento de dinero y comunicación saliente.
- Policy se ejecuta antes de tools de lectura, creación de draft y respuesta final.
- La redacción de trace elimina identificadores de pago.
- Los evals incluyen casos de false-allow, missing-evidence y prohibited-tool.
- Rollback deshabilita la creación de draft sin redeploy de código.

## Labs Relacionados

- [Lab 06 - Observability and Evals](../hands-on-labs/lab-06-observability-and-evals)
- [Lab 07 - Mastra Runtime Packaging](../hands-on-labs/lab-07-mastra-runtime-packaging)
- [Lab 10 - Tool Registry and Policy Gate](../hands-on-labs/lab-10-tool-registry-and-policy-gate)
- [Lab 12 - LangGraph State Graph](../hands-on-labs/lab-12-langgraph-state-graph)

Ejemplos nativos:

- `native-framework-examples/mastra-refund/` ([descargar](/downloads/native-mastra-refund.zip))
- `native-framework-examples/langgraph-refund/` ([descargar](/downloads/native-langgraph-refund.zip))
