---
title: Framework Selection
---

# Framework Selection

Los agent frameworks pueden acelerar el desarrollo, pero también definen los límites del sistema. Selecciona un framework después de conocer el pattern, el state model, las tools, las necesidades de eval y las restricciones de deployment.

Usa este capítulo para comparar frameworks sin convertir la arquitectura en una demostración del framework.

Para una comparación lado a lado de LangGraph, sistemas estilo AutoGen, Mastra AI, CrewAI y un mini-runtime personalizado, usa [Cross-Framework Decision Matrix](./cross-framework-decision-matrix). Para notas concretas de instalación y portabilidad, usa [Real Framework Setup Notes](./real-framework-setup-notes). Para el registro de decisiones, usa [Templates and Worksheets](./templates-and-worksheets).

## Decision Tree

Usa este diagrama para mantener la conversación sobre frameworks enfocada en la forma de la carga de trabajo. La pregunta útil es qué hace más fácil inspeccionar el framework: el state directo, la ejecución de graphs, el runtime packaging, los transcripts de roles o la coordinación del business-flow.

![Framework selection decision tree](../public/diagrams/framework-selection-decision-tree.svg)

## Intent

Elige si construir directamente, usar una librería ligera o adoptar un agent framework completo.

El framework correcto debe hacer más visibles las partes importantes: state, tools, policy, traces, handoffs y modos de falla.

El framework incorrecto hace la demo más rápida y el sistema más difícil de mantener. Oculta el state, convierte las llamadas a tools en magia, hace que la memory parezca automática y le da al equipo un vocabulario antes de tener una arquitectura.

## Selection Criteria

| Criterio | Preguntas |
| --- | --- |
| Control flow | ¿Soporta chains, graphs, loops, routing y human gates? |
| State | ¿Puede persistir, reanudar, inspeccionar y migrar el state? |
| Tooling | ¿Las tools pueden ser tipadas, acotadas, testeadas y auditadas? |
| Multi-agent | ¿Puede representar roles, handoffs y ownership claramente? |
| Memory | ¿Separa working, episodic, semantic y procedural memory? |
| Evaluation | ¿Pueden los evals ejecutarse sobre routes, tools, traces y outputs finales? |
| Observability | ¿Expone llamadas a model, tool, costos, latencia y errores? |
| Security | ¿Pueden las tools y agents ejecutarse con el menor privilegio posible? |
| Deployment | ¿Puede ejecutarse donde tu sistema lo requiere? |
| Escape hatch | ¿Puedes bajar a código cuando la abstracción es incorrecta? |
| Portability | ¿Pueden prompts, tools, evals, policies y state sobrevivir un cambio de framework? |
| Ownership | ¿Tu equipo puede depurar fallas en producción sin esperar por los internals del framework? |

No adoptes un framework que oculte una preocupación que tu producto debe controlar.

## Fit By Problem Shape

Empieza desde la carga de trabajo, no desde la categoría de framework.

| Forma del problema | Mejor opción | Precauciones |
| --- | --- | --- |
| Single bounded task | código directo o prompt library. | sobreconstruir state y orquestación. |
| Known phases | prompt chain o workflow. | ocultar validación entre pasos. |
| Branching workflow | graph o durable workflow framework. | proliferación de graphs y ownership de state poco claro. |
| Tool-heavy agent | tool registry más policy boundary. | tools demasiado amplias y controles de aprobación débiles. |
| Evidence-heavy answers | RAG framework más context builder. | retrieval desconectado de policy y evals. |
| Long-running work | durable workflow runtime. | loops en memoria y pérdida de approval state. |
| Multi-role work | multi-agent framework o topología de servicios. | especialización falsa con context duplicado. |
| Cross-agent communication | A2A, contratos de servicio, colas o workflows. | handoffs en lenguaje natural sin schema. |
| Product runtime | application/runtime framework. | lock-in de plataforma y operaciones opacas. |
| Coding agents | harness aislado con controles de archivos, comandos, tests y aprobación. | acceso a shell sin policy o replay. |

Si dos enfoques funcionan, elige el que haga más fácil inspeccionar state, tools, policy, evals y rollback.

## Common Framework Shapes

| Forma | Fortaleza | Riesgo |
| --- | --- | --- |
| Prompt and tool library | Rápido para agents simples. | Debes construir state, evals y operaciones tú mismo. |
| Graph/workflow framework | Rutas de ejecución claras, state durable, edges condicionales. | Los graphs pueden volverse difíciles de leer si cada rama es un nodo. |
| Multi-agent framework | Primitivas de roles y delegación. | Fácil sobreutilizar agents donde un workflow es suficiente. |
| RAG framework | Retrieval, índices y conectores de datos. | Retrieval puede desconectarse de policy y evals. |
| Runtime framework | Deployment, tracing, memory, workflows y operaciones. | Las decisiones de runtime pueden llevar a lock-in de plataforma. |

La mejor opción puede ser combinar pocas capas en vez de un solo framework grande.

## Capability Matrix

Usa esta matriz durante la evaluación. El objetivo no es asignar puntajes por características de marketing. El objetivo es identificar qué responsabilidades asume el framework y cuáles debe seguir asumiendo tu aplicación.

