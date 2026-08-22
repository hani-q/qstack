# The board protocol

How a QStack execution loop works a plan that has a board.
`/qstack-loop-no-nonsense` and `/qstack-loop-trequartista` both read this file
and follow it exactly. It is written once so the two cannot drift, which they
did twice while these rules lived in both skills. Read it in full before you
fold a board; `board.jsonl` is append-only, so a wrong event can be noted and
split, never taken back.

This file decides how the board moves. It does not decide how strictly the plan
is followed. Each loop keeps its own strictness rule, its own execution record,
and its own completion gate, and where a loop sharpens something here it names
the rule it sharpens rather than restating it.

## Resolve the board

Look for `board.jsonl` beside the plan.

With no board, the loop runs as it runs without one. The whole plan is the unit
of work, and the `## Progress` checklist in `execution.md` is the progress
record. Existing plans keep working and nothing else here applies.

With a board, the board is the progress record. `execution.md` drops its
`## Progress` section and keeps design decisions, deviations, tradeoffs, open
questions, validation, and adversarial reviews. One record per concern, so the
two cannot drift.

Fold the board before claiming anything. Refuse the whole board on one fault
only: a card missing `depends_on` or `files`. Without both fields the ready set
is not computable, so there is no safe order to run any card in. Name every card
that is missing a field and stop; that board needs a human. An empty `files`
array is present, not missing, and the breakdown writes one on an
under-specified `8`.

A card the ready set can never take is a per-card exclusion, not a board
failure. Report it, run every other card, and handle it under The ready set
below.

Resolve your actor slug once per session: the Conductor workspace directory
name, else the current Git branch name with `/` replaced by `-`, else `agent`.
It must match `[a-z0-9][a-z0-9-]*`. Use that same slug in every event you write.

## Claim the board

One coordinator per board. Two is forbidden, not resolved, so this happens
before you look at a single card. Fold the board and look for a `coordinator`
event with no later `stood-down` from the same actor:

- A different actor holds it. Stop, and name the holder and the cards it owns.
  Do not take over, do not wait, do not claim a card. Waiting and retrying is a
  takeover with extra steps.
- You hold it. This is your own run resuming. Continue.
- Nobody holds it. Append your own `coordinator`, re-read the file, and if
  another actor's `coordinator` appears before yours in the file, append
  `stood-down` and stop. That closes the window where two loops start on an
  empty board in the same second.

Break that tie on file order, never on `ts`. Two loops that start in the same
second write the same stamp, because `date -u +%FT%TZ` resolves to the second,
so a `ts` comparison ties and neither loop yields in exactly the case the rule
exists to close. Appends are ordered, so file order is total and always decides.

Your `stood-down` releases your own hold and nothing else. It never clears
another actor's `coordinator`, so the loser of that race leaves the winner
holding the board.

Two coordinators break the `files` check. Each one picks a card the other has
not claimed yet, each one sees no file overlap with anything `claimed`,
`in-progress`, or `review`, and both are right about what the board says, since
neither is looking at the other's pending choice. Two agents then write the same
file at once. One coordinator cannot race itself.

There is no automatic takeover, ever. A board whose coordinator never stood down
needs a human. Report the holder and the cards it owns, and stop.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"coordinator","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

## The ready set

A card is ready when all four hold:

1. its status is `backlog`;
2. every card in its `depends_on` is `done` or `split`, and where a named card
   is `split`, every child of that split is `done` or `split` too;
3. none of its `files` appear in the `files` of any card currently `claimed`,
   `in-progress`, or `review`;
4. its `points` are `1`, `2`, `3`, or `5`.

Condition 2 follows a split through to its children because the parent's work
moved into them. Read the parent's own `split` as satisfying the dependency and
a downstream card starts the moment the parent closes, while the work it waits
on is still open in a child.

Condition 4 is the closed points set: `1`, `2`, `3`, `5`, `8` and nothing else.
An `8` is never ready and never becomes ready by being worked. It reaches the
ready set as its children, so split it from the `note` on its `created` event
and take those. Points outside the set are a bad write: the board flags the
card, it is never ready, and there is no `note` to split it from, so report it
and leave it for a human. A `13` is not a large card, it is a card whose size
nobody thought about.

Either exclusion costs you that card and nothing else; the rest of the board
runs.

Condition 1 leaves a `blocked` card out of the ready set, and it never re-enters
it. Blocking did not release the card, so it comes back to work under Resume a
blocked card below, with the owner it already has.

## The pick

Which ready card to take is judgment. Put the reason in the `claimed` event's
`reason` field, in the few words you would actually say:

- `"unblocks four cards"`;
- `"same files as T-04, still open in front of me"`;
- `"smallest card that proves the schema is right"`.

Feel is allowed. Unrecorded feel is not.

## The claim race

Claim by appending one line:

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"claimed","card":"T-03","actor":"adelaide","reason":"unblocks four cards"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Then re-read the file and fold it again. If another actor claimed the same card
at an earlier `ts`, you lost it. Append `released` with the reason and pick again
from the ready set. Equal timestamps are a tie and the incumbent keeps the card,
because `date -u +%FT%TZ` has one-second resolution and ties are real. There is
no lock and nothing waits.

