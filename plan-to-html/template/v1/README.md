# Plan template v1 — "cyanotype & redline"

The house style for HTML plan documents in this repo. Every plan under `plans/`
uses it. See `plans/CLAUDE.md` for the rule; this file is the component
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
| `plan-template.html` | The stencil. Copy it; don't open it in place. |
| `fonts/` | Self-hosted woff2. |

## Starting a plan

```bash
mkdir -p plans/<slug>
cp plans/template/v1/plan-template.html plans/<slug>/<slug>-plan.html
```

The asset paths in the stencil are already correct for that destination.
Plan-specific CSS — a prototype, a diagram, anything one document needs — goes
in `plans/<slug>/<name>.css`, loaded after `plan.css`. It never goes into the
template.

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
- **Motion:** stamps ink in once, the spine tracks position. That is the budget.
  `prefers-reduced-motion` is respected in the stylesheet — keep it that way.
- Check the plan at 720px and in print preview before calling it done. Both are
  in the stylesheet already; both break if a plan hard-codes widths.
