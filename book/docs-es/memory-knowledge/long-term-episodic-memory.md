---
title: Long-Term Episodic Memory
---

# Long-Term Episodic Memory

La long-term episodic memory almacena eventos: qué sucedió, cuándo, quién estuvo involucrado y por qué fue importante.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/long-term-episodic-memory-agent-pattern)
> - [Download code bundle](/downloads/long-term-episodic-memory.zip)

## Intención

La long-term episodic memory almacena eventos: qué sucedió, cuándo sucedió, quién o qué estuvo involucrado, qué evidencia lo respalda y por qué podría importar más adelante.

La episodic memory no es lo mismo que la semantic memory. La semantic memory almacena hechos o conocimientos. La episodic memory almacena eventos recordados. "El cliente prefiere email" es una preferencia o afirmación semántica. "El 2026-06-17 el cliente pidió recibir avisos de renovación por email" es un episodio. Mantener esa distinción clara facilita auditar, corregir, expirar y explicar la memory.

El objetivo no es recordar todo. El objetivo es preservar eventos útiles con suficiente procedencia para que futuras ejecuciones puedan razonar a partir de ellos sin tratar información antigua, parcial o privada como verdad universal.

## Usar cuando

- El asistente necesita continuidad entre sesiones.
- Eventos pasados afectan decisiones actuales, personalización, soporte, operaciones o historial de proyectos.
- Los eventos pueden recuperarse por relevancia, recencia, actor, tenant, proyecto y tipo de evento.
- El sistema puede hacer cumplir retención, privacidad, corrección, eliminación y aislamiento de tenant.
- Se necesita una línea de tiempo inspeccionable en vez de un perfil de usuario vago.

## Evitar cuando

- La task solo necesita hechos semánticos, no historial de eventos.
- El sistema no puede explicar o eliminar eventos recordados.
- La memory almacenaría eventos sensibles sin consentimiento o límites de retención.
- El agent convertiría cada interacción en un episodio durable.
- El producto no puede tolerar atribución incorrecta, recall obsoleto o filtraciones entre usuarios.

## Arquitectura

Usa este diagrama para leer Long-Term Episodic Memory como un límite de sistema, no solo como una forma de código. La pregunta clave de propiedad es: la memory o la capa de retrieval posee el conocimiento de larga duración, mientras que el agent posee el state de trabajo local de la task.

![Episodic memory event lifecycle](../public/diagrams/episodic-memory-event-lifecycle.svg)

Léelo como un ciclo de vida de eventos: almacena solo episodios aprobados por policy, recupéralos por alcance y frescura, y mantén visibles los caminos de corrección, eliminación, expiración y auditoría.

## Forma del sistema

- **Límite del pattern:** el límite de episodic memory posee la clasificación de eventos, policy de escritura, almacenamiento de la línea de tiempo, alcance de retrieval, retención, corrección, eliminación y auditoría.
- **Propietario del state:** el servicio de memory posee los registros de eventos durables; el agent solo posee escrituras de eventos propuestas y lecturas de eventos con alcance.
- **Rol del model:** el model puede resumir y clasificar eventos candidatos, pero el runtime decide si el evento vale la pena almacenarse.
- **Límite de policy:** las escrituras de eventos se revisan para consentimiento, clase de privacidad, confianza en la fuente, alcance de tenant, retención y requisitos de revisión.
- **Promesa operativa:** futuras ejecuciones pueden usar eventos pasados sin confundirlos con instrucciones actuales o hechos permanentes.

## Protocolo central

1. Observar una interacción, resultado de tool, transición de workflow, decisión humana, corrección o evento externo.
2. Decidir si el evento vale la pena recordarse.
3. Clasificar el tipo de evento, actor, tenant, proyecto, recursos, evidencia de origen, clase de privacidad, confianza y regla de retención.
4. Ejecutar la policy de escritura de episodic memory.
5. Almacenar eventos aprobados en una línea de tiempo y, cuando sea útil, en un índice para retrieval semántico.
6. Recuperar eventos solo después de filtrar por tenant, actor, permisos, tipo de evento, recencia y retención.
7. Inyectar eventos recuperados como evidencia con timestamps y referencias de origen.
8. Permitir corrección, eliminación, expiración y revisión de auditoría.

## Notas de implementación

La episodic memory debe tener forma de evento. Si el registro no incluye tiempo, actor, fuente y alcance, probablemente no es un episodio. Es una nota.

### Tipos de eventos

| Event Type | Ejemplo | Notas |
| --- | --- | --- |
| User preference stated | El usuario pidió reportes en PDF en vez de diapositivas. | Puede requerir consentimiento según la sensibilidad. |
| Correction received | El usuario corrigió un nombre de proyecto o rol de contacto. | Debe actualizar o reemplazar eventos anteriores. |
| Task milestone | El agent completó la revisión del plan de despliegue. | Útil para continuidad de proyectos. |
| Human approval | Finance aprobó la solicitud de reembolso `R-1024`. | Mantener ID de aprobación y versión de policy. |
| Tool-observed event | CRM devolvió que el estado de la cuenta cambió a activo. | Almacenar fuente y frescura. |
| Incident or failure | El agent falló porque un tool expiró. | Útil para confiabilidad y evals. |

### Registro de evento

Un registro episódico útil mantiene el contenido del evento separado de la evidencia y los metadatos de retrieval.

