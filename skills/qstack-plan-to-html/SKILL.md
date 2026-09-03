---
name: qstack-plan-to-html
description: >
  Render a plan as a reviewable QStack HLD/LLD HTML document, resolve its
  material open questions, and break it into the cards of its execution board.
  Takes a Markdown draft or the working agreement reached in the conversation.
  Also adds a board to a plan that already has HTML and no board.
disable-model-invocation: true
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-plan-to-html

Takes a plan, from a Markdown draft or from the conversation that worked it out,
and produces a controlled document: numbered, citable, offline-safe, and
readable by two audiences at once.

A plan is **not a landing page**. It opens with a title block, every clause is
numbered so a reviewer can say "§4.2 is wrong", and every section carries a
status stamp so a reader knows what is settled before reading a word.

## Language: plain words, always

**Write it the way you would say it out loud.** Jargon is not precision; most of
the time it is precision's opposite, because it lets a vague sentence pass as an
informed one. If a sentence would survive being read aloud to a smart person
outside the team, keep it. If it would not, rewrite it.

Cut these on sight: they carry no information:

> leverage · utilize · synergy · holistic · robust · seamless · paradigm ·
> best-in-class · surface area (as a metaphor) · first-class citizen ·
> orthogonal · non-trivial · trivially · simply · just · obviously

| Instead of | Write |
| --- | --- |
| "leverage the existing abstraction" | "use the code that is already there" |
| "a non-trivial refactor" | "about three days of work across four files" |
| "the system exhibits sub-optimal latency characteristics" | "it takes 40 seconds; it should take 2" |
| "we surface this to the operator" | "the operator sees it" |
| "simply add a policy rule" | "add a policy rule": if it were simple you would not be writing a plan |

**Precise is not the same as jargon.** A term of art that names a real thing in
A term already used in the codebase, such as `first-match`, `hot reload`, or
`run-to-completion`, stays because
replacing it with a vague paraphrase loses information an implementer needs. The
rule is: **use the exact word, then explain it once** in an ELI10 box the first
time it appears.

Numbers beat adjectives. "Fast" is an opinion; "16 ms" is a fact. Wherever the
source markdown has a measurement, use the measurement.

This applies hardest in Part I. A founder reading the HLD should never hit a
sentence they have to read twice.

## Inputs

The plan comes from a written draft or from the conversation that worked it out.
Both are normal. Resolve the source in this order and say which one you took:

1. **A file the user names.** Use it.
2. **The most recent plan-mode output**, when the session has one.
3. **The conversation itself.** No file, no plan mode: the user talked the shape
   of the work through with you and then invoked this skill. See below.
4. **A markdown plan already in the repo**, when nothing above applies. Confirm
   before converting: an old draft lying in the tree is the weakest signal here.

**Destination.** Always write
`qstack/compound_engineering/plans/<slug>/plan.html`. Do not copy a Markdown
source into that folder, and do not write one when the source was the
conversation: the rendered plan is the canonical plan document, and a second
copy is a second source of truth that goes stale on the first decision.

### When the source is the conversation

A draft on disk is something the user wrote and can see. A conversation is
something you have to reconstruct, and the user has never read your
reconstruction. So write it down and get it agreed before rendering anything.

1. **Extract the plan into a short summary in the response**, not into a file.
   Cover the goal, the scope, what is explicitly out of scope, the approach that
   was agreed, the constraints stated, and the slug you propose for the folder.
   A conversation has no filename, so the slug is a decision, not a derivation.
2. **Separate what was decided from what was merely discussed.** A chat is full
   of options raised and dropped, ideas nobody ruled on, and thinking aloud.
   Something the user settled becomes a `locked` clause. Something floated and
   never resolved becomes `open`, and it is a candidate for the question pass
   rather than a decision you make on their behalf. Guessing which side of that
   line a point falls on is the failure mode of this path: when unsure, mark it
   `open` and let the question pass settle it.
3. **Say what you are dropping.** Rejected options and abandoned directions are
   worth one line each in the options table with `data-status="deferred"`,
   because the next reader will otherwise propose them again.
4. **Get explicit confirmation of that summary before rendering.** One round is
   enough. The user corrects it or says go.

