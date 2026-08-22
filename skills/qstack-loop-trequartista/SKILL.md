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

Look for `board.jsonl` beside the plan.

With no board, run exactly as this skill does without one. The whole plan is the
unit of work and `execution.md` keeps its `## Progress` checklist. Existing plans
keep working and nothing else in this section applies.

With a board, the board is the progress record. `execution.md` drops its
`## Progress` section and keeps design decisions, deviations, tradeoffs, open
questions, validation, and adversarial reviews. One record per concern, so the
two cannot drift.

Refuse the whole board on one fault only: a card missing `depends_on` or
`files`. The ready set cannot be computed without both fields, so there is no
safe order to run any card in. Report every card id that is missing a field and
stop; that board needs a human. An empty `files` array is present, not missing,
and the breakdown writes one on an under-specified `8`.

A card at `8` points is a per-card exclusion, not a board failure. It is never
ready and nobody can claim it, so report it, run every other card, and split it
from its `note` under Splitting below.

Resolve the actor slug once for the session: the Conductor workspace directory
name, else the current Git branch name with `/` replaced by `-`, else `agent`.
It must match `[a-z0-9][a-z0-9-]*`. Use that same slug in every event you write.

## Claim the board

One coordinator per board. Two is forbidden, not resolved. Before claiming any
card, fold the board and look for a `coordinator` event with no later
`stood-down` from the same actor.

- A different actor holds it. Stop, and name the holder and the cards it owns.
  Do not take over, do not wait, do not claim a card. Waiting and retrying is a
  takeover with extra steps.
- You hold it. This is your own run resuming, so continue.
- Nobody holds it. Append your own `coordinator`, re-read the file, and if
  another actor's `coordinator` appears before yours in the file, append
  `stood-down` and stop. The re-read closes the window where two loops start on
  an empty board in the same second.

Break that tie on file order, never on `ts`. Two loops that start in the same
second write the same stamp, because `date -u +%FT%TZ` resolves to the second,
so a `ts` comparison ties and neither loop yields in exactly the case the rule
exists to close. Appends are ordered, so file order is total and always decides.

Your `stood-down` releases your own hold and nothing else. It never clears
another actor's `coordinator`, so the loser of that race leaves the winner
holding the board.

Two coordinators are unsafe because of what the `files` check cannot see. Each
picks a card the other has not claimed yet, each folds the board and finds no
overlapping `files`, and both claims pass. Two agents then start editing
`src/writer.ts`. Neither check was wrong, and neither was looking at the other's
pending choice. One coordinator cannot race itself.

Never take over automatically. A board whose coordinator never stood down needs
a human, so report it and stop rather than deciding the holder is gone. This
skill's latitude does not reach here. Board ownership is not an adaptation the
orchestrator may make, however small and reversible taking it over looks.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"coordinator","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Append `stood-down` when the run ends, on every exit path: the completion gate
passed, the run was abandoned, or it stopped on a question.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"stood-down","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

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

## Progress  <!-- omit when board.jsonl exists; the board is the progress record -->
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

### The ready set

A card is ready when all four hold:

1. its status is `backlog`;
2. every card in its `depends_on` is `done` or `split`;
3. none of its `files` appear in the `files` of any card currently `claimed`,
   `in-progress`, or `review`;
4. its `points` are not `8`.

Condition 4 never clears by working the card. An `8` reaches the ready set only
as its children, so split it from its `note` and take those. Leaving it out
costs you that card and nothing else; the rest of the board runs.

Condition 1 leaves a `blocked` card out of the ready set, and it never re-enters
it. The card still belongs to the actor that blocked it, and it comes back
through the resume path below rather than through a fresh claim.

### The pick

Which ready card to take is judgment. Put the reason in the `claimed` event's
`reason` field. Honest reasons read like these:

- `unblocks four cards`
- `T-04 is done and touched the same files, so the context is loaded`
- `smallest card that proves the migration works before the rest commit to it`

Feel is allowed. Unrecorded feel is not.

### The claim race

Append `claimed`, then re-read `board.jsonl` and fold it again. If another actor
claimed the same card at an earlier `ts`, append `released` with the reason and
pick again. There is no lock. The append is atomic and the earliest `ts` wins.

Equal timestamps are a tie and the incumbent keeps the card, so a claim that
ties with one already on the board loses and releases. `date -u +%FT%TZ`
resolves to the second, which makes ties real rather than theoretical. Only the
owner or the actor the race named as the loser may release a card. A `released`
from anyone else changes nothing and flags the card as a bad write.

### Subagents never write

A subagent never appends to `board.jsonl`. The orchestrator owns the card, reads
the subagent's result, and writes every event on its behalf.

### The transitions

- `claimed` → `in-progress` when work on the card starts.
- `in-progress` → `review` before the per-card adversarial review.
- `review` → `done` when that review passes.
- any live status → `blocked` when the card stops on something a human must
  answer, with the question in `note`.

