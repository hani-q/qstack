---
name: qstack-review
description: >
  Review a pull request, a branch against its base, or the working tree against
  a generic correctness baseline plus the repository's own
  CODE_REVIEW_RULES.md, then report findings and a score computed from their
  severities. Next to /review and /code-review, this one adds repository rules
  files, a score no reviewer is asked to choose, and a report-only contract:
  nothing is edited, posted, or landed.
disable-model-invocation: true
license: MIT
metadata:
  author: hani
  stack: qstack
---

# /qstack-review

Review a change against two layers of rules and report findings with a computed
score. The result is analysis, not permission to edit, commit, push, publish,
deploy, or comment anywhere.

## Resolve the scope

Take the scope from the user's request, in this order:

1. A named pull request. Read its diff and record its head commit.
2. A branch. Diff it against the merge base with its base branch.
3. Otherwise the working tree. Include committed changes on this branch plus
   uncommitted and untracked files.

Name the exact commit before reading anything, and put it in the report. For a
pull request or a branch, that is the head being reviewed. For a working tree,
it is the commit the uncommitted work sits on, reported as the base rather than
as the reviewed state, because uncommitted work has no commit of its own. A
review that cannot name what it read cannot be checked afterwards.

"Committed changes on this branch" means the commits above the merge base with
the base branch. On a branch with no base, a default branch or a repository
whose only commit is its root, there are none, and the working tree is the whole
scope. Ask when two candidates are equally plausible.

## Discover the rules

Layer 1 is the generic baseline below. It ships with this skill and applies in
every repository, including one that has never heard of this skill.

Layer 2 is the repository's own law. Read `CODE_REVIEW_RULES.md` at the
repository root when it exists, then every `CODE_REVIEW_RULES.md` in a directory
that contains a changed file. A nested file governs only the changed files below
its own directory.

A rules file holds two kinds of row. A Flag rule says "if you see this, say
something, and here is how serious it is". A Leave-alone rule says "this looks
wrong and is not, and here is why". Layer 2 wins on its own subjects and adds to
layer 1 everywhere else.

Where a root row and a nested row cover the same subject, the nested row wins
for the files below its directory, because writing a nested file is how a
directory sharpens or softens a root rule. A nested file contributes Flag and
Leave-alone rows. Take the severity
definitions and the score table from the root file when it supplies them, and
from this skill otherwise.

Both layers apply to the whole of each changed file, not to the diff hunk alone.
A rule that fires on a line the change did not touch is still a finding, because
the change is what brought the file under review. Say in the finding that it
predates the change, so a reader can weigh it.

With no rules file anywhere, the baseline runs alone and the report says so, so
a reader can tell an unruled repository from a clean one.

## Read the change

Read every changed file in full rather than the diff excerpt alone, plus the
code around each change that the change depends on. Apply both layers to each
file.

Every finding carries a `path:line`, the consequence, and the smallest fix that
removes it. Set severity by consequence, never by how much code the change
touches.

The read is done when every changed file has been read and is either cited in a
finding or explicitly cleared. A file left unread for size or format is neither:
name it in the report.

## The generic baseline

Correctness invariants that hold in any repository, each written as a thing to
check rather than a subject to worry about. A violation is a finding at the
severity its consequence earns.

1. **Sentinels**: check that no value the domain can legitimately hold also
   means missing, failed, or not yet set. Ask what this returns when there is
   nothing to return, then ask whether real data can equal that answer. Zero,
   -1, an empty string, and an empty collection are the usual overloads. A
   reachable collision takes the wrong branch on valid input and reports
   nothing, so its severity is whatever that branch then does.
2. **State that outlives one call**: a buffer, cursor, registry entry, or
   thread slot reused across calls needs a named owner, a progress invariant,
   and a shutdown order. Ask who releases it, what guarantees the cursor
   advances, and what stops teardown from racing a live user of it. Check each
   of the three: a missing owner is unbounded growth, a missing progress
   invariant is a loop that can stall, and a missing shutdown order frees
   something still in use.
3. **A test observes what it names**: check that a new or changed test watches
   the process, bytes, or registry entry it claims to verify, rather than a
   wrapper around it, a mock of the code under test, or a log line that would
   appear anyway. Ask whether the test would fail if the implementation were
   deleted. One that would still pass is a defect in the test, cited at the
   test's own line.
4. **Lowering keeps the construct**: where a parser, compiler, transformer, or
   serialiser handles a set of supported constructs, check that every one of
   them survives the change. Silently dropped, reinterpreted as a different
   construct, and accepted then lowered to empty are three separate failure
   modes.
   Ask which construct now falls through to the default arm. Accept-as-empty is
   the worst of the three, because the output is well formed and wrong.