Everything after this point is the same for both sources. The document is
authoritative once written, and the conversation is not a source you can return
to and re-read reliably, which is precisely why the plan gets written down.

## Two modes, chosen from what is already on disk

Look in the target plan directory before doing anything, and say which mode you
picked.

| On disk | Do |
| --- | --- |
| No `plan.html` | The full conversion: render, ask the open questions, write the board. |
| `plan.html`, no `board-events.js` | **Board only.** Read the existing HTML, resolve what it leaves open, then go to *Break the plan into cards*. |
| `plan.html` and `board-events.js`, no complete breakdown marker | **Board only.** Finish the interrupted or empty board. |
| `plan.html` and `board-events.js`, complete breakdown marker | Nothing. Report both and stop. |

If the directory has the retired `board.jsonl` and no `board-events.js`, migrate
it before choosing a mode:

```bash
SKILL_DIR=$(cd "$(dirname <path-of-this-SKILL.md>)" && pwd -P)
"$SKILL_DIR/template/migrate-board-log" \
  qstack/compound_engineering/plans/<slug>
```

The migration writes `board-events.js` atomically, preserves an unreadable
legacy line as an unreadable event, and removes `board.jsonl` only after the new
file is fully written. Then use the marker to choose one of the last two rows.
If both formats exist, stop: two board logs are two sources of truth, and a
human must choose one.

Board-only mode exists because every plan rendered before the board did has an
HTML document and no cards, and those plans still need to be executable. It
never re-renders: an authoritative `plan.html` is frozen, and regenerating it
from a stale draft or a later conversation would throw away every decision
recorded in it.

The questions are a separate matter. Asking destroys nothing, and a plan that
has HTML has not necessarily been through the question pass. It may have been
rendered with `--no-open-questions`, predate the phase, or be hand-written. A
card cut against an open question is rework the moment the answer arrives, in
board-only mode as much as in a full conversion. So check rather than assume.
Before writing any card, read the rendered HTML for unresolved decisions:
clauses, notes, rows, or fields at `data-status="open"` that state an undecided
choice and carry no `data-decision-id`. If any are there, run the question pass
first, exactly as the full conversion does. If none are, say the document has no
unresolved decisions and go straight to the cards.

Nothing blocks that check. `/qstack-ask-plan-open-questions` treats a plan as
frozen once the event stream contains a call after its format header, or an
execution or outcome record sits beside it. A header-only stream is still
pre-execution.

### Upgrade an older HTML plan

In board-only mode, inspect the HTML before asking questions. A plan rendered
before boards existed lacks three pieces: `[data-view-switch]`, the `#board`
section with `[data-board-lanes]`, and the final `board.js` script. Add only
those exact blocks from `template/v1/plan-template.html`; preserve every title
field, sheet, clause, status, plan-specific asset, and colophon byte for byte.
This is a shell upgrade, not a re-render.

Run the additive asset setup below without copying `plan-template.html` over the
plan. The plan's shared `plan.css` must contain the execution-board section and
its `.doc-bar-views` rules. If the installed template differs from the repo's
copy, run the shared-asset workflow as the setup rules require. A missing
`board.js` is additive and can be copied directly. Create the required
header-only stream when it is absent:

```bash
printf '%s\n' 'qstackBoardEvent({"event":"board","format":1});' \
  > qstack/compound_engineering/plans/<slug>/board-events.js
```

Then read the whole `plan.html`, take the `§` clause numbers from the document
as rendered, and run only the question pass and the board phase. Skip the
two-part contract and diagrams. Report it as a board added to an existing plan,
not as a conversion.

## Setup: copy the template, don't reference this skill

The template lives at `template/v1/` **next to this SKILL.md**. The serving and
migration scripts live in `template/serve.sh` and `template/migrate-board-log`.
Resolve all three relative to wherever you just read this file from: never a
hardcoded path, since this skill installs into any of ~70 agent directories and
may be a symlink.

**Copy them into the target repo's `qstack/` directory**, so the plan survives
without the skill installed:

```bash
# Resolve the skill's own directory, following a symlink if there is one.
SKILL_DIR=$(dirname "$(readlink -f <path-of-this-SKILL.md>)")
REPO_ROOT=$(git rev-parse --show-toplevel)

mkdir -p "$REPO_ROOT/qstack/compound_engineering/plans/<slug>"
mkdir -p "$REPO_ROOT/qstack/compound_engineering/plans/.template"
mkdir -p "$REPO_ROOT/qstack/scripts"
TEMPLATE="$REPO_ROOT/qstack/compound_engineering/plans/.template/v1"
TEMPLATE_EXISTED=1
if [ ! -e "$TEMPLATE" ]; then
  TEMPLATE_EXISTED=0
  cp -R "$SKILL_DIR/template/v1" "$TEMPLATE"
fi
# A repo that already used this skill may have an older template. Add what is
# missing, and hand differing files to the shared-asset workflow below.
STALE=
for asset in board.js plan.js plan.css plan-template.html pretext.js README.md; do
  if [ ! -e "$TEMPLATE/$asset" ]; then
    cp "$SKILL_DIR/template/v1/$asset" "$TEMPLATE/$asset"
  elif ! cmp -s "$SKILL_DIR/template/v1/$asset" "$TEMPLATE/$asset"; then
    STALE="$STALE $asset"
  fi
done
if [ -n "$STALE" ]; then echo "template differs from this skill's copy:$STALE"; fi
if [ ! -e "$REPO_ROOT/qstack/scripts/serve.sh" ]; then
  cp "$SKILL_DIR/template/serve.sh" "$REPO_ROOT/qstack/scripts/serve.sh"
fi
if [ ! -e "$REPO_ROOT/qstack/scripts/migrate-board-log" ]; then
  cp "$SKILL_DIR/template/migrate-board-log" \
    "$REPO_ROOT/qstack/scripts/migrate-board-log"
fi
chmod +x "$REPO_ROOT/qstack/scripts/serve.sh"
chmod +x "$REPO_ROOT/qstack/scripts/migrate-board-log"
```

macOS `readlink` has no `-f` before coreutils 12: if it fails, fall back to
`cd "$(dirname <path>)" && pwd -P`.

If `qstack/compound_engineering/plans/.template/v1`,
`qstack/scripts/serve.sh`, or `qstack/scripts/migrate-board-log` already exists,
do not replace it merely because it differs: the repo may have a newer revision
or its own behavior. The loop above adds only files the template does not have;
without it a repo that predates `board.js` renders a stencil whose board script
is missing.

When `TEMPLATE_EXISTED=1`, resolve
`references/update-plan-assets.md` relative to this SKILL.md, read it
completely, and run that workflow against this repository. It checks the
complete template tree and owns the direction check. A clearly older QStack
copy is updated without another approval, then setup resumes. A repo-owned,
newer, or ambiguous difference still stops for the user's choice. This
reference and its script ship inside `qstack-plan-to-html`, so a single-skill
install contains the automatic updater. If either is unavailable, report an
incomplete installation and stop. Do not silently skip the update decision.

This repository keeps its own two copies byte-identical and checks it in CI
with `scripts/validate-template-sync`; a target repo has made no such promise.

Only after the update workflow finishes, instantiate a new plan from the
reconciled stencil. Board-only mode upgrades the existing HTML in place and
skips this copy:

```bash
if [ ! -e "$REPO_ROOT/qstack/compound_engineering/plans/<slug>/plan.html" ]; then
  cp "$REPO_ROOT/qstack/compound_engineering/plans/.template/v1/plan-template.html" \
    "$REPO_ROOT/qstack/compound_engineering/plans/<slug>/plan.html"
fi
if [ ! -e "$REPO_ROOT/qstack/compound_engineering/plans/<slug>/board-events.js" ]; then
  printf '%s\n' 'qstackBoardEvent({"event":"board","format":1});' \
    > "$REPO_ROOT/qstack/compound_engineering/plans/<slug>/board-events.js"
fi
```

The stencil's asset paths (`../.template/v1/plan.css`) are correct for
`qstack/compound_engineering/plans/<slug>/plan.html`. The template is inside the
served tree, so no symlink or custom HTTP routing is needed. Do not put plan
documents at another depth.

