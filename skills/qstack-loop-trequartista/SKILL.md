---
name: qstack-loop-trequartista
description: >
  Execute an approved implementation plan with documented adaptations, QStack
  execution evidence, and independent adversarial review.
disable-model-invocation: true
---

# /qstack-loop-trequartista

Treat the plan as the shape of play, not a cage. Preserve its intent while
making careful, visible adaptations when reality offers a better route.

## Resolve the plan

1. Use the supplied plan path when present.
2. Otherwise use a plan clearly referenced in the conversation.
3. Otherwise inspect `qstack/compound_engineering/plans/*/plan.html`, plus
   legacy `compound-engineering/plans/*/plan.html` and `plan.md` files. Use the
   only plausible candidate; ask if more than one is plausible or none exists.
   Never select `.template/`.

Resolve the repository root, read its instruction files, then read the whole
plan. Do not edit the plan: it is frozen once execution begins.

Verify approval before implementation. An explicit request to execute this
specific plan counts as approval to start only when the plan itself is not
marked `draft`, `proposed`, or otherwise unapproved and has no unresolved
blocking gate. If approval is absent or contradictory, stop and ask.

## Start the execution record

Create or resume `execution.md` beside the plan before changing implementation
files. Never overwrite prior notes. Resume only when its mode is `trequartista`.
If another mode is recorded, stop and require explicit approval to transition;
record the approved transition before continuing. If its status is `complete`,
require explicit approval to reopen it. If it is `blocked`, resume only after
every blocking item is resolved. Record either status transition. Use this shape:

```markdown
# Execution

- Plan: <repo-relative path>
- Mode: trequartista
- Status: in-progress | blocked | complete
- Started: YYYY-MM-DD
- Updated: YYYY-MM-DD

## Progress
- [ ] <plan task or acceptance condition>

## Design decisions
- <choices made where the plan was silent or ambiguous>

## Deviations
- <what changed from the plan, why, impact, and whether approval was required>

## Tradeoffs
- <alternatives considered and why one was chosen>

## Open questions
- [blocking | non-blocking] <question>

## Validation
- <command or check>: <result>

## Adversarial reviews
- <round, reviewer findings, and resolution>
```

Update it when a decision is made, not from memory at the end. Record facts the
user should know, not routine narration or private reasoning. Mark replaced
entries as superseded rather than deleting history.

## Adapt without losing the plan

You may make a deviation without interrupting the user only when it is:

- small and reversible;
- consistent with the plan's stated intent and acceptance criteria;
- invisible to users or an obvious correction of an implementation detail;
- no riskier than the planned approach; and
- recorded in `execution.md` when the decision is made.

Before making a material deviation, stop and ask one focused question. State
what the plan says, what you learned, the recommended change, and the main
alternative. Material deviations include changes to scope, user-visible
behavior, acceptance criteria, architecture, public APIs, data formats,
dependencies, security, privacy, cost, timeline, or irreversible work. If
unsure whether a deviation is material, treat it as material.

Record approved changes as approved deviations. Do not rewrite the frozen plan.

## Execute and orchestrate

Break the plan into trackable tasks and keep their status current. Delegate
bounded independent work when agent tools are available, but inspect and
integrate every result yourself. Preserve unrelated user changes.

Implement the full plan, update `execution.md` continuously, and validate in
proportion to risk. Run the repository's relevant tests, linters, type checks,
builds, and focused behavioral checks. Do not commit or push unless the user
explicitly asks.

## Run the adversarial review loop

After implementation and primary validation, launch a **fresh independent
agent** to review the current work. A self-review does not satisfy this gate.

Give the reviewer raw evidence rather than your conclusions:

- repository root and plan path;
- `execution.md` path;
- the base reference and complete current diff, including untracked files;
- validation commands already run.

Ask the reviewer to read the plan and inspect the actual implementation without
editing files. It must look for missing requirements, material unapproved or
undocumented deviations, incorrect behavior, regressions, unsafe assumptions,
weak tests, and inaccurate or incomplete execution notes. Require findings to
include severity, evidence, and a concrete remedy; require an explicit statement
when no blocking findings remain.

Before each review, record a content fingerprint for the reviewed state in
`execution.md`. Include tracked changes, hashes of untracked files, and every
substantive section of `execution.md`; exclude only the append-only
`Adversarial reviews` section plus the `Status` and `Updated` fields. Triage every finding yourself. Fix valid findings,
update `execution.md`, and rerun affected validation. If a fix requires a
material deviation, ask first under the rule above.

Launch another fresh reviewer after **any accepted finding changes code, tests,
configuration, dependencies, migrations, generated artifacts, or any
fingerprinted execution content**—regardless of why it changed. Merely appending that review's unchanged findings and
resolution to `execution.md` does not invalidate it. The last review must match
the final implementation fingerprint.

After all gates pass, changing only `Status` from `in-progress` to `complete`
and refreshing `Updated` does not require another review. No other post-review
change receives this exception.

If the host cannot launch an independent agent, report that limitation and do
not mark the work complete. Do not silently substitute another review method.

## Completion gate

Set `execution.md` to `complete` and report completion only when:

- every plan requirement and acceptance condition is satisfied as written,
  covered by a recorded permitted non-material deviation, or covered by an
  explicitly approved and recorded material deviation;
- relevant validation passes;
- the final independent review fingerprint matches the current implementation;
- no blocking finding or question remains; and
- `execution.md` accurately reflects all decisions and deviations.

Otherwise leave the status `in-progress` or `blocked` and state exactly what
remains. In the final response, summarize the implementation, validation,
adversarial review, deviations, open questions, and execution file.
