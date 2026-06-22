---
title: Secure Agent Communication
---

# Secure Agent Communication

La comunicación segura protege los mensajes entre agents con autenticación, integridad, confidencialidad y verificaciones de policy.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/secure-agent-communication-pattern)
> - [Download code bundle](/downloads/secure-agent-communication.zip)

## Intento

La comunicación segura entre agents protege los mensajes entre agents, tools, runtimes y servicios con identidad, autorización, confidencialidad, integridad, protección contra replay y observability.

Este pattern es importante porque la comunicación agent-to-agent no es solo chat entre models. Los mensajes pueden llevar datos privados, instrucciones para tools, goals delegados, solicitudes de aprobación, comandos de workflow y propuestas de efectos secundarios. Si la capa de comunicación es débil, el model puede ser correcto y aun así el sistema puede ser inseguro.

La regla práctica es simple: cada mensaje de agent que cruza un límite necesita un transport boundary, un identity boundary, un authorization boundary y un audit boundary.

## Usa cuando

- Agents, tools, skills o runtimes se comunican entre procesos, servicios, equipos, tenants o redes.
- Los mensajes contienen datos privados, business state, credenciales, tasks delegadas o instrucciones de efectos secundarios.
- Agents remotos pueden invocar tools, workflows, APIs, browsers, shells o data stores.
- El sistema necesita TLS, mTLS, OAuth u OIDC, credenciales con alcance, protección contra replay y correlación de traces.
- Los operadores deben poder explicar quién solicitó qué, qué policy lo permitió, qué se ejecutó y qué trace lo prueba.

## Evita cuando

- Toda la comunicación es local, en el mismo proceso y ya está cubierta por el mismo trusted execution boundary.
- El sistema no puede identificar caller, tenant, audience, capability y trace ID.
- La autorización ocurre solo en el prompt o solo después de que la acción remota se ejecuta.
- Los mensajes no pueden ser redactados, retenidos, trazados o reproducidos de forma segura.
- El ciclo de vida de tokens y certificados no puede ser operado por el equipo.

## Arquitectura

Usa este diagrama para leer Secure Agent Communication como un system boundary, no solo una forma de código. La pregunta clave de propiedad es: el protocolo o capability boundary es dueño de los schemas, permisos, registros de invocación y validación de respuestas.

![Secure agent communication boundary](../public/diagrams/secure-agent-communication-boundary.svg)

Léelo como una secuencia de puertas de autoridad. El agent o tool remoto recibe capability solo después de que pasan las verificaciones de transport, identidad, envelope, scope, policy y aprobación.

## Forma del sistema

- **Transport boundary:** usa TLS para la comunicación entre servicios y mTLS cuando ambos lados necesitan identidad de servicio respaldada por certificado.
- **Identity boundary:** identifica caller, subject, tenant, audience, issuer e identidad de servicio antes de procesar la solicitud.
- **Authorization boundary:** verifica claims de token OAuth u OIDC, scopes, audience, tenant, capability de tool, clase de riesgo y requisitos de aprobación.
- **Message boundary:** valida schemas, claves de idempotency, timestamps, nonces y tamaño de contenido antes de que el mensaje entre al agent loop.
- **Data boundary:** cifra los payloads sensibles cuando sea necesario, redacta traces y evita colocar secretos en prompts, memory, logs o fixtures de eval.
- **Observability boundary:** emite eventos de trace para verificación de identidad, decisión de autorización, resultado de policy, invocación de tool, rechazo, aprobación y validación de respuesta.

## Protocolo central

1. Recibe un mensaje por TLS o mTLS.
2. Verifica identidad del servicio y emisor del token, audience, expiración, subject, tenant y scopes.
3. Valida el schema del mensaje, clave de idempotency, timestamp, nonce, trace ID y correlation IDs.
4. Construye el policy context a partir de datos confiables del runtime, no solo del texto del mensaje.
5. Verifica capability de tool, data scope, clase de riesgo, estado de budget y requisito de aprobación.
6. Descifra o desempaqueta payloads sensibles solo después de que la autorización sea exitosa.
7. Ejecuta la acción remota limitada, o niega, escala o espera aprobación.
8. Valida el schema de la respuesta y redacta campos sensibles antes de devolverla.
9. Registra eventos de trace, decisión de policy, subject del token, identidad de servicio, scopes, latencia, costo y motivo de detención.

