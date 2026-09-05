---
name: qstack-fix-root-causes
description: >
  Reproduce and diagnose a failure until its root cause is supported by direct
  evidence, or trace a constraint presented as fixed down to what actually
  fixes it. Use for debugging, recurring symptoms, restart-only failures, a
  proposed guard that may only hide the real defect, or a claim that something
  is impossible, too expensive, or has always been done this way.
license: MIT
---

# Fix root causes

Diagnosis precedes remediation. A request to diagnose is read-only and does not
authorize implementing a fix, adding instrumentation, clearing state, or
changing every related instance. It also does not authorize commits, pushes,
publishing, deployment, or external messages.

## Diagnose a failure

1. Reproduce the symptom with the smallest faithful path. If it cannot be
   reproduced, state that limitation and keep the eventual fix unverified.
2. Gather the actual error, state, inputs, and timing. Use existing logs and
   observability first; instrument only when the request authorizes that edit.
3. Follow the causal chain by repeatedly asking why each observed condition
   exists. Stop at the layer whose behavior explains the full reproduction.
4. Reject symptom patches such as a nil guard that merely silences a crash or a
   long comment defending a workaround.
5. Search for the same causal pattern across the relevant codebase. Report
   out-of-scope instances, but modify only the authorized scope.
6. For failures that appear only after restart, inspect changing persistent
   state before unchanged code: configuration, caches, lockfiles, serialized
   state, and abandoned temporary artifacts. Clearing state can support a
   diagnosis; it is not itself a durable fix.

Report the reproduction, evidence, causal chain, root cause, pattern scan,
proposed repair, and verification path. Implement only when the user's request
includes fixing the problem.

## Trace a constraint

A cost, an estimate, a limit, or "we always do it this way" is a claim with a
source, not a fact to plan around. Follow its causal chain the same way.

1. Quote the constraint as stated and name its source: a person, a ticket, a
   vendor quote, a past plan, or a measurement. "The ticket says so" locates
   the source; it is not the evidence.
2. Break the constraint into the parts that produce it. Stop one or two levels
   below the claim, where the verdict stops changing.
3. Tag each part. Fixed: physics, math, or a measured limit, with the evidence
   cited. Priced: a contract, regulation, or policy that can change, with its
   change cost named. Inherited: a habit, an old estimate, or an analogy to a
   past project, with nothing behind it.
4. Compute the floor from the fixed parts alone, using the few parts that
   dominate it. Say what the gap between the floor and the claim is made of
   and whether it is removable.

Report the constraint, its source, each part with its tag and evidence, the
floor, the gap, and the cheapest test that would settle it. Inside a plan, an
inherited constraint becomes an open question, never a requirement.

Adapted from Lauren Tan's PStack
[`principle-fix-root-causes`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-fix-root-causes/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md). The constraint
section follows the method in Farnam Street's
[What is First Principles Thinking?](https://fs.blog/first-principles/).
