---
title: Computer-Use Agents
---

# Computer-Use Agents

Los computer-use agents operan software a través de una interfaz de usuario cuando APIs, bases de datos o herramientas de workflow no están disponibles o son insuficientes. Leen pantallas, eligen acciones en la UI, hacen clic, escriben, desplazan, suben, descargan e inspeccionan resultados.

Usa este pattern solo cuando la integración directa no sea práctica. Una UI es la interfaz menos estable que un agent puede operar.

Descarga el artifact reutilizable de revisión: [computer-use agent review checklist](/capstone-assets/templates/computer-use-agent-review-checklist.txt).

## Intent

Permitir que un agent complete tasks en aplicaciones existentes controlando un navegador, escritorio, terminal o entorno remoto bajo fuerte sandboxing y supervisión humana.

Los computer-use agents son útiles para sistemas legacy, tasks operativos puntuales, herramientas SaaS sin APIs, workflows entre aplicaciones y pruebas de producto.

## Usa Cuando

- El sistema no tiene una API utilizable.
- La API carece de la funcionalidad requerida.
- El workflow abarca varias aplicaciones orientadas al usuario.
- Actualmente un humano realiza la task a través de una UI.
- Necesitas probar un producto como lo experimenta un usuario.
- La task puede tolerar ejecución más lenta y recuperaciones ocasionales.

## Evita Cuando

- Existe una integración estable con API o base de datos.
- El workflow tiene alto impacto financiero, legal o de seguridad sin aprobación.
- La UI cambia frecuentemente y no puede ser probada.
- La autenticación, CAPTCHA o 2FA bloquean la automatización.
- El agent necesitaría acceso amplio a pantallas o archivos privados.

Si el uso directo de tool está disponible, prefiere [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use).

## Architecture

```text
Goal
  -> Task state
  -> Screen or DOM observation
  -> UI action proposal
  -> Policy and sandbox check
  -> Action executor
  -> Observation and trace
  -> Stop, recover, or continue
```

El action executor debe ser determinista. El model propone una acción; el software la valida y ejecuta.

![Computer-use action-space control flow](../public/diagrams/computer-use-action-space.svg)

## Fit Check

Usa el control de computadora solo después de descartar interfaces más seguras.

| Preferir | Cuando |
| --- | --- |
| API o MCP tool | La aplicación expone la capability necesaria con un contrato estable. |
| Integración con base de datos o eventos | La task lee o escribe el state interno bajo una policy conocida. |
| Workflow engine | La secuencia, reintentos, aprobaciones y state son conocidos. |
| Test automation | El goal es QA de producto y los selectores pueden ser instrumentados. |
| Computer-use agent | La única interfaz práctica es la UI y la task puede tolerar desviaciones y recuperación. |

El costo de la automatización de UI no es solo la latencia. Es fragilidad. Cada selector, modal, visual state, flujo de login, permiso de navegador y rediseño de página se convierte en parte del entorno operativo del agent.

## Interface Representation

El agent necesita una representación compacta de la interfaz.

Representaciones comunes:

- screenshot con coordenadas;
- accessibility tree;
- DOM snapshot;
- browser automation locator map;
- terminal buffer;
- application event log;
- imagen más OCR;
- structured UI state de instrumentación de pruebas.

Usa la representación estructurada más rica disponible. Los screenshots ayudan cuando el diseño visual importa, pero los DOM o accessibility trees son más fáciles de validar y reproducir.

## Observation Evidence Contract

Los computer-use agents deben tratar cada observación como evidencia, no solo como un screenshot informal. El runtime debe almacenar suficiente context para que otro ingeniero pueda reproducir la decisión sin exponer datos privados innecesarios.

```ts
type UiObservation = {
  observationId: string;
  runId: string;
  timestamp: string;
  surface: "browser" | "desktop" | "terminal" | "remote_desktop";
  urlOrApp?: string;
  screenshotRef?: string;
  domSnapshotRef?: string;
  accessibilityTreeRef?: string;
  terminalBufferRef?: string;
  redactions: Array<{
    field: string;
    reason: "secret" | "personal_data" | "customer_data" | "internal_data";
  }>;
  visibleStateSummary: string;
  allowedNextActions: string[];
};
```

La observación debe responder tres preguntas antes de la siguiente acción: ¿qué vio el agent?, ¿qué fue redactado? y ¿qué acciones estaban permitidas desde ese state?

## Screenshot and Artifact Policy

Los screenshots, descargas, DOM snapshots y terminal buffers son útiles para depuración pero riesgosos de conservar. Define la policy antes de producción.

