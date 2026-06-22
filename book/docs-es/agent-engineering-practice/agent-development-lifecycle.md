---
title: Agent Development Lifecycle
---

# Agent Development Lifecycle

El desarrollo de agents no es solo escribir prompts y desplegarlos al final. Es ingeniería de producto con un componente probabilístico en su interior.

Esa distinción importa. Un prompt puede hacer que una demo funcione. Un lifecycle hace que el sistema sobreviva después de la demo: cuando los usuarios hacen preguntas poco claras, los tools fallan, las policies cambian, los costos aumentan y el model propone con confianza una acción incorrecta.

Usa este lifecycle cuando un agent atenderá usuarios reales, llamará tools, accederá a datos privados, modificará sistemas externos o funcionará por más de una sesión de demo.

El lifecycle tiene un solo objetivo: mantener la autonomía conectada con la evidencia, el state, la policy, la evaluación y las operaciones.

La primera disciplina es no empezar con el agent. Empieza con el task, el state que necesita, los tools que puede usar, el riesgo que genera y la evidencia que prueba el éxito. Agrega autonomía solo donde realmente aporta valor.

## Qué Deberías Poder Hacer

Después de este capítulo, deberías poder:

- mover un agent de la idea a producción a través de gates explícitos;
- nombrar los artifacts requeridos antes de prototipo, piloto, producción y mayor autonomía;
- separar cambios de prompt de cambios de arquitectura, policy, tool, memory y eval;
- decidir cuándo la evidencia en producción justifica más autonomía;
- convertir incidentes en evals, actualizaciones de policy, cambios en runbooks o cambios de arquitectura.

## Mapa del Lifecycle

Usa este diagrama para leer el lifecycle como un evidence loop, no como una secuencia de fases de proyecto. Cada etapa debe producir artifacts que hagan que el siguiente gate sea inspeccionable.

![Agent development lifecycle](../public/diagrams/agent-development-lifecycle.svg)

## Etapas del Lifecycle

| Stage | Main Question | Output |
| --- | --- | --- |
| 1. Capability framing | ¿Qué debe hacer el agent y qué nunca debe hacer? | Capability map, exclusiones, clase de riesgo. |
| 2. Pattern selection | ¿Cuál es la arquitectura menos agentic que funciona? | Elección de pattern y presupuesto de complejidad. |
| 3. Boundary design | ¿Dónde terminan las decisiones del model y comienzan los controles de software? | Contratos de tool, policies, state model. |
| 4. Implementation | ¿Cómo percibe, decide, actúa y se detiene el agent? | Agent ejecutable, workflow o multi-agent system. |
| 5. Evaluation | ¿Cómo sabemos que funciona? | Eval suite, modos de falla, quality gates. |
| 6. Deployment | ¿Cómo corre de forma segura en producción? | Observability, rollback, límites de tasa, aprobaciones. |
| 7. Governance | ¿Cómo mejora sin perder el control? | Proceso de revisión, audit logs, versionado, incident loop. |

El lifecycle es iterativo. Los datos de producción deben actualizar evals, policies, prompts, diseño de tools y, a veces, la arquitectura misma. Si los fallos en producción solo generan ajustes en el prompt, probablemente el equipo está tratando síntomas.

## Development Gates

El lifecycle debe tener gates. Sin gates, una demo se convierte en piloto, un piloto en producción y la producción en autónoma sin que nadie tome la decisión explícitamente.

| Gate | Must Be True |
| --- | --- |
| Prototype ready | El task está definido, existen criterios de éxito, las acciones inseguras están excluidas y existe una línea base. |
| Pilot ready | Contratos de tool, state model, fixtures de eval, traces y fallback humano están en su lugar. |
| Production ready | Revisión de seguridad, reglas de aprobación, observability, rollback, runbooks y release gates están en su lugar. |
| Higher autonomy ready | Traces de producción prueban bajo índice de override, evals cubren incidentes conocidos y rollback está probado. |

