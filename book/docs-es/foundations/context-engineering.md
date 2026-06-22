---
title: Context Engineering
---

# Context Engineering

Context engineering controla lo que el model ve: instrucciones, state, resultados de retrieval, documentación de tool, memory, ejemplos y mensajes previos.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/context-engineering-pattern)
> - [Download code bundle](/downloads/context-engineering.zip)

## Intención

Context engineering decide lo que el model ve antes de responder o actuar. Ensambla instrucciones, entrada del usuario, working memory, evidencia recuperada, resultados de tool, policies, ejemplos, presupuestos y exclusiones en un conjunto de trabajo controlado.

RAG no es “poner resultados de búsqueda en el prompt”. Es un pipeline de evidencia. Context engineering es la disciplina más amplia alrededor de ese pipeline. El sistema debe decidir qué fuentes son elegibles, qué cuenta como suficientemente fresco, qué puede ver el caller, cómo se cita el contenido recuperado, qué se omite, qué se fija y qué debe hacer el agent cuando falta o hay conflicto en la evidencia.

La regla es simple: el context se ensambla, no se vuelca. El model debe ver un paquete deliberado, no un montón de historial de chat, texto recuperado, salida de tool y fragmentos de memory.

Este pattern es dueño del límite de ensamblaje, no de cada sistema fuente dentro de él. Working memory es dueño del run state. Durable memory es dueño de lo que sobrevive entre runs. Retrieval es dueño del descubrimiento de evidencia. Context engineering decide cuáles de esos registros entran en la siguiente llamada al model.

## Usar cuando

- La respuesta depende de una base de conocimiento grande, cambiante o privada.
- Las fuentes relevantes pueden dividirse en chunks, embeberse, filtrarse, citarse e inspeccionarse.
- La capa de retrieval puede aplicar restricciones de tenant, rol, fuente y frescura.
- El agent puede rechazar o escalar cuando falta evidencia.
- El sistema puede evaluar la calidad de retrieval por separado de la calidad de la respuesta final.
- El agent necesita working memory, resultados de tool, policy y evidencia recuperada en un solo paquete coherente.

## Evitar cuando

- El conocimiento requerido ya está en la entrada del task o en el deterministic system state.
- El corpus es demasiado ruidoso, obsoleto o no confiable para recuperarse de forma segura.
- El sistema no puede distinguir metadata confiable de contenido de documento no confiable.
- La respuesta necesita el exact database state que debe venir de un typed tool, no de una búsqueda semántica.
- Las citas, IDs de fuente o traces de retrieval no pueden almacenarse para revisión.
- El sistema dependería de volcar transcripciones crudas en vez de un context builder controlado.

## Arquitectura

Usa este diagrama para leer Context Engineering como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el caller o un pequeño servicio de aplicación es dueño del task state hasta que se introduce un runtime pattern.

![Context assembly pipeline](../public/diagrams/context-assembly-pipeline.svg)

## Forma del sistema

- **Límite del pattern:** el context builder decide qué puede entrar al model working set y cómo se etiqueta cada parte.
- **Dueño del state:** el runtime es dueño del working state, policies, budgets, retrieval traces, resultados de tool, registros de memory y registros de ensamblaje de context.
- **Rol del model:** el model usa el paquete ensamblado para responder, actuar, pedir evidencia faltante o explicar por qué no puede continuar.
- **Límite de policy:** elegibilidad de fuentes, acceso de tenant, redacción, frescura, manejo de resultados de tool, escrituras de memory y jerarquía de instrucciones se ejecutan antes de la generación.
- **Promesa operativa:** el model trabaja a partir de un paquete pequeño, etiquetado y verificado por policy en vez de memory vaga o context sin filtrar.

## Protocolo central

1. Clasifica la necesidad de context: policy, instrucciones del task, working state, resultado de tool, user memory, historial de eventos, registro privado, fuente pública o ejemplo.
2. Carga el goal actual, working memory, estado de presupuesto, estado de aprobación y condiciones de parada.
3. Aplica filtros de caller, tenant, rol, fuente, frescura y manejo de datos antes de recuperar o incluir.
4. Recupera candidate chunks con metadata, no solo texto.
5. Ordena y recorta candidatos por relevancia, frescura, diversidad, confianza y presupuesto de tokens.
6. Construye un set de evidencia con IDs de fuente, citas, confianza y brechas conocidas.
7. Ensambla el context con instrucciones, policy, state, evidencia, resultados de tool, memory, ejemplos y exclusiones separados.
8. Genera una respuesta, acción, rechazo o escalamiento usando solo el context elegible.
9. Registra la consulta, filtros, IDs de fuente, secciones del paquete, material omitido, citas y razón de parada.

