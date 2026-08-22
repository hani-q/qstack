---
name: qstack-plan-prior-art
description: >
  Read the project's existing plan folder as content and brief the planner on
  what was already decided, deferred, and learned. Runs standalone before
  anything is written, or from /qstack-plan-to-html once a Markdown draft exists
  and before the HTML document is. Ranks earlier plans by overlap with the
  subject being planned, then reports decisions already settled, questions never
  answered, where plans diverged from reality, live board cards owning the same
  files, what this plan supersedes, and rules already binding in the instruction
  files. Read-only: it writes nothing into the plan folder. Use before drafting
  or converting a plan, when asked whether something was planned before, or when
  new work may overlap work already recorded.
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-plan-prior-art

Read the plans this project already wrote, then brief the plan about to be
written. The corpus holds decisions that were made, work that was postponed on
purpose, and execution records saying what the work actually cost.

This runs on its own, because the moment it helps is the moment nobody remembers
to ask for it.

## Read-only

Writes nothing into the plan folder. Never edits a plan, never appends to
`board.jsonl`, never commits. The output is a brief in the response plus one
block the planner pastes into the new plan.

The brief is derived: delete it and a second run reproduces it. The durable part
is the citations that land in the new plan's research-basis sheet. So keep the
brief short and get the references exactly right.

## The boundary with /qstack-reflect

`/qstack-reflect` counts. It reads across every worktree Git tracks, reports
numbers a reader can reproduce, and refuses to interpret them. A plan folder is
a file count there, never a source of meaning.

This skill reads the plan text and interprets it, for one purpose: informing the
plan about to be written. That single purpose is what permits the interpretation.
Do not widen it into a project health report, and do not fold the two skills
together. Reflect stays mechanical, this one stays narrow.

## Arguments

`/qstack-plan-prior-art [plan-dir ...]`

Every argument is a directory holding plans, relative to the repository root or
absolute. Supplied paths are authoritative: read those and skip discovery. This
is the escape hatch for a project whose plans live in `docs/`, in `rfcs/`, or
outside the repository.

The subject comes from the conversation rather than the arguments: it is the
feature the user is about to plan, or the Markdown draft when
`/qstack-plan-to-html` is the caller. When it is not clear, state what you took
it to be in the brief's first line, so a wrong guess is visible before anything
is read.

With no arguments, read `qstack/compound_engineering/plans/`, then the legacy
`compound-engineering/plans/` layout. Both are equally valid; when a slug appears
in both, read both and say so. Never read `.template/`.

Read `qstack/compound_engineering/README.md` first when it exists — it may extend
or override everything below. The legacy layout has its own README, same rule.

## What to read in each plan folder

```
qstack/compound_engineering/plans/<slug>/
├── plan.html      # title block, abstract, outline, then what it points at
├── board.jsonl    # cards still open, their owners, the files each one owns
├── execution.md   # decisions, deviations, tradeoffs, validation
└── outcome.md     # divergence, surprises, open follow-ups
```

- `plan.html` — the title block (document id, revision, status, `Supersedes`)
  and the abstract in full, so the plan can be named in one line. Then the
  outline, which is every `class="sheet"` line with its `data-title` and
  `data-status`, and every clause `<h3>`. The outline names every clause in the
  document and costs one grep. From there open in full every clause carrying
  `data-status="deferred"` or `data-status="open"`, every `DQ-###` decision, and
  every clause under a sheet the outline or the path grep puts on this subject.
- `execution.md` — design decisions, deviations from the plan, tradeoffs taken,
  questions raised during the work, and which validation was actually run. Read
  `executor.md` and legacy `implementation-notes.md` the same way when they
  exist. Any of the three counts, and the brief names which one was found.
- `outcome.md` — where it diverged, what surprised whoever did the work, and
  the follow-ups left open.
- `board.jsonl` — fold the lines in file order and skip a line you cannot parse
  rather than failing on it. Keep every card whose folded status is not `done`
  and not `split`, with its `files` and its owner. Keep the board's own claim
  too. A `coordinator` event with no later `stood-down` from the same actor
  means the whole board is claimed.

