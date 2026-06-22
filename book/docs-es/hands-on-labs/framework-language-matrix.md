---
title: Lab Framework and Language Matrix
---

# Lab Framework and Language Matrix

Los labs son intencionalmente agnósticos al lenguaje y framework. Usan diferentes tools para que puedas ver el pattern arquitectónico detrás del API del framework.

Usa esta página antes de empezar a programar. Responde dos preguntas: ¿qué lab debo ejecutar primero y qué boundary de producción debo inspeccionar mientras lo ejecuto?

## Coverage Graph

Usa este gráfico para ver el enfoque de aprendizaje entre lenguajes, runtimes, slices de framework y capstones. El goal es exponer una arquitectura balanceada, no cubrir paquetes de forma igualitaria.

![Framework and language lab coverage](../public/diagrams/framework-language-coverage.svg)

| Lab | Pattern | Language | Framework / Runtime | Framework-Agnostic Lesson |
| --- | --- | --- | --- | --- |
| [Lab 01 - Tool-Using Agent](./lab-01-tool-using-agent.md) | Tool use | TypeScript | Minimal custom runtime / AutoGen-style example | El model propone un capability; el software se encarga de la validación y ejecución. |
| [Lab 02 - Agent Loop and Planning](./lab-02-agent-loop-and-planning.md) | Planning and execution | TypeScript, con espejo en Python | Framework-neutral planner/executor | Planning y execution son responsabilidades separadas, incluso cuando un framework empaqueta ambas. |
| [Lab 03 - Agentic RAG](./lab-03-agentic-rag.md) | Retrieval and grounding | Python | LangChain/LangGraph-style retrieval stack | Retrieval produce evidencia acotada; la generación debe mantenerse fundamentada en esa evidencia. |
| [Lab 04 - A2A Communication](./lab-04-a2a-communication.md) | Agent-to-agent protocol | TypeScript | Protocol-first runtime con validación de schema Ajv | La comunicación entre agents necesita sobres tipados, correlation IDs, rechazos, errores y cancelación. |
| [Lab 05 - Multi-Agent Supervisor](./lab-05-multi-agent-supervisor.md) | Supervisor / worker | TypeScript | AutoGen-style manager/worker example | Un supervisor se encarga de la descomposición, contratos de worker y síntesis final. |
| [Lab 06 - Observability and Evals](./lab-06-observability-and-evals.md) | Trace and eval harness | TypeScript | Framework-neutral tests over examples | Los evals deben inspeccionar trayectorias, no solo respuestas finales. |
| [Lab 07 - Mastra Runtime Packaging](./lab-07-mastra-runtime-packaging.md) | Runtime packaging | TypeScript | Mastra-style agents, tools, workflows, memory y evals | El runtime packaging del framework no elimina la propiedad del producto sobre state, policy y aceptación. |
| [Lab 08 - CrewAI Flows and Crews](./lab-08-crewai-flows-and-crews.md) | Flow and crew orchestration | Python | CrewAI-style flows, crews, roles y tasks | Los flows son dueños del state y aceptación; los crews realizan trabajo especializado acotado. |
| [Mini-Framework Track](./from-scratch-mini-framework.md) | Runtime primitives | TypeScript o Python | Runtime educativo desde cero | Construir los primitives una vez aclara qué empaquetan los frameworks. |
| [Lab 09 - Minimal Agent Loop](./lab-09-minimal-agent-loop.md) | Agent loop | TypeScript o Python | Runtime educativo desde cero | State, decisiones, observaciones, presupuestos y razones de detención son el núcleo del loop. |
| [Lab 10 - Tool Registry and Policy Gate](./lab-10-tool-registry-and-policy-gate.md) | Tool and policy boundary | TypeScript o Python | Runtime educativo desde cero | La disponibilidad de tools y la autorización de policy son decisiones distintas del runtime. |
| [Lab 11 - Context, Memory, Trace, and Evals](./lab-11-context-memory-trace-evals.md) | Runtime observability | TypeScript o Python | Runtime educativo desde cero | Context, memory, traces y trajectory evals hacen el runtime revisable. |
| [Lab 12 - LangGraph State Graph](./lab-12-langgraph-state-graph.md) | State graph and resume | Python | LangGraph-style graph state, nodes, edges, checkpoints e interrupts | La ejecución en graph es más fuerte cuando importan state, ramificación, pausa/reanudación y observabilidad de nodos. |
| [Lab 13 - AutoGen Transcript Evals](./lab-13-autogen-transcript-evals.md) | Multi-agent transcript evaluation | TypeScript | AutoGen-style agents, teams, messages y transcript evals | Una ejecución multi-agent necesita un transcript revisable, razón explícita de detención y criterios de aceptación a nivel de rol. |

