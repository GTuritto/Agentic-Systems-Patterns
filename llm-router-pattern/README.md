# LLM Router Pattern

Routes each user task to the most suitable specialist agent using:

- Classifier routing (Mistral HTTP, structured JSON output)
- Embedding routing (semantic similarity to exemplars)
- Hybrid policies (budget- and latency-aware) with fallback to next best

```mermaid
flowchart LR
  U[User Input] --> R[Router (Classifier + Embedding)]
  R -->|billing| B[Billing Agent]
  R -->|tech| T[Tech Support Agent]
  R -->|sales| S[Sales Agent]
  B -.fallback.-> T
  T -.fallback.-> S
```

## How to run (TypeScript)

- Router demo:
  - `npm run router:run -- "I need a refund for a wrong charge on my invoice."`
- Tests:
  - `npm run router:test`

Environment:

- Optional `MISTRAL_API_KEY` in `.env` for live classifier routing. Without it, a heuristic fallback is used.

Variants:

- Classifier-only vs Embedding-only vs Hybrid (default). See comments in `router_strategies.ts`.
- Policies: set `FAST=true` or `BUDGET=low|std|high` env vars.
