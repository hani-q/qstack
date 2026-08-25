# The board protocol

How a QStack execution loop works a plan that has a board.
`/qstack-loop-no-nonsense` and `/qstack-loop-trequartista` both read this file
and follow it exactly. It is written once so the two cannot drift, which they
did twice while these rules lived in both skills. Read it in full before you
fold a board; `board-events.js` is append-only, so a wrong event can be noted and
split, never taken back.

Every nonblank line is one exact `qstackBoardEvent({...});` call. The first is
the required `{"event":"board","format":1}` header; validate it and exclude it
from card-event counts. Validate the whole file with
`node --check board-events.js` before folding it. Stop on a syntax error because
the browser cannot execute any part of a malformed script. For a non-browser
fold, remove the fixed prefix and suffix, parse the object as JSON, then apply
the events in file order. A valid call carrying an unusable value is counted
and skipped; broken JavaScript is a board-level fault.

This file decides how the board moves. It does not decide how strictly the plan
is followed. Each loop keeps its own strictness rule, its own execution record,
and its own completion gate, and where a loop sharpens something here it names
the rule it sharpens rather than restating it.

## Resolve the board

Look for `board-events.js` beside the plan.

If the retired `board.jsonl` exists instead, run the migration script from the
installed `qstack-plan-to-html/template/` directory, then re-resolve the board.
If both files exist, stop and ask which log is canonical. Never fold both.

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
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"coordinator","actor":"adelaide"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
```

## The ready set

A card is ready when all four hold:

1. its status is `backlog`;
2. every card in its `depends_on` is `done` or `split`, and where a named card
   is `split`, every child of that split is `done` or `split` too;
3. its `files` array is non-empty, and none of its `files` appear in the
   `files` of any card currently `claimed`, `in-progress`, `review`, or
   `blocked`;
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

Condition 3 compares paths as strings, so normalise before comparing:
repository-relative, no leading `./`, no `..` segment, no trailing slash, and
resolved through any symlink. Compare case-insensitively as well, since macOS
and Windows checkouts treat `src/User.ts` and `src/user.ts` as one file while
the string check reads two. A card whose path cannot be normalised to a file
inside the repository is a bad write: report it and leave it for a human.
Aliases that slip through are the collision this condition exists to prevent,
wearing a different spelling.

Condition 3 refuses an empty `files` array because such a card reserves
nothing: it collides with no other card, excludes no other card, and its own
review has no paths to look at. The breakdown writes one only on an
under-specified `8`, which condition 4 already keeps out, so an empty `files`
array on any other card is a bad write. Report it and leave it for a human.

Either exclusion costs you that card and nothing else; the rest of the board
runs.

Condition 1 leaves a `blocked` card out of the ready set, and it never re-enters
it. Blocking did not release the card, so it comes back to work under Resume a
blocked card below, with the owner it already has.

Condition 3 keeps a `blocked` card's `files` too, for the same reason. A card
parked mid-work leaves unfinished edits in those paths, and handing them to
another card gives it a file carrying half of somebody else's work, which its
own restricted review then reads as its own. So a blocked card holds its ground
until it is answered. That does stall every card sharing one of its paths, which
is the honest cost: the alternative is two cards writing one file and neither
review able to say which wrote what. Parked questions are asked before the run
stands down, so the stall has a way out.

## The pick

Which ready card to take is judgment. Put the reason in the `claimed` event's
`reason` field, in the few words you would actually say:

- `"unblocks four cards"`;
- `"same files as T-04, still open in front of me"`;
- `"smallest card that proves the schema is right"`.

Feel is allowed. Unrecorded feel is not.

This section picks one card. How many you pick is The wave below.

## The claim race

Claim by appending one line:

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"claimed","card":"T-03","actor":"adelaide","reason":"unblocks four cards"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
```

Then re-read the file and fold it again. If another actor claimed the same card
at an earlier `ts`, you lost it. Append `released` with the reason and pick again
from the ready set. Equal timestamps are a tie and the incumbent keeps the card,
because `date -u +%FT%TZ` has one-second resolution and ties are real. There is
no lock and nothing waits.

