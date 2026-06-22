---
title: Pattern Composition Playbook
---

# Pattern Composition Playbook

Los patterns se vuelven útiles cuando se componen en un sistema que alguien puede operar. El objetivo no es usar la mayor cantidad posible de patterns. El objetivo es poner cada responsabilidad en el lugar correcto: el workflow controla el flujo, la policy controla los permisos, los tools controlan los efectos secundarios, retrieval controla la evidencia, el loop controla la incertidumbre acotada, los evals controlan la prueba y observability controla el aprendizaje a partir de fallas.

La forma más fácil de dañar un agentic system es componer patterns por intuición. Agregar memory porque el agent olvidó algo. Agregar un segundo agent porque el task parece grande. Agregar reflection porque la respuesta fue débil. Agregar tools porque el model necesita datos. Cada decisión puede sonar razonable, pero el resultado puede ser un sistema sin dueño, sin condición de parada, sin límite de evidencia y sin forma de replay de fallas.

La composición debe empezar por la propiedad.

![Pattern composition playbook](../public/diagrams/pattern-composition-playbook.svg)

## La Pregunta de Composición

Antes de agregar un pattern, pregunta qué problema le pertenece.

| Presión | Pattern a considerar | Qué debe controlar el límite |
| --- | --- | --- |
| El task tiene pasos conocidos. | Prompt chain o deterministic workflow. | Workflow code. |
| El siguiente paso depende de observaciones. | Agent loop. | Loop controller y stop rules. |
| La respuesta necesita evidencia. | RAG, semantic recall o knowledge-bound agent. | Retrieval y source policy. |
| El model debe invocar tools. | Tool use o MCP-first tool use. | Tool manifest, schema, permission y audit. |
| La acción es riesgosa. | Policy enforcement y human approval gate. | Runtime policy y durable workflow. |
| La calidad se puede juzgar mejor que lo generado. | Evaluator-optimizer o reflection. | Rubric, evidence checks y revision budget. |
| El trabajo necesita context o permisos separados. | Supervisor-worker o parallel agents. | Coordinator, worker contracts y merge policy. |
| La falla debe poder reproducirse. | Durable workflow, observability y eval feedback loop. | Runtime, trace store y eval suite. |

Si ningún pattern controla un problema concreto, no lo agregues.

Para ejemplos concretos de extremo a extremo, lee [Vertical Slice Examples](../hands-on-labs/vertical-slice-examples) después de este capítulo. Los slices muestran la misma regla de composición aplicada a workflows de soporte, código e investigación.

## Una Composición Predeterminada

Para muchos sistemas en producción, la composición predeterminada es:

1. enrutar la solicitud por tipo de task, riesgo y capability;
2. cargar el durable state, policy context e identidad del solicitante;
3. armar un pequeño conjunto de trabajo con evidencia aprobada;
4. ejecutar un agent loop acotado solo donde exista incertidumbre;
5. ejecutar tools mediante schemas tipados y verificaciones de permisos;
6. aplicar policy antes de efectos secundarios o escrituras en memory;
7. pausar para aprobación cuando el riesgo lo requiera;
8. evaluar trayectoria, evidencia, output y comportamiento de policy;
9. registrar traces, costos, decisiones, llamadas a tools y razones de parada;
10. convertir fallas de producción en regression evals.

Esa secuencia no es un framework. Es un mapa de responsabilidades. Un sistema simple puede omitir varios pasos. Un sistema de alto riesgo puede necesitar todos.

## Scorecard de Composición

Antes de aceptar una composición, califica cada pattern agregado según la responsabilidad que afirma controlar.

