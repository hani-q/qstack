---
name: qstack-plan-to-html
description: >
  Convert a markdown plan (typically written in plan mode) into a self-contained
  HTML plan document using the bundled "cyanotype & redline" template. Splits the
  plan into an HLD half a product manager or founder can read end to end, and an
  LLD half an execution agent can orchestrate from. Adds inline SVG flow diagrams
  and, where the concept has rules a reader can poke at, a dependency-free JS
  playground that models it.
  Use when asked to "turn this plan into HTML", "make an HTML plan", "render the
  plan", "plan to html", or after finishing a plan-mode markdown document.
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-plan-to-html

Takes a markdown plan and produces a controlled document: numbered, citable,
offline-safe, and readable by two audiences at once.

A plan is **not a landing page**. It opens with a title block, every clause is
numbered so a reviewer can say "§4.2 is wrong", and every section carries a
status stamp so a reader knows what is settled before reading a word.

## Language — plain words, always

**Write it the way you would say it out loud.** Jargon is not precision; most of
the time it is precision's opposite, because it lets a vague sentence pass as an
informed one. If a sentence would survive being read aloud to a smart person
outside the team, keep it. If it would not, rewrite it.

Cut these on sight — they carry no information:

> leverage · utilize · synergy · holistic · robust · seamless · paradigm ·
> best-in-class · surface area (as a metaphor) · first-class citizen ·
> orthogonal · non-trivial · trivially · simply · just · obviously

| Instead of | Write |
| --- | --- |
| "leverage the existing abstraction" | "use the code that is already there" |
| "a non-trivial refactor" | "about three days of work across four files" |
| "the system exhibits sub-optimal latency characteristics" | "it takes 40 seconds; it should take 2" |
| "we surface this to the operator" | "the operator sees it" |
| "simply add a policy rule" | "add a policy rule" — if it were simple you would not be writing a plan |

**Precise is not the same as jargon.** A term of art that names a real thing in
the codebase — `first-match`, `hot reload`, `run-to-completion` — stays, because
replacing it with a vague paraphrase loses information an implementer needs. The
rule is: **use the exact word, then explain it once** in an ELI10 box the first
time it appears.

Numbers beat adjectives. "Fast" is an opinion; "16 ms" is a fact. Wherever the
source markdown has a measurement, use the measurement.

This applies hardest in Part I. A founder reading the HLD should never hit a
sentence they have to read twice.

## Inputs

- **A markdown plan.** If the user names a file, use it. Otherwise look for the
  most recent plan-mode output, `plans/**/*.md`, or
  `compound-engineering/plans/*/plan.md`, and confirm before converting.
- **Destination.** Default `plans/<slug>/<slug>-plan.html`. If the repo uses
  `compound-engineering/plans/<slug>/`, write `plan.html` there instead.

## Setup — copy the template, don't reference this skill

The template lives at `template/v1/` **next to this SKILL.md**. Resolve it
relative to wherever you just read this file from — never a hardcoded path, since
this skill installs into any of ~70 agent directories and may be a symlink.

**Copy it into the target repo**, so the plan survives without the skill installed:

```bash
# Resolve the skill's own directory, following a symlink if there is one.
SKILL_DIR=$(dirname "$(readlink -f <path-of-this-SKILL.md>)")

mkdir -p <plans-root>/template
cp -R "$SKILL_DIR/template/v1" <plans-root>/template/v1
mkdir -p <plans-root>/<slug>
cp <plans-root>/template/v1/plan-template.html <plans-root>/<slug>/<slug>-plan.html
```

macOS `readlink` has no `-f` before coreutils 12 — if it fails, fall back to
`cd "$(dirname <path>)" && pwd -P`.

If `<plans-root>/template/v1` already exists, **do not overwrite it** — the repo
may have a newer revision. Diff and report instead.

The stencil's asset paths (`../template/v1/plan.css`) are already correct for a
document one level down. If you nest deeper, fix the paths.

Read `template/v1/README.md` before writing — it is the component reference and
its house rules are binding.

## The two-part contract

This is the point of the skill. One document, two readers.

### Part I — HLD (product)

For a founder or PM. They should be able to stop at the end of Part I and know
what is being built, why, what it costs, and what is still undecided. No file
paths, no function names, no ABI numbers.

Sheets, in order:

1. **The problem** — what is broken today, in user-visible terms.
2. **The shape of the answer** — the approach in one diagram and one paragraph.
3. **What changes for the user** — before/after. Concrete scenarios.
4. **Options and the recommendation** — a comparison table, with the pick named
   and justified. Include the option you rejected and why.
5. **Cost, risk, and what is still open** — honest. Notes with `data-status="open"`.

### Part II — LLD (execution)

For an execution agent. Everything needed to act without re-deriving the
investigation.

Sheets, in order:

6. **Current-system architecture** — with `file:line` citations. Verified, not assumed.
7. **The design** — interfaces, data shapes, syntax, wire formats.
8. **Build order** — `.phases`, each phase leaving the tree coherent.
9. **Release gate** — `.matrix` of scenario → acceptance → blocker/required.
10. **Open questions** — numbered, each with what it blocks.

Mark every sheet with `data-part="hld"` or `data-part="lld"`, and put a part
divider between them (see *Part dividers* below). A PM must be able to see where
their half ends.

## Diagrams

Inline SVG only. **No CDN, no mermaid, no runtime diagram library** — the
document has to open from a file, offline, forever.

- Use `currentColor` and the template's CSS custom properties (`--sig`,
  `--redline`, `--ink-mute`) so diagrams follow the print/vellum theme toggle.
  Never hardcode a hex.
- Wrap in `.plate`, add `.breakout` when the diagram needs more than the reading
  measure.
- Give every diagram a `<title>` element and `role="img"` with an `aria-label`.
- Follow with a `.key` row of stamps as a legend when the diagram uses status colour.

Reach for the template's own primitives before drawing SVG:

| Need | Use |
| --- | --- |
| System read left-to-right | `.rail` / `.rail-node` / `.rail-link` |
| Ordered procedure | `.seq` / `.seq-step` |
| Build phases | `.phases` / `.phase` |
| Data model | `.ledger` / `.ledger-row` |

Draw SVG for state machines, pipelines with branches, and timelines — things
those primitives cannot express.

## ELI10 boxes

Any hard concept gets a small **ⓘ** next to it. Hovering, focusing or tapping it
reveals a boxed explanation pitched at a bright ten-year-old. The plan stays
dense for the people who want density; the explanation is one gesture away for
everyone else.

**Where to use one:** every term of art on first appearance, every acronym, every
number whose significance is not obvious ("ABI 8" — why does 8 matter?), every
mechanism a reader must trust without reading the code (hazard pointers, atomic
swap, ratchet), and any sentence you were tempted to write twice.

**How to write one.** No jargon at all, not even defined jargon. Use an analogy
from ordinary life. Two or three sentences. Say why it matters, not just what it
is.

> **Hot reload** — Swapping the rulebook while the game is still being played.
> Nobody stops, nobody notices, and if the new rulebook turns out to be
> unreadable the old one stays in force.

Write the analogy first and the mechanism second. If you cannot find an analogy,
the concept is probably not as hard as it looked — say it plainly instead.

### Markup

`.eli` is **built into the template** — `plan.css` styles it and `plan.js` wires
it. Write the markup and nothing else. Do not paste CSS for this into `<slug>.css`,
and do not hand-write `aria-expanded`; `plan.js` manages it.

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

Handled for you: hover, keyboard focus, tap, `Escape` to dismiss, flipping a box
that would run off the end of a line, narrow viewports, and print — where the
marks vanish and every box prints inline as a footnote. `data-status` on the
`.eli` sets `--sig`, so an aside about an unsettled concept can carry the open
colour.

**Never put load-bearing content in an ELI10 box.** It explains what is already
written; it never adds a fact found nowhere else. A reader who ignores every ⓘ
must still get the whole plan — which is literally what print does.

## The playground

Where the concept has **rules a reader can poke at**, build a small interactive
model. This is what makes an HLD land: a PM who can type an input and watch a
rule fire understands the design in a way no paragraph achieves.

Good candidates: a matcher or rule evaluator, a state machine with buttons for
each transition, a precedence/priority resolver, a latency or cost calculator,
a before/after toggle on the same input.

**Skip it** when the concept is not interactive — a migration sequence or a
packaging change has nothing to poke. A playground that does not model anything
is decoration, and decoration in a controlled document is a liability.

Rules:

- **Vanilla JS, no dependencies, no build step, no network.** Inline in a
  `<script>` at the end of the body, or in `<plans-root>/<slug>/<slug>.js`.
- **Plan-specific CSS goes in `<plans-root>/<slug>/<slug>.css`**, loaded after
  `plan.css`. Never edit `plan.css` — it is shared by every plan in the repo.
- **Degrade honestly.** Render a static worked example in the HTML; let JS
  enhance it. A reader with JS disabled, or printing, still sees the example.
- **It must model the real rules.** If the plan says first-match wins and the
  playground evaluates all rules, the playground is now a lie in a controlled
  document. Mirror the specified semantics exactly, and label it
  `data-status="ref"` — it is material, not a decision.
- Wrap in `.plate` + `.breakout`, with a `.plate-head` naming what it models.
- Respect `prefers-reduced-motion`; the template's motion budget is stamps
  inking in once and the spine tracking position.
- Use logical properties only (`padding-inline`, `inset-inline-start`), same as
  the stylesheet.

## Part dividers

`plan.css` has no part divider — add one in `<slug>.css`:

```css
.part-break {
  grid-column: 1 / -1;
  margin-block: 56px 8px;
  padding-block-end: 10px;
  border-block-end: 1px solid var(--rule);
}
.part-break .label { color: var(--ink-mute); }
.part-break h2 { margin-block-start: 6px; }
```

```html
<header class="part-break">
  <p class="label">Part II</p>
  <h2>Low-level design</h2>
  <p class="sheet-lede">From here on the document addresses an implementer.</p>
</header>
```

## Conversion rules

- **Numbering must be real.** `.clause` elements get `§n.1`, `§n.2` in document
  order. Number statements a reviewer might cite — never number cards for looks.
- **Status honestly.** `locked` / `open` / `deferred` / `gate` / `ref`. A document
  where everything is `locked` teaches a reader nothing. An unapproved design is
  `open`, and its title block says `Draft`.
- **Do not invent.** Every `file:line`, metric and benchmark in the output must
  come from the source markdown. If the markdown asserts something unverified,
  carry it across as a `.note` marked `open` — do not launder it into a fact.
- **Do not summarize away the detail.** The LLD half exists so an execution agent
  does not have to re-read the markdown. Losing the citations defeats the point.
- **Fill the title block** — document id, revision, owner, issue date, sheet
  count, and a real "Ships when" condition.
- **Colophon** states what the document locks.

## Verify before reporting

```bash
open <plans-root>/<slug>/<slug>-plan.html    # or report the path
```

Check, and say which you checked:

- Spine builds, clause numbers render, deep links copy.
- Theme toggle works — the diagrams and playground follow it.
- Playground behaves, and its static fallback is present.
- 720px viewport and print preview both hold (both are in `plan.css`; both break
  if the plan hard-codes widths).
- No network requests — fonts and assets are all relative.

## After conversion — the accretion pass

Once the document is written and verified, stop and put this question to
yourself, in full:

> **What's the single smartest and most radically innovative and accretive and
> useful and compelling addition you could make to the plan at this point?**

Think about it properly. Having just read the whole plan closely enough to
restructure it, you are in the best position anyone will be in to see what is
missing — the unasked question, the cheap experiment that would de-risk the
expensive bet, the second-order consequence nobody priced, the adjacent thing
that becomes nearly free once this ships.

Rules for the answer:

- **One idea.** Not a list. Pick the strongest and argue for it.
- **Accretive** — it compounds what is already there. Something the plan makes
  possible, not a replacement for the plan.
- **Concrete enough to cost.** Name what it takes and what it returns.
- **Say why now.** If it is equally good in six months, it is not this.
- **Be willing to say there isn't one.** A forced idea wastes the user's
  attention and devalues the times you have a real one.

**Do not apply it.** The conversion is done and reported as done. This lands
underneath, clearly marked as your own suggestion, for the user to take or leave.

## Report

Lead with the conversion: the path, the sheet count, which sheets are HLD vs LLD,
what diagrams were drawn, whether a playground was built (and if not, why not),
which concepts got ELI10 asides, and anything from the markdown you could not
verify. Say the plan has been converted.

Then, under a clear break — *"For your consideration"* — give the one addition
from the accretion pass. Keep the two apart: the user asked for a conversion and
got one; the idea is extra, and should read as extra.

Do not commit.
