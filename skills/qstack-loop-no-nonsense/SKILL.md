---
name: qstack-loop-no-nonsense
description: >
  Execute an approved implementation plan end to end without making unapproved
  deviations. Orchestrate the work, maintain execution.md beside the plan, run
  validation, and require a fresh independent adversarial agent to review the
  actual implementation before completion. Use when the user invokes
  /qstack-loop-no-nonsense, asks to execute a plan exactly, or wants strict
  plan fidelity with questions raised before any departure.
---

# /qstack-loop-no-nonsense

Treat the plan as the contract. Execute it completely, but never silently change
what it requires.

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
files. Never overwrite prior notes. Resume only when its mode is `no-nonsense`.
If another mode is recorded, stop and require explicit approval to transition;
record the approved transition before continuing. If its status is `complete`,
require explicit approval to reopen it. If it is `blocked`, resume only after
every blocking item is resolved. Record either status transition. Use this shape:

```markdown
# Execution

- Plan: <repo-relative path>
- Mode: no-nonsense
- Status: in-progress | blocked | complete
- Started: YYYY-MM-DD
- Updated: YYYY-MM-DD

## Progress
- [ ] <plan task or acceptance condition>

## Design decisions
- <choices made where the plan was silent or ambiguous>

## Deviations
- None.

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

## Obey the plan exactly

- Follow every explicit decision, constraint, task, and acceptance criterion.
- Do not expand scope or substitute a supposedly better design.
- When the plan is silent on an incidental implementation detail, follow the
  repository's established pattern and record any non-obvious interpretation as
  a design decision. A choice that preserves every explicit requirement is not
  a deviation.
- If the plan conflicts with the code, cannot be completed as written, is
  materially ambiguous, or would require any departure, stop before making the
  conflicting change. Ask one focused question that states what the plan says,
  what reality requires, the recommended amendment, and the main alternatives.
- Proceed only after explicit approval. Record the answer as an approved
  deviation in `execution.md`; approval does not rewrite the frozen plan.

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
editing files. It must look for missing requirements, unapproved deviations,
incorrect behavior, regressions, unsafe assumptions, weak tests, and inaccurate
or incomplete execution notes. Require findings to include severity, evidence,
and a concrete remedy; require an explicit statement when no blocking findings
remain.

Before each review, record a content fingerprint for the reviewed state in
`execution.md`. Include tracked changes, hashes of untracked files, and every
substantive section of `execution.md`; exclude only the append-only
`Adversarial reviews` section plus the `Status` and `Updated` fields. Triage every finding yourself. Fix valid findings,
update `execution.md`, and rerun affected validation. If a fix would depart from
the plan, ask first under the strict rule above.

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

- every plan requirement and acceptance condition is satisfied as written or
  covered by an explicitly approved, recorded deviation;
- relevant validation passes;
- the final independent review fingerprint matches the current implementation;
- no blocking finding or question remains; and
- `execution.md` accurately reflects all decisions and approved deviations.

Otherwise leave the status `in-progress` or `blocked` and state exactly what
remains. In the final response, summarize the implementation, validation,
adversarial review, approved deviations, open questions, and execution file.
