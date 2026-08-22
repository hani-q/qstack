---
name: qstack-loop-no-nonsense
description: >
  Execute an approved implementation plan exactly, maintaining QStack execution
  evidence and requiring independent adversarial review.
disable-model-invocation: true
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

## Resolve the board

Look for `board-events.js` beside the plan. If only the retired `board.jsonl`
exists, resolve the shared protocol below and follow its migration branch before
deciding the plan has no board. Stop if both exist.

With no board, run exactly as this skill runs without one. The whole plan is
the unit of work, and the `## Progress` checklist in `execution.md` is the
progress record. Existing plans keep working and nothing else here applies.

With a board, the board is the progress record and
`qstack-plan-to-html/references/board-protocol.md` is how you work it: folding
the board, claiming it, the ready set, the pick, the claim race, the
transitions, parking, resuming a blocked card, splitting, and standing down.
Both execution loops read that one file, so the protocol cannot say two
different things.

Resolve it relative to this skill's installed directory, never a hardcoded path.
This skill installs into any of ~70 agent directories and may be a symlink. The
protocol lives beside `qstack-plan-to-html`, which is the skill that writes a
board in the first place, so both loops read one copy and neither owns it.

```bash
# Resolve the skill's own directory, following a symlink if there is one.
SKILL_DIR=$(dirname "$(readlink -f <path-of-this-SKILL.md>)")
cat "$SKILL_DIR/../qstack-plan-to-html/references/board-protocol.md"
```

Read it in full before you fold the board, and follow it exactly. If it is
unavailable, do not work the board from memory: report that the board protocol
could not be read, that no card was claimed, and that the workflow is
incomplete. Then stop.

The board sections below are this skill's own rules. Where one sharpens
something the protocol states, it names the rule it sharpens instead of
restating it.

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

## Progress  <!-- omit when board-events.js exists; the board is the progress record -->
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

## Select and claim cards

With a board, the default scope is the whole board, in the order you pick card
by card. Arguments narrow it:

- `--tasks T-03 T-07` runs only those cards;
- `--epic board-file` runs only that epic;
- `--limit 4` stops after four cards, and `--limit 8pt` stops after eight
  points.

Scope is chosen here, in the invocation, never on the board. The board is a
view and has no controls.

A narrowed or limited run that leaves cards open cannot satisfy the completion
gate. Leave the status `in-progress` and report which cards remain.

Take cards from the ready set in the protocol, one at a time, and record why you
took each one in the `claimed` event's `reason` field. Nothing about the pick is
relaxed here. A card the ready set excludes stays excluded, whatever order this
skill would rather run the plan in.

## Park and continue

Park under the protocol's Park and continue, with one thing settled here: every
question that would depart from the plan parks. A card that cannot be done as
written moves to `blocked` with the question in its `note`, and you take the
next ready card.

Parking changes when the question is asked, never whether. Obey the plan exactly
holds in full: the conflicting change is not made, nothing is guessed in place
of an answer, and no departure from the plan happens without explicit approval.
A parked question is still a blocking question, and the run cannot complete
while one is open.

## Resume a blocked card

Follow the protocol's Resume a blocked card. Record the answer in `execution.md`
before the move. If it approves a departure from the plan, it is an approved
deviation under Obey the plan exactly, and approval does not rewrite the frozen
plan.

## Splitting

Follow the protocol's Splitting, including the id allocation and the rule that a
card whose `depends_on` names a split parent waits on that split's children.

A split is a board change, not a plan deviation, so it needs no approval here.
Children that would cover more or less than the parent covered are a deviation:
stop before writing them and ask under Obey the plan exactly. If the `note` on
an `8` does not say what the card splits into, report it and leave it alone.
Guessing at it is scope nobody approved.

## Execute and orchestrate

With a board, the cards are the trackable tasks and the board is their status.
Take one ready card, move it through the protocol's transitions, and keep no
second list. Without a board, break the plan into trackable tasks and keep their status
current. Either way, delegate bounded independent work when agent tools are
available, but inspect and integrate every result yourself. Preserve unrelated
user changes.

Implement the full plan, update `execution.md` continuously, and validate in
proportion to risk. Run the repository's relevant tests, linters, type checks,
builds, and focused behavioral checks. Do not commit or push unless the user
explicitly asks.

## Run the adversarial review loop

After implementation and primary validation, launch a **fresh independent
agent** to review the current work. A self-review does not satisfy this gate.

With a board, this loop runs once per card and once for the plan. The per-card
review runs while the card is in `review`, before it moves to `done`, and is
scoped to that card's diff and the `§` clauses in its `refs`. Reviewing each
card before another card builds on it is what makes parallel cards safe. The
plan-level review still runs once, after the last card is `done` or `split`, and
it is the review that catches integration, the seams no single card's diff
showed.

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
`Adversarial reviews` section plus the `Status` and `Updated` fields. A per-card
fingerprint covers that card's `files`; the plan-level fingerprint covers the
whole change. Triage every finding yourself. Fix valid findings,
update `execution.md`, and rerun affected validation. If a fix would depart from
the plan, ask first under Obey the plan exactly.

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
- with a board, every card is `done` or `split`, every card you claimed is one
  you closed, split, or released under your own slug, and your `stood-down` is
  on the board under the protocol's Standing down;
- the final independent review fingerprint matches the current implementation;
- no blocking finding or question remains; and
- `execution.md` accurately reflects all decisions and approved deviations.

Otherwise leave the status `in-progress` or `blocked`, append `stood-down`
anyway, and state exactly what remains. In the final response, summarize the
implementation, validation, adversarial review, approved deviations, open
questions, and execution file.