| Verificación | Condición para aprobar |
| --- | --- |
| Job | El pattern resuelve una presión de carga de trabajo nombrada, no solo un deseo vago de flexibilidad. |
| Owner | Un componente o equipo es dueño del comportamiento del pattern y de la respuesta ante fallas. |
| Boundary | El pattern tiene entradas, salidas, autoridad y no-responsabilidades claras. |
| Risk | Se nombran los nuevos modos de falla del pattern. |
| Control | Hay un límite, policy, gate o fallback controlado por software para cada riesgo mayor. |
| Eval | Al menos un eval bloqueante prueba que el límite funciona. |
| Trace | Un trace de producción puede mostrar la decisión y efecto del pattern. |
| Removal | El equipo sabe qué se rompería si se elimina el pattern. |

Si un pattern falla `job`, `owner` o `boundary`, elimínalo de la composición. Si falla `eval` o `trace`, no lo lleves a producción hasta que exista la prueba.

## Composición 1: Investigación de Reembolsos en Soporte

Usa esto cuando el agent investiga un reembolso pero no debe emitir dinero directamente.

| Responsabilidad | Pattern |
| --- | --- |
| Intake y enrutamiento | Routing y handoffs. |
| Evidencia | Semantic recall y typed business tools. |
| Investigación | Bounded agent loop. |
| Ejecución de tools | Tool use con read tools restringidos y write tools solo en borrador. |
| Seguridad | Policy enforcement antes de acciones de reembolso. |
| Control humano | Approval gate para reembolsos de alto valor o excepciones. |
| Calidad | Evaluator revisa evidencia, policy y recomendación. |
| Operaciones | Trace, replay y feedback de incident-to-eval. |

El límite importante es la autoridad financiera. El agent puede investigar, citar policy y redactar una solicitud de reembolso. No debe emitir el reembolso. La acción de reembolso pertenece a un workflow respaldado por policy, usualmente con aprobación.

```ts
async function handleRefundCase(input: RefundCase) {
  const route = routeSupportCase(input);
  const evidence = await collectRefundEvidence(input.orderId, route.region);

  const investigation = await refundAgent.investigate({
    caseId: input.caseId,
    evidenceRefs: evidence.refs,
    budget: { maxSteps: 6, maxToolCalls: 8, timeoutMs: 45000 }
  });

  const policy = enforcePolicy({
    actorRole: input.agentRole,
    capability: 'refund',
    riskLevel: investigation.riskLevel
  });

  if (policy.decision === 'require_approval') {
    return approvals.request({
      proposedAction: investigation.proposedRefund,
      evidenceRefs: investigation.evidenceRefs,
      policyRefs: investigation.policyRefs
    });
  }

  if (policy.decision !== 'allow') return policy;
  return refunds.draftRefundRequest(investigation);
}
```

Esto es agentic, pero solo en la investigación. El workflow controla enrutamiento, policy, aprobación y efectos secundarios.

## Composición 2: Asistente de Policy con Evidencia

Usa esto cuando el assistant responde a partir de policy aprobada, documentación o fuentes de compliance.

| Responsabilidad | Pattern |
| --- | --- |
| Elegibilidad de fuente | Policy enforcement y knowledge-bound agent. |
| Recuperación de evidencia | Semantic recall y RAG. |
| Control de context | Context budgets y working sets. |
| Forma de la respuesta | Structured output. |
| Preguntas no soportadas | Refusal o human escalation. |
| Calidad | Citation coverage y missing-evidence evals. |
| Operaciones | Monitoreo de frescura de fuentes y revisión de trace. |

El límite crítico es la evidencia. El assistant no debe responder porque el model "sabe" algo. Debe responder porque el sistema recuperó fuentes elegibles y la respuesta las cita.

```json
{
  "answer_status": "answered",
  "answer": "The request can be approved only if damage evidence is attached.",
  "citations": ["refund_policy.v3#damaged-items"],
  "evidence_refs": ["src_refund_policy_2026_04"],
  "missing_evidence": []
}
```

Cuando falta evidencia, la salida correcta no es una respuesta más débil. Es `missing_evidence`, `conflicting_evidence`, `refused` o `needs_human`.

