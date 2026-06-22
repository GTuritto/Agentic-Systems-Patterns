---
title: MCP-first Tool Use
---

# MCP-first Tool Use

El uso de herramientas MCP-first separa la capability de la tool de la lógica del agent mediante manifests, validación, invocación y resultados estructurados.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/modern-tool-use-pattern)
> - [Download code bundle](/downloads/mcp-first-tool-use.zip)

## Intención

Usa este pattern cuando el conjunto de tools puede evolucionar de forma independiente al agent. MCP le da a las tools un límite de manifest para que el agent pueda inspeccionar capabilities en lugar de depender de supuestos codificados.

## Úsalo Cuando

- Las tools se comparten entre agents o aplicaciones.
- Los schemas de las tools, el context y los permisos deben ser descubribles.
- Quieres probar la invocación de la tool por separado del razonamiento del model.

## Evita Cuando

- Una llamada a función local es suficiente y no se necesita un límite de descubrimiento.
- Las entradas de la tool no pueden ser validadas.
- El agent tiene permiso para invocar demasiadas tools sin policy checks.

## Arquitectura

Usa este diagrama para leer MCP-first Tool Use como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el protocolo o el límite de capability posee schemas, permisos, registros de invocación y validación de respuestas.

![MCP-first tool use architecture](../public/diagrams/mcp-first-tool-use.svg)

## Forma del Sistema

- **Límite del pattern:** el agent descubre o selecciona una capability, envía una solicitud tipada y recibe un resultado tipado a través de un policy boundary.
- **Propietario del state:** el protocolo o el límite de capability posee schemas, permisos, registros de invocación y validación de respuestas.
- **Artifact principal:** `modern-tool-use-pattern/` contiene la implementación de referencia ejecutable y ejemplos.
- **Promesa operativa:** MCP-first tool use separa la capability de la tool de la lógica del agent mediante manifests, validación, invocación y resultados estructurados.
- **Ruta ejecutable:** comienza con `npm run mcp:search` antes de adaptar el pattern a un sistema más grande.

## Protocolo Central

1. Descubre la capability, schema, permisos y restricciones operativas.
2. Prepara una solicitud tipada a partir del goal y state actuales.
3. Autoriza la solicitud antes de la invocación.
4. Invoca la tool, skill o remote agent y valida el resultado.
5. Devuelve structured output, rechazo, progreso o error sin perder los correlation IDs.

## Notas de Implementación

- Valida la entrada de la tool antes de cada invocación.
- Mantén los resultados de la tool estructurados y observables.
- Coloca policy checks entre la intención del model y la ejecución de la tool.
- Prefiere tools pequeñas con contratos claros sobre tools amplias con descripciones vagas.

## Modos de Falla

- Manifests de tools que describen capabilities de forma demasiado vaga.
- Entradas generadas por el model para la tool usadas sin validación de schema.
- Efectos secundarios ocultos que no son visibles en el contrato de la tool.
- Sin trace que vincule la decisión del model, la entrada de la tool y el resultado de la tool.

## Estrategia de Evaluación

- Prueba llamadas válidas, argumentos inválidos, llamadas no autorizadas, timeouts, rechazos y respuestas mal formadas.
- Asegúrate de que las acciones peligrosas requieran aprobación o sean bloqueadas antes de la ejecución.
- Mide la precisión en la selección de tools, validez de schemas, fallas de autorización y comportamiento de recuperación.
- Incluye casos que prueben que cada condición de "Úsalo Cuando" es verdadera para este pattern.
- Incluye casos negativos de "Evita Cuando" para que el sistema elija un pattern más simple o seguro cuando corresponda.

## Lista de Verificación para Producción

- Usa schemas tipados para entradas y salidas.
- Separa la intención del model de los permisos de ejecución reales.
- Agrega timeouts, reintentos, claves de idempotencia y registros de auditoría.
- Trata el rechazo y la cancelación como resultados de primera clase.
- Define escalamiento humano para trabajos ambiguos, de alto riesgo o bloqueados por policy.
- Mantén el source bundle, el capítulo generado, las pruebas y el artifact de despliegue en la misma release.

## Ejecuta el Ejemplo

```sh
npm run mcp:search
npm run mcp:cloud
npm run mcp:agent
npm run mcp:test
```

## Recorrido por el Código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código Fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el download bundle y el repository source.

### `modern-tool-use-pattern/typescript/src/agent.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/modern-tool-use-pattern/typescript/src/agent.ts)