Cada gate debe tener un responsable. Si nadie es dueño del gate, el gate no existe.

## Conjunto de Artifacts del Lifecycle

El lifecycle se vuelve real cuando cada gate produce artifacts revisables.

| Artifact | Created By | Used To Decide |
| --- | --- | --- |
| Capability map | Producto e ingeniería. | Qué puede hacer el agent, qué no debe hacer y qué debe escalar. |
| Pattern decision | Dueño de arquitectura. | Si el sistema necesita un prompt, workflow, loop, tools, memory o varios agents. |
| Authority map | Seguridad, plataforma y equipo de features. | Qué acciones son solo lectura, solo borrador, requieren aprobación o están prohibidas. |
| State and context contract | Dueño de runtime. | Qué sobrevive a reintentos, reanudaciones, aprobaciones y handoffs. |
| Eval suite | Ingeniería y revisores de dominio. | Si el comportamiento es suficientemente bueno para avanzar un gate. |
| Trace schema | Dueño de operaciones. | Si los fallos pueden reconstruirse y reproducirse. |
| Rollback plan | Dueño de releases. | Cómo deshabilitar una ruta de model, prompt, tool, policy o capability. |

Si falta un artifact, el gate debe indicarlo directamente. Una revisión vaga de "se ve bien" no es suficiente para sistemas que pueden actuar.

## No Empieces Con El Agent

Antes de construir el agent loop, responde estas preguntas:

- ¿Qué intenta lograr el usuario?
- ¿Qué haría un workflow determinista?
- ¿Qué partes requieren juicio, recuperación, planeación o elección de tool?
- ¿Qué state debe sobrevivir reintentos o esperas de aprobación?
- ¿Qué tools son solo lectura, pueden escribir, son externas o de alto riesgo?
- ¿Qué evidencia prueba que el resultado es correcto?
- ¿Cuál es el comportamiento correcto cuando falta evidencia?
- ¿Qué debe negarse a hacer el sistema?
- ¿Qué se evaluará antes del lanzamiento?
- ¿Cómo se deshabilitará la capability si falla?

Si esas respuestas son vagas, construir un agent solo automatizará la ambigüedad.

## Capability Framing

Empieza con un capability map, no con la elección de framework. Un framework no puede decirte qué está permitido que haga el agent.

Captura los trabajos del usuario y los resultados de negocio, las acciones permitidas y prohibidas, la evidencia requerida, los tools y datos necesarios, los puntos de aprobación, las restricciones de privacidad y cumplimiento, la latencia y costo aceptables y el comportamiento esperado ante fallos. Lo importante es el espacio negativo. Un agent con una lista clara de "no hará" es más fácil de lanzar que uno definido solo por lo que podría hacer.

Un buen capability framing suena concreto:

- "El agent puede redactar recomendaciones de reembolso, pero no puede emitir reembolsos."
- "El agent puede consultar el historial de cuentas, pero no puede acceder a instrumentos de pago."
- "El agent puede resumir un incidente, pero no puede llamar a un ingeniero de guardia sin aprobación."

Si el equipo no puede escribir límites así de claros, el agent no está listo para implementación.

## Pattern Selection

Selecciona el pattern más simple que resuelva el task. Aquí es donde muchos equipos sobreconstruyen. Un prompt resuelve un task acotado. Un prompt chain maneja fases conocidas. Routing maneja entradas que requieren diferentes caminos. Un agent loop resuelve el caso donde el siguiente paso depende de observaciones. Multi-agent systems manejan roles separados que requieren context, tools o permisos distintos.

No empieces con una arquitectura multi-agent solo porque el dominio tiene muchos tasks. Comienza agrupando capabilities en workflows estables. Separa agents solo donde los límites de rol son reales: context diferente, tools diferentes, permisos distintos, responsabilidades de revisión distintas o trabajo paralelo real.

El pattern incorrecto suele fallar de dos formas. Es demasiado simple y no maneja la incertidumbre. O es demasiado agentic y se vuelve costoso, lento y difícil de depurar. El lifecycle debe detectar ambos casos.

