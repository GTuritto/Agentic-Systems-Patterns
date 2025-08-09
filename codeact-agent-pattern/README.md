# CodeAct Agent Pattern

Small think -> act loop that plans tiny JS snippets, runs them in a Node vm sandbox, and iterates with observations.


Run (TypeScript):

- Provide a preplanned snippet to avoid network: `npm run codeact:ts -- --plan-code='result = (1+2+3+4)/4'`

Run (Python):

- `npm run codeact:py` (runs a safe default snippet or pass code via env `CODE_SNIPPET`)