Release only a card you own or a card you just lost. A `released` from any other
actor changes nothing and flags the card, which is a bad write someone has to
read later.

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"released","card":"T-03","actor":"adelaide","reason":"lost the claim to bujumbura"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
```

Filling a wave makes this a routine event rather than a rare one. A card claimed
and then not dispatched, because the run hit its `--limit` or ended, is released
the same way.

## The wave

The wave is the set of cards you hold at once. It is four cards wide unless the
loop's `--parallel N` says otherwise, and `--parallel 1` is the serial run this
protocol used to describe. That number lives here and nowhere else, so both
loops mean the same thing by it.

`depends_on` and `files` exist to say which cards do not need each other, and a
breakdown spends real effort keeping false edges off the board so cards can run
at the same time. Taking one card at a time discards that and runs the board in
single file.

Fill the wave by repeating The pick and The claim race. Keep going until one of
these stops you, and these are the only four:

1. the ready set is empty;
2. the wave is full;
3. the next card would take the run past its `--limit`;
4. the host has no agent tools, which caps the wave at one.

**If the ready set offers a card and none of those four applies, you claim it.**
Preferring to finish the card in front of you is not on the list. Neither is
finding one card easier to hold in your head, nor judging the wave too wide to
follow: `--parallel` already decided the width, and it was chosen in the
invocation by someone who knew what they were running. Every card you decline to
claim under an unlisted reason is the serial loop this section exists to end.

Nothing new keeps the wave safe. Claim a card, re-read the file, and fold it
again, exactly as The claim race already requires. That card is now `claimed`,
so condition 3 of the ready set drops every card sharing one of its `files`
before you pick the next one. The check that keeps two actors off one file is
the same check that keeps two of your own cards off one file. It only works in
that order: claim, refold, pick, and never more than one card between folds.
Choosing several cards from a single fold skips the file check for every card
after the first, which is the collision the check exists to prevent, caused by
one agent instead of two.

A card counts against `--limit` from the moment you claim it, not when it
closes. A card that ends `blocked` or `released` gives its budget back. Counting
at the close instead lets a wave of four claim past a `--limit 4` while three
cards are still open.

A card resumed from `blocked` counts against `--parallel` like any other, so
make room for it before the move back to `claimed`.

## Dispatch

Dispatch one subagent per card in the wave, each given only that card. Tell it
the paths it may write, which are exactly that card's `files`, and require it to
report back every path it actually wrote.

Without agent tools there is no wave. Hold one card, finish it, take the next,
and name in the report the agent tool you looked for and did not find.
Interleaving several cards yourself is one card at a time with extra
bookkeeping and a working tree nobody owns.

If your agent tool returns results only as a batch rather than one at a time,
that batch is the wave: fold and refill when it returns, and say so in the
report. Do not shrink the wave to one to get results back sooner.

Refill as cards close, not when the wave empties. A card reaching `done` or
`split` releases its `files` and can satisfy a `depends_on`, so fold the board
and pick again the moment one closes. A wave that waits for its slowest card
before folding again spends most of the run at one live card, which is the
serial loop with extra steps.

## What a card owns

A card's `files` are the paths it may write, and the ready set treats them as
owned for as long as the card is `claimed`, `in-progress`, or `review`. That
ownership is the whole safety argument for running cards side by side, so check
it rather than trusting it. Instructions to a subagent are not concurrency
control.

Before a card moves to `review`, work out which paths it actually wrote and
compare them against its `files`. Derive that set yourself from the working
tree, with `git status --porcelain` before dispatch and again after the card
reports, rather than taking the subagent's word for it. A subagent that writes
outside its `files` and leaves that path out of its report defeats a check built
on the report alone, and it is the same subagent either way.

Any path outside the card's `files` is a blocking finding on that card: the card
wrote into ground another card may own, and no restricted diff can show you
that, because a diff restricted to the card's `files` is exactly where the stray
path is not. Record the finding, move the card to `blocked`, and check whether a
live card owns the stray path. If one does, its own work is now mixed with this
card's and both need a human.

A wave of subagents writing one tree makes the two `git status` runs ambiguous
on their own, because a sibling's writes land between them. Attribute a changed
path to the card whose `files` contain it. A changed path no live card's `files`
contain belongs to whichever card was running when it appeared, and if more than
one was, say so and stop: an unattributable write is the failure this check
exists to catch, not a detail to resolve by guessing.

A card's review sees the diff restricted to that card's `files`, including
untracked files under those paths, plus the list of paths the subagent reported.
Restricting it is what lets a wave run at all: sibling cards are mid-edit in the
same working tree, and a reviewer handed the whole diff reports their unfinished
work as this card's missing requirements and unrequested code. The reported-path
list is what keeps the restriction from hiding the one thing it would otherwise
hide.

Validation is scoped the same way, with attribution required rather than
deferred. When a check fails on a file this card never touched, name the live
sibling card whose `files` the failure traces to and record it on both cards. If
you cannot name one, the failure belongs to this card and the card does not
leave `in-progress`. A regression is by definition a failure in code you did not
touch, so a rule that waved these through unattributed would discount the exact
signal that catches one.

## Subagents never write

A subagent never appends to `board-events.js`. The orchestrator owns the card, reads
the subagent's result, and writes every event on its behalf, including what the
subagent reports back.

This is what makes a wave writable at all. Every event in the file comes from
one process appending one line at a time, so a whole wave still produces
one ordered log and the claim, refold, pick sequence still sees a file that is
not moving under it. Subagents appending their own events would interleave
mid-line and leave a board that `node --check` rejects.

## The transitions

- `claimed` → `in-progress` when work on the card starts, which in a wave is
  when that card's subagent is dispatched.
- `in-progress` → `review` before that card's adversarial review.
- `review` → `done` when that review passes.
- any live status → `blocked` when the card stops on something a human must
  answer, with the question in `note`.

Each card in a wave moves through these on its own. Cards do not advance in
step, and there is no wave-level status.

Each transition is one appended line:

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-03","from":"claimed","to":"in-progress","actor":"adelaide"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
```

