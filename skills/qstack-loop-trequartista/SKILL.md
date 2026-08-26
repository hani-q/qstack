---
name: qstack-loop-trequartista
description: >
  Execute an approved implementation plan with documented adaptations, QStack
  execution evidence, and a user-selected adversarial review depth.
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

## Choose the review mode

Review depth is the user's cost and quality choice. Resolve the plan, detect
whether it has a board, inspect any existing `execution.md`, and read plan and
repository review requirements without writing anything. Then settle the mode
before creating or updating execution files, migrating or claiming a board,
launching an agent, or editing implementation files.

`--review full|final|none` supplies the choice for automation. Reject any other
value. Always validate an existing `execution.md` first, with or without the
flag:

- if `Review mode` is present, it appears exactly once and must be `full`,
  `final`, or `none`;
- no such field means a legacy `full` run and is not rewritten merely to
  backfill the field;
- a duplicated, malformed, or unknown value stops preflight without mutation.

Without the flag, reuse that recorded or legacy mode without asking. With the
flag, it must match that mode as described below. For a new execution without
the flag, ask one startup question, using the host's structured question tool
when available and plain text when it is not. With a board, ask:

  > How much independent adversarial review should this run use?
  >
  > - Final review only (recommended): one fresh reviewer after all work, balancing coverage and token cost.
  > - Full review: review every card and the combined result; highest coverage and token use.
  > - No adversarial review: fastest and lowest token use; rely on validation only.

Without a board, `full` and `final` both launch one whole-plan reviewer, so do
not present them as different costs. Ask instead:

> How much independent adversarial review should this run use?
>
> - One whole-plan review (recommended, recorded as `final`): balance quality and token cost.
> - No adversarial review: fastest and lowest token use; rely on validation only.

Review mode is fixed once execution starts. On a resume, a `--review` value that
differs from the recorded or legacy mode is a conflict: stop and name the mode
already in force. Completed cards cannot be retroactively returned to their
original isolated per-card review state, and changing fingerprinted execution
content would invalidate earlier reviews. Do not ask again on a resume.
An invalid or conflicting review flag is a preflight failure. This invocation
never claimed the board, so it appends no `stood-down` and does not alter any
coordinator left by an earlier run.

The modes are:

- `full`: per-card review plus one final plan-level review;
- `final`: no per-card reviewers, then one final plan-level review;
- `none`: no reviewers and no review fingerprints.

Without a board, `full` and `final` both mean the one whole-plan review that the
loop can run; an explicit `--review full` remains valid and is recorded as
`full`. Review mode controls only the reviews this loop adds. During the
read-only preflight, derive the minimum permitted mode from plan and repository
instructions. A required final independent review permits only `final` or
`full`; required per-card independent review permits only `full` when a board
exists. Without a board, a per-card mandate is unsatisfiable: stop preflight and
name the requirement rather than pretending the whole-plan review meets it.
Remove weaker modes from the startup question and reject a weaker `--review`,
recorded, or legacy mode before any mutation. If only one behavior is permitted,
explain the requirement and use its least expensive valid mode without asking a
fake choice. The choice changes reviewer agents only; implementation subagents
and `--parallel` are unchanged.

## Resolve the board

Look for `board-events.js` beside the plan. If only the retired `board.jsonl`
exists, resolve the shared protocol below and follow its migration branch before
deciding the plan has no board. Stop if both exist.

With no board, run exactly as this skill does without one. The whole plan is the
unit of work and `execution.md` keeps its `## Progress` checklist. Existing plans
keep working and nothing else in this section applies.

With a board, the board is the progress record and
`qstack-plan-to-html/references/board-protocol.md` is how you work it: folding
the board, claiming it, the ready set, the pick, the claim race, the wave,
dispatch, what a card owns, the transitions, parking, resuming a blocked card,
splitting, and standing down.
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
- Review mode: full | final | none
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
- <round, reviewer findings, and resolution; or explicit skip for `none`>
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

