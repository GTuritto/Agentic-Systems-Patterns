---
title: Structured Output
---

# Structured Output

Structured output restringe las respuestas del model a datos tipados que el software puede validar y consumir.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/structured-output-pattern)
> - [Download code bundle](/downloads/structured-output.zip)

## Propósito

El Structured Output Pattern restringe las respuestas del model a datos tipados que el software puede validar, enrutar, almacenar y probar. Es el límite entre el razonamiento en lenguaje natural y la lógica determinista de la aplicación.

## Cuándo usar

- El output del model controla una llamada a tool, una rama de workflow, una decisión de policy o una escritura en base de datos.
- El código posterior necesita campos estables en lugar de prosa.
- Necesitas pruebas de regresión para el comportamiento asistido por model.

## Evita cuando

- El output es prosa creativa solo para lectura humana.
- Un parser determinista ya maneja la entrada de forma segura.
- El schema es tan amplio que ya no restringe el comportamiento.

## Arquitectura

Usa este diagrama para leer Structured Output como un límite de sistema, no solo como una forma de código. La pregunta clave de propiedad es: el caller o un pequeño servicio de aplicación posee el task state hasta que se introduce un runtime pattern.

![Structured output validation architecture](../public/diagrams/structured-output-validation.svg)

## Forma del sistema

- **Límite del pattern:** una función de agent, clase o límite de servicio acepta input más context y devuelve una respuesta, acción o decisión tipada.
- **Propietario del state:** el caller o un pequeño servicio de aplicación posee el task state hasta que se introduce un runtime pattern.
- **Artifact principal:** `structured-output-pattern/` contiene la implementación de referencia ejecutable y ejemplos.
- **Promesa operativa:** Structured output restringe las respuestas del model a datos tipados que el software puede validar y consumir.

## Protocolo central

1. Acepta un input, goal o solicitud de task acotado.
2. Ensambla las instrucciones mínimas útiles, context, state y descripciones de tools.
3. Ejecuta el model o helper determinista detrás de un límite tipado.
4. Valida el resultado antes de devolverlo a usuarios, tools o durable state.
5. Registra suficiente evidencia para explicar el output después.

## Notas de implementación

- Define schemas cerca del código que los consume.
- Valida cada respuesta del model antes de usarla, incluso cuando el proveedor ofrece soporte de structured output.
- Prefiere enums para decisiones de enrutamiento y discriminated unions para outputs de múltiples acciones.
- Registra fallos de validación e intentos de reparación como datos de evaluación de primera clase.
- Mantén el output validado cerca de la siguiente acción de runtime. Un objeto válido aún debe pasar verificaciones de policy, aprobación y state antes de activar efectos secundarios.

## Modos de falla

- Schemas que reflejan prosa y ofrecen poca seguridad.
- Corrección silenciosa de campos faltantes o inválidos.
- Reglas de formato solo en el prompt sin validador.
- Schemas demasiado estrictos que causan fallos frágiles ante variaciones inofensivas.
- Un objeto válido contiene valores no soportados que violan reglas de dominio o policy.
- Bucles de reparación ocultan fallos repetidos del model y aumentan el costo sin condición de parada.

## Estrategia de evaluación

Evalúa sintaxis, semántica y seguridad posterior por separado. La validez del schema prueba que el output puede ser parseado. No prueba que los valores sean correctos o seguros para ejecutar.

- Prueba campos requeridos faltantes, campos extra, enums inválidos, tipos incorrectos y objetos anidados mal formados.
- Prueba valores que pasan la validación del schema pero violan restricciones de dominio, como un reembolso mayor al total del pedido.
- Prueba referencias de evidencia no soportadas y campos contradictorios.
- Prueba un intento de reparación, fallo repetido de reparación y la ruta final de rechazo o escalamiento.
- Prueba cambios de versión del schema contra fixtures almacenados y consumidores posteriores.
- Asegura que el output inválido nunca llegue a tools, decisiones de policy o durable state.

