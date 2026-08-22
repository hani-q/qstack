# Board breakdown

How `/qstack-plan-to-html` turns a frozen plan into the units of work agents
claim. Read this file in full before writing a card; the checks near the end
cannot be applied retroactively, because the board file is append-only.

The board is the execution record of the plan: one card per unit of work, moved
by the agent doing the work, never by a reader. It is `board-events.js` in the
plan's own directory, beside `plan.html`. There is one board per plan and it is
written nowhere else.

## What the plan is here

The plan is input and stays unedited. Writing the board starts execution, and a
frozen plan is not amended. A clause that turns out wrong becomes a decision in
`execution.md`, recorded by the execution loop that hits it.

Cards cite `§` clause numbers, so the plan must be `plan.html`. A Markdown plan
has no clause numbers: render it first, then break it down. Reject template,
stencil, and example artifacts, including anything inside `.template/` and an
uninstantiated `plan-template.html`.

Read the whole plan and the repository's instruction files before writing a
card. A breakdown made from a skim cites the wrong clauses.

## Never overwrite an existing board

When `board-events.js` is already there, fold it and look for the breakdown marker:
a `note` from `planner` whose text starts `breakdown complete:`. It is the last
line a finished breakdown writes, and it is how a later run tells a board that
was written whole from one whose write died half way through.

With the marker, the board is the live record of work other agents may be doing
this minute. Report the card count and how many are closed, and stop. Without
it, the stream is either the header-only pre-board placeholder or a breakdown
interrupted after some lanes or cards were written. Finish the write, following
the recovery steps near the end.

The one exception to stopping on a whole board is a user who asks for more cards
on it. Append `created` events only, with ids continuing past the largest id
already in the file, then a fresh marker carrying the new totals. Never renumber
a card, never rewrite a line, never delete one.

## Break the plan down

Epics come from the plan's build order, one per phase, in plan order. A plan
with no build order gives one epic per LLD sheet, skipping sheets that carry no
buildable work. Give each epic a short slug id such as `board-file` and the
phase or sheet title.

Cards come from the plan's individually executable obligations, the same ones
`/qstack-plan-adherence-review` extracts when it scores the work, so the board
and the audit read one contract. Split a compound obligation when its parts can
succeed or fail independently. Do not turn background, rationale, rejected
options, or examples into cards.

Every card carries `epic`, `title`, `points`, `refs`, `files`, and `depends_on`.

- `refs` — the clause numbers the card is built from, written without the sign
  (`"4.2"`); the board renders `§4.2` and deep-links it. A card with no `refs`
  is not a card, it is scope nobody asked for. Drop it and name it in the
  report.
- `files` — repository-relative paths the card will write. A card whose files
  cannot be named from the plan is under-specified. Create it at `8` points with
  a `note` saying what it splits into, so nobody can claim it until it is split.
  An `8` is never ready, and it is not fatal to the board. The loop reports it,
  runs every other card, and splits it from that `note`, after which the
  children enter the ready set normally. Without the `note` there is nothing to
  split it from, which is why the check below refuses a board carrying one.

## Points

Fibonacci, capped, set once at breakdown and never changed. An estimate that
moves is not a signal.

| `points` | Means |
| --- | --- |
| `1` | One file, no review round expected. |
| `2` | Two or three files in one area. |
| `3` | Several files, one review round expected. |
| `5` | A subsystem; expect rework. |
| `8` | Too coarse. Must be split before it can be claimed. |

The set is closed: `1`, `2`, `3`, `5`, `8` and nothing else. Any other value is
a bad write. The execution loops refuse it, the board flags the card, and the
card is never ready, so it stays in the backlog until somebody re-cuts it. A
`13` is not a large card, it is a card whose size nobody thought about. Write
the `8` and the `note` naming what it splits into instead.

Progress is read in points, never in cards: "21 of 55 points". A card count
hides the difference between a 1 and a 5.

## depends_on and files

