---
name: qstack-ui-prototype
description: >
  Build a clickable static HTML prototype of one or two screens and keep it
  in the repo under qstack/compound_engineering/prototypes/<slug>/, or attach
  it to a QStack plan, where it is embedded in plan.html through an iframe
  with a link to open it in its own tab. Works from a brief in the
  conversation, a design doc, or an existing screen in the code. No
  framework, no build, no network. Use when invoked as /qstack-ui-prototype,
  when asked for a prototype, mockup, or wireframe that should be kept, or
  automatically from /qstack-plan-to-html when the plan changes something a
  person will look at.
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-ui-prototype

Give an idea a picture before anyone builds it. A clickable mock of one or two
screens settles layout, hierarchy, copy, and states faster than a page of
prose, and it is cheap enough to throw away and redo.

The prototype is **evidence, not contract**. On its own it records a
direction. Attached to a plan, it illustrates numbered clauses and is stamped
`Reference` so nobody mistakes it for a decision. A pixel in the mock is never
a requirement.

## Resolve the target

Work out which mode you are in before reading anything else.

**Plan mode** when any of these holds:

- a `plan.html` path was supplied, or `--into <plan.html>` was passed;
- `/qstack-plan-to-html` invoked this skill during a conversion;
- the conversation is clearly about one specific plan.

**Standalone mode** otherwise. Do not go looking through
`qstack/compound_engineering/plans/` for a plan to attach to. If exactly one
plan in that folder is unfrozen and its title plainly names the same screen
the user asked for, ask once, in plain words:

> There is a plan for this at `<path>`. Attach the prototype to it, or keep
> it standalone?

Any other case is standalone, and the report tells the user how to attach it
later.

Never select `.template/`. Never write a prototype for a Markdown draft: the
renderer runs this skill after the HTML exists.

### Frozen plans

Plan mode only. Before editing, check the plan directory for `execution.md`,
legacy `implementation-notes.md`, `outcome.md`, the retired `board.jsonl`, or
a `board-events.js` containing any call after its required
`{"event":"board","format":1}` header. If any exists, stop: execution has
started and the plan is frozen. Say so and name the file. A prototype for a
plan in flight belongs in the execution record through the loop, not in the
plan. A header-only event stream is the pre-board placeholder and does not
freeze the plan.

## Decide whether one is warranted

In standalone mode the user has already decided. Build it.

In plan mode, read the whole plan first. A prototype is warranted when the
plan adds or changes something a person sees: a page, a screen, a component,
a form, a dashboard, a CLI's output layout, an email, a document template.

It is not warranted for a migration, a packaging change, an API with no
rendered surface, a refactor, or an infrastructure change. Do not build one
to decorate the plan. An empty prototype in a controlled document is a
liability.

When run from `/qstack-plan-to-html` and the signals are present, ask one
question in plain words with a yes default:

> This plan changes screens people will look at. Build a clickable prototype
> of them and embed it in the plan? [Y/n]

`--prototype` answers yes without asking. `--no-prototype` skips the skill.
When the user invoked this skill directly against a plan, they have already
decided; do not ask. If the signals are absent, say in one line that no
prototype is warranted and return.

## Read the references, in this order

Resolve every path relative to this skill's real installed directory, never a
hardcoded home. If any reference is missing, report that the installation is
incomplete and stop.

1. `references/frontend-design.md`. This is the design brief. Follow it as
   written, especially its calibration list of things that read as generated.
   It is Anthropic's `frontend-design` skill, vendored verbatim so the same
   text is read in every harness whether or not that plugin is installed.
2. `references/ui-archetypes.md`. Find the row closest to the product. It
   sets density, motion, and restraint before any visual choice is made. An
   internal ops tool and a marketing page must not come out looking alike.
3. `references/ui-checklist.md`. Load this at the audit step, not before.

## Extract the brief

The brief comes from, in order of preference:

1. the plan, in plan mode;
2. a file the user pointed at: a design doc, a spec, a Markdown note, a
   screenshot;
3. an existing screen in the code, when the ask is to rework something that
   already renders. Read its markup and styles first; the prototype starts
   from what is there;
4. the conversation.

Write these down before opening an editor, in the brief's own words:

