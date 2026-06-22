---
title: CrewAI Flows and Crews
---

# CrewAI Flows and Crews

CrewAI Flows poseen el state y el orden de ejecución. Las Crews agrupan agents especializados que colaboran en trabajo delegado dentro del flow.

> Fuente y descargas
>
> - [Repository source](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/crewai-flows-and-crews-pattern)
> - [Download code bundle](/downloads/crewai-flows-and-crews.zip)

## Propósito

El patrón CrewAI Flows and Crews separa el control del workflow de producción del trabajo colaborativo de agents. Los Flows poseen el state y el orden de ejecución; las Crews agrupan agents especializados que realizan tasks delegadas dentro del flow.

## Úsalo cuando

- Estás construyendo automatizaciones de agents con enfoque en Python.
- El sistema necesita control de flujo explícito basado en state y eventos.
- Varios agents especialistas deben colaborar en tasks acotadas.

## Evita cuando

- Un solo paso determinista en el workflow es suficiente.
- Los agents tienen roles poco claros o responsabilidades superpuestas.
- No puedes definir dónde inicia el flow state y termina el crew-local context.

## Arquitectura

Usa este diagrama para entender CrewAI Flows and Crews como un límite de sistema, no solo una forma de código. La pregunta clave de propiedad es: el coordinador posee el goal compartido, la descomposición, las asignaciones, la merge policy y la aceptación final.

![CrewAI flows and crews architecture](../public/diagrams/crewai-flows-crews.svg)

## Forma del sistema

- **Flow boundary:** el Flow posee state durable, orden, ramificación, checkpoints, aceptación y output final.
- **Crew boundary:** una Crew realiza trabajo especializado acotado dentro de un paso del Flow y retorna structured outputs.
- **Agent boundary:** cada agent tiene un rol, goal, tools, permisos y una forma de output esperada que difiere de los otros roles.
- **Policy boundary:** el Flow verifica autoridad antes del inicio de la crew, uso de tools, escrituras en memory y aceptación final.
- **Evaluation boundary:** las transiciones de flow state y los outputs de la crew se prueban por separado, luego juntos como una sola trayectoria.
- **Operational boundary:** los traces registran eventos del flow, inicio de crew, outputs de roles, validación, aceptación, rechazo y escalamiento.

## Protocolo central

1. Acepta un evento o solicitud con actor, tenant, goal, versión de release y clave de idempotencia.
2. Inicializa el Flow state y decide si el trabajo necesita una Crew o una función determinista.
3. Crea tasks con inputs delimitados, outputs esperados, tools permitidos y criterios de aceptación.
4. Ejecuta la Crew y recopila outputs de roles, errores, rechazos y evidencia.
5. Valida cada output de rol antes de que pueda modificar el Flow state.
6. Permite que el Flow acepte, rechace, reintente, escale o solicite revisión humana.
7. Emite eventos de trace para pasos del flow, inicio de crew, outputs de roles, decisiones de policy y aceptación final.
8. Convierte outputs rechazados, desacuerdos de roles e incidentes en fixtures de eval.

## Notas de implementación

- Permite que los flows gestionen el state, ramificación, persistencia y orden de ejecución.
- Asigna a cada crew una task acotada con output esperado claro.
- Da a cada agent un rol que cambie su comportamiento, no solo un nombre diferente.
- Prueba las transiciones de flow state por separado de la calidad del output de la crew.
- Prefiere lógica determinista en el Flow para orden, reintento, checkpointing, aprobación y rollback.
- Evita que la conversación crew-local se convierta en la única fuente de verdad para el workflow state.
- Valida los outputs de roles con schemas o funciones de aceptación explícitas antes de usarlos.
- Registra por qué el Flow aceptó o rechazó el resultado de la Crew.

## Modos de falla

- Crews usadas como sustituto del diseño de workflow.
- Demasiados agents con roles vagos.
- Flow state modificado implícitamente a través del historial de chat.
- Sin evaluator para verificar si el resultado de la crew satisface el paso del flow.
- Outputs de roles aceptados sin schema, evidencia o verificaciones de policy.
- Fallo de la Crew oculto como una respuesta final débil en vez de un failed state tipado.
- Falta de escalamiento humano para outputs ambiguos, de alto riesgo o conflictivos.

## Estrategia de evaluación

- Prueba transiciones del Flow con fixtures deterministas antes de involucrar el comportamiento de la Crew.
- Prueba la forma esperada del output de cada rol, permisos de tools y comportamiento de rechazo.
- Prueba desacuerdo entre workers, falta de evidencia, timeout de tools y output de Crew rechazado.
- Compara el output de la Crew contra una baseline de single-agent o determinista para demostrar que la Crew agrega valor.
- Libera versiones solo si la calidad de la respuesta final y la trayectoria es suficiente: comportamiento de roles, decisiones de policy y aceptación del Flow.

## Lista de verificación para producción

- Documenta comandos de instalación, ejecución local, pruebas, eval y limpieza.
- Define el Flow state, estrategia de checkpoints, permisos de roles y schemas de tasks.
- Valida los outputs de la Crew antes de que modifiquen el Flow state o generen output visible al usuario.
- Exporta traces redactados de flow, task, rol, policy y evaluator.
- Agrega evals para output aceptado, output rechazado, desacuerdo de roles, fallo de tools y escalamiento.
- Define rollback para deshabilitar un rol, un tool, una ruta de Flow o toda la ruta de la Crew.

## Ejecuta el ejemplo

```sh
npm run crewai-flow
npm run crewai-flow:test
```

## Recorrido del código