## Notas de implementación

Trata el material recuperado como evidencia, no como autoridad. Una página web, correo, ticket, PDF o documento puede contener hechos útiles e instrucciones maliciosas al mismo tiempo.

### Context Packet

Un context packet es el runtime artifact que explica lo que el model pudo ver.

```ts
type ContextSectionKind =
  | "system_instruction"
  | "policy"
  | "user_request"
  | "working_memory"
  | "retrieved_evidence"
  | "tool_result"
  | "episodic_memory"
  | "semantic_memory"
  | "example"
  | "exclusion";

type ContextSection = {
  kind: ContextSectionKind;
  title: string;
  content: string;
  sourceRefs: string[];
  trustLevel: "trusted" | "internal" | "user_supplied" | "public" | "untrusted";
  freshness?: {
    observedAt?: string;
    expiresAt?: string;
  };
  tokenEstimate: number;
};

type ContextPacket = {
  packetId: string;
  runId: string;
  goalId?: string;
  actorId: string;
  tenantId: string;
  task: string;
  sections: ContextSection[];
  budget: {
    maxTokens: number;
    usedTokens: number;
    reservedOutputTokens: number;
  };
  omittedRefs: Array<{
    ref: string;
    reason: "not_relevant" | "stale" | "not_allowed" | "duplicate" | "over_budget";
  }>;
  policyVersion: string;
};
```

Este paquete debe ser trazable. Si una ejecución falla, deberías poder inspeccionar qué se incluyó, qué se omitió y por qué.

### Reglas de orden y confianza

El orden es parte del control plane. Un orden práctico es:

1. instrucciones del sistema;
2. restricciones de policy y seguridad;
3. solicitud actual del usuario o workflow;
4. goal y working memory;
5. resultados de tool aprobados;
6. evidencia recuperada;
7. memories recuperadas;
8. ejemplos;
9. exclusiones explícitas y brechas conocidas.

El punto no es solo el orden de los tokens. El punto es la separación. El texto recuperado, salida de tool, memory y documentos del usuario nunca deben poder reescribir las instrucciones del sistema, policy, permisos de tool, reglas de aprobación o reglas de escritura de memory.

### Evidence Contract

```ts
type EvidenceChunk = {
  sourceId: string;
  sourceType: 'policy' | 'docs' | 'ticket' | 'email' | 'memory' | 'web';
  tenantId?: string;
  trustLevel: 'trusted' | 'internal' | 'user_supplied' | 'public' | 'unknown';
  freshness: {
    retrievedAt: string;
    sourceUpdatedAt?: string;
    maxAgeDays?: number;
  };
  permissions: {
    allowedRoles: string[];
    redaction: 'none' | 'pii' | 'secret' | 'tenant_scoped';
  };
  score: number;
  excerpt: string;
  citation: string;
};
```

### Answer Contract

El evidence contract debe viajar con la respuesta:

```ts
type RagAnswer = {
  status: 'answered' | 'missing_evidence' | 'conflicting_evidence' | 'refused';
  answer?: string;
  citations: string[];
  evidenceRefs: string[];
  missingEvidence?: string[];
};
```

### Eligibility Check

Un pequeño eligibility check previene muchas fallas en producción:

```ts
function isEligibleEvidence(chunk: EvidenceChunk, callerRole: string, now: Date) {
  if (!chunk.permissions.allowedRoles.includes(callerRole)) return false;
  if (chunk.permissions.redaction === 'secret') return false;

  if (chunk.freshness.sourceUpdatedAt && chunk.freshness.maxAgeDays) {
    const updatedAt = new Date(chunk.freshness.sourceUpdatedAt).getTime();
    const ageDays = (now.getTime() - updatedAt) / 86_400_000;
    if (ageDays > chunk.freshness.maxAgeDays) return false;
  }

  return chunk.trustLevel !== 'unknown';
}
```

No dejes que el model decida si una fuente está permitida. El model puede resumir la calidad de la evidencia. El software debe hacer cumplir la elegibilidad.

