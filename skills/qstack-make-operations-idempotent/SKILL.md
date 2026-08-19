---
name: qstack-make-operations-idempotent
description: >
  Design or review commands, lifecycle steps, and processing loops so retries,
  partial failure, restart, and stale state converge to the same correct result.
  Use when an operation may run twice or resume after a crash.
license: MIT
---

# Make operations idempotent

An idempotent operation converges from any state a previous attempt could have
left behind. A duplicate request that merely happens not to fail is not enough.

## Test convergence

1. List every durable mutation and external side effect in execution order.
2. Model two consecutive runs from the completed state. When verification is
   authorized in a safe environment, run both and compare the real end state,
   not only the exit code.
3. Model a crash after every mutation point and the rerun from each partial
   state. Fault-inject only under the verification authority described below.
4. Include stale locks, abandoned temporary files, live sessions, regenerated
   input, reordered records, and content-equivalent artifacts where relevant.
5. Add reconciliation before mutation whenever leftover state changes the next
   run's result. Prefer adoption, content comparison, atomic replacement,
   single ownership, and stale-owner detection over creation-order guesses.
6. Prove repeated and resumed runs satisfy the same domain invariants. Generated
   identifiers or timestamps need not be byte-identical unless the domain
   requires that.

Report the mutation map, failure points tested, stale-state policy, convergence
proof, and any unresolved case. Never clear or overwrite user data merely to
make a retry pass without explicit authority for that destructive behavior.
Before reclaiming a lock or live session, prove ownership and liveness.

A design or review request is analysis-only: it does not authorize executing a
mutating operation, injecting a crash, creating a disposable environment, or
causing external side effects. Run repeated or partial-failure tests only when
the request authorizes verification and the environment is disposable and
safe. Live or external effects such as charges, messages, database writes, or
process interruption require explicit authority for those exact effects. When
direct proof would exceed that authority, report the case as **UNPROVEN**.
Analysis alone also does not authorize edits, commits, pushes, publishing,
deployment, or external messages.

Adapted from Lauren Tan's PStack
[`principle-make-operations-idempotent`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-make-operations-idempotent/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
