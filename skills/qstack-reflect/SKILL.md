---
name: qstack-reflect
description: >
  Produce an evidence-only report on how a project is actually being worked:
  workspace and branch topology, momentum over time, rework, instruction-file
  churn, and plan-record completeness. Every finding cites a count the reader
  can reproduce, and any category without enough evidence is refused rather
  than padded. Reads across every sibling workspace of the same repository, not
  just the current checkout. Use when invoked as /qstack-reflect, or when asked
  how the work is going, what patterns show up across workspaces, or where
  effort is being lost.
---

# /qstack-reflect

Report how this project is being worked, using only facts that can be counted
and re-checked. Read-only: never edit tracked files, never commit, never
change a branch or working tree.

This is a mechanical evidence pass. Do not interpret motive, diagnose the
reader, or write anything you cannot cite a number for. A finding is a count
plus its location. If a category lacks evidence, say so and move on.

## Scope

1. Resolve the repository root with `git rev-parse --show-toplevel`. Outside
   Git, say the skill needs a Git repository and stop.
2. Determine the workspace set. If the root sits at
   `<...>/workspaces/<project>/<workspace>`, the set is every sibling directory
   of `<project>`. Otherwise the set is the single checkout.
3. Resolve every candidate to its physical path with `pwd -P` and deduplicate
   on that. A friendly alias symlinked to a generated workspace name is one
   workspace, not two, and counting both invents duplication that is not there.
   Report aliases separately as aliases. This is not hypothetical: the first
   project this was run against had five aliases among eleven entries, and
   counting them as workspaces produced a confident, entirely false finding.
4. State the scope out loud before any finding: repository, how many distinct
   workspaces, how many aliases, and the commit span. A reader must know what
   was and was not read.

## Evidence

Collect all five. Report what each yields, including nothing.

**A. Workspace topology.** For each workspace: branch, last commit date, days
idle, commits ahead of `origin/main`, uncommitted file count, and whether the
checkout is valid.

Enumerate with `find <project> -maxdepth 1 -mindepth 1` — not a shell glob,
which expands differently under bash and zsh — then resolve and deduplicate:

```bash
find <project-dir> -maxdepth 1 -mindepth 1 | while read -r w; do
  real=$(cd "$w" 2>/dev/null && pwd -P) || continue
  [ "$real" = "$(cd "$w" && pwd)" ] || { echo "ALIAS|$(basename $w)|$real"; continue; }
  b=$(git -C "$real" rev-parse --abbrev-ref HEAD 2>/dev/null) || { echo "BROKEN|$(basename $w)"; continue; }
  echo "$b|$(basename $w)|$(git -C "$real" log -1 --format=%at)|$(git -C "$real" rev-list --count origin/main..HEAD 2>/dev/null)|$(git -C "$real" status --porcelain | wc -l)"
done
```

Report: branches carrying more than one *distinct* workspace, workspaces with
no unmerged commits, broken checkouts, and idle time. When two distinct
workspaces share a branch and both are dirty, diff their uncommitted changes
and say explicitly whether work is at risk of being lost. Identical diffs
almost always mean the two paths are the same checkout — verify that before
reporting anything as at risk.

**B. Momentum.** Commits per month across the span, plus weekday distribution.
A monotonic rise or fall over three or more months is the finding; month-to-month
noise is not.

```bash
git log --format='%ad' --date=format:'%Y-%m' | sort | uniq -c
```

**C. Rework.** Reverts, fixup and squash commits, and the share of subjects
containing "fix".

```bash
git log --format='%s' | grep -ciE '^Revert|^fixup!|^squash!'
```

**D. Instruction churn.** For `CLAUDE.md` and `AGENTS.md`: current size, how
many commits touched the file, when it was last touched, and added/removed
lines per commit.

```bash
for instructions in CLAUDE.md AGENTS.md; do
  [ -f "$instructions" ] || continue
  echo "== $instructions"
  git log --follow --format='%h %ad' --date=short --numstat -- "$instructions"
done
```