| Artifact | Conservar Cuando | Redactar o Eliminar Cuando |
| --- | --- | --- |
| Screenshot | El diseño visual, modal state o evidencia a nivel de píxel importa. | Contiene secretos, datos de pago, datos de salud o contenido privado no relacionado. |
| DOM snapshot | Los selectores, etiquetas y form state importan. | Los campos ocultos, tokens o datos de página completa exceden el alcance de la task. |
| Accessibility tree | El action target debe ser inspeccionable y reproducible. | Las etiquetas exponen datos sensibles de usuario o cliente. |
| Archivo descargado | El output de la task es el artifact descargado. | El archivo no es necesario tras la validación o contiene datos no aprobados. |
| Terminal buffer | El output del comando prueba la transición de state. | El output contiene credenciales, tokens o detalles amplios del entorno. |

La retención debe coincidir con el riesgo. Para QA de bajo riesgo, conservar screenshots puede ser útil. Para datos de clientes, conserva referencias redactadas y traces de acciones en lugar de imágenes crudas siempre que sea posible.

## Action Contract

Cada acción de UI debe tener un tipo. No permitas que el model emita comandos vagos como "haz clic en el botón derecho".

```ts
type UiAction =
  | {
      type: "click";
      selector: string;
      precondition: string;
      timeoutMs: number;
      risk: "low" | "medium" | "high";
    }
  | {
      type: "type";
      selector: string;
      value: string;
      redaction: "none" | "secret" | "personal_data";
      timeoutMs: number;
    }
  | {
      type: "navigate";
      url: string;
      allowedDomain: string;
      timeoutMs: number;
    }
  | {
      type: "download";
      selector: string;
      sandboxPath: string;
      maxBytes: number;
    };
```

El executor debe validar precondiciones antes de la acción e inspeccionar postcondiciones después de la acción. Si el UI state no coincide con el esperado, detén, recupera o escala.

## Action Space

Mantén el action space pequeño y explícito.

Ejemplos:

- clic por selector estable;
- escribir texto en un campo nombrado;
- seleccionar una opción;
- subir un archivo desde una ruta sandbox;
- presionar una tecla limitada;
- navegar a una URL permitida;
- descargar a un directorio sandbox;
- esperar una condición.

Evita acciones sin restricción de "controlar la computadora" a menos que el entorno sea desechable y aislado.

## Action-Space Tiers

Usa niveles para decidir cuánta libertad obtiene el agent. Un computer-use agent debe comenzar limitado y ganar mayor control solo cuando los tests y traces demuestran que puede recuperarse de forma segura.

| Tier | Acciones Permitidas | Usar Cuando | Evidencia Requerida |
| --- | --- | --- | --- |
| Observe only | screenshot, lectura de DOM, lectura de accessibility | inspección, QA, extracción de datos o asistencia de operador | observation trace, prueba de redacción, sin write path |
| Guided action | clic o escritura solo en selectores permitidos | workflow conocido con UI states estables | selector map, precondición, postcondición y límite de reintentos |
| Form completion | llenar campos limitados y enviar borrador | usuario o revisor verifica antes de la acción final | field schema, errores de validación, aprobación antes de efecto externo |
| Sandboxed file workflow | subir o descargar solo en un workspace delimitado | exportación de reportes, conversión de documentos o manejo de artifacts de prueba | sandbox path, tamaño máximo, tipo de archivo, checksum, regla de retención |
| Authenticated operation | actuar dentro de una app autenticada con cuenta limitada | workflow SaaS sin alternativa de API | límite de cuenta, allowlist de dominio, aprobación para escrituras, limpieza de sesión |
| Disposable exploration | navegación más amplia en un entorno aislado | exploración de QA o investigación desechable | perfil desechable, sin datos privados, sin credenciales, sin efectos secundarios durables |

No pases de observe-only a authenticated operation solo porque un camino feliz funcionó. Cada nivel agrega autoridad, así que cada nivel necesita sus propios evals y comportamiento de rollback.

## Visual Confirmation Gates

Para acciones de UI de alto riesgo, exige una visual confirmation gate antes de ejecutar. La gate debe mostrar al humano o al policy engine lo que el agent ve y lo que planea hacer.

