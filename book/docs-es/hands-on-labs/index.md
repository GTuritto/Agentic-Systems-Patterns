---
title: Hands-On Labs
---

# Hands-On Labs

Los labs convierten los capítulos de referencia en una ruta de construcción. Cada lab utiliza código que ya existe en este repositorio, así que puedes leer el pattern, ejecutar el ejemplo, cambiar una cosa y conectar el resultado con el diseño de producción.

Los labs son intencionalmente agnósticos al framework. Se mueven entre TypeScript y Python, y abarcan runtimes personalizados mínimos, recuperación al estilo LangChain/LangGraph, ejemplos de manager/worker al estilo AutoGen, código de protocolo A2A, límites de tool al estilo MCP y pruebas neutrales al framework. El objetivo no es enseñar una API específica. El objetivo es mostrar la arquitectura que sobrevive cuando el framework cambia.

Usa [Lab Framework and Language Matrix](./framework-language-matrix.md) antes de comenzar si quieres ver qué lenguaje, framework y límite arquitectónico enfatiza cada lab. Usa [Lab Production Readiness Checklist](./production-readiness-checklist.md) y la [lab production readiness worksheet](/capstone-assets/templates/lab-production-readiness-worksheet.txt) después de cada lab para identificar qué le falta al demo antes de producción. Usa [From-Scratch Mini-Framework Track](./from-scratch-mini-framework.md) cuando quieras entender qué empaquetan los agent frameworks bajo el capó. Usa [Vertical Slice Examples](./vertical-slice-examples.md) después de los labs, o cuando quieras ver varios patterns compuestos en una task realista. Usa [Capstone Projects](/capstone-projects/) cuando quieras ejemplos con forma de producto que incluyan ADRs, traces, evals, runbooks, planes de rollback y slices nativos de framework.

Ejecuta estos comandos desde la raíz del repositorio antes de comenzar:

```sh
npm install
npm test
npm run typecheck
```

Algunos ejemplos pueden ejecutarse con fallbacks deterministas. Los ejemplos que llaman modelos en vivo requieren un archivo `.env` con `MISTRAL_API_KEY`.

## Lab Progression Map

Usa este mapa para entender por qué los labs están ordenados de esta manera. La secuencia inicia con primitivas deterministas, expone el mini-framework debajo de los agent runtimes, compara slices nativos de framework y luego avanza hacia evidencia de lanzamiento a nivel capstone.

![Lab progression map](../public/diagrams/lab-progression-map.svg)

## Lab Standard

Cada lab debe dejarte con tres cosas: un ejemplo ejecutable, un límite de diseño específico que puedas explicar y un paso de robustecimiento hacia producción que sepas cómo realizar.

Cada lab sigue el mismo contrato de aprendizaje:

1. Indicar el objetivo.
2. Nombrar el lenguaje, framework y archivos fuente.
3. Ejecutar un comando base.
4. Inspeccionar el límite del código.
5. Cambiar una cosa.
6. Verificar el resultado.
7. Identificar qué necesitaría producción a continuación.

Los ejemplos se mantienen pequeños a propósito. Un ejemplo pequeño solo es útil cuando el lab también indica qué falta intencionalmente: state durable, enforcement de policy, schemas más robustos, aprobación, tracing, evals, despliegue o integración con framework. Cuando existe un slice nativo de framework, trátalo como el siguiente punto de comparación, no como un reemplazo del lab determinista.

## Planning Table

Usa esta tabla para elegir un lab según el esfuerzo y el resultado. Las estimaciones de tiempo asumen que ya puedes ejecutar las pruebas del repositorio. Cada página de lab también incluye bloques de tiempo opcionales por ejercicio para que puedas dividir el trabajo en sesiones más cortas.

Descarga la worksheet reutilizable: [lab completion worksheet](/capstone-assets/templates/lab-completion-worksheet.txt).

Descarga la worksheet de seguimiento para producción: [lab production readiness worksheet](/capstone-assets/templates/lab-production-readiness-worksheet.txt).

