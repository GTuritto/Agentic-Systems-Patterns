---
title: Evaluator-Optimizer
---

# Evaluator-Optimizer

Evaluator-Optimizer empareja un generador con un evaluator. El generador propone; el evaluator califica; el optimizer revisa o detiene.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/evaluator-optimizer-pattern)
> - [Download code bundle](/downloads/evaluator-optimizer.zip)

## Propósito

Evaluator-Optimizer empareja un generador con un evaluator y un loop de revisión limitado. El generador propone una salida. El evaluator la verifica contra criterios explícitos. El optimizer la acepta, solicita una revisión específica, escala o se detiene cuando se agota el presupuesto.

El pattern es útil cuando la calidad puede juzgarse de manera más confiable de lo que puede producirse en una sola pasada. Es riesgoso cuando el evaluator es vago, se impresiona por prosa fluida o puede aprobar trabajo sin verificar evidencia.

Reflection y Evaluator-Optimizer están relacionados, pero no son idénticos. Reflection critica y mejora una salida. Evaluator-Optimizer agrega un límite de decisión: aprobar, revisar, rechazar, escalar o detener.

## Usar cuando

- El task tiene criterios explícitos, pruebas, policies, ejemplos o requisitos de evidencia.
- Una segunda pasada puede detectar fallas que el generador suele omitir.
- La iteración vale la pena por la latencia, costo y complejidad extra.
- El evaluator puede producir retroalimentación estructurada, no solo crítica en prosa.
- El controller puede imponer revisiones máximas, motivos de detención y reglas de escalamiento.

## Evitar cuando

- El evaluator es solo otro prompt de opinión vaga.
- El evaluator no puede inspeccionar la evidencia necesaria para juzgar la corrección.
- El task necesita baja latencia y una sola pasada es suficiente.
- El revision loop puede cambiar hechos, citas, decisiones de policy o resultados de tools sin validación.
- El equipo no puede definir cómo se vería una aprobación falsa.

## Arquitectura

Usa este diagrama para leer Evaluator-Optimizer como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el loop controller es dueño del progreso, presupuestos, condiciones de detención y state de recuperación.

![Evaluator-optimizer loop architecture](../public/diagrams/evaluator-optimizer-loop.svg)

## Forma del sistema

- **Límite del pattern:** el controller es dueño de los criterios, presupuesto de revisiones, selección de evaluator, decisiones de detención y escalamiento.
- **Rol del generator:** proponer una salida o plan candidato.
- **Rol del evaluator:** verificar el candidato contra criterios, evidencia, policy y estructura esperada.
- **Rol del optimizer:** convertir los hallazgos del evaluator en instrucciones de revisión específicas.
- **Promesa operativa:** mejorar la calidad sin permitir que un evaluator débil apruebe trabajo inseguro o sin respaldo.

## Protocolo central

1. Recibir el task, criterios, requisitos de evidencia y presupuesto de revisiones.
2. Generar el primer candidato.
3. Evaluar el candidato con una rúbrica, pruebas, verificaciones de policy y de evidencia.
4. Si el candidato pasa, devolverlo con la decisión del evaluator.
5. Si el candidato tiene fallas corregibles, producir instrucciones de revisión específicas.
6. Regenerar o modificar el candidato.
7. Repetir hasta aprobar, rechazar, escalar, agotar tiempo o alcanzar el máximo de revisiones.
8. Registrar cada candidato, decisión del evaluator, instrucción de revisión y motivo de detención.

## Notas de implementación

Haz explícito el contrato del evaluator.

```ts
type EvaluationDecision = {
  status: 'pass' | 'revise' | 'block' | 'escalate';
  score: number;
  criteria: Array<{
    name: string;
    passed: boolean;
    evidenceRefs: string[];
    reason: string;
  }>;
  blockingFailures: string[];
  revisionInstructions: string[];
  stopReason?: 'passed' | 'max_revisions' | 'policy_block' | 'missing_evidence';
};
```

El controller debe imponer el loop, no el evaluator prompt:

```ts
async function runEvaluatorOptimizer(task: Task, budget = { maxRevisions: 2 }) {
  let candidate = await generateCandidate(task);

  for (let revision = 0; revision <= budget.maxRevisions; revision += 1) {
    const decision = await evaluateCandidate(task, candidate);

    if (decision.status === 'pass') {
      return { status: 'succeeded', candidate, decision };
    }

    if (decision.status === 'block' || decision.status === 'escalate') {
      return { status: decision.status, candidate, decision };
    }

    if (revision === budget.maxRevisions) {
      return {
        status: 'failed',
        candidate,
        decision: { ...decision, stopReason: 'max_revisions' }
      };
    }

    candidate = await reviseCandidate(candidate, decision.revisionInstructions);
  }
}
```

El evaluator no debe recompensar mejor prosa si el candidato aún carece de evidencia. Debe nombrar el criterio fallido y la evidencia necesaria para aprobar.

## Modos de falla