## How To Read The Matrix

No trates la columna de framework como el objetivo del lab. Trátala como la superficie de implementación. La lección duradera es el boundary: state, tools, policy, context, comunicación, evaluación o control del runtime.

Si después usas LangGraph, Mastra AI, AutoGen, CrewAI, Semantic Kernel, MCP o un runtime personalizado, mantén las mismas preguntas en mente:

- ¿Qué es propiedad del framework?
- ¿Qué sigue siendo propiedad de tu aplicación?
- ¿Dónde se persiste el state?
- ¿Dónde se validan las llamadas a tools?
- ¿Dónde se aplica la policy?
- ¿Qué se puede replay después de una falla?

## Choose By Situation

Usa esta tabla cuando ya sepas el problema que quieres resolver.

| Si tu problema actual es... | Empieza con | Luego lee | Por qué |
| --- | --- | --- | --- |
| Exponer un tool a un model | [Lab 01](./lab-01-tool-using-agent.md) | [Tool Capability Design](../tools-skills-protocols/tool-capability-design) | Necesitas inputs tipados, errores controlados y límites de permisos antes de la autonomía. |
| Agregar planificación o ejecución paso a paso | [Lab 02](./lab-02-agent-loop-and-planning.md) | [Planning and Execution](../control-loops/planning-and-execution) | Necesitas separar la creación del plan, la ejecución y las razones de detención. |
| Fundamentar respuestas en documentos | [Lab 03](./lab-03-agentic-rag.md) | [Semantic Recall and RAG](../memory-knowledge/semantic-recall-rag) | Necesitas elegibilidad de fuentes, calidad de retrieval, citas y manejo de evidencia faltante. |
| Conectar agents o servicios | [Lab 04](./lab-04-a2a-communication.md) | [A2A Agent Interoperability](../tools-skills-protocols/a2a-agent-interoperability) | Necesitas sobres tipados, identidad, rechazos, errores, cancelación y replay. |
| Dividir trabajo entre roles | [Lab 05](./lab-05-multi-agent-supervisor.md) | [Supervisor / Worker](../multi-agent-systems/supervisor-worker) | Necesitas contratos de worker, policy de fusión y un único dueño final. |
| Probar comportamiento con traces y evals | [Lab 06](./lab-06-observability-and-evals.md) | [Observability and Evals](../production-runtime/observability-and-evals) | Necesitas evidencia de trayectoria, no solo respuestas finales. |
| Comparar runtime packaging de frameworks | [Lab 07](./lab-07-mastra-runtime-packaging.md) | [Framework Selection](../agent-engineering-practice/framework-selection) | Necesitas ver qué empaqueta un runtime y qué sigue siendo propiedad de tu producto. |
| Modelar orquestación tipo crew | [Lab 08](./lab-08-crewai-flows-and-crews.md) | [Choosing Multi-Agent Topology](../multi-agent-systems/choosing-multi-agent-topology) | Necesitas distinguir el state del flow del output de worker basado en roles. |
| Entender qué empaquetan los frameworks | [Mini-Framework Track](./from-scratch-mini-framework.md) | [Building a Minimal Agent Runtime](../agent-engineering-practice/building-a-minimal-agent-runtime) | Necesitas los primitives antes de comparar abstracciones de frameworks. |
| Probar resume, interrupts o graph state | [Lab 12](./lab-12-langgraph-state-graph.md) | [Durable Workflows](../production-runtime/durable-workflows) | Necesitas checkpoints, transiciones de state y recuperación ante fallas. |
| Evaluar conversaciones multi-agent | [Lab 13](./lab-13-autogen-transcript-evals.md) | [Debate and Consensus](../multi-agent-systems/debate-and-consensus) | Necesitas evidencia en el transcript, aceptación por rol y condiciones de detención. |

Si aplican varias filas, empieza por el boundary más riesgoso. Un tool con capacidad de escritura, fuente de datos privada, workflow de larga duración o handoff multi-agent deben guiar la elección del lab.

## Atajo de Decisión Rápida

Usa este atajo cuando tienes cinco minutos y necesitas una ruta inicial.