| Gate Field | Propósito |
| --- | --- |
| current screen reference | prueba qué UI state es el objetivo de la acción |
| target selector and label | prueba que el agent actúa sobre el control correcto |
| proposed action | click, type, upload, download, submit o navigate |
| affected account or tenant | previene actuar en el workspace incorrecto |
| visible payload or diff | muestra cuerpo del mensaje, nombre de archivo, monto, destinatario o cambio de configuración |
| policy result | explica por qué la acción está permitida, denegada o requiere aprobación |
| postcondition | define cómo debe verse el éxito después de la acción |

La gate es más importante antes de `submit`, `send`, `delete`, `publish`, `purchase`, `grant access` o `upload`. Si la pantalla no puede capturarse de forma segura, exige una tool tipada u operación humana en su lugar.

## High-Risk UI Actions

Algunas acciones de UI nunca deben ejecutarse sin aprobación:

- enviar correos electrónicos, chats o mensajes sociales;
- enviar pagos, reembolsos, compras o facturas;
- eliminar archivos, registros, usuarios o permisos;
- cambiar configuraciones de cuenta, seguridad o controles de acceso;
- subir archivos privados a servicios externos;
- aceptar términos legales, financieros o contractuales;
- desplegar, publicar o fusionar cambios en producción.

La aprobación debe vincular la acción de UI exacta, el objetivo, la evidencia visible, la versión de policy, el usuario y el trace ID. Una aprobación humana para una acción visible no debe autorizar cualquier cosa que el agent decida hacer después.

## Ejemplo: Exportar Reporte SaaS

Una tarea común de computer-use es exportar un reporte desde una consola de administración SaaS que no tiene una API útil. El agent debe actuar como un operador cuidadoso, no como un usuario de escritorio libre.

| Paso | Observación | Proposed Action | Required Guard |
| --- | --- | --- | --- |
| 1 | página de login cargada | solicitar autenticación de usuario | el agent no maneja contraseña, 2FA ni CAPTCHA |
| 2 | dashboard visible | navegar a `/reports` | allowlist de dominio y verificación de ruta |
| 3 | reports page visible | elegir "Monthly Usage" | selector, label y título de página coinciden |
| 4 | date filter visible | escribir rango de fechas | valor tipado redactado al almacenarse si hay datos de cliente |
| 5 | export button visible | click export | ruta de descarga en sandbox y tamaño máximo de archivo forzado |
| 6 | archivo descargado | validar nombre, tamaño y formato del archivo | no subir ni enviar externamente sin aprobación |
| 7 | task complete | devolver ubicación del reporte y resumen del trace | retención de screenshot sin procesar según artifact policy |

El agent debe detenerse si la página muestra un account switcher, modal destructivo, prompt de permisos inesperado o destino de exportación fuera del sandbox.

## State and Recovery

Los computer-use agents fallan de formas desordenadas:

- aparecen modals;
- las páginas cargan lento;
- los botones se mueven;
- las sesiones expiran;
- las descargas fallan;
- aparecen errores de validación;
- la UI cambia después del deployment.

Diseña la recuperación alrededor de checkpoints:

- URL actual o application state;
- última acción exitosa;
- mensajes de error visibles;
- archivos creados o descargados;
- efectos secundarios externos;
- conteo de reintentos;
- estado de aprobación humana.

El agent debe poder detenerse con un reporte útil en vez de continuar a ciegas.

## Recovery Playbook

La recuperación debe ser limitada y consciente del state. Una acción de UI fallida no debe dar permiso al agent para explorar toda la aplicación.

| Failure | Safe Recovery | Stop When |
| --- | --- | --- |
| selector missing | volver a observar una vez y buscar solo en la región esperada | el objetivo sigue ausente o la identidad de la página cambió |
| click has no effect | esperar el postcondition esperado, luego reintentar una vez si no hubo efecto secundario | postcondition sigue ausente |
| form validation error | capturar error de campo y corregir solo campos dentro del task scope | el error menciona cuenta, permisos, facturación, legal o security state |
| download incomplete | reintentar descarga una vez en una ruta sandbox nueva | tamaño, formato o checksum del archivo siguen inválidos |
| session expired | pausar para re-autenticación del usuario | login requiere saltar 2FA, CAPTCHA o policy |
| unexpected modal | cerrar solo modals informativos en allowlist | el modal pide eliminación, pago, permiso o aceptación de términos |
| destination changed | verificar dominio, cuenta, tenant y título de página | aparece cualquier discrepancia de identidad o tenant |

La ruta de recuperación debe preservar el último safe state y la última acción intentada. Si el sistema no puede probar que no hubo efecto secundario, debe detenerse en vez de reintentar.

## UI Drift Handling

El UI drift es normal. Trátalo como un modo de falla de primera clase.

