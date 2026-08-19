---
name: qstack-blast-radius
description: >
  Assess what a proposed or recent change could break beyond its direct diff,
  identify the critical safety fact, and prove it with real code or mark it
  unproven. Use for blast-radius analysis, "what could this break?", or a small
  change whose downstream effects are uncertain.
license: MIT
---

# QStack blast radius

Find the breakage that a symbol search or diff review would miss. The result is
analysis, not permission to edit, commit, push, publish, deploy, or message
anyone.

## Trace the risk

1. Resolve the exact change from the user's files, diff, branch, or recent work.
   Read the surrounding implementation and repository instructions.
2. State the one critical fact the change is safe because of. Use a second fact
   only when the safety case truly has two independent hinges.
3. Follow effects beyond direct callers. Check pinned dependency source and
   local patches, lifecycle timing, persisted data, wire formats, other
   languages reading the same bytes, feature flags, generated artifacts, and
   downstream consumers. Cite real paths and lines. A search with no matches is
   evidence when its scope is stated.
4. Separate confirmed risks from cleared risks. For each confirmed risk, name
   the failure path, likelihood, impact, and cheapest decisive check.

## Prove the critical fact

Push each safety fact as far down this ladder as is practical:

1. A claim only.
2. Direct source evidence at a real path and line.
3. A traced bad case that cannot reach the failure.
4. A script or test that executes the real shipped code and fails loudly when
   the fact is false.
5. A reproduction in the running artifact.

Anything below level 4 remains **unproven**. Say where proof stopped. Do not
round a plausible writeup up to a verified conclusion. For analysis-only work,
use existing tests or inline, read-only probes. Creating even a temporary proof
file requires write authorization. If direct proof is not authorized, keep the
fact unproven. Do not mutate production or exercise a destructive path merely
to reach a higher proof level.

## Report

- What changed, including behavior the diff does not make obvious.
- The critical safety fact, its proof level, and the observed evidence.
- Confirmed risks, ordered by likely cost.
- Cleared risks and the evidence that cleared them.
- The cheapest pre-merge check that catches the meaningful failure.

When an approved QStack execution loop is already active, put durable evidence
in its existing `execution.md` as that loop permits. Create no competing record.
Remove private data before sharing any evidence outside its authorized scope.

Adapted from Lauren Tan's PStack
[`blast-radius`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/blast-radius/SKILL.md)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d` under the MIT License.
See [third-party notices](../../THIRD_PARTY_NOTICES.md).
