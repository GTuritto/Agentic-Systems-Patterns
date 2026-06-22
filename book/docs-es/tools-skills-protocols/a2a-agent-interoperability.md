---
title: A2A Agent Interoperability
---

# A2A Agent Interoperability

A2A hace que los agents sean descubribles e invocables a través de límites de proceso, equipo, runtime y proveedor.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-to-agent-communication-pattern)
> - [Download code bundle](/downloads/a2a-agent-interoperability.zip)

## Propósito

A2A hace que los agents sean descubribles e invocables a través de límites de proceso, equipo, runtime y proveedor. Úsalo cuando un agent necesite invocar a otro agent como colaborador remoto mediante un contrato de protocolo explícito.

Esta es la versión agent de la comunicación entre servicios. El objetivo no es permitir que los agents conversen libremente. El objetivo es permitir que un agent acotado solicite trabajo a otro agent acotado con identidad, validación de schema, autorización, idempotencia, progreso, rechazo, cancelación, trazabilidad y versionado.

Los patrones de comunicación de microservicios siguen aplicando. REST, gRPC, MCP y A2A son diferentes formas de protocolo, pero las preocupaciones de ingeniería son familiares: contratos, identidad, autorización, reintentos, timeouts, idempotencia, observabilidad, propiedad y compatibilidad hacia atrás.

## Úsalo cuando

- Los agents son propiedad de diferentes servicios, equipos, runtimes o proveedores.
- Un llamador debe descubrir qué puede hacer un agent remoto antes de enviar trabajo.
- El state de la task debe sobrevivir progreso asíncrono, rechazo, error, timeout, reintento o cancelación.
- El llamador y el receptor necesitan un contrato compartido para propiedad, ciclo de vida de la task y forma del resultado.
- La comunicación entre agents requiere TLS, OAuth u OIDC scopes, trace IDs y registros de auditoría.

## Evítalo cuando

- Ambos agents son funciones simples dentro de un solo proceso.
- La interacción es solo una llamada local de tool con entrada y salida tipadas.
- No puedes autenticar llamadores, validar mensajes o trazar handoffs.
- El agent remoto no tiene un owner estable, contrato de capability o policy de versionado.
- Un workflow determinista sería más claro que agregar otro colaborador autónomo.

## Arquitectura

Usa este diagrama para leer A2A Agent Interoperability como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el límite de protocolo o capability posee schemas, permisos, registros de invocación y validación de respuestas.

![A2A agent interoperability architecture](../public/diagrams/a2a-agent-interoperability.svg)

## Forma del sistema

- **Límite de capability:** los llamadores descubren capabilities desde una agent card en vez de depender de suposiciones obsoletas.
- **Límite de mensaje:** cada solicitud de task tiene un schema, trace ID, message ID, idempotency key, source agent, target agent, tenant, audience, scopes y timeout.
- **Límite de identidad:** los llamadores se autentican mediante identidad de servicio y credenciales delegadas.
- **Límite de autorización:** scopes, tenant, audience, capability, policy y riesgo se verifican antes de que el agent remoto inicie el trabajo.
- **Límite de propiedad:** cada task tiene un owner actual, status, stop reason y ruta de cancelación.
- **Límite de observabilidad:** handoffs, reintentos, rechazos, timeouts, aprobaciones y resultados son eventos de trace, no mensajes de chat ocultos.

## Protocolo central

1. Obtener la agent card remota: capability, schema, versión, scopes, owner, timeout y estados de ciclo de vida.
2. Construir un sobre de solicitud de task desde el goal actual, state, tenant, trace ID, idempotency key y presupuesto de delegación permitido.
3. Validar el schema del mensaje antes del transporte.
4. Autenticar al llamador y verificar audience, scopes, tenant, capability y policy.
5. Entregar la solicitud al agent remoto solo después de que la autorización sea exitosa.
6. Emitir eventos de progreso, rechazo, error, timeout, cancelación o resultado con el mismo trace ID.
7. Validar el schema de respuesta y el state de propiedad antes de que el llamador consuma el resultado.
8. Registrar el handoff, decisión, latencia, costo, status, owner y stop reason.
9. Convertir fallas repetidas, delegación insegura o incompatibilidades de protocolo en casos de eval.