`/qstack-loop-trequartista [plan-path] [--tasks T-03 T-07] [--epic <epic-id>] [--limit N|Npt] [--parallel N] [--review full|final|none]`

`--review` applies with or without a board and supplies the startup review
choice instead of asking. With a board present the default is the whole board,
ordered by this orchestrator. `--tasks` narrows to the named cards. `--epic`
narrows to one epic. `--limit N` stops after N cards close, `--limit Npt` after
N points close. `--parallel N` sets how many cards this run holds at once, and
`--parallel 1` runs the board serially; without it the wave is the width the
protocol's The wave sets. Selection happens here and never on the board. The
board renders a file and has no controls.

A narrowed or limited run that leaves cards open cannot satisfy the completion
gate. Leave the status `in-progress` and report which cards remain.

### The pick

Take cards from the ready set in the protocol and record why you took each one
in the `claimed` event's `reason` field. Honest reasons read like these:

- `unblocks four cards`
- `T-04 is done and touched the same files, so the context is loaded`
- `smallest card that proves the migration works before the rest commit to it`

Feel is allowed. Unrecorded feel is not. The ready set itself is not one of this
skill's adaptations: a card it excludes stays excluded, whatever route through
the plan looks better from here.

### The wave

Fill a wave and dispatch it, under the protocol's The wave and Dispatch. Claim
every card the ready set offers until one of the four listed stops applies. How
many cards to hold is not one of this skill's adaptations, and neither is
declining to hold one: the four stops are the whole list, and `--parallel`
already set the width. A wave needs no recording as a deviation, because cards
the breakdown left independent are independent.

Where the wave meets this skill's own rule, the rule wins. A non-material
adaptation on one card that would change what a sibling card in the same wave is
building is material, because the sibling is already building against the
unadapted version. Park it and ask, or hold the adaptation until that card
closes. The wave is not a licence to adapt around a card you are running beside.

## Park and continue

Park under the protocol's Park and continue, with one thing settled here:
material decisions park. When a card reaches one, move it to `blocked` with the
question in its `note`, leave the rest of the wave running, and refill it from
the ready set. The run does not stop.

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
the cards are those tasks and `board-events.js` is where their status lives. Fill
a wave from the ready set, dispatch one subagent per card, and move each card
through the protocol's transitions as it gets there. Delegate
bounded independent work when agent tools are available, but inspect and
integrate every result yourself. Preserve unrelated user changes.

Brief each card's subagent under the protocol's Dispatch, and add what this
skill requires: it reports a material decision back rather than taking it,
because Adapt without losing the plan is yours and not the subagent's. You park
the card.

Build what the plan prescribes. Where it leaves the implementation open, or a
lighter build is a deviation you may make under Adapt without losing the plan,
write the least code that meets the acceptance criteria of the card, or of the
task when there is no board. Before writing anything new, take the highest of
these that fully meets the requirement, edge cases included: a helper,
component, or pattern already in this repository; the standard library; a
native platform feature; a dependency already installed; then the minimum new
code. Add no abstraction, configuration, wrapper, or file that neither
implementing nor verifying it requires. Before editing a function, grep its
callers and fix the shared path once. Never cut validation at a trust boundary,
error handling that prevents data loss, security, accessibility, or anything
the plan names. When you take a higher rung than the obvious build, record it
as a design decision, or as a deviation when the plan prescribed the heavier
build.

Implement the full plan, update `execution.md` continuously, and validate in
proportion to risk. Run the repository's relevant tests, linters, type checks,
builds, and focused behavioral checks. Do not commit or push unless the user
explicitly asks.

## Run the selected adversarial reviews

In `full` mode, run one review per card and one for the plan. A per-card review
runs while the card is in `review`, before it moves to `done`, and is scoped
under the protocol's What a card owns: that card's `files`, the paths the card
actually wrote, and the plan clauses in its `refs`.

