---
name: qstack-plan-close
description: >
  Close an executed plan by recording its outcome against the plan and the
  execution board.
disable-model-invocation: true
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-plan-close

Turns a finished piece of work into compounding knowledge.

The plan is not the lesson. **The lesson is the delta between the plan and
reality** — what diverged, what surprised you, what cost hours that nothing
predicted. This skill captures that delta and writes it where the next plan in
this area will read it.

## The convention

```
qstack/compound_engineering/plans/<feature-slug>/
├── plan.html                  # BEFORE  — what we predicted. Frozen once work starts.
├── board.jsonl                # DURING  — append-only card events, written by agents.
├── execution.md               # DURING  — decisions, deviations, validation, and reviews.
└── outcome.md                 # AFTER   — this skill writes it.
```

If the repo has `qstack/compound_engineering/README.md`, read it first — it may
extend or override what follows. Also support the legacy
`compound-engineering/plans/<feature-slug>/` layout and its README. Prefer the
QStack layout when both contain the requested feature. If neither plan root
exists, offer to create the QStack layout before proceeding.

## Hard rules

- **Never edit `plan.html` or legacy `plan.md`.** The plan is frozen once work starts;
  divergence is recorded in `outcome.md`, not by rewriting history.
- **Never commit.** Write files and stop. The user commits.
- **Do not implement anything.** This skill only writes documentation.

## Steps

### 1. Identify the plan folder

```bash
ls qstack/compound_engineering/plans/
ls compound-engineering/plans/  # legacy, when present
```

If the user named a feature, use it. If not, infer from the current branch and
recent commits, then confirm with the user before writing.

### 2. Establish ground truth

Do not rely on the plan's claims. Gather what actually happened:

```bash
git log --oneline --format='%h %ad %s' --date=short -20 -- <paths the plan touched>
git log --all --oneline --diff-filter=A -- '<resolved-plan-folder>/*'
```

Then verify the shipped surface exists — `ls` the scripts, `grep` for the key
symbols the plan promised. A plan that says it shipped `foo_bar()` and a tree
with no `foo_bar()` is the single most valuable finding this skill can produce.

Read `board.jsonl` when the plan has one. It is the record of what was actually
scheduled and what actually closed. Fold the lines in file order, later events
win, and take every count from that fold rather than from a summary written by
hand. A plan with no board leaves only the execution record; say which one you
used.

Check whether the plan's artifacts were ever committed at all. Work done in a
gitignored directory leaves no recoverable design record — worth stating plainly
in the outcome when it happened.

### 3. Extract the delta

Read `plan.html` in either plan-root layout, falling back to legacy `plan.md`,
especially any "Locked decisions" and "Open questions" sections. Read every execution record that exists beside it:
prefer `execution.md`, but also read `implementation-notes.md` because it may
contain earlier history. State legacy sources in the outcome. Compare all of
them against the tree. Produce:

- **Where it diverged** — decisions the implementation reversed or refined, and
  why. Include names that changed (a plan calling a file `CONTRACT.json` when the
  tree has `.fs-contract.json` will mislead every future reader).
- **What surprised us** — anything that cost real time and no plan revision
  predicted. This is the highest-value section; mine the notes' validation log
  and audit findings for it.
- **Contradictions** — where the plan and `CLAUDE.md` now disagree. Flag as
  unverified rather than guessing which is right.

If both execution-record files are missing, or the available records are thin,
say so plainly in `outcome.md` rather than inventing detail. Note that the
execution record was not kept.

### 4. Check the board is closed

Every card in the fold must be `done` or `split`. If any card is `backlog`,
`claimed`, `in-progress`, `review`, or `blocked`, do not write `outcome.md`.
Name the open cards with their status, owner, and points, and stop. A plan with
work still on the board has not finished, whatever the tree looks like.

The board itself must also be stood down. A `coordinator` event with no later
`stood-down` from the same actor means one actor still holds the whole board,
and its `backlog` cards can be claimed while you are writing the outcome. Name
that actor and the claim's `ts`, and stop. Only a human settles it. This skill
never decides that a holder is gone.

The user can override by saying so. Record the override in `outcome.md` along
with the cards that were open and any coordinator still holding the board when
it was given. A plan with no `board.jsonl` skips this step.

### 5. Write `outcome.md`

```yaml
status:  proposed | approved | in-progress | shipped | abandoned
date:    YYYY-MM-DD
commits: <sha + subject, one per line>
```

Then: **What shipped** (table of real paths), **Where it diverged from the plan**,
**What surprised us**, **Open follow-ups** (cross-check `TODO.md`).

When the plan has a board, add one **Board** line under the front matter: points
closed of points planned, how many cards split, and every card that ever entered
`blocked` with what unblocked it. Scan the raw lines for the blocked ones, not
the fold, which only holds the final status. Cards that spent time blocked are
the cheapest honest signal of what actually cost time: a card stuck for two days
on a question nobody answered cost two days, whatever its points say.

For `status: proposed`, open the file with a loud no-implementation-authority
block. An unapproved design must never read as a specification.

### 6. Where a lesson goes

The lesson stays in `outcome.md`, where it is read by whoever plans the next
thing in this area. That is what `/qstack-plan-prior-art` is for, and it reads
the whole plan folder before a new plan is drafted.

A rule strong enough to belong everywhere is not a plan lesson at all. It is a
guardrail. Hand it to `/qstack-encode-lessons-in-structure`, which turns it into
a type, schema, lint, check, or script that enforces itself.

Neither path grows an always-loaded instruction file. This skill no longer edits
`CLAUDE.md` or `AGENTS.md`.

### 7. Update the index

Add or update the row in the resolved plan root's README → "Current plans".

### 8. Report

Summarize: status set, what diverged, what the board closed, what follow-ups
remain open. State clearly that nothing was committed.

## The index, when the folder grows

Once the plan folder holds a few dozen plans, opening every folder to find prior
art costs more than it returns. At that point this skill should append one line
per closed plan to `plans/INDEX.md` — slug, start and close dates, the outcome in
one sentence, and the files touched — so `/qstack-plan-prior-art` reads the index
for closed plans and opens folders only for the live ones.

It is deliberately not built yet. Below about 30 plans, reading the folders is
cheaper than keeping a second record honest, and an index that drifts from the
folders is worse than no index.
