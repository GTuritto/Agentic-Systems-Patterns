---
title: Memory-Augmented Agent
---

# Memory-Augmented Agent

La memory le da continuidad a un agent, pero también crea un límite de confianza durable.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/memory-augmented-agent-pattern)
> - [Download code bundle](/downloads/memory-augmented-agent.zip)

## Intención

Los memory-augmented agents almacenan y recuperan información a lo largo de turnos, sesiones, tasks o usuarios. La memory le da continuidad a un agent, pero también crea un límite de confianza durable. Una mala respuesta puede corregirse en el siguiente turno. Una mala memory puede seguir influyendo en ejecuciones futuras.

La forma útil de pensar en la memory es simple: la memory no es verdad. Es un registro con fuente, alcance, timestamp, nivel de confianza, clase de privacidad, regla de retención y ruta de corrección. El model puede proponer un memory write. El runtime decide si ese write está permitido, cómo se almacena, cuánto tiempo vive y cuándo puede ser recordado.

Usa este pattern para una memory policy durable. Para el state de una sola ejecución, usa [Working Memory](/memory-knowledge/working-memory). Para decidir si una memory entra en el prompt, usa [Context Engineering](/foundations/context-engineering) y [Context Budgets and Working Sets](/foundations/context-budgets-and-working-sets).

## Usa cuando

- El agent necesita continuidad más allá de una sola interacción.
- Los hechos almacenados pueden tener alcance, actualizarse, corregirse y eliminarse.
- Los resultados recuperados pueden citarse, inspeccionarse y excluirse cuando están obsoletos o no son seguros.
- El producto tiene una razón para recordar preferencias, state de tasks, decisiones, eventos o hechos proporcionados por el usuario.
- Puedes definir consentimiento, retención, privacidad y límites de tenant.

## Evita cuando

- El sistema almacenaría datos sensibles sin consentimiento o reglas de retención.
- Las memorias recuperadas no pueden distinguirse de las instrucciones actuales.
- El memory store se usa como un volcado sin curar de transcripciones.
- El agent trataría resúmenes antiguos como hechos autoritativos.
- No puedes explicar, editar o eliminar lo que el agent recuerda.

## Arquitectura

Usa este diagrama para leer Memory-Augmented Agent como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: la capa de memory o retrieval posee el conocimiento de larga duración, mientras que el agent posee el working state local de la task.

![Memory-augmented agent lifecycle](../public/diagrams/memory-augmented-lifecycle.svg)

Léelo como un ciclo de vida gobernado: recupera solo la memory con alcance, inyéctala como datos etiquetados y almacena solo la memory aprobada con reglas de retención y corrección.

## Forma del sistema

- **Límite del pattern:** el límite de memory posee el alcance de retrieval, write policy, schema de registro, retención, corrección, eliminación y auditoría.
- **Propietario del state:** el servicio de memory o el application store posee la memory durable; el agent solo posee lecturas y escrituras propuestas.
- **Rol del model:** el model puede resumir, clasificar y proponer actualizaciones de memory, pero no decide en silencio qué recordará el sistema.
- **Límite de policy:** los memory writes pasan por controles de consentimiento, fuente, privacidad, tenant, retención y seguridad antes de almacenarse.
- **Promesa operativa:** la memory mejora la continuidad sin convertirse en un cúmulo no revisado de afirmaciones durables.

## Protocolo central

1. Clasifica la necesidad de información: working state, evento episódico, hecho semántico, preferencia de usuario, fuente de policy o tool-result cache.
2. Recupera solo registros de memory con alcance para el actor, tenant, task, permisos y ventana de vigencia actuales.
3. Inyecta la memory como datos con etiquetas de fuente, timestamps, nivel de confianza y nivel de confianza.
4. Mantén la memory recuperada separada de las instrucciones del sistema y la policy.
5. Pide al model que proponga memory writes solo cuando la task produjo un hecho durable, preferencia, evento, corrección o decisión.
6. Ejecuta la memory write policy antes de almacenar.
7. Almacena la memory aprobada con procedencia, retención, clase de privacidad y ruta de eliminación.
8. Registra lecturas, escrituras, actualizaciones, rechazos y eliminaciones de memory en el trace.

## Notas de implementación

No almacenes por defecto el historial de chat sin procesar como memory. El historial de chat es evidencia. La memory es un registro operativo curado. La diferencia importa porque la memory se reutiliza en ejecuciones futuras.

### Tipos de memory

| Memory Type | Qué almacena | Riesgo típico |
| --- | --- | --- |
| Working memory | State actual de la task, preguntas abiertas, restricciones activas. | state obsoleto o inconsistente dentro de una ejecución. |
| Episodic memory | Eventos ocurridos, con tiempo y participantes. | retención excesiva, fuga de privacidad, atribución incorrecta. |
| Semantic memory | Hechos durables sobre un dominio, usuario, proyecto o sistema. | tratar afirmaciones no verificadas como verdad. |
| Preference memory | Elecciones y hábitos del usuario. | sobrepersonalización o almacenamiento de preferencias sensibles. |
| Policy memory | Reglas, fuentes y restricciones aprobadas. | policy obsoleta o ediciones no autorizadas. |
| Tool-result cache | Salidas previas de tools reutilizadas por velocidad o costo. | datos obsoletos y fuga entre tenants. |