| Mayor Riesgo en Tu Sistema | Ejecuta Primero | Agrega Después | Revisión para Producción |
| --- | --- | --- | --- |
| Un model puede invocar un tool | Lab 01 | Lab 10 | Tool schema, permiso, idempotencia, timeout y registro de auditoría. |
| Un model puede planear varios pasos | Lab 02 | Lab 09 | Motivo de detención, presupuesto, regla de reintento, cancelación y eventos de trace. |
| Un model responde desde documentos | Lab 03 | Lab 11 | ACLs de fuente, frescura, citas, comportamiento ante evidencia faltante y retrieval evals. |
| Agents intercambian mensajes | Lab 04 | Lab 13 | Envelope tipado, identidad, correlation ID, rechazo, cancelación y transcript replay. |
| El trabajo se divide entre roles | Lab 05 | Lab 08 | Contrato de worker, merge policy, dueño final, permisos de rol y acceptance eval. |
| La calidad del release es incierta | Lab 06 | Lab 11 | Contrato de trace, casos negativos, trajectory evals y umbrales de bloqueo. |
| El trabajo puede pausarse y reanudarse | Lab 12 | Capítulo Durable Workflows | Almacenamiento de checkpoint, payload de interrupción, migración de state y dashboard de ejecuciones atascadas. |
| La elección de framework es incierta | Mini-Framework Track | Lab 07 | División de ownership entre framework runtime y product policy. |

No optimices por el lab más interesante. Optimiza por el límite más probable de dañar usuarios, filtrar datos, gastar dinero o bloquear operadores.

## Rutas de Lab a Producto

Usa estas rutas cuando quieras que un lab se convierta en material para revisión de diseño.

| Corte de Producto | Ejecuta | Compara Con | Finaliza Con |
| --- | --- | --- | --- |
| Support refund agent | Lab 01, Lab 07, Lab 12 | `native-framework-examples/mastra-refund/`, `native-framework-examples/langgraph-refund/` | [Support Refund Agent Capstone](../capstone-projects/support-refund-agent) |
| Research RAG assistant | Lab 03, Lab 06, Lab 11 | `native-framework-examples/langgraph-research-rag/` | [Research RAG Agent Capstone](../capstone-projects/research-rag-agent) |
| Multi-agent delivery workflow | Lab 05, Lab 08, Lab 13 | `native-framework-examples/autogen-delivery/`, `native-framework-examples/crewai-delivery/` | [Multi-Agent Delivery Workflow Capstone](../capstone-projects/multi-agent-delivery-workflow) |
| Custom runtime foundation | Labs 09, 10, 11 | Implementación mini-framework TypeScript o Python | [Reference Architecture](../systems-architecture/reference-architecture) |

Cada ruta debe terminar con una hoja de trabajo, no solo un comando exitoso. Usa la [hoja de trabajo de finalización de lab](/capstone-assets/templates/lab-completion-worksheet.txt), luego la [hoja de trabajo de preparación para producción de lab](/capstone-assets/templates/lab-production-readiness-worksheet.txt).

## Cobertura Actual

Los labs actuales ya cubren TypeScript, Python, límites de protocolo, pruebas neutrales a framework, grafos de state estilo LangGraph, transcripts estilo AutoGen, empaquetado de runtime estilo Mastra, orquestación de flow estilo CrewAI, primitivas de runtime desde cero, puertas de preparación para producción y ejemplos nativos de framework aislados.

Ejemplos nativos del repositorio:

| Ejemplo | Framework | Conecta Con |
| --- | --- | --- |
| `native-framework-examples/langgraph-refund/` | LangGraph | Lab 12 y Support Refund Agent capstone |
| `native-framework-examples/langgraph-research-rag/` | LangGraph | Lab 03 y Research RAG Agent capstone |
| `native-framework-examples/mastra-refund/` | Mastra | Lab 07 y Support Refund Agent capstone |
| `native-framework-examples/autogen-delivery/` | AutoGen | Lab 13 y Multi-Agent Delivery Workflow capstone |
| `native-framework-examples/crewai-delivery/` | CrewAI | Lab 08 y Multi-Agent Delivery Workflow capstone |

La expansión planeada de labs debe agregar:

- recorridos de despliegue más profundos que conecten la checklist de preparación con objetivos concretos de cloud/runtime.

## Puerta de Revisión de la Matriz

Antes de agregar un nuevo lab, actualiza esta página solo si el lab cambia la elección del lector. Un nuevo lab debe agregar al menos uno de estos:

- un nuevo límite de arquitectura;
- una comparación de lenguaje o runtime que falte;
- una preocupación de producción no cubierta por los labs existentes;
- una ruta capstone que los lectores puedan seguir de principio a fin;
- una porción nativa de framework que aclare qué posee el framework.

No agregues labs solo para cubrir otra biblioteca. Agrégalos cuando enseñen un límite que los ingenieros necesitan para lanzar sistemas más seguros.