```ts
import axios from 'axios';
import Ajv from 'ajv';
import { pathToFileURL } from 'node:url';

const ajv = new Ajv({ allErrors: true, strict: true });

async function getManifest(base: string) {
  const { data } = await axios.get(`${base}/manifest`);
  return data;
}

async function invoke(base: string, tool: string, input: any) {
  const { data } = await axios.post(`${base}/invoke`, { tool, input });
  if (!data?.ok) throw new Error(data?.error || 'invoke_failed');
  return data.output;
}

export async function runScenario() {
  // Discover tools via MCP manifests
  const search = await getManifest('http://localhost:3031');
  const cloud = await getManifest('http://localhost:3032');
  // Validate inputs before invoking
  const searchSchema = search.tools.find((t: any) => t.name === 'search.query')?.input_schema;
  const cloudStoreSchema = cloud.tools.find((t: any) => t.name === 'cloud.store')?.input_schema;
  const vSearch = ajv.compile(searchSchema);
  const vCloudStore = ajv.compile(cloudStoreSchema);
  // Plan (deterministic): search for a topic, then store results in cloud
  const q = 'agents';
  const inputSearch = { q, limit: 2 };
  if (!vSearch(inputSearch)) throw new Error('bad search input');
  const { items } = await invoke('http://localhost:3031', 'search.query', inputSearch);
  const doc = { topic: q, titles: items.map((i: any) => i.title) };
  const inputStore = { key: `topic:${q}`, value: doc };
  if (!vCloudStore(inputStore)) throw new Error('bad cloud.store input');
  await invoke('http://localhost:3032', 'cloud.store', inputStore);
  return doc;
}

async function main() {
  const out = await runScenario();
  console.log('Stored doc:', out);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => { console.error(err); process.exit(1); });
}
```

### `modern-tool-use-pattern/typescript/src/mcp_search_server.ts`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/modern-tool-use-pattern/typescript/src/mcp_search_server.ts)

```ts
import express from 'express';
import type { Request, Response } from 'express-serve-static-core';

const app = express();
app.use(express.json());

const manifest = {
  name: 'search-tools',
  version: '1.0.0',
  tools: [
    {
      name: 'search.query',
      description: 'Mock web search returning titles for a query',
      input_schema: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 5 }
        },
        additionalProperties: false
      }
    }
  ]
};

app.get('/manifest', (_req: Request, res: Response) => res.json(manifest));

app.post('/invoke', (req: Request, res: Response) => {
  const { tool, input } = req.body || {};
  if (tool === 'search.query') {
    const q = String(input?.q || '').trim();
    const limit = Math.max(1, Math.min(5, Number(input?.limit ?? 3)));
    const items = Array.from({ length: limit }, (_, i) => ({ title: `${q} result ${i + 1}` }));
    return res.json({ ok: true, output: { items } });
  }
  return res.status(400).json({ ok: false, error: 'unknown_tool' });
});

app.listen(3031, () => console.log('MCP search server on 3031'));
```

### `modern-tool-use-pattern/typescript/src/mcp_cloud_server.ts`

[Abrir el código fuente completo](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/modern-tool-use-pattern/typescript/src/mcp_cloud_server.ts)

```ts
import express from 'express';
import type { Request, Response } from 'express-serve-static-core';

const app = express();
app.use(express.json());

const store = new Map<string, any>();

const manifest = {
  name: 'cloud-store',
  version: '1.0.0',
  tools: [
    {
      name: 'cloud.store',
      description: 'Store a JSON document under a key',
      input_schema: {
        type: 'object',
        required: ['key', 'value'],
        properties: { key: { type: 'string' }, value: { type: 'object' } },
        additionalProperties: false
      }
    },
    {
      name: 'cloud.fetch',
      description: 'Fetch a document by key',
      input_schema: {
        type: 'object',
        required: ['key'],
        properties: { key: { type: 'string' } },
        additionalProperties: false
      }
    }
  ]
};

app.get('/manifest', (_req: Request, res: Response) => res.json(manifest));

app.post('/invoke', (req: Request, res: Response) => {
  const { tool, input } = req.body || {};
  if (tool === 'cloud.store') {
    store.set(String(input.key), input.value);
    return res.json({ ok: true });
  }
  if (tool === 'cloud.fetch') {
    return res.json({ ok: true, output: { value: store.get(String(input.key)) ?? null } });
  }
  return res.status(400).json({ ok: false, error: 'unknown_tool' });
});

app.listen(3032, () => console.log('MCP cloud server on 3032'));
```

## Descarga

- [Descargar paquete fuente](/downloads/mcp-first-tool-use.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/modern-tool-use-pattern)

El paquete de descarga contiene la carpeta `modern-tool-use-pattern/` actual de este repositorio.

## Patrones relacionados

- [Skills](/tools-skills-protocols/skills)
- [A2A Agent Interoperability](/tools-skills-protocols/a2a-agent-interoperability)
- [Secure Agent Communication](/tools-skills-protocols/secure-agent-communication)
- [Choosing the Right Pattern](/pattern-selection/choosing-the-right-pattern)
- [Resource-Aware Agent Design](/pattern-selection/resource-aware-agent-design)