## Notas de implementación

- Los mensajes deben validarse contra schemas antes de la entrega.
- Los mensajes A2A deben llevar campos de correlación, no depender de logs para reconstruir un handoff después.
- Usa TLS para transporte remoto y mTLS donde la identidad de servicio sea importante.
- Usa OAuth u OIDC scopes para autoridad delegada.
- Trata rechazos, timeouts y cancelación como resultados normales del protocolo, no como excepciones.
- Incluye idempotency keys o task IDs para que los reintentos no dupliquen trabajo.
- Agrega autorización antes de cruzar un límite de confianza.
- Mantén versiones de agent card y versiones de schema de mensaje compatibles hacia atrás.
- Evita bucles de delegación rastreando owner, task padre, profundidad de delegación y stop reason.

### Sobre del mensaje

```ts
type AgentMessageEnvelope = {
  traceId: string;
  messageId: string;
  idempotencyKey: string;
  fromAgent: string;
  toAgent: string;
  tenantId: string;
  capability: string;
  auth: {
    audience: string;
    scopes: string[];
  };
  timeoutMs: number;
  payload: Record<string, unknown>;
};
```

### Verificación de autorización

```ts
function validateA2AEnvelope(input: {
  envelope: AgentMessageEnvelope;
  requiredAudience: string;
  requiredScope: string;
  targetAgent: string;
  seenIdempotencyKeys: Set<string>;
}) {
  const { envelope, requiredAudience, requiredScope, targetAgent, seenIdempotencyKeys } = input;

  if (!envelope.traceId || !envelope.messageId || !envelope.idempotencyKey) {
    return { decision: 'deny', reason: 'missing_correlation_fields' };
  }

  if (envelope.toAgent !== targetAgent || envelope.auth.audience !== targetAgent) {
    return { decision: 'deny', reason: 'wrong_audience' };
  }

  if (envelope.auth.audience !== requiredAudience) {
    return { decision: 'deny', reason: 'wrong_required_audience' };
  }

  if (!envelope.auth.scopes.includes(requiredScope)) {
    return { decision: 'deny', reason: 'missing_scope' };
  }

  if (seenIdempotencyKeys.has(envelope.idempotencyKey)) {
    return { decision: 'deny', reason: 'duplicate_message' };
  }

  return { decision: 'allow', reason: 'accepted' };
}
```

El sobre exacto puede cambiar según el protocolo, pero el límite debe permanecer: identificar al llamador, identificar al destino, validar autoridad, preservar correlación y evitar trabajo duplicado.

## Modos de falla

- Tratar un agent remoto como una función local e ignorar latencia, rechazo, timeout o cancelación.
- Enviar blobs de lenguaje natural no validados en vez de mensajes de task tipados.
- Omitir el descubrimiento de capability, haciendo que los llamadores dependan de suposiciones obsoletas.
- No tener trace ID en mensajes de progreso, resultado y error.
- No tener idempotency key, por lo que los reintentos duplican trabajo.
- Se acepta audience incorrecto o falta de scope porque el agent remoto confía en el llamador por nombre.
- Los agents delegan la misma task de ida y vuelta sin owner ni presupuesto de delegación.
- El agent remoto cambia su schema sin versionado.
- Un camino de fallback omite autorización u observabilidad.

## Estrategia de evaluación

Prueba el protocolo, no solo la colaboración en el camino feliz.