## Notas de implementación

TLS protege el transporte. OAuth y OIDC identifican y autorizan al caller. Policy decide si la capability solicitada está permitida. Observability prueba lo que sucedió.

No trates estos controles como intercambiables:

| Control | Qué responde |
| --- | --- |
| TLS | ¿La conexión está cifrada y protegida en tránsito? |
| mTLS | ¿Qué identidad de servicio está al otro lado de esta conexión? |
| OAuth u OIDC | ¿Quién o qué es el caller y qué scopes o claims tiene? |
| Policy engine | ¿Este caller puede realizar esta acción sobre este recurso ahora? |
| Message signing | ¿Este mensaje ha sido alterado o reproducido fuera de la sesión de transporte? |
| Trace correlation | ¿Los operadores pueden reconstruir el camino de la solicitud entre agents y tools? |

Usa credenciales con alcance y de corta duración. Un agent remoto debe recibir el scope mínimo requerido para el task delegado, no toda la autoridad del usuario ni un token de servicio de toda la plataforma.

### Observability

La comunicación segura sin observability es difícil de operar. Registra lo suficiente para auditar el comportamiento sin filtrar secretos.

Traza estos eventos:

- mensaje entrante aceptado o rechazado;
- identidad de servicio TLS o mTLS;
- emisor del token, audience, subject, tenant y scopes después de la redacción;
- decisión de policy y motivo;
- clave de idempotency y resultado de detección de replay;
- solicitud de aprobación, concesión de aprobación o denegación de aprobación;
- agent o tool remoto invocado;
- resultado de validación de respuesta;
- latencia, costo, timeout, reintento y motivo de detención.

No registres tokens de acceso sin procesar, refresh tokens, claves privadas, secretos descifrados ni datos privados sin redactar. Observability debe explicar autoridad y comportamiento, no convertirse en una segunda fuga de datos.

### Secure Message Envelope

```ts
type SecureAgentEnvelope = {
  traceId: string;
  messageId: string;
  idempotencyKey: string;
  issuedAt: string;
  expiresAt: string;
  caller: {
    subject: string;
    tenantId: string;
    serviceId: string;
  };
  auth: {
    issuer: string;
    audience: string;
    scopes: string[];
  };
  capability: 'read' | 'delegate' | 'tool_call' | 'workflow_command';
  payloadRef?: string;
  encryptedPayload?: string;
};
```

### Authorization Check

```ts
function authorizeEnvelope(input: {
  envelope: SecureAgentEnvelope;
  requiredAudience: string;
  requiredScope: string;
  now: Date;
}) {
  const { envelope, requiredAudience, requiredScope, now } = input;

  if (envelope.auth.audience !== requiredAudience) {
    return { decision: 'deny', reason: 'wrong_audience' };
  }

  if (!envelope.auth.scopes.includes(requiredScope)) {
    return { decision: 'deny', reason: 'missing_scope' };
  }

  if (new Date(envelope.expiresAt).getTime() <= now.getTime()) {
    return { decision: 'deny', reason: 'expired_message' };
  }

  if (!envelope.traceId || !envelope.idempotencyKey) {
    return { decision: 'deny', reason: 'missing_trace_or_idempotency' };
  }

  return { decision: 'allow', reason: 'authorized' };
}
```

La implementación real debe validar tokens y certificados firmados con librerías confiables y proveedores de identidad de la plataforma. El punto arquitectónico importante es dónde vive la verificación: antes de que el agent o tool remoto reciba autoridad.

## Modos de falla

