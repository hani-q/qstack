---
name: qstack-loop-no-nonsense
description: >
  Execute an approved implementation plan exactly, maintaining QStack execution
  evidence and asking how much independent adversarial review to run.
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

With no board, run exactly as this skill runs without one. The whole plan is
the unit of work, and the `## Progress` checklist in `execution.md` is the
progress record. Existing plans keep working and nothing else here applies.

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
- Review mode: full | final | none
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
- <round, reviewer findings, and resolution; or explicit skip for `none`>
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

### Arguments

`/qstack-loop-no-nonsense [plan-path] [--tasks T-03 T-07] [--epic <epic-id>] [--limit N|Npt] [--parallel N] [--review full|final|none]`

`--review` applies with or without a board and supplies the startup review
choice instead of asking. The remaining arguments narrow a board run.

With a board, the default scope is the whole board, in the order and the wave
width you pick. Arguments narrow it:

- `--tasks T-03 T-07` runs only those cards;
- `--epic board-file` runs only that epic;
- `--limit 4` stops after four cards, and `--limit 8pt` stops after eight
  points;
- `--parallel 2` holds at most two cards at once, and `--parallel 1` runs the
  board serially. Without it the wave is the width the protocol's The wave
  sets.

Scope is chosen here, in the invocation, never on the board. The board is a
view and has no controls.

A narrowed or limited run that leaves cards open cannot satisfy the completion
gate. Leave the status `in-progress` and report which cards remain.

Take cards from the ready set in the protocol and record why you took each one
in the `claimed` event's `reason` field. Nothing about the pick is relaxed here.
A card the ready set excludes stays excluded, whatever order this skill would
rather run the plan in.

Fill a wave and dispatch it, under the protocol's The wave and Dispatch. Claim
every card the ready set offers until one of the four listed stops applies. This
skill relaxes none of them and adds none of its own.

It sharpens one thing: a wave is not permission to run cards the plan ordered.
The plan's build order reaches you as `depends_on`, so cards the breakdown left
independent are independent because the plan left them independent, and running
them together follows the plan rather than departing from it. If executing two
cards at once would visibly change what the plan requires, that is a departure
and Obey the plan exactly decides it, not the wave width.

## Park and continue

Park under the protocol's Park and continue, with one thing settled here: every
question that would depart from the plan parks. A card that cannot be done as
written moves to `blocked` with the question in its `note`, the rest of the wave
keeps running, and you refill it from the ready set.

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
Fill a wave from the ready set, dispatch one subagent per card, move each card
through the protocol's transitions as it gets there, and keep no second list.
Without a board, break the plan into trackable tasks and keep their status
current. Either way, delegate bounded independent work when agent tools are
available, but inspect and integrate every result yourself. Preserve unrelated
user changes.

Brief each card's subagent under the protocol's Dispatch, and add what this
skill requires: it obeys the plan exactly as you do, over the `§` clauses in the
card's `refs`. A subagent that finds it cannot do the card as written reports
the question rather than guessing, and you park the card.

Build what the plan prescribes. Where it leaves the implementation open, write
the least code that meets the acceptance criteria of the card, or of the task
when there is no board. Before writing anything new, take the highest of these
that fully meets the requirement, edge cases included: a helper, component, or
pattern already in this repository; the standard library; a native platform
feature; a dependency already installed; then the minimum new code. Add no
abstraction, configuration, wrapper, or file that neither implementing nor
verifying it requires. Before editing a function, grep its callers and fix the
shared path once. Never cut validation at a trust boundary, error handling that
prevents data loss, security, accessibility, or anything the plan names. When
you take a higher rung than the obvious build, record it as a design decision.

Implement the full plan, update `execution.md` continuously, and validate in
proportion to risk. Run the repository's relevant tests, linters, type checks,
builds, and focused behavioral checks. Do not commit or push unless the user
explicitly asks.

## Run the selected adversarial reviews

In `full` mode, run one review per card and one for the plan. A per-card review
runs while the card is in `review`, before it moves to `done`, and is scoped
under the protocol's What a card owns: that card's `files`, the paths the card
actually wrote, and the `§` clauses in its `refs`.

In `final` mode, move validated cards directly from `in-progress` to `done`
under the protocol and run only the plan-level review. In `none` mode, use the
same direct card transition, record that adversarial review was skipped by the
explicit review choice, and launch no reviewer.

The plan-level review in `full` or `final` runs after every other card on the
board is `done` or `split`, never merely after the last card selected by
`--tasks`,
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
editing files. It must look for missing requirements, unapproved deviations,
incorrect behavior, regressions, unsafe assumptions, weak tests, unrequested
code (an abstraction, configuration, dependency, wrapper, or file that no plan
requirement or its verification calls for), and inaccurate or incomplete
execution notes. Require
findings to include severity, evidence, and a concrete remedy; require an
explicit statement when no blocking findings remain.

Before each review, record a content fingerprint for the reviewed state in
`execution.md`. Include tracked changes, hashes of untracked files, and every
substantive section of `execution.md`; exclude the append-only
`Adversarial reviews` section, the `Status` and `Updated` fields, and the
plan folder's own append-only bookkeeping: `board-events.js`, which the gate
card's own transitions change during the review it is fingerprinting, and this
`execution.md`, which enters through its substantive sections and would
otherwise be hashed twice. A `full`
per-card fingerprint covers that card's `files` and only the `execution.md`
entries naming that card. A `full` or `final` plan-level fingerprint covers the
whole change and all of `execution.md`. Scoping the per-card fingerprint this
way is what lets a wave run: the orchestrator writes every card's decisions into
one `execution.md`, so a fingerprint over the whole file would be changed by
every sibling and no card review would ever stay valid. Triage every finding
yourself. Fix valid findings,
update `execution.md`, and rerun affected validation. If a fix would depart from
the plan, ask first under Obey the plan exactly.

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