Usa una línea base determinista incluso si planeas lanzar un agent. La línea base te da algo contra qué comparar. Si un agent no puede superar un formulario, una página de búsqueda, un workflow o un prompt chain en calidad, cobertura o costo operativo, la autonomía extra aún no está justificada.

## Boundary Design

Antes de implementar, define los límites del sistema. Este es el trabajo de arquitectura que evita que el model se convierta silenciosamente en toda la aplicación.

- ¿Quién es dueño del state?
- ¿Quién es dueño de la policy?
- ¿Quién controla los permisos de tool?
- ¿Quién controla los writes de memory?
- ¿Quién aprueba finalmente?
- ¿Qué se puede reproducir tras un fallo?
- ¿Qué se puede cambiar sin redeplegar código?

El model puede proponer acciones. El software valida, ejecuta, registra y aplica.

Este límite debe ser visible en el código. Los tool schemas no deben ser vagos. Las transiciones de state no deben estar ocultas en lenguaje natural. Las reglas de aprobación no deben vivir solo en el system prompt. Los writes de memory deben ser revisados o restringidos antes de convertirse en future context.

## Implementation

La implementación debe hacer visible el lifecycle en el código. Un lector debe poder encontrar el goal object, el state model, el límite de tool, los chequeos de policy, la condición de stop y la emisión de trace sin tener que descifrar un prompt.

Unidades mínimas de implementación:

- un goal o request object;
- state tipado;
- tool schemas;
- chequeos de policy;
- condiciones de stop;
- eventos de trace;
- fixtures de eval;
- configuración de deployment.

Evita implementaciones donde el único artifact durable sea una transcripción de conversación. Las transcripciones son evidencia útil. No son un state model.

La implementación también debe hacer explícito el fallo. Una llamada a tool fallida, un chequeo de policy denegado, un stop por presupuesto y una cancelación de usuario son resultados distintos. No los colapses en "el agent falló."

## Lista de Verificación de Preparación para Lanzamiento

Antes de que un agent llegue a producción, el equipo debe poder señalar artifacts concretos:

- owner y ruta de soporte;
- capability map y exclusiones;
- contrato de entrada, salida y errores;
- nivel de autonomía por acción;
- tool manifests y clases de capability;
- state schema y razones de detención;
- ensamblaje de context y memory policy;
- reglas de aprobación y ruta de escalamiento;
- revisión de seguridad y privacidad;
- eval suite con casos bloqueantes;
- plan de observability y trace schema;
- presupuestos de costo, latencia y tools;
- rollback, kill switch o desactivación de capability;
- ADRs para cambios de authority, memory, tools y autonomy.

## Evaluación

Evalúa antes y después del lanzamiento. Los agents cambian su comportamiento cuando cambian los prompts, tools, models, memory, retrieval indexes, policies o la población de usuarios. La evaluación no es una lista de verificación de lanzamiento. Es el feedback loop del sistema.

La evaluación previa al lanzamiento debe cubrir tasks de happy-path, solicitudes ambiguas de usuarios, datos faltantes, fallas de tools, fallas de retrieval, intentos de prompt-injection, acciones que requieren aprobación y presupuestos de costo y latencia. La evaluación posterior al lanzamiento debe agregar fallas en producción, correcciones de usuarios, casos de intervención humana y edge cases encontrados en traces. Cada incidente serio debe dejar un caso de eval.

Los filtros de evaluación deben estar ligados a los lanzamientos. Una actualización de model, reescritura de prompt, cambio en el tool manifest, cambio en memory policy, cambio en retrieval index o cambio en approval policy debe ejecutar la regression suite relevante antes del despliegue.

Evals bloqueantes útiles incluyen:

- llamadas a tools prohibidas;
- falta de aprobación antes de efectos secundarios;
- escrituras inseguras en memory;
- evidencia obsoleta o faltante;
- violaciones de tenant-boundary;
- falla al detenerse por presupuesto o cancelación;
- citas alucinadas;
- mala recuperación ante fallas de tools.

