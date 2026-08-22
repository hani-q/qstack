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

Collect all six. Report what each yields, including nothing.

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

For plans in a recognised layout, count how many carry an execution record, an
outcome record, and a `board.jsonl`. Do not apply that completeness check
elsewhere; those plans were never promised those files.

An execution record is `execution.md`, `executor.md`, or the legacy
`implementation-notes.md` — the three names the other qstack skills read.
Any one of them counts, and the report names which was found. Counting only
`execution.md` reports an executed plan as never executed, which is the same
false-negative as missing its directory.

`board.jsonl` is the execution board, append-only card events at one JSON
object per line. Count the plans holding one and the events in each, over the
same directories this section resolved:

```bash
find <plan-dirs> -name board.jsonl -exec wc -l {} +
```

A board with no events is its own finding, and not the same as a plan with no
board: one was opened and never written to, the other was never opened.

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

**F. Board flow.** Counts from the `board.jsonl` files under the plan
directories E resolved, discovered or supplied. Each line is one JSON object,
so `grep` and `awk` read the fields directly and nothing here needs a JSON
parser.

Cards created, and the points on them. A split parent's points leave the total
once it splits, since the children carry that work now and counting both counts
it twice:

```bash
find <plan-dirs> -name board.jsonl -exec grep -h '"event":"created"' {} + |
  wc -l
find <plan-dirs> -name board.jsonl -exec awk '
  { c = ""; id = "" }
  match($0, /"card":"[^"]*"/) { id = substr($0, RSTART+8, RLENGTH-9)
                                c = FILENAME SUBSEP id }
  /"event":"created"/ { known[c] = 1
                        if (match($0, /"points":[0-9]+/))
                          pt[c] = substr($0, RSTART+9, RLENGTH-9) }
  !(c in known)       { next }
  /"event":"split"/   { parent[c] = 1 }
  END { for (c in pt) if (!(c in parent)) s += pt[c]
        print s+0 }
' {} +
```

Every card array here keys on `FILENAME SUBSEP` the card id, never the id
alone. One `awk` process reads every board `find` returns, and every board
numbers its cards from `T-01`, so a bare id merges two boards' `T-01` into one
card. On a two-board fixture holding 9 cards and 16 points, bare ids counted
16 points as 9 and 9 cards as 5. A bare id also opens the `known` gate below to
the other board, so an event naming a card this board never declared passes the
gate and is counted.

Closed against still open, in cards and in points. A card is closed when it
reaches `done`, or when a `split` closes it into children, which closes it at
zero points so closed and open still add up to the total above:

```bash
find <plan-dirs> -name board.jsonl -exec awk '
  { c = ""; id = "" }
  match($0, /"card":"[^"]*"/) { id = substr($0, RSTART+8, RLENGTH-9)
                                c = FILENAME SUBSEP id }
  /"event":"created"/ { open[c] = 1
                        if (match($0, /"points":[0-9]+/))
                          pt[c] = substr($0, RSTART+9, RLENGTH-9) }
  !(c in open) && !(c in shut) { next }
  /"event":"split"/ { pt[c] = 0; delete open[c]; shut[c] = 1 }
  /"to":"done"/     { delete open[c]; shut[c] = 1 }
  END { for (c in shut) { n++; p += pt[c] }
        for (c in open) { m++; q += pt[c] }
        print n+0 " closed, " p+0 " points; " m+0 " open, " q+0 " points" }
' {} +
```

The `!(c in open)` line is the gate every card-keyed program here repeats: an
event naming a card no `created` event declared is skipped, exactly as the
board skips it. Without it a single stray line invents a card and the count
stops matching what the board shows. The card count above needs no gate, since
a `created` event is the declaration.

Cards per actor: the distinct cards each actor moved, claimed, released, split,
or noted. `created` events are excluded, because the actor that ran the
breakdown declared every card on the board and worked none of them — counting
`created` puts that actor at the top of a list meant to show who did the work.
Report the count as cards touched after breakdown, which is what it is:

```bash
find <plan-dirs> -name board.jsonl -exec awk '
  { c = ""; id = ""; a = "" }
  match($0, /"actor":"[^"]*"/) { a = substr($0, RSTART+9, RLENGTH-10) }
  match($0, /"card":"[^"]*"/)  { id = substr($0, RSTART+8, RLENGTH-9)
                                 c = FILENAME SUBSEP id }
  /"event":"created"/ { known[c] = 1; next }
  (c in known) && a   { print a, FILENAME, id }
' {} + | sort -u | awk '{ n[$1]++ } END { for (a in n) print a, n[a] }'
```

