---
name: qstack-plan-close
description: >
  Close out an executed plan in compound-engineering/plans/<feature>/ by writing
  or updating outcome.md and promoting durable lessons into CLAUDE.md. Diffs the
  plan against implementation-notes.md and the actual shipped code plus git
  history, extracts what diverged and what surprised us, then proposes the
  minimal set of CLAUDE.md edits that pass the admission test.
  Use when asked to "close out the plan", "write the outcome", "the plan shipped",
  "promote the lessons", or after landing work that has a plan folder.
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
compound-engineering/plans/<feature-slug>/
├── plan.md | plan.html        # BEFORE  — what we predicted. Frozen once work starts.
├── implementation-notes.md    # DURING  — what actually happened. Written live.
└── outcome.md                 # AFTER   — this skill writes it.
```

If the repo has `compound-engineering/README.md`, read it first — it may extend
or override what follows. If the repo has no `compound-engineering/` folder,
offer to create one with this layout before proceeding.

## Hard rules

- **Never edit `plan.md` / `plan.html`.** The plan is frozen once work starts;
  divergence is recorded in `outcome.md`, not by rewriting history.
- **Never commit.** Write files and stop. The user commits.
- **Never claim a promotion that did not happen.** Verify with `grep` that the
  line actually landed in `CLAUDE.md` before marking it `yes`. A false `yes` is
  worse than an honest gap.
- **Do not implement anything.** This skill only writes documentation.

## Steps

### 1. Identify the plan folder

```bash
ls compound-engineering/plans/
```

If the user named a feature, use it. If not, infer from the current branch and
recent commits, then confirm with the user before writing.

### 2. Establish ground truth

Do not rely on the plan's claims. Gather what actually happened:

```bash
git log --oneline --format='%h %ad %s' --date=short -20 -- <paths the plan touched>
git log --all --oneline --diff-filter=A -- 'compound-engineering/plans/<feature>/*'
```

Then verify the shipped surface exists — `ls` the scripts, `grep` for the key
symbols the plan promised. A plan that says it shipped `foo_bar()` and a tree
with no `foo_bar()` is the single most valuable finding this skill can produce.

Check whether the plan's artifacts were ever committed at all. Work done in a
gitignored directory leaves no recoverable design record — worth stating plainly
in the outcome when it happened.

### 3. Extract the delta

Read `plan.md` (especially any "Locked decisions" / "Open questions" sections)
and `implementation-notes.md` side by side against the tree. Produce:

- **Where it diverged** — decisions the implementation reversed or refined, and
  why. Include names that changed (a plan calling a file `CONTRACT.json` when the
  tree has `.fs-contract.json` will mislead every future reader).
- **What surprised us** — anything that cost real time and no plan revision
  predicted. This is the highest-value section; mine the notes' validation log
  and audit findings for it.
- **Contradictions** — where the plan and `CLAUDE.md` now disagree. Flag as
  unverified rather than guessing which is right.

If `implementation-notes.md` is missing or thin, say so plainly in `outcome.md`
rather than inventing detail. Note that the notes were not kept.

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

Add or update the row in `compound-engineering/README.md` → "Current plans".

### 7. Report

Summarize: status set, what diverged, what got promoted, what gaps remain open.
State clearly that nothing was committed.
