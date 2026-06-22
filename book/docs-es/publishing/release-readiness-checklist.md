---
title: Lista de Verificación de Preparación para el Lanzamiento
---

# Lista de Verificación de Preparación para el Lanzamiento

Usa esta lista antes de publicar una nueva versión del libro. El estándar no es "el sitio compila". El estándar es que una persona lectora pueda avanzar desde el concepto, a la elección de pattern, al laboratorio, al capstone y a la evidencia de lanzamiento sin encontrar contextos faltantes.

Descarga el artifact reutilizable de publicación: [release evidence record](/capstone-assets/templates/release-evidence-record.txt).

## Cobertura de Verificación

Usa este gráfico para ver por qué la preparación para el lanzamiento requiere verificaciones superpuestas. Las pruebas de código, revisiones de ejemplos nativos, compilación de contenido, paridad del sitio, generación de formatos de cortesía y QA de páginas renderizadas prueban cada una una parte diferente del lanzamiento.

![Cobertura de verificación de lanzamiento](../public/diagrams/release-verification-coverage.svg)

## Recorrido del Lector

| Puerta | Evidencia de Lanzamiento |
| --- | --- |
| El camino inicial es coherente | [How To Read This Book](./how-to-read.md) ofrece rutas para primera vez, builder, laboratorio, capstone y referencia. |
| La selección de patterns es usable | Los capítulos de selección explican cuándo usar un pattern, cuándo evitarlo y cómo se componen los patterns. |
| Los labs prueban arquitectura, no solo APIs | Los labs identifican lenguaje, framework, archivos fuente, comando base, brecha de producción y salida esperada. |
| La pista de mini-framework explica los primitivos | La pista desde cero muestra responsabilidades de loop, decisión, tool registry, policy, memory, trace y eval. |
| Los capstones tienen forma de producto | Los capstones incluyen state, policy, memory, aprobaciones, traces, evals, ADRs, runbooks, rollback y mapeos de framework. |

## Calidad del Contenido

| Puerta | Evidencia de Lanzamiento |
| --- | --- |
| No hay marcadores sin terminar | Busca marcadores comunes de borrador fuera de los assets generados. |
| Los diagramas tienen contexto | Los diagramas de arquitectura se presentan con el límite de propiedad o decisión que explican. |
| Las tablas no están huérfanas | Las tablas tienen suficiente contexto antes y después para explicar cómo debe usar la persona lectora las filas. |
| Los ejemplos nombran sus límites | El código demo indica lo que aún falta para producción: state, policy, tracing, evals, aprobación, despliegue o integración con framework. |
| La terminología es estable | State, policy, memory, tools, traces, evals, workflows y approvals significan lo mismo en todos los capítulos. |

## Revisión A++ de Capítulos

Antes de publicar, selecciona al menos un capítulo de cada sección modificada y revísalo contra el estándar editorial del libro. Un capítulo está listo para lanzamiento cuando le da a la persona lectora una decisión, límite, prueba o artifact reutilizable, no solo más información.

| Revisión | Evidencia de Lanzamiento |
| --- | --- |
| La promesa al lector es clara | La primera pantalla dice qué problema resuelve el capítulo y por qué importa. |
| Los casos de uso y de no uso son explícitos | El capítulo ayuda a la persona lectora a elegir el pattern o rechazarlo. |
| La propiedad es visible | State, tools, policy, memory, approvals, evals y condiciones de detención tienen responsables. |
| Los modos de falla son concretos | El capítulo nombra formas realistas en que el diseño puede fallar y cómo detectarlas. |
| Se nombra la brecha de producción | El capítulo explica qué cambia antes de usuarios reales, datos, dinero o efectos secundarios. |
| La evaluación es accionable | La persona lectora puede convertir la guía en una prueba, caso de eval, fixture o gate de lanzamiento. |
| Existe artifact reutilizable | El capítulo deja una checklist, schema, trace shape, worksheet, ADR o patrón de implementación. |
| La UX en línea funciona | Encabezados, tablas, diagramas, bloques de código, enlaces y descargas son legibles en el sitio compilado. |