- Prueba llamadas válidas con audience, scope, tenant, schema, trace ID e idempotency key correctos.
- Prueba audience incorrecto, falta de scope, incompatibilidad de schema, falta de trace ID y mensajes duplicados.
- Prueba el rechazo como resultado válido.
- Prueba comportamiento de timeout y cancelación.
- Prueba detección de bucles de delegación.
- Prueba solicitudes de capability inseguras.
- Prueba evolución de schema compatible hacia atrás.
- Prueba que cada handoff emita eventos de trace y propiedad.

Mide tasa de validez de schema, falsos positivos de autorización, manejo de rechazos, recuperación de timeout, detección de mensajes duplicados, tasa de bucle de delegación, completitud de trace y cobertura de owner en fallas.

## Lista de verificación para producción

- Publica una agent card con capabilities, schemas, scopes, owner, versión y estados de ciclo de vida.
- Valida cada solicitud y respuesta contra schemas versionados.
- Requiere TLS para transporte remoto y mTLS para identidad de servicio donde aplique.
- Valida OAuth u OIDC audience, scopes, subject, tenant y expiración antes de la ejecución.
- Requiere trace ID, message ID, task ID, idempotency key, source agent y target agent.
- Trata rechazo, cancelación, timeout y espera de aprobación como resultados de primera clase.
- Rastrea owner actual y profundidad de delegación para evitar rebote de tasks.
- Agrega timeouts, reintentos y semántica de cancelación antes de producción.
- Registra handoffs, decisiones de autorización, progreso, resultados y stop reasons en traces.
- Convierte fallas de protocolo y delegación insegura en fixtures de eval.

## Ejecuta el ejemplo

```sh
npm run a2a:test
npm run a2a:run
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y en el repository source.

### `agent-to-agent-communication-pattern/src/run_demo.ts`

[Abrir fuente completa](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-to-agent-communication-pattern/src/run_demo.ts)

```ts
import { BusMemory } from './bus_memory.ts';
import { AgentA } from './agent_a.ts';
import { AgentB } from './agent_b.ts';

async function run() {
  const bus = new BusMemory();
  const a = new AgentA(bus);
  const b = new AgentB(bus);
  a.start();
  b.start();
  a.handshake();
  a.requestTask('t1', 'sum', { a: 2, b: 5 });
}

run();
```

### `agent-to-agent-communication-pattern/src/agent_a.ts`

[Abrir fuente completa](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-to-agent-communication-pattern/src/agent_a.ts)

```ts
import { BusMemory, A2A_SCHEMA } from './bus_memory.ts';
import type { Msg } from './bus_memory.ts';
import Ajv from 'ajv';
import crypto from 'node:crypto';
const ajv = new Ajv({ allErrors: true, strict: true });
const validateResponse = ajv.compile((A2A_SCHEMA as any).properties.TaskResponse);

export class AgentA {
  private bus: BusMemory;
  private traceId = crypto.randomUUID();
  constructor(bus: BusMemory) { this.bus = bus; }
  start() {
    // listen for responses
    this.bus.subscribe('TaskResponse', (m: Msg) => {
      if (!validateResponse(m.payload)) {
        console.error('Invalid TaskResponse', validateResponse.errors);
        return;
      }
      console.log('AgentA received response:', m.payload);
    });
  }
  handshake() {
    this.bus.publish({ type: 'Handshake', payload: { version: '1.0', capabilities: ['tasks', 'cancel'] } });
  }
  requestTask(id: string, task_type: string, input: any) {
    this.bus.publish({
      type: 'TaskRequest',
      payload: {
        id,
        task_type,
        input,
        meta: {
          trace_id: this.traceId,
          message_id: crypto.randomUUID(),
          idempotency_key: `task:${id}`,
          from_agent: 'agent-a',
          to_agent: 'agent-b',
          tenant_id: 'tenant_a',
          auth: {
            audience: 'agent-b',
            scopes: ['task:sum']
          },
          timeout_ms: 30000,
          ts: Date.now()
        }
      }
    });
  }
  cancel(id: string, reason: string) {
    this.bus.publish({ type: 'Cancel', payload: { id, reason } });
  }
}
```

### `agent-to-agent-communication-pattern/src/agent_b.ts`

[Abrir fuente completa](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/agent-to-agent-communication-pattern/src/agent_b.ts)

```ts
import { BusMemory, A2A_SCHEMA } from './bus_memory.ts';
import type { Msg } from './bus_memory.ts';
import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true, strict: true });
const validateReq = ajv.compile((A2A_SCHEMA as any).properties.TaskRequest);

