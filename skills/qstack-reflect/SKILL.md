---
name: qstack-reflect
description: >
  Produce an evidence-only report on how a project is actually being worked:
  checkout and branch topology, momentum over time, rework, instruction-file
  churn, and plan-record completeness. Every finding cites a count the reader
  can reproduce, and any category without enough evidence is refused rather
  than padded. Reads across every worktree Git tracks for the repository, not
  just the current checkout. Use when invoked as /qstack-reflect, optionally
  with one or more plan directories such as /qstack-reflect docs/rfcs, or when
  asked how the work is going, what patterns show up across checkouts, or
  where effort is being lost.
---

# /qstack-reflect

Report how this project is being worked, using only facts that can be counted
and re-checked. Read-only: never edit tracked files, never commit, never
change a branch or working tree.

This is a mechanical evidence pass. Do not interpret motive, diagnose the
reader, or write anything you cannot cite a number for. A finding is a count
plus its location. If a category lacks evidence, say so and move on.

## Arguments

`/qstack-reflect [plan-dir ...]`

Every argument is a directory holding plan documents, relative to the
repository root or absolute. Supplied paths are authoritative: use exactly
those and skip plan discovery entirely. This is the escape hatch for any
project whose plans live somewhere this skill would not think to look — a
`docs/` tree, an `rfcs/` directory, a path outside the repository.

With no arguments, fall back to discovery (category E). Discovery is a
convenience for projects using a known layout, not a claim to know where a
given project keeps its plans. When it finds nothing, say where it looked and
name this argument, rather than concluding the project has no plans.

## Scope

1. Resolve the repository root with `git rev-parse --show-toplevel`. Outside
   Git, say the skill needs a Git repository and stop.
2. Take the checkout set from `git worktree list --porcelain`. Git maintains
   this list itself, so it is an answer rather than a guess: no directory
   convention to match, no candidate to verify, and nothing to exclude.
3. State the scope out loud before any finding: repository, how many checkouts,
   how many of those Git marks `prunable`, and the commit span.

Do not enumerate directories looking for sibling checkouts, and do not compare
remote URLs to decide which belong. An earlier version did both. It missed
checkouts living outside the directory convention it knew — nine against five
on the first project it ran against — while the URL comparison it needed to
screen out strangers had to reason about protocols, ports and absent remotes,
none of which it got right. Git already knows where its worktrees are.

## Evidence

Collect all five. Report what each yields, including nothing.

**A. Checkout topology.** For each worktree: branch, last commit date, days
idle, commits ahead of the default branch, uncommitted file count, and whether
Git marks it prunable.

```bash
git worktree list --porcelain | awk '
  /^worktree /  { path = substr($0, 10) }
  /^branch /    { branch = substr($0, 8) }
  /^detached$/  { branch = "(detached)" }
  /^prunable /  { prunable = 1 }
  /^$/          { if (path) print path "|" branch "|" prunable; path=branch=prunable="" }
  END           { if (path) print path "|" branch "|" prunable }
'
```

Then, for each live path:

```bash
git -C "$path" log -1 --format=%at
git -C "$path" rev-list --count <default-branch>..HEAD
git -C "$path" status --porcelain | wc -l
```

Report: how many checkouts exist, how many carry no unmerged commits, how many
Git marks prunable, and idle time. A prunable entry is a checkout Git still
tracks whose directory is gone — worth listing, since it is work that was
started and abandoned without being cleaned up.

Two worktrees cannot share a branch; Git refuses. So there is no duplication to
detect here, and no aliasing either — `git worktree list` reports canonical
paths, so a symlinked shortcut to a checkout never appears as a second entry.

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

**E. Plan records.** When plan directories were given as arguments, use those
and skip the rest of this section. Otherwise discover them, and treat the
result as a guess rather than an inventory.

```bash
find . \( -name plan.html -o -name plan.md \) \
  -not -path './.git/*' -not -path '*/node_modules/*'
```

Classify each hit by the directory holding it:

- `qstack/compound_engineering/plans/` — current layout
- `compound-engineering/plans/` — legacy layout, equally valid
- anything else — unrecognised, which means unrecognised by this skill and
  says nothing about whether the project considers it managed

Plan documents may be named anything. `plan.html` and `plan.md` are the two
names qstack itself writes, so discovery finds those and misses every other
convention. A project naming them `design.md` or `rfc-001.md` will look empty.
That is the limit of the guess and must be stated in the report, alongside the
argument that overrides it.

For plans in a recognised layout, count how many carry an execution record and
an outcome record. Do not apply that completeness check elsewhere; those plans
were never promised those files.

An execution record is `execution.md`, `executor.md`, or the legacy
`implementation-notes.md` — the three names the other qstack skills read.
Any one of them counts, and the report names which was found. Counting only
`execution.md` reports an executed plan as never executed, which is the same
false-negative as missing its directory.

Report the count per location, any plan slug appearing in more than one
location (duplicated, or a half-finished migration), and the total outside the
recognised layouts. A project with plan documents but no execution or outcome
records is a finding in itself, and a different finding from having no plans.

Count `execution.md` and `outcome.md` wherever they sit, and say where. Never
report zero outcomes while outcome files exist elsewhere in the tree —
completeness records are routinely left behind when a plan moves.

Do not attempt to detect rules restated in different words. It was tested
against a 507-line instruction file and returned one match, which was a false
positive. Reinstate it only with evidence that it works.

## Refusal thresholds

State the corpus size for a category before its finding. Below these, write
"not enough evidence" and give the count instead of a finding:

- fewer than 3 checkouts — no topology findings
- fewer than 3 months of commits — no momentum trajectory
- fewer than 20 commits — no rework rate
- fewer than 5 plans in a recognised layout — no findings about plan-record
  completeness

Zero plans carrying an outcome record is never a reason to refuse. Above the
plan threshold it is the strongest finding the category has: a corpus of plans
that never got closed out. Refusing there would suppress the very count that
makes the finding, which is what every other rule here exists to prevent.

Refusing is the correct outcome, not a failure. Report refusals as plainly as
findings.

A refusal withholds the finding, never the count. Always print what was found
and where it was looked for before saying the evidence is too thin. A reader
must never be able to mistake "not enough evidence for a trend" for "you have
no plans" — that misreading is the exact failure this skill exists to avoid.

When plan discovery returns nothing, that is a statement about this skill's
guesses, not about the project. Say which directories and filenames were
checked, and name the argument that overrides them.

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
