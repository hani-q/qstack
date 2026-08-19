---
name: qstack-separate-before-serializing-shared-state
description: >
  Redesign concurrent work that shares a mutable file, branch, key, or state
  object by separating ownership before adding serialization. Use when actors
  may race, a lock is proposed, or coordination relies on taking turns.
license: MIT
---

# Separate before serializing shared state

Instructions and conventions are not concurrency control. Start by removing
the shared write target. Add serialization only when one canonical writer is a
real domain invariant.

## Decide from ownership

1. Inventory every mutable object and every actor that can write it. Include
   files, branches, database rows, keys, caches, queues, and in-memory state.
2. Ask whether the actors publish independent facts. If they do, give each
   actor its own file, key, branch, or state directory and merge only at a
   read-only reporting boundary.
3. Confirm that the split removes shared mutation. Two workers writing separate
   fields of one JSON document still share a write target; separate documents
   with one owner each do not.
4. If one shared object is required, choose structural serialization: a
   single-writer actor, sequential phases, a lockfile with defined stale-lock
   behavior, an atomic transaction, or compare-and-swap.
5. Prove the design under overlap, retry, crash, and stale-state scenarios.

Report the ownership map, the sharing that can be removed, any invariant that
requires serialization, and the concrete mechanism enforcing it. A request for
analysis does not authorize changing the system. Assess compatibility and
migration before changing a persisted format, public interface, or branch
workflow. It also does not authorize commits, pushes, publishing, deployment,
or external messages.

Adapted from Lauren Tan's PStack
[`principle-separate-before-serializing-shared-state`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-separate-before-serializing-shared-state/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