Lee el extracto como la expresión ejecutable más pequeña del pattern. El capítulo explica las restricciones de diseño; el código muestra dónde esas restricciones se convierten en interfaces concretas, state, validación o control de flujo.

## Código fuente

Estos extractos muestran la forma de la implementación. El código completo está disponible en el bundle de descarga y en el repository source.

### `crewai-flows-and-crews-pattern/python/flow_crew.py`

[Open full source](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/crewai-flows-and-crews-pattern/python/flow_crew.py)

```py
from dataclasses import dataclass, field
from typing import Callable

@dataclass
class Agent:
    role: str
    goal: str
    run: Callable[[str], str]

@dataclass
class Task:
    name: str
    agent_role: str
    input: str

@dataclass
class Crew:
    name: str
    agents: dict[str, Agent]

    def kickoff(self, tasks: list[Task]) -> dict[str, str]:
        outputs: dict[str, str] = {}
        for task in tasks:
            agent = self.agents[task.agent_role]
            outputs[task.name] = agent.run(task.input)
        return outputs

@dataclass
class FlowState:
    goal: str
    accepted: bool = False
    crew_outputs: dict[str, str] = field(default_factory=dict)
    trace: list[str] = field(default_factory=list)
    final: str | None = None

def build_research_crew() -> Crew:
    return Crew(
        name="support_research_crew",
        agents={
            "researcher": Agent(
                role="researcher",
                goal="Find policy facts relevant to the task.",
                run=lambda task_input: f"policy evidence for {task_input}: refund window is 30 days",
            ),
            "writer": Agent(
                role="writer",
                goal="Turn evidence into a concise draft.",
                run=lambda task_input: f"draft based on {task_input}: offer review, do not promise payment",
            ),
        },
    )

def run_support_flow(goal: str, crew: Crew | None = None) -> FlowState:
    state = FlowState(goal=goal)
    active_crew = crew or build_research_crew()

    state.trace.append("flow:start")
    tasks = [
        Task(name="evidence", agent_role="researcher", input=goal),
        Task(name="draft", agent_role="writer", input="policy evidence"),
    ]
    state.trace.append("flow:crew_kickoff")
    state.crew_outputs = active_crew.kickoff(tasks)

    evidence = state.crew_outputs["evidence"]
    draft = state.crew_outputs["draft"]
    state.trace.append("flow:evaluate")

    state.accepted = "30 days" in evidence and "do not promise payment" in draft
    if state.accepted:
        state.final = "Crew output accepted by the flow."
        state.trace.append("flow:accepted")
    else:
        state.final = "Crew output rejected by the flow."
        state.trace.append("flow:rejected")

    return state

def evaluate_flow(state: FlowState) -> dict[str, object]:
    reasons: list[str] = []
    if not state.accepted:
        reasons.append("flow did not accept crew output")
    if "evidence" not in state.crew_outputs:
```

_Extracto truncado para facilitar la lectura. Descarga el bundle o abre el archivo fuente para la implementación completa._

### `crewai-flows-and-crews-pattern/python/test_flow_crew.py`

[Abrir el código fuente completo](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/crewai-flows-and-crews-pattern/python/test_flow_crew.py)

```py
from flow_crew import Agent, Crew, evaluate_flow, run_support_flow

def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)

state = run_support_flow("Prepare a refund response")
evaluation = evaluate_flow(state)

assert_true(state.accepted, "Expected flow to accept crew output")
assert_true(state.crew_outputs["evidence"].startswith("policy evidence"), "Expected researcher output")
assert_true("do not promise payment" in state.crew_outputs["draft"], "Expected constrained writer output")
assert_true(state.trace == ["flow:start", "flow:crew_kickoff", "flow:evaluate", "flow:accepted"], "Expected deterministic flow trace")
assert_true(evaluation["status"] == "pass", "Expected flow evaluation to pass")

bad_crew = Crew(
    name="unsafe_support_research_crew",
    agents={
        "researcher": Agent(
            role="researcher",
            goal="Find policy facts relevant to the task.",
            run=lambda task_input: f"policy evidence for {task_input}: refund window is 30 days",
        ),
        "writer": Agent(
            role="writer",
            goal="Turn evidence into a concise draft.",
            run=lambda task_input: f"draft based on {task_input}: promise payment now",
        ),
    },
)

rejected_state = run_support_flow("Prepare a refund response", crew=bad_crew)
rejected_evaluation = evaluate_flow(rejected_state)

assert_true(not rejected_state.accepted, "Expected flow to reject unsafe writer output")
assert_true(rejected_state.final == "Crew output rejected by the flow.", "Expected rejected final state")
assert_true(rejected_state.trace[-1] == "flow:rejected", "Expected rejection trace")
assert_true(rejected_evaluation["status"] == "fail", "Expected rejected flow evaluation to fail")
assert_true(
    "flow did not accept crew output" in rejected_evaluation["reasons"],
    "Expected rejection reason",
)

print("CrewAI-style flow and crew tests OK")
```

## Descarga

- [Descargar paquete fuente](/downloads/crewai-flows-and-crews.zip)
- [Abrir carpeta fuente](https://github.com/GTuritto/Agentic-Systems-Patterns/tree/main/crewai-flows-and-crews-pattern)

El paquete de descarga contiene la carpeta `crewai-flows-and-crews-pattern/` actual de este repositorio.

## Patrones relacionados

- [Task Delegation](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/task-delegation-pattern/README.md)
- [Consensus-Seeking Multi-Agent System](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/consensus-seeking-multi-agent-system-pattern/README.md)
- [Durable Workflow](https://github.com/GTuritto/Agentic-Systems-Patterns/blob/main/durable-workflow-pattern/README.md)