These two fields are the job. The orchestrator's ready set takes a card only
when its status is `backlog`, every card in its `depends_on` is `done` or
`split`, none of its `files` appear on a card that is `claimed`, `in-progress`,
or `review`, and its `points` are not `8`. A board missing either field on any
card is refused by the execution loops, because there is no safe order to run it
in.

`depends_on` is real ordering only: A needs B's output to exist. It is stored in
one direction, and the board reverses the edges to show "blocks: T-08, T-09".
Do not encode "feels later" as a dependency. Every false edge serializes a swarm
that could have run those cards at the same time.

A dependency on a card that later splits follows the work rather than the id.
The edge resolves to that split's children and stays unsatisfied until every one
of them closes, because the work the downstream card waits on moved into the
children when the parent went `split`. The children inherit the parent's own
`depends_on`, and the fold repairs the reverse edges. The ready-set rule above
still reads `done` or `split`, since the fold has replaced the edge before that
rule runs. So depending on a card you expect to split is safe, and it is the
right thing to write. Name the card that produces the output, not the children
that do not exist yet.

`files` is ownership. Two cards that write the same file need a dependency
between them, or the order they run in is decided by whichever agent claims
first, and the second one writes over a state it did not plan for. Prefer
splitting that file's changes along a dependency the plan already has.

## Check before writing

Refuse to write a board that cannot be executed. Fix the breakdown, or report
and stop, when any of these holds:

- a card cites a clause that does not exist in the plan;
- `depends_on` contains a cycle, however long;
- a card carries `points` outside `1`, `2`, `3`, `5`, `8`;
- an 8-point card carries no `note` naming what it splits into;
- two cards list the same file with no dependency either way;
- an epic has no cards.

Run all six against the cards in memory, before the first `printf`. The file is
append-only, so a bad card cannot be taken back, only noted and split.

## Check the other boards

Fold every other `board-events.js` under the same plan root
(`qstack/compound_engineering/plans/*/board-events.js`). Report any card here whose
`files` are already owned by a card that is `claimed`, `in-progress`, or
`review` on another board. That work is live in another agent's hands, and
planning over it produces a conflict a human resolves by hand.

This is finding 4 of `/qstack-plan-prior-art`, repeated here because breakdown
is the last point at which a collision can be caught before two actors claim the
same file. The rest of that skill's findings belong before the plan was written,
not after it was frozen.

## Write the file

One `printf` per line. Never read-modify-write, never a JSON array, one exact
`qstackBoardEvent({...});` call per line with no newlines inside the object, and
the file always ends with a newline. Write every `epic` event first, then the
`created` events in card-id order, so an interrupted write still folds into
lanes that exist.

`ts` is `date -u +%FT%TZ`. The actor for the breakdown pass is `planner`,
because no agent owns a card yet; later events carry the actor slug the
execution loop resolves for itself.

Count the file's lines before the first append and keep the number. The verify
step compares it against the line count afterwards, and on an append or a
recovery there is no other way to know how many lines this pass wrote.

```bash
board=qstack/compound_engineering/plans/<slug>/board-events.js
if [ ! -e "$board" ]; then
  printf '%s\n' 'qstackBoardEvent({"event":"board","format":1});' > "$board"
fi
before=$(wc -l < "$board" | tr -d ' ')       # 1 for a new, header-only board
printf '%s\n' 'qstackBoardEvent({"ts":"2026-08-22T09:41:00Z","event":"epic","actor":"planner","epic":"board-file","title":"The board file"});' >> "$board"
printf '%s\n' 'qstackBoardEvent({"ts":"2026-08-22T09:41:00Z","event":"created","actor":"planner","card":"T-01","epic":"board-file","title":"Fold board-events.js into cards","points":3,"refs":["4.2"],"files":["skills/qstack-plan-to-html/template/v1/board.js"],"depends_on":[]});' >> "$board"
printf '%s\n' 'qstackBoardEvent({"ts":"2026-08-22T09:41:01Z","event":"created","actor":"planner","card":"T-02","epic":"board-file","title":"Draw lanes and columns","points":5,"refs":["4.3","4.4"],"files":["skills/qstack-plan-to-html/template/v1/board.js","skills/qstack-plan-to-html/template/v1/plan.css"],"depends_on":["T-01"]});' >> "$board"
printf '%s\n' 'qstackBoardEvent({"ts":"2026-08-22T09:41:02Z","event":"note","actor":"planner","card":"T-02","note":"breakdown complete: 2 cards, 8 points"});' >> "$board"
```