5. **Public endpoints**: an endpoint that accepts or returns sensitive data has
   to authenticate the caller, constrain the origins that may reach it, and
   take rate-limit identity only from a proxy chain it trusts. Ask which header
   decides who this caller is, and whether the caller can set that header.
   Reading a client-supplied address for rate-limit identity is a bypass, not a
   missing hardening step.
6. **Declared paths reach the artifact**: for a packaging, container, image, or
   wrapper-script change, trace every declared path, entry point, and
   dependency through to the artifact that actually ships. Ask whether that
   file exists at that path in the built output. A declared entry point absent
   from the built artifact fails on first start, which is the P0 case under
   Severity below however small the diff.

## The generic Leave-alone rules

Verification duties rather than subjects: what to establish before writing a
finding, so a wrong finding is caught before it reaches the report. Each duty
carries its own verification step, because "intentional" without evidence is not
a reason.

These three withhold a finding only while the evidence they name is in hand.
None of them puts a subject out of bounds, and a duty that cannot be discharged
leaves the finding standing.

1. **An absence claim**: reading the changed file in full is the floor here,
   not the proof. Before writing that an import, symbol, path, or branch is
   missing, search the tree for it, because the name may sit above the excerpt,
   in a sibling module, in generated output, or in a companion change that
   landed separately. Verify by quoting the line that would have to exist and
   does not, or by naming the search that found nothing and where it looked. An
   unscoped search proves nothing.
2. **A wait that got shorter**: a reduced or deleted sleep, timeout, or retry
   delay is unsafe only while nothing else orders the work. Verify by finding
   the explicit readiness signal that now orders it, a condition wait, a
   handshake, a health check, or an awaited event, and by finding the test that
   exercises that signal. With both, the shortened wait is the fix rather than
   the risk. With either missing, write the finding and name which one is
   missing.
3. **A guard that looks too strict**: verify by reading the public contract the
   guard enforces, the documented path a developer takes to work inside it such
   as a flag, a fixture, or a documented override, and the tests that assert
   the rejection. All three present means the strictness is deliberate, so
   loosening it changes a contract: raise that as a question rather than a
   finding. With any of the three missing, the strictness may be accidental and
   the finding stands.

## Severity

- **P0**: merged as written, it breaks production.
- **P1**: a real defect, or a violation of a Flag rule that names no severity
  of its own.
- **P2**: an improvement that never blocks.

A Flag rule that names its own severity wins; these three are the fallback for
a finding no rule assigned.

## The score table

The score is arithmetic over the findings. Produce findings with severities,
count them, and read the first row that matches. Nothing here asks whether the
work feels like a four.

| Counts | Score |
| --- | --- |
| More than one P0 | 1 |
| Any P0 | 2 |
| Three or more P1 | 3 |
| One or two P1 | 4 |
| Otherwise | 5 |

Rows are tried top to bottom and the first match ends the search: one P0 with
six P1 scores 2, because "any P0" matches before "three or more P1". P2 findings
never move the number, so 5/5 means exactly one thing, no P0 and no P1 in what
was reviewed.

An empty scope is not a clean one. When the scope resolves to no changed file at
all, say so in the report's Scope part and give no score, because a number over
zero findings reads as a pass on work nobody looked at.

The number counts findings, so how findings are split decides it. One finding
per smallest fix, and this rule governs every other rule in this file that
speaks of findings: two consequences that one edit removes are one finding, and
two consequences needing two edits are two, whatever rule each fired. One
sentinel value read by three callers is one finding when changing the return
fixes it, and three when each caller needs its own guard. Report the
consequences of a merged finding in its own text rather than dropping them.
Without this the arithmetic above rests on a judgement about splitting, which is
the judgement the table exists to remove.

When the root rules file carries its own score table, that table replaces this
one. Name the table that produced the number.

## The report

Report in the final response, in this order:

1. **Scope**: what was reviewed, the exact commit, and any file left unread.
2. **Rules**: which rules files applied, or that the baseline ran alone.
3. **Findings**, worst first: severity, `path:line`, what goes wrong, and the
   smallest fix. Say plainly when there are none.
4. **Score**: the number, the P0, P1, and P2 counts, and the row that produced
   it.
5. **Rules delta**: Flag or Leave-alone rows worth adding to this repository's
   `CODE_REVIEW_RULES.md`, written as rows the reader can paste. Propose a row
   only where this review found the evidence for it.

Read, report, stop. Delivery belongs to whoever ran the skill: this run writes
no file, posts no comment, appends no board event, and commits nothing, on a
clean diff as much as on a bad one. Inside an active QStack execution loop the
durable record stays that plan's `execution.md`, so add no second audit file.
