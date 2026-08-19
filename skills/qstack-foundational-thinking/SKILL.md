---
name: qstack-foundational-thinking
description: Settle data shape, access, ownership, concurrency, and useful shared setup before writing feature logic.
disable-model-invocation: true
license: MIT
---

# Foundational thinking

Make the early structural choices that keep later work simple without deciding
more than the current requirements justify.

## Sequence the foundation

1. Subtract obsolete paths, redundant checks, and unused placeholders first.
2. Define the core data shape and invariants. Trace every important access path
   and choose structures that fit the dominant reads and writes.
3. Assign ownership. Before sharing mutable state, ask what happens when another
   actor changes it concurrently. Isolate it unless the answer is "nothing."
4. Add setup first only when every later phase benefits from it. CI, linting,
   test infrastructure, and shared types can be foundations; speculative
   frameworks are not.
5. Sequence tests before fixes and reusable setup before the features that need
   it. When commits are authorized, keep each one coherent and single-purpose.
6. Keep code-level decisions simple. Converge types and data models, but allow a
   few explicit repeated statements when an abstraction would add indirection.
7. Make each increment land or deepen one coherent domain boundary instead of
   spreading special-case coordination through callers.

Report the proposed data shape, access paths, ownership, concurrency boundary,
useful setup, and decisions intentionally deferred. Invocation authorizes only
the design or implementation scope the user requested, and never authorizes a
commit, push, publication, deployment, or external message by itself.

Adapted from Lauren Tan's PStack
[`principle-foundational-thinking`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-foundational-thinking/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