Release only a card you own or a card you just lost. A `released` from any other
actor changes nothing and flags the card, which is a bad write someone has to
read later.

## Subagents never write

A subagent never appends to `board.jsonl`. The orchestrator owns the card, reads
the subagent's result, and writes every event on its behalf, including what the
subagent reports back.

## The transitions

- `claimed` → `in-progress` when work on the card starts.
- `in-progress` → `review` before that card's adversarial review.
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

A card that stops on something a human must answer moves to `blocked` with the
question in its `note`, and you take the next ready card instead of stopping the
run. Which questions park is the loop's own rule; parking changes when a
question is asked, never whether.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-05","from":"in-progress","to":"blocked","actor":"adelaide","note":"§4.2 gives retries to the writer, but the client already retries. Which one keeps them?"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Ask when the ready set is empty, and ask every parked question in one round. If
nothing is ready at the moment the card blocks, ask immediately.

Ask every question still parked in a `blocked` card before you append
`stood-down`, whatever the ready set holds at that point. A `--limit` or
`--tasks` run reaches its budget with cards still ready, so waiting for an empty
ready set would end the run with questions nobody was ever shown.

## Resume a blocked card

Claim the board again first, in full and under Claim the board above, if this
run appended `stood-down` when it parked the question. Standing down released
the board, another loop was free to take it, and a resume that skips the
re-claim works a board it does not hold.

Blocking never released the card. Its owner did not change, so the actor that
parked it is the actor that resumes it, with one `moved` from `blocked` back to
`claimed`.

Re-check file ownership before the move. Time passed while the card sat parked,
and another card holding one of its `files` may have been claimed since.
Resuming into a file another agent is editing is the collision the `files` check
exists to prevent. If one has been claimed, append a `note` on the parked card
carrying the answer and the id of the card it now waits on, then come back to it
when that card reaches `done` or `split`. The card stays `blocked` either way,
and without the note the only thing on it is still the original question: the
board shows a card waiting on a human, `/qstack-plan-close` refuses to write
`outcome.md`, and `/qstack-reflect` counts a card that never left `blocked`.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"note","card":"T-05","actor":"adelaide","note":"answered: the client keeps the retries. Waiting on T-09, which holds src/writer.ts."}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Record the answer in `execution.md` before the move, under the loop's own rule
for an approved answer. The plan stays frozen either way. Then append the move
back to `claimed` and continue the card.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-05","from":"blocked","to":"claimed","actor":"adelaide","note":"answered: the client keeps the retries, the writer does not add them"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

## Splitting

A card that proves bigger than its `points` is split instead of pushed through.
Append one `created` event per child, each carrying `split_from` set to the
parent and the parent's `refs`, then a `split` event closing the parent into
them.

Children take the next free ids, continuing past the largest id on the board.
Ids run `T-01` upward, zero-padded to two digits, never reused and never
suffixed, so on a board whose last card is `T-11` the parent `T-05` splits into
`T-12` and `T-13`. Two loops that pick ids differently collide on one board.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"created","card":"T-12","epic":"board-file","title":"Retry policy on the writer","points":2,"refs":["4.2"],"files":["src/writer.ts"],"depends_on":[],"split_from":"T-05","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"created","card":"T-13","epic":"board-file","title":"Backfill the rows written before it","points":3,"refs":["4.2"],"files":["src/backfill.ts"],"depends_on":["T-12"],"split_from":"T-05","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"split","card":"T-05","into":["T-12","T-13"],"actor":"adelaide","reason":"the writer change and the backfill need separate reviews"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Children inherit the parent's own `depends_on` unless the `note` divides them:
they wait on whatever the parent waited on. The edges pointing the other way are
the ones that need repairing, and the fold repairs them by rule rather than by a
write, because the file is append-only and no line can be re-pointed. A card
whose `depends_on` names the parent now waits on the whole split and unblocks
when the last child reaches `done` or `split`, which is condition 2 of the ready
set. The parent's `split` closes the parent, not the work.

An `8` is the one card you split before working it. Nothing can claim it, so it
would sit in `backlog` for the whole run, and its `created` event carries a
`note` saying what it splits into. Split it straight from that `note`: children
first, then the `split` closing the parent, exactly as above and with no
`claimed` and no `moved` in front of it. A `split` closes a card out of
`backlog` as readily as out of `in-progress`, and the children enter the ready
set on the next fold. If the `note` does not say what the card splits into,
report that card and leave it alone: the breakdown owed you that sentence.

Splitting is a board change, not a plan deviation, so it needs no approval.
`points` are an estimate and the plan never promised one. The plan stays frozen
and the children cite the same `§` clauses the parent cited.

A split redistributes the parent's work and changes nothing else. Children that
would cover more or less than the parent covered are a deviation, and the loop's
own rule decides what happens next.

## Standing down

Append `stood-down` when the run ends, on every exit path: the completion gate
passed, the run was abandoned, or it stopped on a question.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"stood-down","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Never release a card another actor holds to close your own run out. Report the
holder and the card instead. An incomplete run that keeps the board holds it
against every later run of either loop, and no loop takes a board over.