- **Subject and audience.** What the product is, who uses it, what job the
  screen does. If the brief does not say, take the answer from the repository
  and its README, and confirm it in one line to the user.
- **The screens.** One or two. Never the whole product. In plan mode, name the
  clause numbers each screen illustrates.
- **The stack**, so the mock uses the right idiom: web, desktop, phone, CLI.
- **The existing design.** Look for design tokens, a component library, a
  theme file, an existing `design-system/` folder, a brand guide. If the
  product already has a visual identity, the prototype uses it. A new
  direction is only appropriate for a product that has none, and the brief
  must say so.
- **Real content.** Field names, states, error messages, sample data from the
  brief. No lorem ipsum, no placeholder names, no fake numbers where real ones
  were given.
- **The archetype row** and its three dials.

## Where it lives

| Mode | Files |
| --- | --- |
| Standalone | `qstack/compound_engineering/prototypes/<slug>/index.html`, `prototype.css` and `prototype.js` when needed, and `README.md` |
| Plan | `qstack/compound_engineering/plans/<plan-slug>/prototype/index.html` and the same siblings, without the README |

`<slug>` is short, lowercase, hyphenated, and names the screen, not the
product: `settings-notifications`, not `myapp`. If the folder exists, ask
whether to replace it or pick a new slug. Never overwrite silently.

The standalone `README.md` is short and has four parts: the brief in the
user's words, the screens shown, the choices the mock makes that are still
open, and the date. It is what `/qstack-plan-prior-art` reads when a plan for
the same screen is finally written. Do not write one in plan mode; the plan's
caption carries that content.

Both locations are inside `qstack/compound_engineering/`, which is what
`qstack/scripts/serve.sh` serves, so a running plan server reaches the
prototype at `/prototypes/<slug>/index.html` or
`/plans/<plan-slug>/prototype/index.html` with no configuration.

## Build the prototype

Rules:

- **Static HTML and CSS. No framework, no build step, no network, no CDN
  fonts.** It must open from `file://` on a machine that has never heard of
  QStack, today and in ten years. Use system font stacks or fonts already in
  the repository.
- **JavaScript only for state.** Tabs between screens, a toggle between empty
  and populated, an error state, a disclosure. No data fetching, no
  libraries, no animation frameworks. Render the default state in HTML so the
  page is complete with scripts disabled.
- **One entry point.** More than one screen is navigated inside the page,
  not through multiple files.
- **Never `plan.css`, never the plan's look.** The mock is the product, not
  the document that describes it. Do not import the plan stylesheet or reuse
  its colors and type.
- **Both themes when the product has both.** Respect `prefers-color-scheme`
  and `prefers-reduced-motion`. Keep contrast at 4.5:1 for text and 3:1 for
  controls in each theme.
- **Two widths at least.** The mock must hold together at 375px and at the
  frame's width. Test by resizing, not by assuming.
- **Sized for a frame.** No fixed-position chrome, no `100vh` layouts that
  fight an iframe. The page lays out top to bottom and scrolls inside the
  frame. The full-tab link is the escape hatch for anything taller.
- **Mark what is uncertain.** Where the brief leaves a choice open, show one
  option and label it in the mock with a small `open` tag, so a reviewer can
  point at it.
- **Fidelity ceiling.** Enough to judge layout, hierarchy, copy, and states.
  Not pixel-perfect, not branded assets, not a component library. When the
  user asks for more, they are asking for the product, and that belongs on a
  board.
- Logical properties only: `padding-inline`, `margin-block`,
  `inset-inline-start`.

## Attach to a plan

Two ways in:

- **Adoption.** In plan mode, if `qstack/compound_engineering/prototypes/`
  holds a folder whose README names the same screen, or the user passed
  `--from <path>`, offer to adopt it instead of building anew. On yes:
  `git mv` the folder to `plans/<plan-slug>/prototype/`, move its "still open"
  list into the plan caption, delete the README, then embed. On no: build
  fresh and leave the standalone copy alone.
- **Later attachment.** `/qstack-ui-prototype --into <plan.html> --from
  <prototype-dir>` does the same move and embed for a plan that already
  exists. Frozen-plan rules apply.

There is never a second copy. Adoption moves; it does not copy.

## Embed it in the plan