## Despliegue

El despliegue en producción requiere más que un endpoint alojado. Necesita control operacional: versionado de model y prompt, límites de tasa y presupuestos de costo, timeouts a nivel de tool, audit logs, trace IDs que abarquen tools y agents, alertas para eventos críticos, rutas de escalamiento humano y rollback para prompts, policies y tools. Si un despliegue no puede explicar qué hizo el agent, no está listo para trabajo de alto impacto. El operador debe poder responder cuál goal estaba activo, qué evidencia se usó, qué tools se invocaron, qué policies pasaron, qué cambió y por qué se detuvo la ejecución.

El rollout debe ser escalonado:

1. evals offline con tools simulados;
2. dogfood interno con tools de solo lectura;
3. piloto limitado con aprobación humana para efectos secundarios;
4. rollout canario en producción con presupuestos estrictos;
5. rollout más amplio solo después de que traces y overrides lo respalden;
6. mayor autonomía solo después de que la evidencia en producción lo justifique.

El objetivo no es ralentizar al equipo. El objetivo es que cada aumento en autonomía sea una decisión de ingeniería explícita.

## Gobernanza

La gobernanza es el control loop alrededor del agent. Decide cómo cambia el sistema sin perder los límites que lo hicieron lo suficientemente seguro para lanzarse. Eso implica revisar nuevos tools, cambios en prompts y policies, memory schemas, cambios en eval, umbrales de aprobación, reportes de incidentes y upgrades de model.

Trata los cambios en agents como cambios de producto e infraestructura. Pequeñas ediciones en prompts pueden cambiar el comportamiento tanto como los cambios de código. Nuevos tools pueden cambiar la clase de riesgo de todo el sistema. Un upgrade de model puede invalidar resultados antiguos de eval. Un cambio en memory schema puede cambiar lo que el agent cree sobre usuarios recurrentes.

El ciclo de vida solo se completa cuando estos cambios son revisados, probados, desplegados, observados y retroalimentados en la siguiente iteración.

## Modos de Falla

- El desarrollo orientado a demos pasa a producción sin nuevos controles.
- El equipo lanza un agent sin una línea base determinista.
- Cambios en prompts se lanzan sin regression evals.
- Se agregan tools antes de definir los límites de capability.
- Se habilita memory antes de que existan políticas de escritura, eliminación y corrección.
- El agent no tiene un owner claro después del lanzamiento.
- La aprobación humana existe en la UI pero no en la runtime policy.
- Los traces de producción no pueden reconstruir llamadas a tools, context, memory y decisiones.
- Upgrades de model ocurren sin medir el drift de comportamiento.
- Los incidentes solo llevan a ajustes en prompts, no a evals, cambios en policies o correcciones de arquitectura.

## Preguntas para Revisión del Ciclo de Vida

En cada cambio importante, pregunta:

- ¿Cambió el nivel de autonomía?
- ¿Cambió la autoridad de tool?
- ¿Cambió la memory policy?
- ¿Cambió el context builder o retrieval index?
- ¿Cambió el model, prompt, routing o fallback?
- ¿Cambió la aprobación, presupuesto o comportamiento de detención?
- ¿Cambió la observability o redacción?
- ¿Qué evals prueban que esto sigue siendo aceptable?
- ¿Qué ADR o runbook debe actualizarse?
- ¿Cómo hacemos rollback?

## Capítulos Relacionados

- [Choosing the Right Pattern](../pattern-selection/choosing-the-right-pattern)
- [Architecture Decision Records for Agents](../systems-architecture/architecture-decision-records)
- [Evaluation-Driven Agent Development](./evaluation-driven-agent-development)
- [Goals and State](../foundations/goals-and-state)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Agent UX and Human Trust](./agent-ux-and-human-trust)
- [Agentic System Architecture](../systems-architecture/agentic-system-architecture)