Backward moves. The sequence is `backlog` → `claimed` → `in-progress` →
`review` → `done`, and a `moved` whose `to` sits earlier in it than its `from`
is rework. That count is the reason this category exists. `blocked` and `split`
are outside the sequence, so moves touching them are not counted here.

```bash
find <plan-dirs> -name board.jsonl -exec awk '
  BEGIN { split("backlog claimed in-progress review done", seq, " ")
          for (i in seq) rank[seq[i]] = i }
  { c = ""; id = ""; f = ""; t = "" }
  match($0, /"card":"[^"]*"/) { id = substr($0, RSTART+8, RLENGTH-9)
                                c = FILENAME SUBSEP id }
  /"event":"created"/         { known[c] = 1 }
  !(c in known)               { next }
  match($0, /"from":"[^"]*"/) { f = substr($0, RSTART+8, RLENGTH-9) }
  match($0, /"to":"[^"]*"/)   { t = substr($0, RSTART+6, RLENGTH-7) }
  /"event":"moved"/ && rank[f] && rank[t] && rank[t] < rank[f] { n++ }
  END { print n+0 }
' {} +
```

Time in `blocked`, per card, from the `moved` that entered it to the `moved`
that left, plus the cards that never left. A blocked card keeps its owner, so
this is time an owned card sat still. Each line names its board file first,
since two boards both carry a `T-01`. `secs` converts the ISO 8601 `ts` to
seconds, since awk has no portable date function.

```bash
find <plan-dirs> -name board.jsonl -exec awk '
  function secs(t,   d, y, m, n) {
    gsub(/[-T:Z]/, " ", t); split(t, d, " ")
    y = d[1]; m = d[2] + 0; if (m < 3) { y--; m += 12 }
    n = 365*y + int(y/4) - int(y/100) + int(y/400) + int((153*m-457)/5) + d[3]
    return n*86400 + d[4]*3600 + d[5]*60 + d[6]
  }
  { c = ""; id = "" }
  match($0, /"card":"[^"]*"/) { id = substr($0, RSTART+8, RLENGTH-9)
                                c = FILENAME SUBSEP id }
  /"event":"created"/         { known[c] = 1 }
  !(c in known)               { next }
  match($0, /"ts":"[^"]*"/)   { ts = substr($0, RSTART+6, RLENGTH-7) }
  /"event":"moved"/ && /"to":"blocked"/   { held[c] = secs(ts) }
  /"from":"blocked"/ || /"event":"split"/ || /"to":"done"/ {
                                if (held[c]) {
                                  print FILENAME, id,
                                        (secs(ts) - held[c]) / 3600 " h"
                                  delete held[c] } }
  END { for (c in held) n++; print n+0 " never left blocked" }
' {} +
```

Splits, and the parent's points against the sum of its children's. Points are
set once at breakdown and never edited, so that gap is the only record of how
far the estimate was off. Each line names its board file first, for the same
reason the blocked lines do:

```bash
find <plan-dirs> -name board.jsonl -exec awk '
  { c = ""; id = "" }
  match($0, /"card":"[^"]*"/)       { id = substr($0, RSTART+8, RLENGTH-9)
                                      c = FILENAME SUBSEP id }
  /"event":"created"/               { known[c] = 1
                                      if (match($0, /"points":[0-9]+/))
                                        pt[c] = substr($0, RSTART+9, RLENGTH-9) }
  !(c in known)                     { next }
  match($0, /"split_from":"[^"]*"/) { p = substr($0, RSTART+14, RLENGTH-15)
                                      kids[FILENAME, p] += pt[c] }
  /"event":"split"/                 { parent[c] = 1 }
  END { for (c in parent) { n++; split(c, k, SUBSEP)
                            print k[1], k[2], pt[c], "->", kids[c]+0 }
        print n+0 " splits" }
' {} +
```

Bad writes, the three the board flags: a second `claimed` with no `released`
between, a `moved` whose `from` is not the card's status at that point, and a
`released` from an actor that is neither the owner nor the loser of a race.