Plan mode only. Add one sheet to Part I, the HLD, after the sheet that
describes the user-facing behavior and before Part II begins. Leave `.num`
empty: `plan.js` numbers sheets in document order, so every existing `§`
keeps its number and this one takes the next.

```html
<section class="sheet" id="prototype" data-title="Prototype" data-status="ref">
  <div class="sheet-head">
    <div>
      <p class="sheet-mark"><span class="num"></span><span class="label">Prototype</span></p>
      <h2>One way the changed screens could look.</h2>
    </div>
    <span class="stamp">Reference</span>
  </div>
  <p class="sheet-lede">
    A static mock of the two screens §3.1 and §3.4 change. The clauses, not
    the mock, are the requirement.
  </p>
  <figure class="plate breakout proto">
    <div class="plate-head">
      <h3>Settings › Notifications, populated and empty states</h3>
      <a class="proto-open" href="prototype/index.html" target="_blank"
         rel="noopener">Open in its own tab</a>
    </div>
    <iframe class="proto-frame" src="prototype/index.html"
            title="Prototype: Settings › Notifications" loading="lazy"></iframe>
    <figcaption>
      Illustrates §3.1 and §3.4. Does not decide: final palette, icon set,
      the empty-state copy (open in §6.2).
    </figcaption>
  </figure>
</section>
```

Copy `references/prototype-frame.css` into
`qstack/compound_engineering/plans/<plan-slug>/<plan-slug>.css`, creating the
file and its `<link>` after `plan.css` if the plan has neither. Never edit
`plan.css`. The snippet sizes the frame, styles the link, and in print
collapses the frame to its caption and path so the paper copy stays honest.

Add a `.ref` to the research-basis sheet pointing at `prototype/index.html`
with one line on what it shows. If the plan already has a board, do nothing
to it: the prototype is not a card.

## Audit before you show it

Open `references/ui-checklist.md` now. Walk the prototype against every rule
a static mock can violate: contrast, focus visibility, target size, heading
order, labels on every field, no emoji as icons, one icon style, a spacing
rhythm, readable measure, no information carried by color alone, motion under
the reduced-motion query. Fix what you find. List what you left and why in the
report, never in the plan.

Then hold the mock against the calibration list in `frontend-design.md`. If it
has the cream background and terracotta accent, the single accented headline
word, `01 / 02 / 03` markers over content that is not a sequence, or a fade-up
on every section, it is generic. Change it.

## Verify before reporting

Both modes:

- `index.html` opens from disk. Relative paths only. Nothing from the network.
- Scripts disabled still shows a complete default state.
- Holds together at 375px and at desktop width.
- The prototype uses none of the plan stylesheet.

Plan mode adds:

- `plan.html` opens from disk, the frame renders the mock, and the link opens
  the same file in a new tab.
- The new sheet has a `Reference` stamp and its caption names the clauses it
  illustrates and the choices it does not make.
- Every pre-existing `§` is unchanged. Run the same HTML verification
  `/qstack-plan-to-html` requires, because a new sheet affects the spine, the
  contents list, and print.

Standalone adds: the folder has `README.md`, and if `qstack/scripts/serve.sh`
is running, the file is reachable at
`http://127.0.0.1:<port>/prototypes/<slug>/index.html`.

When a browser tool is available, load the files and confirm the above by
looking. When none is, say that verification was static.

## What this skill never does

- It never writes into the product's source tree. No `design-system/` folder,
  no tokens file, no component. Everything lives beside the plan or under
  `prototypes/`.
- It never changes a clause, a status, or an open question. If building the
  mock exposed a question the plan did not ask, add it as a `.note` with
  `data-status="open"` on the sheet it belongs to and say so in the report.
- It never creates a board card, writes `execution.md`, or touches a frozen
  plan.
- It never installs or fetches anything. The references are on disk.
- It never leaves two copies of the same prototype.

## Report

Standalone, four lines: the path, the screens shown, the checklist items left
unfixed and why, and the exact command to attach it to a plan later:

```
/qstack-ui-prototype --into qstack/compound_engineering/plans/<plan-slug>/plan.html --from qstack/compound_engineering/prototypes/<slug>
```

Plan mode, four lines: the path of the prototype, the sheet it was embedded
under and the clauses it illustrates, the checklist items left unfixed and
why, and any open note added.

Then stop. Do not commit.
