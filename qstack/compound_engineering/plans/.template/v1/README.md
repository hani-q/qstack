# Plan template v1 — "cyanotype & redline"

The house style for HTML plan documents in this repo. Every plan under
`qstack/compound_engineering/plans/` uses it. This file is the component
reference.

## The idea

A plan is a **controlled document**, not a landing page. So it opens with a
title block instead of a hero, every clause is numbered so it can be cited in
review, and every section carries a status stamp so a reader knows what is
settled before they read a word of it.

The print is blue and white — a cyanotype, the ancestor of the blueprint. The
only warm colour on the page is the **redline**: the reviewer's pencil. It marks
reading position, hover intent, and anything that blocks a ship. Spend it
nowhere else, and the document stays legible at a glance.

- **Display / labels** — Archivo, a grotesque, at document scale. Not 100px.
- **Body** — Source Serif 4. Plans are read, not skimmed.
- **Metadata** — IBM Plex Mono for every ID, table name, status and number.

Fonts are self-hosted in `fonts/`, so a plan works offline and survives being
emailed as a file.

## Files

| File | What it is |
| --- | --- |
| `plan.css` | The whole design system. Never fork it into a plan. |
| `plan.js` | Numbering, spine, deep links, tabs, stamps, theme. Progressive. |
| `pretext.js` | Optional, and usually skip it — see the caveat below. |
| `board.js` | The execution board: folds `board.jsonl` into swimlanes. Read-only. |
| `plan-template.html` | The stencil. Copy it; don't open it in place. |
| `fonts/` | Self-hosted woff2. |

## Starting a plan

```bash
mkdir -p qstack/compound_engineering/plans/<slug>
cp qstack/compound_engineering/plans/.template/v1/plan-template.html \
  qstack/compound_engineering/plans/<slug>/plan.html
```

The template source lives at
`qstack/compound_engineering/plans/.template/v1/`; copy its stencil to the
feature directory shown above. The asset paths are already correct for that
destination, and the server can reach everything inside one directory tree.
Plan-specific CSS — a prototype, a diagram, anything one document needs — goes
in `qstack/compound_engineering/plans/<slug>/<name>.css`, loaded after
`plan.css`. It never goes into the template.

Serve every plan in the repository with:

```bash
./qstack/scripts/serve.sh
```

Then open `http://127.0.0.1:8000/plans/<slug>/plan.html`. Pass a port as the
first argument when 8000 is unavailable.

## The authoring contract

A sheet is a section. Give it an `id`, a `data-title`, and a `data-status`, and
the spine, the numbering and the legend build themselves:

```html
<section class="sheet" id="architecture" data-title="Architecture" data-status="locked">
  <div class="sheet-head">
    <div>
      <p class="sheet-mark"><span class="num"></span><span class="label">System architecture</span></p>
      <h2>The sentence a reader should leave with.</h2>
    </div>
    <span class="stamp">Locked</span>
  </div>
  <p class="sheet-lede">One paragraph of context.</p>
  …
</section>
```

`<span class="num"></span>` is filled in with `§n` at load. Clauses inside the
sheet are numbered `§n.1`, `§n.2` … in document order, and clicking a number
copies a deep link to it. Override a number with `data-ref="4.7"` when a clause
has to keep a citation it already has.

## Status vocabulary

Five statuses, and they mean different things. Use them honestly — a document
where everything is `locked` teaches a reader nothing.

| Value | Reads as | Use for |
| --- | --- | --- |
| `locked` | Locked | Decided. Reopening it costs something. |
| `open` | Open | A decision is still owed. |
| `deferred` | Deferred | Designed now, built later, on purpose. |
| `gate` | Gate | Blocks the ship. |
| `ref` | Reference | Material, not a decision. |

`data-status` works on a sheet, a table row, a note, a rail node, a field — it
sets `--sig`, and stamps, ticks and rules pick the colour up from there.

## The execution board

A plan is frozen once execution starts. The board is the **execution** record of
that plan: one card per unit of work, moved by the agents doing the work. Nobody
drags a card. There is no write path from the browser, and
`./qstack/scripts/serve.sh` stays a read-only `python3 -m http.server`. The board
renders a file, and that file sits beside the plan:

```
qstack/compound_engineering/plans/<slug>/
├── plan.html      # BEFORE  — frozen when execution starts
├── board.jsonl    # DURING  — append-only card events, written by agents
├── execution.md   # DURING  — decisions, deviations, reviews (no task checklist)
└── outcome.md     # AFTER
```

`board.jsonl` is append-only JSON Lines: one JSON object per line, no newlines
inside an object, file always ends with a newline. Nothing ever edits or deletes
a line, and state is a fold over the lines in file order. Append exactly like
this, as one shell write:

```bash
printf '%s\n' '{"ts":"2026-08-22T10:14:03Z","event":"claimed","card":"T-03","actor":"adelaide","reason":"unblocks four cards"}' \
  >> qstack/compound_engineering/plans/<slug>/board.jsonl
```

A single `printf` of a short line to a file opened with `O_APPEND` is atomic on
a local filesystem, which is why several agents can write without a lock. Never
read-modify-write the file. Never use a JSON array.

| `event` | Meaning | Required fields |
| --- | --- | --- |
| `coordinator` | Claims the whole board for one actor. | `actor` |
| `stood-down` | Releases the board claim. | `actor` |
| `epic` | Declares a swimlane. | `epic`, `title` |
| `created` | Declares a card. | `card`, `epic`, `title`, `points`, `refs`, `files`, `depends_on` |
| `claimed` | An actor takes sole ownership. | `card`, `actor`, `reason` |
| `moved` | Status transition. | `card`, `from`, `to`, `actor` |
| `released` | Owner gives the card back to `backlog`. | `card`, `actor`, `reason` |
| `split` | Parent closes into children. | `card`, `into`, `actor`, `reason` |
| `note` | Comment, no state change. | `card`, `actor`, `note` |

Six live columns plus one terminal: `backlog` → `claimed` → `in-progress` →
`review` → `done`, with `blocked` reachable from any live status, and `split`
terminal for the parent of a split. A card whose `depends_on` are unfinished
waits in `backlog`; `blocked` is the stall only a human can clear, and the
blocking question goes in `note`.

A `depends_on` naming a card that later splits resolves to that split's children
and stays unsatisfied until every one of them closes. The parent closed the
moment it split, but the work it held moved into the children, so a downstream
card that started on the parent's closure would start on top of work still
running. Children inherit the parent's own `depends_on`; the board repairs the
reverse edges, because the file is append-only and no line can be rewritten.

Cards carry six fields beyond their id, title and status:

| Field | Kind | Who uses it |
| --- | --- | --- |
| `epic` | membership | the swimlane |
| `depends_on` | ordering | the orchestrator's ready set |
| `files` | ownership | the parallel-safety check |
| `refs` | traceability | adherence review, and the §link on the card |
| `points` | size signal | how much work an agent is doing |
| `split_from` | provenance | history after a split |

There is no `linked_to` and no `blocked_by`, because `depends_on` is planned
ordering, `blocked` is an unplanned stall, and "related" is computed from shared
`refs` or shared `files` rather than stored.

Points are Fibonacci, capped, and set once at breakdown:

- `1` — one file, no review round expected.
- `2` — two or three files in one area.
- `3` — several files, one review round expected.
- `5` — a subsystem; expect rework.
- `8` — too coarse. Split it before claiming it.

The set is closed. A card carrying any other value is a bad write: the board
flags it and no loop will ever call it ready. A `13` is not a large card, it is
a card whose size nobody thought about, and unlike an `8` it carries no `note`
saying what it splits into, so it needs a human.

Progress is read in points, not cards — "21 of 55 points" — because a card count
hides the difference between a 1 and a 5. A card whose points are off the scale
counts in neither total, so the points figure and the card figure can disagree
about how much is on the board. That gap is the flag doing its job.

`plan.html` carries a `Plan | Board` switch in the document bar, and `#board` in
the URL selects the board. `board.js` re-fetches `board.jsonl` every 3 s while
the board is visible and stops when it is hidden. The board is a view, not a
sheet: it takes no `§` number and never enters the spine, and print always
renders the plan.

The meter above the lanes reads points, cards, actors, and Coordinator, which
names the actor holding the whole board and shows `—` when nobody does. The
state line under it carries whatever the fold found wrong: two coordinators with
no stand-down between them, unreadable lines, and flagged cards.

A plan with no `board.jsonl` shows "No board yet" and names
`/qstack-plan-to-html`. Opened over `file://` the fetch fails, so the board
shows the serve command rather than an empty column set.

### One coordinator per board

Two coordinators on one board is forbidden, not resolved. Before you claim any
card, fold the board and look for a `coordinator` event with no later
`stood-down` from the same actor:

- **A different actor holds it** — stop. Name the holder and the cards it owns.
  Do not take over, do not wait, do not claim a card. Automatic takeover is the
  thing that produces two coordinators.
- **You hold it** — this is your own run resuming. Continue.
- **Nobody holds it** — append your own `coordinator`, re-read the file, and if
  another actor's `coordinator` appears **before yours in the file**, append
  `stood-down` and stop.

Break that tie on file order, never on `ts`. Two loops starting in the same
second carry the same stamp, and `ts` has one-second resolution, so a `ts`
comparison fails in the exact case this rule exists to close. Appends are
ordered, so file order is total and always decides.