Si un capítulo modificado falla en más de dos revisiones, no lo consideres un cambio A++. Revisa el capítulo o registra la limitación en las notas de lanzamiento.

## Comandos de Verificación

Ejecuta estos desde la raíz del repositorio:

```sh
npm test
npm run release:commands
npm run typecheck
npm run capstones:evidence
npm run native-examples:validate
npm run native-examples:smoke:langgraph
npm run book:manifest:test
npm run book:visuals:verify
npm run book:quality
npm run book:build
npm run site:build
npm run site:parity
npm run book:pdf
npm run book:epub
```

Evidencia esperada:

| Comando | Qué Demuestra |
| --- | --- |
| `npm test` | Los ejemplos de pattern, labs, capstones, evidence gates y ejemplos de protocolo deterministas aún se ejecutan. |
| `npm run release:commands` | Los scripts de paquete, docs de lanzamiento y el workflow de publicación listan los mismos gates de lanzamiento. |
| `npm run typecheck` | Los ejemplos de TypeScript y contratos compartidos aún compilan. |
| `npm run capstones:evidence` | Los capítulos de capstone, razones de detención de runtime, assets de trace, reportes de eval y enlaces de scorecard coinciden. |
| `npm run native-examples:validate` | Los archivos de ejemplo nativos de framework son sintácticamente válidos y existen los assets requeridos. |
| `npm run native-examples:smoke:langgraph` | Los slices nativos de LangGraph instalan dependencias opcionales y se ejecutan sin provider keys. |
| `npm run book:manifest:test` | Sidebar, manifiesto PDF, propiedad de capítulos y registro de capítulos generados son válidos. |
| `npm run book:visuals:verify` | Cada capítulo del manifiesto y la página principal tienen un diagrama Mermaid, imagen o referencia SVG. |
| `npm run book:quality` | Cobertura del manifiesto, capítulos generados, consistencia de título/H1, marcadores sin terminar, assets de diagramas, texto alternativo de diagramas y cobertura de Mermaid SVG son válidos. |
| `npm run book:build` | La compilación de autoría de VitePress, páginas generadas, diagramas y descargas son válidas después de pasar los quality gates. |
| `npm run site:build` | El sitio lector de Astro compila con assets públicos sincronizados e índice de búsqueda. |
| `npm run site:parity` | Las rutas publicadas y enlaces internos coinciden con el manifiesto del libro. |
| `npm run book:pdf` | El PDF de cortesía y la copia de despliegue pueden regenerarse. |
| `npm run book:epub` | El EPUB de cortesía y la copia de despliegue pueden regenerarse. |

## QA Visual

Inspecciona estas páginas en el sitio compilado antes del lanzamiento:

1. `/book/intro/`
2. `/book/publishing/how-to-read/`
3. `/book/pattern-selection/choosing-the-right-pattern/`
4. `/book/agent-engineering-practice/cross-framework-decision-matrix/`
5. `/book/hands-on-labs/`
6. `/book/hands-on-labs/from-scratch-mini-framework/`
7. `/book/capstone-projects/`
8. `/book/systems-architecture/reference-architecture/`
9. `/book/publishing/release-notes/`

Verifica que los diagramas se rendericen, los encabezados se ajusten, los bloques de código sean legibles, las tablas no queden sin explicación y la navegación mantenga orientada a la persona lectora.

## QA de URL Pública

Después del despliegue en GitHub Pages, inspecciona el sitio público con la ruta base de producción:

