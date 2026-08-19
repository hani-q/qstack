---
name: qstack-fix-root-causes
description: >
  Reproduce and diagnose a failure until its root cause is supported by direct
  evidence. Use for debugging, recurring symptoms, restart-only failures, or a
  proposed guard that may only hide the real defect.
license: MIT
---

# Fix root causes

Diagnosis precedes remediation. A request to diagnose is read-only and does not
authorize implementing a fix, adding instrumentation, clearing state, or
changing every related instance. It also does not authorize commits, pushes,
publishing, deployment, or external messages.

## Diagnose

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

Adapted from Lauren Tan's PStack
[`principle-fix-root-causes`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-fix-root-causes/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