Card ids run `T-01` upward in creation order, zero-padded to two digits, and are
never reused. A child of a split is a new card and takes the next free number
like any other: splitting `T-05` on a board whose largest id is `T-11` gives
`T-12` and `T-13`, never `T-05a`. The parent keeps its own id, ends `split`, and
each child names it in `split_from`. `points` is a number, not a string. `refs`,
`files`, and `depends_on` are arrays, empty when there is nothing in them, and
`files` may be empty only on an 8-point card.

A `note` event is a comment on a card that changes nothing about it. It carries
`card`, `actor`, and `note`, and no status field, so the fold reads it and moves
on. Prefer the `note` field on the event that actually happened: a review round
belongs on the `moved` into `review`, a blocking question on the `moved` into
`blocked`, and what an 8-point card splits into on its own `created`. Write the
standalone event only when there is no event to hang the comment on. The
breakdown marker is the only one this file writes.

The marker is the last line of the write, a `note` on the highest card id
reading `breakdown complete: N cards, P points`, where `N` and `P` count every
card `planner` has created on this board, including cards an earlier pass wrote.
Nothing else in the file records that the write finished, because every other
line looks the same whether the run survived to the next `printf` or not. A
later reader folds the board, counts the cards `planner` created, and matches
that against `N`. Split children are created by execution actors rather than
`planner`, so the count still holds after a split. A second breakdown pass
writes a second marker, and the last one in file order is the board's.

## Finish an interrupted board

A board with no marker is empty or was interrupted part way through its write.
Finishing it is safe even if an agent has claimed one of the cards that did get
written, because recovery only appends cards the fold does not know.

1. Run `node --check "$board"`. If it fails, stop. A partial JavaScript call
   prevents the browser from executing every earlier event too, and repairing
   it requires changing the file while another actor may be appending. Name the
   syntax error and leave recovery to a human who has stopped all board writers.
2. Take the line count now.
3. Break the plan down again from the same `plan.html`, by the same rules. Same
   input, same obligations, so the two breakdowns should agree.
4. Match what you rebuilt against what the fold knows, by `refs` and title.
5. Append the epics the fold does not know, then the cards it does not know,
   with ids continuing past the largest id in the file.
6. Append the marker, counting every card `planner` created: the ones already
   there and the ones you just wrote.

Never re-append an `epic` or a `created` for something the fold already has,
even when its fields differ from what you just rebuilt. A card on disk is
written. A wrong one is noted and split by the loop that reaches it, never
rewritten, and the difference goes in your report.

The board is whole again when the marker is the last line and the number of
cards `planner` created matches its `N`.

## Verify

1. Run `node --check board-events.js`, confirm its first call is the format
   header, then re-read and fold the remaining calls. Confirm the fold
   gives the card count and point total you meant to write, and that `wc -l`
   minus the `before` count equals the number of `printf` calls you made. Only
   the delta holds in all three cases, since `before` includes the format header
   on a first write and all earlier calls on an append or recovery.
2. Confirm the marker is the last line and its `N` matches the cards `planner`
   created.
3. Confirm every id in a `depends_on` names a card the fold knows.
4. Open `plan.html#board` directly from disk and confirm the lanes are your
   epics, the column counts match the fold, and no card is flagged. Repeat over
   HTTP with `qstack/scripts/serve.sh` or `/qstack-serve-plans`.

Say which of these you checked.

## What to report back

The epics and the cards in each, the card count, the total points, the largest
card and why it is that size, anything dropped for having no `refs`, and any
cross-board conflict. Say whether this pass wrote a new board, added cards to
one, or finished an interrupted one, and for a recovery how many cards were
already on disk and how many you added. `/qstack-plan-to-html` folds this into
its own report.