A `stood-down` releases only the actor that wrote it. It never clears another
actor's hold, so the loser of that race leaves the winner holding the board.
Append `stood-down` when the run ends, whether it completed, was abandoned, or
stopped on a question. A board whose coordinator never stood down needs a human.
Report it and stop; never decide on your own that a holder is gone.

This rule is what makes `files` safe. Two coordinators can each pick a card the
other has not claimed, each pass its own file-overlap check, and still land two
agents on one file, because neither is checking the other's pending choice. One
coordinator cannot race itself.

## Components

| Class | Use it for |
| --- | --- |
| `.title-block` + `.fields` | The head of the document. Field grid, drawing-sheet style. |
| `.sheet` | A numbered section. |
| `.clauses` / `.clause` | Numbered, citable statements. `.clause-pair` for two dense columns. |
| `.stamp` | A status stamp. Inherits `--sig` from `data-status`. |
| `.note` | A margin annotation — an open question, a risk, a caveat. |
| `.eli` + `.eli-mark` + `.eli-body` | A plain-English aside behind an ⓘ. See below. |
| `.plate` | A bordered block for content that isn't prose. |
| `.ledger` / `.ledger-row` | Table-name → description pairs. Data models. |
| `.seq` / `.seq-step` | A procedure where order carries information. |
| `.rail` / `.rail-node` / `.rail-link` | A system diagram read across. |
| `.matrix` | The release-gate table. Sticky header, status column. |
| `.phases` / `.phase` | Build order. |
| `.board` / `.board-lane` / `.board-card` | The execution board. Rendered from `board.jsonl`; never hand-written. |
| `.refs` / `.ref` | The research basis. |
| `.tabset` / `.tab` + `.tab-panel` | Tabbed specification panels. Prints expanded. |
| `.key` | A row of stamps read as a legend beneath a diagram. |
| `.grid-2` `.grid-3` `.grid-4`, `.breakout` | Layout. `.breakout` escapes the reading measure. |

## Eli asides

A plan has two readers and they do not share a vocabulary. Rather than write
twice, keep the exact term in the prose and hang the plain-English reading of it
off an **ⓘ**. It opens on hover, on keyboard focus, and on tap.

```html
Replacement authority is
<span class="eli">
  <button class="eli-mark" type="button" aria-label="Explain: replacement authority">i</button>
  <span class="eli-body" role="note">
    <b>Replacement authority</b>
    Who may overwrite a label that is already stuck on something. A flow gets
    called "TLS" early; later a rule wants to call it "YouTube". It only gets to
    if it was given permission to overwrite "TLS" specifically.
  </span>
</span>
current-label only.
```

`plan.js` adds the tap, closes on `Escape`, and flips a box that would run off
the end of the line. `aria-expanded` is managed for you — do not hand-write it.
`data-status` sets `--sig`, so an aside on an unsettled concept can carry the
open colour.

Write the analogy first, the mechanism second, and keep it to two or three
sentences. No jargon inside the box — that is the one place it is never allowed.

**An aside is never load-bearing.** It explains what the document already says;
it never carries a fact found nowhere else. A reader who ignores every mark still
gets the whole plan — which is exactly what happens in print, where the marks
disappear and every box prints inline as a footnote.

## About pretext

`pretext.js` measures a string and reserves its height so a heading cannot reflow
when the webfont lands. Load it, mark an element `data-pretext`, and `plan.js`
does the rest.

**It measures on a canvas, and canvas text measurement ignores `letter-spacing`.**
Every heading in this template carries negative tracking, so pretext reads them as
wider than they render and reserves a line that never gets used — you get a blank
band under one-line headings. Fonts here are self-hosted and land in the first
frame anyway, so the shift it prevents is not one you can see.

Leave it out unless you have a specific reflow to fix, and if you use it, apply
`data-pretext` only to text with default tracking.

## House rules

- **Numbering must be real.** `§4.2` exists so a reviewer can say "§4.2 is
  wrong". Do not number cards for decoration.
- **Prose stays inside `--measure`.** Only diagrams, matrices and prototypes
  take the full width — use `.breakout`.
- **Logical properties only** — `padding-inline`, `margin-inline-start`,
  `inset-inline-start`. Never `left` / `right`. Same rule as the app.
- **One accent.** If something new needs a colour, it probably needs a status
  instead.
- **The board is generated.** No plan hand-writes board markup, and no plan edits
  `board.jsonl` by hand. An agent appends to it.
- **Motion:** stamps ink in once, the spine tracks position. That is the budget.
  `prefers-reduced-motion` is respected in the stylesheet — keep it that way.
- Check the plan at 720px and in print preview before calling it done. Both are
  in the stylesheet already; both break if a plan hard-codes widths.