In `final` mode, move validated cards directly from `in-progress` to `done`
under the protocol and run only the plan-level review. In `none` mode, use the
same direct card transition, record that adversarial review was skipped by the
explicit review choice, and launch no reviewer.

The plan-level review in `full` or `final` runs after the last card on the board
is `done` or `split`, never merely after the last card selected by `--tasks`,
`--epic`, or `--limit`. It catches integration and seams no single card's diff
showed. Without a board, that is the one whole-plan review. For every enabled
review, launch a **fresh independent agent**. A self-review does not satisfy the
selected mode.

Give the reviewer raw evidence rather than your conclusions:

- repository root and plan path;
- `execution.md` path;
- the base reference and the diff. A `full` per-card review gets what What a
  card owns specifies. A plan-level review gets the complete diff including
  untracked files;
- validation commands already run.

Ask the reviewer to read the plan and inspect the actual implementation without
editing files. It must look for missing requirements, material unapproved or
undocumented deviations, incorrect behavior, regressions, unsafe assumptions,
weak tests, unrequested code (an abstraction, configuration, dependency,
wrapper, or file that no plan requirement or its verification calls for), and
inaccurate or incomplete execution notes. Require findings to include severity,
evidence, and a concrete remedy; require an explicit statement when no blocking
findings remain.

Before each review, record a content fingerprint for the reviewed state in
`execution.md`. Include tracked changes, hashes of untracked files, and every
substantive section of `execution.md`; exclude only the append-only
`Adversarial reviews` section plus the `Status` and `Updated` fields. A `full`
per-card fingerprint covers that card's `files` and only the `execution.md`
entries naming that card. A `full` or `final` plan-level fingerprint covers the
whole change and all of `execution.md`. Scoping the per-card fingerprint this
way is what lets a wave run: the orchestrator writes every card's decisions into
one `execution.md`, so a fingerprint over the whole file would be changed by
every sibling and no card review would ever stay valid. Triage
every finding yourself. Fix valid findings, update `execution.md`, and rerun
affected validation. If a fix requires a
material deviation, ask first under Adapt without losing the plan.

Launch another fresh reviewer after **any accepted finding changes code, tests,
configuration, dependencies, migrations, generated artifacts, or any
fingerprinted execution content**, regardless of why it changed. Merely appending that review's unchanged findings and
resolution to `execution.md` does not invalidate it. The last review must match
the final implementation fingerprint.

What the wave changed together is what the plan-level review and its
whole-change fingerprint are for.

In `full` or `final`, changing only `Status` from `in-progress` to `complete`
and refreshing `Updated` after review passes does not require another review.
No other post-review change receives this exception. In `none`, any substantive
change after validation requires the affected validation to run again.

When `full` or `final` requires a reviewer and the host cannot launch an
independent agent, report that limitation and do not mark the work complete. Do
not silently substitute another review method. `none` requires no agent.

## Completion gate

Set `execution.md` to `complete` and report completion only when:

- every plan requirement and acceptance condition is satisfied as written,
  covered by a recorded permitted non-material deviation, or covered by an
  explicitly approved and recorded material deviation;
- with a board, every card is `done` or `split`, every card you claimed is one
  you closed, split, or released under your own slug, and your `stood-down` is
  on the board under the protocol's Standing down;
- relevant validation passes;
- in `full` or `final`, the final independent review fingerprint matches the
  current implementation; in `none`, `execution.md` explicitly records that
  review was skipped by the selected mode;
- no blocking finding or question remains; and
- `execution.md` accurately reflects all decisions and deviations.

Otherwise leave the status `in-progress` or `blocked`, append `stood-down`
anyway, and state exactly what remains. In the final response, summarize the
implementation, validation, selected review mode and outcome, deviations, open
questions, and execution file. With a board, report the waves too: which cards
ran together, and where the board held the run to one card. A run that was
serial because every card depended on the last says so.
