# Native CrewAI Delivery Example

This example maps the Multi-Agent Delivery Workflow capstone into CrewAI concepts: `Agent`, `Task`, `Crew`, and `Flow`. It is the native counterpart to the deterministic Lab 08 flow-and-crew implementation.

Download bundle: [native-crewai-delivery.zip](/downloads/native-crewai-delivery.zip)

It demonstrates:

- a Flow-owned state boundary;
- a Crew for specialist work;
- planner, reviewer, and test planner role contracts;
- final acceptance owned by the Flow;
- a simple eval over role outputs.

## Setup

Official references:

- [CrewAI installation](https://docs.crewai.com/en/installation)
- [CrewAI agents](https://docs.crewai.com/en/concepts/agents)
- [CrewAI crews](https://docs.crewai.com/en/concepts/crews)
- [CrewAI flows](https://docs.crewai.com/en/concepts/flows)
- [CrewAI tasks](https://docs.crewai.com/en/concepts/tasks)

```sh
cd native-framework-examples/crewai-delivery
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

CrewAI agents normally require model provider configuration. Set the provider variables required by your CrewAI setup before running. Keep those values in environment variables; do not commit them to the repository.

## Run

```sh
python delivery_flow.py
```

This command requires the optional CrewAI dependencies from this folder's `requirements.txt` and the model provider environment expected by your CrewAI setup.

## Validate The Slice

From the repository root:

```sh
npm run native-examples:validate
```

The root validation checks Python syntax without installing optional CrewAI dependencies. A full native run still requires the setup above.

## Expected Behavior

1. the Flow starts from a delivery request;
2. the Crew produces planner, risk, and test outputs;
3. the Flow evaluates the outputs before final acceptance.

## Modify This Next

Make one focused change before moving to production design:

1. remove the risk reviewer output from the Crew result;
2. add or update the Flow eval so acceptance fails;
3. restore the role output and rerun the validation.

This change teaches the main CrewAI boundary: Crew completion is not enough; the Flow must prove each required role produced usable output.

## Production Notes

Keep Flow state separate from Crew-local conversation. Add role-specific tool permissions, trace export, and transcript evals before production.

Do not accept the final crew output just because the crew completed. The Flow should validate planner, reviewer, and tester outputs separately before setting final acceptance.