The stencil ships with the `Plan | Board` switch in the document bar and a
header-only `board-events.js`. A successful stream with only that format header
shows "No board yet"; a script that is missing, malformed, or has no header
shows a board error. Every plan converted this way can be executed as cards
without further setup.

Read `template/v1/README.md` before writing: it is the component reference and
its house rules are binding.

## Read the prior art

Run this before writing a line of the document. A plan that contradicts a plan
already in the repo is worse than no plan, and the contradiction costs least to
find now.

Resolve `qstack-plan-prior-art` relative to this skill's installed directory,
never a hardcoded path, for the same reason the template is resolved that way;
read its complete `SKILL.md`, and run it against the subject of the plan being
converted. If it is unavailable, do not silently skip the phase: report that the
conversion ran with no prior-art pass and the workflow is incomplete.

What it returns lands in the document in three places:

- Every conflict becomes a `.note` with `data-status="open"`, sitting on the
  sheet whose clauses it disputes, naming the earlier plan and what it says
  instead. Do not settle it here: that is the question pass below.
- Every relevant earlier plan becomes a `.ref` in the research-basis sheet,
  linked to its own `plan.html`, with one line on what it settled.
- The title block's `Supersedes` field is filled from finding 5, not left as the
  stencil's `None`. If this plan supersedes nothing, say so in the field.

## The two-part contract

This is the point of the skill. One document, two readers.

### Part I: HLD (product)

For a founder or PM. They should be able to stop at the end of Part I and know
what is being built, why, what it costs, and what is still undecided. No file
paths, no function names, no ABI numbers.

Sheets, in order:

1. **The problem**: what is broken today, in user-visible terms.
2. **The shape of the answer**: the approach in one diagram and one paragraph.
3. **What changes for the user**: before/after. Concrete scenarios.
4. **Options and the recommendation**: a comparison table, with the pick named
   and justified. Include the option you rejected and why.
5. **Cost, risk, and what is still open**: honest. Notes with `data-status="open"`.

### Part II: LLD (execution)

For an execution agent. Everything needed to act without re-deriving the
investigation.

Sheets, in order:

6. **Current-system architecture**: with `file:line` citations. Verified, not assumed.
7. **The design**: interfaces, data shapes, syntax, wire formats. Every new
   component, dependency, or abstraction names the requirement that needs it
   and says why a helper already in the repository, the standard library, a
   native platform feature, or an installed dependency does not cover it. No
   requirement, no entry. Do not prescribe a build where one of those would do;
   the execution loop builds what this sheet says.
8. **Build order**: `.phases`, each phase leaving the tree coherent.
9. **Release gate**: `.matrix` of scenario → acceptance → blocker/required.
10. **Open questions**: numbered, each with what it blocks.

Mark every sheet with `data-part="hld"` or `data-part="lld"`, and put a part
divider between them (see *Part dividers* below). A PM must be able to see where
their half ends.

## Diagrams

Inline SVG only. **No CDN, no mermaid, no runtime diagram library**: the
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

Draw SVG for state machines, pipelines with branches, and timelines: things
those primitives cannot express.

## ELI10 boxes

Any hard concept gets a small **ⓘ** next to it. Hovering, focusing or tapping it
reveals a boxed explanation pitched at a bright ten-year-old. The plan stays
dense for the people who want density; the explanation is one gesture away for
everyone else.

**Where to use one:** every term of art on first appearance, every acronym, every
number whose significance is not obvious ("ABI 8": why does 8 matter?), every
mechanism a reader must trust without reading the code (hazard pointers, atomic
swap, ratchet), and any sentence you were tempted to write twice.

**How to write one.** No jargon at all, not even defined jargon. Use an analogy
from ordinary life. Two or three sentences. Say why it matters, not just what it
is.

> **Hot reload**: Swapping the rulebook while the game is still being played.
> Nobody stops, nobody notices, and if the new rulebook turns out to be
> unreadable the old one stays in force.

Write the analogy first and the mechanism second. If you cannot find an analogy,
the concept is probably not as hard as it looked: say it plainly instead.

### Markup