Usa validadores deterministas para estructura e invariantes de dominio. Usa revisión humana o de model solo para campos que requieren juicio.

```ts
type StructuredOutputEvalCase = {
  caseId: string;
  modelOutput: unknown;
  expected: {
    schemaValid: boolean;
    domainValid: boolean;
    actionAllowed: boolean;
    repairAttempts: number;
    finalStatus: "accepted" | "repaired" | "refused" | "needs_human";
  };
};
```

Mide la validez de schema en el primer intento, tasa de validez de dominio, tasa de éxito de reparación, intentos de reparación por output aceptado, tasa de aceptación insegura, tasa de rechazo falso y compatibilidad de versión de schema.

Para el contrato de caso de eval compartido y el método de release-gate, consulta [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development).

## Lista de producción

- Define el contrato de input, context, output y error.
- Mantén prompts, schemas y descripciones de tools versionados.
- Agrega pruebas deterministas para el comportamiento útil más pequeño.
- Registra decisiones del model sin filtrar secretos ni datos privados de usuarios.
- Define escalamiento humano para trabajo ambiguo, de alto riesgo o bloqueado por policy.
- Mantén el source bundle, capítulo generado, pruebas y artifact de despliegue en el mismo release.

## Recorrido de código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o flujo de control.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y el repository source.

### `structured-output-pattern/structured_decision.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/structured-output-pattern/structured_decision.ts)

```ts
export type RefundDecision =
  | {
      kind: "draft_refund";
      orderId: string;
      amountCents: number;
      policyVersion: string;
      evidenceRefs: string[];
    }
  | {
      kind: "deny_refund";
      orderId: string;
      reason: string;
      policyVersion: string;
      evidenceRefs: string[];
    }
  | {
      kind: "needs_human_review";
      orderId: string;
      reason: string;
      missingEvidence: string[];
    };

export type ValidationResult =
  | { ok: true; decision: RefundDecision }
  | { ok: false; reason: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

export function validateRefundDecision(value: unknown): ValidationResult {
  if (!value || typeof value !== "object") {
    return { ok: false, reason: "decision_not_object" };
  }

  const record = value as Record<string, unknown>;
  if (typeof record.orderId !== "string") {
    return { ok: false, reason: "missing_order_id" };
  }

  if (record.kind === "draft_refund") {
    if (typeof record.amountCents !== "number" || record.amountCents <= 0) {
      return { ok: false, reason: "invalid_refund_amount" };
    }

    if (typeof record.policyVersion !== "string" || !isStringArray(record.evidenceRefs)) {
      return { ok: false, reason: "missing_policy_evidence" };
    }

    return { ok: true, decision: record as RefundDecision };
  }

  if (record.kind === "deny_refund") {
    if (
      typeof record.reason !== "string" ||
      typeof record.policyVersion !== "string" ||
      !isStringArray(record.evidenceRefs)
    ) {
      return { ok: false, reason: "invalid_denial_evidence" };
    }

    return { ok: true, decision: record as RefundDecision };
  }

  if (record.kind === "needs_human_review") {
    if (typeof record.reason !== "string" || !isStringArray(record.missingEvidence)) {
      return { ok: false, reason: "invalid_review_request" };
    }

    return { ok: true, decision: record as RefundDecision };
  }

  return { ok: false, reason: "unknown_decision_kind" };
}

export function nextRuntimeAction(decision: RefundDecision): "draft" | "block" | "approval" {
  if (decision.kind === "draft_refund") return "approval";
  if (decision.kind === "deny_refund") return "block";
  return "draft";
}
```

## Descarga

- [Download source bundle](/downloads/structured-output.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/structured-output-pattern)

El bundle de descarga contiene la carpeta actual `structured-output-pattern/` de este repositorio.

## Patrones relacionados

- [Modern Tool Use](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/modern-tool-use-pattern/README.md)
- [LLM Router](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/llm-router-pattern/README.md)
- [Compliance/Policy Enforcer](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/compliance-policy-enforcer-agent/README.md)
- [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