### Contrato de escritura de memory

Un memory write debe ser una solicitud tipada. El registro debe indicar qué se almacena, por qué está permitido, de dónde proviene, a quién pertenece y cómo puede corregirse.

```ts
type MemoryKind =
  | "working_state"
  | "episodic_event"
  | "semantic_fact"
  | "user_preference"
  | "policy_reference"
  | "tool_result_cache";

type MemoryWriteRequest = {
  runId: string;
  actorId: string;
  tenantId: string;
  proposedBy: "model" | "workflow" | "user" | "operator";
  kind: MemoryKind;
  content: string;
  sourceRefs: string[];
  sourceTrust: "user_provided" | "tool_result" | "approved_source" | "untrusted_content";
  confidence: "low" | "medium" | "high";
  privacyClass: "public" | "internal" | "private" | "sensitive";
  retention: {
    expiresAt?: string;
    deleteOnRequest: boolean;
  };
  consent: {
    required: boolean;
    granted: boolean;
    consentRef?: string;
  };
  correctionPath: string;
};

type MemoryPolicyDecision =
  | { decision: "allow"; reason: string }
  | { decision: "deny"; reason: string }
  | { decision: "review"; reason: string; approverRole: string };

function decideMemoryWrite(request: MemoryWriteRequest): MemoryPolicyDecision {
  if (request.sourceTrust === "untrusted_content") {
    return { decision: "review", reason: "untrusted_source", approverRole: "memory_reviewer" };
  }

  if (request.privacyClass === "sensitive" && !request.consent.granted) {
    return { decision: "deny", reason: "missing_consent_for_sensitive_memory" };
  }

  if (request.kind === "policy_reference" && request.proposedBy === "model") {
    return { decision: "review", reason: "policy_memory_requires_review", approverRole: "policy_owner" };
  }

  return { decision: "allow", reason: "memory_policy_passed" };
}
```

### Registros de memory

El registro almacenado no debe ser solo texto.

```ts
type MemoryRecord = {
  memoryId: string;
  kind: MemoryKind;
  content: string;
  actorId: string;
  tenantId: string;
  sourceRefs: string[];
  sourceTrust: string;
  confidence: string;
  privacyClass: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  correctionPath: string;
  policyVersion: string;
};
```

Este schema es intencionalmente aburrido. Una memory aburrida es más fácil de inspeccionar, corregir, eliminar, evaluar y auditar.

### Reglas de recuperación

La recuperación de memory debe tener alcance antes de la clasificación por relevancia. Primero filtra por tenant, actor, permisos, tipo de memory, retención y vigencia. Luego clasifica por relevancia. Si el sistema clasifica primero y filtra después, la memory privada u obsoleta puede filtrarse al context.

La memory recuperada debe entrar al context con etiquetas como `source`, `created_at`, `confidence`, `privacy_class` y `trust_level`. No permitas que la memory recuperada sobrescriba instrucciones del sistema, tool policy, reglas de aprobación o controles de seguridad.

## Modos de falla

- Se almacenan transcripciones sin procesar como memory durable.
- El model escribe memory en silencio sin consentimiento, policy o trace.
- Páginas web, correos, tickets o documentos no confiables contaminan la memory futura.
- La memory obsoleta sobrescribe evidencia más reciente.
- Las preferencias de usuario se tratan como hechos.
- Hechos de un tenant, usuario o proyecto aparecen en otro context.
- Se almacenan datos sensibles sin reglas de retención, eliminación o corrección.
- Los resúmenes pierden la evidencia necesaria para verificar o reparar la memory.
- El sistema no tiene forma de mostrar a los usuarios lo que se recuerda.
- La memory crece hasta que la recuperación se vuelve ruidosa y costosa.

## Estrategia de evaluación

Los memory evals deben probar tanto la capacidad de recordar como la de restringir. Un sistema de memory que recuerda todo no es bueno. Es riesgoso.

- Prueba escrituras de memory permitidas por preferencias explícitas del usuario.
- Prueba escrituras denegadas para datos sensibles sin consentimiento.
- Prueba escrituras que requieren revisión provenientes de contenido no confiable.
- Prueba la corrección de un registro de memory existente.
- Prueba la eliminación y verifica que el registro no pueda recuperarse después.
- Prueba memory obsoleta contra evidencia más reciente.
- Prueba el aislamiento de tenant y actor.
- Prueba la recuperación de memory con registros conflictivos.
- Prueba si la memory recuperada se cita como memory y no se trata como instrucción.
- Prueba que las escrituras de memory aparezcan en traces junto con decisiones de policy.

Mide precisión de escritura, recall de escritura, tasa de escrituras inseguras, tasa de recall obsoleto, éxito de corrección, éxito de eliminación, filtración entre tenants, relevancia de recuperación, cobertura de citación y precisión en decisiones de policy.

## Lista de verificación para producción