### Context Budgeting

Context budgeting no es solo truncar. Es decidir qué debe ver el model, qué se puede resumir, qué se puede recuperar de nuevo, qué se puede omitir y qué debe fijarse.

Fija elementos pequeños y de alta autoridad: instrucciones del sistema, restricciones de policy, goal activo, condición de parada, estado de aprobación y la solicitud del usuario. Resume historial voluminoso pero de bajo riesgo. Recupera evidencia de fuente en vez de cargar extractos viejos copiados. Elimina chunks duplicados. Omite material obsoleto, no autorizado o de baja confianza. Reserva tokens de salida antes de llenar el input context.

Cuando el presupuesto es limitado, el runtime debe degradar explícitamente:

- responder con menos fuentes citadas;
- hacer una pregunta aclaratoria;
- recuperar de nuevo con filtros más estrechos;
- resumir el state intermedio;
- rechazar cuando la evidencia requerida no cabe de forma segura;
- escalar cuando la policy requiere evidencia completa.

## Modos de falla

- Se recupera evidencia obsoleta pero plausible y se trata como actual.
- El texto recuperado contiene instrucciones que anulan el goal del sistema.
- La salida de tool se trata como una nueva instrucción en lugar de como datos.
- Memory anula la solicitud actual del usuario.
- El working state está obsoleto pero aún se incluye como actual.
- Chunks del tenant, rol o cliente equivocado entran al context.
- El retriever devuelve fuentes semánticamente similares pero operativamente incorrectas.
- Las citas apuntan a documentos amplios en lugar del chunk exacto de soporte.
- El agent responde cuando falta evidencia o hay conflicto.
- Memory escribe un resumen no verificado como si fuera un hecho durable.
- Se registran los puntajes de retrieval, pero no los filtros, IDs de fuente ni frescura.
- Se evalúa la respuesta final, pero no la calidad de retrieval.
- El context packet no puede reconstruirse después de un incidente.
- El policy o approval state importante se omite bajo presión de tokens.

## Estrategia de evaluación

Los context evals deben probar retrieval, ensamblaje y comportamiento de respuesta por separado.

- Prueba preguntas de respuesta conocida donde la fuente correcta está presente.
- Prueba casos de falta de evidencia donde el agent debe rechazar o pedir ayuda.
- Prueba casos de fuente obsoleta donde una fuente antigua entra en conflicto con una nueva.
- Prueba casos de fuentes en conflicto donde la respuesta debe explicar la incertidumbre.
- Prueba prompt injection dentro de documentos recuperados.
- Prueba prompt injection dentro de resultados de tools y registros de memory.
- Prueba límites de tenant y permisos.
- Prueba presión de presupuesto de context y verifica que policy, goal y citas no se omitan.
- Prueba comportamiento de fuentes omitidas y verifica que el trace explique por qué se excluyó material.
- Prueba cobertura de citas: cada afirmación factual debe mapearse a evidencia de fuente.
- Prueba precisión y recall de retrieval antes de probar la calidad final del texto.

Un eval fixture compacto puede hacer explícito el requerimiento de evidencia:

```json
{
  "case_id": "stale_refund_policy",
  "question": "Can a damaged item be refunded after 45 days?",
  "retrieved_sources": [
    { "source_id": "refund_policy_2024", "freshness": "stale" },
    { "source_id": "refund_policy_2026", "freshness": "current" }
  ],
  "expected": {
    "must_cite": ["refund_policy_2026"],
    "must_not_cite": ["refund_policy_2024"],
    "status": "answered",
    "checks": ["freshness", "citation_coverage", "no_untrusted_instructions"]
  }
}
```

Mide recall de retrieval, precisión de retrieval, frescura de fuente, completitud del packet, eficiencia de tokens de context, fidelidad de citas, tasa de rechazo por falta de evidencia, resistencia a prompt-injection, violaciones de límites de tenant y calidad de respuesta basada en la evidencia citada.

## Lista de verificación para producción

