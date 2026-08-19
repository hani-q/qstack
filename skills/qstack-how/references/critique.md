# Architecture critique

Use this reference only when the user explicitly asks for architectural issues,
problems, or improvements. Finish the evidence-backed explanation first.

Read the relevant implementation again with a skeptical eye. Find architectural
problems, not line-level bugs or style preferences. An empty critique is valid.

## Lenses

- **Abstraction fit:** Does each boundary represent a real concept and separate
  things that change independently? Flag indirection that removes no complexity.
- **Data model:** Does the shape match real access patterns and runtime values?
  Look for constant reshaping, dishonest types, or invalid states.
- **Boundary discipline:** Are validation, errors, and external data handled at
  clear entry points? Can the core be tested without the whole system?
- **Likely evolution:** Test only plausible next changes indicated by the
  codebase. Do not penalize missing speculative capabilities.
- **Complexity and value:** Is complexity concentrated in real invariants, or
  in boilerplate, duplicated coordination, and configuration?
- **Consistency:** Compare similar local subsystems. Different can be correct,
  but unexplained difference costs maintenance.

## Findings

For each finding, provide severity, components, the architectural problem,
concrete code evidence, and practical impact. Use:

- `structural` for a wrong boundary or model that blocks safe change;
- `concern` for a real maintainability or reasoning cost;
- `observation` for a tradeoff worth watching.

Finish with lead judgment: **Act on**, **Consider**, **Noted**, or **Dismissed**.
Do not suggest a rewrite without proving a problem in the current design, and
do not implement any recommendation.