Report large single-commit deletions (a pruning event), regrowth after one, and
staleness — the file untouched while commits continued is a finding, stated as
the two counts side by side.

**E. Plan records.** Discover plan documents; never assume a location. Plans
predate this skill and often sit outside any managed directory.

```bash
find . \( -name plan.html -o -name plan.md \) \
  -not -path './.git/*' -not -path '*/node_modules/*'
```

Classify each hit by the directory holding it:

- `qstack/compound_engineering/plans/` — current layout
- `compound-engineering/plans/` — legacy layout, equally valid
- anything else — unmanaged

For plans in either managed layout, count how many carry `execution.md` and
`outcome.md`. Do not apply that completeness check to unmanaged plans; they
were never promised those files.

Report three things: the count per location, any plan slug appearing in more
than one location (duplicated or a half-finished migration), and the total of
unmanaged plans. A repository with plan documents but no execution or outcome
records is a finding in itself — the plan lifecycle is not being used — and it
is a different finding from having no plans at all.

Count `execution.md` and `outcome.md` wherever they sit, and say where. Never
report zero outcomes while outcome files exist outside the managed layout. On
the first project this ran against, both outcome records lived in an unmanaged
directory while the managed copies of the same plans had none — the plan had
been migrated and its outcome left behind.

Do not attempt to detect rules restated in different words. It was tested
against a 507-line instruction file and returned one match, which was a false
positive. Reinstate it only with evidence that it works.

## Refusal thresholds

State the corpus size for a category before its finding. Below these, write
"not enough evidence" and give the count instead of a finding:

- fewer than 3 workspaces — no topology findings
- fewer than 3 months of commits — no momentum trajectory
- fewer than 20 commits — no rework rate
- fewer than 5 managed plans, or zero with `outcome.md` — no findings about
  plan-record completeness

Refusing is the correct outcome, not a failure. Report refusals as plainly as
findings.

A refusal withholds the finding, never the count. Always print what was
discovered, including plans found outside a managed layout, before saying the
evidence is too thin. A reader must never be able to mistake "not enough
evidence for a trend" for "you have no plans" — that misreading is the exact
failure this skill exists to avoid.

## Output

Write to `qstack/compound_engineering/reflections/<YYYY-MM-DD>.md`, taking the
date from `date +%F`. On first run also write
`qstack/compound_engineering/reflections/.gitignore` containing `*`, so reports
stay local without touching the repository's own ignore rules.

Structure: scope, then one section per category, then refusals. Every finding
carries its numbers inline. No summary paragraph, no advice, no score.

End every report with this line verbatim, so credit travels with the artifact
rather than only with the source:

```
Method adapted from Reflection Engine by Kevin Rose (@kevinrose) —
https://github.com/kropdx/reflection-engine
```

Render HTML only when the user asks, reusing `/qstack-plan-to-html`.

## Deliberately not in this version

Session transcripts are not read. They are the larger corpus and the closer
match to how the work actually went, but they need an extraction pass first;
until that exists, this skill stays with what can be counted directly.

There is no reflective layer here — no questions answered, no confidence
scores, no advice. Add it only over this evidence, never over the raw corpus,
so every claim stays traceable to a count.

## Prior art

The method — declare the corpus boundary first, ground every claim in cited
evidence, refuse rather than pad — is adapted from
[Reflection Engine](https://github.com/kropdx/reflection-engine) by Kevin Rose
([@kevinrose](https://x.com/kevinrose)), v1.3, commit `1a3301c`, retrieved
2026-08-07. That prompt reads personal conversation history in a chat
assistant; this skill reads an engineering corpus and adds a deterministic
evidence pass. All text here is original. Not affiliated with or endorsed by
the original author.

Do not copy that project's questions or wording into this repository. It
carries no licence.