- Define fuentes elegibles por tenant, rol, tipo de fuente, frescura y clase de datos.
- Mantén metadatos de fuente con cada chunk recuperado.
- Construye un context packet trazable para cada ejecución.
- Separa instrucciones de hechos recuperados en el context ensamblado.
- Mantén resultados de tools, memory, evidencia recuperada, ejemplos y contenido de usuario etiquetados por separado.
- Redacta o excluye fuentes antes de la generación, no después.
- Fija policy, goal activo, condición de parada y approval state antes de llenar context opcional.
- Requiere citas para afirmaciones factuales.
- Rechaza o escala cuando la evidencia falta, está obsoleta o en conflicto.
- Traza consulta, filtros, IDs de fuente, puntajes, secciones del packet, referencias omitidas y citas finales.
- Evalúa la calidad de retrieval por separado de la calidad de respuesta.
- Revisa memory writes antes de almacenar resúmenes recuperados como hechos durables.
- Versiona chunking, embedding model, filtros de retrieval, rerankers, prompts y reglas de citas.
- Agrega regression evals para context poisoning, context obsoleto, policy omitido y presión de tokens.

La regla arquitectónica es simple: cada elemento en el context necesita una razón, una fuente, un nivel de confianza y un presupuesto. Continúa con [Context Budgets and Working Sets](/foundations/context-budgets-and-working-sets) para límites de packet y [Agentic RAG Systems](/systems-architecture/agentic-rag-systems) para composición a nivel de sistema.

## Recorrido de código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo circundante explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o flujo de control.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y en el repositorio fuente.

### `context-engineering-pattern/langgraph_python_example/rag_example.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/context-engineering-pattern/langgraph_python_example/rag_example.py)

```py
"""
Context Engineering Example: Retrieval-Augmented Generation (RAG) with Mistral
Requirements: pip install langchain-community sentence-transformers faiss-cpu requests
Note: This is a minimal example using HuggingFace embeddings by default.
"""
import os
import requests
from typing import List

# Optionally load environment variables from a local .env if present
try:
    from dotenv import load_dotenv, find_dotenv  # type: ignore
    load_dotenv(find_dotenv(usecwd=True), override=True)
except Exception:
    pass

# Dummy documents
docs = [
    {"content": "Agentic systems are autonomous AI systems."},
    {"content": "Prompt engineering improves LLM outputs."}
]

# Build vector store (in-memory for demo)
texts = [d["content"] for d in docs]
try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import FAISS

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.from_texts(texts, embeddings)
    retriever = vectorstore.as_retriever()

    def retrieve(query: str, k: int = 3):
        return retriever.get_relevant_documents(query)
except Exception:
    class _MiniDoc:
        def __init__(self, text: str):
            self.page_content = text

    def retrieve(query: str, k: int = 3):
        query_terms = {term.strip(".,?!").lower() for term in query.split()}

        def score(text: str) -> int:
            text_terms = {term.strip(".,?!").lower() for term in text.split()}
            return len(query_terms & text_terms)

        ranked = sorted(texts, key=score, reverse=True)
        return [_MiniDoc(text) for text in ranked[:k]]
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

def chat_mistral(messages):
    if not MISTRAL_API_KEY:
        user_message = messages[-1]["content"]
        context = user_message.split("Context:\n", 1)[-1].split("\n\nQuestion:", 1)[0]
        return f"Local fallback answer from retrieved context: {context}"

    resp = requests.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "mistral-large-latest",
            "messages": messages,
            "temperature": 0.2,
        },
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return (data.get("choices") or [{}])[0].get("message", {}).get("content", "")

if __name__ == "__main__":
    query = "What are agentic systems?"
    retrieved = retrieve(query)
    context = "\n\n".join(d.page_content for d in retrieved)
    answer = chat_mistral([
        {"role": "system", "content": "Use the provided context to answer the question succinctly."},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
    ])
    print("Answer:", answer)
```

## Descarga

- [Download source bundle](/downloads/context-engineering.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/context-engineering-pattern)

El bundle de descarga contiene la carpeta `context-engineering-pattern/` actual de este repositorio.

## Patrones relacionados

- [Context Budgets and Working Sets](/foundations/context-budgets-and-working-sets)
- [Working Memory](/memory-knowledge/working-memory)
- [Memory-Augmented Agent](/memory-knowledge/memory-augmented-agent)
- [Knowledge-Bound Agents](/memory-knowledge/knowledge-bound-agents)
- [Agentic RAG Systems](/systems-architecture/agentic-rag-systems)
- [Pattern Evaluation Checklist](/pattern-selection/pattern-evaluation-checklist)