## The gate card

A board written with a Review epic ends in one more card: the automatic final
review of the whole plan. Its `files` is the plan's `execution.md`, and the
protocol's ready-set condition 5 offers it only once every other card on the
board is `done` or `split`, whenever those cards arrived. That card is the
plan-level review, made visible on the board. Run the review on it, run no
second plan-level review beside it, and no per-card review of the gate card
itself. A board with no `review` epic keeps the plan-level review exactly as
described above.

In `none` mode the gate card carries no review, because that mode launches no
reviewer. Move it straight from `in-progress` to `done` with `gate review
omitted: review mode none` in the move's `note`, and record the same skip in
`execution.md`. That is the review mode the user chose rather than an override,
and it accepts no finding unfixed, because none was raised. A plan whose own
text requires a final independent review still permits only `final` or `full`,
decided under Choose the review mode from the plan rather than from the presence
of a gate card.

The gate card is also what makes the final review visible to
`/qstack-plan-close`. That skill already refuses to write `outcome.md` while any
card is open, so it needs no change of its own.

Work this card yourself rather than dispatching a subagent for it: the two
reviewers below are the only agents it launches, and neither writes. Move it
through the protocol's The transitions, which holds it in `review` for the
whole gate.

Record the plan-level fingerprint defined in Run the selected adversarial
reviews, then launch two fresh independent agents against that one fingerprint,
both in one dispatch so they run concurrently:

- a plan-adherence agent, scoring the implementation against the plan and
  `execution.md` the way `/qstack-plan-adherence-review` does;
- a code-review agent, reviewing the change itself the way `/qstack-review`
  does.

Both are fresh, and both read the same fingerprinted state. Give each the raw
evidence listed above and require the same finding shape. Your own reading of
the change satisfies neither of them.

Give the code-review agent the change without the plan folder's own record:
`execution.md`, `board-events.js`, and `outcome.md`. That record is the
adherence agent's primary input, it grows every round, and `/qstack-review`
requires a reviewer to read every file it is handed in full. Exclude those three
by name rather than by folder, since the plan folder also holds real
deliverables, and say in the brief that they were excluded so the omission is
not read as a silent skip.

Open no remediation card until both agents have reported: triaging the first
while the second still runs spends rounds on findings the other may answer.
Triage every finding yourself: a reviewer agent can be wrong, and a finding you
reject is recorded in `execution.md` with the evidence that refutes it rather
than discarded. The fix does not happen inline here: every P0 and
P1 finding you accept becomes a remediation card in the `review` epic, worked
like any other card. Record P2 findings in `execution.md` and open no card for
them, because they block nothing.

Write those cards yourself, under the protocol's Subagents never write. Each is
a `created` event carrying `epic`, `title`, `points`, `refs`, `files`, and
`depends_on`, taking the next free id under the protocol's Splitting, and each
has to satisfy the ready set: non-empty `files`, and `points` in the closed set.
Its `files` are the implementation paths the finding traces to, never
`execution.md`, which the gate card owns for as long as it is live. Its
`refs` are the `§` clauses the finding traces to. A finding whose only fix is in
`execution.md` gets no card: fix it yourself under the gate card and record what
changed in that card's own `note`, because a remediation card naming that path
could never satisfy ready-set condition 3.

Remediation changes fingerprinted content, so both agents run again on the new
fingerprint under the rerun rule above. The card moves to `done` when one shared
fingerprint carries a pass from both.

### The override

The gate card's only other route to `done` is an explicit human override.
Nothing else closes it, and the protocol's The transitions is where that is
stated, including why it is never split. Write
one when a human instruction tells you to close the gate with findings
outstanding: append a `note` on the card naming who overrode it, why, and every
finding accepted unfixed, then the `moved` to `done` from whichever status the
card is in, `review` if the round is still open and `blocked` if it was already
parked, and record the same three facts in `execution.md`.

Everything else leaves the card where it is. A review that keeps failing, a
reviewer the host cannot launch, and a run that has spent its budget are each a
question for a human, so park the card under the protocol's Park and continue
with what it is waiting on in its `note`, and ask. The loop never writes an
override for itself, and a stalled or repeatedly failing review is not
permission to write one.

## Completion gate

Set `execution.md` to `complete` and report completion only when:

- every plan requirement and acceptance condition is satisfied as written or
  covered by an explicitly approved, recorded deviation;
- relevant validation passes;
- with a board, every card is `done` or `split`, every card you claimed is one
  you closed, split, or released under your own slug, and your `stood-down` is
  on the board under the protocol's Standing down;
- in `full` or `final`, the final independent review fingerprint matches the
  current implementation; in `none`, `execution.md` explicitly records that
  review was skipped by the selected mode;
- no blocking finding or question remains; and
- `execution.md` accurately reflects all decisions and approved deviations.

Otherwise leave the status `in-progress` or `blocked`, append `stood-down`
anyway, and state exactly what remains. In the final response, summarize the
implementation, validation, selected review mode and outcome, approved
deviations, open questions, and execution file. With a board, report the waves
too: which cards ran together, and where the board held the run to one card. A
run that was serial because every card depended on the last says so.
