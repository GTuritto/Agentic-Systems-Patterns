---
title: Cross-Framework Decision Matrix
---

# Cross-Framework Decision Matrix

Este capítulo compara LangGraph, sistemas estilo AutoGen, Mastra AI, CrewAI y un runtime personalizado pequeño según la responsabilidad de ingeniería. El objetivo no es declarar un framework como el mejor. El objetivo es decidir qué debe ser responsable de state, tools, policy, memory, evals, deployment y recuperación ante fallas para un sistema específico.

Usa este capítulo después de los laboratorios. Los laboratorios muestran la forma de cada framework de manera aislada. Este capítulo ayuda a elegir entre ellos para un producto real. Úsalo junto con [Real Framework Setup Notes](./real-framework-setup-notes) cuando necesites orientación concreta de instalación y portabilidad.

Utiliza este diagrama para ubicar al propietario del state antes de comparar APIs. Un framework es mejor opción cuando su límite de state coincide con la falla que más necesitas inspeccionar y recuperar.

![Cross-framework state ownership comparison](/diagrams/framework-state-ownership.svg)

## Decision Rule

Elige el framework que haga más fácil inspeccionar, probar y operar el límite de mayor riesgo.

Si el mayor riesgo es un state reanudable, prefiere el state de graph o workflow. Si el mayor riesgo es la responsabilidad multi-agent, prefiere un transcript o flow que registre el comportamiento de los roles. Si el mayor riesgo es el empaquetado del runtime de producción, prefiere un runtime con convenciones para tools, memory, evals y observability. Si el mayor riesgo es el control exacto de policy, un runtime pequeño y directo puede ser más seguro que una abstracción grande.

## Framework Fit Matrix

| Opción | Mejor cuando | Evitar cuando | Mantener portable |
| --- | --- | --- | --- |
| LangGraph-style state graph | El trabajo tiene ramificaciones, checkpoints, interrupciones, reanudación u observabilidad a nivel de nodo. | Una secuencia simple o una sola llamada a tool es suficiente. La forma de graph ocultaría el state en vez de aclararlo. | State schema, contratos de nodos, registros de checkpoints, payloads de interrupciones, fixtures de eval. |
| AutoGen-style team | La colaboración, el comportamiento de roles y la revisión de transcripts son centrales. | El equipo es solo una cadena con nombres de agent. El historial de conversación se convierte en el único almacén de state. | Message schema, contratos de roles, reglas de terminación, evals de transcript, tool policy. |
| Mastra-style runtime | El producto en TypeScript necesita agents, tools, workflows, memory, evals y observability empaquetados juntos. | Las convenciones del runtime ocultarían la policy del producto o los requisitos de deployment. | Tool manifests, contratos de workflow, reglas de memory, evals, trace schema. |
| CrewAI-style flows and crews | Los workflows en Python necesitan state propio del flow más crews de especialistas acotados. | Los roles se superponen, la aceptación del flow es vaga o los crews reemplazan el diseño determinista del workflow. | Flow state, contratos de task, permisos de roles, outputs de crews, evals de aceptación. |
| Mini-runtime/custom code | El alcance es reducido, la policy requiere control exacto o el equipo ya tiene infraestructura de workflow. | Necesitas durabilidad en producción, escalabilidad, observability alojada e integraciones con el ecosistema de inmediato. | Todo: state, policy, tools, memory, evals, traces, contratos de deployment. |

## Responsibility Matrix

