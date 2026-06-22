---
title: Coding Agents
---

# Coding Agents

Los coding agents operan dentro de repositorios de software. Leen código, editan archivos, ejecutan comandos, inspeccionan fallos, generan diffs y, a menudo, crean commits o pull requests. Codex, Cursor Agent y Cloud Agent, Claude Code, OpenHands y herramientas similares son ejemplos de esta clase de arquitectura.

El pattern no es "AI autocomplete". Es un trabajador de desarrollo controlado con context de repositorio y privilegios de ejecución.

## Ejemplos

- [Codex CLI](https://developers.openai.com/codex/cli) y [Codex IDE extension](https://developers.openai.com/codex/ide)
- [Cursor Agent](https://cursor.com/docs/agent/overview), [Plan Mode](https://cursor.com/docs/agent/plan-mode) y [Cloud Agents](https://cursor.com/docs/cloud-agent)
- [Claude Code](https://code.claude.com/docs/en/overview)
- [OpenHands](https://openhands.dev/) y [OpenHands GitHub](https://github.com/OpenHands/openhands)

## Core Loop

![Coding agent loop](../public/diagrams/coding-agent-loop.svg)

## Superficies

- **Local CLI:** se ejecuta cerca del repositorio y puede usar herramientas locales.
- **IDE agent:** comparte context del editor, archivos seleccionados, diffs en línea y comandos locales.
- **Cloud o background agent:** clona o monta el repositorio en un entorno aislado y devuelve una branch, diff o PR.
- **CI/review agent:** revisa pull requests, comenta en diffs o propone parches.
- **Multi-agent workspace:** ejecuta varios agents en branches o worktrees separados.

## Consideraciones de Arquitectura

Los coding agents necesitan límites inusualmente claros porque pueden cambiar el código fuente y ejecutar comandos.

Diseña para:

- Instrucciones del repositorio: estándares de codificación, comandos, restricciones de arquitectura y expectativas de revisión.
- Aislamiento del workspace: branch, worktree, contenedor o entorno cloud por task.
- Approval policy: qué comandos y ediciones de archivos requieren aprobación humana.
- Test signal: primero pruebas rápidas, luego pruebas de regresión más amplias.
- Diff review: los humanos inspeccionan el comportamiento cambiado, no solo el texto final.
- Manejo de secretos: sin credenciales en prompts, logs ni código generado.
- Dependency policy: aprobación explícita antes de agregar paquetes o cambiar lockfiles.

## Coding Agent As A Service

Un coding agent maduro se comporta como un servicio de ingeniería con límites claros.

Debe tener:

- un task contract;
- un working set del repositorio;
- un workspace editable;
- un perfil de permisos de tool;
- una estrategia de test;
- un registro de state;
- un handoff artifact;
- una puerta de revisión.

Por ejemplo, un PR review agent puede ser responsable solo de los comentarios de revisión. Un migration agent puede ser responsable de una branch y una actualización de dependencia. Un security-fix agent puede ser responsable de un hallazgo validado y un patch. Estos límites importan porque, de lo contrario, los coding agents pueden convertirse en agentes amplios con acceso a shell y goals poco claros.

Trata al agent como un servicio con un contrato:

| Contract Field | Ejemplo |
| --- | --- |
| Input | issue, PR, failing test, migration request, security finding. |
| Allowed files | target package, test files, docs, config. |
| Disallowed files | secrets, generated assets, unrelated modules, deployment config. |
| Tools | read files, search, edit, test, typecheck, inspect CI. |
| Approval required | dependency install, lockfile change, broad refactor, deployment action. |
| Output | diff, test result, summary, risks, review notes. |
| Stop condition | tests pass, blocked reason, retry budget exhausted, human approval needed. |

Aquí es donde los coding agents se conectan con [Agents As Services](./agents-as-services).

## Workspace Isolation

El workspace es el límite del radio de impacto.

Usa un workspace aislado por cada task:

- branch;
- git worktree;
- contenedor;
- máquina virtual;
- cloud workspace;
- repositorio bifurcado;
- checkout desechable.

El agent no debe editar directamente en el working tree sucio de un desarrollador a menos que el usuario solicite explícitamente ese modo. Los agents en paralelo no deben compartir un workspace editable. Si dos agents necesitan modificar la misma área, coordina mediante branches, PRs o un paso de merge explícito.

Un buen aislamiento te da:

- revisión de diff sencilla;
- rollback;
- ejecuciones de test reproducibles;
- ejecución de comandos más segura;
- manejo de conflictos más simple;
- handoff limpio a humanos.

## Branch, Worktree, Session y Ciclo de Vida de CI

Un coding agent en producción debe hacer explícito su ciclo de vida. El registro de task, el state de la sesión, el workspace, la branch, el PR y la ejecución de CI son artifacts diferentes con distintos responsables.

| Stage | Artifact | Owner | Required Evidence |
| --- | --- | --- | --- |
| task intake | issue, prompt, failing test, security finding, o migration request | humano o scheduler | acceptance criteria, allowed scope, forbidden scope |
| session start | agent session record | agent runtime | model, tools, repo instructions, working set, permission profile |
| workspace allocation | branch, worktree, contenedor o cloud checkout | workspace manager | clean base ref, isolation ID, dependency cache policy |
| context gathering | archivos y comandos inspeccionados | agent | archivos leídos, símbolos buscados, supuestos, áreas omitidas |
| patching | diff en branch aislada | agent | archivos cambiados, justificación, archivos generados, cambios de dependencias |
| local verification | salida de test, build, typecheck, lint o screenshot | agent y test runner | comando, exit code, resumen relevante de fallos |
| PR handoff | draft PR, patch o review artifact | agent | resumen, verificación, riesgos, preguntas abiertas, nota de rollback |
| CI evaluation | ejecución de CI ligada a branch o PR | CI system | jobs, logs, fallos, artifacts, retry count |
| review decision | revisión humana, policy gate o merge del maintainer | maintainer | approvals, requested changes, merge o motivo de rechazo |
| cleanup | sesión archivada y workspace eliminado | workspace manager | branch state, eliminación de worktree, traces retenidos |

No colapses estos artifacts en una transcripción de chat. Un ingeniero posterior debe poder responder: ¿qué intentó el agent, dónde lo intentó, qué cambió, qué lo verificó y quién lo aceptó?

## Coding Agent Trace Contract

Mantén un trace compacto para cada coding task.

```ts
type CodingAgentRun = {
  runId: string;
  repo: string;
  baseRef: string;
  branch: string;
  workspaceId: string;
  task: {
    source: "issue" | "pr_review" | "failing_test" | "security_finding" | "user_request";
    acceptanceCriteria: string[];
    allowedPaths: string[];
    forbiddenPaths: string[];
  };
  session: {
    instructionsLoaded: string[];
    toolsAllowed: string[];
    approvalRequiredFor: string[];
  };
  activity: Array<{
    kind: "read" | "search" | "edit" | "command" | "test" | "ci" | "handoff";
    target: string;
    result: "success" | "failed" | "blocked" | "skipped";
  }>;
  verification: Array<{
    command: string;
    exitCode: number;
    summary: string;
  }>;
  finalStatus: "ready_for_review" | "needs_human" | "blocked" | "abandoned";
  risks: string[];
};
```

Este trace no es burocracia extra. Es el registro mínimo necesario para revisar un coding agent de la misma manera que un equipo revisa a cualquier otro contribuidor.

## Repository Context

Los coding agents fallan cuando ven muy poco código o demasiado código.

Usa un working set curado:

1. identifica los archivos principales;
2. busca símbolos, imports, referencias, tests y docs;
3. clasifica archivos secundarios;
4. carga archivos pequeños relevantes;
5. resume o extrae fragmentos de archivos grandes;
6. mantiene archivos no relacionados fuera del context.

El agent también debe cargar instrucciones del repositorio:

- estilo de codificación;
- reglas de arquitectura;
- comandos de test;
- package manager;
- reglas de branch y commit;
- restricciones de seguridad;
- reglas para archivos generados;
- expectativas de revisión.

Las instrucciones del repositorio deben ser durables. No dependas de que un humano repita la misma guía en cada task.

## Shell Command Discipline

El acceso a shell es poderoso y riesgoso.

Los comandos deben tratarse como tools:

- validar antes de ejecutar;
- capturar stdout, stderr, exit code y duración;
- registrar el directorio de trabajo;
- limitar el tamaño de la salida;
- redactar secretos;
- distinguir comandos de solo lectura de comandos que modifican;
- requerir aprobación para operaciones peligrosas;
- preferir scripts del proyecto sobre comandos ad hoc.

Una buena salida de comando es lo suficientemente estructurada para que el agent pueda actuar. Un test fallido debe convertirse en un diagnóstico: archivo, línea, nombre del test, valor esperado, valor real y módulo probablemente responsable.

Evita comandos que oculten demasiado:

- comandos de limpieza amplios;
- instalaciones globales;
- operaciones destructivas de git;
- scripts de shell con efectos secundarios poco claros;
- comandos que requieran entrada interactiva;
- comandos que modifiquen sistemas externos.

El agent debe explicar por qué ejecuta un comando cuando el comando tiene efectos secundarios.

## CI Feedback Loop

CI es uno de los mejores evaluators para coding agents.

Un coding agent debe tratar CI como un evaluator externo, no como una ocurrencia tardía. Debe reducir cada fallo a un comando local reproducible o a un bloqueo ambiental explícito antes de continuar.

Un loop útil es:

1. agent crea una branch o worktree;
2. agent realiza el cambio coherente más pequeño posible;
3. agent ejecuta checks locales rápidos;
4. agent abre o actualiza un draft PR;
5. CI ejecuta pruebas más amplias;
6. CI convierte los fallos en diagnósticos estructurados;
7. agent corrige los fallos específicos dentro de un retry budget;
8. agent se detiene cuando todo está en verde, bloqueado o se necesita aprobación.

No dejes que el agent persiga CI indefinidamente. Define:

- intentos máximos;
- runtime máximo;
- archivos permitidos;
- comandos de prueba permitidos;
- cuándo pedir ayuda a un humano;
- cuándo revertir su propio último cambio;
- cuándo marcar la task como bloqueada.

El feedback de CI debe mejorar el patch, no producir un loop interminable de ediciones especulativas.

El retry budget debe ser explícito:

```ts
interface CiFailure {
  file?: string;
  test?: string;
  message: string;
}

async function repairWithCi(task: CodingTask, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await applySmallPatch(task);
    const result = await runCiChecks(task.branch);

    if (result.status === 'green') {
      return { status: 'ready_for_review', attempts: attempt };
    }

    const failures: CiFailure[] = parseCiFailures(result.logs);
    if (failures.length === 0 || result.status === 'flaky') {
      return { status: 'needs_human', reason: 'unclear_ci_failure' };
    }

    task.feedback = failures.slice(0, 5);
  }

  return { status: 'blocked', reason: 'retry_budget_exhausted' };
}
```

El agent puede reparar, pero no para siempre.

## Background Agents

Los background coding agents son útiles cuando el trabajo es de larga duración o naturalmente asíncrono.

Úsalos para:

- actualizaciones de dependencias;
- migraciones de lint;
- clasificación de fallos de pruebas;
- refactors mecánicos;
- actualizaciones de documentación;
- correcciones de bugs de bajo riesgo con buenas pruebas.

Evita la autonomía en background para:

- cambios de producto ambiguos;
- cambios de arquitectura sin revisión;
- código sensible a seguridad sin hallazgo validado;
- despliegue a producción;
- cambios en secrets, credenciales o control de acceso.

Los background agents deben notificar a los humanos solo en estados significativos:

- necesita aclaración;
- necesita aprobación;
- CI falló más allá del retry budget;
- PR listo para revisión;
- bloqueado por falta de permisos;
- conflicto con la main branch.

El objetivo no es eliminar a los humanos. El objetivo es dejar de requerir que los humanos supervisen tiempos de espera.

## Resumable State

Los coding agents de larga duración necesitan un state durable fuera del context del model.

State artifacts útiles:

- goal de la task;
- criterios de aceptación;
- archivos inspeccionados;
- archivos cambiados;
- comandos ejecutados;
- resultados de pruebas;
- decisiones tomadas;
- riesgos conocidos;
- preguntas abiertas;
- conteo de reintentos;
- bloqueo actual.

Esto puede vivir en un registro de la task, descripción del PR, notas de la branch, archivo de state del agent, comentario en el issue o state de un durable workflow. Lo importante es que un humano o un agent posterior pueda reanudar sin reconstruir toda la conversación.

## PR Review Agents

El PR review es una de las mejores formas de producción para coding agents porque el límite es claro.

Un review agent puede:

- inspeccionar archivos cambiados;
- comparar contra reglas del repositorio;
- ejecutar checks específicos;
- identificar pruebas faltantes;
- señalar riesgos de seguridad;
- sugerir diffs más pequeños;
- escribir comentarios de revisión.

No debe hacer merge automáticamente de su propia aprobación. No debe bloquear por preferencias de estilo a menos que estén codificadas. Debe citar archivos, líneas, pruebas y evidencia.

Los buenos comentarios de revisión son específicos:

- qué está mal;
- por qué importa;
- dónde ocurre;
- cómo verificarlo;
- si es bloqueante o solo un consejo.

El review agent es un segundo par de ojos, no la autoridad final.

## Use When

- La task puede verificarse con pruebas, builds, type checks, capturas de pantalla o revisión.
- El cambio deseado puede describirse con criterios de aceptación concretos.
- El agent puede inspeccionar suficiente context del repositorio para seguir los patrones locales.
- Puedes aislar el trabajo y revisar el diff resultante.

## Avoid When

- El repositorio no tiene pruebas ni checks ejecutables y el cambio es de alto riesgo.
- La task es vaga, política o principalmente exploratoria de producto.
- El agent necesita credenciales de producción amplias.
- Múltiples agents editarían los mismos archivos sin coordinación.

## Evaluation Strategy

Evalúa coding agents a través de artifacts y trayectorias.

Verifica:

- corrección del diff;
- comportamiento de las pruebas;
- estado de build y typecheck;
- alcance de archivos cambiados;
- ajuste arquitectónico;
- cambios de dependencias;
- calidad del código generado;
- trayectoria de comandos;
- exposición de secrets;
- utilidad de la revisión;
- calidad del handoff.

Usa baselines:

- baseline sin agent para tareas simples;
- baseline de un solo agent antes de workflows multi-agent;
- resultados de revisión humana;
- tasa de éxito en CI;
- tasa de revert o corrección posterior.

Los evals de coding-agent deben incluir casos negativos:

- la task es demasiado vaga;
- faltan pruebas;
- el cambio solicitado toca archivos prohibidos;
- el fallo de CI es intermitente;
- la actualización de dependencias requiere aprobación;
- el hallazgo de seguridad no es reproducible;
- el código generado resolvería el síntoma pero violaría la arquitectura.

El comportamiento correcto a veces es detenerse y pedir una decisión humana.

## Operating Patterns

- Pide un plan antes de ediciones grandes.
- Haz que el agent cite los archivos y comandos que usó.
- Prefiere tasks pequeñas con criterios de finalización claros.
- Usa worktrees o branches para agents en paralelo.
- Requiere pruebas o type checks antes de hacer commit.
- Revisa el código generado como si fuera código humano.
- Mantén la guía durable del repo en un archivo de instrucciones del proyecto.
- Usa workspaces aislados para trabajo en paralelo o en background.
- Trata los comandos de shell como llamadas de tool auditables.
- Mantén retry budgets para loops de reparación impulsados por CI.
- Requiere artifacts de handoff explícitos para trabajo de larga duración.

## Failure Modes

- Código plausible que compila pero viola la arquitectura.
- Refactors amplios que mezclan cambios de comportamiento con formato.
- Pruebas actualizadas para coincidir con comportamiento roto.
- Cambios de dependencias ocultos.
- Comandos de shell que mutan el state local inesperadamente.
- Agents peleando por los mismos archivos.
- Fatiga de revisión cuando los diffs son demasiado grandes.
- Loops de CI que corrigen síntomas sin entender los fallos.
- Background agents que continúan después de que la definición de la task cambia.
- Context windows llenas de archivos no relacionados.
- Comentarios en PR que suenan plausibles pero no citan evidencia.
- Handoff humano que omite lo que se intentó y por qué falló.

## Production Checklist

- Branch o worktree por task.
- Archivos permitidos y prohibidos claros.
- Perfil de permisos de tool para operaciones de lectura, edición, shell, red, y git.
- Archivo de instrucciones del repositorio cargado por defecto.
- Context de archivos curado, no context de todo el repo.
- Checks locales rápidos antes de CI amplio.
- Diagnósticos de CI convertidos en feedback estructurado.
- Retry budget y reglas de detención.
- Draft PR o artifact de revisión para inspección humana.
- Redacción de secrets en prompts, salida de comandos, traces y resúmenes.
- Resumen de handoff con archivos cambiados, comandos, resultados, riesgos y preguntas abiertas.

## Design Rule

El coding agent nunca debe ser el único reviewer de su propio código. Puede proponer, editar, probar y explicar. Un check, reviewer o policy gate separado debe decidir si el cambio se integra.

## Related Chapters

- [Goals and State](../foundations/goals-and-state)
- [Context Budgets and Working Sets](../foundations/context-budgets-and-working-sets)
- [Tool Capability Design](../tools-skills-protocols/tool-capability-design)
- [Skills](../tools-skills-protocols/skills)
- [Agents As Services](./agents-as-services)
- [Choosing Multi-Agent Topology](../multi-agent-systems/choosing-multi-agent-topology)
- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Production Evaluation Feedback Loops](../production-runtime/production-evaluation-feedback-loops)
- [Observability and Evals](../production-runtime/observability-and-evals)
- [Architecture Decision Records for Agents](./architecture-decision-records)