- Evaluator que aprueba todo: aprueba salidas fluidas pero incorrectas.
- Rúbrica vaga: el evaluator no puede distinguir una falla real de una preferencia de estilo.
- Autoaprobación: el mismo model prompt genera y aprueba la respuesta sin verificaciones independientes.
- Optimización de tono: las revisiones hacen la respuesta más fluida pero no más correcta.
- Falta de verificación de evidencia: el evaluator califica confianza sin verificar citas o resultados de tools.
- Manipulación de recompensas: el generator aprende frases que satisfacen al evaluator sin cumplir el task.
- Loop de revisión infinito: cada pasada crea nuevos problemas porque las condiciones de detención son débiles.
- Desacuerdo oculto: las preocupaciones del evaluator no se muestran al caller o trace.
- Deriva de evaluación: un cambio en el prompt, model o rúbrica altera silenciosamente el comportamiento de aprobación/rechazo.

## Estrategia de evaluación

Evalúa al propio evaluator.

- Prueba aprobaciones falsas: respuestas pulidas pero incorrectas deben fallar.
- Prueba rechazos falsos: respuestas correctas pero incómodas deben aprobar o recibir revisión menor.
- Prueba falta de evidencia: afirmaciones sin respaldo deben bloquearse o escalarse.
- Prueba fallas de policy: contenido inseguro no debe revisarse para hacerlo aceptable.
- Prueba comportamiento de max-revision: el loop debe detenerse limpiamente.
- Prueba candidatos adversariales que adulan al evaluator o imitan el lenguaje de la rúbrica.
- Prueba desacuerdo entre verificaciones deterministas y juicio del evaluator basado en model.
- Prueba casos de regresión de fallas en producción.

Un evaluator eval compacto puede verse así:

```json
{
  "case_id": "polished_unsupported_refund_answer",
  "candidate": "Yes, the customer is clearly eligible for a full refund.",
  "available_evidence": ["order_status: delivered", "policy: refund requires damage evidence"],
  "expected_decision": {
    "status": "block",
    "blocking_failures": ["missing_damage_evidence"],
    "must_not_pass": true,
    "required_revision_instruction": "ask for or retrieve damage evidence"
  }
}
```

Usa una rúbrica de puntuación que separe corrección de presentación. Para una recomendación de reembolso, el evaluator debe calificar evidencia y policy antes del tono:

| Criterion | Pass Condition | Blocking Failure |
| --- | --- | --- |
| Evidence | Se hace referencia a orden, estado de entrega, reclamo del cliente y versión de policy. | La recomendación cita evidencia faltante o desactualizada. |
| Policy fit | La recomendación coincide con la policy de reembolso activa y el umbral. | El candidato otorga un reembolso que la policy niega o escala. |
| Authority | El candidato propone solo acciones permitidas para el estado de aprobación actual. | El candidato implica ejecución de pago sin aprobación. |
| Customer message | El borrador es preciso, específico y no promete de más. | El borrador promete movimiento de dinero antes de la aprobación. |
| Traceability | El candidato vincula cada afirmación a referencias de evidencia. | El revisor no puede reproducir por qué la recomendación fue aprobada. |

Una puntuación puede ayudar a clasificar, pero la decisión de liberación debe usar primero los bloqueadores. Un candidato con buen tono y evidencia de policy faltante debe fallar, no recibir un puntaje promedio alto.

Mide tasa de aprobaciones falsas, tasa de rechazos falsos, tasa de éxito de revisiones, tasa de max-revision, consistencia del evaluator, costo, latencia y recurrencia de fallas conocidas.

## Lista de verificación para producción

- Define criterios antes de iniciar la generación.
- Separa los prompts de generator y evaluator.
- Usa verificaciones deterministas cuando sea posible antes del juicio del model.
- Requiere referencias de evidencia para afirmaciones fácticas, de policy o dependientes de tools.
- Establece revisiones máximas, tiempo límite y reglas de escalamiento.
- Registra candidatos, puntajes, resultados de criterios, fallas bloqueadoras e instrucciones de revisión.
- Versiona prompts de evaluator, rúbricas, pruebas y rutas de model.
- Rastrea aprobaciones y rechazos falsos en revisión de producción.
- No permitas que la aprobación del evaluator omita policy de tools, puertas de aprobación o controles de seguridad.
- Convierte fallas graves del evaluator en regression evals.

## Recorrido de código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o flujo de control.

## Código fuente

Este pattern actualmente no tiene un extracto de código dedicado. Usa los enlaces de fuente y descarga abajo para la carpeta completa del pattern.

## Descarga

- [Descargar paquete fuente](/downloads/evaluator-optimizer.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/evaluator-optimizer-pattern)

El paquete de descarga contiene la carpeta `evaluator-optimizer-pattern/` actual de este repositorio.

## Patrones relacionados

- [Reflection](/control-loops/reflection)
- [Agent Loop](/foundations/agent-loop)
- [Structured Output](/foundations/structured-output)
- [Production Evaluation Feedback Loops](/production-runtime/production-evaluation-feedback-loops)
- [Observability and Evals](/production-runtime/observability-and-evals)
- [Pattern Evaluation Checklist](/pattern-selection/pattern-evaluation-checklist)