| Capability | Preguntas a realizar |
| --- | --- |
| State model | ¿Dónde se almacena el state? ¿Puede inspeccionarse, migrarse, reproducirse y versionarse? |
| Tool boundary | ¿Las tools son tipadas? ¿Scopes, efectos secundarios, aprobaciones y trace fields son explícitos? |
| Policy | ¿Puede la policy ejecutarse antes de llamadas a tools, escrituras de memory, retrieval y respuestas finales? |
| Memory | ¿Se separan working, episodic, semantic y user memory? ¿Se pueden revisar las escrituras? |
| Context | ¿Puede el framework mostrar qué context packet se armó para cada llamada a model? |
| Human approval | ¿Las aprobaciones son durables, ligadas a acciones exactas, expiran y son auditables? |
| Evals | ¿Pueden los evals probar trayectorias, llamadas a tools, rechazos, escrituras de memory y citas? |
| Observability | ¿Se trazan llamadas a model, tool, costos, latencia, decisiones de policy y reintentos? |
| Security | ¿Puede hacer cumplir least privilege, sandboxing, alcance de credenciales y límites de salida? |
| Deployment | ¿Soporta tu runtime, residencia de datos, escalabilidad, rollback y proceso de incidentes? |
| Interop | ¿Puede exponer o consumir MCP, A2A, REST, colas o tus contratos de servicio existentes? |
| Exit path | ¿Puedes mover prompts, tools, state, policies y evals después? |

## Build Directly When

- El workflow es corto y estable.
- Necesitas control exacto sobre state y policy.
- El equipo ya tiene infraestructura de workflow.
- El agent está embebido en un producto existente.
- La capacidad de depuración importa más que el prototipado rápido.
- El framework introduciría más conceptos de los que el dominio requiere.

El código directo suele ser la mejor primera versión productiva para un workflow acotado.

Build directly no significa construir sin cuidado. Significa usar límites normales de software: inputs tipados, tablas de state, clientes de tools, chequeos de policy, tests, traces y controles de deployment. Una implementación directa pequeña con límites fuertes es mejor que una implementación en framework que los oculte.

## Use a Framework When

- El sistema necesita ejecución de graphs durables.
- Los agents requieren registro y descubrimiento de tools.
- Los handoffs multi-agent son centrales para el producto.
- Necesitas tracing, evals o soporte de deployment integrados.
- Vas a construir muchos agents relacionados.
- El equipo se beneficia de convenciones compartidas.

Usa un framework para hacer consistentes los patterns repetidos, no para evitar entender la arquitectura.

La adopción de frameworks es más fuerte cuando el equipo ya conoce las responsabilidades que necesita que el framework asuma. Es más débil cuando el equipo dice "necesitamos agents" y deja que el framework defina la arquitectura después.

## Evaluation Process

Prueba un framework con un vertical slice:

1. una solicitud real de usuario;
2. una ruta o workflow;
3. una tool de lectura;
4. una tool de escritura con aprobación;
5. una lectura o escritura de memory;
6. un camino de falla;
7. un caso de eval;
8. una inspección de trace;
9. un camino de deployment.

Si el slice es difícil de inspeccionar, probar o asegurar, detente antes de que el framework se expanda.

Agrega un segundo vertical slice para fallas:

1. solicitud de usuario mal formada;
2. evidencia faltante;
3. rechazo de policy check;
4. timeout de tool;
5. espera de aprobación;
6. cancelación;
7. replay desde trace;
8. rollback de prompt, model o configuración de tool.

La mayoría de los frameworks se ven bien en el camino feliz. El slice de fallas te dice si puedes operarlo.

## Portability And Exit

Asume que el framework puede cambiar. La forma más segura de adoptar uno es mantener los activos principales portables:

- tool manifests;
- archivos de prompt e instrucciones;
- state schemas;
- memory schemas;
- reglas de aprobación;
- reglas de policy;
- fixtures de eval;
- trace schema;
- context packet shape;
- architecture decision records.

Evita enterrar estos activos dentro de callbacks o decoradores específicos del framework si representan policy del producto. El framework puede ejecutarlos. No debe ser el único lugar donde existen.

## Anti-Patrones de Framework

- Seleccionar un framework porque soporta todos los patterns.
- Reemplazar decisiones de arquitectura con valores predeterminados del framework.
- Dar a todos los agents del framework el mismo context y tools.
- Aceptar traces opacos.
- Saltarse evals porque el demo del framework funcionó.
- Tratar la memory del framework como confiable por defecto.
- Usar un framework multi-agent para simple routing.
- Tratar la observability incorporada como suficiente sin incident replay.
- Aceptar abstracciones de tools del framework que no pueden expresar side effects o approvals.
- Permitir que los valores predeterminados del framework decidan la retención de memory, el ensamblaje de context o el alcance de seguridad.

## Lista de Verificación para Decisiones

Antes de adoptar un framework, responde:

- ¿Qué pattern estamos implementando?
- ¿Qué responsabilidades asume el framework?
- ¿Qué responsabilidades permanecen en nuestra aplicación?
- ¿Podemos inspeccionar state, context, llamadas a tools, memory, decisiones de policy y traces?
- ¿Podemos ejecutar evals sin llamar tools reales con side effects?
- ¿Podemos hacer cumplir approval y least privilege fuera del prompt?
- ¿Podemos desplegar, hacer rollback y deshabilitar una capability rápidamente?
- ¿Podemos migrar sin reescribir prompts, tools, state, evals y policy?
- ¿Qué ADR registra esta elección?
- ¿Qué falla nos haría reconsiderar el framework?

## Capítulos Relacionados

- [Agent Engineer Toolkit](./agent-engineer-toolkit)
- [Cross-Framework Decision Matrix](./cross-framework-decision-matrix)
- [Real Framework Setup Notes](./real-framework-setup-notes)
- [Templates and Worksheets](./templates-and-worksheets)
- [Agent Harnesses](./agent-harnesses)
- [Agent Development Lifecycle](./agent-development-lifecycle)
- [Architecture Decision Records for Agents](../systems-architecture/architecture-decision-records)
- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Mastra Runtime](../production-runtime/mastra-runtime)
- [CrewAI Flows and Crews](../multi-agent-systems/crewai-flows-and-crews)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