Later events win a card's status, and its owner follows a different rule. The
owner is the actor of the `claimed` carrying the earliest `ts`; a second
`claimed` from another actor loses the race rather than taking the card, and
equal timestamps are a tie the incumbent keeps. Ownership ends when the owner
appends `released` — a `released` from the actor named as the race loser clears
the flag and nothing else, and one from anybody else changes nothing. `blocked`
does not release a card either, so a blocked card still has the owner it had
before it stopped. Reading the last `claimed` in the file instead names the
wrong actor on exactly the boards where two actors claimed one card.

A settled decision is an ordinary `<article class="clause">` in a sheet whose
`data-status` is `locked`, and it carries no attribute of its own. Grep for a
status and it never comes back. The marked clauses are the ones still owed; the
unmarked ones are the ones somebody already answered. Reading only the marks
returns the corpus's unfinished business and hides every decision in it, which
is the opposite of what this skill is for. So the outline is read first, and it
decides which clauses get opened.

Four greps do the reading, and they print the `file:line` the citations need.
Both plan roots are named so a legacy folder is read too; `find` reports
whichever root is absent on stderr and carries on, which is what `2>/dev/null`
drops. When directories were supplied as arguments, name those instead. Both
roots are written out on every command rather than held in a shell variable. An
unquoted variable holding two paths word-splits in bash and does not in zsh, so
the variable form finds nothing at all under the default macOS shell.

```bash
# The outline: each sheet with its title and status, then every clause heading.
find qstack/compound_engineering/plans compound-engineering/plans \
  -name plan.html -exec grep -Hn 'class="sheet"\|<h3>' {} + 2>/dev/null

# Still owed: deferred and open sheets, notes, clauses, rows and fields.
find qstack/compound_engineering/plans compound-engineering/plans \
  -name plan.html -exec grep -Hn \
  'data-status="deferred"\|data-status="open"' {} + 2>/dev/null

# Decisions carrying their own id.
find qstack/compound_engineering/plans compound-engineering/plans \
  -name plan.html -exec grep -Hn 'data-decision-id="DQ-' {} + 2>/dev/null

# One file the new work will touch, across plans and execution records.
find qstack/compound_engineering/plans compound-engineering/plans \
  \( -name plan.html -o -name 'exec*.md' -o -name outcome.md \
     -o -name implementation-notes.md \) \
  -exec grep -HnF 'src/label/cache.ts' {} + 2>/dev/null
```

Run the last one once per file the new work will touch. It is ranking evidence
1, and it is the check that catches a settled clause the outline's wording would
have read past, because that clause never names the subject. It names the file.

## How to rank

Overlap with the subject about to be planned, computed in this order:

1. **Shared file paths.** A path named in a plan clause, an execution record, or
   a card's `files` that the new work will also touch. This is evidence: two
   documents point at the same file.
2. **Shared clause subject matter.** A clause about the same mechanism, format,
   or boundary under a different name. Weaker than a path, stronger than a word.
3. **Shared vocabulary.** The same terms appearing in both. This is a guess. Two
   plans with nothing to do with each other can share a dozen words.

Label the two kinds differently in the brief. A path overlap is stated as fact
with its `file:line`. A vocabulary overlap is stated as a possible relation the
reader decides on. Ranking a guess above evidence is the failure this order
exists to prevent.

## The six findings

Report all six, in this order, each carrying the plan slug and a path a reader
can open. Say "none" where there is none; an empty finding is information.

1. **Decisions already settled here.** Clauses in an earlier plan that decide
   something this one touches. Say which of the two kinds each is, because they
   are answered differently. A `locked` clause is settled, so this plan either
   assumes it or reopens it, and reopening it has to be said out loud in the new
   plan. A `deferred` clause was designed now and built later on purpose, so
   this plan may be the later half, and absorbing one is the good case. Either
   way, contradicting it reverses a decision somebody made deliberately. Name
   the clause and the `§` a reader can jump to.
2. **Questions never answered.** Clauses marked `data-status="open"` and `DQ-###`
   decisions still open. Some of them are this plan's questions too, and are
   inherited rather than asked again from scratch.
3. **Plan against reality in the same area.** Approved deviations recorded in
   `execution.md`, and anything `outcome.md` says cost more than the plan
   predicted. This is the finding that moves an estimate.