## Composición 3: Investigación y Revisión Multi-Agent

Usa esto cuando un task se beneficia de flujos de trabajo separados y revisión independiente.

| Responsabilidad | Pattern |
| --- | --- |
| Decomposición | Supervisor-worker. |
| Aislamiento de workers | Scoped context y permisos de tools. |
| Trabajo en paralelo | Parallel agents cuando el trabajo es independiente. |
| Revisión | Evaluator-optimizer o reviewer worker dedicado. |
| Merge | Supervisor merge policy. |
| Responsabilidad final | Un solo owner final y razón de parada. |
| Operaciones | Traces por worker y replay de merge-decision. |

El límite crítico es la propiedad final. Varios agents pueden producir evidencia, borradores o críticas. Un componente debe controlar la síntesis final.

```ts
type ResearchAssignment = {
  workerRole: 'source_finder' | 'technical_reviewer' | 'risk_reviewer';
  objective: string;
  scopedContextRefs: string[];
  allowedTools: string[];
  expectedOutputSchema: string;
  acceptanceCriteria: string[];
};
```

Si cada worker ve el mismo context y tools, probablemente no tienes un multi-agent system útil. Solo tienes llamadas duplicadas al model.

## Qué No Componer

Algunas combinaciones son riesgosas a menos que exista un límite claro:

| Composición riesgosa | Por qué falla | Control |
| --- | --- | --- |
| Agent loop más tools amplios. | El loop puede amplificar una mala decisión de tool. | Tools limitados, policy, aprobación, reglas de detención. |
| RAG más escrituras en memory. | Los errores recuperados se vuelven hechos durables. | Revisión de escrituras en memory y metadatos de fuente. |
| Evaluator sin evidencia. | El evaluator califica confianza sin pruebas. | Verificación de citas y trayectoria. |
| Multi-agent más tool compartido. | Cada worker puede causar el mismo daño. | Alcances de tool por worker. |
| Aprobación humana más solicitud vaga. | Humanos aprueban sin saber la acción. | Solicitud de aprobación tipada y vinculación a acción exacta. |
| Policy solo en prompts. | El model puede ignorar o reinterpretar la policy. | Ejecución de enforcement en runtime antes de ejecutar. |

Componer no se trata de más partes. Se trata de mejores límites.

## Revisión de Diseño

Antes de aprobar un sistema compuesto, pregunta:

1. ¿Quién es dueño del goal?
2. ¿Quién es dueño del state?
3. ¿Quién es dueño de la evidencia?
4. ¿Quién es dueño de los permisos de tool?
5. ¿Quién es dueño de la policy?
6. ¿Quién es dueño de la aprobación?
7. ¿Quién es dueño de la evaluación?
8. ¿Quién es dueño de la respuesta o acción final?
9. ¿Quién es dueño del replay y rollback?
10. ¿Qué falla en producción se convierte en un nuevo eval?

Si la respuesta es "el prompt" para cualquier responsabilidad de alto riesgo, la arquitectura no está lista.

## Regla de Diseño

Compón patterns solo cuando cada pattern agregado tenga una función, un límite, un responsable y un eval que pueda fallar.

## Capítulos Relacionados

- [Architecture Before Autonomy](./architecture-before-autonomy)
- [From Patterns To Systems](./from-patterns-to-systems)
- [Pattern Evaluation Checklist](./pattern-evaluation-checklist)
- [Agents As Services](../systems-architecture/agents-as-services)
- [Tool Use](../foundations/tool-use)
- [Agent Loop](../foundations/agent-loop)
- [Policy Enforcement](../production-runtime/policy-enforcement)
- [Human Approval Gates](../tools-skills-protocols/human-approval-gates)
- [Production Evaluation Feedback Loops](../production-runtime/production-evaluation-feedback-loops)
- [Vertical Slice Examples](../hands-on-labs/vertical-slice-examples)