Each transition is one appended line:

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-03","from":"claimed","to":"in-progress","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Never read-modify-write the file. Never use a JSON array.

## Park and continue

When a card reaches a material decision, move it to `blocked` with the question
in its `note`, then claim the next ready card. The run does not stop.

Ask when the ready set is empty, and ask every parked question together in one
message. If nothing is ready at the moment the card blocks, ask immediately, as
this skill does without a board.

Ask every question still parked in a `blocked` card before you append
`stood-down`, whatever the ready set holds at that point. A `--limit` or
`--tasks` run reaches its budget with cards still ready, so waiting for an empty
ready set would end the run with questions nobody was ever shown.

A permitted non-material adaptation is still made on the spot and recorded in
`execution.md`. Parking is for material decisions only.

## Resume a blocked card

Claim the board again first, in full and under Claim the board above, if this
run appended `stood-down` when it parked the question. Standing down released
the board, another loop was free to take it, and a resume that skips the
re-claim works a board it does not hold.

Blocking parked the card without releasing it. The owner is unchanged, and that
same actor picks it back up once the user answers.

Re-check file ownership before the move. Time passed while the card sat in
`blocked`, and another card holding one of its `files` may have been claimed
since. Resuming into a file another agent is editing is the collision the
`files` check exists to prevent. If one has, append a `note` on the parked card
carrying the answer and the id of the card it now waits on, then come back to it
when that card reaches `done` or `split`. The card stays `blocked` either way,
and without the note the only thing on it is still the original question: the
board shows a card waiting on a human, `/qstack-plan-close` refuses to write
`outcome.md`, and `/qstack-reflect` counts a card that never left `blocked`.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"note","card":"T-05","actor":"adelaide","note":"answered: retries stay on the writer. Waiting on T-09, which holds src/writer.ts."}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Record the answer in `execution.md` before the move, under the rule this skill
already applies to an approved material deviation: what the plan says, what you
learned, and what was approved. The plan stays frozen. Then append the move back
to `claimed` and continue the card.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-05","from":"blocked","to":"claimed","actor":"adelaide","note":"answered: retries stay on the writer"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

## Splitting

A card that proves bigger than its points is split. Append a `created` event for
each child carrying `split_from` set to the parent id and the parent's `refs`,
then append a `split` event for the parent listing the children in `into`.

Children take the next free ids, continuing past the largest id on the board.
Ids run `T-01` upward, zero-padded to two digits, never reused and never
suffixed, so on a board whose last card is `T-11` the parent `T-05` splits into
`T-12` and `T-13`. Two loops that pick ids differently collide on one board, so
this convention is not yours to adapt.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"created","card":"T-12","epic":"board-file","title":"Retry policy on the writer","points":2,"refs":["4.2"],"files":["src/writer.ts"],"depends_on":[],"split_from":"T-05","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"created","card":"T-13","epic":"board-file","title":"Backfill the rows written before it","points":3,"refs":["4.2"],"files":["src/backfill.ts"],"depends_on":["T-12"],"split_from":"T-05","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"split","card":"T-05","into":["T-12","T-13"],"actor":"adelaide","reason":"the writer change and the backfill need separate reviews"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

An `8` is the one card you split before working it. Nothing can claim it, so it
would sit in `backlog` for the whole run, and its `created` event carries a
`note` saying what it splits into. Split it straight from that `note`: children
first, then the `split` closing the parent, exactly as above and with no
`claimed` and no `moved` in front of it. A `split` closes a card out of
`backlog` as readily as out of `in-progress`. The children take the parent's
`depends_on` unless the `note` divides them, and they enter the ready set on the
next fold. The parent ends `split`, which counts as closed, so anything that
depended on the `8` unblocks without another write. If the `note` does not say
what the card splits into, report that card and leave it alone: the breakdown
owed you that sentence, and filling it in yourself is a material deviation
dressed as a board change.

This is a board change, not a plan deviation. The plan stays frozen and the
children cite the same clauses the parent did. It needs no approval, because
points are an estimate and the plan never promised one.

A split redistributes the parent's work and changes nothing else. If the
children would cover more or less than the parent covered, that is a deviation
and the rule above applies.

## Execute and orchestrate

Break the plan into trackable tasks and keep their status current. With a board,
the cards are those tasks and `board.jsonl` is where their status lives. Delegate
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
- with a board, every card is `done` or `split`, every card you claimed is one
  you closed, split, or released under your own slug, and your `stood-down` is
  on the board. Never release a card another actor holds to satisfy this gate.
  Report the holder and the card, and the run is not complete;
- relevant validation passes;
- the final independent review fingerprint matches the current implementation;
- no blocking finding or question remains; and
- `execution.md` accurately reflects all decisions and deviations.

Otherwise leave the status `in-progress` or `blocked`, append `stood-down`
anyway, and state exactly what remains. An incomplete run that keeps the board
holds it against every later run of either loop, and no loop takes a board
over. In the final response, summarize the implementation, validation,
adversarial review, deviations, open questions, and execution file.