Never read-modify-write the file. Never use a JSON array. Keep the exact call
wrapper: raw JSON is not executable and makes both `file://` and HTTP views fail.

## Park and continue

A card that stops on something a human must answer moves to `blocked` with the
question in its `note`, and the run does not stop. The rest of the wave keeps
going and you refill it from the ready set. Which questions park is the loop's
own rule; parking changes when a question is asked, never whether.

A blocked card keeps its `files`, under condition 3 of the ready set, because
its unfinished edits are still sitting in them. Name in the same `note` which of
its `files` you actually wrote to, so whoever answers the question knows what
state the tree is in. Cards sharing those paths wait until this one is answered.
If that stalls more of the board than the question is worth, revert the card's
edits and `released` it instead: a card with nothing written owns nothing, and
the question can be asked without holding the paths hostage.

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-05","from":"in-progress","to":"blocked","actor":"adelaide","note":"§4.2 gives retries to the writer, but the client already retries. Which one keeps them?"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
```

Ask when the ready set is empty and no card is still in flight, and ask every
parked question in one round. Both halves matter in a wave: an empty ready set
with three cards still running is the normal middle of a run, and stopping to
ask there wastes the work those three are doing. If nothing is ready and nothing
is running at the moment the card blocks, ask immediately.

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

A card that kept its `files` resumes straight into them, because condition 3 of
the ready set held them for the whole park and nothing else could claim them.
Re-check anyway before the move: a card `released` after its edits were reverted
gave its paths up, and one of them may be claimed now. If it is, append a `note`
on the parked card carrying the answer and the id of the card it now waits on,
then come back to it when that card reaches `done` or `split`. The card stays
`blocked` either way, and without the note the only thing on it is still the
original question: the board shows a card waiting on a human,
`/qstack-plan-close` refuses to write `outcome.md`, and `/qstack-reflect` counts
a card that never left `blocked`.

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"note","card":"T-05","actor":"adelaide","note":"answered: the client keeps the retries. Waiting on T-09, which holds src/writer.ts."});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
```

Record the answer in `execution.md` before the move, under the loop's own rule
for an approved answer. The plan stays frozen either way. Then append the move
back to `claimed` and continue the card.

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"moved","card":"T-05","from":"blocked","to":"claimed","actor":"adelaide","note":"answered: the client keeps the retries, the writer does not add them"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
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
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"created","card":"T-12","epic":"board-file","title":"Retry policy on the writer","points":2,"refs":["4.2"],"files":["src/writer.ts"],"depends_on":[],"split_from":"T-05","actor":"adelaide"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"created","card":"T-13","epic":"board-file","title":"Backfill the rows written before it","points":3,"refs":["4.2"],"files":["src/backfill.ts"],"depends_on":["T-12"],"split_from":"T-05","actor":"adelaide"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"split","card":"T-05","into":["T-12","T-13"],"actor":"adelaide","reason":"the writer change and the backfill need separate reviews"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
```

Every child carries a non-empty `files` array, which is condition 3 of the
ready set. Splitting an `8` is where its missing `files` get written, so a split
that leaves a child with none has produced a card nothing can ever claim.

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

Empty the wave first. Every card you claimed reaches `done`, `split`, `blocked`,
or `released` under your own slug before you stand down. A card left `claimed` or
`in-progress` by a run that has ended is unclaimable by every later run, and
nothing takes it back automatically.

```bash
printf '%s\n' 'qstackBoardEvent({"ts":"'"$(date -u +%FT%TZ)"'","event":"stood-down","actor":"adelaide"});' \
  >> qstack/compound_engineering/plans/<slug>/board-events.js
```

Never release a card another actor holds to close your own run out. Report the
holder and the card instead. An incomplete run that keeps the board holds it
against every later run of either loop, and no loop takes a board over.