Para los labs de mayor impacto, usa las worksheets enfocadas para [Lab 02 planning loops](/capstone-assets/templates/lab-02-planning-loop-guided-exercise.txt), [Lab 03 Agentic RAG](/capstone-assets/templates/lab-03-agentic-rag-guided-exercise.txt), [Lab 06 observability and evals](/capstone-assets/templates/lab-06-observability-evals-guided-exercise.txt), [Lab 07 runtime packaging](/capstone-assets/templates/lab-07-runtime-packaging-guided-exercise.txt) y [Lab 12 state graphs](/capstone-assets/templates/lab-12-state-graph-guided-exercise.txt).

Compara tu worksheet terminada con los [completed lab evidence examples](/capstone-assets/templates/completed-lab-evidence-examples.txt) antes de considerar el lab listo para revisión.

Usa los [captured lab and capstone command output examples](/capstone-assets/output-examples/lab-and-capstone-command-output.txt) cuando necesites un modelo concreto para salida de comandos guardada, snapshots de trace, snapshots de eval y evidencia de lanzamiento.

| Lab | Time | Level | Prerequisite | Reusable Artifact |
| --- | ---: | --- | --- | --- |
| [Lab 01 - Tool-Using Agent](./lab-01-tool-using-agent.md) | 20-30 min | Beginner | TypeScript basics | Tool boundary and error behavior. |
| [Lab 02 - Agent Loop and Planning](./lab-02-agent-loop-and-planning.md) | 35-55 min | Beginner | Lab 01 or equivalent tool boundary | Plan/execute split with structured stop-condition evidence. |
| [Lab 03 - Agentic RAG](./lab-03-agentic-rag.md) | 45-75 min | Intermediate | Retrieval and Python basics | Evidence-grounded answer path plus missing-evidence eval fixture. |
| [Lab 04 - A2A Communication](./lab-04-a2a-communication.md) | 45-60 min | Intermediate | JSON schema and HTTP/message concepts | Typed agent message envelope. |
| [Lab 05 - Multi-Agent Supervisor](./lab-05-multi-agent-supervisor.md) | 45-60 min | Intermediate | Delegation and aggregation concepts | Supervisor/worker contract. |
| [Lab 06 - Observability and Evals](./lab-06-observability-and-evals.md) | 50-85 min | Intermediate | Any earlier lab | Trace contract, negative eval, and CI gate sketch. |
| [Lab 07 - Mastra Runtime Packaging](./lab-07-mastra-runtime-packaging.md) | 70-105 min | Advanced | TypeScript runtime packaging | Agent, tool, workflow, memory, eval, and rollback slice. |
| [Lab 08 - CrewAI Flows and Crews](./lab-08-crewai-flows-and-crews.md) | 60-90 min | Advanced | Python and role/task orchestration | Flow, crew, role, and acceptance contract. |
| [Mini-Framework Track](./from-scratch-mini-framework.md) | 2-4 hr | Advanced | Labs 01, 02, and 06 | Runtime primitives you can compare to frameworks. |
| [Lab 09 - Minimal Agent Loop](./lab-09-minimal-agent-loop.md) | 45-75 min | Intermediate | Mini-framework setup | Loop state, observations, budgets, and stop reasons. |
| [Lab 10 - Tool Registry and Policy Gate](./lab-10-tool-registry-and-policy-gate.md) | 45-75 min | Intermediate | Lab 09 | Tool registry with policy decisions. |
| [Lab 11 - Context, Memory, Trace, and Evals](./lab-11-context-memory-trace-evals.md) | 60-90 min | Advanced | Labs 09 and 10 | Reviewable runtime trace and trajectory eval. |
| [Lab 12 - LangGraph State Graph](./lab-12-langgraph-state-graph.md) | 70-105 min | Advanced | Graph/state concepts | Checkpointed state graph with interrupt, resume, and replay review. |
| [Lab 13 - AutoGen Transcript Evals](./lab-13-autogen-transcript-evals.md) | 60-90 min | Advanced | Multi-agent basics | Transcript rubric and regression check. |

## Completion Standard

Un lab está completo cuando puedes mostrar cuatro cosas:

1. El comando base se ejecuta.
2. La salida esperada coincide con la señal de éxito del lab.
3. Un camino de falla intencional es visible y controlado.
4. Puedes nombrar la brecha de producción antes de usar el pattern con usuarios reales, datos, credenciales o efectos secundarios.

No cuentes un lab como terminado solo porque el camino feliz funciona. El valor viene de ver el límite: qué puede decidir el model, qué debe hacer cumplir el software, qué se traza y qué bloquearía la producción.

## Paquete de Evidencia del Lab

Guarda un pequeño paquete de evidencia después de cada lab. Esto convierte el lab de un ejercicio de una sola vez en material que puedes reutilizar en una revisión de diseño, ADR, eval suite o capstone.

| Evidencia | Qué Capturar | Por Qué Importa |
| --- | --- | --- |
| Baseline command | Comando, estado de salida y señal de salida esperada. | Demuestra que el ejemplo funcionaba antes de que lo cambiaras. |
| Source boundary | Archivos inspeccionados y el contrato que posee cada archivo. | Muestra dónde el pattern se convierte en código. |
| Small change | Un cambio en input, rule, prompt, tool, schema o policy. | Demuestra que puedes modificar el comportamiento intencionalmente. |
| Failure path | Error, rechazo, denegación, timeout, budget stop o input inválido. | Muestra que el boundary falla de forma visible y no silenciosa. |
| Trace o log | Trace mínimo, transcripción o structured output. | Da a futuros evals algo concreto para validar. |
| Production gap | Control faltante y el siguiente artifact necesario. | Conecta el lab con la arquitectura de producción. |

Mantén el paquete corto. Una pantalla de evidencia es mejor que una carpeta llena de capturas de pantalla sin revisar.

Usa los [ejemplos de evidencia de labs completados](/capstone-assets/templates/completed-lab-evidence-examples.txt) como calibración. Un buen paquete de evidencia nombra el comando, salida, failure path, boundary protegido, production gap y el siguiente owner.

Usa los [ejemplos de salida de comando capturada](/capstone-assets/output-examples/lab-and-capstone-command-output.txt) para comparar la forma de tu salida de terminal guardada. La señal importante no es una captura de pantalla. Es un registro corto y revisable que muestra el comando, señal de éxito, trace o enlace a eval, y la pregunta de producción.

## Regla Agnóstica de Framework

Los frameworks cambian la API, no las preguntas de arquitectura. Para cada lab, pregunta:

- ¿Quién posee el state?
- ¿Qué puede decidir el model?
- ¿Qué puede validar el software?
- ¿Qué tools están expuestas?
- ¿Qué policy se aplica fuera del prompt?
- ¿Qué se traza?
- ¿Por qué se detiene la ejecución?

Estas preguntas aplican tanto si el código usa LangGraph, LangChain, Mastra AI, agentes estilo AutoGen, CrewAI, MCP, A2A o un runtime personalizado pequeño.

## Ruta de Lectura End-To-End

Usa esta ruta cuando quieras pasar de aprender a implementar:

1. Comienza con [Lab Framework and Language Matrix](./framework-language-matrix.md) y elige el boundary de mayor riesgo.
2. Ejecuta el lab determinista correspondiente.
3. Lee la extensión de producción y la checklist de preparación.
4. Compara el ejemplo nativo correspondiente bajo `native-framework-examples/`.
5. Mapea el mismo comportamiento a un capstone.
6. Llena el ADR de selección de framework y la hoja de rollback.
7. Agrega evals que fallen el build antes de agregar tools con efectos secundarios reales.

Para la ruta de reembolso de soporte, usa el Lab 07, `native-framework-examples/mastra-refund/`, el capstone Support Refund Agent y la hoja de preparación para producción.

## Secuencia de Labs

