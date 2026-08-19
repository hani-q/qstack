---
name: qstack-prove-it-works
description: >
  Verify completed work against the real artifact and its full input-to-output
  path instead of relying on compilation, timestamps, cached output, or agent
  summaries. Use before claiming a task or feature works.
license: MIT
---

# Prove it works

For every completion claim, identify the direct observation that would make it
true. Verification does not authorize remediation, deployment, external
messages, unsafe live mutations, commits, pushes, or publishing.

## Prove the real path

1. State the exact claim and the artifact that owns the truth.
2. Validate the observation method. When a check disagrees with the system,
   inspect stale caches, derived views, and faulty probes before choosing which
   result to trust.
3. Build or validate static structure when relevant, but treat that as a
   prerequisite rather than proof of runtime behavior.
4. Run the actual artifact and exercise the feature from input through every
   boundary to its output. For integrations, test the complete communication
   path in a safe environment.
5. Read actual values and artifacts. Check process liveness directly. Inspect
   delegated diffs, files, and runtime results instead of accepting summaries.
6. Script complex or repeatable comparisons when that makes the evidence
   deterministic. Keep temporary proof local unless a durable artifact was
   requested.

Report each claim, check, observed evidence, and result. Mark any segment that
requires unavailable infrastructure or additional authority as **UNPROVEN**;
do not substitute a proxy. During approved planned work, record durable evidence
in the existing QStack `execution.md` and create no second audit format.

Adapted from Lauren Tan's PStack
[`principle-prove-it-works`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/principle-prove-it-works/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
