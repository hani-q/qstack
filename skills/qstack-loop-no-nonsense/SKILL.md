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

Look for `board.jsonl` beside the plan.

With no board, run exactly as this skill runs without one. The whole plan is
the unit of work, and the `## Progress` checklist in `execution.md` is the
progress record. Existing plans keep working and nothing else here applies.

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

A card at `8` points is a per-card exclusion, not a board failure. It is never
ready and nobody can claim it, so report it, run every other card, and split it
from its `note` under Splitting below.

Resolve your actor slug once per session: the Conductor workspace directory
name, else the current Git branch name with `/` replaced by `-`, else `agent`.
It must match `[a-z0-9][a-z0-9-]*`. Use that same slug in every event you write.

## Claim the board

One coordinator per board. Two is forbidden, not resolved, so this happens
before you look at a single card. Fold the board and look for a `coordinator`
event with no later `stood-down` from the same actor:

- A different actor holds it. Stop, and name the holder and the cards it owns.
  Do not take over, do not wait, do not claim a card.
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

Append `stood-down` when the run ends, on every exit path: the completion gate
passed, the run was abandoned, or it stopped on a question.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"stood-down","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

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

## Progress  <!-- omit when board.jsonl exists; the board is the progress record -->
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

A card is ready when all four hold:

1. its status is `backlog`;
2. every card in its `depends_on` is `done` or `split`;
3. none of its `files` appear in the `files` of any card currently `claimed`,
   `in-progress`, or `review`;
4. its `points` are not `8`.

Condition 4 never clears by working the card. An `8` reaches the ready set only
as its children, so split it from its `note` and take those. Leaving it out
costs you that card and nothing else; the rest of the board runs.

A `blocked` card is not in the ready set and never re-enters it. Blocking did
not release it, so it comes back to work through the resume path below, under
the owner it already has.

Which ready card to take is judgment. Put the reason in the `claimed` event's
`reason` field, in the few words you would actually say:

- `"unblocks four cards"`;
- `"same files as T-04, still open in front of me"`;
- `"smallest card that proves the schema is right"`.

Feel is allowed. Unrecorded feel is not.

Claim by appending one line:

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"claimed","card":"T-03","actor":"adelaide","reason":"unblocks four cards"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Then re-read the file. If another actor claimed the same card at an earlier
`ts`, you lost it. Append `released` with the reason and pick again from the
ready set. Equal timestamps are a tie and the incumbent keeps the card, because
`date -u +%FT%TZ` has one-second resolution and ties are real. There is no lock
and nothing waits.

Release only a card you own or a card you just lost. A `released` from any other
actor changes nothing and flags the card, which is a bad write someone has to
read later.

Subagents never write to the board. You own the card and append on their
behalf, including what they report back.

Every status change is one appended `moved` line:

- `claimed` to `in-progress` when work on the card starts;
- `in-progress` to `review` before that card's adversarial review;
- `review` to `done` when the review passes;
- any live status to `blocked` when the card stops on something a human must
  answer, with the question in `note`.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-03","from":"in-progress","to":"review","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

## Park and continue

A card that cannot be done as written moves to `blocked` with the question in
its `note`, and you take the next ready card instead of stopping the run.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-05","from":"in-progress","to":"blocked","actor":"adelaide","note":"§4.2 gives retries to the writer, but the client already retries. Which one keeps them?"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Ask when the ready set is empty, and ask every parked question in one round. If
nothing is ready at the moment the card blocks, ask immediately, as this skill
does today.

Ask every question still parked in a `blocked` card before you append
`stood-down`, whatever the ready set holds at that point. A `--limit` or
`--tasks` run reaches its budget with cards still ready, so waiting for an empty
ready set would end the run with questions nobody was ever shown.

Parking changes when the question is asked, never whether. The rule above holds
in full: the conflicting change is not made, nothing is guessed in place of an
answer, and no departure from the plan happens without explicit approval. A
parked question is still a blocking question, and the run cannot complete while
one is open.

## Resume a blocked card

Claim the board again first, in full and under Claim the board above, if this
run appended `stood-down` when it parked the question. Standing down released
the board, another loop was free to take it, and a resume that skips the
re-claim works a board it does not hold.

Blocking never released the card. Its owner did not change, so the actor that
parked it is the actor that resumes it, with one `moved` from `blocked` back to
`claimed`.

Re-check file ownership before the move. Time passed while the card sat parked,
and another card holding one of its `files` may have been claimed since. If one
has, append a `note` on the parked card carrying the answer and the id of the
card it now waits on, then come back to it when that card reaches `done` or
`split`. The card stays `blocked` either way, and without the note the only
thing on it is still the original question: the board shows a card waiting on a
human, `/qstack-plan-close` refuses to write `outcome.md`, and `/qstack-reflect`
counts a card that never left `blocked`.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"note","card":"T-05","actor":"adelaide","note":"answered: the client keeps the retries. Waiting on T-09, which holds src/writer.ts."}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Record the answer in `execution.md` before the move. If it approves a departure
from the plan, it is an approved deviation under the rule above, and approval
does not rewrite the frozen plan.

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
`T-12` and `T-13`.

```bash
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"created","card":"T-12","epic":"board-file","title":"Retry policy on the writer","points":2,"refs":["4.2"],"files":["src/writer.ts"],"depends_on":[],"split_from":"T-05","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"created","card":"T-13","epic":"board-file","title":"Backfill the rows written before it","points":3,"refs":["4.2"],"files":["src/backfill.ts"],"depends_on":["T-12"],"split_from":"T-05","actor":"adelaide"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
printf '%s\n' '{"ts":"'"$(date -u +%FT%TZ)"'","event":"split","card":"T-05","into":["T-12","T-13"],"actor":"adelaide","reason":"the writer change and the backfill need separate reviews"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

Never read-modify-write the file. Never use a JSON array.

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
owed you that sentence and guessing at it is scope nobody approved.

This is a board change, not a plan deviation, so it needs no approval. `points`
are an estimate and the plan never promised one. The plan stays frozen and the
children cite the same `§` clauses the parent cited.

A split redistributes the parent's work and changes nothing else. If the
children would cover more or less than the parent covered, that is a deviation
and the rule above applies.

## Execute and orchestrate

With a board, the cards are the trackable tasks and the board is their status.
Take one ready card, move it through the transitions above, and keep no second
list. Without a board, break the plan into trackable tasks and keep their status
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
- with a board, every card is `done` or `split`, every card you claimed is one
  you closed, split, or released under your own slug, and your `stood-down` is
  on the board. Never release a card another actor holds to satisfy this gate.
  Report the holder and the card, and the run is not complete;
- the final independent review fingerprint matches the current implementation;
- no blocking finding or question remains; and
- `execution.md` accurately reflects all decisions and approved deviations.

Otherwise leave the status `in-progress` or `blocked`, append `stood-down`
anyway, and state exactly what remains. In the final response, summarize the
implementation, validation, adversarial review, approved deviations, open
questions, and execution file.
