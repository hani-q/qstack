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

## Resolve the board

Look for `board-events.js` beside the plan. If only the retired `board.jsonl`
exists, resolve the shared protocol below and follow its migration branch before
deciding the plan has no board. Stop if both exist.

With no board, run exactly as this skill does without one. The whole plan is the
unit of work and `execution.md` keeps its `## Progress` checklist. Existing plans
keep working and nothing else in this section applies.

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

This skill's latitude does not reach the protocol. Board ownership in particular
is not an adaptation the orchestrator may make, however small and reversible
taking a board over looks.

The board sections below are this skill's own rules. Where one sharpens
something the protocol states, it names the rule it sharpens instead of
restating it.

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

## Progress  <!-- omit when board-events.js exists; the board is the progress record -->
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

## Select and claim cards

### Arguments

`/qstack-loop-trequartista [plan-path] [--tasks T-03 T-07] [--epic <epic-id>] [--limit N|Npt]`

With a board present the default is the whole board, ordered by this
orchestrator. `--tasks` narrows to the named cards. `--epic` narrows to one
epic. `--limit N` stops after N cards close, `--limit Npt` after N points close.
Selection happens here and never on the board. The board renders a file and has
no controls.

A narrowed or limited run that leaves cards open cannot satisfy the completion
gate. Leave the status `in-progress` and report which cards remain.

### The pick

Take cards from the ready set in the protocol, one at a time, and record why you
took each one in the `claimed` event's `reason` field. Honest reasons read like
these:

- `unblocks four cards`
- `T-04 is done and touched the same files, so the context is loaded`
- `smallest card that proves the migration works before the rest commit to it`

Feel is allowed. Unrecorded feel is not. The ready set itself is not one of this
skill's adaptations: a card it excludes stays excluded, whatever route through
the plan looks better from here.

## Park and continue

Park under the protocol's Park and continue, with one thing settled here:
material decisions park. When a card reaches one, move it to `blocked` with the
question in its `note`, then claim the next ready card. The run does not stop.

A permitted non-material adaptation is still made on the spot and recorded in
`execution.md`. Parking is for material decisions only.

## Resume a blocked card

Follow the protocol's Resume a blocked card. Record the answer in `execution.md`
before the move, under the rule this skill already applies to an approved
material deviation: what the plan says, what you learned, and what was approved.
The plan stays frozen.

## Splitting

Follow the protocol's Splitting, including the rule that a card whose
`depends_on` names a split parent waits on that split's children. Two loops that
pick ids differently collide on one board, so the id convention there is not
yours to adapt either.

A split is a board change, not a plan deviation, and needs no approval, because
points are an estimate and the plan never promised one. Children that would
cover more or less than the parent covered are a material deviation, and Adapt
without losing the plan applies. If the `note` on an `8` does not say what the
card splits into, report that card and leave it alone: filling it in yourself is
a material deviation dressed as a board change.

## Execute and orchestrate

Break the plan into trackable tasks and keep their status current. With a board,
the cards are those tasks and `board-events.js` is where their status lives. Delegate
bounded independent work when agent tools are available, but inspect and
integrate every result yourself. Preserve unrelated user changes.

Implement the full plan, update `execution.md` continuously, and validate in
proportion to risk. Run the repository's relevant tests, linters, type checks,
builds, and focused behavioral checks. Do not commit or push unless the user
explicitly asks.

## Run the adversarial review loop

After implementation and primary validation, launch a **fresh independent
agent** to review the current work. A self-review does not satisfy this gate.

With a board, this loop runs once per card, scoped to that card's diff and the
plan clauses in its `refs`, while the card sits in `review`. Reviewing each card
against its own files is what makes parallel cards safe. The plan-level review
still runs once, after the last card closes, and it is the one that catches
integration.

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
`Adversarial reviews` section plus the `Status` and `Updated` fields. A per-card
fingerprint covers that card's `files` rather than the whole change. Triage
every finding yourself. Fix valid findings, update `execution.md`, and rerun
affected validation. If a fix requires a
material deviation, ask first under Adapt without losing the plan.

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
- with a board, every card is `done` or `split`, every card you claimed is one
  you closed, split, or released under your own slug, and your `stood-down` is
  on the board under the protocol's Standing down;
- relevant validation passes;
- the final independent review fingerprint matches the current implementation;
- no blocking finding or question remains; and
- `execution.md` accurately reflects all decisions and deviations.

Otherwise leave the status `in-progress` or `blocked`, append `stood-down`
anyway, and state exactly what remains. In the final response, summarize the
implementation, validation, adversarial review, deviations, open questions, and
execution file.