```ts
type EpisodicEventType =
  | "user_preference_stated"
  | "correction_received"
  | "task_milestone"
  | "human_approval"
  | "tool_observed_event"
  | "incident_or_failure";

type EpisodicMemoryEvent = {
  eventId: string;
  eventType: EpisodicEventType;
  occurredAt: string;
  recordedAt: string;
  actorId: string;
  tenantId: string;
  projectId?: string;
  resourceRefs: string[];
  summary: string;
  sourceRefs: string[];
  sourceTrust: "user_provided" | "tool_result" | "approved_source" | "operator_entered" | "untrusted_content";
  confidence: "low" | "medium" | "high";
  privacyClass: "public" | "internal" | "private" | "sensitive";
  retention: {
    expiresAt?: string;
    deleteOnRequest: boolean;
  };
  supersedesEventIds: string[];
  correctionPath: string;
  policyVersion: string;
};
```

### Policy de escritura

El model no debe escribir un evento en silencio solo porque parece útil. El runtime debe decidir.

```ts
type EpisodicWriteDecision =
  | { decision: "allow"; reason: string }
  | { decision: "deny"; reason: string }
  | { decision: "review"; reason: string; approverRole: string };

function decideEpisodicWrite(event: EpisodicMemoryEvent): EpisodicWriteDecision {
  if (event.sourceTrust === "untrusted_content") {
    return { decision: "review", reason: "untrusted_event_source", approverRole: "memory_reviewer" };
  }

  if (event.privacyClass === "sensitive" && !event.retention.expiresAt) {
    return { decision: "deny", reason: "sensitive_event_requires_expiry" };
  }

  if (event.eventType === "human_approval" && !event.resourceRefs.length) {
    return { decision: "deny", reason: "approval_event_missing_resource" };
  }

  return { decision: "allow", reason: "episodic_write_policy_passed" };
}
```

### Reglas de retrieval

El retrieval episódico debe comenzar por alcance, no por similitud. Filtra por tenant, actor, proyecto, permisos, tipo de evento, retención y recencia antes de hacer búsqueda por embedding o ranking. Luego clasifica los eventos por relevancia, recencia, confianza en la fuente y confianza.

Los eventos recuperados deben presentarse como eventos, no como hechos:

```text
Past event, not current instruction:
- occurred_at: 2026-06-17T09:20:00Z
- event_type: correction_received
- summary: User corrected the deployment target from staging to production.
- confidence: high
- source: support-ticket-1842
```

Ese encuadre importa. El evento puede explicar el context, pero no debe anular la intención actual del usuario, la policy vigente, datos frescos de tools o reglas de aprobación.

## Modos de falla

- El sistema almacena cada interacción como un evento y el retrieval se vuelve ruidoso.
- Un evento antiguo se trata como un hecho actual.
- Un evento de preferencia se convierte en un rasgo permanente del usuario.
- Se escribe un evento falso a partir de un resumen alucinado.
- Un evento se atribuye al usuario, tenant, proyecto o recurso equivocado.
- Eventos sensibles se retienen indefinidamente.
- Las correcciones crean nuevos eventos conflictivos en vez de reemplazar los anteriores.
- Eventos de documentos no confiables contaminan el comportamiento futuro.
- El orden de la línea de tiempo es incorrecto porque `recordedAt` se confunde con `occurredAt`.
- El sistema no puede mostrar, corregir, eliminar o expirar registros de eventos.

## Estrategia de evaluación

Las evals de episodic memory deben probar la calidad de escritura de eventos, calidad de retrieval y moderación.

- Prueba que los eventos significativos se almacenen con actor, tenant, tiempo, fuente, confianza y retención.
- Prueba que la charla rutinaria no se almacene.
- Prueba supresión de eventos obsoletos cuando existe evidencia más reciente.
- Prueba corrección y reemplazo de un evento anterior.
- Prueba eliminación y expiración.
- Prueba aislamiento entre tenants y usuarios.
- Prueba prevención de atribución incorrecta.
- Prueba retrieval por recencia, relevancia y tipo de evento.
- Prueba revisión de fuentes no confiables antes de almacenar.
- Prueba que los eventos recuperados no anulen instrucciones o policy actuales.

Mide precisión de escritura de eventos, recall de escritura de eventos, exactitud de atribución, recall de eventos obsoletos, éxito de corrección, éxito de eliminación, fallas de aislamiento de tenant, relevancia de retrieval y tasa de escritura insegura.

## Lista de verificación para producción

- Define qué tipos de eventos el sistema puede recordar.
- Almacena `occurredAt` y `recordedAt` por separado.
- Conserva los metadatos de actor, tenant, project, resource, source, confidence, privacy y retention en cada evento.
- Filtra por scope antes del ranking semántico.
- Trata los eventos recuperados como evidencia, no como instrucciones.
- Requiere revisión para eventos sensibles, no confiables o significativos para la policy.
- Soporta corrección, reemplazo, eliminación y expiración.
- Traza lecturas, escrituras, rechazos, revisiones, correcciones y eliminaciones de eventos.
- Convierte falsas memorias y recalls obsoletos en regression evals.
- Da a los usuarios u operadores una línea de tiempo inspeccionable cuando el producto requiere confianza.

## Recorrido por el código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo circundante explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código fuente

Este pattern actualmente no tiene un extracto de código dedicado. Usa los enlaces de fuente y descarga a continuación para acceder a la carpeta completa del pattern.

## Descarga

- [Descargar paquete fuente](/downloads/long-term-episodic-memory.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/long-term-episodic-memory-agent-pattern)

El paquete de descarga contiene la carpeta `long-term-episodic-memory-agent-pattern/` actual de este repositorio.

## Patterns relacionados

- [Memory-Augmented Agent](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/memory-augmented-agent-pattern/README.md)
- [Goals and State](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/goals-and-state-pattern/README.md)
- [Context Engineering](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/context-engineering-pattern/README.md)
- [Human Approval Gates](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/human-in-the-loop-approval-agent/README.md)
- [Policy Enforcement](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/compliance-policy-enforcer-agent/README.md)