export class AgentB {
  private bus: BusMemory;
  private handshakeAckSent = false;
  private seenIdempotencyKeys = new Set<string>();
  constructor(bus: BusMemory) { this.bus = bus; }
  start() {
    this.bus.subscribe('Handshake', () => {
      if (this.handshakeAckSent) return;
      this.handshakeAckSent = true;
      this.bus.publish({ type: 'Handshake', payload: { version: '1.0', capabilities: ['tasks'] } });
    });
    this.bus.subscribe('TaskRequest', (m: Msg) => {
      if (!validateReq(m.payload)) return;
      const payload = m.payload as any;
      const { id, task_type, input } = payload;
      const authorization = this.authorize(payload);
      if (!authorization.allowed) {
        this.bus.publish({
          type: 'TaskResponse',
          payload: { id, status: 'refused', error: authorization.reason }
        });
        return;
      }
      this.seenIdempotencyKeys.add(payload.meta.idempotency_key);
      if (task_type !== 'sum') {
        this.bus.publish({ type: 'TaskResponse', payload: { id, status: 'refused', error: 'unsupported_task' } });
        return;
      }
      // progress
      this.bus.publish({ type: 'Progress', payload: { id, stage: 'start', pct: 10, message: 'starting' } });
      const a = input?.a;
      const b = input?.b;
      if (typeof a !== 'number' || typeof b !== 'number') {
        this.bus.publish({ type: 'TaskResponse', payload: { id, status: 'error', error: 'invalid_input' } });
        return;
      }
      // compute safely
      const sum = a + b;
      this.bus.publish({ type: 'Progress', payload: { id, stage: 'compute', pct: 60 } });
      this.bus.publish({ type: 'TaskResponse', payload: { id, status: 'success', output: { sum } } });
    });
    this.bus.subscribe('Cancel', (m: Msg) => {
      console.log('AgentB cancel received:', m.payload);
    });
  }

  private authorize(payload: any) {
    const meta = payload.meta;
    if (meta.to_agent !== 'agent-b' || meta.auth.audience !== 'agent-b') {
      return { allowed: false, reason: 'wrong_audience' };
    }
    if (!meta.auth.scopes.includes('task:sum')) {
      return { allowed: false, reason: 'missing_scope' };
    }
    if (meta.tenant_id !== 'tenant_a') {
      return { allowed: false, reason: 'tenant_boundary' };
    }
    if (this.seenIdempotencyKeys.has(meta.idempotency_key)) {
      return { allowed: false, reason: 'duplicate_message' };
    }
    return { allowed: true, reason: 'authorized' };
  }
}
```

## Descargar

- [Descargar paquete fuente](/downloads/a2a-agent-interoperability.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/agent-to-agent-communication-pattern)

El paquete de descarga contiene la carpeta `agent-to-agent-communication-pattern/` actual de este repositorio.

## Patrones relacionados

- [Agents As Services](/systems-architecture/agents-as-services)
- [Choosing Multi-Agent Topology](/multi-agent-systems/choosing-multi-agent-topology)
- [Supervisor / Worker](/multi-agent-systems/supervisor-worker)
- [Secure Agent Communication](/tools-skills-protocols/secure-agent-communication)
- [Policy Enforcement](/production-runtime/policy-enforcement)
- [Observability and Evals](/production-runtime/observability-and-evals)
- [MCP-first Tool Use](/tools-skills-protocols/mcp-first-tool-use)