| Responsabilidad | LangGraph-style | AutoGen-style | Mastra-style | CrewAI-style | Mini-runtime |
| --- | --- | --- | --- | --- | --- |
| State owner | State de graph y checkpoints. | State de equipo/task fuera del transcript. | State de workflow y memory en el runtime. | State del flow. | El model de tu aplicación. |
| Control flow | Nodos, edges, transiciones condicionales, interrupciones. | Policy de turnos del equipo y terminación. | Workflows y agent runtime. | Flows coordinan crews y tasks. | Loop, router o código de workflow que escribas. |
| Tool policy | Nodos de guardia, middleware o wrappers de tools. | Límite de ejecución del manager/runtime. | Hooks de policy de tools y workflows. | Tools de roles más restricciones del flow. | Policy gate explícito. |
| Memory | State más almacenes de memory. | Transcript más memory externa. | Abstracciones de memory en el runtime. | Context de flow/crew y almacenes externos. | Context packet y policy de memory. |
| Evals | Paths de nodos, diferencias de state, checkpoints, output final. | Turns del transcript, roles, llamadas a tools, terminación. | Traces del runtime, llamadas a tools, resultados de workflows. | Aceptación del flow y outputs de roles. | Pruebas de trayectoria que definas. |
| Observability | Traces por nodo e inspección de checkpoints. | Transcript de mensajes estructurados. | Observability del runtime y hooks de eval. | Registros de flow/task/role. | Trace schema y almacenamiento que construyas. |
| Deployment | App runtime más checkpointer y almacenes. | App runtime más límites de servicio de agent. | Empaquetado de runtime en TypeScript. | App de flow en Python y workers. | Infraestructura de producto existente. |
| Escape hatch | Los nodos son código plano si el state se mantiene explícito. | El transcript puede exportarse y reproducirse. | Mantén tools/evals fuera del código exclusivo del framework. | Mantén el state del flow separado del chat de roles. | Máximo control, máxima carga operativa. |

## Choose By Risk

| Riesgo dominante | Mejor opción por defecto | Por qué |
| --- | --- | --- |
| Progreso perdido o workflows interrumpidos | LangGraph-style o durable workflow | Checkpoints, reanudabilidad y transiciones de state son de primera clase. |
| Comportamiento multi-agent sin responsabilidad | AutoGen-style transcript o CrewAI-style flow | Puedes inspeccionar turns de roles, handoffs y aceptación final. |
| Consistencia de runtime de producto en TypeScript | Mastra-style runtime | Agents, tools, workflows, memory y evals comparten una sola estructura de aplicación. |
| Automatización de workflow basada en roles en Python | CrewAI-style flow | El state del flow y la ejecución de crews se adaptan bien a equipos de automatización en Python. |
| Policy estricta y alcance mínimo | Mini-runtime/custom code | La aplicación controla el límite exacto y evita defaults del framework. |
| Incertidumbre sobre el framework | Mini-runtime primero, luego migrar | Construir primitivas una vez aclara lo que el framework debe proveer. |

## Migration And Escape Hatches

No permitas que el framework sea el único lugar donde exista la lógica del producto. Mantén estos activos portables:

- state schemas;
- tool manifests y clases de side-effect;
- reglas de policy;
- registros de aprobación;
- reglas de retención y eliminación de memory;
- archivos de prompt e instrucciones;
- forma del context packet;
- trace schema;
- fixtures de eval;
- notas de deployment y rollback;
- ADRs explicando por qué se eligió el framework.

La portabilidad no es teórica. Las APIs de los frameworks cambian, los equipos cambian de stack y los sistemas en producción superan las suposiciones iniciales. La adopción más segura de un framework mantiene los contratos del producto fuera de decoradores y callbacks específicos del framework siempre que sea posible.

## Decision Checklist

Antes de elegir un framework, responde:

- ¿Quién es responsable del durable state?
- ¿Dónde corre la policy antes de los side effects?
- ¿Cómo se tipifican, delimitan, aprueban y trazan los tools?
- ¿Cuál es el trace reproducible más pequeño que explica una falla?
- ¿Qué evals fallan la build?
- ¿Qué pasa si una ejecución se interrumpe?
- ¿Cómo hacemos rollback de prompts, tools, policies y elecciones de model?
- ¿Qué datos nunca deben entrar en memory o traces?
- ¿Qué partes pueden migrar si el framework cambia?
- ¿Qué incidente de producción probaría que este framework fue la elección equivocada?

## Related Chapters

- [Framework Selection](./framework-selection)
- [Real Framework Setup Notes](./real-framework-setup-notes)
- [Templates and Worksheets](./templates-and-worksheets)
- [Building a Minimal Agent Runtime](./building-a-minimal-agent-runtime)
- [Agent Harnesses](./agent-harnesses)
- [Lab Production Readiness Checklist](../hands-on-labs/production-readiness-checklist)
- [Architecture Decision Records for Agents](../systems-architecture/architecture-decision-records)
- [Observability and Evals](../production-runtime/observability-and-evals)