| URL Pública | Revisión |
| --- | --- |
| `/Agentic-Systems-Patterns/` | La página principal se muestra y las acciones principales funcionan. |
| `/Agentic-Systems-Patterns/book/intro/` | La introducción carga desde el sitio desplegado. |
| `/Agentic-Systems-Patterns/book/publishing/how-to-read/` | Las rutas de lectura son accesibles. |
| `/Agentic-Systems-Patterns/book/pattern-selection/choosing-the-right-pattern/` | La página principal de selección de patterns carga. |
| `/Agentic-Systems-Patterns/book/hands-on-labs/` | El índice de labs carga y los enlaces de labs resuelven. |
| `/Agentic-Systems-Patterns/book/capstone-projects/` | El índice de capstones carga y los enlaces de artifacts resuelven. |
| `/Agentic-Systems-Patterns/releases/Agentic-Systems-Patterns.pdf` | El PDF de cortesía se descarga. |
| `/Agentic-Systems-Patterns/releases/Agentic-Systems-Patterns.epub` | El EPUB de cortesía se descarga. |
| `/Agentic-Systems-Patterns/pagefind/` | Existen los assets de búsqueda, la búsqueda arroja resultados y los filtros de nivel/tipo funcionan. |

Las verificaciones de compilación local prueban el artifact desplegable. El QA de URL pública prueba la superficie de lectura desplegada.

## QA de Descargas y Assets

Revisa los assets orientados al lector que hacen útil el libro en línea:

| Asset | Evidencia de Lanzamiento |
| --- | --- |
| PDF de cortesía | `/releases/Agentic-Systems-Patterns.pdf` existe y refleja el contenido actual. |
| EPUB de cortesía | `/releases/Agentic-Systems-Patterns.epub` existe y refleja el contenido actual. |
| Paquetes fuente | Las descargas de pattern, lab, framework nativo y capstone resuelven desde el sitio compilado. |
| Plantillas | Worksheets, scorecards y listas de verificación de revisión resuelven bajo `/capstone-assets/templates/`. |
| Ejemplos completos | Ejemplo de ADR, evidencia de lab y ejemplos de preparación para producción resuelven bajo `/capstone-assets/templates/`. |
| Ejemplos de trace | Los archivos JSON de trace de capstone resuelven y coinciden con las referencias del capítulo. |
| Reportes de eval | Los archivos de reporte de eval de capstone resuelven y coinciden con las referencias del capítulo. |
| Evidence gate de capstone | `npm run capstones:evidence` pasa contra el texto del capítulo, salida de runtime, assets de trace, reportes de eval y enlaces de scorecard. |
| Diagramas | Los diagramas SVG se renderizan en las páginas de capítulos y no quedan huérfanos. |
| Metadata de búsqueda | Pagefind reporta filtros de capítulos y los resultados de búsqueda renderizados muestran metadata de sección, tipo y nivel. |

Esta revisión importa porque el libro es un producto en línea. Un capítulo puede leerse bien y aun así fallar a las personas lectoras si sus descargas o artifacts de evidencia faltan.

## Registro de Evidencia de Lanzamiento

Antes de publicar, registra:

```text
version:
date:
commit:
commands passed:
visual pages checked:
download assets checked:
known limitations:
release owner:
rollback action:
```

Coloca el registro en las notas de lanzamiento, el release de GitHub o la descripción del PR de lanzamiento.

Usa el [registro de evidencia de lanzamiento](/capstone-assets/templates/release-evidence-record.txt) descargable cuando el release cambie contenido visible para el lector o el comportamiento de publicación. El release actual ya tiene un [registro de evidencia de pre-lanzamiento](/capstone-assets/templates/prelaunch-release-evidence-2026-06-21.txt) completado; llena su sección pública de GitHub Pages después del despliegue.

## Decisión de Lanzamiento

No publiques si alguna de estas condiciones es verdadera:

- Un comando requerido falla.
- Un core reader path contiene un enlace roto o una imagen faltante.
- Un lab apunta a código fuente que ya no existe.
- Un capstone afirma cobertura nativa de framework sin un ejemplo correspondiente o un alcance claro.
- El PDF o EPUB de cortesía está desactualizado respecto al contenido del sitio.
- Las notas de lanzamiento no indican qué cambió y cómo se verificó.

Publica solo cuando la evidencia de lanzamiento sea más sólida que la afirmación hecha a los lectores.