- TLS está presente, pero cualquier servicio autenticado puede llamar cualquier agent capability.
- Los scopes de OAuth son amplios, de larga duración o no se verifican contra la capability específica.
- El audience del token se ignora, así que un token creado para un servicio funciona contra otro.
- Tenant, subject o identidad de servicio se toman del texto del model en vez de claims confiables del runtime.
- Los mensajes no tienen clave de idempotency, nonce, timestamp ni detección de replay.
- Agents remotos reciben credenciales ambientales en vez de autoridad delegada con scope.
- Payloads sensibles, tokens o datos descifrados aparecen en prompts, memory, logs o traces.
- Las llamadas denegadas no se trazan, así que los intentos de abuso son invisibles.
- Observability registra solo los outputs finales pero no identidad, scope, policy o decisiones de transporte.

## Estrategia de evaluación

Prueba la seguridad de la comunicación como comportamiento, no solo como configuración.

- Prueba mensajes válidos con issuer, audience, scopes, tenant y schema correctos.
- Prueba audience incorrecto, scope faltante, token expirado, tenant incorrecto, trace ID faltante y clave de idempotency repetida.
- Prueba intentos de invocar tools fuera de la capability delegada.
- Prueba el replay de un mensaje antiguo.
- Prueba la redacción de tokens y datos privados en traces.
- Prueba capabilities que requieren aprobación antes de efectos secundarios.
- Prueba que las llamadas denegadas sean visibles en audit y observability.
- Prueba que los fallback paths no omitan identidad ni autorización.

Mide false allows y false denials de autorización, detección de replay, campos faltantes en trace, cobertura de policy-decision, fallas de redacción y tiempo promedio para investigar un incidente cross-agent.

## Lista de verificación para producción

- Exige TLS para toda comunicación remota entre agents.
- Usa mTLS para identidad service-to-service donde la infraestructura lo soporte.
- Valida issuer, audience, expiry, subject, tenant y scopes de OAuth u OIDC.
- Mantén los tokens con alcance limitado, corta duración, rotados y nunca visibles para el model a menos que sea absolutamente necesario.
- Valida schema del mensaje, clave de idempotency, timestamp, nonce y trace ID.
- Autoriza antes de descifrar payloads sensibles o invocar capabilities remotas.
- Aplica verificaciones de policy a llamadas delegadas de tools, comandos de workflow y respuestas finales.
- Redacta tokens, secrets, datos privados y payloads sensibles de los traces.
- Emite eventos de observability para identidad, autorización, policy, aprobación, invocación y validación de respuestas.
- Convierte incidentes de seguridad y llamadas peligrosas denegadas en regression evals.

## Ejecuta el ejemplo

```sh
npm run secure-agent
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo alrededor explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o flujo de control.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y en el repositorio fuente.

### `secure-agent-communication-pattern/autogen_typescript_example/secure_agent.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/secure-agent-communication-pattern/autogen_typescript_example/secure_agent.ts)

```ts
import crypto from 'crypto';

type SecureAgentEnvelope = {
  traceId: string;
  messageId: string;
  idempotencyKey: string;
  issuedAt: string;
  expiresAt: string;
  caller: {
    subject: string;
    tenantId: string;
    serviceId: string;
  };
  auth: {
    issuer: string;
    audience: string;
    scopes: string[];
  };
  capability: 'read' | 'delegate' | 'tool_call' | 'workflow_command';
  encryptedPayload: string;
};

type TraceEvent = {
  traceId: string;
  event: string;
  decision?: 'allow' | 'deny';
  reason?: string;
  subject?: string;
  scopes?: string[];
};

const key = crypto.randomBytes(32);

function encryptPayload(payload: object): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString('base64url');
}

function decryptPayload(token: string): unknown {
  const data = Buffer.from(token, 'base64url');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8');

  return JSON.parse(plaintext);
}

function authorizeEnvelope(input: {
  envelope: SecureAgentEnvelope;
  requiredAudience: string;
  requiredScope: string;
  now: Date;
}) {
  const { envelope, requiredAudience, requiredScope, now } = input;

  if (envelope.auth.audience !== requiredAudience) {
    return { decision: 'deny' as const, reason: 'wrong_audience' };
  }

  if (!envelope.auth.scopes.includes(requiredScope)) {
    return { decision: 'deny' as const, reason: 'missing_scope' };
  }

  if (new Date(envelope.expiresAt).getTime() <= now.getTime()) {
    return { decision: 'deny' as const, reason: 'expired_message' };
  }

  return { decision: 'allow' as const, reason: 'authorized' };
}

function trace(event: TraceEvent) {
  console.log(JSON.stringify(event));
}

function main() {
  const traceId = crypto.randomUUID();
```