1. [Lab Framework and Language Matrix](./framework-language-matrix.md)
2. [Lab Production Readiness Checklist](./production-readiness-checklist.md)
3. [Build a Tool-Using Agent](./lab-01-tool-using-agent.md)
4. [Build an Agent Loop with Planning](./lab-02-agent-loop-and-planning.md)
5. [Build Agentic RAG](./lab-03-agentic-rag.md)
6. [Build A2A Agent Communication](./lab-04-a2a-communication.md)
7. [Build a Multi-Agent Supervisor](./lab-05-multi-agent-supervisor.md)
8. [Add Observability and Evals](./lab-06-observability-and-evals.md)
9. [Package Agents, Tools, Workflows, Memory, and Evals](./lab-07-mastra-runtime-packaging.md)
10. [Model Flows, Crews, Roles, and Task Contracts](./lab-08-crewai-flows-and-crews.md)
11. [Study the From-Scratch Mini-Framework Track](./from-scratch-mini-framework.md)
12. [Build a Minimal Agent Loop](./lab-09-minimal-agent-loop.md)
13. [Build a Tool Registry and Policy Gate](./lab-10-tool-registry-and-policy-gate.md)
14. [Add Context, Memory, Trace, and Evals](./lab-11-context-memory-trace-evals.md)
15. [Model State Graphs, Checkpoints, and Interrupts](./lab-12-langgraph-state-graph.md)
16. [Evaluate Multi-Agent Transcripts](./lab-13-autogen-transcript-evals.md)
17. [Study Vertical Slice Examples](./vertical-slice-examples.md)

## Cómo Usar Estos Labs

Lee primero el objetivo, luego ejecuta el comando exactamente como se muestra. Después, inspecciona los archivos fuente nombrados y haz el small change en el lab. El objetivo es ver dónde el pattern se convierte en código: contratos de input, state, límites de tool, condiciones de stop, evaluación y manejo de fallas.

Cada lab termina con una extensión de producción. Trata esa sección como el puente entre un demo funcional y una decisión de arquitectura.

## Mapa de Salida Esperada

Usa esta tabla como verificación rápida de éxito antes de pasar a la extensión de producción.

| Lab | Expected Output Signal |
| --- | --- |
| Lab 01 | Resultados estructurados `read_order` y `search_refund_policy` con etiquetas de confianza y referencias de evidencia. |
| Lab 02 | `Planning test OK` más un plan determinista y resultado para el camino CLI. |
| Lab 03 | La respuesta refleja la evidencia recuperada del set de documentos local. |
| Lab 04 | La prueba A2A muestra éxito, rechazo, error de input inválido y cancelación. |
| Lab 05 | El manager delega trabajo acotado y la agregación final usa los outputs de los workers. |
| Lab 06 | Los registros de eval exponen casos de éxito y negativos, no solo el texto final. |
| Lab 07 | `Mastra-style runtime packaging tests OK`; el slice nativo expone agent, tools, workflow y eval gate. |
| Lab 08 | `CrewAI-style flow and crew tests OK`; Flow acepta solo outputs de roles validados. |
| Lab 09 | La respuesta inmediata se detiene con `success`; las propuestas repetidas de tool se detienen con `budget_exhausted`. |
| Lab 10 | Tools desconocidas son rechazadas, tools de escritura requieren aprobación y las tools permitidas registran observaciones. |
| Lab 11 | El trace contiene context, decisión, tool/policy y eventos de stop; eval de trayectoria insegura falla. |
| Lab 12 | `LangGraph-style state graph tests OK`; resume preserva el state con checkpoint. |
| Lab 13 | `AutoGen-style transcript tests OK`; la transcripción prueba el orden de roles, razón de stop y owner final. |

## Orden Recomendado

Haz los labs en orden si eres nuevo en agent systems. La secuencia comienza con un agent y un tool, luego agrega planeación, retrieval, comunicación remota entre agents, coordinación multi-agent y evaluación de calidad de producción.

Si ya conoces lo básico, comienza con el lab más cercano a tu sistema actual y usa los capítulos relacionados como material de referencia.

Después de los labs, lee los vertical slices para ver cómo los mismos patterns se componen en workflows de soporte, código e investigación. Luego lee los [Capstone Projects](/capstone-projects/) para ver sistemas con forma de producción, mapeos de framework, slices nativos y evidencia de release.

Si estás evaluando frameworks, haz el track de mini-framework antes de elegir un runtime de producción. Construir los primitivos una vez facilita ver qué responsabilidades posee un framework y cuáles permanecen en tu aplicación.