- Define los tipos de memory que el sistema puede almacenar.
- Mantén los registros de memory tipados, con alcance, respaldados por fuente y con marca de tiempo.
- Requiere consentimiento para memory sensible o personal.
- Filtra por tenant, actor, permiso, frescura y retención antes de clasificar por relevancia.
- Separa la memory recuperada de instrucciones y policy.
- Agrega policy de escritura para fuentes no confiables, datos sensibles, memory de policy y resúmenes de resultados de tool.
- Proporciona rutas para corrección y eliminación.
- Traza lecturas, escrituras, actualizaciones, denegaciones, aprobaciones y eliminaciones de memory.
- Convierte escrituras inseguras de memory y recalls obsoletos en regression evals.
- Da a los operadores una forma de deshabilitar escrituras de memory sin deshabilitar la recuperación.

## Ejecuta el ejemplo

```sh
npm run memory-augmented-agent
```

## Recorrido del código

Lee el fragmento como la expresión ejecutable más pequeña del pattern. El capítulo alrededor explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o flujo de control.

## Código fuente

Estos fragmentos muestran la forma de la implementación. El código completo está disponible en el paquete de descarga y en el repositorio fuente.

### `memory-augmented-agent-pattern/autogen_typescript_example/memory_agent.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/memory-augmented-agent-pattern/autogen_typescript_example/memory_agent.ts)

```ts
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import readline from 'readline';
import fs from 'fs';

type MemoryMessage = { role: string; content: string };

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MEMORY_FILE = './memory-augmented-agent-pattern/autogen_typescript_example/memory.json';

if (!MISTRAL_API_KEY) {
  console.error('Please set MISTRAL_API_KEY in your .env file');
  process.exit(1);
}

function loadMemory(): MemoryMessage[] {
  if (fs.existsSync(MEMORY_FILE)) {
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8')) as MemoryMessage[];
  }
  return [];
}

function saveMemory(memory: MemoryMessage[]) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

async function askMistral(messages: any[]) {
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-tiny',
      messages,
    },
    {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let memory: MemoryMessage[] = loadMemory();

  rl.question('Ask the agent a question: ', async (userInput) => {
    // Retrieve relevant memory (for demo, just concatenate all previous user/assistant messages)
  let context = memory.map((m: MemoryMessage) => `${m.role}: ${m.content}`).join('\n');
    let messages = [
      { role: 'system', content: 'You are a helpful assistant with memory. Use the following context from previous interactions if relevant:\n' + context },
      { role: 'user', content: userInput },
    ];

    let answer = await askMistral(messages);
    console.log('\nAgent Answer (with memory):\n', answer);

    // Update memory
  memory.push({ role: 'user', content: userInput });
  memory.push({ role: 'assistant', content: answer });
    saveMemory(memory);

    rl.close();
  });
}

main();
```

### `memory-augmented-agent-pattern/langgraph_python_example/memory_agent.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/memory-augmented-agent-pattern/langgraph_python_example/memory_agent.py)

```py
import os
import json
import requests

MEMORY_FILE = os.path.join(os.path.dirname(__file__), 'memory.json')

def load_memory():
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_memory(memory):
    with open(MEMORY_FILE, 'w') as f:
        json.dump(memory, f, indent=2)

def ask_mistral(messages):
    api_key = os.getenv('MISTRAL_API_KEY')
    if not api_key:
        raise ValueError('Please set MISTRAL_API_KEY in your .env file')
    url = 'https://api.mistral.ai/v1/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    data = {
        'model': 'mistral-tiny',
        'messages': messages,
    }
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()['choices'][0]['message']['content'].strip()

def main():
    memory = load_memory()
    user_input = input('Ask the agent a question: ')
    # Retrieve relevant memory (for demo, just concatenate all previous user/assistant messages)
    context = '\n'.join([f"{m['role']}: {m['content']}" for m in memory])
    messages = [
        {'role': 'system', 'content': 'You are a helpful assistant with memory. Use the following context from previous interactions if relevant:\n' + context},
        {'role': 'user', 'content': user_input},
    ]
    answer = ask_mistral(messages)
    print('\nAgent Answer (with memory):\n', answer)
    # Update memory
    memory.append({'role': 'user', 'content': user_input})
    memory.append({'role': 'assistant', 'content': answer})
    save_memory(memory)

if __name__ == '__main__':
    main()
```

## Descarga

- [Download source bundle](/downloads/memory-augmented-agent.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/memory-augmented-agent-pattern)

El paquete de descarga contiene la carpeta actual `memory-augmented-agent-pattern/` de este repositorio.

## Patrones relacionados

- [Long-Term Episodic Memory](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/long-term-episodic-memory-agent-pattern/README.md)
- [Goals and State](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/goals-and-state-pattern/README.md)
- [Context Engineering](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/context-engineering-pattern/README.md)
- [Policy Enforcement](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/compliance-policy-enforcer-agent/README.md)
- [Human Approval Gates](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/human-in-the-loop-approval-agent/README.md)
- [Pattern Evaluation Checklist](/pattern-selection/pattern-evaluation-checklist)
- [Evaluation-Driven Agent Development](/agent-engineering-practice/evaluation-driven-agent-development)