4. **Live cards owning files this plan will touch.** From every `board.jsonl`,
   the cards not yet `done` or `split` whose `files` intersect the files this
   plan will change, each with its owner. Do not plan over work in flight.
   Naming the owner is the point: the conflict is settled by talking to that
   actor, not by a new plan quietly claiming the same file. Name any board
   whose `coordinator` has no matching `stood-down`, with that actor and the
   claim's `ts`. One actor holds that whole board, so its `backlog` cards can
   be claimed while this brief is being read. Whether that run is live or ended
   without standing down is a question for the same actor.
5. **What this plan supersedes.** The earlier plan whose scope this one takes
   over, so the new title block's `Supersedes` field is honest instead of `—`.
   Overlap is not supersession. Say it only when the new plan assumes the
   earlier one's outcome.
6. **Rules already binding.** Rules in `AGENTS.md`, `CLAUDE.md`, and the
   `compound_engineering` README that already govern this area. Cite the rule
   and its line; do not copy its text into the plan.

## When there is nothing to compound from

No plan folder in either layout, and no directory supplied: say where you looked,
name the argument that overrides it, and stop. A project with no earlier plans
has no prior art, and that is a complete answer rather than a thin one.

Plans present but no execution or outcome records anywhere: say plainly that the
corpus records intent and not results. Findings 1, 2, 5 and 6 come from
`plan.html` and still hold. Finding 4 holds wherever a `board.jsonl` exists.
Finding 3 has no source, so report it as unavailable instead of inferring it
from the plan text.

Never write a lesson the corpus does not contain. A plan that predicted correctly
teaches nothing new, and saying so is worth more than a warning manufactured out
of it.

## Output

The brief: the subject as you understood it, how many plan folders were
outlined and how many of them were opened past the outline, then the six
findings, one or two sentences each with the slug and path inline. Saying what
was skipped is part of the brief. A reader who knows nine plans were outlined
and two opened can name the third. No score, no advice on how to write the
plan, no closing summary. A brief longer than the plan it precedes has failed.

Then the block the planner pastes, using the template's research-basis markup so
the citations land in the new plan's `.refs` sheet:

```html
<div class="refs">
  <div class="ref"><span class="num">R1</span><p><code>plans/label-cache/plan.html:212</code> defers the eviction policy to a later plan; this one decides it.</p></div>
  <div class="ref"><span class="num">R2</span><p><code>plans/label-cache/outcome.md:38</code> records the migration taking 3 days against the 1 planned.</p></div>
  <div class="ref"><span class="num">R3</span><p><code>AGENTS.md:9</code> already requires removing obsolete paths instead of adding a compatibility layer.</p></div>
</div>
```

One `.ref` per finding worth citing, not one per folder read. Number them `R1`,
`R2` and on, continuing after the largest `R` already in the plan when the plan
exists. Always cite `path:line`. A citation with no line number sends the reader
into a 700-line document to hunt for the clause.

## When it runs

Three entry points, and they are three different moments. What the skill reads
is the same at each; what can still be changed by it is not.

- **Standalone, before anything is written.** Nothing exists to contradict yet,
  so a finding can still change what the plan says. The subject comes from the
  conversation. This is the normal case.
- **From `/qstack-plan-to-html`, once the Markdown draft exists and before the
  HTML document is written.** The draft is the subject, so read it and rank
  against it. It is also what the user approved, so a conflict is carried into
  the HTML as a `.note` with `data-status="open"` on the sheet it disputes,
  rather than as a rewrite of the draft.
- **From the board phase of `/qstack-plan-to-html`**, after the plan is written
  and frozen, finding 4 only. Breakdown is where `files` are assigned to cards,
  so it is the last point at which a collision with another board can be caught
  before two actors claim the same file. Nothing else can move by then.

## When the folder outgrows this

This outlines every plan folder and opens only the clauses the outline points
at, which holds while the corpus is small. Past a few dozen plans even the
outline is a grep across every folder, and the right structure is a written
index: one line per plan, written by `/qstack-plan-close` as it closes the plan,
carrying the slug, the subject, the status, the files it touched, and anything
it left unresolved. This skill would then read the index for closed plans and
open a folder only for a plan still live.

That is not needed yet and is deliberately not built. An index written before the
corpus needs one is a second copy of facts that already have a home, and it goes
stale the first time somebody forgets to update it.