`.eli` is **built into the template**: `plan.css` styles it and `plan.js` wires
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
that would run off the end of a line, narrow viewports, and print: where the
marks vanish and every box prints inline as a footnote. `data-status` on the
`.eli` sets `--sig`, so an aside about an unsettled concept can carry the open
colour.

**Never put load-bearing content in an ELI10 box.** It explains what is already
written; it never adds a fact found nowhere else. A reader who ignores every ⓘ
must still get the whole plan: which is literally what print does.

## The playground

Where the concept has **rules a reader can poke at**, build a small interactive
model. This is what makes an HLD land: a PM who can type an input and watch a
rule fire understands the design in a way no paragraph achieves.

Good candidates: a matcher or rule evaluator, a state machine with buttons for
each transition, a precedence/priority resolver, a latency or cost calculator,
a before/after toggle on the same input.

**Skip it** when the concept is not interactive: a migration sequence or a
packaging change has nothing to poke. A playground that does not model anything
is decoration, and decoration in a controlled document is a liability.

Rules:

- **Vanilla JS, no dependencies, no build step, no network.** Inline in a
  `<script>` at the end of the body, or in
  `qstack/compound_engineering/plans/<slug>/<slug>.js`.
- **Plan-specific CSS goes in
  `qstack/compound_engineering/plans/<slug>/<slug>.css`**, loaded after
  `plan.css`. Never edit `plan.css`: it is shared by every plan in the repo.
- **Degrade honestly.** Render a static worked example in the HTML; let JS
  enhance it. A reader with JS disabled, or printing, still sees the example.
- **It must model the real rules.** If the plan says first-match wins and the
  playground evaluates all rules, the playground is now a lie in a controlled
  document. Mirror the specified semantics exactly, and label it
  `data-status="ref"`: it is material, not a decision.
- Wrap in `.plate` + `.breakout`, with a `.plate-head` naming what it models.
- Respect `prefers-reduced-motion`; the template's motion budget is stamps
  inking in once and the spine tracking position.
- Use logical properties only (`padding-inline`, `inset-inline-start`), same as
  the stylesheet.

## Part dividers

`plan.css` has no part divider: add one in `<slug>.css`:

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
  order. Number statements a reviewer might cite: never number cards for looks.
- **Status honestly.** `locked` / `open` / `deferred` / `gate` / `ref`. A document
  where everything is `locked` teaches a reader nothing. An unapproved design is
  `open`, and its title block says `Draft`.
- **Do not invent.** Every `file:line`, metric and benchmark in the output must
  come from the source, whether that is the draft or the conversation. If the
  source asserts something unverified, carry it across as a `.note` marked
  `open`: do not launder it into a fact. This rule bites hardest on a
  conversation, where a number you produced earlier in the session reads exactly
  like a number the user gave you. Check which it was.
- **Do not summarize away the detail.** The LLD half exists so an execution agent
  does not have to re-read the source. Losing the citations defeats the point,
  and when the source was a conversation the document is the only surviving
  record: detail dropped here is gone.
- **Fill the title block**: document id, revision, owner, issue date, sheet
  count, and a real "Ships when" condition.
- **Colophon** states what the document locks.

## Verify before reporting

Serve the complete `qstack/compound_engineering` tree with one command:

```bash
./qstack/scripts/serve.sh                       # 127.0.0.1:8000
./qstack/scripts/serve.sh 4173 127.0.0.1        # custom port and bind address
```

Then open
`http://127.0.0.1:<port>/plans/<slug>/plan.html`. The script uses
`python3 -m http.server`; Bash itself has no HTTP server. The user can invoke
`/qstack-serve-plans [address] [port]` instead of running the script directly;
the skill asks for either value that was not supplied.

Check, and say which you checked:

- Spine builds, clause numbers render, deep links copy.
- Theme toggle works: the diagrams and playground follow it.
- Playground behaves, and its static fallback is present.
- 720px viewport and print preview both hold (both are in `plan.css`; both break
  if the plan hard-codes widths).
- `Plan | Board` switches to the board and back, and `#board` in the URL opens
  the board directly over both HTTP and `file://`.
- A clause deep link such as `#s7-3` still opens the plan view and scrolls to
  that clause.
- Before the board phase has run, the board reads "No board yet" instead of
  rendering blank columns.
