---
name: qstack-model-the-domain
description: Replace scattered domain assumptions with the smallest structure that removes invalid states and branching.
disable-model-invocation: true
license: MIT
---

# Model the domain

Encode the real domain in a structure instead of distributing it across
booleans, conditionals, loose parameters, and lifecycle checks.

## Find the missing shape

1. Trace the states, transitions, invariants, ownership, and dominant access
   paths in the current code.
2. Locate repeated shape assumptions, synchronized booleans, growing branches,
   ad hoc mutation, and phase-named modules that repeat the same domain rules.
3. Choose the smallest structure that removes those problems. Candidates
   include a state machine, typed model, discriminated union, registry, lookup
   table, reducer, command/event model, queue, cache, index, graph, normalized
   collection, or one module that owns a coherent body of domain knowledge.
4. Compare the proposed shape with the current one. It must delete branches,
   duplicated rules, invalid states, or lifecycle risk. Extra indirection alone
   is not a benefit.
5. Leave clear, local, stable code alone when no structure materially improves
   it. Three explicit statements can be better than a premature abstraction.

State the invariant the model enforces, the access patterns it serves, the
invalid states it removes, and the migration boundary. Design work does not
authorize implementation beyond the user's request. Assess compatibility and
migration before changing a public API or persisted shape. Design alone does
not authorize commits, pushes, publishing, deployment, or external messages.

Adapted from Lauren Tan's PStack
[`principle-model-the-domain`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-model-the-domain/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
