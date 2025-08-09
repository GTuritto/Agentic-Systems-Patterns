# Planning Pattern

TypeScript and Python examples of a simple Planner + Executor.


- Planner: turns a goal into ordered steps (Mistral HTTP if key set; deterministic fallback otherwise)
- Executor: runs steps with progress callbacks


How to run (TS):

- Plan + execute demo: `npm run plan:run -- "Compute average of [1,2,3,4]"`
- Test: `ts-node --esm ./planning-pattern/typescript/test/planning.spec.ts`


Python:

- `npm run plan:py` (uses deterministic fallback without API key)