- Print preview still produces the plan while the board view is selected.
- No remote network requests: fonts and assets are all relative.

## Resolve open questions in the authoritative HTML

After the initial HTML is written and passes the checks above, run
`/qstack-ask-plan-open-questions` against the exact new
`qstack/compound_engineering/plans/<slug>/plan.html` path. This is a mandatory
post-render phase. Skip it only when the user's current request directly says
`skip open questions`, `do not ask open questions`, or includes
`--no-open-questions`. Requests such as `just convert the plan`, `HTML only`, or
`do it quickly` do not opt out. The HTML already exists before any question is
asked and is authoritative from this point forward; do not write the answers
back to a Markdown source, and do not create one.

Resolve the sibling skill relative to this skill's installed directory, read
its complete `SKILL.md`, and follow it exactly. If it is unavailable, do not
silently skip the phase: report that the HTML was created but the conversion
workflow is incomplete.

The question skill asks one material decision at a time and writes every answer
directly into the HTML before continuing. If it finds no material open
questions, continue without ceremony. If the user leaves a blocking question
unanswered, keep it marked `open`, keep the document status honest, and do not
claim that the plan is fully resolved.

Once the question skill returns, repeat the complete HTML verification above.
Its edits can affect clauses, diagrams, phases, the release matrix, print
layout, and sheet status. The post-question verification is the one reported to
the user.

## Break the plan into cards

Once the question pass has returned and the document verifies again, write the
plan's execution board. This is a mandatory post-render phase. Skip it only when
the user's current request directly says `skip the board`, `no board`, or
includes `--no-board`. Requests such as `just convert the plan` or `do it
quickly` do not opt out.

Read [board breakdown](references/board-breakdown.md) in full and follow it. It
is the complete rule set: where epics and cards come from, the points scale, the
`depends_on` and `files` contract the execution loops depend on, five checks that
run before the first line is written, and the append protocol.

The order is fixed. Cards are cut from decisions that are already settled, so
the board runs after the questions are answered and never before. A card written
against an open question is rework the moment the answer arrives.

The result is `board-events.js` beside `plan.html`: one `epic` event per swimlane
and one `created` event per unit of work, each carrying the `§` refs that point
back into the plan. `plan.html` needs no edit for this: the board view reads the
file. Reload the board view afterwards and confirm the lanes and cards render.

## After conversion: the accretion pass

Once the post-render question pass and final verification are complete, stop
and put this question to yourself, in full:

> **What's the single smartest and most radically innovative and accretive and
> useful and compelling addition you could make to the plan at this point?**

Think about it properly. Having just read the whole plan closely enough to
restructure it, you are in the best position anyone will be in to see what is
missing: the unasked question, the cheap experiment that would de-risk the
expensive bet, the second-order consequence nobody priced, the adjacent thing
that becomes nearly free once this ships.

Rules for the answer:

- **One idea.** Not a list. Pick the strongest and argue for it.
- **Accretive**: it compounds what is already there. Something the plan makes
  possible, not a replacement for the plan.
- **Concrete enough to cost.** Name what it takes and what it returns.
- **Say why now.** If it is equally good in six months, it is not this.
- **Be willing to say there isn't one.** A forced idea wastes the user's
  attention and devalues the times you have a real one.

**Do not apply it.** The conversion is done and reported as done. This lands
underneath, clearly marked as your own suggestion, for the user to take or leave.

## Report

Lead with the conversion: the path, local URL, serving command, which source the
plan came from, sheet count, which sheets are HLD vs LLD, what diagrams were
drawn, whether a playground was built (and if not, why not), which concepts got
ELI10 asides, and anything in the source you could not verify. Include how many
open questions were resolved and how many remain. When a board was written,
give its epic count,
card count, total points, and its URL: the same page with `#board`; when the
user opted out, say the board was skipped at their request and that running
`/qstack-plan-to-html` on the same plan adds one later. Say the plan has been
converted.

Then, under a clear break labeled *"For your consideration"*, give the one addition
from the accretion pass. Keep the two apart: the user asked for a conversion and
got one; the idea is extra, and should read as extra.

Do not commit.
