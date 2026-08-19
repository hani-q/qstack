---
name: qstack-plan-close
description: >
  Close an executed plan by recording its outcome and proposing only durable
  instruction-file lessons.
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
predicted. This skill captures that delta and promotes the durable part into
the always-loaded rules.

## The convention

```
qstack/compound_engineering/plans/<feature-slug>/
├── plan.html                  # BEFORE  — what we predicted. Frozen once work starts.
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
- **Never claim a promotion that did not happen.** Verify with `grep` that the
  line actually landed in `CLAUDE.md` before marking it `yes`. A false `yes` is
  worse than an honest gap.
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

### 4. Write `outcome.md`

```yaml
status:  proposed | approved | in-progress | shipped | abandoned
date:    YYYY-MM-DD
commits: <sha + subject, one per line>
```

Then: **What shipped** (table of real paths), **Where it diverged from the plan**,
**What surprised us**, **Open follow-ups** (cross-check `TODO.md`), **Promoted**.

For `status: proposed`, open the file with a loud no-implementation-authority
block. An unapproved design must never read as a specification.

### 5. Propose promotions

For each durable lesson, apply the admission test: **would an agent break
something without this line?** Not "is this interesting."

- Passes → propose a concrete `CLAUDE.md` edit (root, or the relevant sub-repo
  `CLAUDE.md` if the rule is scoped to one repo).
- Fails → it stays in the plan folder. That is not a demotion; that is the design.

Show the proposed edits to the user and apply only what they accept. Keep root
`CLAUDE.md` near ~500 lines — if a promotion pushes it over, propose what to cut
or push down to a sub-repo file in the same breath.

Record every promotion in the **Promoted** table with a `yes` / `no — gap`
column. Open gaps are legitimate output; leave them visible.

### 6. Update the index

Add or update the row in the resolved plan root's README → "Current plans".

### 7. Report

Summarize: status set, what diverged, what got promoted, what gaps remain open.
State clearly that nothing was committed.