```bash
find <plan-dirs> -name board.jsonl -exec awk '
  { c = ""; id = ""; a = ""; f = ""; t = "" }
  match($0, /"card":"[^"]*"/)  { id = substr($0, RSTART+8, RLENGTH-9)
                                 c = FILENAME SUBSEP id }
  match($0, /"actor":"[^"]*"/) { a = substr($0, RSTART+9, RLENGTH-10) }
  match($0, /"from":"[^"]*"/)  { f = substr($0, RSTART+8, RLENGTH-9) }
  match($0, /"to":"[^"]*"/)    { t = substr($0, RSTART+6, RLENGTH-7) }
  /"event":"created"/  { st[c] = "backlog"; own[c] = "" }
  !(c in st)           { next }
  /"event":"claimed"/  { if (own[c] != "") { races++; lost[c] = a }
                         else own[c] = a
                         st[c] = "claimed" }
  /"event":"released"/ { if (a == own[c]) { own[c] = ""; st[c] = "backlog" }
                         else if (a == lost[c]) delete lost[c]
                         else stray++ }
  /"event":"moved"/    { if (st[c] != f) bad++; st[c] = t }
  END { print races+0 " claim races, " bad+0 " from-mismatches, " \
              stray+0 " stray releases" }
' {} +
```

The loser of a claim race releases without owning the card, so only the holder's
`released` moves it. The loser's is the one release from a non-owner that is
not a bad write, and dropping it turns every resolved race into a phantom
mismatch on the next move.

This count picks the winner of a race by file order, where the first `claimed`
wins, while `board.js` picks it by earliest `ts`. The two agree whenever the
appends land in timestamp order. When a line appended later carries an earlier
stamp, the board names the other actor as the winner, and the true loser's
`released` is counted here as a stray release. It approximates the board by
file order rather than applying the board's rule.

These are historical counts. The board shows what is still wrong now, so a race
that was resolved appears here and not there. Report both numbers rather than
reconciling them.

Coordinator claims. One actor holds a board for the length of a run and appends
`stood-down` when it ends, so a board still held is a run that stopped without
ending and needs a person. A `stood-down` releases only the actor that wrote it
and never clears anyone else's hold, so this tracks every live holder as
`hold[FILENAME, actor]` rather than one holder per file. `live[FILENAME]`
counts the open ones, and an overlap is live while that count is above one:

```bash
find <plan-dirs> -name board.jsonl -exec awk '
  { a = "" }
  match($0, /"actor":"[^"]*"/) { a = substr($0, RSTART+9, RLENGTH-10) }
  /"event":"coordinator"/ { claims++
                            if (!((FILENAME, a) in hold)) {
                              hold[FILENAME, a] = 1; live[FILENAME]++ }
                            if (live[FILENAME] > 1) over++ }
  /"event":"stood-down"/  { if ((FILENAME, a) in hold) {
                              delete hold[FILENAME, a]; live[FILENAME]-- } }
  live[FILENAME] > 1 && /"card":"/ { wrote++ }
  END { for (k in hold) { split(k, h, SUBSEP); n++
                          print h[1], "held by", h[2] }
        print claims+0 " coordinator claims, " over+0 " overlapping, " wrote+0 \
              " card writes under overlap, " n+0 " boards still held" }
' {} +
```

Holding one actor per file loses the second one. On a board reading
`coordinator aa`, `coordinator bb`, `stood-down aa`, then three card writes by
`bb`, a single-holder version reports zero boards still held while `bb` holds
it with no stand-down, and counts those three writes as made under an overlap
that had already ended. The version above reports one board held by `bb` and
zero writes under overlap.

The stand-down protocol produces one overlapping claim per resolved race: the
second loop appends its `coordinator`, re-reads, sees the earlier one first in
the file and stands down. An overlap on its own is that protocol working. The
count that matters is the card writes underneath a live one, which is a second
actor picking cards while another actor held the board.

Each count here totals every board found. Cards stay apart by file, so two
boards' `T-01` never merge, but the totals still cover the whole set. Point one
at a single plan directory when the count belongs to one plan. Report sizes in
points as well as cards, since a card count hides the difference between a 1
and a 5.

## Refusal thresholds

State the corpus size for a category before its finding. Below these, write
"not enough evidence" and give the count instead of a finding:

- fewer than 3 checkouts — no topology findings
- fewer than 3 months of commits — no momentum trajectory
- fewer than 20 commits — no rework rate
- fewer than 5 plans in a recognised layout — no findings about plan-record
  completeness
- fewer than 3 plans carrying a board, or fewer than 20 board events in total —
  no board-flow findings; print both counts anyway

A board still held by a coordinator is reported below that threshold too. One
board is enough to show a run that stopped without standing down, and the
threshold guards trends rather than facts about a single board.

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

Structure: scope, then one section per category — topology, momentum, rework,
instruction churn, plan records, board flow — then refusals. Every finding
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
