---
name: qstack-reflect
description: >
  Produce an evidence-only report on how a project is actually being worked:
  workspace and branch topology, momentum over time, rework, instruction-file
  churn, and plan-record completeness. Every finding cites a count the reader
  can reproduce, and any category without enough evidence is refused rather
  than padded. Reads across every sibling workspace of the same repository, not
  just the current checkout. Use when invoked as /qstack-reflect, optionally
  with one or more plan directories such as /qstack-reflect docs/rfcs, or when
  asked how the work is going, what patterns show up across workspaces, or
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
2. Determine the workspace set. If the root sits at
   `<...>/workspaces/<project>/<workspace>`, the set is every sibling directory
   of `<project>`. Otherwise the set is the single checkout.

   This is a guess from one directory convention. Projects keeping their
   checkouts elsewhere, or using `git worktree`, will not match it. Keep every
   candidate whose `origin` remote matches this repository's and discard the
   rest, so the guess is verified rather than trusted, and report both numbers.
3. Detect aliases with `[ -L ]` on the entry itself, then resolve the rest to
   their physical paths with `pwd -P` and deduplicate on those. Do not identify
   an alias by comparing a logical path against a physical one: that compares
   the whole ancestry, so a single symlinked parent — `/tmp` on macOS, a
   symlinked home, a network mount — marks every entry an alias and empties the
   workspace set. A friendly alias symlinked to a generated workspace name is one
   workspace, not two, and counting both invents duplication that is not there.
   Report aliases separately as aliases. Workspace managers and hand-made
   shortcuts both produce readable names pointing at generated ones, and a run
   that skips this step reports confident, entirely false duplication.
4. State the scope out loud before any finding: repository, how many distinct
   workspaces, how many aliases, the commit span, and — always — where
   workspaces were looked for. One checkout found is never reported as a bare
   fact; it is reported as what the search covered and what it turned up, so a
   layout this skill does not recognise reads as an unmatched guess rather than
   as a project with no other work in flight.

## Evidence

Collect all five. Report what each yields, including nothing.

**A. Workspace topology.** For each workspace: branch, last commit date, days
idle, commits ahead of `origin/main`, uncommitted file count, and whether the
checkout is valid.

Enumerate with `find <project> -maxdepth 1 -mindepth 1` — not a shell glob,
which expands differently under bash and zsh — then resolve and deduplicate:

```bash
# One repository has several spellings. Compare identity, not the raw string.
norm_origin() {
  printf '%s\n' "$1" | tr 'A-Z' 'a-z' \
    | sed -e 's#^ssh://##' -e 's#^git://##' -e 's#^https\{0,1\}://##' \
          -e 's#^[^@/]*@##' \
          -e 's#^\([^/:]*\):[0-9][0-9]*/#\1/#' \
          -e 's#:#/#' -e 's#\.git$##' -e 's#/$##'
}

origin=$(norm_origin "$(git -C <repo-root> remote get-url origin)")
find <project-dir> -maxdepth 1 -mindepth 1 | while read -r w; do
  [ -L "$w" ] && { echo "ALIAS|$(basename $w)|$(readlink "$w")"; continue; }
  real=$(cd "$w" 2>/dev/null && pwd -P) || continue
  b=$(git -C "$real" rev-parse --abbrev-ref HEAD 2>/dev/null) || { echo "BROKEN|$(basename $w)"; continue; }
  [ "$(norm_origin "$(git -C "$real" remote get-url origin 2>/dev/null)")" = "$origin" ] \
    || { echo "FOREIGN|$(basename $w)"; continue; }
  echo "$b|$(basename $w)|$(git -C "$real" log -1 --format=%at)|$(git -C "$real" rev-list --count origin/main..HEAD 2>/dev/null)|$(git -C "$real" status --porcelain | wc -l)"
done
```

The origin check is what makes the directory convention a verified guess rather
than a trusted one. Without it, any unrelated repository parked in the same
parent directory is counted as a workspace of this project. Compare normalised
identity rather than the raw remote string: `git@host:owner/repo.git`,
`ssh://git@host/owner/repo.git` and `https://host/owner/repo` are one
repository, and checkouts made over different protocols are common. Matching
raw strings drops real workspaces, which is the same false negative in the
other direction. Report the foreign
count alongside the workspace count; a parent directory holding mostly other
projects means the convention did not match and the topology findings are
about a set the reader should see.

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

- fewer than 3 workspaces — no topology findings
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
