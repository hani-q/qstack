---
name: qstack-how
description: >
  Explain how a subsystem works by tracing its real runtime flow, ownership,
  boundaries, and files. Use for code walkthroughs, onboarding explanations,
  placement or layering questions, and explicitly requested architecture critique.
license: MIT
---

# QStack how

Build a working mental model from the code. This skill is read-only. It does
not edit files, fix critique findings, commit, push, publish, deploy, or message
anyone.

## Choose the mode

- **Explain** is the default. Answer how the system works and where behavior
  lives.
- **Critique** runs only when the user asks for architectural problems or
  improvements. Explain the system first, then critique it.

This skill explains mechanism, placement, and ownership. Label inferred
motivation as inference instead of presenting it as historical fact.

## Investigate

1. Resolve the subject and scope. For harmless ambiguity, state a reasonable
   interpretation and proceed. Ask only when different interpretations would
   materially change the answer.
2. Search for the entry point and read the implementation. Trace callers,
   callees, state changes, data transformations, types, and boundaries until
   the path from trigger to effect has no hand-waved step.
3. Check repository instructions, configuration, generated code, tests, and
   external boundaries that change the flow. Do not infer behavior from names.
4. Record exact paths, symbols, and lines. State any path that could not be
   traced.

Handle a narrow question directly. For a cross-cutting subsystem, read
[complex exploration](references/exploration.md). When the answer needs a full
onboarding narrative, read [structured explanation](references/explanation.md).

## Present

Lead with the direct answer. Then include only the concepts, flow, file map, and
gotchas needed to make it understandable. Use a diagram when it materially
clarifies several components or state transitions.

For Critique mode, read [architecture critique](references/critique.md) only
after the explanation is grounded in the code. Report findings and tradeoffs;
do not apply fixes.

Adapted from Lauren Tan's PStack
[`how`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/how/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