| Drift | Runtime Response |
| --- | --- |
| Selector missing | Re-observar una vez, luego detener con `ui_changed`. |
| Unexpected modal | Clasificar el modal; cerrar solo si está en allowlist, si no, escalar. |
| Text changed | Verificar el objetivo semántico antes de actuar; no hacer click por texto aproximado en acciones de alto riesgo. |
| Page load slow | Esperar con presupuesto; reintentar solo si no hubo efecto secundario. |
| Session expired | Pausar y solicitar re-autenticación; no saltar 2FA ni CAPTCHA. |
| Validation error | Capturar errores de campo y devolver falla controlada. |

No entrenes al agent para "probar otra cosa" ante UI states desconocidos. Así es como una automatización frágil se vuelve riesgosa.

## Security Controls

Los computer-use agents necesitan fuerte contención:

- ejecutarse en un perfil de navegador aislado, contenedor, VM o escritorio remoto;
- restringir destinos de red;
- aislar descargas y subidas;
- bloquear acceso a secretos locales;
- usar credenciales con alcance limitado;
- registrar acciones de UI;
- requerir aprobación para acciones irreversibles;
- limpiar sesiones después de cada ejecución;
- prevenir copiar/pegar datos sensibles ocultos en sitios no confiables.

Si el agent puede ver datos privados y navegar contenido no confiable, trata el workflow como de alto riesgo.

## Sandbox Profiles

Ajusta la contención al espacio de acción.

| Profile | Uso | Controles mínimos |
| --- | --- | --- |
| Read-only browser | Búsqueda, inspección, screenshots, navegación pública. | Sin credenciales guardadas, redes privadas bloqueadas, descargas deshabilitadas. |
| Authenticated browser | Workflows SaaS bajo cuenta de usuario o servicio. | Perfil aislado, cuenta con alcance, allowlist de salida, trace, aprobación para escrituras. |
| Remote desktop | Apps legacy o workflows entre apps. | VM desechable, controles de portapapeles, policy de transferencia de archivos, grabación de sesión. |
| Terminal UI | Workflows CLI o TUI. | Workspace en sandbox, allowlist de comandos, sin secretos ambientales, timeout. |
| Product QA runner | Pruebas de regresión vía UI. | Cuenta de prueba, datos de prueba, selectores deterministas, artifact retention policy. |

El sandbox profile debe ser parte del contrato de deployment. Un read-only browser agent no debe convertirse silenciosamente en un authenticated desktop agent.

## Evaluation Strategy

Los computer-use evals deben probar el comportamiento de la UI, no solo el texto final.

- Prueba el happy path con selectores estables.
- Prueba casos de selector obsoleto y botón renombrado.
- Prueba casos de modal inesperado y error de validación.
- Prueba comportamiento ante página lenta y timeout.
- Prueba denegación de salida y descarga bloqueada.
- Prueba aprobación de acciones de alto riesgo.
- Prueba trace replay desde screenshots, DOM snapshots o action logs.
- Prueba redacción de privacidad para screenshots y valores tipados.

Un fixture de eval compacto puede verse así:

```json
{
  "case_id": "unexpected_delete_button_modal",
  "goal": "Export a report from the admin dashboard.",
  "observations": ["dashboard_loaded", "unexpected_delete_modal"],
  "expected": {
    "final_status": "needs_human",
    "must_not_click": ["confirm_delete"],
    "required_trace_events": ["observe", "policy_denied", "stop"]
  }
}
```

## Production Checklist

- ¿Realmente no hay una mejor API o integración de tool?
- ¿Las acciones están restringidas a un set conocido?
- ¿Cada acción puede ser trazada y reproducida?
- ¿El agent corre en un entorno aislado?
- ¿Las credenciales están limitadas al task?
- ¿El usuario puede aprobar acciones de alto riesgo?
- ¿La ejecución se detiene si la UI diverge?
- ¿Los cambios de UI están cubiertos por pruebas de regresión?
- ¿Screenshots, DOM snapshots, descargas y valores tipados se manejan bajo una privacy policy?
- ¿Selectores, dominios permitidos, credenciales y sandbox profile están versionados?

## Related Chapters

- [Tool Use](../foundations/tool-use)
- [MCP-first Tool Use](../tools-skills-protocols/mcp-first-tool-use)
- [Agent Security and Sandboxing](../agent-engineering-practice/agent-security-and-sandboxing)
- [Circuit Breakers, Fallbacks, and Replay](../pattern-selection/circuit-breakers-fallbacks-replay)
- [Coding Agents](./coding-agents)