_Extracto truncado para mayor legibilidad. Descarga el bundle o abre el archivo fuente para la implementación completa._

### `secure-agent-communication-pattern/langgraph_python_example/secure_agent.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/secure-agent-communication-pattern/langgraph_python_example/secure_agent.py)

```py
import json
import time
import uuid
from cryptography.fernet import Fernet

key = Fernet.generate_key()
fernet = Fernet(key)

def encrypt_payload(payload):
    return fernet.encrypt(json.dumps(payload).encode()).decode()

def decrypt_payload(token):
    return json.loads(fernet.decrypt(token.encode()).decode())

def authorize_envelope(envelope, required_audience, required_scope, now):
    if envelope['auth']['audience'] != required_audience:
        return {'decision': 'deny', 'reason': 'wrong_audience'}

    if required_scope not in envelope['auth']['scopes']:
        return {'decision': 'deny', 'reason': 'missing_scope'}

    if envelope['expires_at'] <= now:
        return {'decision': 'deny', 'reason': 'expired_message'}

    return {'decision': 'allow', 'reason': 'authorized'}

def trace(event):
    print(json.dumps(event))

def main():
    trace_id = str(uuid.uuid4())
    envelope = {
        'trace_id': trace_id,
        'message_id': str(uuid.uuid4()),
        'idempotency_key': f'agent-message:{uuid.uuid4()}',
        'issued_at': int(time.time()),
        'expires_at': int(time.time()) + 60,
        'caller': {
            'subject': 'agent:customer-support',
            'tenant_id': 'tenant_a',
            'service_id': 'support-agent-runtime',
        },
        'auth': {
            'issuer': 'https://identity.example.test',
            'audience': 'billing-agent',
            'scopes': ['agent:delegate', 'refund:draft'],
        },
        'capability': 'tool_call',
        'encrypted_payload': encrypt_payload({
            'tool': 'refunds.draft_refund',
            'order_id': 'ord_redacted',
            'amount_cents': 2500,
        }),
    }

    trace({
        'trace_id': trace_id,
        'event': 'secure_message_received',
        'subject': envelope['caller']['subject'],
        'scopes': envelope['auth']['scopes'],
    })

    authorization = authorize_envelope(
        envelope,
        required_audience='billing-agent',
        required_scope='refund:draft',
        now=int(time.time()),
    )

    trace({
        'trace_id': trace_id,
        'event': 'authorization_decision',
        'decision': authorization['decision'],
        'reason': authorization['reason'],
    })

    if authorization['decision'] == 'deny':
        return

    payload = decrypt_payload(envelope['encrypted_payload'])
    trace({'trace_id': trace_id, 'event': 'payload_decrypted_after_authorization'})
    print(json.dumps(payload))
```

_Extracto truncado para mayor legibilidad. Descarga el bundle o abre el archivo fuente para la implementación completa._

## Descarga

- [Download source bundle](/downloads/secure-agent-communication.zip)
- [Open source folder](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/secure-agent-communication-pattern)

El bundle de descarga contiene la carpeta actual `secure-agent-communication-pattern/` de este repositorio.

## Patrones relacionados

- [Production Runtime Overview](/production-runtime/overview)
- [Policy Enforcement](/production-runtime/policy-enforcement)
- [Observability and Evals](/production-runtime/observability-and-evals)
- [A2A Agent Interoperability](/tools-skills-protocols/a2a-agent-interoperability)
- [MCP-first Tool Use](/tools-skills-protocols/mcp-first-tool-use)
- [Tool Capability Design](/tools-skills-protocols/tool-capability-design)
- [Agent Threat Model](/agent-engineering-practice/agent-threat-model)
- [Agent Security and Sandboxing](/agent-engineering-practice/agent-security-and-sandboxing)
